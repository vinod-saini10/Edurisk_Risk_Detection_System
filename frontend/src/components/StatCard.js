import React from "react";

export default function StatCard({ label, value, icon, color = "#4f6ef7", sub }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 16, padding: "1.4rem 1.6rem",
      display: "flex", alignItems: "center", gap: "1.2rem",
      transition: "transform 0.2s, box-shadow 0.2s",
    }}
      onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
      onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
    >
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: `${color}22`, border: `1px solid ${color}44`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "1.5rem", flexShrink: 0,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 500, marginBottom: 4 }}>
          {label}
        </div>
        <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#fff", lineHeight: 1 }}>
          {value}
        </div>
        {sub && <div style={{ fontSize: "0.75rem", color: "#475569", marginTop: 4 }}>{sub}</div>}
      </div>
    </div>
  );
}
