/**
 * validate.js — Step 5: Reusable frontend validation logic
 */

/**
 * Validates the prediction form.
 * @param {Object} form - form state object
 * @returns {Object} errors - key: fieldName, value: error message (empty = valid)
 */
export function validatePredictForm(form) {
  const errors = {};

  if (!form.name || !form.name.trim()) {
    errors.name = "Full name is required";
  }

  if (!form.email || !form.email.trim()) {
    errors.email = "Email address is required";
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = "Please enter a valid email";
  }

  const numRules = [
    { field: "attendance",       label: "Attendance",     min: 0,  max: 100 },
    { field: "study_hours",      label: "Study hours",    min: 0,  max: 10  },
    { field: "previous_marks",   label: "Previous marks", min: 0,  max: 100 },
    { field: "assignment_score", label: "Assignment",     min: 0,  max: 100 },
    { field: "internal_marks",   label: "Internal marks", min: 0,  max: 100 },
  ];

  numRules.forEach(({ field, label, min, max }) => {
    const raw = form[field];
    if (raw === "" || raw === undefined || raw === null) {
      errors[field] = `${label} is required`;
    } else {
      const v = parseFloat(raw);
      if (isNaN(v)) {
        errors[field] = `${label} must be a number`;
      } else if (v < min) {
        errors[field] = `${label} must be ≥ ${min}`;
      } else if (v > max) {
        errors[field] = `${label} must be ≤ ${max}`;
      }
    }
  });

  return errors;
}

/**
 * Returns true if the errors object has no keys (form is valid).
 */
export function isFormValid(errors) {
  return Object.keys(errors).length === 0;
}
