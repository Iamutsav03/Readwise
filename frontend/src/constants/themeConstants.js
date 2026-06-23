// src/constants/themeConstants.js
// Theme IDs and default — must match keys in features/themes/themes.js.

/** @enum {string} */
export const THEME_IDS = Object.freeze({
  // Light
  WARM_PARCHMENT:  'warm-parchment',
  SAGE_READER:     'sage-reader',
  OCEAN_MIST:      'ocean-mist',
  NORDIC_PAPER:    'nordic-paper',
  ROSE_IVORY:      'rose-ivory',
  SEPIA_SCHOLAR:   'sepia-scholar',
  FOREST_MIST:     'forest-mist',
  // Dark
  MIDNIGHT_READER: 'midnight-reader',
  OBSIDIAN_PRO:    'obsidian-pro',
  AMOLED_BLACK:    'amoled-black',
  // Premium
  VINTAGE_LIBRARY: 'vintage-library',
  KYOTO_MATCHA:    'kyoto-matcha',
  MOONLIGHT_PAPER: 'moonlight-paper',
  COFFEE_HOUSE:    'coffee-house',
  ACADEMIC_BLUE:   'academic-blue',
  CRIMSON_STUDY:   'crimson-study',
  SLATE_FOCUS:     'slate-focus',
});

/** The theme applied when no preference is stored. */
export const DEFAULT_THEME_ID = THEME_IDS.WARM_PARCHMENT;

/** LocalStorage key used to persist the active theme. */
export const THEME_STORAGE_KEY = 'rw_theme_id';
