// src/services/httpClient.js
// Shared Axios instance used by all domain service files.
// Centralises baseURL and response/error interceptors in one place.

import axios from "axios";
import { API_BASE_URL } from "../config";

const httpClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor ───────────────────────────────────────────────────────
httpClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("rw_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor ──────────────────────────────────────────────────────
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Normalise error shape so callers always get { message, status }
    const status = error.response?.status;
    
    // Handle 401 globally
    if (status === 401) {
      localStorage.removeItem("rw_token");
      // Force reload to let AuthProvider pick up the cleared token and redirect
      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }

    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "An unexpected error occurred.";
    const normalised = new Error(message);
    normalised.status = status;
    normalised.original = error;
    return Promise.reject(normalised);
  }
);

export default httpClient;
