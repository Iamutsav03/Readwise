// src/utils/api.js
// All backend API calls are defined here in one place.
// If the backend URL ever changes, you only update it here.

import axios from "axios";

export const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";
const apiClient = axios.create({ baseURL: BASE_URL });

// Upload a PDF file to the backend
// Accepts a FormData object containing the file
export const uploadPDF = async (formData) => {
  const response = await apiClient.post("/pdfs/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// Fetch the list of all previously uploaded PDFs
export const fetchAllPDFs = async () => {
  const response = await apiClient.get("/pdfs");
  return response.data;
};

// Build the URL to view a specific PDF by filename
export const getPDFViewURL = (filename) => {
  return `${BASE_URL}/pdfs/view/${filename}`;
};

export const deletePDF = async (id) => {
  const res = await apiClient.delete(`/pdfs/${id}`);
  return res.data;
};

export const searchPDF = async (pdfId, query) => {
  const response = await apiClient.post(`/search/${pdfId}`, { query });
  return response.data;
};

// Record that the user opened a PDF (updates lastOpenedAt)
export const updatePdfLastOpened = async (id) => {
  const res = await apiClient.patch(`/pdfs/${id}/open`);
  return res.data;
};