import random
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
import os
import time
from werkzeug.utils import secure_filename
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from flask_bcrypt import Bcrypt
from mysql.connector import Error
from database.db_config import get_connection
from utils.security import sanitize_string
from utils.email_service import send_email

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")
_bcrypt = Bcrypt()

def init_bcrypt(bcrypt_instance):
    global _bcrypt
    _bcrypt = bcrypt_instance

def _require(data, *fields):
    for f in fields:
        if not str(data.get(f, "")).strip():
            return f"Missing field: {f}"
    return None

def _user_by_email(cursor, email):
    # Added is_verified to login check output if needed later, but keeping old logic working
    cursor.execute(
        "SELECT id, name, email, password_hash, role, is_verified FROM users WHERE email=%s LIMIT 1",
        (email,)
    )
    return cursor.fetchone()

# 🔹 REGISTER API
@auth_bp.route("/register", methods=["POST"])
def register():
    try:
        # Support both JSON and multipart/form-data (for profile image)
        if request.content_type and request.content_type.startswith('multipart/form-data'):
            data = {**request.form}
        else:
            data = request.get_json(force=True) or {}
        err = _require(data, "name", "email", "password")
        if err:
            return jsonify({"error": err}), 400

        name = sanitize_string(data.get("name", ""))
        email = sanitize_string(data.get("email", "")).lower()
        password = str(data.get("password", ""))
        role = sanitize_string(data.get("role", "student")).lower()
        course = sanitize_string(data.get("course", ""))
        semester = sanitize_string(data.get("semester", ""))

        if role not in ("student", "admin"):
            role = "student"

        if len(password) < 6:
            return jsonify({"error": "Password must be at least 6 characters"}), 400

        import re
        if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
            return jsonify({"error": "Invalid email address"}), 400

        pw_hash = _bcrypt.generate_password_hash(password).decode("utf-8")

        # 🔥 OTP Generation
        otp = str(random.randint(100000, 999999))
        otp_expiry = datetime.now() + timedelta(minutes=5)
        is_verified = 0

        # Debug Logs
        print("OTP:", otp)
        print("EMAIL:", email)

        conn = get_connection()
        cursor = conn.cursor()
        # Insert user with OTP details
        cursor.execute(
            "INSERT INTO users (name, email, password_hash, role, otp, otp_expiry, is_verified) VALUES (%s,%s,%s,%s,%s,%s,%s)",
            (name, email, pw_hash, role, otp, otp_expiry, is_verified)
        )
        conn.commit()
        user_id = cursor.lastrowid

        # If a profile image was uploaded, save it and create a profile row
        image_url = None
        try:
            if 'image' in request.files:
                file = request.files['image']
                if file and file.filename:
                    filename = secure_filename(file.filename)
                    ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
                    allowed = {'png', 'jpg', 'jpeg', 'webp'}
                    if ext in allowed:
                        base = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
                        upload_dir = os.path.join(base, 'static', 'uploads')
                        os.makedirs(upload_dir, exist_ok=True)
                        out_name = f"profile_{user_id}_{int(time.time())}.{ext}"
                        out_path = os.path.join(upload_dir, out_name)
                        file.save(out_path)
                        host = request.host_url.rstrip('/')
                        image_url = f"{host}/static/uploads/{out_name}"

            # Try to create student_profiles entry (non-fatal)
            try:
                cursor.execute("INSERT INTO student_profiles (user_id, name, email, course, semester, image_url) VALUES (%s,%s,%s,%s,%s,%s)",
                               (user_id, name, email, course, semester, image_url))
                conn.commit()
            except Exception as pe:
                # If table/column missing, skip profile creation but keep user created
                print("[REGISTER] Could not create student_profiles row:", pe)

        except Exception as img_e:
            print("[REGISTER] Image save/profile creation failed, continuing:", img_e)

        cursor.close(); conn.close()

             # 🔥 Send OTP Email (Don't fail registration if email fails)
        subject = "EduRisk OTP Verification"
        body = f"""Hello {name},

Your OTP for registration is: {otp}

This OTP is valid for 5 minutes.

Thank you!
"""     
        print("========== BEFORE send_email ==========")
        raise Exception("TEST BEFORE SEND_EMAIL")
        email_sent = send_email(email, subject, body)
        print("========== AFTER send_email ==========")

        if email_sent:
            print("✅ OTP email sent successfully.")
        else:
            print("⚠️ OTP email could not be sent.")

        return jsonify({
            "message": "User registered successfully",
            "user_id": user_id,
            "email_sent": email_sent
        }), 201

    except Error as e:
        if "Duplicate entry" in str(e):
            return jsonify({"error": "Email already registered"}), 409
        return jsonify({"error": str(e)}), 500

    except Exception as e:
        import traceback
        traceback.print_exc()
        print("Register error:", e)
        return jsonify({"error": str(e)}), 500

