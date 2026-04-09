"""
history.py — Step 8: Modular REST API Structuring
User Prediction History Blueprint
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from mysql.connector import Error
from database.db_config import get_connection

# Create blueprint for history routes
history_bp = Blueprint("history", __name__, url_prefix="/api/history")


@history_bp.route("", methods=["GET"])
@jwt_required()  # 🔐 Protect route with JWT
def get_user_history():
    """
    Get all prediction history for logged-in user
    """
    try:
        # 🔹 Extract identity from JWT token
        identity = get_jwt_identity()

        # 🔥 FIX: Handle both dict and int identity
        if isinstance(identity, dict):
            user_id = identity.get("id")
        else:
            user_id = identity

        # Debug (optional)
        print("JWT identity:", identity, "→ user_id:", user_id)

        # ❌ अगर user_id ही नहीं मिला
        if not user_id:
            return jsonify({"error": "Invalid token identity"}), 401

        # 🔹 Connect to database
        conn = get_connection()
        cursor = conn.cursor()

        # 🔹 Fetch history for this user
        cursor.execute("""
            SELECT s.name, s.email,
                   ar.attendance, ar.study_hours, ar.previous_marks,
                   ar.assignment_score, ar.internal_marks,
                   p.predicted_score, p.risk_level, p.confidence,
                   p.created_at
            FROM   predictions p
            JOIN   students s          ON s.id = p.student_id
            JOIN   academic_records ar ON ar.student_id = p.student_id
            WHERE  p.user_id = %s
            ORDER  BY p.created_at DESC
            LIMIT  100
        """, (user_id,))

        rows = cursor.fetchall()
        cols = [d[0] for d in cursor.description]

        cursor.close()
        conn.close()

        # 🔹 Convert DB rows → JSON
        result = []
        for r in rows:
            d = dict(zip(cols, r))

            # Convert datetime → string
            if d.get("created_at"):
                d["created_at"] = str(d["created_at"])

            result.append(d)

        return jsonify(result), 200

    except Exception as e:
        print("History Error:", str(e))  # debug log
        return jsonify({"error": str(e)}), 500


@history_bp.route("/previous", methods=["POST"])
def get_previous():
    """
    Get latest prediction for name+email (no login required)
    """
    try:
        # 🔹 Get request data
        data = request.get_json(force=True) or {}
        name = str(data.get("name", "")).strip()
        email = str(data.get("email", "")).strip()

        # ❌ Validation
        if not name or not email:
            return jsonify({"error": "name and email are required"}), 400

        conn = get_connection()
        cursor = conn.cursor()

        # 🔹 Find student ID
        cursor.execute(
            "SELECT s.id FROM students s WHERE s.name=%s AND s.email=%s LIMIT 1",
            (name, email)
        )
        row = cursor.fetchone()

        if not row:
            cursor.close()
            conn.close()
            return jsonify({"error": "No record found for this name and email"}), 404

        sid = row[0]

        # 🔹 Fetch latest prediction
        cursor.execute("""
            SELECT s.name, s.email,
                   ar.attendance, ar.study_hours, ar.previous_marks,
                   ar.assignment_score, ar.internal_marks,
                   p.predicted_score, p.risk_level, p.confidence,
                   p.created_at
            FROM   students s
            JOIN   academic_records ar ON ar.student_id = s.id
            JOIN   predictions p       ON p.student_id  = s.id
            WHERE  s.id = %s
            ORDER  BY p.created_at DESC
            LIMIT  1
        """, (sid,))

        rec = cursor.fetchone()

        cursor.close()
        conn.close()

        if not rec:
            return jsonify({"error": "Prediction data not found"}), 404

        # 🔹 Convert to JSON
        keys = [
            "name", "email", "attendance", "study_hours", "previous_marks",
            "assignment_score", "internal_marks", "predicted_score",
            "risk_level", "confidence", "created_at"
        ]

        result = dict(zip(keys, rec))

        # Convert datetime
        if result.get("created_at"):
            result["created_at"] = str(result["created_at"])

        return jsonify(result), 200

    except Exception as e:
        print("Previous Error:", str(e))
        return jsonify({"error": str(e)}), 500