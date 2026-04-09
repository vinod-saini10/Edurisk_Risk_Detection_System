import React from "react";

export default function Loader({ text = "Loading data..." }) {
  return (
    <div style={{ 
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", 
      gap: "1.5rem", padding: "4rem 2rem", width: "100%" 
    }}>
      <div style={{ position: "relative", width: 60, height: 60 }}>
        {/* Outer Ring */}
        <div style={{
          position: "absolute", inset: 0,
          border: "4px solid var(--panel-bg)",
          borderRadius: "50%",
        }} />
        {/* Animated Ring */}
        <div style={{
          position: "absolute", inset: 0,
          border: "4px solid transparent",
          borderTopColor: "var(--accent-color)",
          borderRadius: "50%",
          animation: "spin 1s cubic-bezier(0.5, 0.1, 0.5, 0.9) infinite",
          boxShadow: "0 0 10px rgba(79, 110, 247, 0.2)",
        }} />
      </div>
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
      <div style={{ textAlign: "center" }}>
        <p style={{ 
          color: "var(--text-primary)", fontSize: "1.1rem", fontWeight: 700, margin: 0,
          fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.02em"
        }}>
          {text}
        </p>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.75rem", marginTop: "0.25rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Please wait a moment
        </p>
      </div>
    </div>
  );
}
