import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPrevious } from "../api/api";
import RiskBadge from "../components/RiskBadge";

const DataRow = ({ label, value }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      padding: "0.6rem 0",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
    }}
  >
    <span style={{ color: "#64748b", fontSize: "0.875rem" }}>{label}</span>
    <span style={{ color: "#e2e8f0", fontWeight: 600, fontSize: "0.875rem" }}>
      {value}
    </span>
  </div>
);

export default function PreviousPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const nav = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Both name and email are required.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const { data } = await getPrevious({
        name: name.trim(),
        email: email.trim(),
      });
      setResult(data);
    } catch (err) {
      if (!err.response) {
        setApiErr(
          "Unable to connect to server. Please check if backend is running.",
        );
        return;
      }

      if (err.response.status === 404) {
        setApiErr("No prediction found for this student.");
        return;
      }

      setApiErr("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 620, margin: "0 auto", padding: "2.5rem 1.5rem" }}>
      <h1
        style={{
          fontFamily: "'Space Grotesk',sans-serif",
          fontSize: "1.9rem",
          fontWeight: 700,
          color: "#f1f5f9",
          marginBottom: 6,
        }}
      >
        My Previous Result
      </h1>
      <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "2rem" }}>
        Enter your name and email to retrieve the most recent stored prediction.
      </p>

      <form
        onSubmit={handleSearch}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        {[
          {
            label: "Full Name",
            val: name,
            set: setName,
            type: "text",
            ph: "Your registered name",
          },
          {
            label: "Email",
            val: email,
            set: setEmail,
            type: "email",
            ph: "Your registered email",
          },
        ].map((f) => (
          <div key={f.label}>
            <label
              style={{
                display: "block",
                fontSize: "0.82rem",
                fontWeight: 600,
                color: "#94a3b8",
                marginBottom: 6,
              }}
            >
              {f.label}
            </label>
            <input
              type={f.type}
              value={f.val}
              placeholder={f.ph}
              onChange={(e) => {
                f.set(e.target.value);
                setError("");
              }}
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10,
                color: "#f1f5f9",
                fontSize: "0.95rem",
                outline: "none",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#4f6ef7")}
              onBlur={(e) =>
                (e.target.style.borderColor = "rgba(255,255,255,0.1)")
              }
            />
          </div>
        ))}

        {error && (
          <div
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 10,
              padding: "0.8rem 1rem",
              color: "#f87171",
              fontSize: "0.875rem",
            }}
          >
            ⚠ {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            background: loading
              ? "rgba(79,110,247,0.4)"
              : "linear-gradient(135deg,#4f6ef7,#7c3aed)",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            padding: "0.85rem",
            fontSize: "1rem",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "🔍 Searching…" : "🔍 Find My Result"}
        </button>
      </form>

      {result && (
        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 18,
            padding: "1.8rem",
            animation: "fadeIn 0.4s ease",
          }}
        >
          <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.2rem",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <div>
              <h3
                style={{
                  fontWeight: 700,
                  color: "#f1f5f9",
                  fontSize: "1.1rem",
                }}
              >
                {result.name}
              </h3>
              <p style={{ color: "#64748b", fontSize: "0.82rem" }}>
                {result.email}
              </p>
            </div>
            <RiskBadge level={result.risk_level} />
          </div>

          <div
            style={{
              display: "flex",
              gap: "1rem",
              marginBottom: "1.2rem",
              padding: "1rem",
              background: "rgba(79,110,247,0.08)",
              borderRadius: 12,
              border: "1px solid rgba(79,110,247,0.2)",
            }}
          >
            <div style={{ textAlign: "center", flex: 1 }}>
              <div
                style={{ fontSize: "2rem", fontWeight: 800, color: "#4f6ef7" }}
              >
                {Math.round(result.predicted_score)}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                Predicted Score
              </div>
            </div>
            <div style={{ width: 1, background: "rgba(255,255,255,0.08)" }} />
            <div
              style={{
                textAlign: "center",
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <RiskBadge level={result.risk_level} />
              <div
                style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 6 }}
              >
                Risk Level
              </div>
            </div>
          </div>

          <DataRow label="Attendance" value={`${result.attendance}%`} />
          <DataRow
            label="Study Hours/Day"
            value={`${result.study_hours} hrs`}
          />
          <DataRow label="Previous Marks" value={result.previous_marks} />
          <DataRow label="Assignment Score" value={result.assignment_score} />
          <DataRow label="Internal Marks" value={result.internal_marks} />
          <DataRow
            label="Recorded At"
            value={new Date(result.created_at).toLocaleString()}
          />

          <button
            onClick={() => nav("/dashboard", { state: { result } })}
            style={{
              marginTop: "1.2rem",
              width: "100%",
              background: "rgba(79,110,247,0.15)",
              color: "#7c9ef7",
              border: "1px solid rgba(79,110,247,0.3)",
              borderRadius: 10,
              padding: "0.75rem",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            📊 View on Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
