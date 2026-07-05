import os
import smtplib
from email.mime.text import MIMEText


def send_email(to_email, subject, body):
    try:

        MAIL_USER = os.getenv("MAIL_USER")
        MAIL_PASS = os.getenv("MAIL_PASS")

        print("MAIL_USER :", MAIL_USER)
        print("MAIL_PASS :", "FOUND" if MAIL_PASS else "NOT FOUND")

        if not MAIL_USER or not MAIL_PASS:
            raise Exception("MAIL_USER or MAIL_PASS not found in Render Environment Variables.")

        msg = MIMEText(body)

        msg["Subject"] = subject
        msg["From"] = MAIL_USER
        msg["To"] = to_email

        print(f"📧 Sending OTP to {to_email}")

        server = smtplib.SMTP("smtp.gmail.com", 587, timeout=10)

        server.ehlo()

        server.starttls()

        server.ehlo()

        server.login(MAIL_USER, MAIL_PASS)

        server.send_message(msg)

        server.quit()

        print("✅ Email Sent Successfully")

        return True

    except Exception as e:

        import traceback

        print("\n========== EMAIL ERROR ==========")

        traceback.print_exc()

        print("ERROR TYPE :", type(e).__name__)

        print("ERROR :", repr(e))

        print("================================\n")

        return False