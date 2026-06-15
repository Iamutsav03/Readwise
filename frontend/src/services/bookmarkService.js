// src/services/bookmarkService.js
// Bookmark API calls.
// Moved from utils/bookmarkApi.js into the shared services layer.

import httpClient from "./httpClient";

const URL = "/bookmarks";

/**
 * Create / save a bookmark.
 * @param {string} pdfId
 * @param {number} pageNumber
 */
export const createBookmark = async (pdfId, pageNumber) => {
  const res = await httpClient.post(URL, { pdfId, pageNumber });
  return res.data;
};

/** Fetch all bookmarks for a specific PDF. */
export const getBookmarksForPdf = async (pdfId) => {
  const res = await httpClient.get(`${URL}/${pdfId}`);
  return res.data;
};

/**
 * Delete a bookmark for a specific PDF page.
 * @param {string} pdfId
 * @param {number} pageNumber
 */
export const removeBookmark = async (pdfId, pageNumber) => {
  const res = await httpClient.delete(`${URL}/${pdfId}/${pageNumber}`);
  return res.data;
};
