import re
from functools import wraps
from flask import jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt


# ───────────────── ADMIN DECORATOR ─────────────────
def admin_required():
    """
    Protect routes for admin users only.
    Validates JWT via @jwt_required() then checks the role claim.

    Only 403 (role mismatch) is caught here.
    JWT errors (missing/expired/invalid token) are handled by
    Flask-JWT-Extended's own error callbacks in app.py so the
    correct 401 / 422 response is returned with a clear message.
    """
    def wrapper(fn):
        @wraps(fn)
        @jwt_required()
        def decorated_view(*args, **kwargs):
            claims = get_jwt()
            role = claims.get("role", "")
            if role != "admin":
                return jsonify({"error": "Admin access required", "your_role": role}), 403
            return fn(*args, **kwargs)
        return decorated_view
    return wrapper


# ───────────────── LOGIN REQUIRED (STUDENT/ANY) ─────────────────
def login_required():
    """
    Protect routes for any logged-in user.
    JWT errors bubble to Flask-JWT-Extended's error handlers.
    """
    def wrapper(fn):
        @wraps(fn)
        @jwt_required()
        def decorated_view(*args, **kwargs):
            identity = get_jwt_identity()
            if not identity:
                return jsonify({"error": "Invalid session — please log in again"}), 401
            return fn(*args, **kwargs)
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