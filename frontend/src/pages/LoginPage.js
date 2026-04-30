import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { validateLoginForm } from "../utils/validateAuth";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [apiErr, setApiErr] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setErrors(p => ({ ...p, [e.target.name]: "" }));
    setApiErr("");
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validateLoginForm(form);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const { data } = await loginUser({
        email: form.email,
        password: form.password
      });

      // 🔥 FIXED: api.js handles storage, we just update context
      login(data.access_token, data.user);

      // Redirect based on role
      if (data.user.role === "admin") {
        nav("/admin");
      } else {
        nav("/");
      }

    } catch (err) {
      setApiErr(err.response?.data?.error || "Invalid credentials. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1rem" }}>
      <div style={{
        width: "100%", maxWidth: 420,
        background: "var(--panel-bg)",
        border: "1px solid var(--border-color)",
        borderRadius: 20, padding: "2.5rem",
        boxShadow: "var(--card-shadow)",
      }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🔐</div>
          <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "1.7rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
            Welcome Back
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.88rem", marginTop: 6 }}>
            Sign in to your EduRisk account
          </p>
        </div>

        {apiErr && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "0.8rem 1rem", marginBottom: "1.2rem", color: "#f87171", fontSize: "0.88rem" }}>
            ⚠ {apiErr}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {[
            { name: "email", label: "✉️ Email", type: "email", placeholder: "you@example.com" },
            { name: "password", label: "🔒 Password", type: "password", placeholder: "••••••••" },
          ].map(f => (
            <div key={f.name}>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#94a3b8", marginBottom: 5, letterSpacing: "0.04em" }}>
                {f.label}
              </label>
              <input
                name={f.name} type={f.type} placeholder={f.placeholder}
                value={form[f.name]} onChange={handleChange}
                autoComplete={f.name === "password" ? "current-password" : "email"}
                style={{
                  width: "100%", padding: "0.75rem 1rem",
                  background: errors[f.name] ? "rgba(239,68,68,0.07)" : "var(--bg-color)",
                  border: `1px solid ${errors[f.name] ? "rgba(239,68,68,0.5)" : "var(--border-color)"}`,
                  borderRadius: 10, color: "var(--text-primary)", fontSize: "0.95rem", outline: "none",
                  boxSizing: "border-box", transition: "border-color 0.2s",
                }}
              />
              {errors[f.name] && <span style={{ fontSize: "0.75rem", color: "#f87171", marginTop: 4, display: "block" }}>{errors[f.name]}</span>}
            </div>
          ))}

          <button type="submit" disabled={loading} style={{
            marginTop: "0.4rem",
            background: loading ? "#ccc" : "linear-gradient(135deg,#4f6ef7,#7c3aed)",
            color: "#fff", border: "none", borderRadius: 12, padding: "0.9rem",
            fontSize: "1rem", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer"
          }}>
            {loading ? "⏳ Signing in…" : "🔐 Sign In"}
          </button>
        </form>

        <p style={{ textAlign: "center", color: "#64748b", fontSize: "0.85rem", marginTop: "1.5rem" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "#7c9ef7", textDecoration: "none", fontWeight: 600 }}>
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

