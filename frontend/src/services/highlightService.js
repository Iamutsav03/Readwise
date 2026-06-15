// src/services/highlightService.js
// Highlight CRUD API calls.
// Moved from utils/highlightApi.js into the shared services layer.

import httpClient from "./httpClient";

const URL = "/highlights";

/**
 * Create a new highlight.
 * @param {string}   pdfId
 * @param {number}   pageNumber
 * @param {string}   selectedText
 * @param {string}   color        - 'yellow' | 'green' | 'blue' | 'pink'
 * @param {Rect[]}   rects        - Fractions of page dimensions
 */
export const createHighlight = async (pdfId, pageNumber, selectedText, color, rects) => {
  const res = await httpClient.post(URL, { pdfId, pageNumber, selectedText, color, rects });
  return res.data;
};

/** Fetch all highlights for a specific PDF. */
export const getHighlightsForPdf = async (pdfId) => {
  const res = await httpClient.get(`${URL}/${pdfId}`);
  return res.data;
};

/** Delete a highlight by its ID. */
export const deleteHighlight = async (id) => {
  const res = await httpClient.delete(`${URL}/${id}`);
  return res.data;
};
