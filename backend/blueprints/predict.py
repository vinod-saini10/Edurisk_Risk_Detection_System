"""
predict.py — Prediction & Classification Blueprint
Includes full Explainable AI (XAI) response payload.
"""

import os, io
import pandas as pd
import numpy as np
from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import (
    get_jwt_identity, verify_jwt_in_request, jwt_required
)
from mysql.connector import Error

from database.db_config import get_connection, get_or_create_student
from model.train_model import classify_risk
from model.shap_explainer import explain_instance
from utils.security import sanitize_string
from utils.insights_engine import (
    get_risk_severity,
    generate_explanation,
    generate_impact_analysis,
    generate_recommendations,
    simulate_whatif,
)

predict_bp = Blueprint("predict", __name__, url_prefix="/api/predict")

# Models injected via bootstrap
_rf_model  = None
_xgb_model = None
_scaler    = None
_meta      = None


def init_model(rf_model, xgb_model, scaler, meta):
    global _rf_model, _xgb_model, _scaler, _meta
    _rf_model, _xgb_model, _scaler, _meta = rf_model, xgb_model, scaler, meta

def _optional_user_id():
    try:
        verify_jwt_in_request(optional=True)
        identity = get_jwt_identity()
        return identity["id"] if identity else None
    except:
        return None

def _compute_confidence(rf_pred, xgb_pred=None):
    try:
        if xgb_pred is None:
            return None
        # confidence based on agreement between models (0..1)
        diff = abs(float(rf_pred) - float(xgb_pred))
        conf = max(0.0, 1.0 - (diff / 100.0))
        return round(conf, 3)
    except Exception:
        return None

@predict_bp.route("", methods=["POST", "OPTIONS"])
@jwt_required()
def predict():
    # Handle CORS preflight
    if request.method == "OPTIONS":
        return ('', 200)
    try:
        identity = get_jwt_identity()
        user_id = identity.get("id") if isinstance(identity, dict) else identity
        
        data = request.get_json(force=True) or {}
        # Accept both old and new field names for compatibility
        required = ["name", "email", "attendance", "study_hours"]
        for f in required:
            if f not in data or str(data[f]).strip() == "":
                return jsonify({"error": f"Missing field: {f}"}), 400

        # Map fields (support previous naming and new canonical names)
        name = sanitize_string(data["name"])
        email = sanitize_string(data["email"])
        att = float(data.get("attendance"))
        sh = float(data.get("study_hours"))
        pm = float(data.get("prev_marks", data.get("previous_marks", data.get("previous", 0))))
        asn = float(data.get("assignment", data.get("assignment_score", 0)))
        im = float(data.get("internal", data.get("internal_marks", 0)))

        # Range validation — full 0–100 academic spectrum
        if not (0 <= att <= 100): return jsonify({"error": "Attendance must be 0–100"}), 400
        if not (0 <= sh  <= 10):  return jsonify({"error": "Study hours must be 0–10"}), 400
        if not (0 <= pm  <= 100): return jsonify({"error": "Previous marks must be 0–100"}), 400
        if not (0 <= asn <= 100): return jsonify({"error": "Assignment score must be 0–100"}), 400
        if not (0 <= im  <= 100): return jsonify({"error": "Internal marks must be 0–100"}), 400

        # Build feature vector using meta feature ordering
        feat_names = _meta.get("features", ["attendance", "study_hours", "prev_marks", "assignment", "internal"])
        fmap = {
            "attendance": att,
            "study_hours": sh,
            "prev_marks": pm,
            "previous_marks": pm,
            "assignment": asn,
            "assignment_score": asn,
            "internal": im,
            "internal_marks": im,
        }
        X = np.array([[fmap.get(fn, 0) for fn in feat_names]])
        X_sc = _scaler.transform(X)

        # Model predictions
        rf_pred = float(_rf_model.predict(X_sc)[0])
        xgb_pred = None
        if _xgb_model is not None:
            try:
                xgb_pred = float(_xgb_model.predict(X_sc)[0])
            except Exception:
                xgb_pred = None

        if xgb_pred is not None:
            score = round(float(np.clip((rf_pred + xgb_pred) / 2.0, 0, 100)), 2)
        else:
            score = round(float(np.clip(rf_pred, 0, 100)), 2)

        risk = classify_risk(score)
        conf = _compute_confidence(rf_pred, xgb_pred)

        # ── XAI Insights ──────────────────────────────────────────────────
        risk_severity    = get_risk_severity(risk)
        narrative        = generate_explanation(att, sh, pm, asn, im, score)
        impact_analysis  = generate_impact_analysis(att, sh, pm, asn, im)
        recommendations  = generate_recommendations(att, sh, pm, asn, im, score)
        what_if          = simulate_whatif(
            att, sh, pm, asn, im,
            _rf_model, _xgb_model, _scaler, feat_names,
            classify_risk
        )

        # ── SHAP explanation (optional, kept for feature-importance chart) ─
        explainer_model = _xgb_model if _xgb_model is not None else _rf_model
        shap_data = explain_instance(explainer_model, _scaler, X.flatten(), feat_names, top_n=5)

        # ── Persist to DB ──────────────────────────────────────────────────
        conn   = get_connection()
        cursor = conn.cursor()
        sid    = get_or_create_student(cursor, name, email)
        cursor.execute(
            "INSERT INTO academic_records "
            "(student_id,attendance,study_hours,previous_marks,assignment_score,internal_marks) "
            "VALUES (%s,%s,%s,%s,%s,%s)",
            (sid, att, sh, pm, asn, im)
        )
        cursor.execute(
            "INSERT INTO predictions (student_id,user_id,attendance,study_hours,previous_marks,"
            "assignment_score,internal_marks,predicted_score,risk_level,confidence) "
            "VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)",
            (sid, user_id, att, sh, pm, asn, im, score, risk, conf)
        )
        conn.commit()
        cursor.close(); conn.close()

        response_payload = {
            # ── Core ──
            "name":              name,
            "email":             email,
            "attendance":        att,
            "study_hours":       sh,
            "previous_marks":    pm,
            "assignment_score":  asn,
            "internal_marks":    im,
            "predicted_score":   score,
            "risk_level":        risk,
            "risk_severity":     risk_severity,
            "confidence":        conf,
            # ── XAI ──
            "explanation": {
                "narrative":        narrative,
                "impact_analysis":  impact_analysis,
                "recommendations":  recommendations,
                "what_if":          what_if,
            },
            # ── SHAP chart data ──
            "feature_importance": _meta.get("feature_importance", {}),
            "shap_detail":        shap_data,
        }

        return jsonify(response_payload), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@predict_bp.route("/bulk", methods=["POST"])
