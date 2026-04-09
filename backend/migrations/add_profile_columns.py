"""
One-shot migration: ensure `student_profiles` table has `image_url` and `updated_at` columns.

Run from the `backend` folder with the project's Python environment activated:

  python migrations/add_profile_columns.py

This script will create the table (if missing) and add the columns only when absent.
"""
import sys
import traceback
import mysql.connector
from mysql.connector import Error

try:
    # Import DB config from the project (run this script from backend/)
    from database.db_config import DB_CONFIG, DB_NAME
except Exception:
    print("Failed to import DB config. Run this script from the 'backend' folder so 'database' package is importable.")
    raise


def main():
    try:
        cfg = {**DB_CONFIG, "database": DB_NAME}
        print("Connecting to MySQL with DB:", DB_NAME)
        conn = mysql.connector.connect(**cfg)
        cursor = conn.cursor()

        # Ensure table exists (create simple version if not)
        cursor.execute("SHOW TABLES LIKE 'student_profiles'")
        if cursor.fetchone() is None:
            print("Table 'student_profiles' not found — creating minimal table...")
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS student_profiles (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT UNIQUE,
                    name VARCHAR(150),
                    email VARCHAR(255)
                )
            """)
            conn.commit()
            print("Created minimal 'student_profiles' table.")

        # Add image_url if missing
        cursor.execute("SHOW COLUMNS FROM student_profiles LIKE 'image_url'")
        if cursor.fetchone() is None:
            print("Adding column: image_url")
            cursor.execute("ALTER TABLE student_profiles ADD COLUMN image_url VARCHAR(512) NULL")
            conn.commit()
            print("Added 'image_url'.")
        else:
            print("Column 'image_url' already exists.")

        # Add updated_at if missing
        cursor.execute("SHOW COLUMNS FROM student_profiles LIKE 'updated_at'")
        if cursor.fetchone() is None:
            print("Adding column: updated_at")
            cursor.execute("ALTER TABLE student_profiles ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
            conn.commit()
            print("Added 'updated_at'.")
        else:
            print("Column 'updated_at' already exists.")

        cursor.close()
        conn.close()
        print("Migration finished successfully.")

    except Error as e:
        print("MySQL Error:", e)
        traceback.print_exc()
        sys.exit(2)
    except Exception as e:
        print("Unexpected error:", e)
        traceback.print_exc()
        sys.exit(3)


if __name__ == '__main__':
    main()
