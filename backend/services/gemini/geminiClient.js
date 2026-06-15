// services/gemini/geminiClient.js
// Gemini SDK initialisation and retry-wrapped content generation.
// Extracted from services/geminiService.js.

const { GoogleGenerativeAI } = require("@google/generative-ai");
const { withRetry } = require("../../utils/backoffRetry");
const {
  MODEL_NAME,
  MAX_RETRIES,
  RETRY_DELAYS,
  GEMINI_TIMEOUT_MS,
} = require("../../constants/aiConstants");

// Initialise once at module load — key is validated by validateEnv on startup.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─── Internal ─────────────────────────────────────────────────────────────────

/**
 * Single attempt to call Gemini, with an AbortController timeout.
 * @param {string} prompt
 * @param {number} [timeoutMs]
 * @returns {Promise<string>} Raw text response
 */
async function generateAnswerInternal(prompt, timeoutMs = GEMINI_TIMEOUT_MS) {
  if (
    !process.env.GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY === "YOUR_API_KEY_HERE"
  ) {
    const error = new Error("GEMINI_API_KEY is missing or invalid.");
    error.code = "INVALID_API_KEY";
    error.isFatal = true;
    throw error;
  }

  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const generatePromise = model.generateContent(prompt, {
      signal: controller.signal,
    });
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => {
        const err = new Error("Gemini request timed out");
        err.code = "TIMEOUT";
        reject(err);
      }, timeoutMs)
    );

    const result = await Promise.race([generatePromise, timeoutPromise]);
    const response = await result.response;
    return response.text();
  } catch (error) {
    if (error.name === "AbortError" || error.code === "TIMEOUT") {
      error.code = "TIMEOUT";
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Generate a Gemini response with automatic exponential-backoff retries.
 *
 * @param {string} prompt
 * @returns {Promise<{ success: boolean, response?: string, code?: string, error?: string }>}
 */
async function generateAnswer(prompt) {
  try {
    const text = await withRetry(
      () => generateAnswerInternal(prompt),
      MAX_RETRIES,
      RETRY_DELAYS,
      "GeminiClient"
    );
    return { success: true, response: text };
  } catch (error) {
    return {
      success: false,
      code:
        error.code === "INVALID_API_KEY"
          ? "INVALID_API_KEY"
          : "AI_TEMPORARILY_UNAVAILABLE",
      error:
        error.message ||
        "An error occurred while communicating with the Gemini API.",
    };
  }
}

module.exports = { generateAnswer };
