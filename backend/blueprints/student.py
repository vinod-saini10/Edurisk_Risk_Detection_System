"""
student.py — Student-facing endpoints for personal predictions and export
"""

import io
import os
import time
import csv
from flask import Blueprint, jsonify, send_file, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from mysql.connector import Error
from database.db_config import get_connection
from utils.security import sanitize_string
from werkzeug.utils import secure_filename


def _ensure_profile_columns(cursor):
    """Ensure student_profiles table has image_url and updated_at columns. Non-fatal."""
    try:
        cursor.execute("SHOW TABLES LIKE 'student_profiles'")
        if cursor.fetchone() is None:
            return

        cursor.execute("SHOW COLUMNS FROM student_profiles LIKE 'image_url'")
        if cursor.fetchone() is None:
            try:
                cursor.execute("ALTER TABLE student_profiles ADD COLUMN image_url VARCHAR(512) NULL")
                print("[DB] Added column image_url to student_profiles (runtime)")
            except Exception as _e:
                print("[DB] Failed to add image_url at runtime:", _e)

        cursor.execute("SHOW COLUMNS FROM student_profiles LIKE 'updated_at'")
        if cursor.fetchone() is None:
            try:
                cursor.execute("ALTER TABLE student_profiles ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
                print("[DB] Added column updated_at to student_profiles (runtime)")
            except Exception as _e:
                print("[DB] Failed to add updated_at at runtime:", _e)
    except Exception as e:
        print("[DB] _ensure_profile_columns skipped:", e)

student_bp = Blueprint("student", __name__, url_prefix="/api/student")


@student_bp.route("/predictions", methods=["GET"])
@jwt_required()
def get_my_predictions():
    identity = get_jwt_identity()
    user_id = identity.get("id") if isinstance(identity, dict) else identity

    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        # Get user's email to map to students table
        cursor.execute("SELECT email FROM users WHERE id=%s LIMIT 1", (user_id,))
        row = cursor.fetchone()
        if not row:
            return jsonify({"error": "User not found"}), 404

        user_email = row[0]

        cursor.execute("""
            SELECT p.id, s.email, p.attendance, p.study_hours, p.previous_marks,
                   p.assignment_score, p.internal_marks, p.predicted_score, p.risk_level, p.created_at
            FROM   predictions p
            JOIN   students s ON s.id = p.student_id
            WHERE  s.email = %s
            ORDER  BY p.created_at DESC
        """, (user_email,))

        rows = cursor.fetchall()
        cols = [d[0] for d in cursor.description] if cursor.description else []

        preds = []
        for r in rows:
            d = dict(zip(cols, r))
            if d.get("created_at"):
                d["created_at"] = str(d["created_at"])
            preds.append(d)

        total = len(preds)
        high = sum(1 for p in preds if p.get("risk_level") == "High Risk")
        med = sum(1 for p in preds if p.get("risk_level") == "Medium Risk")
        low = sum(1 for p in preds if p.get("risk_level") == "Low Risk")
        avg = round(sum((p.get("predicted_score") or 0) for p in preds) / total, 2) if total > 0 else 0

        return jsonify({
            "predictions": preds,
            "total_predictions": total,
            "stats": {
                "high_risk_count": high,
                "medium_risk_count": med,
                "low_risk_count": low,
                "average_score": avg
            }
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            try:
                cursor.close()
            except Exception:
                pass
        if conn:
            try:
                conn.close()
            except Exception:
                pass


@student_bp.route("/predictions/export", methods=["GET"])
@jwt_required()
def export_my_predictions():
    identity = get_jwt_identity()
    user_id = identity.get("id") if isinstance(identity, dict) else identity

    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT email FROM users WHERE id=%s LIMIT 1", (user_id,))
        row = cursor.fetchone()
        if not row:
            return jsonify({"error": "User not found"}), 404

        user_email = row[0]

        cursor.execute("""
            SELECT s.email, p.attendance, p.study_hours, p.previous_marks,
                   p.assignment_score, p.internal_marks, p.predicted_score, p.risk_level, p.created_at
            FROM   predictions p
            JOIN   students s ON s.id = p.student_id
            WHERE  s.email = %s
            ORDER  BY p.created_at DESC
        """, (user_email,))

        rows = cursor.fetchall()

        # Build CSV
        output = io.StringIO()
        writer = csv.writer(output)
        header = ["email", "attendance", "study_hours", "previous_marks", "assignment_score", "internal_marks", "predicted_score", "risk_level", "created_at"]
        writer.writerow(header)

        for r in rows:
            writer.writerow([r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7], str(r[8]) if r[8] else ""]) 

        mem = io.BytesIO()
        mem.write(output.getvalue().encode())
        mem.seek(0)
        output.close()

        return send_file(mem, mimetype="text/csv", as_attachment=True, download_name="my_predictions.csv")

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            try:
                cursor.close()
            except Exception:
                pass
        if conn:
            try:
                conn.close()
            except Exception:
                pass


@student_bp.route("/profile", methods=["GET"]) 
@jwt_required()
def get_profile():
    identity = get_jwt_identity()
    user_id = identity.get("id") if isinstance(identity, dict) else identity

    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        # Ensure columns exist (runtime migration) and handle missing-column gracefully
        _ensure_profile_columns(cursor)
        try:
            cursor.execute("SELECT name, email, course, semester, image_url, updated_at FROM student_profiles WHERE user_id=%s LIMIT 1", (user_id,))
            row = cursor.fetchone()
            if row:
                res = {
                    "name": row[0], "email": row[1], "course": row[2], "semester": row[3], "image_url": row[4], "updated_at": str(row[5]) if row[5] else None
                }
                return jsonify(res), 200
        except Exception as e:
            # If SELECT failed due to missing columns, fall back to safer query
            print("[PROFILE] SELECT with image_url failed, falling back:", e)

        # Fallback to users table
        cursor.execute("SELECT name, email FROM users WHERE id=%s LIMIT 1", (user_id,))
        u = cursor.fetchone()
        if not u:
            return jsonify({"error": "User not found"}), 404
        return jsonify({"name": u[0], "email": u[1]}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            try:
                cursor.close()
            except Exception:
                pass
        if conn:
            try:
                conn.close()
            except Exception:
                pass


@student_bp.route("/profile", methods=["POST", "PUT"]) 
@jwt_required()
def upsert_profile():
    identity = get_jwt_identity()
    user_id = identity.get("id") if isinstance(identity, dict) else identity

    # Accept both JSON and form data (form-data used by registration flow)
    data = {}
    try:
        data = request.get_json(force=False) or {}
    except Exception:
        data = {}
    # merge form fields if present
    if not data and request.form:
        data = request.form.to_dict()

    name = sanitize_string(data.get("name", ""))
    email = sanitize_string(data.get("email", ""))
    course = sanitize_string(data.get("course", ""))
    semester = sanitize_string(data.get("semester", ""))

    if not name or not email:
        return jsonify({"error": "name and email are required"}), 400

    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        # Ensure profile columns exist at runtime (non-fatal)
        _ensure_profile_columns(cursor)

        cursor.execute("SELECT id FROM student_profiles WHERE user_id=%s LIMIT 1", (user_id,))
        row = cursor.fetchone()
        # Optional image_url in payload
        image_url = sanitize_string(data.get("image_url", ""))

        try:
            if row:
                if image_url:
                    cursor.execute("UPDATE student_profiles SET name=%s, email=%s, course=%s, semester=%s, image_url=%s WHERE user_id=%s", (name, email, course, semester, image_url, user_id))
                else:
                    cursor.execute("UPDATE student_profiles SET name=%s, email=%s, course=%s, semester=%s WHERE user_id=%s", (name, email, course, semester, user_id))
            else:
                cursor.execute("INSERT INTO student_profiles (user_id, name, email, course, semester, image_url) VALUES (%s,%s,%s,%s,%s,%s)", (user_id, name, email, course, semester, image_url))
        except Exception as e:
            # Fallback if image_url column missing or other schema issue: retry without image_url
            msg = str(e)
            print("[PROFILE] Upsert failed, retrying without image_url:", msg)
            if row:
                cursor.execute("UPDATE student_profiles SET name=%s, email=%s, course=%s, semester=%s WHERE user_id=%s", (name, email, course, semester, user_id))
            else:
                cursor.execute("INSERT INTO student_profiles (user_id, name, email, course, semester) VALUES (%s,%s,%s,%s,%s)", (user_id, name, email, course, semester))

        conn.commit()
        return jsonify({"message": "Profile saved"}), 200

    except Exception as e:
        if conn:
            try:
                conn.rollback()
            except Exception:
                pass
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            try:
                cursor.close()
            except Exception:
                pass
        if conn:
            try:
                conn.close()
            except Exception:
                pass


@student_bp.route("/profile/photo", methods=["POST"]) 
@jwt_required()
def upload_profile_image():
    identity = get_jwt_identity()
    user_id = identity.get("id") if isinstance(identity, dict) else identity

    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "Empty filename"}), 400

    filename = secure_filename(file.filename)
    if '.' in filename:
        ext = filename.rsplit('.', 1)[1].lower()
    else:
        ext = ''

    allowed = {'png', 'jpg', 'jpeg', 'webp'}
    if ext not in allowed:
        return jsonify({"error": "Invalid image type"}), 400

    # Save file under backend/static/uploads
    base = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    upload_dir = os.path.join(base, 'static', 'uploads')
    os.makedirs(upload_dir, exist_ok=True)

    out_name = f"profile_{user_id}_{int(time.time())}.{ext}"
    out_path = os.path.join(upload_dir, out_name)
    file.save(out_path)

    # Build absolute URL
    host = request.host_url.rstrip('/')
    image_url = f"{host}/static/uploads/{out_name}"

    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        # Ensure columns exist at runtime
        _ensure_profile_columns(cursor)

        cursor.execute("SELECT id FROM student_profiles WHERE user_id=%s LIMIT 1", (user_id,))
        row = cursor.fetchone()
        try:
            if row:
                cursor.execute("UPDATE student_profiles SET image_url=%s WHERE user_id=%s", (image_url, user_id))
            else:
                # fallback: try to take name/email from users table
                cursor.execute("SELECT name, email FROM users WHERE id=%s LIMIT 1", (user_id,))
                u = cursor.fetchone()
                name = u[0] if u else ''
                email = u[1] if u else ''
                cursor.execute("INSERT INTO student_profiles (user_id, name, email, image_url) VALUES (%s,%s,%s,%s)", (user_id, name, email, image_url))
        except Exception as e:
            # If image_url column still missing, log and ensure a profile row exists (without image)
            msg = str(e)
            print("[PROFILE IMAGE] DB update failed, will ensure profile row exists without image_url:", msg)
            if not row:
                cursor.execute("SELECT name, email FROM users WHERE id=%s LIMIT 1", (user_id,))
                u = cursor.fetchone()
                name = u[0] if u else ''
                email = u[1] if u else ''
                cursor.execute("INSERT INTO student_profiles (user_id, name, email) VALUES (%s,%s,%s)", (user_id, name, email))

        conn.commit()
        return jsonify({"message": "Image uploaded", "image_url": image_url}), 200

    except Exception as e:
        if conn:
            try:
                conn.rollback()
            except Exception:
                pass
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            try:
                cursor.close()
            except Exception:
                pass
        if conn:
            try:
                conn.close()
            except Exception:
                pass
