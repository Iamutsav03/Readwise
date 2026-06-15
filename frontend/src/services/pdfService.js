// src/services/pdfService.js
// All PDF CRUD and library API calls.
// Merges utils/api.js + services/pdfActions.js into one domain service.

import httpClient from "./httpClient";
import { API_BASE_URL } from "../config";

// ── Library operations ────────────────────────────────────────────────────────

/** Upload a PDF. Accepts a FormData object containing the file. */
export const uploadPDF = async (formData) => {
  const res = await httpClient.post("/pdfs/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

/** Fetch all PDFs sorted by lastOpenedAt desc. */
export const fetchAllPDFs = async () => {
  const res = await httpClient.get("/pdfs");
  return res.data;
};

/** Build the URL to stream a specific PDF by filename. */
export const getPDFViewURL = (filename) =>
  `${API_BASE_URL}/api/pdfs/view/${filename}`;

/** Delete a PDF and all its associated data. */
export const deletePdf = async (id) => {
  const res = await httpClient.delete(`/pdfs/${id}`);
  return res.data;
};

/** Record that the user opened a PDF (updates lastOpenedAt). */
export const updatePdfLastOpened = async (id) => {
  const res = await httpClient.patch(`/pdfs/${id}/open`);
  return res.data;
};

/** Toggle isFavorite on a PDF. Returns the updated PDF document. */
export const toggleFavorite = async (id) => {
  const res = await httpClient.patch(`/pdfs/${id}/favorite`);
  return res.data.pdf;
};

/** Rename a PDF (1–120 characters). Returns the updated PDF document. */
export const renamePdf = async (id, name) => {
  const res = await httpClient.patch(`/pdfs/${id}/rename`, { name });
  return res.data.pdf;
};

// ── Search ────────────────────────────────────────────────────────────────────

/** Full-text search within a PDF's extracted page text. */
export const searchPDF = async (pdfId, query) => {
  const res = await httpClient.post(`/search/${pdfId}`, { query });
  return res.data;
};
