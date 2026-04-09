/**
 * Skeleton.js — Step 9: UI/UX (Loading Skeletons)
 */
import React from "react";

export default function Skeleton({ width = "100%", height = "1rem", borderRadius = "8px", margin = "0.5rem 0" }) {
  return (
    <div style={{
      width, height, borderRadius, margin,
      background: "linear-gradient(90deg, var(--panel-bg) 25%, var(--border-color) 50%, var(--panel-bg) 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.5s infinite linear",
    }}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
