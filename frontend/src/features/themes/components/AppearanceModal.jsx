// features/themes/components/AppearanceModal.jsx
// Theme picker modal / bottom sheet.
// Moved from src/theme/AppearanceModal.jsx into features/themes/components/.

import React from 'react';
import { useTheme } from '../ThemeProvider';
import { THEMES } from '../themes';
import { useBreakpoints } from '../../../hooks/useBreakpoints';
import MobileBottomSheet from '../../../components/MobileBottomSheet';

export default function AppearanceModal({ isOpen, onClose }) {
  const { themeId, setTheme } = useTheme();
  const { isMobileOrSmaller: isMobile } = useBreakpoints();

  if (!isOpen) return null;

  const content = (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
      {Object.values(THEMES).map((theme) => {
        const isActive = themeId === theme.id;
        return (
          <button
            key={theme.id}
            className="rw-modal-btn"
            onClick={() => { setTheme(theme.id); onClose(); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px 16px', borderRadius: '8px',
              background: isActive ? 'var(--rw-accent-muted)' : 'transparent',
              border: isActive ? '1px solid var(--rw-accent)' : '1px solid var(--rw-border)',
              cursor: 'pointer', transition: 'all 0.15s ease',
              textAlign: 'left',
              color: isActive ? 'var(--rw-accent)' : 'var(--rw-text-primary)',
            }}
          >
            <span style={{ fontSize: '18px' }}>{theme.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 600 }}>{theme.name}</div>
              <div style={{ fontSize: '12px', color: 'var(--rw-text-secondary)', marginTop: '2px' }}>{theme.description}</div>
            </div>
            {isActive && <span style={{ color: 'var(--rw-accent)' }}>✓</span>}
          </button>
        );
      })}
    </div>
  );

  if (isMobile) {
    return (
      <MobileBottomSheet isOpen={isOpen} onClose={onClose} title="Appearance" fullScreen={false}>
        <div style={{ padding: '0 16px 24px' }}>{content}</div>
      </MobileBottomSheet>
    );
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9998, animation: 'fadeIn 0.2s ease' }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        background: 'var(--rw-panel-bg)', border: '1px solid var(--rw-border)',
        borderRadius: '12px', width: '400px', maxWidth: '90vw', maxHeight: '80vh',
        overflowY: 'auto', zIndex: 9999, boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        padding: '24px', animation: 'slideUp 0.2s ease', fontFamily: "'DM Sans', sans-serif",
      }}>
        <style>{`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slideUp { from { opacity: 0; transform: translate(-50%, -45%); } to { opacity: 1; transform: translate(-50%, -50%); } }
          .rw-modal-btn:focus-visible { outline: 2px solid var(--rw-accent); outline-offset: 2px; }
        `}</style>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '18px', color: 'var(--rw-text-primary)' }}>Appearance</h2>
          <button className="rw-modal-btn" onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--rw-text-muted)', cursor: 'pointer', fontSize: '18px', padding: '4px', minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>
        {content}
      </div>
    </>
  );
}
