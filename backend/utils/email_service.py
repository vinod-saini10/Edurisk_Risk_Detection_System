import os
import smtplib
from email.mime.text import MIMEText
from dotenv import load_dotenv

def send_email(to_email, subject, body):
    try:
        # 🔥 ALWAYS GET FRESH ENV
        dotenv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
        load_dotenv(dotenv_path=dotenv_path)

        MAIL_USER = os.getenv("MAIL_USER")
        MAIL_PASS = os.getenv("MAIL_PASS")

        print("MAIL_USER:", MAIL_USER)
        print("MAIL_PASS:", MAIL_PASS)

        # ❌ अगर missing है तो यहीं fail कराओ
        if not MAIL_USER or not MAIL_PASS:
            raise Exception("Email credentials not set in .env")

        msg = MIMEText(body)
        msg["Subject"] = subject
        msg["From"] = MAIL_USER
        msg["To"] = to_email

        server = smtplib.SMTP("smtp.gmail.com", 587, timeout=15)
        server.starttls()

        server.login(MAIL_USER, MAIL_PASS)

        server.send_message(msg)
        server.quit()

        print("✅ Email sent successfully")

        return True

    except Exception as e:
        print("🔥 Email error:", e)
        return False