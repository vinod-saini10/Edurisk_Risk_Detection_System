import React from "react";

const config = {
  "Low Risk":    { bg: "rgba(16,185,129,0.15)", color: "#10b981", border: "rgba(16,185,129,0.4)"  },
  "No Risk":     { bg: "rgba(16,185,129,0.15)", color: "#10b981", border: "rgba(16,185,129,0.4)"  },
  "Medium Risk": { bg: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "rgba(245,158,11,0.4)"  },
  "High Risk":   { bg: "rgba(239,68,68,0.15)",  color: "#ef4444", border: "rgba(239,68,68,0.4)"   },
};

export default function RiskBadge({ level, size = "md" }) {
  const c = config[level] || config["High Risk"];
  const pad = size === "lg" ? "0.6rem 1.4rem" : "0.3rem 0.8rem";
  const fs  = size === "lg" ? "1rem" : "0.8rem";
  return (
    <span style={{
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
      borderRadius: 999, padding: pad, fontSize: fs,
      fontWeight: 600, letterSpacing: "0.03em", display: "inline-block",
    }}>
      {level}
    </span>
  );
}
