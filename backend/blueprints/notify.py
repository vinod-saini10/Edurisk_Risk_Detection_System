from docs.notify_schema import (
    NotifyRequestSchema,
    NotifyResponseSchema,
)
from flask import jsonify
from apiflask import APIBlueprint
from utils.email_service import send_email

notify_bp = APIBlueprint(
    "notify",
    __name__,
    url_prefix="/api/notify",
    tag="Notification"
)
#_____________________________________Email decorator________________
@notify_bp.post("/email")
@notify_bp.doc(
    tags=["Notification"],
    summary="Send Risk Alert Email",
    description="Sends a risk notification email to the student."
)
@notify_bp.input(NotifyRequestSchema)
@notify_bp.output(NotifyResponseSchema)

def send_email_api(json_data):
    try:
        data = json_data

        # 🔥 MATCH FRONTEND
        to_email = data.get("to_email")
        name = data.get("name")
        risk = data.get("risk_level")
        score = data.get("score")

        if not to_email:
            return jsonify({"error": "Email is required"}), 400

        subject = "EduRisk Alert 🚨"

        message = f"""
Hello {name},

Your predicted score is: {score}
Risk Level: {risk}

Please take immediate action.

- EduRisk System
"""

        success = send_email(to_email, subject, message)

        if success:
            return ({"message": "Email sent"})
        else:
            return jsonify({"error": "Email failed"}), 500

    except Exception as e:
        print("EMAIL ERROR:", e)
        return jsonify({"error": str(e)}), 500