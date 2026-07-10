from apiflask import Schema
from apiflask.fields import Integer,String, Float, List, Nested


class HistoryItemSchema(Schema):
    id = Integer()
    name = String()
    email = String()

    attendance = Float()
    study_hours = Float()
    previous_marks = Float()
    assignment_score = Float()
    internal_marks = Float()

    predicted_score = Float()

    risk_level = String()

    confidence = Float()

    created_at = String()


class HistoryResponseSchema(Schema):
    items = List(Nested(HistoryItemSchema))


class PreviousRequestSchema(Schema):
    name = String(required=True)
    email = String(required=True)