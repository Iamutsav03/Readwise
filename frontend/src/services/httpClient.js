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
    } else {
      // Attach guest ID for unauthenticated requests
      const guestId = localStorage.getItem("rw_guest_id");
      if (guestId) {
        config.headers["X-Guest-Id"] = guestId;
      }
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
    const code   = error.response?.data?.code;
    
    // Handle 401 globally — clear token and redirect
    if (status === 401) {
      localStorage.removeItem("rw_token");
      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }

    // Handle 403 guest limit — broadcast event so PremiumModal can open
    if (status === 403 && code === "GUEST_LIMIT_REACHED") {
      const trigger = error.response?.data?.trigger || "default";
      window.dispatchEvent(new CustomEvent("rw:guest-limit", { detail: { trigger } }));
    }

    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "An unexpected error occurred.";
    const normalised = new Error(message);
    normalised.status = status;
    normalised.code   = code;
    normalised.original = error;
    return Promise.reject(normalised);
  }
);

export default httpClient;
