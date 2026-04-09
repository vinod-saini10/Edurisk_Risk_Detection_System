import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from "recharts";
import { getHistory } from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function PredictionHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { isLoggedIn, user } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      nav("/login");
      return;
    }

    getHistory()
      .then(res => setHistory(res.data))
      .catch(() => setError("Failed to load history"))
      .finally(() => setLoading(false));
  }, [isLoggedIn, nav]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  // Chart Data
  const chartData = history.map((r, i) => ({
    index: i + 1,
    score: r.predicted_score,
  }));

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "clamp(1.3rem,4vw,1.8rem)", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1.25rem" }}>
        Prediction History — {user?.name}
      </h2>

      {/* Chart */}
      {chartData.length > 0 && (
        <div style={{ width: "100%", overflowX: "hidden", marginBottom: "1.5rem" }}>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="index" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
              <Tooltip contentStyle={{ background: "#1e2235", border: "1px solid rgba(79,110,247,0.3)", borderRadius: 8 }} />
              <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Table */}
      {history.length === 0 ? (
        <p style={{ color: "#64748b", textAlign: "center", padding: "2rem" }}>No history found</p>
      ) : (
        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 4px", fontSize: "0.88rem", minWidth: 480 }}>
            <thead>
              <tr>
                {["#", "Date", "Score", "Risk", "Confidence"].map(h => (
                  <th key={h} style={{ padding: "0.6rem 0.8rem", textAlign: "left", color: "#475569", fontWeight: 700, fontSize: "0.78rem", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {history.map((r, i) => (
                <tr key={i} style={{ background: "var(--panel-bg)", borderRadius: 8 }}>
                  <td style={{ padding: "0.65rem 0.8rem", color: "#64748b" }}>{i + 1}</td>
                  <td style={{ padding: "0.65rem 0.8rem", whiteSpace: "nowrap", color: "#94a3b8", fontSize: "0.82rem" }}>{new Date(r.created_at).toLocaleString()}</td>
                  <td style={{ padding: "0.65rem 0.8rem", fontWeight: 700, color: r.predicted_score >= 75 ? "#10b981" : r.predicted_score >= 50 ? "#f59e0b" : "#ef4444" }}>{Math.round(r.predicted_score)}</td>
                  <td style={{ padding: "0.65rem 0.8rem", whiteSpace: "nowrap" }}>{r.risk_level}</td>
                  <td style={{ padding: "0.65rem 0.8rem" }}>
                    {r.confidence != null
                      ? `${Math.round(r.confidence * 100)}%`
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}