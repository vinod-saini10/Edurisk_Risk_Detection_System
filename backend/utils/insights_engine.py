"""
insights_engine.py — Explainable AI (XAI) Insights for EduRisk

Generates human-readable explanations, impact analysis, personalized
recommendations, what-if simulations, and risk severity labels.

All thresholds are derived from the training-data distribution and
the 4-tier risk classification:
  No Risk     → score ≥ 90
  Low Risk    → 75 ≤ score < 90
  Medium Risk → 65 ≤ score < 75
  High Risk   → score < 65
"""

import numpy as np

# ─────────────────────────────────────────────────────────────
# Thresholds for individual feature assessment
# ─────────────────────────────────────────────────────────────
_THRESH = {
    "attendance": {
        "critical": 55,   # below → high impact
        "poor":     70,   # below → medium impact
        "good":     85,   # above → positive
    },
    "study_hours": {
        "critical": 2,    # below → high impact
        "poor":     4,    # below → medium impact
        "good":     6,    # above → positive
    },
    "prev_marks": {
        "critical": 45,   # below → high impact
        "poor":     60,   # below → medium impact
        "good":     75,   # above → positive
    },
    "assignment": {
        "critical": 50,
        "poor":     65,
        "good":     80,
    },
    "internal": {
        "critical": 50,
        "poor":     65,
        "good":     80,
    },
}

_LABELS = {
    "attendance":   "Attendance",
    "study_hours":  "Study Hours",
    "prev_marks":   "Previous Marks",
    "assignment":   "Assignment Score",
    "internal":     "Internal Marks",
}

_UNITS = {
    "attendance":   "%",
    "study_hours":  "h/day",
    "prev_marks":   "/100",
    "assignment":   "/100",
    "internal":     "/100",
}

_SCORE_GAIN_EST = {
    # Estimated score gain per unit improvement (rough linear approximation)
    "attendance":  0.30,  # per % point
    "study_hours": 2.00,  # per hour
    "prev_marks":  0.30,
    "assignment":  0.20,
    "internal":    0.20,
}


# ─────────────────────────────────────────────────────────────
# 1. Risk Severity Label
# ─────────────────────────────────────────────────────────────
def get_risk_severity(risk_level: str) -> str:
    """Map risk label to a human severity descriptor."""
    mapping = {
        "High Risk":   "Critical",
        "Medium Risk": "Moderate",
        "Low Risk":    "Stable",
        "No Risk":     "Safe",
    }
    return mapping.get(risk_level, "Unknown")


# ─────────────────────────────────────────────────────────────
# 2. Human-Readable Explanation Narrative
# ─────────────────────────────────────────────────────────────
def generate_explanation(att: float, sh: float, pm: float,
                         asn: float, im: float, score: float) -> list:
    """Return a list of human-readable bullet strings explaining the score."""
    vals = {"attendance": att, "study_hours": sh, "prev_marks": pm,
            "assignment": asn, "internal": im}
    bullets = []

    for key, val in vals.items():
        t = _THRESH[key]
        label = _LABELS[key]
        unit = _UNITS[key]

        if val < t["critical"]:
            bullets.append({
                "text": f"{label} is critically low ({val}{unit}) → major negative impact",
                "impact": "high",
                "icon": "🔴",
            })
        elif val < t["poor"]:
            bullets.append({
                "text": f"{label} is below average ({val}{unit}) → moderate negative impact",
                "impact": "medium",
                "icon": "🟠",
            })
        elif val >= t["good"]:
            bullets.append({
                "text": f"{label} is strong ({val}{unit}) → positive contribution",
                "impact": "positive",
                "icon": "🟢",
            })
        else:
            bullets.append({
                "text": f"{label} is average ({val}{unit}) → minor impact",
                "impact": "low",
                "icon": "🟡",
            })

    # Sort: high → medium → low → positive
    order = {"high": 0, "medium": 1, "low": 2, "positive": 3}
    bullets.sort(key=lambda b: order.get(b["impact"], 9))
    return bullets


# ─────────────────────────────────────────────────────────────
# 3. Impact Analysis (ranked)
# ─────────────────────────────────────────────────────────────
def generate_impact_analysis(att: float, sh: float, pm: float,
                              asn: float, im: float) -> list:
    """Return features ranked by their impact severity."""
    vals = {"attendance": att, "study_hours": sh, "prev_marks": pm,
            "assignment": asn, "internal": im}
    items = []
    for key, val in vals.items():
        t = _THRESH[key]
        label = _LABELS[key]
        unit = _UNITS[key]

        if val < t["critical"]:
            impact_level, icon, badge = "high",     "🔴", "Critical Factor"
        elif val < t["poor"]:
            impact_level, icon, badge = "medium",   "🟠", "Needs Improvement"
        elif val >= t["good"]:
            impact_level, icon, badge = "positive", "🟢", "Good"
        else:
            impact_level, icon, badge = "low",      "🟡", "Average"

        items.append({
            "feature":       key,
            "label":         label,
            "value":         f"{val}{unit}",
            "impact_level":  impact_level,
            "icon":          icon,
            "badge":         badge,
        })

    order = {"high": 0, "medium": 1, "low": 2, "positive": 3}
    items.sort(key=lambda x: order.get(x["impact_level"], 9))
    return items


