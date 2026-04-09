"""
train_model.py — Dual-model training pipeline

Trains RandomForest and XGBoost regressors on a provided CSV dataset
(backend/data/final_student_data_2000.csv). Saves both models, scaler,
and metadata under backend/models/. Exposes `load_model()` which returns
both models, scaler, and meta.
"""

import os
import json
import numpy as np
import pandas as pd
import joblib

from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(BASE_DIR)
CSV_PATH = os.path.join(BACKEND_DIR, "data", "final_student_data_2000.csv")
MODELS_DIR = os.path.join(BACKEND_DIR, "models")
RF_PATH = os.path.join(MODELS_DIR, "rf_model.pkl")
XGB_PATH = os.path.join(MODELS_DIR, "xgb_model.pkl")
SCALER_PATH = os.path.join(MODELS_DIR, "scaler.pkl")
META_PATH = os.path.join(MODELS_DIR, "model_meta.json")

# Canonical feature names used by the pipeline
FEATURES = ["attendance", "study_hours", "prev_marks", "assignment", "internal"]


def generate_dataset(n: int = 2500) -> pd.DataFrame:
    np.random.seed(42)
    att = np.random.uniform(40, 100, n)
    sh = np.random.uniform(1, 10, n)
    pm = np.random.uniform(35, 95, n)
    asn = np.random.uniform(40, 100, n)
    im = np.random.uniform(30, 100, n)
    noise = np.random.normal(0, 4, n)

    final = np.clip(0.3 * att + 2.0 * sh + 0.3 * pm + 0.2 * asn + 0.2 * im + noise, 0, 100)

    df = pd.DataFrame({
        "attendance": np.round(att, 2),
        "study_hours": np.round(sh, 2),
        "prev_marks": np.round(pm, 2),
        "assignment": np.round(asn, 2),
        "internal": np.round(im, 2),
        "predicted_score": np.round(final, 2),
    })

    os.makedirs(os.path.dirname(CSV_PATH), exist_ok=True)
    df.to_csv(CSV_PATH, index=False)
    print(f"[ML] Synthetic dataset generated → {CSV_PATH}")
    return df


def classify_risk(score: float) -> str:
    if score >= 75:
        return "Low Risk"
    elif score >= 50:
        return "Medium Risk"
    return "High Risk"


def _compute_shap_importance(xgb_model, X_sc):
    try:
        import shap
        explainer = shap.Explainer(xgb_model, X_sc[:100])
        shap_vals = explainer(X_sc[:100])
        importance = np.abs(shap_vals.values).mean(axis=0).tolist()
        return dict(zip(FEATURES, [round(v, 4) for v in importance]))
    except Exception:
        pass

    # Fallback: use feature_importances_ if available
    try:
        imp = xgb_model.feature_importances_
        return dict(zip(FEATURES, [round(float(v), 4) for v in imp]))
    except Exception:
        return {f: 0.0 for f in FEATURES}


