// features/themes/themes.js
// 10 curated themes: 4 Light, 3 Dark, 3 Premium.
// Every theme defines all semantic colour tokens so NO component
// ever needs a hardcoded colour value.

import { ensureContrast } from './utils/colorUtils';

export const THEMES = {
  /* ─────────────── LIGHT THEMES ─────────────── */
  'warm-parchment': {
    id: 'warm-parchment', name: 'Warm Parchment', emoji: '☕', category: 'light',
    description: 'Kindle-inspired comfort — the perfect daily driver',
    appBg: '#F7F3EE', sidebarBg: '#1A1512', panelBg: '#161210',
    railBg: '#0A0806', readerBg: '#F7F3EE', cardBg: '#241D19',
    toolbarBg: '#111008', popupBg: '#1A1512', hoverBg: '#2E2519',
    textPrimary: '#F5EEE4', textSecondary: '#C2B5A0', textMuted: '#968875',
    accent: '#C8A46A', accentHover: '#D9B67F', accentMuted: '#2A2016', accentText: '#1A1512',
    border: '#3A2E24', borderStrong: '#4A3E30', scrollbar: '#5A4A38',
    shadow: '0 8px 32px rgba(0,0,0,0.45)', selectionColor: 'rgba(200,164,106,0.35)',
    overlay: 'rgba(10,6,2,0.55)',
  },
  'ocean-mist': {
    id: 'ocean-mist', name: 'Ocean Mist', emoji: '🌊', category: 'light',
    description: 'Cool focused tones for deep concentration',
    appBg: '#EEF3F8', sidebarBg: '#0E1C2A', panelBg: '#0A1522',
    railBg: '#091420', readerBg: '#EEF3F8', cardBg: '#162436',
    toolbarBg: '#0A1520', popupBg: '#0E1C2A', hoverBg: '#192B3E',
    textPrimary: '#C8DCF0', textSecondary: '#96B2CF', textMuted: '#7491B0',
    accent: '#5AA3CD', accentHover: '#6EB2D6', accentMuted: '#122638', accentText: '#0A1522',
    border: '#2A3F56', borderStrong: '#3A4F66', scrollbar: '#3B5775',
    shadow: '0 8px 32px rgba(0,0,0,0.4)', selectionColor: 'rgba(90,163,205,0.3)',
    overlay: 'rgba(4,10,18,0.6)',
  },
  'sepia-scholar': {
    id: 'sepia-scholar', name: 'Sepia Scholar', emoji: '📜', category: 'light',
    description: 'Classic amber book warmth — timeless and elegant',
    appBg: '#F4EDD8', sidebarBg: '#2A1F0E', panelBg: '#221808',
    railBg: '#1A1206', readerBg: '#F4EDD8', cardBg: '#3A2D16',
    toolbarBg: '#1E1608', popupBg: '#2A1F0E', hoverBg: '#44351B',
    textPrimary: '#F0E0C0', textSecondary: '#D0B890', textMuted: '#A08A64',
    accent: '#CCA020', accentHover: '#E0B83A', accentMuted: '#38280A', accentText: '#1A0E00',
    border: '#544222', borderStrong: '#645232', scrollbar: '#6A532B',
    shadow: '0 8px 32px rgba(0,0,0,0.4)', selectionColor: 'rgba(204,160,32,0.3)',
    overlay: 'rgba(14,8,0,0.6)',
  },
  'rose-ivory': {
    id: 'rose-ivory', name: 'Rose Ivory', emoji: '🌸', category: 'light',
    description: 'Warm rosy tones for a cozy, inviting atmosphere',
    appBg: '#F8F0EC', sidebarBg: '#251815', panelBg: '#1E1210',
    railBg: '#160E0B', readerBg: '#F8F0EC', cardBg: '#33201C',
    toolbarBg: '#1A110E', popupBg: '#251815', hoverBg: '#442A24',
    textPrimary: '#F0DED8', textSecondary: '#CCA498', textMuted: '#9B7468',
    accent: '#C47A6A', accentHover: '#D88C7C', accentMuted: '#381E18', accentText: '#1A0A08',
    border: '#563830', borderStrong: '#664840', scrollbar: '#6A443A',
    shadow: '0 8px 32px rgba(0,0,0,0.4)', selectionColor: 'rgba(196,122,106,0.3)',
    overlay: 'rgba(16,6,4,0.6)',
  },

  /* ─────────────── DARK THEMES ─────────────── */
  'midnight-reader': {
    id: 'midnight-reader', name: 'Midnight Reader', emoji: '🌌', category: 'dark',
    description: 'Deep blue-black for distraction-free nights',
    appBg: '#0D1117', sidebarBg: '#090D14', panelBg: '#070A10',
    railBg: '#060810', readerBg: '#0D1117', cardBg: '#111720',
    toolbarBg: '#080B12', popupBg: '#090D14', hoverBg: '#18212D',
    textPrimary: '#CDD9E5', textSecondary: '#94A6B8', textMuted: '#6E8092',
    accent: '#6B9FD4', accentHover: '#7DAEE0', accentMuted: '#122030', accentText: '#0D1117',
    border: '#283443', borderStrong: '#384453', scrollbar: '#3B4D63',
    shadow: '0 8px 32px rgba(0,0,0,0.7)', selectionColor: 'rgba(107,159,212,0.35)',
    overlay: 'rgba(0,2,6,0.7)',
  },
  'obsidian-pro': {
    id: 'obsidian-pro', name: 'Obsidian Pro', emoji: '🌙', category: 'dark',
    description: 'Pure dark with warm amber accents — professional',
    appBg: '#1E1E1E', sidebarBg: '#141414', panelBg: '#111111',
    railBg: '#0D0D0D', readerBg: '#1E1E1E', cardBg: '#1A1A1A',
    toolbarBg: '#111111', popupBg: '#141414', hoverBg: '#242424',
    textPrimary: '#E8E0D0', textSecondary: '#B2AB9E', textMuted: '#868074',
    accent: '#D4AF7A', accentHover: '#E2C090', accentMuted: '#2A2016', accentText: '#141414',
    border: '#333333', borderStrong: '#444444', scrollbar: '#4D4D4D',
    shadow: '0 8px 32px rgba(0,0,0,0.7)', selectionColor: 'rgba(212,175,122,0.3)',
    overlay: 'rgba(0,0,0,0.7)',
  },
  'amoled-black': {
    id: 'amoled-black', name: 'AMOLED Black', emoji: '⚫', category: 'dark',
    description: 'True black for AMOLED displays — saves battery',
    appBg: '#000000', sidebarBg: '#000000', panelBg: '#000000',
    railBg: '#000000', readerBg: '#000000', cardBg: '#0D0D0D',
    toolbarBg: '#000000', popupBg: '#0A0A0A', hoverBg: '#1A1A1A',
    textPrimary: '#F0F0F0', textSecondary: '#B0B0B0', textMuted: '#808080',
    accent: '#BB86FC', accentHover: '#CC99FF', accentMuted: '#1A0A2A', accentText: '#000000',
    border: '#1E1E1E', borderStrong: '#2E2E2E', scrollbar: '#3A3A3A',
    shadow: '0 8px 32px rgba(0,0,0,0.9)', selectionColor: 'rgba(187,134,252,0.35)',
    overlay: 'rgba(0,0,0,0.8)',
  },

  /* ─────────────── PREMIUM THEMES ─────────────── */
  'vintage-library': {
    id: 'vintage-library', name: 'Vintage Library', emoji: '📚', category: 'premium',
    description: 'Rich mahogany and gold — like a private reading room',
    appBg: '#F5EDD8', sidebarBg: '#2C1A0A', panelBg: '#241408',
    railBg: '#1A0E04', readerBg: '#F5EDD8', cardBg: '#3A2410',
    toolbarBg: '#201006', popupBg: '#2C1A0A', hoverBg: '#4A3018',
    textPrimary: '#F5E6C8', textSecondary: '#D4BC8A', textMuted: '#A89060',
    accent: '#D4922A', accentHover: '#E8A838', accentMuted: '#3A2208', accentText: '#1A0A00',
    border: '#5A3A1A', borderStrong: '#6A4A2A', scrollbar: '#7A5A30',
    shadow: '0 8px 32px rgba(0,0,0,0.5)', selectionColor: 'rgba(212,146,42,0.35)',
    overlay: 'rgba(16,6,0,0.65)',
  },
  'moonlight-paper': {
    id: 'moonlight-paper', name: 'Moonlight Paper', emoji: '🌙', category: 'premium',
    description: 'Soft lavender night — dreamy and readable',
    appBg: '#F0EEF8', sidebarBg: '#1A1628', panelBg: '#141020',
    railBg: '#0E0C18', readerBg: '#F0EEF8', cardBg: '#221E34',
    toolbarBg: '#111020', popupBg: '#1A1628', hoverBg: '#2E2842',
    textPrimary: '#DDD8F0', textSecondary: '#ADA8C8', textMuted: '#8580A0',
    accent: '#9B87D4', accentHover: '#B09AE0', accentMuted: '#241E38', accentText: '#0E0C18',
    border: '#363048', borderStrong: '#464058', scrollbar: '#5A5470',
    shadow: '0 8px 32px rgba(0,0,0,0.55)', selectionColor: 'rgba(155,135,212,0.35)',
    overlay: 'rgba(4,2,12,0.65)',
  },
  'academic-blue': {
    id: 'academic-blue', name: 'Academic Blue', emoji: '🎓', category: 'premium',
    description: 'Classic deep navy — serious, scholarly, focused',
    appBg: '#EEF2F8', sidebarBg: '#0A1428', panelBg: '#08101E',
    railBg: '#060C18', readerBg: '#EEF2F8', cardBg: '#121C30',
    toolbarBg: '#08101E', popupBg: '#0A1428', hoverBg: '#182438',
    textPrimary: '#C8D8F0', textSecondary: '#90A8C8', textMuted: '#6880A0',
    accent: '#4A78C0', accentHover: '#5A88D0', accentMuted: '#101E38', accentText: '#060C18',
    border: '#1E3050', borderStrong: '#2E4060', scrollbar: '#3A5278',
    shadow: '0 8px 32px rgba(0,0,0,0.55)', selectionColor: 'rgba(74,120,192,0.35)',
    overlay: 'rgba(2,4,14,0.65)',
  },
};

