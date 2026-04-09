/**
 * AlertBanner.js — Step 6: High-risk popup notification
 * Animated red alert that auto-closes after 8 seconds.
 */
import React, { useEffect, useState } from "react";

export default function AlertBanner({ riskLevel, score, name, onDismiss }) {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (riskLevel !== "High Risk") return;
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => { setVisible(false); onDismiss && onDismiss(); }, 500);
    }, 8000);
    return () => clearTimeout(timer);
  }, [riskLevel, onDismiss]);

  if (riskLevel !== "High Risk" || !visible) return null;

  const dismiss = () => {
    setFadeOut(true);
    setTimeout(() => { setVisible(false); onDismiss && onDismiss(); }, 400);
  };

  return (
    <div style={{
      position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)",
      zIndex: 9999, width: "min(520px, 92vw)",
      animation: fadeOut
        ? "slideUpOut 0.4s ease forwards"
        : "slideDownIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards",
    }}>
      <style>{`
        @keyframes slideDownIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-30px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes slideUpOut {
          from { opacity: 1; transform: translateX(-50%) translateY(0); }
          to   { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        }
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0 rgba(239,68,68,0.5); }
          70%  { box-shadow: 0 0 0 16px rgba(239,68,68,0); }
          100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
        }
      `}</style>

      <div style={{
        background: "linear-gradient(135deg, rgba(30,10,10,0.98), rgba(45,10,10,0.98))",
        border: "1px solid rgba(239,68,68,0.6)",
        borderRadius: 16,
        padding: "1.25rem 1.5rem",
        backdropFilter: "blur(12px)",
        animation: "pulse-ring 1.5s ease-out 2",
        boxShadow: "0 20px 60px rgba(239,68,68,0.3), 0 8px 24px rgba(0,0,0,0.5)",
      }}>
        {/* Header row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span style={{ fontSize: "1.5rem" }}>⚠️</span>
            <div>
              <p style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#ef4444" }}>
                High Risk Detected!
              </p>
              <p style={{ margin: 0, fontSize: "0.78rem", color: "#f87171" }}>
                {name ? `${name}'s` : "Your"} predicted score: <strong>{Math.round(score)}/100</strong>
              </p>
            </div>
          </div>
          <button onClick={dismiss} style={{
            background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: 8, color: "#f87171", cursor: "pointer", fontSize: "0.8rem",
            padding: "4px 10px", fontWeight: 600, flexShrink: 0,
          }}>✕ Close</button>
        </div>

        {/* Message */}
        <p style={{ margin: "0 0 0.8rem", color: "#fca5a5", fontSize: "0.88rem", lineHeight: 1.5 }}>
          Immediate academic intervention is recommended. Please take action now:
        </p>

        {/* Tips */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem" }}>
          {[
            "📚 Increase study hours",
            "📅 Improve attendance",
            "👩‍🏫 Consult your teacher",
            "📝 Complete assignments",
          ].map(tip => (
            <div key={tip} style={{
              background: "rgba(239,68,68,0.08)", borderRadius: 8,
              padding: "0.4rem 0.65rem", fontSize: "0.78rem", color: "#fca5a5",
            }}>{tip}</div>
          ))}
        </div>

        {/* Progress bar (auto-dismiss timer) */}
        <div style={{ marginTop: "1rem", height: 3, background: "rgba(239,68,68,0.15)", borderRadius: 99 }}>
          <div style={{
            height: "100%", borderRadius: 99,
            background: "linear-gradient(90deg,#ef4444,#f87171)",
            animation: "shrink 8s linear forwards",
          }} />
          <style>{`
            @keyframes shrink {
              from { width: 100%; }
              to   { width: 0%; }
            }
          `}</style>
        </div>
        <p style={{ margin: "4px 0 0", fontSize: "0.7rem", color: "#7f1d1d", textAlign: "right" }}>
          Closes automatically in 8s
        </p>
      </div>
    </div>
  );
}
