// src/utils/bookmarkApi.js
// API helpers for bookmark operations.

import axios from "axios";

const BASE_URL = "http://localhost:5000/api/bookmarks";

/**
 * Creates/saves a bookmark on the backend.
 * @param {string} pdfId
 * @param {number} pageNumber
 * @returns {Promise<object>} The saved bookmark object
 */
export const createBookmark = async (pdfId, pageNumber) => {
  const response = await axios.post(BASE_URL, { pdfId, pageNumber });
  return response.data;
};

/**
 * Fetches all bookmarks for a specific PDF from the backend.
 * @param {string} pdfId
 * @returns {Promise<object[]>} Array of bookmark objects
 */
export const getBookmarksForPdf = async (pdfId) => {
  const response = await axios.get(`${BASE_URL}/${pdfId}`);
  return response.data;
};

/**
 * Deletes a bookmark for a specific PDF page from the backend.
 * @param {string} pdfId
 * @param {number} pageNumber
 * @returns {Promise<object>} Confirmation message
 */
export const removeBookmark = async (pdfId, pageNumber) => {
  const response = await axios.delete(`${BASE_URL}/${pdfId}/${pageNumber}`);
  return response.data;
};
