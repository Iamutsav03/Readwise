// src/theme/themes.js
// All reading themes for ReadWise + CSS variable builder.
// Every theme is tuned for 2-4 hour reading sessions with low eye strain.
import { ensureContrast } from '../utils/colorUtils';

export const THEMES = {
  'warm-cream': {
    id: 'warm-cream', name: 'Warm Cream', emoji: '☕',
    description: 'Kindle-inspired comfort for extended sessions',
    appBg: '#F7F3EE', sidebarBg: '#1A1512', panelBg: '#161210',
    railBg: '#0A0806', readerBg: '#F7F3EE', cardBg: '#241D19',
    toolbarBg: '#111008', popupBg: '#1A1512', hoverBg: '#2E2519',
    textPrimary: '#F5EEE4', textSecondary: '#C2B5A0',
    textMuted: '#968875',
    accent: '#C8A46A', accentHover: '#D9B67F', accentMuted: '#2A2016',
    accentText: '#1A1512',
    border: '#3A2E24', borderStrong: '#4A3E30',
    scrollbar: '#5A4A38',
  },
  'sage-green': {
    id: 'sage-green', name: 'Sage Green', emoji: '🌿',
    description: 'Calm natural tones for peaceful reading',
    appBg: '#F2F5F0', sidebarBg: '#19201A', panelBg: '#151C15',
    railBg: '#101510', readerBg: '#F2F5F0', cardBg: '#212B22',
    toolbarBg: '#131A14', popupBg: '#19201A', hoverBg: '#283429',
    textPrimary: '#E0EBE0', textSecondary: '#A8BCA8',
    textMuted: '#849684',
    accent: '#7BAE85', accentHover: '#8DC298', accentMuted: '#1E2C20',
    accentText: '#0F1F10',
    border: '#3A4B3C', borderStrong: '#4A5B4C',
    scrollbar: '#4A604D',
  },
  'ocean-blue': {
    id: 'ocean-blue', name: 'Ocean Blue', emoji: '🌊',
    description: 'Cool focused tones for deep concentration',
    appBg: '#EEF3F8', sidebarBg: '#0E1C2A', panelBg: '#0A1522',
    railBg: '#091420', readerBg: '#EEF3F8', cardBg: '#162436',
    toolbarBg: '#0A1520', popupBg: '#0E1C2A', hoverBg: '#192B3E',
    textPrimary: '#C8DCF0', textSecondary: '#96B2CF',
    textMuted: '#7491B0',
    accent: '#5AA3CD', accentHover: '#6EB2D6', accentMuted: '#122638',
    accentText: '#0A1522',
    border: '#2A3F56', borderStrong: '#3A4F66',
    scrollbar: '#3B5775',
  },
  'lavender': {
    id: 'lavender', name: 'Lavender', emoji: '💜',
    description: 'Soft purple for calm, relaxed reading',
    appBg: '#F5F3F8', sidebarBg: '#1E1A2A', panelBg: '#19152A',
    railBg: '#130F1E', readerBg: '#F5F3F8', cardBg: '#272035',
    toolbarBg: '#161220', popupBg: '#1E1A2A', hoverBg: '#2E2742',
    textPrimary: '#E0D8F0', textSecondary: '#B0A5CD',
    textMuted: '#8D84B0',
    accent: '#998AD1', accentHover: '#A89CE0', accentMuted: '#241D3A',
    accentText: '#1A1530',
    border: '#3D3356', borderStrong: '#4D4366',
    scrollbar: '#4E4270',
  },
  'sepia': {
    id: 'sepia', name: 'Sepia', emoji: '📜',
    description: 'Classic book warmth with amber tones',
    appBg: '#F4EDD8', sidebarBg: '#2A1F0E', panelBg: '#221808',
    railBg: '#1A1206', readerBg: '#F4EDD8', cardBg: '#3A2D16',
    toolbarBg: '#1E1608', popupBg: '#2A1F0E', hoverBg: '#44351B',
    textPrimary: '#F0E0C0', textSecondary: '#D0B890',
    textMuted: '#A08A64',
    accent: '#CCA020', accentHover: '#E0B83A', accentMuted: '#38280A',
    accentText: '#1A0E00',
    border: '#544222', borderStrong: '#645232',
    scrollbar: '#6A532B',
  },
  'dark-mode': {
    id: 'dark-mode', name: 'Dark Mode', emoji: '🌙',
    description: 'Comfortable dark for evening reading',
    appBg: '#1E1E1E', sidebarBg: '#141414', panelBg: '#111111',
    railBg: '#0D0D0D', readerBg: '#1E1E1E', cardBg: '#1A1A1A',
    toolbarBg: '#111111', popupBg: '#141414', hoverBg: '#242424',
    textPrimary: '#E8E0D0', textSecondary: '#B2AB9E',
    textMuted: '#868074',
    accent: '#D4AF7A', accentHover: '#E2C090', accentMuted: '#2A2016',
    accentText: '#141414',
    border: '#333333', borderStrong: '#444444',
    scrollbar: '#4D4D4D',
  },
  'midnight': {
    id: 'midnight', name: 'Midnight Reader', emoji: '🌌',
    description: 'Deep blue-black for distraction-free nights',
    appBg: '#0D1117', sidebarBg: '#090D14', panelBg: '#070A10',
    railBg: '#060810', readerBg: '#0D1117', cardBg: '#111720',
    toolbarBg: '#080B12', popupBg: '#090D14', hoverBg: '#18212D',
    textPrimary: '#CDD9E5', textSecondary: '#94A6B8',
    textMuted: '#6E8092',
    accent: '#6B9FD4', accentHover: '#7DAEE0', accentMuted: '#122030',
    accentText: '#0D1117',
    border: '#283443', borderStrong: '#384453',
    scrollbar: '#3B4D63',
  },
  'forest-mist': {
    id: 'forest-mist', name: 'Forest Mist', emoji: '🌲',
    description: 'Earthy green-gray, grounding and peaceful',
    appBg: '#ECF0EA', sidebarBg: '#182218', panelBg: '#141C14',
    railBg: '#0E160E', readerBg: '#ECF0EA', cardBg: '#1E2C1E',
    toolbarBg: '#121A12', popupBg: '#182218', hoverBg: '#2A3C2A',
    textPrimary: '#D0E4D0', textSecondary: '#9AB49A',
    textMuted: '#748E74',
    accent: '#6B9B70', accentHover: '#7DB082', accentMuted: '#1A2A1C',
    accentText: '#0E1E0E',
    border: '#3A503A', borderStrong: '#4A604A',
    scrollbar: '#486348',
  },
  'paper-white': {
    id: 'paper-white', name: 'Paper White', emoji: '📄',
    description: 'Ultra-clean academic reading experience',
    appBg: '#FAFAFA', sidebarBg: '#1C1C1C', panelBg: '#181818',
    railBg: '#111111', readerBg: '#FAFAFA', cardBg: '#262626',
    toolbarBg: '#141414', popupBg: '#1C1C1C', hoverBg: '#333333',
    textPrimary: '#E8E8E8', textSecondary: '#A8A8A8',
    textMuted: '#848484',
    accent: '#668ABF', accentHover: '#7B9DCE', accentMuted: '#242D3D',
    accentText: '#1C1C1C',
    border: '#404040', borderStrong: '#505050',
    scrollbar: '#5C5C5C',
  },
  'rose-beige': {
    id: 'rose-beige', name: 'Rose Beige', emoji: '🌸',
    description: 'Warm rosy tones for a cozy atmosphere',
    appBg: '#F8F0EC', sidebarBg: '#251815', panelBg: '#1E1210',
    railBg: '#160E0B', readerBg: '#F8F0EC', cardBg: '#33201C',
    toolbarBg: '#1A110E', popupBg: '#251815', hoverBg: '#442A24',
    textPrimary: '#F0DED8', textSecondary: '#CCA498',
    textMuted: '#9B7468',
    accent: '#C47A6A', accentHover: '#D88C7C', accentMuted: '#381E18',
    accentText: '#1A0A08',
    border: '#563830', borderStrong: '#664840',
    scrollbar: '#6A443A',
  },
};

