from apiflask import Schema
from apiflask.fields import String, Integer, Boolean, Nested


# =========================
# Register
# =========================
class RegisterSchema(Schema):
    name = String(required=True)
    email = String(required=True)
    password = String(required=True)
    role = String(load_default="student")
    course = String(load_default="")
    semester = String(load_default="")


# =========================
# Verify OTP
# =========================
class VerifyOTPSchema(Schema):
    email = String(required=True)
    otp = String(required=True)


# =========================
# Login
# =========================
class LoginSchema(Schema):
    email = String(required=True)
    password = String(required=True)


# =========================
# User
# =========================
class UserSchema(Schema):
    id = Integer()
    name = String()
    email = String()
    role = String()


# =========================
# Login Response
# =========================
class LoginResponseSchema(Schema):
    access_token = String()
    user = Nested(UserSchema)


# =========================
# Register Response
# =========================
class RegisterResponseSchema(Schema):
    message = String()
    user_id = Integer()
    email_sent = Boolean()


# =========================
# Generic Message
# =========================
class MessageSchema(Schema):
    message = String()


# =========================
# Profile Response
# =========================
class ProfileSchema(Schema):
    id = Integer()
    name = String()
    email = String()
    role = String()
    created_at = String()