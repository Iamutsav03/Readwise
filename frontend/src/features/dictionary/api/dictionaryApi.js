import { API_BASE_URL } from "../../../config";

const BASE = API_BASE_URL;

/**
 * Look up a word in the dictionary.
 * Checks MongoDB cache first, then fetches from dictionaryapi.dev.
 * @param {string} word
 * @param {string} pdfId
 * @param {number} pageNumber
 */
export async function lookupWord(word, pdfId, pageNumber) {
  const res = await fetch(`${BASE}/api/dictionary/lookup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ word, pdfId, pageNumber }),
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

/**
 * Fallback to AI for word explanation.
 * @param {string} word
 * @param {string} pdfId
 * @param {number} pageNumber
 */
export async function lookupAIFallback(word, pdfId, pageNumber) {
  const res = await fetch(`${BASE}/api/dictionary/explain`, {
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
  const res = await fetch(`${BASE}/api/dictionary/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pdfId, ...wordData }),
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}
