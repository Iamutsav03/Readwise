// src/utils/highlightApi.js
import axios from "axios";

const BASE_URL = "http://localhost:5000/api/highlights";

/**
 * Create a new highlight
 * @param {string} pdfId
 * @param {number} pageNumber
 * @param {string} selectedText
 * @param {string} color - enum: ['yellow', 'green', 'blue', 'pink']
 * @param {Array<{x, y, w, h}>} rects - fractions of page dimensions
 */
export const createHighlight = async (pdfId, pageNumber, selectedText, color, rects) => {
  const response = await axios.post(BASE_URL, {
    pdfId,
    pageNumber,
    selectedText,
    color,
    rects,
  });
  return response.data;
};

/**
 * Fetch all highlights for a specific PDF
 * @param {string} pdfId
 */
export const getHighlightsForPdf = async (pdfId) => {
  const response = await axios.get(`${BASE_URL}/${pdfId}`);
  return response.data;
};

/**
 * Delete a highlight by ID
 * @param {string} id
 */
export const deleteHighlight = async (id) => {
  const response = await axios.delete(`${BASE_URL}/${id}`);
  return response.data;
};
