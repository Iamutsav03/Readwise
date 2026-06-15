// utils/textUtils.js
// Pure text-processing helpers used by promptBuilder and ragService.
// No external dependencies — safe to import anywhere.

/**
 * Count whitespace-delimited tokens in a string.
 * @param {string} str
 * @returns {number}
 */
function wordCount(str) {
  if (!str || typeof str !== "string") return 0;
  return str.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Heuristic check for mathematical expressions.
 * Looks for operator/bracket/equals characters combined with short length.
 *
 * @param {string} str
 * @returns {boolean}
 */
function containsMath(str) {
  if (!str || typeof str !== "string") return false;
  const mathPattern = /[\+\-\=\/\*\^\(\)\[\]]/;
  return mathPattern.test(str) && wordCount(str) < 15;
}

/**
 * Truncate a string to at most `n` characters, preserving whole words.
 * Appends "…" if the string was actually cut.
 *
 * @param {string} str
 * @param {number} n    - Maximum number of characters
 * @returns {string}
 */
function truncateToChars(str, n) {
  if (!str || typeof str !== "string") return "";
  if (str.length <= n) return str;

  // Cut at last word boundary before n
  const cut = str.slice(0, n).replace(/\s+\S*$/, "");
  return cut + "…";
}

module.exports = { wordCount, containsMath, truncateToChars };
