from apiflask import Schema
from apiflask.fields import (
    String,
    Integer,
    Float,
    List,
    Nested,
    Dict,
)


# =========================
# Users
# =========================

class AdminUserSchema(Schema):
    id = Integer()
    name = String()
    email = String()
    role = String()
    created_at = String()


# =========================
# Analytics
# =========================

class TrendSchema(Schema):
    date = String()
    avg_score = Float()


class HighRiskStudentSchema(Schema):
    student_id = Integer()
    name = String()
    email = String()
    avg_score = Float()
    risk_level = String()


class AnalyticsSchema(Schema):
    total_students = Integer()
    avg_score = Float()
    average_predicted_score = Float()
    risk_distribution = Dict()
    trend_over_time = List(Nested(TrendSchema))
    top_high_risk_students = List(Nested(HighRiskStudentSchema))


# =========================
# Insights
# =========================

class InsightsSchema(Schema):
    insights = List(String())


# =========================
# Model Metrics
# =========================

class ModelMetricsSchema(Schema):
    rf = Dict()
    xgb = Dict()


# =========================
# Delete User
# =========================

class AdminMessageSchema(Schema):
    message = String()


# =========================
# Predictions
# =========================

class PredictionSchema(Schema):
    id = Integer()
    user_id = Integer()
    student_id = Integer()

    name = String()
    email = String()

    predicted_score = Float()
    risk_level = String()
    confidence = Float()

    uploader_name = String()

    created_at = String()


# =========================
# Charts
# =========================

class ChartsSchema(Schema):
    risk_distribution = Dict()
    avg_score_by_risk = Dict()