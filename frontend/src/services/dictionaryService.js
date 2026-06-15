// src/services/dictionaryService.js
// Dictionary lookup API calls.
// Moved from features/dictionary/api/dictionaryApi.js into the shared services layer.

import { API_BASE_URL } from "../config";

const BASE = `${API_BASE_URL}/api/dictionary`;

/**
 * Look up a word — checks MongoDB cache first, then dictionaryapi.dev.
 * @param {string} word
 * @param {string} pdfId
 * @param {number} pageNumber
 */
export async function lookupWord(word, pdfId, pageNumber) {
  const res = await fetch(`${BASE}/lookup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ word, pdfId, pageNumber }),
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

/**
 * AI fallback explanation for a word.
 * @param {string} word
 * @param {string} pdfId
 * @param {number} pageNumber
 */
export async function lookupAIFallback(word, pdfId, pageNumber) {
  const res = await fetch(`${BASE}/explain`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ word, pdfId, pageNumber }),
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

/**
 * Save a word to the user's vocabulary for a specific PDF.
 * @param {string} pdfId
 * @param {object} wordData
 */
export async function saveWord(pdfId, wordData) {
  const res = await fetch(`${BASE}/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pdfId, ...wordData }),
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}
