
"""
app.py — FINAL (Stable + OTP Ready + JWT Secured)
"""

import os
import time
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from dotenv import load_dotenv
from datetime import timedelta

# 🔥 Load ENV (VERY IMPORTANT — top pe hi hona chahiye)
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

# Blueprints
from blueprints.auth import auth_bp, init_bcrypt
from blueprints.predict import predict_bp, init_model
from blueprints.history import history_bp
from blueprints.admin import admin_bp, compute_analytics
from blueprints.notify import notify_bp
from blueprints.student import student_bp

# Core modules
from database.db_config import initialize_database
from model.train_model import load_model
from utils.errors import register_error_handlers

# Public analytics rate limit
PUBLIC_ANALYTICS_RATE_LIMIT = int(os.getenv("PUBLIC_ANALYTICS_RATE_LIMIT", "60"))
PUBLIC_ANALYTICS_WINDOW = int(os.getenv("PUBLIC_ANALYTICS_WINDOW", "3600"))
_public_analytics_rate = {}


def create_app():
    app = Flask(__name__)

    # ─────────────────────────────
    # 🔹 1. CORS CONFIG
    # ─────────────────────────────
    CORS(
        app,
        supports_credentials=True,
        origins=["http://localhost:3000"],
        allow_headers=["Authorization", "Content-Type", "Accept"],
        expose_headers=["Authorization"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    )

    # ─────────────────────────────
    # 🔐 2. JWT CONFIG
    # ─────────────────────────────
    app.config["JWT_SECRET_KEY"] = os.getenv(
        "JWT_SECRET_KEY", "edurisk-super-secret-key"
    )
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=2)

    jwt = JWTManager(app)
    bcrypt = Bcrypt(app)

    # ─────────────────────────────
    # 🔍 DEBUG: Print Incoming Headers
    # ─────────────────────────────
    @app.before_request
    def debug_headers():
        if request.method != 'OPTIONS' and request.path.startswith("/api/"):
            auth = request.headers.get("Authorization", "(none)")
            print(f"[DEBUG] {request.method} {request.path} -> Auth Header: {auth[:20]}...")

    # JWT Error Handlers — with console logging for easier debugging
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        print("[JWT] Token expired:", jwt_payload)
        return jsonify({"error": "Token has expired — please log in again"}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        print("[JWT] Invalid token:", error)
        return jsonify({"error": "Invalid token — please log in again"}), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        print("[JWT] Missing/no token:", error)
        return jsonify({"error": "Authorization header missing — please log in"}), 401

    # Global Error Handler
    register_error_handlers(app)

    # ─────────────────────────────
    # 🗄️ DATABASE INIT
    # ─────────────────────────────
    with app.app_context():
        initialize_database()
        try:
            from database.db_config import run_profile_migrations
            run_profile_migrations()
        except Exception as e:
            print("[MIGRATE] Auto-migration skipped:", e)

    # ─────────────────────────────
    # 🤖 MODEL LOAD
    # ─────────────────────────────
    rf_model, xgb_model, scaler, meta = load_model()

    init_bcrypt(bcrypt)
    init_model(rf_model, xgb_model, scaler, meta)

    # ─────────────────────────────
    # 🔌 REGISTER BLUEPRINTS
    # ─────────────────────────────
    app.register_blueprint(auth_bp)
    app.register_blueprint(predict_bp)
    app.register_blueprint(history_bp)
    app.register_blueprint(student_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(notify_bp)

    # ─────────────────────────────
    # 📊 PUBLIC ANALYTICS
    # ─────────────────────────────
    @app.route("/api/analytics", methods=["GET"])
    def public_analytics():
        ip = request.headers.get("X-Forwarded-For", request.remote_addr)
        if ip and "," in ip:
            ip = ip.split(",")[0].strip()

        now = time.time()
        entry = _public_analytics_rate.get(ip)

        if entry:
            count, start = entry
            if now - start > PUBLIC_ANALYTICS_WINDOW:
                _public_analytics_rate[ip] = (1, now)
            else:
                if count >= PUBLIC_ANALYTICS_RATE_LIMIT:
                    retry_after = int(PUBLIC_ANALYTICS_WINDOW - (now - start))
                    return jsonify({
                        "error": "Rate limit exceeded",
                        "retry_after": retry_after
                    }), 429
                _public_analytics_rate[ip] = (count + 1, start)
        else:
            _public_analytics_rate[ip] = (1, now)

        try:
            data = compute_analytics()
            return jsonify(data), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    # ─────────────────────────────
    # ❤️ HEALTH CHECK
    # ─────────────────────────────
    @app.route("/api/health")
    def health():
        return {
            "status": "healthy",
            "env_loaded": bool(os.getenv("vinod.saini24@pcu.edu.in")),
            "models": {
                "rf": True,
                "xgb": bool(meta.get("xgb_metrics"))
            }
        }, 200

    # ─────────────────────────────
    # 🏠 HOME ROUTE (FIXED)
    # ─────────────────────────────
    @app.route("/")
    def home():
        return "EduRisk Backend Running ✅"

    return app


# ─────────────────────────────
# 🚀 RUN SERVER
# ─────────────────────────────
if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=False)

