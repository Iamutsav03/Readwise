// src/utils/highlightHelpers.js

export const HIGHLIGHT_COLORS = [
  { id: "yellow", label: "Yellow", bg: "rgba(250, 200, 80, 0.5)", border: "rgba(200, 160, 60, 0.8)" },
  { id: "green", label: "Green", bg: "rgba(100, 230, 150, 0.5)", border: "rgba(80, 180, 120, 0.8)" },
  { id: "blue", label: "Blue", bg: "rgba(100, 180, 255, 0.5)", border: "rgba(80, 140, 200, 0.8)" },
  { id: "pink", label: "Pink", bg: "rgba(255, 120, 180, 0.5)", border: "rgba(200, 90, 140, 0.8)" },
];

export const COLOR_MAP = HIGHLIGHT_COLORS.reduce((acc, c) => {
  acc[c.id] = c;
  return acc;
}, {});

/**
 * Given a DOM Range and a container element, computes the bounding rects
 * of the range as percentages (0-1 fractions) of the container's dimensions.
 * This ensures highlights remain correctly positioned when the PDF is zoomed.
 *
 * @param {Range} range - The DOM Range of the selected text
 * @param {HTMLElement} container - The container element (e.g., react-pdf's .react-pdf__Page)
 * @returns {Array<{x, y, w, h}>} Array of rects as fractions of container dimensions
 */
export const getSelectionRects = (range, container) => {
  if (!range || !container) return [];
  if (!container.classList.contains("react-pdf__Page")) return [];

  const clientRects = Array.from(range.getClientRects());
  const containerRect = container.getBoundingClientRect();

  return clientRects.map((rect) => {
    // Calculate relative coordinates
    const relativeLeft = rect.left - containerRect.left;
    const relativeTop = rect.top - containerRect.top;

    // Convert to fractions (0 to 1)
    const x = relativeLeft / containerRect.width;
    const y = relativeTop / containerRect.height;
    const w = rect.width / containerRect.width;
    const h = rect.height / containerRect.height;

    return { x, y, w, h };
  });
};
