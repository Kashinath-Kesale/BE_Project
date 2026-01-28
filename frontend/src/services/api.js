// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: (import.meta.env.VITE_BACKEND_URL || "http://localhost:5000") + "/api",
  withCredentials: true,
});

// Request interceptor: Attach token
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // Ignore
  }
  return config;
});

// Response interceptor: Handle 401/403
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.clear();

        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      } else if (error.response.status === 403) {
        console.warn("Access Denied");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
