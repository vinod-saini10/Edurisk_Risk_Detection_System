"""
admin.py — FINAL (JWT + Admin Secure + Export Fixed)
"""

from flask import Blueprint, jsonify, Response
from flask_jwt_extended import jwt_required, get_jwt_identity
from mysql.connector import Error
from database.db_config import get_connection
from utils.security import admin_required
import csv
import io
import json
import numpy as np
from model.train_model import META_PATH
import os

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


# ───────────────── USERS ─────────────────
@admin_bp.route("/users", methods=["GET"])
@admin_required()
def list_users():
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT id, name, email, role, created_at
            FROM users
            ORDER BY created_at DESC
        """)

        rows = cursor.fetchall()
        cols = [d[0] for d in cursor.description]

        cursor.close()
        conn.close()

        users = [dict(zip(cols, r)) for r in rows]

        for u in users:
            u["created_at"] = str(u["created_at"])

        return jsonify(users), 200

    except Error as e:
        return jsonify({"error": str(e)}), 500


@admin_bp.route("/analytics", methods=["GET"])
@admin_required()
def analytics():
    """Return aggregated metrics suitable for BI tools / Power BI (admin-only)."""
    try:
        data = compute_analytics()
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def compute_analytics():
    """Compute analytics payload from DB and return a dict.

    This function is intentionally importable so a public, rate-limited
    endpoint (for BI ingestion) can call the same logic without auth.
    """
    conn = get_connection()
    cursor = conn.cursor()

    # total_students -> distinct student_id in predictions
    cursor.execute("SELECT COUNT(DISTINCT student_id) FROM predictions")
    row = cursor.fetchone()
    total_students = int(row[0]) if row and row[0] is not None else 0

    # avg_score -> average predicted_score
    cursor.execute("SELECT AVG(predicted_score) FROM predictions")
    row = cursor.fetchone()
    avg_score = float(row[0]) if row and row[0] is not None else 0.0

    # risk distribution
    cursor.execute("SELECT risk_level, COUNT(*) FROM predictions GROUP BY risk_level")
    dist_rows = cursor.fetchall()
    risk_distribution = {"high": 0, "medium": 0, "low": 0}
    for rl, cnt in dist_rows:
        if not rl:
            continue
        key = rl.strip().lower()
        if key.startswith("high"):
            risk_distribution["high"] = int(cnt)
        elif key.startswith("medium"):
            risk_distribution["medium"] = int(cnt)
        elif key.startswith("low"):
            risk_distribution["low"] = int(cnt)

    # trend over time (daily average)
    cursor.execute("SELECT DATE(created_at) as dt, AVG(predicted_score) FROM predictions GROUP BY DATE(created_at) ORDER BY DATE(created_at) ASC")
    trend = []
    for dt, avg in cursor.fetchall():
        if dt is None:
            continue
        trend.append({"date": str(dt), "avg_score": float(avg) if avg is not None else 0.0})

    cursor.close()
    conn.close()

    return {
        "total_students": total_students,
        "avg_score": round(avg_score, 2),
        "risk_distribution": risk_distribution,
        "trend_over_time": trend,
    }


@admin_bp.route("/insights", methods=["GET"])
@admin_required()
def insights():
    """Generate AI-driven human-readable insights from prediction data."""
    try:
        conn = get_connection()
        cursor = conn.cursor()

        # Basic aggregates
        cursor.execute("SELECT COUNT(*), AVG(predicted_score) FROM predictions")
        tot_row = cursor.fetchone()
        total_preds = int(tot_row[0] or 0)
        global_avg = float(tot_row[1]) if tot_row[1] is not None else None

        # Attendance averages by risk
        cursor.execute("SELECT risk_level, AVG(attendance) FROM predictions GROUP BY risk_level")
        att_by_risk = {r[0]: float(r[1]) for r in cursor.fetchall() if r[1] is not None}

        # Study hours vs predicted score (linear fit)
        cursor.execute("SELECT study_hours, predicted_score FROM predictions WHERE study_hours IS NOT NULL AND predicted_score IS NOT NULL")
        rows = cursor.fetchall()
        studies = [float(r[0]) for r in rows if r[0] is not None]
        scores = [float(r[1]) for r in rows if r[1] is not None]

        insights_list = []

        # Insight: attendance correlation with high risk
        try:
            avg_att_high = att_by_risk.get('High Risk')
            avg_att_others = None
            others = [v for k, v in att_by_risk.items() if k != 'High Risk']
            if others:
                avg_att_others = sum(others) / len(others)

            if avg_att_high is not None and avg_att_others is not None and (avg_att_others - avg_att_high) >= 5:
                insights_list.append(f"Students with lower attendance (avg {avg_att_high:.1f}%) are more likely to be high risk compared to others (avg {avg_att_others:.1f}%).")
            elif avg_att_high is not None and avg_att_others is not None:
                insights_list.append(f"Average attendance for high-risk students is {avg_att_high:.1f}%; overall average across other risk groups is {avg_att_others:.1f}%.")
        except Exception:
            pass

        # Insight: study hours relationship with score
        try:
            if len(studies) >= 10:
                coef = np.polyfit(studies, scores, 1)
                slope = float(coef[0])
                # percent change per hour relative to mean score
                mean_score = np.mean(scores) if len(scores) else 0
                pct_per_hour = (slope / mean_score * 100) if mean_score else 0
                insights_list.append(f"On average, each additional study hour is associated with ~{slope:.2f} points change in predicted score ({pct_per_hour:.1f}% of mean score).")
            else:
                insights_list.append("Not enough study-hours data to compute robust trend.")
        except Exception:
            pass

        # Frequent low performers
        cursor.execute("""
            SELECT s.id, s.name, s.email, AVG(p.predicted_score) as avg_score, COUNT(*) as cnt
            FROM predictions p JOIN students s ON s.id = p.student_id
            GROUP BY s.id
            HAVING avg_score < 50
            ORDER BY avg_score ASC
            LIMIT 8
        """)
        low_perf = cursor.fetchall()
        if low_perf:
            insights_list.append(f"There are {len(low_perf)} students with an average predicted score below 50; they may need targeted support.")

        # Fallback basic insight
        if not insights_list:
            insights_list.append("No strong patterns detected — data looks balanced.")

        cursor.close(); conn.close()
        return jsonify({"insights": insights_list}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@admin_bp.route("/model-metrics", methods=["GET"])
@admin_required()
def model_metrics():
    """Return stored model metrics computed during training (rf/xgb)."""
    try:
        if not META_PATH or not os.path.exists(META_PATH):
            return jsonify({"error": "Model metadata not available"}), 404

        with open(META_PATH) as f:
            meta = json.load(f)

        rf = meta.get("rf_metrics")
        xgb = meta.get("xgb_metrics")
        return jsonify({"rf": rf, "xgb": xgb}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ───────────────── DELETE USER ─────────────────
@admin_bp.route("/user/<int:user_id>", methods=["DELETE"])
@admin_required()
def delete_user(user_id):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("DELETE FROM users WHERE id=%s", (user_id,))
        conn.commit()

        if cursor.rowcount == 0:
            cursor.close()
            conn.close()
            return jsonify({"error": "User not found"}), 404

        cursor.close()
        conn.close()

        return jsonify({"message": f"User {user_id} deleted successfully"}), 200

    except Error as e:
        return jsonify({"error": str(e)}), 500


# ───────────────── ALL PREDICTIONS ─────────────────
@admin_bp.route("/predictions", methods=["GET"])
@admin_required()
def all_predictions():
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT p.id, p.user_id, p.student_id,
                   s.name, s.email,
                   p.predicted_score, p.risk_level,
                   p.confidence, p.created_at,
                   u.name AS uploader_name
            FROM predictions p
            JOIN students s ON s.id = p.student_id
            LEFT JOIN users u ON u.id = p.user_id
            ORDER BY p.created_at DESC
        """)

        rows = cursor.fetchall()
        cols = [d[0] for d in cursor.description]

        cursor.close()
        conn.close()

        data = []
        for r in rows:
            d = dict(zip(cols, r))
            d["created_at"] = str(d["created_at"])
            data.append(d)

        return jsonify(data), 200

    except Error as e:
        return jsonify({"error": str(e)}), 500


