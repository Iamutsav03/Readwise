// features/themes/utils/colorUtils.js
// Color contrast and manipulation utilities used by the theme system.
// Moved from src/utils/colorUtils.js into features/themes/utils/.

/** Convert a hex colour string to { r, g, b }. */
export function hexToRgb(hex) {
  let c = hex.substring(1);
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('');
  }
  const num = parseInt(c, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

/** Calculate WCAG relative luminance from RGB components. */
export function getLuminance(r, g, b) {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

/** WCAG contrast ratio between two hex colours. */
export function getContrastRatio(hex1, hex2) {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const lightest = Math.max(lum1, lum2);
  const darkest  = Math.min(lum1, lum2);
  return (lightest + 0.05) / (darkest + 0.05);
}

/** Lighten (amount > 0) or darken (amount < 0) a hex colour. Amount is -1 to 1. */
export function adjustColor(hex, amount) {
  const { r, g, b } = hexToRgb(hex);
  const adjust = c => Math.max(0, Math.min(255, Math.round(c + c * amount)));
  const toHex  = c => c.toString(16).padStart(2, '0');
  return `#${toHex(adjust(r))}${toHex(adjust(g))}${toHex(adjust(b))}`;
}

/**
 * Nudge a text colour until it meets the target contrast ratio against a
 * background. Falls back to pure black or white if nudging fails.
 */
export function ensureContrast(textColorHex, bgColorHex, targetRatio = 4.5) {
  let ratio = getContrastRatio(textColorHex, bgColorHex);
  if (ratio >= targetRatio) return textColorHex;

  const bgLuminance = getLuminance(...Object.values(hexToRgb(bgColorHex)));
  const isLightBg   = bgLuminance > 0.179;

  let adjustedHex = textColorHex;
  let attempts    = 0;

  while (ratio < targetRatio && attempts < 20) {
    adjustedHex = adjustColor(adjustedHex, isLightBg ? -0.1 : 0.1);
    ratio       = getContrastRatio(adjustedHex, bgColorHex);
    attempts++;
  }

  return ratio < targetRatio ? (isLightBg ? '#000000' : '#FFFFFF') : adjustedHex;
}
