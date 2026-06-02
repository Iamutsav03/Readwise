// src/utils/bookmarkApi.js
// API helpers for bookmark operations.

import axios from "axios";
import { BASE_URL } from "./api";

const BOOKMARKS_URL = `${BASE_URL}/bookmarks`;

/**
 * Creates/saves a bookmark on the backend.
 * @param {string} pdfId
 * @param {number} pageNumber
 * @returns {Promise<object>} The saved bookmark object
 */
export const createBookmark = async (pdfId, pageNumber) => {
  const response = await axios.post(BOOKMARKS_URL, { pdfId, pageNumber });
  return response.data;
};

/**
 * Fetches all bookmarks for a specific PDF from the backend.
 * @param {string} pdfId
 * @returns {Promise<object[]>} Array of bookmark objects
 */
export const getBookmarksForPdf = async (pdfId) => {
  const response = await axios.get(`${BOOKMARKS_URL}/${pdfId}`);
  return response.data;
};

/**
 * Deletes a bookmark for a specific PDF page from the backend.
 * @param {string} pdfId
 * @param {number} pageNumber
 * @returns {Promise<object>} Confirmation message
 */
export const removeBookmark = async (pdfId, pageNumber) => {
  const response = await axios.delete(`${BOOKMARKS_URL}/${pdfId}/${pageNumber}`);
  return response.data;
};
