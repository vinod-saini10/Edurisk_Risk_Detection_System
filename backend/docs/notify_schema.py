from apiflask import Schema
from apiflask.fields import String, Float


class NotifyRequestSchema(Schema):
    to_email = String(required=True)
    name = String(required=True)
    risk_level = String(required=True)
    score = Float(required=True)


class NotifyResponseSchema(Schema):
    message = String()


class NotifyErrorSchema(Schema):
    error = String()