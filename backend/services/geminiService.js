const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini client using API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generates an answer using the Gemini API.
 * Internal function without retries.
 */
async function generateAnswerInternal(prompt, timeoutMs = 30000) {
  // We require the API key to be set before making calls
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "YOUR_API_KEY_HERE") {
    const error = new Error("GEMINI_API_KEY is missing or invalid.");
    error.code = "INVALID_API_KEY";
    error.isFatal = true;
    throw error;
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  // Use AbortController for strict timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // Note: older versions of @google/generative-ai might not support signal,
    // so we also wrap in a Promise.race just in case.
    const generatePromise = model.generateContent(prompt, { signal: controller.signal });
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

/**
 * Determines if an error is temporary and safe to retry.
 */
function isRetryableError(error) {
  if (error.isFatal) return false;
  
  const msg = (error.message || "").toLowerCase();
  
  // Safe to retry
  if (
    error.status === 503 ||
    error.status === 504 ||
    error.status === 500 ||
    error.code === "TIMEOUT" ||
    error.code === "ECONNRESET" ||
    error.code === "ETIMEDOUT" ||
    msg.includes("503") ||
    msg.includes("unavailable") ||
    msg.includes("timeout") ||
    msg.includes("network") ||
    msg.includes("fetch")
  ) {
    // But do NOT retry on Bad Request or Auth errors
    if (error.status === 400 || error.status === 401 || error.status === 403 || msg.includes("api key") || msg.includes("invalid")) {
      return false;
    }
    return true;
  }
  return false;
}

/**
 * Generates an answer with exponential backoff retries.
 * @param {string} prompt
 * @returns {Promise<Object>} Structured { success, response, code, error }
 */
async function generateAnswer(prompt) {
  const maxRetries = 3;
  // Delays: Attempt 1 -> 2s, Attempt 2 -> 4s
  const retryDelays = [2000, 4000];

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const text = await generateAnswerInternal(prompt, 30000);
      return {
        success: true,
        response: text,
      };
    } catch (error) {
      const retryable = isRetryableError(error);
      
      console.error(`Gemini API Error (Attempt ${attempt + 1}/${maxRetries + 1}):`, error.message);

      if (!retryable || attempt === maxRetries) {
        // Final failure or fatal error
        return {
          success: false,
          code: error.code === "INVALID_API_KEY" ? "INVALID_API_KEY" : "AI_TEMPORARILY_UNAVAILABLE",
          error: error.message || "An error occurred while communicating with Gemini API.",
        };
      }

      // Wait before retrying
      const delay = retryDelays[attempt] || 4000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

module.exports = {
  generateAnswer,
};
