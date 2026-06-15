// constants/highlightConstants.js
// Highlight colour options — must match the Mongoose enum in models/Highlight.js.

/** Valid highlight colour values accepted by the backend. */
const HIGHLIGHT_COLORS = Object.freeze(["yellow", "green", "blue", "pink"]);

/** Default colour applied when none is specified. */
const DEFAULT_HIGHLIGHT_COLOR = "yellow";

module.exports = {
  HIGHLIGHT_COLORS,
  DEFAULT_HIGHLIGHT_COLOR,
};
