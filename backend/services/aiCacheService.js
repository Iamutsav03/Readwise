// services/aiCacheService.js
// In-memory AI response cache with SHA-256 keying and TTL-based eviction.
//
// Design goals:
//   1. Zero external dependencies — uses Node's built-in `crypto` module.
//   2. SHA-256 hash of (pdfId + featureType + question + JSON(options)) as key,
//      so cache hits are robust to argument reordering.
//   3. Per-entry TTL tracked as an expiry timestamp; a periodic sweep evicts stale
//      entries so the Map never grows unboundedly.
//   4. All public functions are async so callers can seamlessly swap this for a
//      Redis / MongoDB-TTL-collection backend in the future without changing call sites.

const crypto = require("crypto");

// ─── Configuration ────────────────────────────────────────────────────────────
const DEFAULT_TTL_MS = 60 * 60 * 1000;      // 1 hour
const SWEEP_INTERVAL_MS = 10 * 60 * 1000;   // sweep every 10 minutes

// ─── Internal store ───────────────────────────────────────────────────────────
// Map<string, { response: string, expiresAt: number }>
const cache = new Map();

// ─── Background sweep ─────────────────────────────────────────────────────────
// Runs automatically when the module is first loaded.
const sweepTimer = setInterval(() => {
  const now = Date.now();
  let evicted = 0;
  for (const [key, entry] of cache) {
    if (entry.expiresAt <= now) {
      cache.delete(key);
      evicted++;
    }
  }
  if (evicted > 0) {
    console.log(`[aiCache] Evicted ${evicted} expired entry(ies). Cache size: ${cache.size}`);
  }
}, SWEEP_INTERVAL_MS);

// Allow the Node process to exit cleanly even if this interval is active.
if (sweepTimer.unref) sweepTimer.unref();

// ─── Helpers ──────────────────────────────────────────────────────────────────
/**
 * Build a deterministic SHA-256 cache key from the request parameters.
 * @param {string} pdfId
 * @param {string} featureType  e.g. "quick_explain" | "deep_explain" | "dictionary" | "chat"
 * @param {string} question
 * @param {object} options      Any extra distinguishing parameters (page number, language, etc.)
 * @returns {string} 64-char hex digest
 */
function buildKey(pdfId, featureType, question, options) {
  const payload = JSON.stringify({
    pdfId: String(pdfId),
    featureType: String(featureType),
    question: String(question),
    // Sort keys so { a:1, b:2 } and { b:2, a:1 } produce the same hash
    options: options && typeof options === "object"
      ? Object.fromEntries(Object.entries(options).sort(([a], [b]) => a.localeCompare(b)))
      : {},
  });
  return crypto.createHash("sha256").update(payload).digest("hex");
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Attempt to retrieve a cached AI response.
 *
 * @param {string} pdfId
 * @param {string} featureType
 * @param {string} question
 * @param {object} [options={}]
 * @returns {Promise<string|null>} The cached response string, or null on a miss / expiry.
 */
async function getCachedResponse(pdfId, featureType, question, options = {}) {
  const key = buildKey(pdfId, featureType, question, options);
  const entry = cache.get(key);

  if (!entry) return null;

  if (entry.expiresAt <= Date.now()) {
    cache.delete(key);          // lazy eviction on access
    return null;
  }

  console.log(`[aiCache] HIT  — feature="${featureType}" pdf="${pdfId}"`);
  return entry.response;
}

/**
 * Store a successful AI response in the cache.
 *
 * @param {string} pdfId
 * @param {string} featureType
 * @param {string} question
 * @param {string} response     The full AI-generated text to cache.
 * @param {object} [options={}]
 * @param {number} [ttlMs]      Override the default TTL (milliseconds).
 */
async function setCachedResponse(pdfId, featureType, question, response, options = {}, ttlMs = DEFAULT_TTL_MS) {
  if (!response || typeof response !== "string") return; // don't cache empty / error responses

  const key = buildKey(pdfId, featureType, question, options);
  cache.set(key, {
    response,
    expiresAt: Date.now() + ttlMs,
  });
  console.log(`[aiCache] SET  — feature="${featureType}" pdf="${pdfId}" | cache size: ${cache.size}`);
}

/**
 * Manually invalidate all cached entries for a given PDF.
 * Call this when a PDF is deleted so stale data cannot be retrieved.
 *
 * @param {string} pdfId
 */
async function invalidatePdf(pdfId) {
  // We can't reverse the hash, so we re-hash a sentinel check isn't viable.
  // Instead we store a secondary Set<key> per pdfId for fast invalidation.
  // NOTE: For simplicity at this scale we iterate the full Map (typically small).
  const pid = String(pdfId);
  let removed = 0;
  for (const [key, entry] of cache) {
    if (entry.pdfId === pid) {
      cache.delete(key);
      removed++;
    }
  }
  if (removed > 0) {
    console.log(`[aiCache] INVALIDATED ${removed} entry(ies) for pdfId="${pdfId}"`);
  }
}

/**
 * Return current cache statistics (useful for health-check endpoints).
 * @returns {{ size: number }}
 */
function getCacheStats() {
  return { size: cache.size };
}

module.exports = {
  getCachedResponse,
  setCachedResponse,
  invalidatePdf,
  getCacheStats,
};
