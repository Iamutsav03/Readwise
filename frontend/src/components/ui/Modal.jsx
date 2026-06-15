// src/components/ui/Modal.jsx
// Generic modal wrapper with backdrop, slide-up animation, and close button.

import React, { useEffect } from "react";

/**
 * @param {boolean}   isOpen
 * @param {Function}  onClose
 * @param {string}    [title]
 * @param {string}    [width='440px']
 * @param {ReactNode} children
 */
const Modal = ({ isOpen, onClose, title, width = "440px", children, style }) => {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.45)",
          zIndex: 9998,
          animation: "rwFadeIn 0.18s ease",
        }}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position:   "fixed",
          top:        "50%",
          left:       "50%",
          transform:  "translate(-50%, -50%)",
          width,
          maxWidth:   "92vw",
          maxHeight:  "82vh",
          overflowY:  "auto",
          background: "var(--rw-panel-bg)",
          border:     "1px solid var(--rw-border)",
          borderRadius: 12,
          boxShadow:  "0 8px 32px rgba(0,0,0,0.4)",
          padding:    "24px",
          zIndex:     9999,
          fontFamily: "var(--rw-font-family)",
          animation:  "rwSlideUp 0.2s ease",
          ...style,
        }}
      >
        <style>{`
          @keyframes rwFadeIn  { from { opacity: 0; } to { opacity: 1; } }
          @keyframes rwSlideUp { from { opacity: 0; transform: translate(-50%, -46%); } to { opacity: 1; transform: translate(-50%, -50%); } }
        `}</style>

        {/* Header */}
        {title && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ margin: 0, fontSize: 18, color: "var(--rw-text-primary)" }}>{title}</h2>
            <button
              onClick={onClose}
              aria-label="Close"
              style={{ background: "transparent", border: "none", color: "var(--rw-text-muted)", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 4, minWidth: 36, minHeight: 36, display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              ✕
            </button>
          </div>
        )}

        {children}
      </div>
    </>
  );
};

export default Modal;