/**
 * Produces a flat { '--rw-var': value } map from a theme object.
 * Applied to document.documentElement as inline CSS custom properties.
 */
export function buildCSSVariables(theme) {
  const mainTextBg    = theme.panelBg;
  const textPrimary   = ensureContrast(theme.textPrimary,   mainTextBg, 4.5);
  const textSecondary = ensureContrast(theme.textSecondary, mainTextBg, 3.5);
  const textMuted     = ensureContrast(theme.textMuted,     mainTextBg, 3.0);
  const accentText    = ensureContrast(theme.accentText,    theme.accent, 4.5);

  // --- Page-level variables: contrasted against appBg (used by landing pages,
  //     reader surface, and any component that sits on the app background).
  // For dark themes (dark appBg), textPrimary is already the right light color.
  // For light themes (light appBg), we need a dark contrasting color.
  const appBg = theme.appBg;
  const pageText     = ensureContrast(theme.textPrimary,   appBg, 4.5);
  const pageTextSec  = ensureContrast(theme.textSecondary, appBg, 3.5);
  const pageTextMute = ensureContrast(theme.textMuted,     appBg, 3.0);

  // Card surface on light appBg — slightly darker, still on theme
  // Dark themes: cardBg is fine. Light themes: cardBg is dark, so use a tinted light surface.
  const isLightApp   = _isLight(appBg);
  const pageCardBg   = isLightApp ? _lightenBy(appBg, -0.04) : theme.cardBg;
  const pageBorder   = isLightApp ? _lightenBy(appBg, -0.14) : theme.border;
  const pageHoverBg  = isLightApp ? _lightenBy(appBg, -0.08) : theme.hoverBg;

  return {
    '--rw-app-bg':           appBg,
    '--rw-sidebar-bg':       theme.sidebarBg,
    '--rw-reader-bg':        theme.readerBg,
    '--rw-rail-bg':          theme.railBg,
    '--rw-popup-bg':         theme.popupBg,
    '--rw-hover-bg':         theme.hoverBg,
    '--rw-card-bg':          theme.cardBg,
    '--rw-toolbar-bg':       theme.toolbarBg,
    '--rw-bg':               appBg,
    '--rw-surface':          theme.cardBg,
    '--rw-panel-bg':         theme.panelBg,
    '--rw-panel-hover':      theme.hoverBg,
    '--rw-text-primary':     textPrimary,
    '--rw-text-secondary':   textSecondary,
    '--rw-text-muted':       textMuted,
    '--rw-accent':           theme.accent,
    '--rw-accent-hover':     theme.accentHover,
    '--rw-accent-muted':     theme.accentMuted,
    '--rw-accent-text':      accentText,
    '--rw-border':           theme.border,
    '--rw-border-strong':    theme.borderStrong,
    '--rw-scrollbar':        theme.scrollbar,
    '--rw-shadow':           theme.shadow,
    '--rw-selection-color':  theme.selectionColor,
    '--rw-overlay':          theme.overlay,
    '--rw-danger':           '#ef4444',
    '--rw-success':          '#22c55e',
    '--rw-warning':          '#f59e0b',
    '--rw-info':             '#3b82f6',
    '--rw-font-family':      "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    // ── Page-level (landing / reader surface) ────────────────────────────────
    '--rw-page-text':        pageText,
    '--rw-page-text-sec':    pageTextSec,
    '--rw-page-text-mute':   pageTextMute,
    '--rw-page-card-bg':     pageCardBg,
    '--rw-page-border':      pageBorder,
    '--rw-page-hover-bg':    pageHoverBg,
    '--rw-page-accent-muted': isLightApp ? theme.selectionColor : theme.accentMuted,
  };
}

