import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { getStudentPredictions, exportStudentPredictions, explainPrediction } from "../api/api";
import RiskBadge from "../components/RiskBadge";
import StatCard from "../components/StatCard";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";

const RISK_COLOR = { "Low Risk": "#10b981", "Medium Risk": "#f59e0b", "High Risk": "#ef4444" };

export default function StudentDashboard() {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState([]);
  const [stats, setStats] = useState({ high_risk_count: 0, medium_risk_count: 0, low_risk_count: 0, average_score: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterRisk, setFilterRisk] = useState("All");
  const [sortCol, setSortCol] = useState("created_at");
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedExplain, setSelectedExplain] = useState(null);
  const [explainMap, setExplainMap] = useState({});
  const [explainLoading, setExplainLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getStudentPredictions()
      .then((res) => {
        setPredictions(res.data.predictions || []);
        setStats(res.data.stats || {});
      })
      .catch((e) => setError(e.response?.data?.error || "Failed to load data. Is the backend running?"))
      .finally(() => setLoading(false));
  }, []);

  const handleExport = async () => {
    try {
      const res = await exportStudentPredictions();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "my_predictions.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      alert("Export failed");
    }
  };

  const filtered = useMemo(() => {
    const q = (search || "").toLowerCase().trim();
    let out = (predictions || []).filter((p) => {
      const matchRisk = filterRisk === "All" || p.risk_level === filterRisk;
      if (!q) return matchRisk;

      const dateStr = p.created_at ? new Date(p.created_at).toLocaleDateString() : "";
      const scoreStr = String(p.predicted_score || "");
      return matchRisk && (dateStr.toLowerCase().includes(q) || scoreStr.includes(q));
    });

    out.sort((a, b) => {
      let av = a[sortCol], bv = b[sortCol];
      if (sortCol === "created_at") {
        av = new Date(a.created_at || 0).getTime();
        bv = new Date(b.created_at || 0).getTime();
      }
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      if (av === bv) return 0;
      return sortAsc ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });

    return out;
  }, [predictions, search, filterRisk, sortCol, sortAsc]);

  const total = predictions.length;

  const pieData = [
    { name: "High Risk", value: stats.high_risk_count || 0 },
    { name: "Medium Risk", value: stats.medium_risk_count || 0 },
    { name: "Low Risk", value: stats.low_risk_count || 0 },
  ];

  const barData = (() => {
    const groups = { "High Risk": [], "Medium Risk": [], "Low Risk": [] };
    (predictions || []).forEach((p) => {
      const k = p.risk_level || "High Risk";
      groups[k] = groups[k] || [];
      groups[k].push(p.predicted_score || 0);
    });
    return Object.entries(groups).map(([risk, arr]) => ({ risk, avg: arr.length ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : 0 }));
  })();

  const sortBy = (col) => { if (sortCol === col) setSortAsc(p => !p); else { setSortCol(col); setSortAsc(false); } };
  const SortIcon = ({ col }) => sortCol === col ? (sortAsc ? " ↑" : " ↓") : "";

  if (loading) return <Loader text="Loading dashboard…" />;

  if (error) return (
    <div style={{ maxWidth: 700, margin: "4rem auto", padding: "0 1.5rem" }}>
      <div style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "1.2rem", color: "#b91c1c" }}>
        ⚠ {error}
      </div>
    </div>
  );

  if (!total) return (
    <div style={{ textAlign: "center", padding: "4rem" }}>
      <p style={{ color: "#64748b", marginBottom: "1rem", fontSize: "1rem" }}>No predictions yet. Start by running your first prediction.</p>
      <Link to="/predict" style={{ background: "var(--accent-color)", color: "#fff", padding: "0.6rem 1rem", borderRadius: 8, textDecoration: "none" }}>Go to Predict</Link>
    </div>
  );

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2.5rem 1.5rem" }}>
      <div className="page-header-row" style={{ marginBottom: "0.5rem" }}>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "clamp(1.3rem,4vw,1.6rem)", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Student Dashboard</h1>
        <div style={{ display: "flex", gap: "0.8rem", alignItems: "center", flexShrink: 0 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 700 }}>{user?.name}</div>
            <div style={{ color: "#64748b", fontSize: "0.85rem" }}>{user?.email}</div>
          </div>
          <RiskBadge level={predictions[0]?.risk_level || "Low Risk"} />
        </div>
      </div>

      <div className="page-header-row" style={{ margin: "1rem 0" }}>
        <p style={{ color: "#64748b", margin: 0 }}>{total} past prediction{total !== 1 ? "s" : ""}</p>
        <div style={{ display: "flex", gap: "0.6rem", flexShrink: 0 }}>
          <button onClick={handleExport} style={{ background: "var(--accent-color)", color: "#fff", border: "none", padding: "0.5rem 0.9rem", borderRadius: 10, cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" }}>📥 Download My Data (CSV)</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "1rem", marginBottom: "1.25rem" }}>
        <StatCard label="Total Predictions" value={total} icon="🧾" color="#4f6ef7" />
        <StatCard label="High Risk" value={stats.high_risk_count || 0} icon="🔴" color="#ef4444" />
        <StatCard label="Medium Risk" value={stats.medium_risk_count || 0} icon="🟡" color="#f59e0b" />
        <StatCard label="Average Score" value={stats.average_score || 0} icon="📊" color="#10b981" sub="out of 100" />
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: "1rem", marginBottom: "1.25rem" }}>
        <div style={{ background: "var(--panel-bg)", border: "1px solid var(--border-color)", borderRadius: 14, padding: "1rem" }}>
          <h3 style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.95rem", marginBottom: "0.75rem" }}>🥧 Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={RISK_COLOR[entry.name] || "#4f6ef7"} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: "var(--panel-bg)", border: "1px solid var(--border-color)", borderRadius: 14, padding: "1rem" }}>
          <h3 style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.95rem", marginBottom: "0.75rem" }}>📊 Avg Score by Risk</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="risk" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748b" }} />
              <Tooltip />
              <Bar dataKey="avg" radius={[6, 6, 0, 0]}>
                {barData.map((entry) => (
                  <Cell key={entry.risk} fill={RISK_COLOR[entry.risk] || "#4f6ef7"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "0.8rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <input placeholder="🔍 Search by date or score…" value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 200, padding: "0.6rem 1rem", background: "var(--panel-bg)", border: "1px solid var(--border-color)", borderRadius: 10, color: "var(--text-primary)", fontSize: "0.9rem" }} />
        { ["All", "High Risk", "Medium Risk", "Low Risk"].map(opt => (
          <button key={opt} onClick={() => setFilterRisk(opt)} style={{ padding: "0.55rem 0.9rem", borderRadius: 10, fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", background: filterRisk === opt ? "rgba(79,110,247,0.12)" : "var(--panel-bg)", border: filterRisk === opt ? "1px solid rgba(79,110,247,0.3)" : "1px solid var(--border-color)", color: filterRisk === opt ? "var(--accent-color)" : "var(--text-secondary)" }}>{opt}</button>
        )) }
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 6px", fontSize: "0.9rem" }}>
          <thead>
            <tr>
                {[
                ["Date", "created_at"],
                ["Attendance", "attendance"],
                ["Study Hrs", "study_hours"],
                ["Prev Marks", "previous_marks"],
                ["Assignment", "assignment_score"],
                ["Internal", "internal_marks"],
                ["Pred. Score", "predicted_score"],
                ["Risk Level", "risk_level"],
                ["Actions", "actions"],
              ].map(([lbl, col]) => (
                <th key={col} onClick={() => sortBy(col)} style={{ padding: "0.7rem 0.8rem", textAlign: "left", color: "#475569", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>{lbl}<SortIcon col={col} /></th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={9} style={{ textAlign: "center", padding: "2rem", color: "#475569" }}>No results match your filter.</td></tr>
            ) : filtered.map((p, i) => {
              const isHigh = p.risk_level === "High Risk";
              return (
                <React.Fragment key={p.id}>
                  <tr key={`${p.id}-${i}`} style={{ background: isHigh ? "rgba(239,68,68,0.06)" : "var(--panel-bg)", borderRadius: 8, outline: isHigh ? "1px solid rgba(239,68,68,0.12)" : "1px solid transparent" }}>
                    <td style={{ padding: "0.6rem 0.8rem", whiteSpace: "nowrap", color: "#475569" }}>{p.created_at ? new Date(p.created_at).toLocaleString() : "-"}</td>
                    <td style={{ padding: "0.6rem 0.8rem" }}>{p.attendance}%</td>
                    <td style={{ padding: "0.6rem 0.8rem" }}>{p.study_hours}h</td>
                    <td style={{ padding: "0.6rem 0.8rem" }}>{p.previous_marks}</td>
                    <td style={{ padding: "0.6rem 0.8rem" }}>{p.assignment_score}</td>
                    <td style={{ padding: "0.6rem 0.8rem" }}>{p.internal_marks}</td>
                    <td style={{ padding: "0.6rem 0.8rem", fontWeight: 700, color: p.predicted_score >= 75 ? "#10b981" : p.predicted_score >= 50 ? "#f59e0b" : "#ef4444" }}>{Math.round(p.predicted_score)}</td>
                    <td style={{ padding: "0.6rem 0.8rem" }}><RiskBadge level={p.risk_level} /></td>
                    <td style={{ padding: "0.6rem 0.8rem" }}>
                      <button onClick={async () => {
                        // toggle explanation
                        if (selectedExplain === p.id) { setSelectedExplain(null); return; }
                        setExplainLoading(true);
                        setSelectedExplain(p.id);
                        try {
                          const res = await explainPrediction(p.id);
                          setExplainMap(m => ({ ...m, [p.id]: res.data }));
                        } catch (err) {
                          setExplainMap(m => ({ ...m, [p.id]: { error: err.response?.data?.error || "Failed to load explanation" } }));
                        } finally {
                          setExplainLoading(false);
                        }
                      }} style={{ padding: "0.35rem 0.6rem", borderRadius: 8, border: "1px solid var(--border-color)", background: "transparent", cursor: "pointer" }}>Details</button>
                    </td>
                  </tr>

                  {selectedExplain === p.id && (
                    <tr key={`exp-${p.id}`} style={{ background: "rgba(255,255,255,0.02)" }}>
                      <td colSpan={9} style={{ padding: 12 }}>
                        {explainLoading ? (
                          <div>Loading explanation…</div>
                        ) : explainMap[p.id] && explainMap[p.id].error ? (
                          <div style={{ color: "#ef4444" }}>{explainMap[p.id].error}</div>
                        ) : explainMap[p.id] ? (
                          <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
                            <div style={{ minWidth: 240 }}>
                              <h4 style={{ margin: "0 0 6px" }}>Why this prediction</h4>
                              <ol>
                                {(explainMap[p.id].explanation?.top_reasons || []).map((r, idx) => (
                                  <li key={idx}>{r}</li>
                                ))}
                              </ol>
                            </div>
                            <div style={{ minWidth: 240 }}>
                              <h4 style={{ margin: "0 0 6px" }}>Smart Recommendations</h4>
                              <ul>
                                {(explainMap[p.id].recommendations?.study_plan || []).map((s, i) => <li key={i}>{s}</li>)}
                              </ul>
                              <p style={{ marginTop: 8, color: "#94a3b8" }}><strong>Weekly target:</strong> {explainMap[p.id].recommendations?.weekly_target}</p>
                            </div>
                          </div>
                        ) : (
                          <div>No explanation available.</div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <p style={{ marginTop: "1rem", color: "#475569", fontSize: "0.85rem" }}>Showing {filtered.length} of {total} records.</p>
    </div>
  );
}
