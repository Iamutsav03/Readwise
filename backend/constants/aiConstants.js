// constants/aiConstants.js
// Centralised AI and RAG configuration constants.

/** Gemini model to use for all AI features. */
const MODEL_NAME = "gemini-2.5-flash";

/** Max number of retry attempts for Gemini API calls (inclusive of first attempt). */
const MAX_RETRIES = 3;

/** Millisecond delays between retry attempts (index 0 = after attempt 1, etc.). */
const RETRY_DELAYS = [2000, 4000];

/** Max characters of PDF context sent to Gemini in a single prompt. */
const MAX_CONTEXT_CHARS = 4000;

/** Max conversation history messages included in a chat prompt. */
const MAX_HISTORY_MESSAGES = 10;

/** Max number of PDF pages fetched from MongoDB text-search for RAG. */
const MAX_SEARCH_PAGES = 10;

/** Max number of context paragraphs selected per request. */
const MAX_PARAGRAPHS = 5;

/** Gemini API request timeout in milliseconds. */
const GEMINI_TIMEOUT_MS = 30000;

module.exports = {
  MODEL_NAME,
  MAX_RETRIES,
  RETRY_DELAYS,
  MAX_CONTEXT_CHARS,
  MAX_HISTORY_MESSAGES,
  MAX_SEARCH_PAGES,
  MAX_PARAGRAPHS,
  GEMINI_TIMEOUT_MS,
};
