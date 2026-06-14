// src/theme/ThemeProvider.jsx
import React, { createContext, useEffect, useState, useMemo } from 'react';
import { THEMES, buildCSSVariables } from './themes';

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(() => localStorage.getItem('rw_theme_id') || 'warm-cream');

  useEffect(() => {
    localStorage.setItem('rw_theme_id', themeId);
  }, [themeId]);

  useEffect(() => {
    const theme = THEMES[themeId] || THEMES['warm-cream'];
    const vars = buildCSSVariables(theme);

    const root = document.documentElement;
    Object.entries(vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    root.setAttribute('data-theme', themeId);
  }, [themeId]);

  const value = useMemo(() => ({
    themeId, setThemeId,
    activeTheme: THEMES[themeId] || THEMES['warm-cream']
  }), [themeId]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return {
    currentTheme: context.activeTheme,
    setTheme: context.setThemeId
  };
}
