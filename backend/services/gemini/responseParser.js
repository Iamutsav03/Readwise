// services/gemini/responseParser.js
// Lightweight response normaliser for Gemini output.
// Centralises output validation so controllers never receive empty/null text.

/**
 * Parse and validate a raw Gemini response string.
 *
 * @param {string|null|undefined} raw  - Text returned by Gemini
 * @returns {{ ok: boolean, text: string, error?: string }}
 */
function parseResponse(raw) {
  if (raw === null || raw === undefined) {
    return { ok: false, text: "", error: "Gemini returned a null response." };
  }

  const text = String(raw).trim();

  if (text.length === 0) {
    return { ok: false, text: "", error: "Gemini returned an empty response." };
  }

  return { ok: true, text };
}

module.exports = { parseResponse };
