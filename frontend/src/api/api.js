import axios from "axios";
//console.log("API URL:", process.env.REACT_APP_API_URL);

const API_BASE = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔥 REQUEST INTERCEPTOR: Attach token to every request
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("edurisk_token");
    if (token) {
      // Safely ensure headers object exists before setting Authorization
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 🔒 RESPONSE INTERCEPTOR: Handle expired / invalid tokens globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      // Token missing, expired, or invalid — clear storage and redirect to login
      sessionStorage.removeItem("edurisk_token");
      sessionStorage.removeItem("edurisk_user");
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    // 403 (admin role required) — let the calling component handle it
    return Promise.reject(error);
  },
);

// --- AUTH ---
export const loginUser = async (data) => {
  const res = await api.post("/auth/login", data);

  // 🔥 Consolidate Storage Logic
  if (res.data.access_token) {
    sessionStorage.setItem("edurisk_token", res.data.access_token);
    sessionStorage.setItem("edurisk_user", JSON.stringify(res.data.user));
  }
  return res;
};

export const registerUser = (data) => api.post("/auth/register", data);
export const getProfile = () => api.get("/auth/profile");

// --- PREDICTION ---
export const predictStudent = (data) => api.post("/predict", data);
export const uploadBulkCSV = (formData) =>
  api.post("/predict/bulk", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const getModelInfo = () => api.get("/predict/info");

// --- HISTORY ---
export const getHistory = () => api.get("/history");
export const getPrevious = (data) => api.post("/history/previous", data);

// --- STUDENT ---
export const getStudentPredictions = () => api.get("/student/predictions");
export const exportStudentPredictions = () =>
  api.get("/student/predictions/export", { responseType: "blob" });
export const getStudentProfile = () => api.get("/student/profile");
export const upsertStudentProfile = (data) =>
  api.post("/student/profile", data);
export const uploadProfileImage = (formData) =>
  api.post("/student/profile/photo", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Explain a historical prediction by id
export const explainPrediction = (predictionId) =>
  api.get(`/predict/explain/${predictionId}`);

// --- ADMIN ---
export const getAdminCharts = () => api.get("/admin/charts");
export const getAllPredictions = () => api.get("/admin/predictions");
export const getAllUsers = () => api.get("/admin/users");
export const deleteUser = (id) => api.delete(`/admin/user/${id}`);
export const getAdminAnalytics = () => api.get("/admin/analytics");
export const getAdminInsights = () => api.get("/admin/insights");
export const getModelMetrics = () => api.get("/admin/model-metrics");

// --- EXPORT ---
export const exportCSV = () =>
  api.get("/admin/export", { responseType: "blob" });

// --- LOGOUT ---
export const logoutUser = () => {
  sessionStorage.removeItem("edurisk_token");
  sessionStorage.removeItem("edurisk_user");
  window.location.href = "/login"; // Force redirect
};

export default api;

// --- Notifications ---
export const sendEmailAlert = (data) => api.post("/notify/email", data);
