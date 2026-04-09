"""
shap_explainer.py
Utilities to generate SHAP explanations for a given model + input.
"""
import numpy as np


def explain_instance(model, scaler, X_raw, feature_names, top_n=3):
    """Return top_n feature names by absolute SHAP value and raw shap values.

    - model: trained model (XGBoost or tree-based)
    - scaler: fitted StandardScaler used during training
    - X_raw: 1D array-like of raw feature values in canonical order
    - feature_names: list of feature names matching X_raw order
    """
    try:
        import shap

        X_arr = np.atleast_2d(X_raw)
        # Use the same scaling as training
        if scaler is not None:
            X_in = scaler.transform(X_arr)
        else:
            X_in = X_arr

        explainer = shap.Explainer(model)
        sv = explainer(X_in)
        values = np.array(sv.values).flatten()
        abs_vals = np.abs(values)
        idx = np.argsort(abs_vals)[::-1][:top_n]
        top_reasons = [feature_names[i] for i in idx]

        return {
            "top_reasons": top_reasons,
            "shap_values": values.tolist()
        }

    except Exception as e:
        return {"top_reasons": [], "error": str(e)}
