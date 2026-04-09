/**
 * BulkUploadPage.js — Step 7: Bulk CSV Prediction
 */
import React, { useState } from "react";
import { uploadBulkCSV } from "../api/api";
import Loader from "../components/Loader";

export default function BulkUploadPage() {
  const [file, setFile] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(""); setSuccess("");
  };

  const handleUpload = async () => {
    if (!file) { setError("Please select a CSV file first."); return; }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true); setError(""); setSuccess("");
    try {
      const { data } = await uploadBulkCSV(formData);
      setResults(data.predictions);
      setSuccess(data.message);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to process CSV. Ensure format is correct.");
    } finally {
      setLoading(false);
    }
  };

  const downloadResults = () => {
    if (!results.length) return;
    const header = "Name,Email,Predicted Score,Risk Level\n";
    const csvContent = header + results.map(r => `${r.name},${r.email},${r.score},${r.risk}`).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bulk_predictions_${new Date().getTime()}.csv`;
    a.click();
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "3rem 1.5rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>📁 Bulk Prediction</h1>
        <p style={{ color: "var(--text-secondary)" }}>Upload a CSV file with student academic data for instant bulk analysis.</p>
      </div>

      <div className="card" style={{ padding: "2.5rem", textAlign: "center", marginBottom: "2rem" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>📄</div>
          <p style={{ fontSize: "1rem", fontWeight: 600 }}>Drag and drop your CSV here</p>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Required columns: attendance, study_hours, previous_marks, assignment_score, internal_marks</p>
        </div>

        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          style={{ marginBottom: "1.5rem", display: "block", margin: "0 auto" }}
        />

        {file && (
          <p style={{ marginBottom: "1rem", fontSize: "0.9rem", color: "var(--accent-color)", fontWeight: 700 }}>
            Selected: {file.name}
          </p>
        )}

        <button
          onClick={handleUpload}
          disabled={loading || !file}
          className="btn-primary"
          style={{ padding: "0.8rem 2rem", borderRadius: 12, fontWeight: 700, fontSize: "1rem", width: "100%", maxWidth: 300 }}
        >
          {loading ? "Processing..." : "🚀 Upload & Predict"}
        </button>

        {error && <p style={{ color: "#ef4444", marginTop: "1rem", fontSize: "0.9rem" }}>⚠ {error}</p>}
        {success && <p style={{ color: "#10b981", marginTop: "1rem", fontSize: "0.9rem" }}>✅ {success}</p>}
      </div>

      {loading && <Loader text="Analyzing batch data..." />}

      {results.length > 0 && (
        <div className="fade-in">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1.2rem" }}>📊 Results ({results.length})</h3>
            <button
              onClick={downloadResults}
              style={{ background: "var(--accent-color)", color: "#fff", border: "none", padding: "0.5rem 1.2rem", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}
            >
              📥 Download CSV
            </button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", background: "var(--panel-bg)", borderRadius: 16 }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid var(--border-color)" }}>
                  <th style={{ padding: "1rem" }}>Student</th>
                  <th style={{ padding: "1rem" }}>Predicted Score</th>
                  <th style={{ padding: "1rem" }}>Risk Level</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--border-color)" }}>
                    <td style={{ padding: "1rem" }}>
                      <p style={{ fontWeight: 700, margin: 0 }}>{r.name}</p>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: 0 }}>{r.email}</p>
                    </td>
                    <td style={{ padding: "1rem", fontWeight: 800, color: "var(--accent-color)" }}>{r.score}</td>
                    <td style={{ padding: "1rem" }}>
                      <span style={{
                        padding: "0.3rem 0.8rem", borderRadius: 20, fontSize: "0.75rem", fontWeight: 700,
                        background: r.risk === "High Risk" ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)",
                        color: r.risk === "High Risk" ? "#ef4444" : "#10b981"
                      }}>
                        {r.risk}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
