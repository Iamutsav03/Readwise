// features/themes/themes.js
// 17 curated themes: 7 Light, 3 Dark, 7 Premium.
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
  'sage-reader': {
    id: 'sage-reader', name: 'Sage Reader', emoji: '🌿', category: 'light',
    description: 'Calm natural tones for peaceful reading',
    appBg: '#F2F5F0', sidebarBg: '#19201A', panelBg: '#151C15',
    railBg: '#101510', readerBg: '#F2F5F0', cardBg: '#212B22',
    toolbarBg: '#131A14', popupBg: '#19201A', hoverBg: '#283429',
    textPrimary: '#E0EBE0', textSecondary: '#A8BCA8', textMuted: '#849684',
    accent: '#7BAE85', accentHover: '#8DC298', accentMuted: '#1E2C20', accentText: '#0F1F10',
    border: '#3A4B3C', borderStrong: '#4A5B4C', scrollbar: '#4A604D',
    shadow: '0 8px 32px rgba(0,0,0,0.4)', selectionColor: 'rgba(123,174,133,0.35)',
    overlay: 'rgba(6,10,6,0.55)',
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
  'nordic-paper': {
    id: 'nordic-paper', name: 'Nordic Paper', emoji: '❄️', category: 'light',
    description: 'Clean cool grays — minimal and distraction-free',
    appBg: '#F4F6F8', sidebarBg: '#1A1E24', panelBg: '#141820',
    railBg: '#0E1218', readerBg: '#F4F6F8', cardBg: '#202630',
    toolbarBg: '#111520', popupBg: '#1A1E24', hoverBg: '#272E38',
    textPrimary: '#D8E0EC', textSecondary: '#9AA8BC', textMuted: '#7A8898',
    accent: '#6B8AB8', accentHover: '#7D9DCC', accentMuted: '#1A2230', accentText: '#0E1420',
    border: '#2E3848', borderStrong: '#3E4858', scrollbar: '#485A72',
    shadow: '0 8px 32px rgba(0,0,0,0.4)', selectionColor: 'rgba(107,138,184,0.3)',
    overlay: 'rgba(6,8,14,0.6)',
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
  'forest-mist': {
    id: 'forest-mist', name: 'Forest Mist', emoji: '🌲', category: 'light',
    description: 'Earthy green-gray — grounding and peaceful',
    appBg: '#ECF0EA', sidebarBg: '#182218', panelBg: '#141C14',
    railBg: '#0E160E', readerBg: '#ECF0EA', cardBg: '#1E2C1E',
    toolbarBg: '#121A12', popupBg: '#182218', hoverBg: '#2A3C2A',
    textPrimary: '#D0E4D0', textSecondary: '#9AB49A', textMuted: '#748E74',
    accent: '#6B9B70', accentHover: '#7DB082', accentMuted: '#1A2A1C', accentText: '#0E1E0E',
    border: '#3A503A', borderStrong: '#4A604A', scrollbar: '#486348',
    shadow: '0 8px 32px rgba(0,0,0,0.4)', selectionColor: 'rgba(107,155,112,0.3)',
    overlay: 'rgba(4,10,4,0.6)',
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
  'kyoto-matcha': {
    id: 'kyoto-matcha', name: 'Kyoto Matcha', emoji: '🍵', category: 'premium',
    description: 'Deep matcha green — tranquil and focused',
    appBg: '#EBF0E8', sidebarBg: '#0E1A0E', panelBg: '#0A140A',
    railBg: '#081008', readerBg: '#EBF0E8', cardBg: '#162016',
    toolbarBg: '#0A120A', popupBg: '#0E1A0E', hoverBg: '#1E2E1E',
    textPrimary: '#C8E0C0', textSecondary: '#90B090', textMuted: '#6A8A6A',
    accent: '#5A9A5A', accentHover: '#6AAD6A', accentMuted: '#142014', accentText: '#081008',
    border: '#2A402A', borderStrong: '#3A503A', scrollbar: '#446844',
    shadow: '0 8px 32px rgba(0,0,0,0.5)', selectionColor: 'rgba(90,154,90,0.3)',
    overlay: 'rgba(2,8,2,0.65)',
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
  'coffee-house': {
    id: 'coffee-house', name: 'Coffee House', emoji: '☕', category: 'premium',
    description: 'Rich espresso browns — warm, cozy, focused',
    appBg: '#F2E8DC', sidebarBg: '#1E1208', panelBg: '#180E06',
    railBg: '#120A04', readerBg: '#F2E8DC', cardBg: '#2A1C0E',
    toolbarBg: '#140C06', popupBg: '#1E1208', hoverBg: '#382415',
    textPrimary: '#EED8BC', textSecondary: '#C4A880', textMuted: '#9A7E58',
    accent: '#B87040', accentHover: '#CC8050', accentMuted: '#2E1808', accentText: '#120800',
    border: '#483018', borderStrong: '#584028', scrollbar: '#6A5030',
    shadow: '0 8px 32px rgba(0,0,0,0.5)', selectionColor: 'rgba(184,112,64,0.35)',
    overlay: 'rgba(10,4,0,0.65)',
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
  'crimson-study': {
    id: 'crimson-study', name: 'Crimson Study', emoji: '🔴', category: 'premium',
    description: 'Deep crimson and gold — bold academic energy',
    appBg: '#F5EDEC', sidebarBg: '#200A0A', panelBg: '#1A0808',
    railBg: '#140404', readerBg: '#F5EDEC', cardBg: '#2C1010',
    toolbarBg: '#160808', popupBg: '#200A0A', hoverBg: '#3A1414',
    textPrimary: '#F0D8D8', textSecondary: '#C8A8A8', textMuted: '#9A7878',
    accent: '#C04040', accentHover: '#D05050', accentMuted: '#2E1010', accentText: '#140404',
    border: '#4A1E1E', borderStrong: '#5A2E2E', scrollbar: '#6A3838',
    shadow: '0 8px 32px rgba(0,0,0,0.5)', selectionColor: 'rgba(192,64,64,0.3)',
    overlay: 'rgba(10,0,0,0.65)',
  },
  'slate-focus': {
    id: 'slate-focus', name: 'Slate Focus', emoji: '🪨', category: 'premium',
    description: 'Minimal blue-slate — clean and ultra-readable',
    appBg: '#F0F2F5', sidebarBg: '#1A1E24', panelBg: '#141820',
    railBg: '#0E1218', readerBg: '#F0F2F5', cardBg: '#202630',
    toolbarBg: '#111520', popupBg: '#1A1E24', hoverBg: '#282E38',
    textPrimary: '#D4DCE8', textSecondary: '#9CA8B8', textMuted: '#7A8898',
    accent: '#7090B8', accentHover: '#80A4CC', accentMuted: '#1A2030', accentText: '#0E1220',
    border: '#2C3848', borderStrong: '#3C4858', scrollbar: '#4A5A70',
    shadow: '0 8px 32px rgba(0,0,0,0.5)', selectionColor: 'rgba(112,144,184,0.3)',
    overlay: 'rgba(4,6,10,0.65)',
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
