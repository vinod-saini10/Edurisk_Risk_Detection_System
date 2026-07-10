/**
 * PredictPage.js — Step 5: Reusable validation via validate.js
 */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { predictStudent } from "../api/api";
import { validatePredictForm } from "../utils/validate";

const fields = [
  {
    name: "name",
    label: "Full Name",
    type: "text",
    min: null,
    max: null,
    placeholder: "e.g. Vinod Sharma",
    icon: "👤",
    hint: null,
  },
  {
    name: "email",
    label: "Email Address",
    type: "email",
    min: null,
    max: null,
    placeholder: "e.g. vinod@pcu.edu",
    icon: "✉️",
    hint: null,
  },
  {
    name: "attendance",
    label: "Attendance (%)",
    type: "number",
    min: 0,
    max: 100,
    placeholder: "Enter 0 – 100",
    icon: "📅",
    hint: "Range: 0 – 100%",
  },
  {
    name: "study_hours",
    label: "Study Hours/Day",
    type: "number",
    min: 0,
    max: 10,
    placeholder: "Enter 0 – 10",
    icon: "📖",
    hint: "Range: 0 – 10 hrs/day",
  },
  {
    name: "previous_marks",
    label: "Previous Marks",
    type: "number",
    min: 0,
    max: 100,
    placeholder: "Enter 0 – 100",
    icon: "📝",
    hint: "Range: 0 – 100",
  },
  {
    name: "assignment_score",
    label: "Assignment Score",
    type: "number",
    min: 0,
    max: 100,
    placeholder: "Enter 0 – 100",
    icon: "📋",
    hint: "Range: 0 – 100",
  },
  {
    name: "internal_marks",
    label: "Internal Marks",
    type: "number",
    min: 0,
    max: 100,
    placeholder: "Enter 0 – 100",
    icon: "🧪",
    hint: "Range: 0 – 100",
  },
];

const init = {
  name: "",
  email: "",
  attendance: "",
  study_hours: "",
  previous_marks: "",
  assignment_score: "",
  internal_marks: "",
};

export default function PredictPage() {
  const [form, setForm] = useState(init);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiErr, setApiErr] = useState("");
  const [touched, setTouched] = useState({});
  const nav = useNavigate();
  // ✅ AUTH CHECK (UPDATED)
  useEffect(() => {
    const token = sessionStorage.getItem("edurisk_token");

    if (!token) {
      nav("/login");
    }
  }, [nav]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newForm = { ...form, [name]: value };
    setForm(newForm);
    setApiErr("");
    // Live re-validate only touched fields
    if (touched[name]) {
      const errs = validatePredictForm(newForm);
      setErrors((p) => ({ ...p, [name]: errs[name] || "" }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((p) => ({ ...p, [name]: true }));
    const errs = validatePredictForm(form);
    setErrors((p) => ({ ...p, [name]: errs[name] || "" }));
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    // Mark all as touched and validate fully
    const allTouched = Object.fromEntries(fields.map((f) => [f.name, true]));
    setTouched(allTouched);
    const errs = validatePredictForm(form);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    setApiErr("");
    try {
      const { data } = await predictStudent({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        attendance: parseFloat(form.attendance),
        study_hours: parseFloat(form.study_hours),
        previous_marks: parseFloat(form.previous_marks),
        assignment_score: parseFloat(form.assignment_score),
        internal_marks: parseFloat(form.internal_marks),
      });
      nav("/result", { state: { result: data } });
    } catch (err) {
      if (!err.response) {
        setApiErr("Unable to connect to server.");
      } else {
        setApiErr(err.response.data?.error || "Prediction failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "2.5rem 1.5rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            fontFamily: "'Space Grotesk',sans-serif",
            fontSize: "1.9rem",
            fontWeight: 700,
            color: "#f1f5f9",
            marginBottom: 6,
          }}
        >
          Predict Academic Risk
        </h1>
        <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
          Fill in all academic details. The ML model will predict your score and
          classify your risk level.
        </p>
      </div>

      {apiErr && (
        <div
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: 10,
            padding: "0.9rem 1.2rem",
            marginBottom: "1.5rem",
            color: "#f87171",
            fontSize: "0.9rem",
          }}
        >
          ⚠ {apiErr}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        noValidate
        style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}
      >
        {fields.map((f) => {
          const hasError = !!errors[f.name];
          return (
            <div key={f.name}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "#94a3b8",
                  marginBottom: 6,
                  letterSpacing: "0.04em",
                }}
              >
                {f.icon} {f.label}
                {hasError && (
                  <span
                    style={{
                      color: "#f87171",
                      marginLeft: 6,
                      fontSize: "0.75rem",
                      fontWeight: 400,
                    }}
                  >
                    — {errors[f.name]}
                  </span>
                )}
              </label>
              <input
                id={f.name}
                name={f.name}
                type={f.type}
                min={f.min ?? undefined}
                max={f.max ?? undefined}
                step={f.type === "number" ? "0.01" : undefined}
                placeholder={f.placeholder}
                value={form[f.name]}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-invalid={hasError}
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  background: hasError
                    ? "rgba(239,68,68,0.07)"
                    : "rgba(255,255,255,0.05)",
                  border: `1px solid ${hasError ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)"}`,
                  borderRadius: 10,
                  color: "#f1f5f9",
                  fontSize: "0.95rem",
                  outline: "none",
                  transition: "border-color 0.2s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#4f6ef7")}
              />
              {f.hint && !hasError && (
                <p
                  style={{
                    margin: "3px 0 0 2px",
                    fontSize: "0.7rem",
                    color: "#475569",
                  }}
                >
                  {f.hint}
                </p>
              )}
            </div>
          );
        })}

        {/* Live validation summary */}
        {Object.values(errors).some(Boolean) && (
          <div
            style={{
              background: "rgba(239,68,68,0.06)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: 10,
              padding: "0.75rem 1rem",
              fontSize: "0.8rem",
            }}
          >
            <p style={{ margin: "0 0 4px", color: "#f87171", fontWeight: 600 }}>
              Please fix the following:
            </p>
            <ul style={{ margin: 0, paddingLeft: "1.2rem", color: "#fca5a5" }}>
              {Object.entries(errors)
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <li key={k}>{v}</li>
                ))}
            </ul>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: "0.5rem",
            background: loading
              ? "rgba(79,110,247,0.4)"
              : "linear-gradient(135deg,#4f6ef7,#7c3aed)",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            padding: "0.9rem",
            fontSize: "1rem",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: loading ? "none" : "0 4px 20px rgba(79,110,247,0.35)",
            transition: "all 0.2s",
          }}
        >
          {loading ? "⏳ Predicting…" : "🎯 Predict My Risk"}
        </button>
      </form>
    </div>
  );
}