def train():
    os.makedirs(MODELS_DIR, exist_ok=True)

    # Load dataset
    if not os.path.exists(CSV_PATH):
        print("[ML] Dataset not found — generating synthetic dataset")
        df = generate_dataset()
    else:
        df = pd.read_csv(CSV_PATH)
        print(f"[ML] Dataset loaded: {len(df)} rows from {CSV_PATH}")

    # Normalize column names to canonical features if needed
    rename_map = {}
    if "previous_marks" in df.columns and "prev_marks" not in df.columns:
        rename_map["previous_marks"] = "prev_marks"
    if "assignment_score" in df.columns and "assignment" not in df.columns:
        rename_map["assignment_score"] = "assignment"
    if "internal_marks" in df.columns and "internal" not in df.columns:
        rename_map["internal_marks"] = "internal"
    if "final_score" in df.columns and "predicted_score" not in df.columns:
        rename_map["final_score"] = "predicted_score"
    if rename_map:
        df = df.rename(columns=rename_map)

    # Validate presence of features and target
    missing = [f for f in FEATURES if f not in df.columns]
    if missing:
        raise RuntimeError(f"Missing required columns in CSV: {missing}")
    if "predicted_score" not in df.columns:
        raise RuntimeError("Target column 'predicted_score' not found in dataset")

    df.fillna(df.median(numeric_only=True), inplace=True)

    X = df[FEATURES].values
    y = df["predicted_score"].values

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    scaler = StandardScaler()
    X_tr = scaler.fit_transform(X_train)
    X_te = scaler.transform(X_test)

    # Train Random Forest
    rf = RandomForestRegressor(n_estimators=200, random_state=42, n_jobs=-1)
    rf.fit(X_tr, y_train)
    rf_preds = rf.predict(X_te)
    rf_rmse = float(np.sqrt(mean_squared_error(y_test, rf_preds)))
    rf_mae = float(mean_absolute_error(y_test, rf_preds))
    rf_r2 = float(r2_score(y_test, rf_preds))
    print(f"[ML] RandomForest RMSE={rf_rmse:.3f} MAE={rf_mae:.3f} R2={rf_r2:.4f}")

    # Train XGBoost
    xgb = None
    xgb_rmse = xgb_mae = xgb_r2 = None
    try:
        from xgboost import XGBRegressor
        xgb = XGBRegressor(n_estimators=300, max_depth=6, learning_rate=0.05, subsample=0.8, colsample_bytree=0.8, random_state=42, verbosity=0, eval_metric="rmse")
        xgb.fit(X_tr, y_train)
        xgb_preds = xgb.predict(X_te)
        xgb_rmse = float(np.sqrt(mean_squared_error(y_test, xgb_preds)))
        xgb_mae = float(mean_absolute_error(y_test, xgb_preds))
        xgb_r2 = float(r2_score(y_test, xgb_preds))
        print(f"[ML] XGBoost      RMSE={xgb_rmse:.3f} MAE={xgb_mae:.3f} R2={xgb_r2:.4f}")
    except Exception as e:
        print(f"[ML] XGBoost training failed or not available: {e}")

    # Compute SHAP importance using XGBoost if available, else RF
    feat_imp = _compute_shap_importance(xgb if xgb is not None else rf, X_tr)
    print(f"[ML] Feature importance: {feat_imp}")

    # Persist artifacts
    joblib.dump(rf, RF_PATH)
    if xgb is not None:
        joblib.dump(xgb, XGB_PATH)
    joblib.dump(scaler, SCALER_PATH)

    meta = {
        "features": FEATURES,
        "rf_metrics": {"rmse": round(rf_rmse, 4), "mae": round(rf_mae, 4), "r2": round(rf_r2, 4)},
        "xgb_metrics": {"rmse": round(xgb_rmse, 4), "mae": round(xgb_mae, 4), "r2": round(xgb_r2, 4)} if xgb is not None else None,
        "feature_importance": feat_imp,
    }

    with open(META_PATH, "w") as f:
        json.dump(meta, f, indent=2)

    print(f"[ML] Saved models → {RF_PATH}, {XGB_PATH if xgb is not None else '(no xgb)'}")
    return rf, xgb, scaler, meta


def load_model():
    need_train = not (os.path.exists(RF_PATH) and os.path.exists(SCALER_PATH) and os.path.exists(META_PATH))
    if need_train:
        print("[ML] Artifacts missing — training now …")
        return train()

    rf = joblib.load(RF_PATH)
    xgb = None
    if os.path.exists(XGB_PATH):
        try:
            xgb = joblib.load(XGB_PATH)
        except Exception:
            xgb = None

    scaler = joblib.load(SCALER_PATH)
    with open(META_PATH) as f:
        meta = json.load(f)

    print(f"[ML] Loaded models. RF R²={meta.get('rf_metrics',{}).get('r2','?')}, XGB present={xgb is not None}")
    return rf, xgb, scaler, meta


if __name__ == "__main__":
    train()
