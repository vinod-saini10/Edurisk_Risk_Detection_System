import os
import resend

resend.api_key = os.getenv("RESEND_API_KEY")


def send_email(to_email, subject, body):
    try:
        params = {
            "from": "EduRisk <onboarding@resend.dev>",
            "to": [to_email],
            "subject": subject,
            "text": body,
        }

        response = resend.Emails.send(params)

        print("✅ Email sent successfully")
        print(response)

        return True

    except Exception as e:
        import traceback

        print("\n========== RESEND ERROR ==========")
        traceback.print_exc()
        print(type(e).__name__)
        print(e)
        print("=================================\n")

        return False