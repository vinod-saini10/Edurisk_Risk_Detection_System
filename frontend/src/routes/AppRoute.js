import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext";

import Navbar            from "../components/Navbar";
import HomePage          from "../pages/HomePage";
import PredictPage       from "../pages/PredictPage";
import ResultPage        from "../pages/ResultPage";
import PreviousPage      from "../pages/PreviousPage";
import StudentDashboard  from "../pages/StudentDashboard";
import ProfilePage      from "../pages/ProfilePage";
import AdminDashboard    from "../pages/AdminDashboard";
import LoginPage         from "../pages/LoginPage";
import RegisterPage      from "../pages/RegisterPage";
import PredictionHistory from "../pages/PredictionHistory";

// New Phase 2 Pages
import BulkUploadPage    from "../pages/BulkUploadPage";
import AdminPanel        from "../pages/AdminPanel";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Navbar />
          <div className="fade-in">
            <Routes>
              <Route path="/"           element={<HomePage />} />
              <Route path="/predict"    element={<PredictPage />} />
              <Route path="/bulk"       element={<BulkUploadPage />} />
              <Route path="/result"     element={<ResultPage />} />
              <Route path="/previous"   element={<PreviousPage />} />
              <Route path="/dashboard"  element={<StudentDashboard />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/admin"      element={<AdminDashboard />} />
              <Route path="/history"    element={<PredictionHistory />} />
              <Route path="/admin-panel" element={<AdminPanel />} />
              <Route path="/login"      element={<LoginPage />} />
              <Route path="/register"   element={<RegisterPage />} />
              <Route path="*"           element={<Navigate to="/" />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
