/**
 * ResultPage.js — Explainable AI Result Page
 *
 * Sections:
 *  1. Score + Risk Level (with severity badge)
 *  2. Input Summary
 *  3. Why This Prediction (narrative bullets)
 *  4. Impact Analysis (colour-coded badges)
 *  5. Smart Recommendations
 *  6. What-If Projection
 *  7. SHAP Feature Importance chart
 *  8. Email Alert (High Risk only)
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

// ─── Colour palette ───────────────────────────────────────────────────────────
const RISK_COLOR = {
  "No Risk":     "#10b981",
  "Low Risk":    "#22d3ee",
  "Medium Risk": "#f59e0b",
  "High Risk":   "#ef4444",
};

const SEVERITY_COLOR = {
  Safe:     "#10b981",
  Stable:   "#22d3ee",
  Moderate: "#f59e0b",
  Critical: "#ef4444",
};

const IMPACT_STYLES = {
  high:     { bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.35)",   color: "#f87171", dot: "#ef4444" },
  medium:   { bg: "rgba(249,115,22,0.12)",  border: "rgba(249,115,22,0.35)",  color: "#fb923c", dot: "#f97316" },
  low:      { bg: "rgba(234,179,8,0.12)",   border: "rgba(234,179,8,0.35)",   color: "#facc15", dot: "#eab308" },
  positive: { bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.35)", color: "#34d399", dot: "#10b981" },
};

const FEATURE_LABELS = {
  attendance:   "Attendance",
  study_hours:  "Study Hours",
  prev_marks:   "Previous Marks",
  assignment:   "Assignment Score",
  internal:     "Internal Marks",
  previous_marks:   "Previous Marks",
  assignment_score: "Assignment Score",
  internal_marks:   "Internal Marks",
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function SectionCard({ title, children, accentColor }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: `1px solid ${accentColor || "rgba(255,255,255,0.08)"}`,
      borderRadius: 18,
      padding: "1.4rem 1.5rem",
      marginBottom: "1.5rem",
    }}>
      <h3 style={{ fontWeight: 700, color: "#e2e8f0", fontSize: "0.95rem", marginBottom: "1rem", marginTop: 0 }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function ImpactBadge({ level, text }) {
  const s = IMPACT_STYLES[level] || IMPACT_STYLES.low;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: s.bg, border: `1px solid ${s.border}`,
      color: s.color, borderRadius: 8,
      padding: "0.2rem 0.6rem", fontSize: "0.72rem", fontWeight: 700,
    }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
      {text}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ResultPage() {
  const { state } = useLocation();
  const nav = useNavigate();
  const result = state?.result;

  const [emailSent, setEmailSent]       = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMsg, setEmailMsg]         = useState("");
  const [alertShown, setAlertShown]     = useState(true);

  useEffect(() => { if (!result) nav("/predict"); }, [result, nav]);
  if (!result) return null;

  const {
    name, email, predicted_score, risk_level, risk_severity, confidence,
    feature_importance, explanation,
    attendance, study_hours, previous_marks, assignment_score, internal_marks,
  } = result;

  const riskColor   = RISK_COLOR[risk_level] || "#4f6ef7";
  const sevColor    = SEVERITY_COLOR[risk_severity] || riskColor;
  const confPct     = confidence != null ? Math.round(confidence * 100) : null;

  // Narrative bullets from XAI engine
  const narrative       = explanation?.narrative       || [];
  const impactAnalysis  = explanation?.impact_analysis || [];
  const recommendations = explanation?.recommendations || [];
  const whatIf          = explanation?.what_if;

  // SHAP bar chart
  const shapData = feature_importance
    ? Object.entries(feature_importance)
        .map(([key, val]) => ({ name: FEATURE_LABELS[key] || key, value: parseFloat(val) }))
        .sort((a, b) => b.value - a.value)
    : [];

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
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "2.5rem 1.5rem" }}>

      {/* Alert Banner */}
      {alertShown && (
        <AlertBanner riskLevel={risk_level} score={predicted_score} name={name} onDismiss={() => setAlertShown(false)} />
      )}

      {/* ── Page Header ───────────────────────────────────────────────── */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "1.9rem", fontWeight: 700, color: "#f1f5f9", marginBottom: 4 }}>
          Prediction Result
        </h1>
        <p style={{ color: "#64748b", fontSize: "0.88rem", margin: 0 }}>
          {name} · {email}
        </p>
      </div>

      {/* ── Score + Risk ──────────────────────────────────────────────── */}
      <div style={{
        background: `linear-gradient(135deg, ${riskColor}1a, ${riskColor}08)`,
        border: `1px solid ${riskColor}40`,
        borderRadius: 22, padding: "2.2rem", marginBottom: "1.5rem",
        textAlign: "center",
      }}>
        <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
          Predicted Academic Score
        </div>
        <div style={{ fontSize: "5rem", fontWeight: 900, color: riskColor, lineHeight: 1, marginBottom: "0.6rem" }}>
          {Math.round(predicted_score)}
          <span style={{ fontSize: "1.2rem", fontWeight: 400, color: "#475569" }}>/100</span>
        </div>

        {/* Risk Level + Severity */}
        <div style={{ display: "flex", gap: "0.6rem", justifyContent: "center", alignItems: "center", flexWrap: "wrap", marginBottom: "1rem" }}>
          <RiskBadge level={risk_level} large />
          {risk_severity && (
            <span style={{
              background: `${sevColor}22`, border: `1px solid ${sevColor}55`,
              color: sevColor, borderRadius: 10, padding: "0.3rem 0.8rem",
              fontWeight: 700, fontSize: "0.82rem",
            }}>
              {risk_severity}
            </span>
          )}
        </div>

        {/* Confidence */}
        {confPct != null && (
          <div>
            <p style={{ color: "#64748b", fontSize: "0.75rem", marginBottom: "0.4rem" }}>Model Confidence</p>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", justifyContent: "center" }}>
              <div style={{ flex: "0 0 180px", height: 8, background: "rgba(255,255,255,0.08)", borderRadius: 99, overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 99,
                  width: `${confPct}%`,
                  background: `linear-gradient(90deg, ${riskColor}, ${riskColor}99)`,
                  transition: "width 1.2s ease",
                }} />
              </div>
              <span style={{ color: riskColor, fontWeight: 700, fontSize: "1rem" }}>{confPct}%</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Input Summary ─────────────────────────────────────────────── */}
      <SectionCard title="📋 Input Summary">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: "0.6rem" }}>
          {[
            ["📅 Attendance",   `${attendance}%`],
            ["📖 Study Hours",  `${study_hours}h/day`],
            ["📝 Prev. Marks",  previous_marks],
            ["📋 Assignment",   assignment_score],
            ["🧪 Internal",     internal_marks],
          ].map(([label, val]) => (
            <div key={label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "0.65rem 0.9rem" }}>
              <p style={{ margin: 0, fontSize: "0.7rem", color: "#64748b" }}>{label}</p>
              <p style={{ margin: "3px 0 0", fontSize: "1.05rem", fontWeight: 700, color: "#e2e8f0" }}>{val}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── Why This Prediction ───────────────────────────────────────── */}
      {narrative.length > 0 && (
        <SectionCard title="🔎 Why This Prediction" accentColor={`${riskColor}30`}>
          <p style={{ color: "#64748b", fontSize: "0.8rem", marginBottom: "0.9rem", marginTop: 0 }}>
            Factors that determined this academic risk score:
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {narrative.map((item, i) => {
              const s = IMPACT_STYLES[item.impact] || IMPACT_STYLES.low;
              return (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: "0.75rem",
                  background: s.bg, border: `1px solid ${s.border}`,
                  borderRadius: 12, padding: "0.7rem 1rem",
                }}>
                  <span style={{ fontSize: "1.1rem", lineHeight: 1, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
                  <span style={{ color: "#e2e8f0", fontSize: "0.875rem", lineHeight: 1.5 }}>{item.text}</span>
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}

      {/* ── Impact Analysis ───────────────────────────────────────────── */}
      {impactAnalysis.length > 0 && (
        <SectionCard title="📊 Impact Analysis">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "0.65rem" }}>
            {impactAnalysis.map((item, i) => {
              const s = IMPACT_STYLES[item.impact_level] || IMPACT_STYLES.low;
              return (
                <div key={i} style={{
                  background: s.bg, border: `1px solid ${s.border}`,
                  borderRadius: 12, padding: "0.75rem 1rem",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <div>
                    <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginBottom: 2 }}>{item.label}</div>
                    <div style={{ fontSize: "1rem", fontWeight: 700, color: "#f1f5f9" }}>{item.value}</div>
                  </div>
                  <ImpactBadge level={item.impact_level} text={item.badge} />
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}

      {/* ── Smart Recommendations ─────────────────────────────────────── */}
      {recommendations.length > 0 && (
        <SectionCard title="💡 Smart Recommendations">
          <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
            {recommendations.map((rec, i) => (
              <div key={i} style={{
                display: "flex", gap: "0.75rem", alignItems: "flex-start",
                background: "rgba(79,110,247,0.08)", border: "1px solid rgba(79,110,247,0.2)",
                borderRadius: 12, padding: "0.7rem 1rem",
              }}>
                <span style={{
                  flexShrink: 0, width: 22, height: 22,
                  background: "linear-gradient(135deg,#4f6ef7,#7c3aed)",
                  borderRadius: "50%", color: "#fff",
                  fontSize: "0.7rem", fontWeight: 800,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {i + 1}
                </span>
                <span style={{ color: "#e2e8f0", fontSize: "0.875rem", lineHeight: 1.5 }}>{rec}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* ── What-If Projection ────────────────────────────────────────── */}
      {whatIf && whatIf.improved_score > predicted_score && (
        <SectionCard title="🔮 What-If Projection" accentColor="rgba(16,185,129,0.3)">
          <p style={{ color: "#64748b", fontSize: "0.8rem", marginTop: 0, marginBottom: "1rem" }}>
            If you follow the recommendations above, here's your projected outcome:
          </p>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
            {/* Current */}
            <div style={{
              flex: 1, minWidth: 140, textAlign: "center",
              background: `${riskColor}15`, border: `1px solid ${riskColor}40`,
              borderRadius: 14, padding: "1rem",
            }}>
              <div style={{ fontSize: "0.7rem", color: "#64748b", marginBottom: 4 }}>CURRENT</div>
              <div style={{ fontSize: "2.2rem", fontWeight: 900, color: riskColor }}>{Math.round(predicted_score)}</div>
              <div style={{ fontSize: "0.78rem", color: riskColor, fontWeight: 600 }}>{risk_level}</div>
            </div>

            {/* Arrow */}
            <div style={{ display: "flex", alignItems: "center", fontSize: "1.5rem", color: "#475569" }}>→</div>

            {/* Improved */}
            <div style={{
              flex: 1, minWidth: 140, textAlign: "center",
              background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.35)",
              borderRadius: 14, padding: "1rem",
            }}>
              <div style={{ fontSize: "0.7rem", color: "#64748b", marginBottom: 4 }}>PROJECTED</div>
              <div style={{ fontSize: "2.2rem", fontWeight: 900, color: "#10b981" }}>{Math.round(whatIf.improved_score)}</div>
              <div style={{ fontSize: "0.78rem", color: "#10b981", fontWeight: 600 }}>{whatIf.improved_risk}</div>
              <div style={{ fontSize: "0.68rem", color: "#34d399", marginTop: 2 }}>{whatIf.improved_severity}</div>
            </div>
          </div>

          {/* Improvements list */}
          {(whatIf.improvements_applied || []).length > 0 && (
            <div>
              <p style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.4rem" }}>Changes applied in simulation:</p>
              {whatIf.improvements_applied.map((imp, i) => (
                <div key={i} style={{ fontSize: "0.8rem", color: "#94a3b8", padding: "2px 0" }}>
                  ✔ {imp}
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      )}

      {/* ── SHAP Feature Importance ───────────────────────────────────── */}
      {shapData.length > 0 && (
        <SectionCard title="🧠 Feature Importance (SHAP)">
          <p style={{ color: "#64748b", fontSize: "0.78rem", marginTop: 0, marginBottom: "0.8rem" }}>
            Relative contribution of each factor to this prediction
          </p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={shapData} layout="vertical" margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={v => `${(v * 100).toFixed(1)}%`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} width={120} />
              <Tooltip
                formatter={v => `${(v * 100).toFixed(2)}%`}
                contentStyle={{ background: "#1e2235", border: "1px solid rgba(79,110,247,0.3)", borderRadius: 8 }}
                labelStyle={{ color: "#94a3b8" }}
                itemStyle={{ color: "#7c9ef7" }}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={14}>
                {shapData.map((_, i) => (
                  <Cell key={i} fill={`hsl(${220 + i * 22},70%,${65 - i * 5}%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      )}

      {/* ── Email Alert (High Risk only) ──────────────────────────────── */}
      {risk_level === "High Risk" && (
        <SectionCard title="📧 Send Email Alert" accentColor="rgba(239,68,68,0.25)">
          <p style={{ color: "#94a3b8", fontSize: "0.82rem", marginTop: 0, marginBottom: "0.9rem" }}>
            Send a high-risk warning email to <strong>{email}</strong>
          </p>
          <button
            onClick={handleEmailAlert}
            disabled={emailSent || emailLoading}
            style={{
              background: emailSent ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.15)",
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
            <p style={{ marginTop: "0.6rem", fontSize: "0.8rem", color: emailSent ? "#10b981" : "#f87171" }}>{emailMsg}</p>
          )}
        </SectionCard>
      )}

      {/* ── Actions ───────────────────────────────────────────────────── */}
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
