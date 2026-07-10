from apiflask import Schema
from apiflask.fields import (
    String,
    Float,
    Dict,
    List,
    Nested,
    File,
)
"""
Prediction Request Schema
"""
class PredictSchema(Schema):

    name = String(
        required=True
    )

    email = String(
        required=True
    )

    attendance = Float(
        required=True
    )

    study_hours = Float(
        required=True
    )

    previous_marks = Float(
        required=True
    )

    assignment_score = Float(
        required=True
    )

    internal_marks = Float(
        required=True
    )





"""
Prediction Response Schema
"""
class PredictResponseSchema(Schema):

    name = String()

    email = String()

    attendance = Float()

    study_hours = Float()

    previous_marks = Float()

    assignment_score = Float()

    internal_marks = Float()

    predicted_score = Float()

    risk_level = String()

    risk_severity = String()

    confidence = Float()

    explanation = Dict()

    feature_importance = Dict()

    shap_detail = Dict()
    