# ─────────────────────────────────────────────────────────────
# 4. Personalized Recommendations
# ─────────────────────────────────────────────────────────────
def generate_recommendations(att: float, sh: float, pm: float,
                              asn: float, im: float, score: float) -> list:
    """Return actionable, quantified recommendation strings."""
    recs = []

    # Previous marks (highest model weight)
    if pm < _THRESH["prev_marks"]["critical"]:
        target = min(pm + 20, 100)
        gain = round((target - pm) * _SCORE_GAIN_EST["prev_marks"], 1)
        recs.append(f"Revise core subjects to raise Previous Marks from {pm:.0f} → {target:.0f} (est. +{gain} score)")
    elif pm < _THRESH["prev_marks"]["poor"]:
        target = min(pm + 12, 100)
        gain = round((target - pm) * _SCORE_GAIN_EST["prev_marks"], 1)
        recs.append(f"Strengthen weak topics to raise Previous Marks from {pm:.0f} → {target:.0f} (est. +{gain} score)")

    # Study hours (highest coefficient in model)
    if sh < _THRESH["study_hours"]["critical"]:
        target = min(sh + 3, 10)
        gain = round((target - sh) * _SCORE_GAIN_EST["study_hours"], 1)
        recs.append(f"Increase study hours from {sh:.1f}h → {target:.1f}h/day (est. +{gain} score)")
    elif sh < _THRESH["study_hours"]["poor"]:
        target = min(sh + 2, 10)
        gain = round((target - sh) * _SCORE_GAIN_EST["study_hours"], 1)
        recs.append(f"Study more consistently — aim for {target:.1f}h/day instead of {sh:.1f}h (est. +{gain} score)")

    # Attendance
    if att < _THRESH["attendance"]["critical"]:
        target = min(att + 25, 100)
        gain = round((target - att) * _SCORE_GAIN_EST["attendance"], 1)
        recs.append(f"Urgently improve attendance from {att:.0f}% → {target:.0f}% (est. +{gain} score)")
    elif att < _THRESH["attendance"]["poor"]:
        target = min(att + 15, 100)
        gain = round((target - att) * _SCORE_GAIN_EST["attendance"], 1)
        recs.append(f"Improve attendance from {att:.0f}% → {target:.0f}% (est. +{gain} score)")

    # Assignment score
    if asn < _THRESH["assignment"]["poor"]:
        target = min(asn + 15, 100)
        gain = round((target - asn) * _SCORE_GAIN_EST["assignment"], 1)
        recs.append(f"Submit all assignments — target {target:.0f}/100 (est. +{gain} score)")

    # Internal marks
    if im < _THRESH["internal"]["poor"]:
        target = min(im + 15, 100)
        gain = round((target - im) * _SCORE_GAIN_EST["internal"], 1)
        recs.append(f"Prepare for internal exams — target {target:.0f}/100 (est. +{gain} score)")

    if not recs:
        recs.append("Maintain your current academic performance — you are on track!")

    return recs


# ─────────────────────────────────────────────────────────────
# 5. What-If Simulation
# ─────────────────────────────────────────────────────────────
def simulate_whatif(att: float, sh: float, pm: float, asn: float, im: float,
                    rf_model, xgb_model, scaler, feat_names: list,
                    classify_fn) -> dict:
    """
    Simulate an improved scenario by bumping weak features toward
    their 'good' threshold and re-running the ML models.

    Returns a dict: {improved_score, improved_risk, improved_severity,
                     improvements_applied}
    """
    from model.train_model import FEATURES

    vals = {"attendance": att, "study_hours": sh, "prev_marks": pm,
            "assignment": asn, "internal": im}

    improvements_applied = []
    improved = dict(vals)  # copy

    for key, val in vals.items():
        t = _THRESH[key]
        label = _LABELS[key]
        unit = _UNITS[key]

        if val < t["critical"]:
            # Bump to just above "poor" threshold
            new_val = min(t["poor"] + 5, 100 if key != "study_hours" else 10)
            improvements_applied.append(
                f"{label}: {val}{unit} → {new_val}{unit}"
            )
            improved[key] = new_val
        elif val < t["poor"]:
            # Bump to just above "good" threshold
            new_val = min(t["good"] + 2, 100 if key != "study_hours" else 10)
            improvements_applied.append(
                f"{label}: {val}{unit} → {new_val}{unit}"
            )
            improved[key] = new_val

    # Map to model feature order
    fmap = {
        "attendance":    improved["attendance"],
        "study_hours":   improved["study_hours"],
        "prev_marks":    improved["prev_marks"],
        "previous_marks": improved["prev_marks"],
        "assignment":    improved["assignment"],
        "assignment_score": improved["assignment"],
        "internal":      improved["internal"],
        "internal_marks": improved["internal"],
    }
    X_imp = np.array([[fmap.get(fn, 0) for fn in feat_names]])
    X_sc_imp = scaler.transform(X_imp)

    rf_pred = float(rf_model.predict(X_sc_imp)[0])
    if xgb_model is not None:
        try:
            xgb_pred = float(xgb_model.predict(X_sc_imp)[0])
            imp_score = round(float(np.clip((rf_pred + xgb_pred) / 2.0, 0, 100)), 1)
        except Exception:
            imp_score = round(float(np.clip(rf_pred, 0, 100)), 1)
    else:
        imp_score = round(float(np.clip(rf_pred, 0, 100)), 1)

    imp_risk = classify_fn(imp_score)

    return {
        "improved_score":        imp_score,
        "improved_risk":         imp_risk,
        "improved_severity":     get_risk_severity(imp_risk),
        "improvements_applied":  improvements_applied,
    }