/**
 * Produces a flat { '--rw-var': value } map from a theme.
 * This is applied to document.documentElement as inline style properties.
 */
export function buildCSSVariables(theme) {
  // Validate text colors against the dominant UI background (panelBg/sidebarBg)
  // If the appBg is light but the UI is dark, we validate textPrimary against panelBg.
  const mainTextBg = theme.panelBg;
  const textPrimary = ensureContrast(theme.textPrimary, mainTextBg, 4.5);
  const textSecondary = ensureContrast(theme.textSecondary, mainTextBg, 4.5);
  const textMuted = ensureContrast(theme.textMuted, mainTextBg, 3.0);
  
  // Ensure accent buttons have contrast against their text
  const accentText = ensureContrast(theme.accentText, theme.accent, 4.5);

  return {
    // Legacy mapping (kept for backward compatibility during refactor)
    '--rw-app-bg':      theme.appBg,
    '--rw-sidebar-bg':  theme.sidebarBg,
    '--rw-reader-bg':   theme.readerBg,
    '--rw-rail-bg':     theme.railBg,
    '--rw-popup-bg':    theme.popupBg,
    '--rw-hover-bg':    theme.hoverBg,
    '--rw-card-bg':     theme.cardBg,
    '--rw-toolbar-bg':  theme.toolbarBg,

    // NEW Semantic Tokens (as requested)
    '--rw-bg':          theme.appBg,
    '--rw-surface':     theme.cardBg,
    '--rw-panel-bg':    theme.panelBg,
    '--rw-panel-hover': theme.hoverBg,

    // Text
    '--rw-text-primary':   textPrimary,
    '--rw-text-secondary': textSecondary,
    '--rw-text-muted':     textMuted,

    // Accent
    '--rw-accent':       theme.accent,
    '--rw-accent-hover': theme.accentHover,
    '--rw-accent-muted': theme.accentMuted,
    '--rw-accent-text':  accentText,

    // Status Colors (Universal across themes unless overridden)
    '--rw-success': '#22c55e',
    '--rw-warning': '#f59e0b',
    '--rw-danger':  '#ef4444',

    // Borders
    '--rw-border':        theme.border,
    '--rw-border-strong': theme.borderStrong,

    // Scrollbar
    '--rw-scrollbar': theme.scrollbar,

    // Typography
    '--rw-font-family': "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  };
}
