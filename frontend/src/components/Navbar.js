import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { getStudentProfile } from "../api/api";
import "./Navbar.css";

export default function Navbar() {
  const { pathname } = useLocation();
  const { isLoggedIn, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const nav = useNavigate();

  // 🔥 fallback अगर context user null हो
  const _stored = sessionStorage.getItem("edurisk_user");
  const storedUser = _stored ? JSON.parse(_stored) : null;
  const currentUser = user || storedUser;

  const isAdmin = currentUser?.role === "admin";
  const [profileImage, setProfileImage] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (isLoggedIn) {
      getStudentProfile()
        .then(res => {
          if (!mounted) return;
          setProfileImage(res.data.image_url || null);
        })
        .catch(() => {})
    }
    return () => { mounted = false; };
  }, [isLoggedIn]);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    nav("/login");
    setMenuOpen(false);
  };

  const linkStyle = (to) => ({
    display: "flex",
    alignItems: "center",
    gap: "0.35rem",
    padding: "0.5rem 0.9rem",
    borderRadius: 10,
    textDecoration: "none",
    fontSize: "0.88rem",
    fontWeight: pathname === to ? 700 : 500,
    color: pathname === to ? "var(--accent-color)" : "var(--text-secondary)",
    background: pathname === to ? "rgba(79,110,247,0.1)" : "transparent",
    transition: "all 0.2s"
  });

  const avatarEl = (
    <div style={{ width: 34, height: 34, borderRadius: "50%", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {profileImage ? (
        <img src={profileImage} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#4f46e5,#7c3aed)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
          {currentUser?.name?.charAt(0)?.toUpperCase() || "U"}
        </div>
      )}
    </div>
  );

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "var(--bg-color)",
        borderBottom: "1px solid var(--border-color)",
      }}
    >
      <div className="navbar-inner">

        {/* LEFT: Logo + Nav Links */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>

          {/* LOGO */}
          <Link to="/" className="navbar-logo">
            <span>🎓</span>
            <span>EduRisk</span>
          </Link>

          {/* NAV LINKS (desktop) */}
          <div className="navbar-links">
            {isLoggedIn && <Link to="/predict" style={linkStyle("/predict")}>🎯 Predict</Link>}
            {isLoggedIn && <Link to="/profile" style={linkStyle("/profile")}>👤 Profile</Link>}
            {isLoggedIn && <Link to="/bulk" style={linkStyle("/bulk")}>📁 Bulk</Link>}
            {isLoggedIn && <Link to="/history" style={linkStyle("/history")}>📋 History</Link>}
            {isAdmin && <Link to="/admin" style={linkStyle("/admin")}>💼 Admin</Link>}
          </div>
        </div>

        {/* RIGHT (desktop) */}
        <div className="navbar-right">

          {/* THEME TOGGLE */}
          <button
            onClick={toggleTheme}
            style={{
              background: "var(--panel-bg)",
              border: "1px solid var(--border-color)",
              borderRadius: 10,
              padding: "0.4rem 0.6rem",
              cursor: "pointer"
            }}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          {/* USER */}
          {isLoggedIn ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>

              {/* PROFILE ICON */}
              {avatarEl}

              {/* NAME + ROLE */}
              <div className="user-name-text">
                <p style={{ margin: 0, fontWeight: 700 }}>
                  {currentUser?.name || "User"}
                </p>
                <p style={{ margin: 0, fontSize: "0.7rem", color: "#64748b" }}>
                  {currentUser?.role || "student"}
                </p>
              </div>

              {/* LOGOUT */}
              <button
                onClick={handleLogout}
                style={{
                  background: "rgba(239,68,68,0.1)",
                  color: "#ef4444",
                  border: "1px solid rgba(239,68,68,0.2)",
                  padding: "0.4rem 0.8rem",
                  borderRadius: 8,
                  cursor: "pointer"
                }}
              >
                Logout
              </button>

            </div>
          ) : (
            <div style={{ display: "flex", gap: "0.8rem" }}>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </div>
          )}
        </div>

        {/* HAMBURGER BUTTON (mobile only) */}
        <button
          className={`navbar-hamburger${menuOpen ? " open" : ""}`}
          onClick={() => setMenuOpen(prev => !prev)}
          aria-label="Toggle navigation menu"
        >
          <span />
          <span />
          <span />
        </button>

      </div>

      {/* MOBILE MENU DRAWER */}
      <div className={`navbar-mobile-menu${menuOpen ? "" : " closed"}`}>

        {/* Theme toggle row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.6rem 0.5rem", borderBottom: "1px solid var(--border-color)" }}>
          <span style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
            {theme === "dark" ? "Dark Mode" : "Light Mode"}
          </span>
          <button
            onClick={toggleTheme}
            style={{
              background: "var(--panel-bg)",
              border: "1px solid var(--border-color)",
              borderRadius: 10,
              padding: "0.4rem 0.6rem",
              cursor: "pointer"
            }}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>

        {/* Nav links */}
        {isLoggedIn && <Link to="/predict" style={{ ...linkStyle("/predict"), borderBottom: "1px solid var(--border-color)", borderRadius: 0, padding: "0.75rem 0.5rem" }}>🎯 Predict</Link>}
        {isLoggedIn && <Link to="/profile" style={{ ...linkStyle("/profile"), borderBottom: "1px solid var(--border-color)", borderRadius: 0, padding: "0.75rem 0.5rem" }}>👤 Profile</Link>}
        {isLoggedIn && <Link to="/bulk" style={{ ...linkStyle("/bulk"), borderBottom: "1px solid var(--border-color)", borderRadius: 0, padding: "0.75rem 0.5rem" }}>📁 Bulk Upload</Link>}
        {isLoggedIn && <Link to="/history" style={{ ...linkStyle("/history"), borderBottom: "1px solid var(--border-color)", borderRadius: 0, padding: "0.75rem 0.5rem" }}>📋 History</Link>}
        {isAdmin && <Link to="/admin" style={{ ...linkStyle("/admin"), borderBottom: "1px solid var(--border-color)", borderRadius: 0, padding: "0.75rem 0.5rem" }}>💼 Admin</Link>}
        {!isLoggedIn && <Link to="/login" style={{ ...linkStyle("/login"), borderBottom: "1px solid var(--border-color)", borderRadius: 0, padding: "0.75rem 0.5rem" }}>🔐 Login</Link>}
        {!isLoggedIn && <Link to="/register" style={{ ...linkStyle("/register"), borderRadius: 0, padding: "0.75rem 0.5rem" }}>🎓 Register</Link>}

        {/* User info + logout */}
        {isLoggedIn && (
          <div className="navbar-mobile-user" style={{ borderBottom: "none", paddingBottom: 0 }}>
            {avatarEl}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{currentUser?.name || "User"}</div>
              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{currentUser?.role || "student"}</div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                background: "rgba(239,68,68,0.1)",
                color: "#ef4444",
                border: "1px solid rgba(239,68,68,0.2)",
                padding: "0.4rem 0.8rem",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}