// ── internal helpers ─────────────────────────────────────────────────────────

/** Returns true if the hex colour is perceptually light (luminance > 0.35). */
function _isLight(hex) {
  try {
    const r = parseInt(hex.slice(1,3),16)/255;
    const g = parseInt(hex.slice(3,5),16)/255;
    const b = parseInt(hex.slice(5,7),16)/255;
    const lin = v => v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4);
    return 0.2126*lin(r) + 0.7152*lin(g) + 0.0722*lin(b) > 0.35;
  } catch { return false; }
}

/** Lighten (amount > 0) or darken (amount < 0) a hex by a linear amount. */
function _lightenBy(hex, amount) {
  try {
    const clamp = v => Math.max(0, Math.min(255, Math.round(v)));
    const r = clamp(parseInt(hex.slice(1,3),16) + amount*255);
    const g = clamp(parseInt(hex.slice(3,5),16) + amount*255);
    const b = clamp(parseInt(hex.slice(5,7),16) + amount*255);
    return '#' + [r,g,b].map(v => v.toString(16).padStart(2,'0')).join('');
  } catch { return hex; }
}

/** Convenience: get themes grouped by category for the AppearanceModal. */
export function getThemesByCategory() {
  const groups = { light: [], dark: [], premium: [] };
  Object.values(THEMES).forEach(t => {
    if (groups[t.category]) groups[t.category].push(t);
  });
  return groups;
}
