// services/pdfActions.js
// Centralises all mutating PDF API calls so components stay thin.

import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";
const api = axios.create({ baseURL: BASE_URL });

/**
 * Toggle isFavorite on a PDF.
 * Returns the updated PDF document.
 */
export const toggleFavorite = async (id) => {
  const res = await api.patch(`/pdfs/${id}/favorite`);
  return res.data.pdf;
};

/**
 * Rename a PDF by updating its originalName.
 * name must be 1–120 chars (trimming is also done server-side).
 * Returns the updated PDF document.
 */
export const renamePdf = async (id, name) => {
  const res = await api.patch(`/pdfs/${id}/rename`, { name });
  return res.data.pdf;
};

/**
 * Delete a PDF and all its associated data.
 */
export const deletePdf = async (id) => {
  const res = await api.delete(`/pdfs/${id}`);
  return res.data;
};
