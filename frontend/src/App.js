/**
 * App.js — FINAL (AUTH + OTP FLOW FIXED)
 */

import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { useAuth } from "./context/AuthContext";

// Pages
import Navbar            from "./components/Navbar";
import HomePage          from "./pages/HomePage";
import PredictPage       from "./pages/PredictPage";
import ResultPage        from "./pages/ResultPage";
import PreviousPage      from "./pages/PreviousPage";
import StudentDashboard  from "./pages/StudentDashboard";
import AdminDashboard    from "./pages/AdminDashboard";
import LoginPage         from "./pages/LoginPage";
import RegisterPage      from "./pages/RegisterPage";
import PredictionHistory from "./pages/PredictionHistory";
import BulkUploadPage    from "./pages/BulkUploadPage";
import AdminPanel        from "./pages/AdminPanel";
import OtpPage           from "./pages/OtpPage";
import ProfilePage       from "./pages/ProfilePage";


// 🔐 Protected Route (LOGIN REQUIRED)
function ProtectedRoute({ element }) {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? element : <Navigate to="/login" replace />;
}

// 🔥 Block Logged-in users from login/register
function PublicRoute({ element }) {
  const { isLoggedIn } = useAuth();
  return !isLoggedIn ? element : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>

          {/* Navbar always visible */}
          <Navbar />

          <div className="fade-in">
            <Routes>

              {/* PUBLIC ROUTES */}
              <Route path="/" element={<HomePage />} />

              <Route
                path="/login"
                element={<PublicRoute element={<LoginPage />} />}
              />

              <Route
                path="/register"
                element={<PublicRoute element={<RegisterPage />} />}
              />

              {/* 🔥 OTP should be PUBLIC (NO LOGIN REQUIRED) */}
              <Route path="/verify-otp" element={<OtpPage />} />

              <Route path="/previous" element={<PreviousPage />} />


              {/* 🔐 PROTECTED ROUTES */}
              <Route
                path="/predict"
                element={<ProtectedRoute element={<PredictPage />} />}
              />

              <Route
                path="/bulk"
                element={<ProtectedRoute element={<BulkUploadPage />} />}
              />

              <Route
                path="/result"
                element={<ProtectedRoute element={<ResultPage />} />}
              />

              <Route
                path="/dashboard"
                element={<ProtectedRoute element={<StudentDashboard />} />}
              />

              <Route
                path="/profile"
                element={<ProtectedRoute element={<ProfilePage />} />}
              />

              <Route
                path="/history"
                element={<ProtectedRoute element={<PredictionHistory />} />}
              />

              <Route
                path="/admin"
                element={<ProtectedRoute element={<AdminDashboard />} />}
              />

              <Route
                path="/admin-panel"
                element={<ProtectedRoute element={<AdminPanel />} />}
              />


              {/* FALLBACK */}
              <Route path="*" element={<Navigate to="/" />} />

            </Routes>
          </div>

        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}