// src/utils/colorUtils.js

// Convert hex to rgb
export function hexToRgb(hex) {
  let c = hex.substring(1);
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('');
  }
  const num = parseInt(c, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

// Calculate relative luminance
export function getLuminance(r, g, b) {
  const a = [r, g, b].map(function (v) {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

// Calculate contrast ratio between two colors
export function getContrastRatio(hex1, hex2) {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const lightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (lightest + 0.05) / (darkest + 0.05);
}

// Lighten or darken a hex color (amount from -1 to 1)
export function adjustColor(hex, amount) {
  const { r, g, b } = hexToRgb(hex);
  const adjust = (c) => Math.max(0, Math.min(255, Math.round(c + (c * amount))));
  const toHex = (c) => c.toString(16).padStart(2, '0');
  return `#${toHex(adjust(r))}${toHex(adjust(g))}${toHex(adjust(b))}`;
}

// Force minimum contrast
export function ensureContrast(textColorHex, bgColorHex, targetRatio = 4.5) {
  let ratio = getContrastRatio(textColorHex, bgColorHex);
  if (ratio >= targetRatio) return textColorHex;

  // Determine if background is light or dark
  const bgLuminance = getLuminance(...Object.values(hexToRgb(bgColorHex)));
  const isLightBg = bgLuminance > 0.179;

  let adjustedHex = textColorHex;
  let attempts = 0;
  
  // Nudge the color until it passes or we hit the limit
  while (ratio < targetRatio && attempts < 20) {
    adjustedHex = adjustColor(adjustedHex, isLightBg ? -0.1 : 0.1);
    ratio = getContrastRatio(adjustedHex, bgColorHex);
    attempts++;
  }
  
  // If still failing after nudging, fallback to pure black or white
  if (ratio < targetRatio) {
    return isLightBg ? '#000000' : '#FFFFFF';
  }
  return adjustedHex;
}
