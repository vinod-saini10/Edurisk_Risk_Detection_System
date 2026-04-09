import os
import time
import mysql.connector
from mysql.connector import Error

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", "root"),
    "port": int(os.getenv("DB_PORT", "3306")),
}

DB_NAME = os.getenv("DB_NAME", "edurisk_db")


def get_connection():
    return mysql.connector.connect(**{**DB_CONFIG, "database": DB_NAME})


def initialize_database():
    attempts = 0
    conn = None

    while attempts < 10:
        try:
            conn = mysql.connector.connect(**DB_CONFIG)
            break
        except Exception as e:
            attempts += 1
            print(f"[DB] Waiting for MySQL ({attempts}/10): {e}")
            time.sleep(3)

    if conn is None:
        raise Error("Could not connect to MySQL")

    try:
        cursor = conn.cursor()

        # Create DB
        cursor.execute(
            f"CREATE DATABASE IF NOT EXISTS `{DB_NAME}` "
            "CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
        )
        cursor.execute(f"USE `{DB_NAME}`")

        # USERS TABLE
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(150),
                email VARCHAR(255) UNIQUE,
                password_hash VARCHAR(255),
                role ENUM('student','admin') DEFAULT 'student',
                otp VARCHAR(10),
                otp_expiry DATETIME,
                is_verified TINYINT DEFAULT 0
            )
        """)

        # STUDENTS TABLE
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS students (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(150),
                email VARCHAR(255)
            )
        """)

        # PREDICTIONS TABLE
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS predictions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT,
                user_id INT,
                attendance FLOAT,
                study_hours FLOAT,
                previous_marks FLOAT,
                assignment_score FLOAT,
                internal_marks FLOAT,
                predicted_score FLOAT,
                risk_level VARCHAR(20),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # STUDENT PROFILES (optional) — store additional profile info and avatar URL
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS student_profiles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT UNIQUE,
                name VARCHAR(150),
                email VARCHAR(255),
                course VARCHAR(150),
                semester VARCHAR(50),
                image_url VARCHAR(512),
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        """)
        cursor.execute("""
    CREATE TABLE IF NOT EXISTS academic_records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT,
        attendance FLOAT,
        study_hours FLOAT,
        previous_marks FLOAT,
        assignment_score FLOAT,
        internal_marks FLOAT,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    )
""")

        # Lightweight migrations: ensure expected columns exist on older DBs
        try:
            # Check for image_url column
            cursor.execute("SHOW COLUMNS FROM student_profiles LIKE 'image_url'")
            if cursor.fetchone() is None:
                cursor.execute("ALTER TABLE student_profiles ADD COLUMN image_url VARCHAR(512) NULL")
                print("[DB] Added column 'image_url' to student_profiles")

            # Check for updated_at column
            cursor.execute("SHOW COLUMNS FROM student_profiles LIKE 'updated_at'")
            if cursor.fetchone() is None:
                cursor.execute("ALTER TABLE student_profiles ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
                print("[DB] Added column 'updated_at' to student_profiles")
        except Exception as migr_err:
            print(f"[DB MIGRATION] Skipped migration: {migr_err}")

        conn.commit()
        cursor.close()
        conn.close()

        print("[DB] Database initialized successfully")

    except Error as e:
        print(f"[DB ERROR] {e}")
        raise


def get_or_create_student(cursor, name, email):
    cursor.execute(
        "SELECT id FROM students WHERE email=%s AND name=%s",
        (email, name)
    )
    row = cursor.fetchone()

    if row:
        return row[0]

    cursor.execute(
        "INSERT INTO students (name, email) VALUES (%s, %s)",
        (name, email)
    )
    return cursor.lastrowid


def run_profile_migrations():
    """Safely ensure student_profiles table and expected columns exist.
    This is a non-fatal helper intended to be called at app startup.
    """
    try:
        conn = mysql.connector.connect(**{**DB_CONFIG, "database": DB_NAME})
        cursor = conn.cursor()

        # Ensure table exists
        cursor.execute("SHOW TABLES LIKE 'student_profiles'")
        if cursor.fetchone() is None:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS student_profiles (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT UNIQUE,
                    name VARCHAR(150),
                    email VARCHAR(255),
                    course VARCHAR(150),
                    semester VARCHAR(50),
                    image_url VARCHAR(512),
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            """)
            conn.commit()

        # Add image_url if missing
        cursor.execute("SHOW COLUMNS FROM student_profiles LIKE 'image_url'")
        if cursor.fetchone() is None:
            cursor.execute("ALTER TABLE student_profiles ADD COLUMN image_url VARCHAR(512) NULL")
            conn.commit()

        # Add updated_at if missing
        cursor.execute("SHOW COLUMNS FROM student_profiles LIKE 'updated_at'")
        if cursor.fetchone() is None:
            cursor.execute("ALTER TABLE student_profiles ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
            conn.commit()

        cursor.close()
        conn.close()
        print("[DB MIGRATION] Profile migrations applied")
    except Exception as e:
        print("[DB MIGRATION] Skipped or failed:", e)