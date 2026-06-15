// src/services/aiService.js
// AI chat and explain endpoint calls.
// Moved from features/ai/api/aiApi.js into the shared services layer.

import { API_BASE_URL } from "../config";

const BASE = `${API_BASE_URL}/api/ai`;

// ── Chat ──────────────────────────────────────────────────────────────────────

/**
 * Send a chat message for a specific PDF and receive an AI response.
 * @param {string} pdfId
 * @param {string} message
 * @param {string} [featureType]
 * @param {string|null} [retryMessageId]
 * @param {object} [options]
 */
export const sendChatMessage = async (
  pdfId,
  message,
  featureType = "chat",
  retryMessageId = null,
  options = {}
) => {
  const response = await fetch(`${BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      pdfId,
      message,
      featureType,
      retryMessageId,
      pageScope:      options.pageScope      || "all",
      fromPage:       options.fromPage       || null,
      toPage:         options.toPage         || null,
      importance:     options.importance     || "high",
      featureOptions: options.featureOptions || {},
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw err;
  }
  return response.json();
};

// ── Explain selection ─────────────────────────────────────────────────────────

/**
 * Explains selected text — bypasses RAG/MongoDB.
 * @param {string} pdfId
 * @param {number} pageNumber
 * @param {string} selectedText
 * @param {string|null} [retryMessageId]
 */
export const sendExplainSelection = async (
  pdfId,
  pageNumber,
  selectedText,
  retryMessageId = null
) => {
  const response = await fetch(`${BASE}/explain-selection`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pdfId, pageNumber, selectedText, retryMessageId }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw err;
  }
  return response.json();
};

// ── History ───────────────────────────────────────────────────────────────────

/**
 * Fetch full chat history for a PDF (chronological order).
 * @param {string} pdfId
 * @returns {Promise<ChatMessage[]>}
 */
export async function fetchChatHistory(pdfId) {
  const res = await fetch(`${BASE}/history/${pdfId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch chat history.");
  return data.messages;
}

/**
 * Delete all chat messages for a PDF.
 * @param {string} pdfId
 */
export async function clearChatHistory(pdfId) {
  const res = await fetch(`${BASE}/history/${pdfId}`, { method: "DELETE" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to clear chat history.");
  return data;
}
