// src/constants/panelConstants.js
// Side panel tab identifiers — must match the TABS registry in SidePanelShell.

/** @enum {string} */
export const PANEL_IDS = Object.freeze({
  SEARCH:     "search",
  HIGHLIGHTS: "highlights",
  BOOKMARKS:  "bookmarks",
  NOTES:      "notes",
  AI:         "ai",
});

/** Ordered list of all panel IDs (used for keyboard cycling etc.). */
export const PANEL_ORDER = [
  PANEL_IDS.SEARCH,
  PANEL_IDS.HIGHLIGHTS,
  PANEL_IDS.BOOKMARKS,
  PANEL_IDS.NOTES,
  PANEL_IDS.AI,
];
