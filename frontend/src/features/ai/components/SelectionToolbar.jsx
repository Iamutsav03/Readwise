// features/ai/components/SelectionToolbar.jsx
// Clean, minimal selection toolbar.
// Actions: [Color] [Meaning] [Quick Explain] [Deep Explain] [Summary*] [Copy]
// *Summary only appears for selections >= 15 words.
import React, { useState, useLayoutEffect, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { HIGHLIGHT_COLORS } from "../../../utils/highlightHelpers";
import { BookOpen, Zap, Sparkles, Copy, Palette, FileText } from "lucide-react";
import { useBreakpoints } from "../../../hooks/useBreakpoints";
import MobileBottomSheet from "../../../components/MobileBottomSheet";

// Count words in a string
function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

const SelectionToolbar = ({
  position,
  selectionText,
  pageNumber,
  onColorPick,
  onAction,
  onClose,
}) => {
  const [adjustedPosition, setAdjustedPosition] = useState(null);
  const toolbarRef = useRef(null);
  const [showPalette, setShowPalette] = useState(false);
  const { isMobileOrSmaller } = useBreakpoints();

  const wordCount = countWords(selectionText || "");
  const showSummary = wordCount >= 15;

  // ── Position logic (desktop only) ────────────────────────────────────────
  useLayoutEffect(() => {
    if (!position || isMobileOrSmaller) return;

    let left = position.left + position.width / 2;
    let top = position.top - 52;

    if (toolbarRef.current) {
      const rect = toolbarRef.current.getBoundingClientRect();
      const margin = 16;
      if (left - rect.width / 2 < margin) left = rect.width / 2 + margin;
      else if (left + rect.width / 2 > window.innerWidth - margin)
        left = window.innerWidth - rect.width / 2 - margin;
      if (top < margin) top = position.top + (position.height || 20) + 10;
    } else {
      const TOOLBAR_WIDTH = 340;
      if (left < TOOLBAR_WIDTH / 2) left = TOOLBAR_WIDTH / 2 + 16;
      else if (left > window.innerWidth - TOOLBAR_WIDTH / 2)
        left = window.innerWidth - TOOLBAR_WIDTH / 2 - 16;
    }

    setAdjustedPosition({ top, left });
  }, [position, selectionText, isMobileOrSmaller]);

  // Esc closes toolbar
  useEffect(() => {
    const onEsc = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  const handleCopy = (e) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(selectionText).then(() => onClose());
  };

  const handleAction = (e, type) => {
    e.stopPropagation();
    onAction(type);
  };

  // ── Desktop Floating Toolbar ──────────────────────────────────────────────
  if (!isMobileOrSmaller) {
    if (!adjustedPosition) return null;

    const floatStyle = {
      position: "absolute",
      top: adjustedPosition.top,
      left: adjustedPosition.left,
      transform: "translateX(-50%)",
      zIndex: 100,
      display: "flex",
      gap: "4px",
      padding: "6px",
      background: "var(--rw-card-bg)",
      border: "1px solid var(--rw-border-strong)",
      borderRadius: "12px",
      boxShadow: "var(--rw-shadow)",
      alignItems: "center",
      maxWidth: "420px",
      animation: "selFadeScale 0.15s ease-out",
    };

    const btnStyle = {
      background: "transparent",
      border: "none",
      color: "var(--rw-text-primary)",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: 32,
      height: 32,
      borderRadius: 8,
      transition: "background 0.13s, color 0.13s",
      flexShrink: 0,
    };

    const divider = (
      <div style={{ width: 1, height: 20, background: "var(--rw-border-strong)", margin: "0 2px", flexShrink: 0 }} />
    );

    const toolbarContent = (
      <>
        <style>{`
          @keyframes selFadeScale {
            from { opacity: 0; transform: translateX(-50%) scale(0.94); }
            to   { opacity: 1; transform: translateX(-50%) scale(1); }
          }
          .sel-btn:hover { background: var(--rw-hover-bg) !important; }
        `}</style>

        <div
          ref={toolbarRef}
          style={floatStyle}
          onMouseDown={(e) => e.preventDefault()}
        >
          {showPalette ? (
            // ── Color palette expanded ──────────────────────────────────────
            <div style={{ display: "flex", gap: "6px", padding: "0 4px", alignItems: "center" }}>
              {HIGHLIGHT_COLORS.map((color) => (
                <button
                  key={color.id}
                  onClick={(e) => { e.stopPropagation(); onColorPick(color.id); }}
                  title={color.label}
                  style={{
                    width: 22, height: 22, borderRadius: "50%",
                    background: color.bg, border: `2px solid ${color.border}`,
                    cursor: "pointer", padding: 0, transition: "transform 0.1s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.15)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                />
              ))}
              {divider}
              <button
                className="sel-btn"
                style={btnStyle}
                onClick={(e) => { e.stopPropagation(); setShowPalette(false); }}
                title="Back"
              >
                <Palette size={15} />
              </button>
            </div>
          ) : (
            // ── Main action row ─────────────────────────────────────────────
            <div style={{ display: "flex", gap: "2px", alignItems: "center" }}>
              {/* Highlight */}
              <button
                className="sel-btn"
                style={btnStyle}
                onClick={(e) => { e.stopPropagation(); setShowPalette(true); }}
                title="Highlight"
              >
                <Palette size={16} />
              </button>

              {divider}

              {/* Meaning */}
              <button
                className="sel-btn"
                style={btnStyle}
                onClick={(e) => handleAction(e, "meaning")}
                title="Meaning"
              >
                <BookOpen size={16} />
              </button>

              {/* Quick Explain */}
              <button
                className="sel-btn"
                style={btnStyle}
                onClick={(e) => handleAction(e, "quick_explain")}
                title="Quick Explain"
              >
                <Zap size={16} />
              </button>

              {/* Deep Explain */}
              <button
                className="sel-btn"
                style={btnStyle}
                onClick={(e) => handleAction(e, "deep_explain")}
                title="Deep Explain"
              >
                <Sparkles size={16} />
              </button>

              {/* Summary — only for 15+ word selections */}
              {showSummary && (
                <button
                  className="sel-btn"
                  style={btnStyle}
                  onClick={(e) => handleAction(e, "summary")}
                  title="Summarise"
                >
                  <FileText size={16} />
                </button>
              )}

              {divider}

              {/* Copy */}
              <button
                className="sel-btn"
                style={btnStyle}
                onClick={handleCopy}
                title="Copy"
              >
                <Copy size={16} />
              </button>
            </div>
          )}
        </div>
      </>
    );

    return createPortal(toolbarContent, document.body);
  }

  // ── Mobile Bottom Sheet ───────────────────────────────────────────────────
  return (
    <MobileBottomSheet
      isOpen={true}
      onClose={onClose}
      title="Selection Actions"
      fullScreen={false}
      initialSnap={50}
      snapPoints={[30, 50, 80]}
    >
      <div style={{ padding: "0 16px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Selected text preview */}
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            color: "var(--rw-text-secondary)",
            margin: 0,
            fontStyle: "italic",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            paddingBottom: 4,
          }}
        >
          "{selectionText}"
        </p>

        {/* Highlight colour row */}
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", padding: "6px 0" }}>
          {HIGHLIGHT_COLORS.map((color) => (
            <button
              key={color.id}
              onClick={(e) => { e.stopPropagation(); onColorPick(color.id); onClose(); }}
              style={{
                width: 34, height: 34, borderRadius: "50%",
                background: color.bg, border: `2px solid ${color.border}`,
                cursor: "pointer", padding: 0,
              }}
            />
          ))}
        </div>

        <div style={{ height: 1, background: "var(--rw-border)" }} />

        {/* Action list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <MobileActionBtn
            icon={<BookOpen size={18} />}
            label="Meaning"
            onClick={(e) => { handleAction(e, "meaning"); onClose(); }}
          />
          <MobileActionBtn
            icon={<Zap size={18} />}
            label="Quick Explain"
            onClick={(e) => { handleAction(e, "quick_explain"); onClose(); }}
          />
          <MobileActionBtn
            icon={<Sparkles size={18} />}
            label="Deep Explain"
            onClick={(e) => { handleAction(e, "deep_explain"); onClose(); }}
          />
          {showSummary && (
            <MobileActionBtn
              icon={<FileText size={18} />}
              label="Summarise"
              onClick={(e) => { handleAction(e, "summary"); onClose(); }}
            />
          )}
          <MobileActionBtn
            icon={<Copy size={18} />}
            label="Copy"
            onClick={(e) => { handleCopy(e); onClose(); }}
          />
        </div>
      </div>
    </MobileBottomSheet>
  );
};

const MobileActionBtn = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: "flex",
      alignItems: "center",
      gap: 14,
      width: "100%",
      padding: "12px 14px",
      background: "var(--rw-card-bg)",
      border: "1px solid var(--rw-border)",
      borderRadius: 10,
      color: "var(--rw-text-primary)",
      fontFamily: "'DM Sans', sans-serif",
      fontSize: 15,
      fontWeight: 500,
      cursor: "pointer",
    }}
  >
    <div style={{ color: "var(--rw-text-muted)" }}>{icon}</div>
    {label}
  </button>
);

export default SelectionToolbar;
