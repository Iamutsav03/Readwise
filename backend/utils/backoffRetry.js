// utils/backoffRetry.js
// Generic exponential-backoff retry utility.
// Extracted from geminiService.js so it can be reused across any async operation.

/**
 * Determines whether an error is transient and safe to retry.
 * Mirrors the logic originally inlined in geminiService.js.
 *
 * @param {Error} error
 * @returns {boolean}
 */
function isRetryable(error) {
  if (error.isFatal) return false;

  const msg = (error.message || "").toLowerCase();

  const transient =
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
    msg.includes("fetch");

  if (!transient) return false;

  // Never retry on auth / bad-request errors even if they look transient
  const fatal =
    error.status === 400 ||
    error.status === 401 ||
    error.status === 403 ||
    msg.includes("api key") ||
    msg.includes("invalid");

  return !fatal;
}

/**
 * Calls `fn` up to `maxRetries + 1` times, waiting `delays[attempt]` ms between
 * attempts. Returns whatever `fn` returns on success.
 * On final failure throws the last error.
 *
 * @param {() => Promise<any>} fn          - Async function to retry
 * @param {number}             maxRetries  - Number of additional attempts after first failure
 * @param {number[]}           delays      - Millisecond delay per retry (index 0 = after attempt 1)
 * @param {string}             [label]     - Optional label for log messages
 * @returns {Promise<any>}
 */
async function withRetry(fn, maxRetries = 3, delays = [2000, 4000], label = "withRetry") {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const retryable = isRetryable(error);
      console.error(`[${label}] Error (attempt ${attempt + 1}/${maxRetries + 1}):`, error.message);

      if (!retryable || attempt === maxRetries) {
        throw error;
      }

      const delay = delays[attempt] ?? delays[delays.length - 1] ?? 4000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

module.exports = { withRetry, isRetryable };
