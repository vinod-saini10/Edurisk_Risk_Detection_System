/**
 * OtpPage.js — FINAL (PRODUCTION READY)
 */

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/api";

export default function OtpPage() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const nav = useNavigate();
  const location = useLocation();

  // 🔥 Email from register page
  const email = location.state?.email;

  // ❌ अगर email नहीं आया → redirect
  useEffect(() => {
    if (!email) {
      nav("/register");
    }
  }, [email, nav]);

  const handleVerify = async (e) => {
    e.preventDefault();

    // 🔥 Basic validation
    if (!otp || otp.length !== 6) {
      setError("Enter valid 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("OTP PAGE NEW BUILD");
      await api.post("/auth/verify-otp", {
        email,
        otp,
      });

      alert("✅ OTP Verified Successfully");

      // 🔥 redirect to login
      nav("/login");
    } catch (err) {
      setError(err.response?.data?.error || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          padding: "2rem",
          borderRadius: 16,
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          textAlign: "center",
        }}
      >
        <h2>🔐 Verify OTP</h2>

        <p style={{ color: "#94a3b8" }}>
          OTP sent to <b>{email}</b>
        </p>

        <form onSubmit={handleVerify}>
          <input
            type="text"
            maxLength={6}
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            style={{
              padding: "0.7rem",
              width: "100%",
              marginTop: "1rem",
              borderRadius: 8,
              border: "1px solid #ccc",
              textAlign: "center",
              fontSize: "1.2rem",
              letterSpacing: "5px",
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "1.2rem",
              width: "100%",
              padding: "0.7rem",
              borderRadius: 8,
              border: "none",
              background: loading ? "#888" : "#4f46e5",
              color: "#fff",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        {error && <p style={{ color: "red", marginTop: "1rem" }}>⚠ {error}</p>}
      </div>
    </div>
  );
}
