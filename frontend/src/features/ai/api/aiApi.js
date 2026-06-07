// features/ai/api/aiApi.js
// API functions for AI-related backend endpoints.
// Designed to be extended with summaries, flashcards, quizzes, etc.

const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

/**
 * Send a chat message for a specific PDF and receive an AI response.
 * The backend retrieves relevant page context from MongoDB before calling Gemini.
 *
 * @param {string} pdfId
 * @param {string} message
 * @param {"chat"|"summary"|"flashcards"|"quiz"|"explain"|"note_expansion"} featureType
 */
export const sendChatMessage = async (pdfId, message, featureType = "chat", retryMessageId = null, options = {}) => {
  const response = await fetch(`${BASE}/api/ai/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pdfId,
      message,
      featureType,
      retryMessageId,
      // Page scoping and study tool options
      pageScope: options.pageScope || "all",
      fromPage: options.fromPage || null,
      toPage: options.toPage || null,
      importance: options.importance || "high",
      featureOptions: options.featureOptions || {},
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    // Throw an object so we can read the structured error code
    throw err;
  }

  return response.json();
}; // { success, userMessage, assistantMessage }

/**
 * Explains selected text bypassing RAG/MongoDB.
 */
export const sendExplainSelection = async (pdfId, pageNumber, selectedText, retryMessageId = null) => {
  const response = await fetch(`${BASE}/api/ai/explain-selection`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pdfId, pageNumber, selectedText, retryMessageId }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw err;
  }

  return response.json();
};

/**
 * Fetch full chat history for a PDF (chronological order).
 * @param {string} pdfId
 */
export async function fetchChatHistory(pdfId) {
  const res = await fetch(`${BASE}/api/ai/history/${pdfId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch chat history.");
  return data.messages; // Array of AiChatMessage documents
}

/**
 * Delete all chat messages for a PDF.
 * @param {string} pdfId
 */
export async function clearChatHistory(pdfId) {
  const res = await fetch(`${BASE}/api/ai/history/${pdfId}`, { method: "DELETE" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to clear chat history.");
  return data;
}
