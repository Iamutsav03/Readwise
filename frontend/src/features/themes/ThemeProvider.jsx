// features/themes/ThemeProvider.jsx
// Theme context provider and useTheme hook.
// Moved from src/theme/ThemeProvider.jsx into features/themes/.

import React, { createContext, useEffect, useState, useMemo } from 'react';
import { THEMES, buildCSSVariables } from './themes';
import { DEFAULT_THEME_ID, THEME_STORAGE_KEY } from '../../constants/themeConstants';

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(
    () => localStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME_ID
  );

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, themeId);
  }, [themeId]);

  useEffect(() => {
    const theme = THEMES[themeId] || THEMES[DEFAULT_THEME_ID];
    const vars  = buildCSSVariables(theme);
    const root  = document.documentElement;
    Object.entries(vars).forEach(([key, value]) => root.style.setProperty(key, value));
    root.setAttribute('data-theme', themeId);
  }, [themeId]);

  const value = useMemo(
    () => ({ themeId, setThemeId, activeTheme: THEMES[themeId] || THEMES[DEFAULT_THEME_ID] }),
    [themeId]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return { currentTheme: context.activeTheme, setTheme: context.setThemeId };
}
