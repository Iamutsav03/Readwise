// src/constants/highlightConstants.js
// Highlight colour options — must match backend enum in models/Highlight.js.

export const HIGHLIGHT_COLORS = Object.freeze(["yellow", "green", "blue", "pink"]);

export const DEFAULT_HIGHLIGHT_COLOR = "yellow";

/** Hex values for rendering highlight overlays in the PDF canvas. */
export const HIGHLIGHT_COLOR_MAP = Object.freeze({
  yellow: "rgba(255, 213, 0, 0.35)",
  green:  "rgba(72, 199, 116, 0.35)",
  blue:   "rgba(72, 133, 237, 0.35)",
  pink:   "rgba(255, 105, 180, 0.35)",
});
