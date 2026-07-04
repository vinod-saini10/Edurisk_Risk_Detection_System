import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const cards = [
  {
    icon: "🎯",
    title: "Predict Risk",
    desc: "Enter academic data and get instant ML-powered risk prediction.",
    route: "/predict",
    color: "#4f6ef7",
  },
  {
    icon: "📂",
    title: "My Previous Result",
    desc: "Retrieve your stored prediction using name and email.",
    route: "/previous",
    color: "#7c3aed",
  },
  {
    icon: "📊",
    title: "Student Dashboard",
    desc: "Visualise your performance with interactive charts.",
    route: "/dashboard",
    color: "#0ea5e9",
  },
  {
    icon: "🛡️",
    title: "Admin Dashboard",
    desc: "View all students, highlight high-risk cases, and analyse data.",
    route: "/admin",
    color: "#f59e0b",
  },
];

export default function HomePage() {
  const nav = useNavigate();
  const { isLoggedIn } = useAuth();
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "3rem 1.5rem" }}>
      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            background: "rgba(79,110,247,0.1)",
            border: "1px solid rgba(79,110,247,0.3)",
            borderRadius: 999,
            padding: "0.4rem 1.1rem",
            marginBottom: "1.5rem",
            fontSize: "0.8rem",
            color: "#7c9ef7",
            fontWeight: 600,
            letterSpacing: "0.05em",
          }}
        >
          ✦ MCA MAJOR PROJECT 2025–26
        </div>
        <h1
          style={{
            fontFamily: "'Space Grotesk',sans-serif",
            fontSize: "clamp(2.2rem,5vw,3.8rem)",
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: "1.2rem",
            background:
              "linear-gradient(135deg, var(--text-primary) 40%, var(--accent-color))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          EduRisk
          <br />
          Academic Risk Prediction
        </h1>
        <p
          style={{
            fontSize: "1.1rem",
            color: "#64748b",
            maxWidth: 580,
            margin: "0 auto 2rem",
            lineHeight: 1.7,
          }}
        >
          Machine-learning system that predicts a student's academic risk level
          from attendance, study hours, marks, assignments, and internal tests.
        </p>
        <button
          onClick={() => (isLoggedIn ? nav("/predict") : nav("/login"))}
          style={{
            background: "linear-gradient(135deg,#4f6ef7,#7c3aed)",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            padding: "0.85rem 2.2rem",
            fontSize: "1rem",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 4px 24px rgba(79,110,247,0.4)",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 8px 32px rgba(79,110,247,0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 24px rgba(79,110,247,0.4)";
          }}
        >
          {isLoggedIn ? "Start Prediction →" : "Login to Predict →"}
        </button>
      </div>

      {/* Feature cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
          gap: "1.2rem",
        }}
      >
        {cards.map((c) => (
          <div
            key={c.route}
            onClick={() => (isLoggedIn ? nav(c.route) : nav("/login"))}
            style={{
              background: "var(--panel-bg)",
              border: `1px solid ${c.color}33`,
              borderRadius: 18,
              padding: "1.8rem",
              cursor: "pointer",
              transition: "all 0.25s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `${c.color}11`;
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.borderColor = `${c.color}77`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--panel-bg)";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = `${c.color}33`;
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "0.8rem" }}>
              {c.icon}
            </div>
            <h3
              style={{
                fontWeight: 700,
                fontSize: "1.05rem",
                color: "var(--text-primary)",
                marginBottom: "0.5rem",
              }}
            >
              {c.title}
            </h3>
            <p
              style={{ fontSize: "0.85rem", color: "#64748b", lineHeight: 1.6 }}
            >
              {c.desc}
            </p>
            <div
              style={{
                marginTop: "1.2rem",
                color: c.color,
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              Go →
            </div>
          </div>
        ))}
      </div>

      {/* Info strip */}
      <div
        style={{
          marginTop: "3rem",
          padding: "1.5rem 2rem",
          background: "rgba(79,110,247,0.06)",
          border: "1px solid rgba(79,110,247,0.15)",
          borderRadius: 16,
          display: "flex",
          flexWrap: "wrap",
          gap: "2rem",
          justifyContent: "space-around",
        }}
      >
        {[
          ["Random Forest", "Model A"],
          ["XG Boost", "Model B"],
          ["2000+ Records", "Training Data"],
          ["4 Risk Levels", "Low · Medium · High"],
          ["MySQL + Flask", "Backend"],
          ["React + Recharts", "Frontend"],
        ].map(([val, lbl]) => (
          <div key={lbl} style={{ textAlign: "center" }}>
            <div
              style={{ fontWeight: 700, color: "#7c9ef7", fontSize: "1rem" }}
            >
              {val}
            </div>
            <div
              style={{ fontSize: "0.75rem", color: "#475569", marginTop: 2 }}
            >
              {lbl}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
