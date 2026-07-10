from apiflask import Schema
from apiflask.fields import String, Float, Integer


class PredictInputSchema(Schema):
    attendance = Float(required=True)
    study_hours = Float(required=True)
    previous_marks = Float(required=True)
    assignment_score = Float(required=True)
    internal_marks = Float(required=True)


class PredictionResponseSchema(Schema):
    predicted_score = Float()
    risk_level = String()
    confidence = Float()