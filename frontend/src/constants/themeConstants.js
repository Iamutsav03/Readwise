// src/constants/themeConstants.js
// Theme IDs and default — must match keys in src/theme/themes.js.

/** @enum {string} */
export const THEME_IDS = Object.freeze({
  WARM_CREAM:  "warm-cream",
  SAGE_GREEN:  "sage-green",
  OCEAN_BLUE:  "ocean-blue",
  LAVENDER:    "lavender",
  SEPIA:       "sepia",
  DARK_MODE:   "dark-mode",
});

/** The theme applied when no preference is stored. */
export const DEFAULT_THEME_ID = THEME_IDS.WARM_CREAM;

/** LocalStorage key used to persist the active theme. */
export const THEME_STORAGE_KEY = "rw_theme_id";
