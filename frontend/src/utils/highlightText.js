// src/utils/highlightText.js
//
// IMPORTANT: react-pdf's customTextRenderer uses dangerouslySetInnerHTML
// internally — it expects a plain HTML *string*, NOT a React element.
// Returning JSX causes the browser to coerce the element object to the
// string "[object Object]", which is exactly the bug we saw.

/**
 * Escapes regex special characters so they are treated as literals.
 */
const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Escapes <, >, & in a text fragment so injecting it into innerHTML is safe.
 */
const escapeHtml = (str) =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

/**
 * Returns an HTML string with every case-insensitive occurrence of `query`
 * inside `text` wrapped in a <mark> tag.
 *
 * Returns the original `text` string (unmodified) when:
 *   - text is empty / falsy
 *   - query is empty / whitespace-only
 *   - there are no matches on this text fragment
 *
 * @param {string} text  - Raw text content of a react-pdf text item
 * @param {string} query - The active search term
 * @returns {string}     - Plain HTML string (safe for dangerouslySetInnerHTML)
 */
export function highlightText(text, query) {
  if (!text) return text ?? "";

  const trimmedQuery = query ? query.trim() : "";
  if (!trimmedQuery) return text;

  const escapedQuery = escapeRegExp(trimmedQuery);
  const regex = new RegExp(`(${escapedQuery})`, "gi");

  // If there are no matches, return the raw text unchanged (avoids re-splitting).
  if (!regex.test(text)) return text;

  // Reset lastIndex after test()
  regex.lastIndex = 0;

  return text.replace(
    regex,
    (match) =>
      `<mark style="` +
      `background:rgba(250,200,80,0.75);` +
      `color:#1a0e00;` +
      `font-weight:700;` +
      `border-radius:2px;` +
      `padding:0 1px;` +
      `box-shadow:0 0 0 1px rgba(200,160,60,0.8);` +
      `">${escapeHtml(match)}</mark>`
  );
}
