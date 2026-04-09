/**
 * ResultPage.js — Step 4 + Step 6
 * Shows prediction result with confidence score, SHAP feature importance chart,
 * and AlertBanner + email notification for High Risk.
 */
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import AlertBanner from "../components/AlertBanner";
import RiskBadge from "../components/RiskBadge";
import { sendEmailAlert } from "../api/api";

const RISK_COLOR = { "Low Risk": "#10b981", "Medium Risk": "#f59e0b", "High Risk": "#ef4444", "No Risk": "#10b981" };

const FEATURE_LABELS = {
  attendance: "Attendance",
  study_hours: "Study Hours",
  previous_marks: "Previous Marks",
  assignment_score: "Assignment Score",
  internal_marks: "Internal Marks",
};

export default function ResultPage() {
  const { state } = useLocation();
  const nav = useNavigate();
  const result = state?.result;

  const [emailSent, setEmailSent] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMsg, setEmailMsg] = useState("");
  const [alertShown, setAlertShown] = useState(true);

  useEffect(() => {
    if (!result) nav("/predict");
  }, [result, nav]);

  if (!result) return null;

  const {
    name, email, predicted_score, risk_level, confidence,
    feature_importance, model_name,
    attendance, study_hours, previous_marks, assignment_score, internal_marks,
  } = result;

  const overrideApplied = result.override_applied === true;

  const riskColor = RISK_COLOR[risk_level] || "#4f6ef7";
  const confPct = confidence != null ? Math.round(confidence * 100) : null;

  // SHAP bar chart data
  const shapData = feature_importance
    ? Object.entries(feature_importance)
      .map(([key, val]) => ({ name: FEATURE_LABELS[key] || key, value: parseFloat(val) }))
      .sort((a, b) => b.value - a.value)
    : [];

  // Send email alert
  const handleEmailAlert = async () => {
    setEmailLoading(true); setEmailMsg("");
    try {
      await sendEmailAlert({ to_email: email, name, risk_level, score: Math.round(predicted_score) });
      setEmailSent(true);
      setEmailMsg("✅ Alert email sent successfully!");
    } catch (err) {
      setEmailMsg(err.response?.data?.error || "Email failed. Check backend MAIL_USER/MAIL_PASS config.");
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 750, margin: "0 auto", padding: "2.5rem 1.5rem" }}>

      {/* Step 6: High Risk AlertBanner */}
      {alertShown && (
        <AlertBanner
          riskLevel={risk_level} score={predicted_score} name={name}
          onDismiss={() => setAlertShown(false)}
        />
      )}

      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "1.9rem", fontWeight: 700, color: "#f1f5f9", marginBottom: 4 }}>
          Prediction Result
        </h1>
        <p style={{ color: "#64748b", fontSize: "0.88rem" }}>
          {name} · {email} · <span style={{ color: "#475569", fontSize: "0.78rem" }}>{model_name}</span>
        </p>
      </div>

      {/* Score + Risk card */}
      <div style={{
        background: `linear-gradient(135deg, ${riskColor}18, ${riskColor}06)`,
        border: `1px solid ${riskColor}40`,
        borderRadius: 20, padding: "2rem", marginBottom: "1.5rem",
        textAlign: "center",
      }}>
        <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#64748b", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
          Predicted Academic Score
        </div>
        <div style={{ fontSize: "4.5rem", fontWeight: 900, color: riskColor, lineHeight: 1, marginBottom: "0.6rem" }}>
          {Math.round(predicted_score)}
          <span style={{ fontSize: "1.2rem", fontWeight: 400, color: "#475569" }}>/100</span>
        </div>
          <RiskBadge level={risk_level} large />

          {overrideApplied && (
            <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <span style={{ background: "rgba(16,185,129,0.12)", color: "#10b981", border: "1px solid rgba(16,185,129,0.25)", padding: "0.45rem 0.8rem", borderRadius: 10, fontWeight: 700 }}>
                ✅ No Risk (Strong Academic Performance)
              </span>
            </div>
          )}

        {/* Confidence score */}
        {confPct != null && (
          <div style={{ marginTop: "1.2rem" }}>
            <p style={{ color: "#64748b", fontSize: "0.78rem", marginBottom: "0.4rem" }}>
              Model Confidence
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", justifyContent: "center" }}>
              <div style={{ flex: "0 0 160px", height: 8, background: "rgba(255,255,255,0.08)", borderRadius: 99, overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 99,
                  width: `${confPct}%`,
                  background: `linear-gradient(90deg, ${riskColor}, ${riskColor}99)`,
                  transition: "width 1s ease",
                }} />
              </div>
              <span style={{ color: riskColor, fontWeight: 700, fontSize: "1rem" }}>{confPct}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Input summary */}
      <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "1.25rem", marginBottom: "1.5rem" }}>
        <h3 style={{ fontWeight: 600, color: "#e2e8f0", fontSize: "0.9rem", marginBottom: "0.8rem" }}>📋 Input Summary</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: "0.6rem" }}>
          {[
            ["📅 Attendance", `${attendance}%`],
            ["📖 Study Hours", `${study_hours}h/day`],
            ["📝 Prev. Marks", previous_marks],
            ["📋 Assignment", assignment_score],
            ["🧪 Internal", internal_marks],
          ].map(([label, val]) => (
            <div key={label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "0.6rem 0.8rem" }}>
              <p style={{ margin: 0, fontSize: "0.72rem", color: "#64748b" }}>{label}</p>
              <p style={{ margin: "2px 0 0", fontSize: "1rem", fontWeight: 700, color: "#e2e8f0" }}>{val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Step 4: SHAP Feature Importance */}
      {shapData.length > 0 && (
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "1.25rem", marginBottom: "1.5rem" }}>
          <h3 style={{ fontWeight: 600, color: "#e2e8f0", fontSize: "0.9rem", marginBottom: "0.8rem" }}>
            🧠 Feature Importance (SHAP)
          </h3>
          <p style={{ color: "#64748b", fontSize: "0.78rem", marginBottom: "0.8rem" }}>
            Factors that most influenced this prediction
          </p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={shapData} layout="vertical" margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={v => `${(v * 100).toFixed(1)}%`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} width={110} />
              <Tooltip formatter={v => `${(v * 100).toFixed(2)}%`} contentStyle={{ background: "#1e2235", border: "1px solid rgba(79,110,247,0.3)", borderRadius: 8 }} labelStyle={{ color: "#94a3b8" }} itemStyle={{ color: "#7c9ef7" }} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={14}>
                {shapData.map((entry, i) => (
                  <Cell key={i} fill={`hsl(${220 + i * 20},70%,${65 - i * 5}%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Why this prediction + Recommendations */}
      {result.explanation && (
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "1.25rem", marginBottom: "1.5rem" }}>
          <h3 style={{ fontWeight: 600, color: "#e2e8f0", fontSize: "0.9rem", marginBottom: "0.6rem" }}>🔎 Why this prediction</h3>
          <p style={{ color: "#94a3b8", marginBottom: 8 }}>Top contributing factors:</p>
          <ol>
            {(result.explanation.top_reasons || []).map((r, i) => <li key={i}>{r}</li>)}
          </ol>

          {(result.explanation.improvements || []).length > 0 && (
            <div style={{ marginTop: 8 }}>
              <h4 style={{ margin: "8px 0", color: "#e2f7ea", fontSize: "0.9rem" }}>✅ Positive note</h4>
              <ul>
                {(result.explanation.improvements || []).map((m, i) => <li key={i}>{m}</li>)}
              </ul>
            </div>
          )}

          <h3 style={{ fontWeight: 600, color: "#e2e8f0", fontSize: "0.9rem", marginTop: 12, marginBottom: 8 }}>💡 Personalized recommendations</h3>
          <ul>
            {(result.recommendations?.study_plan || []).map((s, i) => <li key={i}>{s}</li>)}
          </ul>
          {result.recommendations?.weekly_target && <p style={{ color: "#94a3b8" }}><strong>Weekly target:</strong> {result.recommendations.weekly_target}</p>}
        </div>
      )}

      {/* Step 6: Email Alert button */}
      {risk_level === "High Risk" && (
        <div style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 16, padding: "1.25rem", marginBottom: "1.5rem" }}>
          <h3 style={{ fontWeight: 600, color: "#ef4444", fontSize: "0.9rem", marginBottom: "0.5rem" }}>
            📧 Send Email Alert
          </h3>
          <p style={{ color: "#94a3b8", fontSize: "0.82rem", marginBottom: "0.9rem" }}>
            Send a high-risk warning email to <strong>{email}</strong>
          </p>
          <button
            onClick={handleEmailAlert}
            disabled={emailSent || emailLoading}
            style={{
              background: emailSent ? "rgba(16,185,129,0.2)" : emailLoading ? "rgba(79,110,247,0.3)" : "rgba(239,68,68,0.15)",
              border: `1px solid ${emailSent ? "rgba(16,185,129,0.4)" : "rgba(239,68,68,0.35)"}`,
              borderRadius: 10, color: emailSent ? "#10b981" : "#f87171",
              padding: "0.65rem 1.2rem", fontSize: "0.88rem", fontWeight: 600,
              cursor: emailSent || emailLoading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
            }}
          >
            {emailLoading ? "⏳ Sending…" : emailSent ? "✅ Email Sent!" : "📧 Send Alert Email"}
          </button>
          {emailMsg && (
            <p style={{ marginTop: "0.6rem", fontSize: "0.8rem", color: emailSent ? "#10b981" : "#f87171" }}>
              {emailMsg}
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <button onClick={() => nav("/predict")} style={{
          flex: 1, minWidth: 140, padding: "0.8rem",
          background: "linear-gradient(135deg,#4f6ef7,#7c3aed)",
          color: "#fff", border: "none", borderRadius: 12, fontSize: "0.9rem", fontWeight: 600,
          cursor: "pointer", boxShadow: "0 4px 16px rgba(79,110,247,0.3)",
        }}>
          🔄 New Prediction
        </button>
        <button onClick={() => nav("/dashboard")} style={{
          flex: 1, minWidth: 140, padding: "0.8rem",
          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
          color: "#94a3b8", borderRadius: 12, fontSize: "0.9rem", fontWeight: 600, cursor: "pointer",
        }}>
          📊 Dashboard
        </button>
        <button onClick={() => nav("/history")} style={{
          flex: 1, minWidth: 140, padding: "0.8rem",
          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
          color: "#94a3b8", borderRadius: 12, fontSize: "0.9rem", fontWeight: 600, cursor: "pointer",
        }}>
          📋 My History
        </button>
      </div>
    </div>
  );
}
