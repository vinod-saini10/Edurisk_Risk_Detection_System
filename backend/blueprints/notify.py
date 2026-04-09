from flask import Blueprint, request, jsonify
from utils.email_service import send_email

notify_bp = Blueprint("notify", __name__, url_prefix="/api/notify")

@notify_bp.route("/email", methods=["POST"])
def send_email_api():
    try:
        data = request.get_json()

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
            return jsonify({"message": "Email sent"}), 200
        else:
            return jsonify({"error": "Email failed"}), 500

    except Exception as e:
        print("EMAIL ERROR:", e)
        return jsonify({"error": str(e)}), 500