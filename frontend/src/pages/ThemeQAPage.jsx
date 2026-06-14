import React, { useState, useEffect } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { THEMES } from '../theme/themes';
import { Settings, Lock, Search, Heart, Edit2, AlertTriangle, ChevronRight, Check } from 'lucide-react';

export default function ThemeQAPage() {
  const { currentTheme, setTheme } = useTheme();
  
  return (
    <div style={{ padding: '2rem', display: 'flex', gap: '2rem', height: '100dvh', overflow: 'hidden' }}>
      
      {/* Sidebar: Theme Switcher */}
      <div style={{ width: '250px', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Themes</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {Object.values(THEMES).map(t => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              style={{
                padding: '12px',
                textAlign: 'left',
                borderRadius: '8px',
                background: currentTheme.id === t.id ? 'var(--rw-accent)' : 'var(--rw-surface)',
                color: currentTheme.id === t.id ? 'var(--rw-accent-text)' : 'var(--rw-text-primary)',
                border: `1px solid ${currentTheme.id === t.id ? 'transparent' : 'var(--rw-border)'}`,
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>{t.name}</span>
              {currentTheme.id === t.id && <Check size={16} />}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Theme Stress Test */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2rem', paddingRight: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '0.5rem' }}>Theme QA: {currentTheme.name}</h1>
          <p style={{ color: 'var(--rw-text-secondary)' }}>Current theme stress test dashboard. If you can read this clearly, body text contrast is good.</p>
        </div>

        {/* Buttons & Interactive */}
        <section>
          <h3 style={{ color: 'var(--rw-text-muted)', textTransform: 'uppercase', fontSize: '12px', marginBottom: '1rem' }}>Buttons & Inputs</h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button style={{ background: 'var(--rw-accent)', color: 'var(--rw-accent-text)', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Lock size={16} /> Accent Button
            </button>
            <button style={{ background: 'var(--rw-panel-bg)', color: 'var(--rw-text-primary)', padding: '8px 16px', borderRadius: '6px', border: '1px solid var(--rw-border)', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Settings size={16} /> Secondary Button
            </button>
            <button style={{ background: 'var(--rw-danger)', color: '#fff', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <AlertTriangle size={16} /> Danger Button
            </button>
            <input type="text" placeholder="Search placeholder..." style={{ background: 'var(--rw-bg)', color: 'var(--rw-text-primary)', border: '1px solid var(--rw-border-strong)', padding: '8px 16px', borderRadius: '6px', outline: 'none' }} />
          </div>
        </section>

        {/* Surfaces */}
        <section>
          <h3 style={{ color: 'var(--rw-text-muted)', textTransform: 'uppercase', fontSize: '12px', marginBottom: '1rem' }}>Surfaces & Cards</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <div style={{ background: 'var(--rw-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--rw-border)' }}>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>App Background</h4>
              <p style={{ margin: 0, color: 'var(--rw-text-secondary)', fontSize: '14px' }}>Normal content area.</p>
            </div>
            <div style={{ background: 'var(--rw-surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--rw-border)' }}>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>Surface Card</h4>
              <p style={{ margin: 0, color: 'var(--rw-text-secondary)', fontSize: '14px' }}>Used for list items and settings cards.</p>
            </div>
            <div style={{ background: 'var(--rw-panel-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--rw-border)' }}>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>Panel Background</h4>
              <p style={{ margin: 0, color: 'var(--rw-text-secondary)', fontSize: '14px' }}>Used for sidebars and dropdowns.</p>
            </div>
            <div style={{ background: 'var(--rw-panel-hover)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--rw-border)' }}>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>Hover Background</h4>
              <p style={{ margin: 0, color: 'var(--rw-text-secondary)', fontSize: '14px' }}>Used for hovered list items.</p>
            </div>
          </div>
        </section>

        {/* Reader Simulation */}
        <section>
          <h3 style={{ color: 'var(--rw-text-muted)', textTransform: 'uppercase', fontSize: '12px', marginBottom: '1rem' }}>Reader Simulation</h3>
          <div style={{ background: 'var(--rw-reader-bg)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--rw-border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: '#fff', color: '#000', padding: '2rem', borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <h1 style={{ margin: '0 0 1rem 0' }}>PDF Canvas Mock</h1>
              <p style={{ margin: 0 }}>This simulates a native PDF page. Notice it stays black and white regardless of theme.</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
              <button style={{ background: 'var(--rw-toolbar-bg)', color: 'var(--rw-text-primary)', border: '1px solid var(--rw-border)', padding: '8px 16px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Search size={16} /> Toolbar Item
              </button>
            </div>
          </div>
        </section>
        
        {/* State Tokens */}
        <section>
          <h3 style={{ color: 'var(--rw-text-muted)', textTransform: 'uppercase', fontSize: '12px', marginBottom: '1rem' }}>Text Tokens</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ color: 'var(--rw-text-primary)', fontSize: '18px', fontWeight: 600 }}>Primary Text (--rw-text-primary)</div>
            <div style={{ color: 'var(--rw-text-secondary)', fontSize: '16px' }}>Secondary Text (--rw-text-secondary)</div>
            <div style={{ color: 'var(--rw-text-muted)', fontSize: '14px' }}>Muted Text (--rw-text-muted)</div>
            <div style={{ color: 'var(--rw-accent)', fontSize: '14px', fontWeight: 600 }}>Accent Text (--rw-accent)</div>
          </div>
        </section>

      </div>
    </div>
  );
}
