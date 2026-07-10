import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  exportCSV,
  getAllUsers,
  getAllPredictions,
  getAdminCharts,
  getAdminAnalytics,
  getAdminInsights,
  getModelMetrics,
} from "../api/api";
import RiskBadge from "../components/RiskBadge";
import StatCard from "../components/StatCard";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";

const RISK_COLOR = {
  "Low Risk": "#22d3ee",
  "Medium Risk": "#f59e0b",
  "High Risk": "#ef4444",
  "No Risk": "#10b981",
};

const tip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#1e2235",
        border: "1px solid rgba(79,110,247,0.3)",
        borderRadius: 8,
        padding: "0.6rem 0.9rem",
      }}
    >
      <p style={{ color: "#94a3b8", fontSize: "0.78rem" }}>{payload[0].name}</p>
      <p style={{ color: "#7c9ef7", fontWeight: 700 }}>{payload[0].value}</p>
    </div>
  );
};

export default function AdminDashboard() {
  const [students, setStudents] = useState([]);
  const [charts, setCharts] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [insights, setInsights] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterRisk, setFilterRisk] = useState("All");
  const [sortCol, setSortCol] = useState("created_at");
  const [sortAsc, setSortAsc] = useState(false);
  const { user } = useAuth();

  // Export function add
  const handleExport = async () => {
    try {
      const res = await exportCSV();

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", "edurisk_data.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to export CSV.");
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      console.log("Fetching dashboard data...");
      setLoading(true);
      try {
        const [s, c, a, ins, mm] = await Promise.all([
          getAllPredictions(),
          getAdminCharts(),
          getAdminAnalytics(),
          getAdminInsights(),
          getModelMetrics(),
        ]);

        console.log("Dashboard data fetched successfully!");
        setStudents(s.data);
        setCharts(c.data);
        setAnalytics(a.data);
        setInsights(ins.data?.insights || []);
        setMetrics(mm.data || null);
      } catch (err) {
        if (!err.response) {
          setApiErr(
            "Unable to connect to server. Please check if backend is running.",
          );
          return;
        }

        if (err.response.status === 404) {
          setApiErr("No prediction found for this student.");
          return;
        }

        setApiErr("Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const filtered = students
    .filter((s) => {
      const q = search.toLowerCase();
      const matchSearch =
        s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
      const matchRisk = filterRisk === "All" || s.risk_level === filterRisk;
      return matchSearch && matchRisk;
    })
    .sort((a, b) => {
      let av = a[sortCol],
        bv = b[sortCol];
      if (typeof av === "string")
        ((av = av.toLowerCase()), (bv = bv.toLowerCase()));
      return sortAsc ? (av > bv ? 1 : -1) : av < bv ? 1 : -1;
    });

  const total = students.length;
  const highRisk = students.filter((s) => s.risk_level === "High Risk").length;
  const medRisk = students.filter((s) => s.risk_level === "Medium Risk").length;
  const lowRisk = students.filter((s) => s.risk_level === "Low Risk").length;
  const noRisk = students.filter((s) => s.risk_level === "No Risk").length;
  const avgScore = total
    ? (students.reduce((a, s) => a + s.predicted_score, 0) / total).toFixed(1)
    : 0;

  const pieData = charts?.risk_distribution
    ? Object.entries(charts.risk_distribution).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  const barData = charts?.avg_score_by_risk
    ? Object.entries(charts.avg_score_by_risk).map(([risk, avg]) => ({
        risk,
        avg,
      }))
    : [];

  const sortBy = (col) => {
    if (sortCol === col) setSortAsc((p) => !p);
    else {
      setSortCol(col);
      setSortAsc(true);
    }
  };
  const SortIcon = ({ col }) =>
    sortCol === col ? (sortAsc ? " ↑" : " ↓") : "";

  if (loading) return <Loader text="Loading admin data…" />;
  if (error)
    return (
      <div style={{ maxWidth: 700, margin: "4rem auto", padding: "0 1.5rem" }}>
        <div
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: 12,
            padding: "1.5rem",
            color: "#f87171",
          }}
        >
          ⚠ {error}
        </div>
      </div>
    );

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2.5rem 1.5rem" }}>
      <div className="page-header-row" style={{ marginBottom: "0.4rem" }}>
        <h1
          style={{
            fontFamily: "'Space Grotesk',sans-serif",
            fontSize: "clamp(1.4rem,4vw,1.9rem)",
            fontWeight: 700,
            color: "var(--text-primary)",
            margin: 0,
          }}
        >
          Admin Dashboard
        </h1>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.8rem",
            background: "var(--panel-bg)",
            padding: "0.5rem 1rem",
            borderRadius: 20,
            border: "1px solid var(--border-color)",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, var(--accent-color), var(--accent-secondary))",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
            }}
          >
            {user?.name?.charAt(0)?.toUpperCase() || "A"}
          </div>
          <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
            Welcome, {user?.name || "Admin"}
          </span>
        </div>
      </div>
      <div className="page-header-row" style={{ marginBottom: "2rem" }}>
        <p style={{ color: "#64748b", margin: 0 }}>
          All student records · {total} total predictions
        </p>
        <button
          onClick={handleExport}
          style={{
            background: "var(--accent-color)",
            color: "#fff",
            border: "none",
            padding: "0.5rem 1rem",
            borderRadius: 10,
            cursor: "pointer",
            fontWeight: 600,
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          📥 Export All Data (CSV)
        </button>
      </div>

      {/* Stats — 4 tier */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <StatCard
          label="Total Predictions"
          value={total}
          icon="👥"
          color="#4f6ef7"
        />
        <StatCard
          label="High Risk"
          value={highRisk}
          icon="🔴"
          color="#ef4444"
          sub="Needs attention"
        />
        <StatCard
          label="Medium Risk"
          value={medRisk}
          icon="🟡"
          color="#f59e0b"
        />
        <StatCard label="Low Risk" value={lowRisk} icon="🔵" color="#22d3ee" />
        <StatCard
          label="No Risk"
          value={noRisk}
          icon="🟢"
          color="#10b981"
          sub="Excellent"
        />
        <StatCard
          label="Average Score"
          value={avgScore}
          icon="📊"
          color="#a78bfa"
          sub="out of 100"
        />
      </div>

      {/* New: Model metrics + Analytics KPIs */}
      {analytics && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <StatCard
            label="Total Students (DB)"
            value={analytics.total_students}
            icon="👥"
            color="#4f6ef7"
          />
          <StatCard
            label="Avg Predicted Score (DB)"
            value={
              Math.round((analytics.average_predicted_score || 0) * 10) / 10
            }
            icon="📈"
            color="#10b981"
          />
          <div
            style={{
              background: "var(--panel-bg)",
              border: "1px solid var(--border-color)",
              borderRadius: 12,
              padding: 12,
            }}
          >
            <h4
              style={{
                margin: 0,
                fontSize: "0.85rem",
                color: "var(--text-primary)",
                fontWeight: 700,
              }}
            >
              Model Metrics
            </h4>
            {metrics ? (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: "0.9rem", color: "#94a3b8" }}>
                  Random Forest
                </div>
                <div style={{ fontWeight: 700 }}>
                  {metrics.rf
                    ? `R2 ${metrics.rf.r2} · RMSE ${metrics.rf.rmse} · MAE ${metrics.rf.mae}`
                    : "n/a"}
                </div>
                <div
                  style={{ fontSize: "0.9rem", color: "#94a3b8", marginTop: 8 }}
                >
                  XGBoost
                </div>
                <div style={{ fontWeight: 700 }}>
                  {metrics.xgb
                    ? `R2 ${metrics.xgb.r2} · RMSE ${metrics.xgb.rmse} · MAE ${metrics.xgb.mae}`
                    : "(not trained)"}
                </div>
              </div>
            ) : (
              <div style={{ marginTop: 8, color: "#64748b" }}>
                Model metrics not available.
              </div>
            )}
          </div>
          <div
            style={{
              background: "var(--panel-bg)",
              border: "1px solid var(--border-color)",
              borderRadius: 12,
              padding: 12,
            }}
          >
            <h4
              style={{
                margin: 0,
                fontSize: "0.85rem",
                color: "var(--text-primary)",
                fontWeight: 700,
              }}
            >
              🚨 Top High-Risk
            </h4>
            <div style={{ marginTop: 8 }}>
              {(analytics.top_high_risk_students || []).length > 0 ? (
                analytics.top_high_risk_students.slice(0, 5).map((s) => (
                  <div
                    key={s.student_id}
                    style={{
                      padding: "6px 0",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "0.88rem",
                          fontWeight: 600,
                          color: "#f1f5f9",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {s.name}
                      </div>
                      <div
                        style={{
                          fontSize: "0.73rem",
                          color: "#64748b",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {s.email}
                      </div>
                    </div>
                    <div style={{ flexShrink: 0, textAlign: "right" }}>
                      <div
                        style={{
                          fontWeight: 700,
                          color: "#ef4444",
                          fontSize: "1rem",
                        }}
                      >
                        {Math.round(s.avg_score || 0)}
                      </div>
                      <div
                        style={{
                          fontSize: "0.68rem",
                          color: "#f87171",
                          background: "rgba(239,68,68,0.15)",
                          borderRadius: 4,
                          padding: "1px 5px",
                          marginTop: 2,
                        }}
                      >
                        High Risk
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    color: "#64748b",
                    fontSize: "0.83rem",
                    paddingTop: 4,
                  }}
                >
                  No high-risk students found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      {total > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
            gap: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              background: "var(--panel-bg)",
              border: "1px solid var(--border-color)",
              borderRadius: 18,
              padding: "1.5rem",
            }}
          >
            <h3
              style={{
                fontWeight: 600,
                color: "var(--text-primary)",
                fontSize: "0.95rem",
                marginBottom: "1rem",
              }}
            >
              🥧 Risk Distribution
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                  fontSize={11}
                >
                  {pieData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={RISK_COLOR[entry.name] || "#4f6ef7"}
                    />
                  ))}
                </Pie>
                <Tooltip content={tip} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div
            style={{
              background: "var(--panel-bg)",
              border: "1px solid var(--border-color)",
              borderRadius: 18,
              padding: "1.5rem",
            }}
          >
            <h3
              style={{
                fontWeight: 600,
                color: "var(--text-primary)",
                fontSize: "0.95rem",
                marginBottom: "1rem",
              }}
            >
              📊 Avg Score by Risk
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} barSize={40}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis
                  dataKey="risk"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                />
                <Tooltip content={tip} />
                <Bar dataKey="avg" radius={[6, 6, 0, 0]}>
                  {barData.map((entry) => (
                    <Cell
                      key={entry.risk}
                      fill={RISK_COLOR[entry.risk] || "#4f6ef7"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* AI Insights */}
      {insights && insights.length > 0 && (
        <div style={{ marginTop: "1.25rem", marginBottom: "1.5rem" }}>
          <h3
            style={{
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: 8,
            }}
          >
            🔎 AI Insights
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
              gap: 12,
            }}
          >
            {insights.map((ins, idx) => (
              <div
                key={idx}
                style={{
                  background: "var(--panel-bg)",
                  border: "1px solid var(--border-color)",
                  borderRadius: 12,
                  padding: 12,
                }}
              >
                <p style={{ margin: 0, color: "#e2e8f0", fontWeight: 700 }}>
                  {ins}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "1.2rem",
          flexWrap: "wrap",
        }}
      >
        <input
          placeholder="🔍 Search name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: 220,
            padding: "0.65rem 1rem",
            background: "var(--panel-bg)",
            border: "1px solid var(--border-color)",
            borderRadius: 10,
            color: "var(--text-primary)",
            fontSize: "0.875rem",
            outline: "none",
          }}
        />
        {["All", "High Risk", "Medium Risk", "Low Risk"].map((opt) => (
          <button
            key={opt}
            onClick={() => setFilterRisk(opt)}
            style={{
              padding: "0.55rem 1rem",
              borderRadius: 10,
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
              background:
                filterRisk === opt ? "rgba(79,110,247,0.2)" : "var(--panel-bg)",
              border:
                filterRisk === opt
                  ? "1px solid rgba(79,110,247,0.5)"
                  : "1px solid var(--border-color)",
              color:
                filterRisk === opt
                  ? "var(--accent-color)"
                  : "var(--text-secondary)",
            }}
          >
            {opt}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: "0 4px",
            fontSize: "0.85rem",
          }}
        >
          <thead>
            <tr>
              {[
                ["#", "id"],
                ["Name", "name"],
                ["Email", "email"],
                ["Att %", "attendance"],
                ["Study Hrs", "study_hours"],
                ["Prev Marks", "previous_marks"],
                ["Assignment", "assignment_score"],
                ["Internal", "internal_marks"],
                ["Pred. Score", "predicted_score"],
                ["Risk Level", "risk_level"],
                ["Date", "created_at"],
              ].map(([lbl, col]) => (
                <th
                  key={col}
                  onClick={() => sortBy(col)}
                  style={{
                    padding: "0.6rem 0.75rem",
                    textAlign: "left",
                    color: "#475569",
                    fontWeight: 600,
                    fontSize: "0.78rem",
                    letterSpacing: "0.04em",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {lbl}
                  <SortIcon col={col} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={11}
                  style={{
                    textAlign: "center",
                    padding: "2rem",
                    color: "#475569",
                  }}
                >
                  {total === 0
                    ? "No student records yet. Run a prediction to populate."
                    : "No results match your filter."}
                </td>
              </tr>
            ) : (
              filtered.map((s, i) => {
                const isHigh = s.risk_level === "High Risk";
                return (
                  <tr
                    key={`${s.id}-${i}`}
                    style={{
                      background: isHigh
                        ? "rgba(239,68,68,0.07)"
                        : "var(--panel-bg)",
                      borderRadius: 10,
                      outline: isHigh
                        ? "1px solid rgba(239,68,68,0.2)"
                        : "1px solid transparent",
                    }}
                  >
                    {[
                      s.id,
                      s.name,
                      s.email,
                      `${s.attendance}%`,
                      `${s.study_hours}h`,
                      s.previous_marks,
                      s.assignment_score,
                      s.internal_marks,
                    ].map((val, vi) => (
                      <td
                        key={vi}
                        style={{
                          padding: "0.7rem 0.75rem",
                          color:
                            isHigh && vi === 1
                              ? "#f87171"
                              : "var(--text-primary)",
                          borderRadius: vi === 0 ? "10px 0 0 10px" : undefined,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {val}
                      </td>
                    ))}
                    <td style={{ padding: "0.7rem 0.75rem" }}>
                      <span
                        style={{
                          fontWeight: 700,
                          color:
                            s.predicted_score >= 75
                              ? "#10b981"
                              : s.predicted_score >= 50
                                ? "#f59e0b"
                                : "#ef4444",
                        }}
                      >
                        {Math.round(s.predicted_score)}
                      </span>
                    </td>
                    <td style={{ padding: "0.7rem 0.75rem" }}>
                      <RiskBadge level={s.risk_level} />
                    </td>
                    <td
                      style={{
                        padding: "0.7rem 0.75rem",
                        color: "#475569",
                        fontSize: "0.78rem",
                        borderRadius: "0 10px 10px 0",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {new Date(s.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <p style={{ marginTop: "1rem", color: "#475569", fontSize: "0.78rem" }}>
        Showing {filtered.length} of {total} records.
        {highRisk > 0 && (
          <span style={{ color: "#f87171", marginLeft: 8 }}>
            ⚠ {highRisk} high-risk student{highRisk > 1 ? "s" : ""} require
            attention.
          </span>
        )}
      </p>
    </div>
  );
}
