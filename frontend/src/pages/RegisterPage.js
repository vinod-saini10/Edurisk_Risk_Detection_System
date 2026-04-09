/**
 * RegisterPage.js — Step 1: JWT Registration
 */
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../api/api";
import { validateRegisterForm } from "../utils/validateAuth";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", role: "student", course: "", semester: "" });
  const [errors, setErrors] = useState({});
  const [apiErr, setApiErr] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const nav = useNavigate();

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setErrors(p => ({ ...p, [e.target.name]: "" }));
    setApiErr("");
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    setFile(f || null);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

const handleSubmit = async (ev) => {
  ev.preventDefault();

  const errs = validateRegisterForm(form);
  if (Object.keys(errs).length) {
    setErrors(errs);
    return;
  }

  setLoading(true);

  try {
    // Build FormData to include optional profile image and profile fields
    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('email', form.email);
    fd.append('password', form.password);
    fd.append('role', form.role);
    fd.append('course', form.course || '');
    fd.append('semester', form.semester || '');
    if (file) fd.append('image', file);

    await registerUser(fd);

    // 🔥 OTP FLOW (ONLY THIS)
    alert("✅ OTP sent to your email");

    nav("/verify-otp", {
      state: { email: form.email }
    });

  } catch (err) {
    setApiErr(err.response?.data?.error || "Registration failed");
  } finally {
    setLoading(false);
  }
};

  const inputStyle = (field) => ({
    width: "100%", padding: "0.75rem 1rem",
    background: errors[field] ? "rgba(239,68,68,0.07)" : "rgba(255,255,255,0.05)",
    border: `1px solid ${errors[field] ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)"}`,
    borderRadius: 10, color: "#f1f5f9", fontSize: "0.95rem", outline: "none",
    boxSizing: "border-box", transition: "border-color 0.2s",
  });

  return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1rem" }}>
      <div style={{
        width: "100%", maxWidth: 440,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20, padding: "2.5rem",
        boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
      }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🎓</div>
          <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "1.7rem", fontWeight: 700, color: "#f1f5f9", margin: 0 }}>
            Create Account
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.88rem", marginTop: 6 }}>
            Join EduRisk and track your academic journey
          </p>
        </div>

        {apiErr && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "0.8rem 1rem", marginBottom: "1.2rem", color: "#f87171", fontSize: "0.88rem" }}>
            ⚠ {apiErr}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Name */}
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#94a3b8", marginBottom: 5 }}>👤 Full Name</label>
            <input name="name" type="text" placeholder="e.g. Vinod Sharma" value={form.name} onChange={handleChange}
              style={inputStyle("name")}
              onFocus={e => e.target.style.borderColor = "#4f6ef7"}
              onBlur={e => e.target.style.borderColor = errors.name ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)"} />
            {errors.name && <span style={{ fontSize: "0.75rem", color: "#f87171", marginTop: 4, display: "block" }}>{errors.name}</span>}
          </div>

          {/* Email */}
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#94a3b8", marginBottom: 5 }}>✉️ Email</label>
            <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange}
              style={inputStyle("email")}
              onFocus={e => e.target.style.borderColor = "#4f6ef7"}
              onBlur={e => e.target.style.borderColor = errors.email ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)"} />
            {errors.email && <span style={{ fontSize: "0.75rem", color: "#f87171", marginTop: 4, display: "block" }}>{errors.email}</span>}
          </div>

          {/* Role */}
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#94a3b8", marginBottom: 5 }}>🎭 Role</label>
            <select name="role" value={form.role} onChange={handleChange} style={{
              ...inputStyle("role"), appearance: "none", cursor: "pointer",
            }}>
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Course + Semester */}
          <div className="grid-2-col">
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#94a3b8", marginBottom: 5 }}>📚 Course</label>
              <input name="course" type="text" placeholder="e.g. BSc Computer Science" value={form.course} onChange={handleChange}
                style={inputStyle("course")} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#94a3b8", marginBottom: 5 }}>📅 Semester</label>
              <input name="semester" type="text" placeholder="e.g. Semester 3" value={form.semester} onChange={handleChange}
                style={inputStyle("semester")} />
            </div>
          </div>

          {/* Profile Image */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: 8, overflow: 'hidden', background: '#0f1724', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {preview ? (
                <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ color: '#94a3b8', fontSize: 12 }}>No image</div>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input type="file" accept="image/*" onChange={handleFileChange} />
              <div style={{ color: '#94a3b8', fontSize: 12 }}>Optional: upload profile image (JPG/PNG)</div>
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#94a3b8", marginBottom: 5 }}>🔒 Password</label>
            <input name="password" type="password" placeholder="Min. 6 characters" value={form.password} onChange={handleChange}
              autoComplete="new-password"
              style={inputStyle("password")}
              onFocus={e => e.target.style.borderColor = "#4f6ef7"}
              onBlur={e => e.target.style.borderColor = errors.password ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)"} />
            {errors.password && <span style={{ fontSize: "0.75rem", color: "#f87171", marginTop: 4, display: "block" }}>{errors.password}</span>}
          </div>

          {/* Confirm Password */}
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#94a3b8", marginBottom: 5 }}>🔒 Confirm Password</label>
            <input name="confirmPassword" type="password" placeholder="Re-enter password" value={form.confirmPassword} onChange={handleChange}
              autoComplete="new-password"
              style={inputStyle("confirmPassword")}
              onFocus={e => e.target.style.borderColor = "#4f6ef7"}
              onBlur={e => e.target.style.borderColor = errors.confirmPassword ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)"} />
            {errors.confirmPassword && <span style={{ fontSize: "0.75rem", color: "#f87171", marginTop: 4, display: "block" }}>{errors.confirmPassword}</span>}
          </div>

          <button type="submit" disabled={loading} style={{
            marginTop: "0.4rem",
            background: loading ? "rgba(79,110,247,0.4)" : "linear-gradient(135deg,#4f6ef7,#7c3aed)",
            color: "#fff", border: "none", borderRadius: 12, padding: "0.9rem",
            fontSize: "1rem", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
            boxShadow: loading ? "none" : "0 4px 20px rgba(79,110,247,0.35)",
            transition: "all 0.2s",
          }}>
            {loading ? "⏳ Creating account…" : "🚀 Create Account"}
          </button>
        </form>

        <p style={{ textAlign: "center", color: "#64748b", fontSize: "0.85rem", marginTop: "1.5rem" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#7c9ef7", textDecoration: "none", fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