@jwt_required()
def bulk_predict():
    """Step 7: CSV Upload for Bulk Prediction."""
    identity = get_jwt_identity()
    user_id = identity.get("id") if isinstance(identity, dict) else identity
    
    # Handle CORS preflight for bulk upload
    if request.method == "OPTIONS":
        return ('', 200)

    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if not file.filename.endswith('.csv'):
        return jsonify({"error": "Only CSV files are allowed"}), 400

    try:
        # Load CSV into pandas
        df = pd.read_csv(file)
        
        # Required columns check (support both old and new names)
        # Accept either prev_marks or previous_marks, assignment or assignment_score, internal or internal_marks
        col_map = {
            "prev": "prev_marks" if "prev_marks" in df.columns else ("previous_marks" if "previous_marks" in df.columns else None),
            "assignment": "assignment" if "assignment" in df.columns else ("assignment_score" if "assignment_score" in df.columns else None),
            "internal": "internal" if "internal" in df.columns else ("internal_marks" if "internal_marks" in df.columns else None),
        }
        req = ["attendance", "study_hours", col_map["prev"], col_map["assignment"], col_map["internal"]]
        missing = [c for c in req if not c or c not in df.columns]
        if missing:
            return jsonify({"error": f"Missing columns in CSV: {', '.join([str(m) for m in missing])}"}), 400

        # Preprocessing & Prediction
        # Align dataframe columns to model feature order
        feat_names = _meta.get("features", ["attendance", "study_hours", "prev_marks", "assignment", "internal"])        
        def row_to_feat_array(row):
            fmap = {
                "attendance": float(row.get("attendance")),
                "study_hours": float(row.get("study_hours")),
                "prev_marks": float(row.get(col_map["prev"])),
                "previous_marks": float(row.get(col_map["prev"])),
                "assignment": float(row.get(col_map["assignment"])),
                "assignment_score": float(row.get(col_map["assignment"])),
                "internal": float(row.get(col_map["internal"])),
                "internal_marks": float(row.get(col_map["internal"])),
            }
            return [fmap.get(fn, 0) for fn in feat_names]

        X = df.apply(lambda r: row_to_feat_array(r), axis=1).tolist()
        X = np.array(X)
        X_sc = _scaler.transform(X)
        rf_scores = _rf_model.predict(X_sc)
        xgb_scores = _xgb_model.predict(X_sc) if _xgb_model is not None else None
        if xgb_scores is not None:
            scores = np.clip((rf_scores + xgb_scores) / 2.0, 0, 100)
        else:
            scores = np.clip(rf_scores, 0, 100)
        
        results = []
        conn = get_connection()
        cursor = conn.cursor()

        for i, row in df.iterrows():
            score = round(float(scores[i]), 2)
            # per-row model agreement
            conf = _compute_confidence(float(rf_scores[i]), float(xgb_scores[i]) if xgb_scores is not None else None)
            risk = classify_risk(score)
            
            # Simple metadata if name/email not in CSV
            row_name = sanitize_string(str(row.get('name', f"Bulk Row {i+1}")))
            row_email = sanitize_string(str(row.get('email', "bulk@edurisk.app")))
            
            sid = get_or_create_student(cursor, row_name, row_email)
            
            # Store in DB
            cursor.execute(
                "INSERT INTO academic_records "
                "(student_id,attendance,study_hours,previous_marks,assignment_score,internal_marks) "
                "VALUES (%s,%s,%s,%s,%s,%s)",
                (sid, float(row['attendance']), float(row['study_hours']), 
                 float(row['previous_marks']), float(row['assignment_score']), float(row['internal_marks']))
            )
            cursor.execute(
                "INSERT INTO predictions (student_id,user_id,attendance,study_hours,previous_marks,assignment_score,internal_marks,predicted_score,risk_level,confidence) "
                "VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)",
                (sid, user_id, float(row['attendance']), float(row['study_hours']), float(row['previous_marks']), float(row['assignment_score']), float(row['internal_marks']), score, risk, conf)
            )
            
            results.append({
                "name": row_name, 
                "email": row_email,
                "score": score, 
                "risk": risk
            })
        
        conn.commit()
        cursor.close(); conn.close()
        
        return jsonify({
            "message": f"Processed {len(results)} records successfully.",
            "predictions": results
        }), 200

    except Exception as e:
        return jsonify({"error": f"CSV processing failed: {str(e)}"}), 500

