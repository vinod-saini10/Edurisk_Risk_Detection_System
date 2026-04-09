/**
 * validateAuth.js — Reusable auth form validation (Step 5 extension)
 */

export function validateLoginForm(form) {
  const errors = {};
  if (!form.email || !form.email.trim()) {
    errors.email = "Email is required";
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = "Enter a valid email";
  }
  if (!form.password || !form.password.trim()) {
    errors.password = "Password is required";
  }
  return errors;
}

export function validateRegisterForm(form) {
  const errors = {};
  if (!form.name || !form.name.trim()) {
    errors.name = "Full name is required";
  }
  if (!form.email || !form.email.trim()) {
    errors.email = "Email is required";
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = "Enter a valid email";
  }
  if (!form.password || form.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }
  if (form.confirmPassword !== form.password) {
    errors.confirmPassword = "Passwords do not match";
  }
  return errors;
}
