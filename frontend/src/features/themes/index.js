// features/themes/index.js
// Public API barrel for the themes feature.
// Import from here instead of individual files.

export { ThemeContext, ThemeProvider, useTheme } from './ThemeProvider';
export { THEMES, buildCSSVariables } from './themes';
export { default as AppearanceModal } from './components/AppearanceModal';
export { ensureContrast, getContrastRatio, hexToRgb, getLuminance, adjustColor } from './utils/colorUtils';
