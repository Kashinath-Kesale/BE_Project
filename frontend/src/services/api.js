// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: (import.meta.env.VITE_BACKEND_URL || "http://localhost:5000") + "/api",
  withCredentials: true,
});

// Attach Authorization header from localStorage token for every request (if present).
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // ignore (e.g., SSR or blocked access)
  }
  return config;
});

// Response interceptor to handle 401s globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        // Clear session data
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Redirect to login if not already there
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      } else if (error.response.status === 403) {
        // Access Denied
        console.warn("Access Denied: You do not have permission to view this page.");
        window.location.href = "/login"; // Provide a way to switch accounts
      }
    }
    return Promise.reject(error);
  }
);

export default api;
