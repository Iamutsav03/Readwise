// src/utils/api.js
// All backend API calls are defined here in one place.
// If the backend URL ever changes, you only update it here.

import axios from "axios";

const BASE_URL = "http://localhost:5000/api";

// Upload a PDF file to the backend
// Accepts a FormData object containing the file
export const uploadPDF = async (formData) => {
  const response = await axios.post(`${BASE_URL}/pdfs/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// Fetch the list of all previously uploaded PDFs
export const fetchAllPDFs = async () => {
  const response = await axios.get(`${BASE_URL}/pdfs`);
  return response.data;
};

// Build the URL to view a specific PDF by filename
export const getPDFViewURL = (filename) => {
  return `http://localhost:5000/api/pdfs/view/${filename}`;
};

export const deletePDF = async (id) => {
  const res = await axios.delete(`${BASE_URL}/pdfs/${id}`);
  return res.data;
};

export const searchPDF = async (pdfId, query) => {
  const response = await axios.post(
    `${BASE_URL}/search/${pdfId}`,
    { query }
  );

  return response.data;
};