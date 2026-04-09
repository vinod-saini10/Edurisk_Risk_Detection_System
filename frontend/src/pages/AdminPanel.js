/**
 * AdminPanel.js — Step 11: Production Admin Panel
 * View/Delete Users & Export All Prediction Data
 */
import React, { useEffect, useState } from "react";
import { getAllUsers, deleteUser, getAllPredictions } from "../api/api";
import Loader from "../components/Loader";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uRes, pRes] = await Promise.all([getAllUsers(), getAllPredictions()]);
      setUsers(uRes.data);
      setPredictions(pRes.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load admin data. ensure you are an admin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUser(id);
      setUsers(users.filter(u => u.id !== id));
    } catch (err) { alert(err.response?.data?.error || "Delete failed"); }
  };

  const exportToCSV = () => {
    if (!predictions.length) return;
    const header = "ID,Student,Email,Score,Risk,Timestamp\n";
    const csvContent = header + predictions.map(p => `${p.id},${p.name},${p.email},${p.predicted_score},${p.risk_level},${p.created_at}`).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `edurisk_all_data_${new Date().getTime()}.csv`;
    a.click();
  };

  if (loading) return <Loader text="Unlocking admin panel..." />;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "3rem 1.5rem" }}>
      <div className="page-header-row" style={{ marginBottom: "3rem" }}>
        <div>
          <h1 style={{ fontSize: "clamp(1.5rem,4vw,2.5rem)", fontWeight: 800 }}>⚙️ Management Panel</h1>
          <p style={{ color: "var(--text-secondary)" }}>System-wide user administration and global prediction logs.</p>
        </div>
        <button onClick={exportToCSV} className="btn-primary" style={{ padding: "0.8rem 1.5rem", borderRadius: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
          📥 Export All Data (CSV)
        </button>
      </div>

      {error && (
        <div style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", padding: "1.5rem", borderRadius: 16, border: "1px solid #ef4444", marginBottom: "2rem" }}>
          ⚠ {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
        {/* User Management */}
        <div className="card">
          <h3 style={{ marginBottom: "1.5rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem" }}>👥 Registered Users</h3>
          <div style={{ maxHeight: 500, overflowY: "auto" }}>
            {users.map(u => (
              <div key={u.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 0", borderBottom: "1px solid var(--border-color)" }}>
                <div>
                  <p style={{ fontWeight: 700, margin: 0 }}>{u.name}</p>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: 0 }}>{u.email} · {u.role}</p>
                </div>
                <button onClick={() => handleDeleteUser(u.id)} style={{ background: "transparent", color: "#64748b", border: "none", cursor: "pointer", fontSize: "1.1rem" }} title="Delete user">
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Global Stats Snapshot */}
        <div className="card" style={{ background: "linear-gradient(135deg, rgba(79,110,247,0.1), rgba(124,58,237,0.1))" }}>
          <h3 style={{ marginBottom: "1rem" }}>📊 System Snapshot</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div style={{ background: "var(--panel-bg)", padding: "1.5rem", borderRadius: 12 }}>
              <p style={{ fontSize: "2rem", fontWeight: 800, margin: 0 }}>{users.length}</p>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", margin: 0 }}>Total Users</p>
            </div>
            <div style={{ background: "var(--panel-bg)", padding: "1.5rem", borderRadius: 12 }}>
              <p style={{ fontSize: "2rem", fontWeight: 800, margin: 0, color: "var(--accent-color)" }}>{predictions.length}</p>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", margin: 0 }}>Global Predictions</p>
            </div>
          </div>
          <div style={{ marginTop: "2rem" }}>
            <h4 style={{ fontSize: "0.9rem", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>Latest Pulse</h4>
            {predictions.slice(0, 5).map(p => (
              <div key={p.id} style={{ display: "flex", gap: "1rem", fontSize: "0.8rem", marginBottom: "0.5rem" }}>
                <span>🕒 {new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span style={{ fontWeight: 700 }}>{p.name}</span>
                <span style={{ color: p.risk_level === 'High Risk' ? '#ef4444' : '#10b981' }}>{p.risk_level}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