# 🔹 VERIFY OTP API
@auth_bp.route("/verify-otp", methods=["POST"])
def verify_otp():
    try:
        data = request.get_json(force=True) or {}
        email = data.get("email")
        otp = data.get("otp")

        if not email or not otp:
            return jsonify({"error": "Email and OTP are required"}), 400

        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, otp, otp_expiry FROM users WHERE email=%s LIMIT 1",
            (email,)
        )
        row = cursor.fetchone()

        if not row:
            cursor.close(); conn.close()
            return jsonify({"error": "User not found"}), 404

        user_id, db_otp, otp_expiry = row[0], row[1], row[2]

        if not db_otp or str(db_otp) != str(otp):
            cursor.close(); conn.close()
            return jsonify({"error": "Invalid OTP"}), 400

        if otp_expiry and datetime.now() > otp_expiry:
            cursor.close(); conn.close()
            return jsonify({"error": "OTP has expired"}), 400

        # Mark as verified
        cursor.execute("UPDATE users SET is_verified=1, otp=NULL, otp_expiry=NULL WHERE id=%s", (user_id,))
        conn.commit()
        cursor.close(); conn.close()

        return jsonify({"message": "OTP verified successfully"}), 200

    except Error as e:
        return jsonify({"error": str(e)}), 500


# 🔹 LOGIN API
@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json(force=True) or {}
        err = _require(data, "email", "password")
        if err:
            return jsonify({"error": err}), 400

        email = sanitize_string(data["email"]).lower()
        password = str(data["password"])

        conn = get_connection()
        cursor = conn.cursor()
        row = _user_by_email(cursor, email)
        cursor.close(); conn.close()

        if not row or not _bcrypt.check_password_hash(row[3], password):
            return jsonify({"error": "Invalid email or password"}), 401
            
        is_verified = row[5]
        if is_verified == 0:
            return jsonify({"error": "Please verify your email first"}), 401

        # JWT identity MUST be a string (user_id) for flask_jwt_extended compatibility.
        # Storing a dictionary here causes 401 Invalid Token on verification.
        user_id = row[0]
        name    = row[1]
        role    = row[4]
        token = create_access_token(
            identity=str(user_id),
            additional_claims={"role": role, "name": name}
        )

        return jsonify({
            "access_token": token,
            "user": {
                "id":    row[0],
                "name":  row[1],
                "email": row[2],
                "role":  row[4]
            }
        }), 200

    except Error as e:
        return jsonify({"error": str(e)}), 500

# 🔹 PROFILE API
@auth_bp.route("/profile", methods=["GET"])
@jwt_required()
def profile():
    try:
        identity = get_jwt_identity()
        user_id = identity.get("id") if isinstance(identity, dict) else identity

        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, name, email, role, created_at FROM users WHERE id=%s LIMIT 1",
            (user_id,)
        )
        row = cursor.fetchone()
        cursor.close(); conn.close()

        if not row:
            return jsonify({"error": "User not found"}), 404

        return jsonify({
            "id": row[0],
            "name": row[1],
            "email": row[2],
            "role": row[3],
            "created_at": str(row[4])
        }), 200

    except Error as e:
        return jsonify({"error": str(e)}), 500