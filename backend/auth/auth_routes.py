"""
auth_routes.py — FINAL (JWT + OTP Verification + Email)
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, jwt_required, get_jwt_identity
)
from flask_bcrypt import Bcrypt
from mysql.connector import Error
from database.db_config import get_connection
from utils.email_service import send_email
import re
import random
from datetime import datetime, timedelta
from services.email_service import send_email

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")
_bcrypt = None


# ───────────────── INIT ─────────────────
def init_bcrypt(bcrypt_instance):
    global _bcrypt
    _bcrypt = bcrypt_instance


# ───────────────── HELPERS ─────────────────
def _require(data, *fields):
    for f in fields:
        if not str(data.get(f, "")).strip():
            return f"Missing field: {f}"
    return None


def _user_by_email(cursor, email):
    cursor.execute(
        """SELECT id, name, email, password_hash, role,
                  is_verified, otp, otp_expiry
           FROM users WHERE email=%s LIMIT 1""",
        (email,)
    )
    return cursor.fetchone()


# ───────────────── REGISTER (OTP SEND) ─────────────────
@auth_bp.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json(force=True) or {}

        err = _require(data, "name", "email", "password")
        if err:
            return jsonify({"error": err}), 400

        name = str(data["name"]).strip()
        email = str(data["email"]).strip().lower()
        password = str(data["password"]).strip()
        role = str(data.get("role", "student")).strip().lower()

        pw_hash = _bcrypt.generate_password_hash(password).decode("utf-8")

        # 🔥 OTP GENERATE
        otp = str(random.randint(100000, 999999))
        expiry = datetime.utcnow() + timedelta(minutes=5)

        conn = get_connection()
        cursor = conn.cursor()

        # 🔥 SAVE WITH OTP
        cursor.execute("""
            INSERT INTO users (name, email, password_hash, role, otp, otp_expiry, is_verified)
            VALUES (%s,%s,%s,%s,%s,%s,0)
        """, (name, email, pw_hash, role, otp, expiry))

        conn.commit()
        user_id = cursor.lastrowid

        cursor.close()
        conn.close()

        # 🔥 SEND EMAIL
        send_email(
            email,
            "EduRisk OTP Verification",
            f"Hello {name},\n\nYour OTP is: {otp}\nValid for 5 minutes."
        )

        return jsonify({
            "message": "OTP sent to your email",
            "email": email
        }), 201

    except Error as e:
        if "Duplicate entry" in str(e):
            return jsonify({"error": "Email already registered"}), 409
        return jsonify({"error": str(e)}), 500

# ───────────────── VERIFY OTP ─────────────────
@auth_bp.route("/verify-otp", methods=["POST"])
def verify_otp():
    try:
        data = request.get_json(force=True) or {}

        err = _require(data, "email", "otp")
        if err:
            return jsonify({"error": err}), 400

        email = data["email"]
        otp = data["otp"]

        conn = get_connection()
        cursor = conn.cursor()

        user = _user_by_email(cursor, email)

        if not user:
            return jsonify({"error": "User not found"}), 404

        user_id, name, _, _, role, verified, db_otp, expiry = user

        if verified:
            return jsonify({"message": "Already verified"}), 200

        if db_otp != otp:
            return jsonify({"error": "Invalid OTP"}), 401

        if datetime.utcnow() > expiry:
            return jsonify({"error": "OTP expired"}), 401

        # ✅ VERIFY USER
        cursor.execute("""
            UPDATE users
            SET is_verified=1, otp=NULL, otp_expiry=NULL
            WHERE id=%s
        """, (user_id,))
        conn.commit()

        cursor.close()
        conn.close()

        return jsonify({"message": "Email verified successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ───────────────── LOGIN (STRICT) ─────────────────
@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json(force=True) or {}

        err = _require(data, "email", "password")
        if err:
            return jsonify({"error": err}), 400

        email = str(data["email"]).strip().lower()
        password = str(data["password"]).strip()

        conn = get_connection()
        cursor = conn.cursor()

        row = _user_by_email(cursor, email)

        cursor.close()
        conn.close()

        if not row or not _bcrypt.check_password_hash(row[3], password):
            return jsonify({"error": "Invalid email or password"}), 401

        # 🔥 BLOCK LOGIN IF NOT VERIFIED
        if not row[5]:
            return jsonify({"error": "Please verify OTP first"}), 403

        identity = {
            "id": int(row[0]),
            "name": row[1],
            "email": row[2],
            "role": row[4]
        }

        access_token = create_access_token(identity=identity)

        return jsonify({
            "access_token": access_token,
            "user": identity
        }), 200

    except Error as e:
        return jsonify({"error": str(e)}), 500


# ───────────────── PROFILE ─────────────────
@auth_bp.route("/profile", methods=["GET"])
@jwt_required()
def profile():
    try:
        current = get_jwt_identity()

        if not current:
            return jsonify({"error": "Invalid token"}), 401

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            "SELECT id, name, email, role, created_at FROM users WHERE id=%s LIMIT 1",
            (current["id"],)
        )

        row = cursor.fetchone()

        cursor.close()
        conn.close()

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