import re
from functools import wraps
from flask import jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt


# ───────────────── ADMIN DECORATOR ─────────────────
def admin_required():
    """
    Protect routes for admin users only.
    Automatically validates JWT + role from additional claims.
    """
    def wrapper(fn):
        @wraps(fn)
        @jwt_required()
        def decorated_view(*args, **kwargs):
            try:
                # 🔥 Role check from claims
                claims = get_jwt()
                if claims.get("role") != "admin":
                    return jsonify({"error": "Admin access required"}), 403

                return fn(*args, **kwargs)

            except Exception:
                return jsonify({"error": "Authentication failed"}), 401

        return decorated_view
    return wrapper


# ───────────────── LOGIN REQUIRED (STUDENT/ANY) ─────────────────
def login_required():
    """
    Protect routes for any logged-in user.
    """
    def wrapper(fn):
        @wraps(fn)
        @jwt_required()
        def decorated_view(*args, **kwargs):
            try:
                identity = get_jwt_identity()
                if not identity:
                    return jsonify({"error": "Invalid session"}), 401
                return fn(*args, **kwargs)
            except Exception:
                return jsonify({"error": "Authentication required"}), 401
        return decorated_view
    return wrapper


# ───────────────── INPUT SANITIZATION ─────────────────
def sanitize_string(text: str) -> str:
    """
    Basic sanitization to prevent XSS / injection.
    """
    if not text:
        return ""

    # Remove HTML tags
    clean = re.sub(r"<.*?>", "", text)

    # Remove script keywords
    clean = re.sub(r"(script|javascript:)", "", clean, flags=re.IGNORECASE)

    return clean.strip()