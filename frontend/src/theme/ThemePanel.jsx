import React, { useState } from 'react';
import { useTheme } from './useTheme';
import { THEMES, ACCESSIBILITY_MODES, READING_MODES, buildCSSVariables } from './themes';

export default function ThemePanel() {
  const { 
    themeId, setThemeId, 
    a11yMode, setA11yMode,
    readingMode, setReadingMode,
    customSettings, setCustomSettings 
  } = useTheme();

  const [hoverThemeId, setHoverThemeId] = useState(null);

  // Apply preview instantly
  React.useEffect(() => {
    if (hoverThemeId && hoverThemeId !== themeId) {
      const theme = THEMES[hoverThemeId];
      const vars = buildCSSVariables(theme, a11yMode, customSettings);
      const root = document.documentElement;
      Object.entries(vars).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
      return () => {
        // Revert to active theme
        const activeVars = buildCSSVariables(THEMES[themeId], a11yMode, customSettings);
        Object.entries(activeVars).forEach(([key, value]) => {
          root.style.setProperty(key, value);
        });
      };
    }
  }, [hoverThemeId, themeId, a11yMode, customSettings]);

  return (
    <div style={{ marginTop: 'auto', paddingTop: 20 }}>
      <p style={{
        fontSize: 10, fontWeight: 600, color: "var(--rw-text-muted)",
        textTransform: "uppercase", letterSpacing: "0.1em",
        margin: "0 0 10px", fontFamily: "'DM Sans', sans-serif"
      }}>
        Appearance
      </p>

      {/* Theme Grid */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "16px"
      }}>
        {Object.values(THEMES).map((theme) => {
          const isActive = themeId === theme.id;
          return (
            <button
              key={theme.id}
              onClick={() => setThemeId(theme.id)}
              onMouseEnter={() => setHoverThemeId(theme.id)}
              onMouseLeave={() => setHoverThemeId(null)}
              style={{
                display: "flex", flexDirection: "column", gap: "6px",
                padding: "8px", borderRadius: "8px",
                background: isActive ? "var(--rw-hover-bg)" : "transparent",
                border: isActive ? `1px solid var(--rw-accent)` : `1px solid var(--rw-border)`,
                cursor: "pointer", transition: "all 0.15s ease",
                textAlign: "left", fontFamily: "'DM Sans', sans-serif"
              }}
            >
              <div style={{
                width: "100%", height: "32px", borderRadius: "4px",
                display: "flex", overflow: "hidden", border: "1px solid rgba(0,0,0,0.1)"
              }}>
                <div style={{ width: "20%", background: theme.sidebarBg }} />
                <div style={{ flex: 1, background: theme.readerBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: theme.accent }} />
                </div>
              </div>
              <div>
                <div style={{ fontSize: "11.5px", fontWeight: 600, color: isActive ? "var(--rw-accent)" : "var(--rw-text-primary)" }}>
                  {theme.emoji} {theme.name}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Reading Modes */}
      <p style={{
        fontSize: 10, fontWeight: 600, color: "var(--rw-text-muted)",
        textTransform: "uppercase", letterSpacing: "0.1em",
        margin: "0 0 8px", fontFamily: "'DM Sans', sans-serif"
      }}>
        Reading Mode
      </p>
      <div style={{ display: "flex", gap: "4px", marginBottom: "16px" }}>
        {READING_MODES.map((mode) => (
          <button
            key={mode.id}
            onClick={() => setReadingMode(mode.id)}
            title={mode.description}
            style={{
              flex: 1, padding: "6px 0", borderRadius: "6px",
              background: readingMode === mode.id ? "var(--rw-accent)" : "transparent",
              color: readingMode === mode.id ? "var(--rw-accent-text)" : "var(--rw-text-secondary)",
              border: readingMode === mode.id ? "none" : "1px solid var(--rw-border)",
              fontSize: "11px", fontWeight: readingMode === mode.id ? 600 : 500,
              cursor: "pointer", transition: "all 0.15s"
            }}
          >
            {mode.icon} {mode.label}
          </button>
        ))}
      </div>

      {/* Accessibility & Comfort */}
      <p style={{
        fontSize: 10, fontWeight: 600, color: "var(--rw-text-muted)",
        textTransform: "uppercase", letterSpacing: "0.1em",
        margin: "0 0 8px", fontFamily: "'DM Sans', sans-serif"
      }}>
        Comfort & Size
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "12px" }}>
        {ACCESSIBILITY_MODES.map((mode) => (
          <button
            key={mode.id}
            onClick={() => setA11yMode(mode.id)}
            style={{
              flex: "1 1 45%", padding: "6px 8px", borderRadius: "6px",
              background: a11yMode === mode.id ? "var(--rw-accent-muted)" : "transparent",
              color: a11yMode === mode.id ? "var(--rw-accent)" : "var(--rw-text-secondary)",
              border: a11yMode === mode.id ? `1px solid var(--rw-accent)` : "1px solid var(--rw-border)",
              fontSize: "11px", fontWeight: 500,
              cursor: "pointer", transition: "all 0.15s"
            }}
          >
            <span style={{ marginRight: 4 }}>{mode.icon}</span>
            {mode.label}
          </button>
        ))}
      </div>

      {/* Fine-tuning Toggles */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {[
          { key: 'warmFilter', label: 'Warm Light Filter' },
          { key: 'dyslexiaFont', label: 'Dyslexia Friendly Font' },
          { key: 'comfortableSpacing', label: 'Comfortable Spacing' },
        ].map(({ key, label }) => (
          <label key={key} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11.5px", color: "var(--rw-text-secondary)", cursor: "pointer" }}>
            <input 
              type="checkbox" 
              checked={customSettings[key]} 
              onChange={(e) => setCustomSettings(s => ({ ...s, [key]: e.target.checked }))}
              style={{ accentColor: "var(--rw-accent)" }}
            />
            {label}
          </label>
        ))}
      </div>

    </div>
  );
}