# ───────────────── CHART DATA ─────────────────
@admin_bp.route("/charts", methods=["GET"])
@admin_required()   # 🔥 JWT + Role check handled here
def admin_charts():
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT risk_level, COUNT(*)
            FROM predictions
            GROUP BY risk_level
        """)
        risk_dist = {r[0]: r[1] for r in cursor.fetchall()}

        cursor.execute("""
            SELECT risk_level, AVG(predicted_score)
            FROM predictions
            GROUP BY risk_level
        """)
        avg_score = {
            r[0]: round(float(r[1]), 1)
            for r in cursor.fetchall() if r[1] is not None
        }

        cursor.close()
        conn.close()

        return jsonify({
            "risk_distribution": risk_dist,
            "avg_score_by_risk": avg_score
        }), 200

    except Error as e:
        return jsonify({"error": str(e)}), 500


# ───────────────── EXPORT CSV ─────────────────
@admin_bp.route("/export", methods=["GET"])
@admin_required()
def export_csv():
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT u.name, u.email,
                   p.predicted_score, p.risk_level,
                   p.confidence, p.created_at
            FROM users u
            LEFT JOIN predictions p ON u.id = p.user_id
            ORDER BY p.created_at DESC
        """)

        rows = cursor.fetchall()

        output = io.StringIO()
        writer = csv.writer(output)

        # Header
        writer.writerow([
            "Name", "Email",
            "Score", "Risk",
            "Confidence", "Date"
        ])

        for row in rows:
            writer.writerow(row)

        cursor.close()
        conn.close()

        return Response(
            output.getvalue(),
            mimetype="text/csv",
            headers={
                "Content-Disposition": "attachment; filename=edurisk_data.csv"
            }
        )

    except Error as e:
        return jsonify({"error": str(e)}), 500