@predict_bp.route("/info", methods=["GET"])
def info():
    """Model metadata info."""
    clean_info = {k: v for k, v in _meta.items() if k != "feature_importance"}
    return jsonify(clean_info), 200


@predict_bp.route("/explain/<int:pred_id>", methods=["GET"]) 
@jwt_required()
def explain_prediction(pred_id):
    """Return SHAP explanation and recommendations for a stored prediction."""
    try:
        identity = get_jwt_identity()
        user_id = identity.get("id") if isinstance(identity, dict) else identity

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            "SELECT attendance, study_hours, previous_marks, assignment_score, internal_marks, predicted_score "
            "FROM predictions WHERE id=%s AND user_id=%s LIMIT 1",
            (pred_id, user_id)
        )
        row = cursor.fetchone()
        if not row:
            cursor.close(); conn.close()
            return jsonify({"error": "Prediction not found"}), 404

        att, sh, pm, asn, im, score = row

        # Build feature vector using meta feature ordering
        feat_names = _meta.get("features", ["attendance", "study_hours", "prev_marks", "assignment", "internal"])
        fmap = {
            "attendance": att,
            "study_hours": sh,
            "prev_marks": pm,
            "previous_marks": pm,
            "assignment": asn,
            "assignment_score": asn,
            "internal": im,
            "internal_marks": im,
        }
        X = np.array([[fmap.get(fn, 0) for fn in feat_names]])
        X_sc = _scaler.transform(X)

        # ── XAI Insights ──────────────────────────────────────────────────
        risk        = classify_risk(float(score))
        risk_severity   = get_risk_severity(risk)
        narrative       = generate_explanation(att, sh, pm, asn, im, float(score))
        impact_analysis = generate_impact_analysis(att, sh, pm, asn, im)
        recommendations = generate_recommendations(att, sh, pm, asn, im, float(score))
        what_if         = simulate_whatif(
            att, sh, pm, asn, im,
            _rf_model, _xgb_model, _scaler, feat_names,
            classify_risk
        )
        explainer_model = _xgb_model if _xgb_model is not None else _rf_model
        shap_data = explain_instance(explainer_model, _scaler, X.flatten(), feat_names, top_n=5)

        cursor.close(); conn.close()

        return jsonify({
            "prediction_id":  pred_id,
            "predicted_score": float(score),
            "risk_level":      risk,
            "risk_severity":   risk_severity,
            "explanation": {
                "narrative":        narrative,
                "impact_analysis":  impact_analysis,
                "recommendations":  recommendations,
                "what_if":          what_if,
            },
            "shap_detail": shap_data,
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
