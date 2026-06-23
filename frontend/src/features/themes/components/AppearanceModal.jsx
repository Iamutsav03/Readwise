// features/themes/components/AppearanceModal.jsx
// Premium theme picker with category groups and colour-preview cards.

import React from 'react';
import { useTheme } from '../ThemeProvider';
import { THEMES, getThemesByCategory } from '../themes';
import { useBreakpoints } from '../../../hooks/useBreakpoints';
import MobileBottomSheet from '../../../components/MobileBottomSheet';

const CATEGORY_LABELS = {
  light:   '☀️  Light',
  dark:    '🌙  Dark',
  premium: '✨  Premium',
};

/** Mini colour-swatch preview card shown inside each theme button */
function ThemePreviewCard({ theme, isActive }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {/* Swatch block */}
      <div style={{
        width: 52, height: 44, borderRadius: 8,
        background: theme.appBg,
        border: `1.5px solid ${isActive ? theme.accent : theme.border}`,
        flexShrink: 0, overflow: 'hidden', position: 'relative',
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
      }}>
        {/* Top panel strip (simulates sidebar) */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: 14, background: theme.sidebarBg,
        }} />
        {/* Card area */}
        <div style={{
          position: 'absolute', right: 4, top: 6, left: 18,
          height: 12, borderRadius: 3,
          background: theme.cardBg,
        }} />
        {/* Accent bar */}
        <div style={{
          position: 'absolute', right: 4, top: 22, left: 18,
          height: 4, borderRadius: 2,
          background: theme.accent, opacity: 0.85,
        }} />
        {/* Text line */}
        <div style={{
          position: 'absolute', right: 4, top: 30, left: 18,
          height: 3, borderRadius: 2,
          background: theme.textMuted, opacity: 0.4,
        }} />
      </div>

      {/* Text info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14, fontWeight: isActive ? 600 : 500,
          color: 'var(--rw-text-primary)', marginBottom: 2,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span>{theme.emoji}</span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{theme.name}</span>
        </div>
        <div style={{
          fontSize: 11.5, color: 'var(--rw-text-muted)', lineHeight: 1.4,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {theme.description}
        </div>
      </div>

      {/* Active checkmark */}
      {isActive && (
        <div style={{
          width: 20, height: 20, borderRadius: '50%',
          background: 'var(--rw-accent)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, fontSize: 11, color: 'var(--rw-accent-text)',
          fontWeight: 700,
        }}>
          ✓
        </div>
      )}
    </div>
  );
}

/** Render a single category section */
function CategorySection({ label, themes, activeThemeId, onSelect }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.12em', color: 'var(--rw-text-muted)',
        margin: '0 0 8px', padding: '0 2px',
      }}>
        {label}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {themes.map(theme => {
          const isActive = activeThemeId === theme.id;
          return (
            <button
              key={theme.id}
              onClick={() => onSelect(theme.id)}
              style={{
                display: 'block', width: '100%',
                padding: '10px 12px',
                background: isActive ? 'var(--rw-accent-muted)' : 'var(--rw-hover-bg)',
                border: isActive
                  ? '1.5px solid var(--rw-accent)'
                  : '1px solid var(--rw-border)',
                borderRadius: 10,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                textAlign: 'left',
              }}
              onMouseEnter={e => {
                if (!isActive) e.currentTarget.style.background = 'var(--rw-card-bg)';
              }}
              onMouseLeave={e => {
                if (!isActive) e.currentTarget.style.background = 'var(--rw-hover-bg)';
              }}
            >
              <ThemePreviewCard theme={theme} isActive={isActive} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function AppearanceModal({ isOpen, onClose }) {
  const { themeId, setTheme } = useTheme();
  const { isMobileOrSmaller: isMobile } = useBreakpoints();
  const groups = getThemesByCategory();

  if (!isOpen) return null;

  const handleSelect = (id) => {
    setTheme(id);
    onClose();
  };

  const content = (
    <div>
      {Object.entries(CATEGORY_LABELS).map(([cat, label]) => (
        <CategorySection
          key={cat}
          label={label}
          themes={groups[cat] || []}
          activeThemeId={themeId}
          onSelect={handleSelect}
        />
      ))}
    </div>
  );

  if (isMobile) {
    return (
      <MobileBottomSheet isOpen={isOpen} onClose={onClose} title="Appearance" fullScreen>
        <div style={{ padding: '0 16px 32px' }}>{content}</div>
      </MobileBottomSheet>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'var(--rw-overlay)',
          zIndex: 9998,
          animation: 'rw-fade 0.2s ease',
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'var(--rw-panel-bg)',
        border: '1px solid var(--rw-border)',
        borderRadius: 14,
        width: 420, maxWidth: '92vw', maxHeight: '86vh',
        overflowY: 'auto',
        zIndex: 9999,
        boxShadow: 'var(--rw-shadow)',
        padding: '24px 20px',
        animation: 'rw-slide-up 0.22s ease',
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <style>{`
          @keyframes rw-fade    { from{opacity:0} to{opacity:1} }
          @keyframes rw-slide-up{ from{opacity:0;transform:translate(-50%,-46%)} to{opacity:1;transform:translate(-50%,-50%)} }
        `}</style>

        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 20,
        }}>
          <h2 style={{
            margin: 0, fontSize: 17, fontWeight: 600,
            color: 'var(--rw-text-primary)',
          }}>
            Appearance
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: 'none',
              color: 'var(--rw-text-muted)', cursor: 'pointer',
              fontSize: 18, padding: '4px 6px', borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              minWidth: 34, minHeight: 34, transition: 'color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--rw-text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--rw-text-muted)'}
          >
            ✕
          </button>
        </div>

        {content}
      </div>
    </>
  );
}
