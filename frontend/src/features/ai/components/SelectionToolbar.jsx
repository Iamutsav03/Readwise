// features/ai/components/SelectionToolbar.jsx
// v3: Two-row mobile action layout (Primary + Secondary).
//   Primary: Save Word, Highlight, Dictionary, Quick Explain, Deep Explain
//   Secondary: Google Search, Open Browser, Copy, Note
//   Desktop: unchanged floating toolbar

import React, { useState, useLayoutEffect, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { HIGHLIGHT_COLORS } from "../../../utils/highlightHelpers";
import { BookOpen, Zap, Sparkles, Copy, Palette, FileText, StickyNote, Globe, ExternalLink, Bookmark } from "lucide-react";
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

  const handleGoogleSearch = (e) => {
    e?.stopPropagation();
    const q = encodeURIComponent(selectionText);
    window.open(`https://www.google.com/search?q=${q}`, "_blank", "noopener,noreferrer");
    onClose();
  };

  const handleOpenBrowser = (e) => {
    e?.stopPropagation();
    const q = encodeURIComponent(selectionText);
    window.open(`https://en.wikipedia.org/w/index.php?search=${q}`, "_blank", "noopener,noreferrer");
    onClose();
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
      animation: `selFadeScale var(--anim-selection, 150ms) ease-out`,
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
              <button className="sel-btn" style={btnStyle} onClick={(e) => handleAction(e, "meaning")} title="Meaning">
                <BookOpen size={16} />
              </button>

              {/* Quick Explain */}
              <button className="sel-btn" style={btnStyle} onClick={(e) => handleAction(e, "quick_explain")} title="Quick Explain">
                <Zap size={16} />
              </button>

              {/* Deep Explain */}
              <button className="sel-btn" style={btnStyle} onClick={(e) => handleAction(e, "deep_explain")} title="Deep Explain">
                <Sparkles size={16} />
              </button>

              {/* Summary — only for 15+ word selections */}
              {showSummary && (
                <button className="sel-btn" style={btnStyle} onClick={(e) => handleAction(e, "summary")} title="Summarise">
                  <FileText size={16} />
                </button>
              )}

              {divider}

              {/* Add Note */}
              <button className="sel-btn" style={btnStyle} onClick={(e) => handleAction(e, "note")} title="Add Note">
                <StickyNote size={16} />
              </button>

              {/* Google Search */}
              <button className="sel-btn" style={btnStyle} onClick={handleGoogleSearch} title="Google Search">
                <Globe size={16} />
              </button>

              {divider}

              {/* Copy */}
              <button className="sel-btn" style={btnStyle} onClick={handleCopy} title="Copy">
                <Copy size={16} />
              </button>
            </div>
          )}
        </div>
      </>
    );

    return createPortal(toolbarContent, document.body);
  }

  // ── Mobile Bottom Sheet — Two-Row Layout ──────────────────────────────────
  const truncatedText = selectionText?.length > 100
    ? selectionText.slice(0, 100) + "…"
    : selectionText;

  return (
    <MobileBottomSheet
      isOpen={true}
      onClose={onClose}
      title="Selection Actions"
      fullScreen={false}
      initialSnap={40}
      snapPoints={[30, 40, 70]}
    >
      <div style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Selected text preview */}
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            color: "var(--rw-text-secondary)",
            margin: 0,
            fontStyle: "italic",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            paddingBottom: 4,
            lineHeight: 1.5,
          }}
        >
          "{truncatedText}"
        </p>

        {/* ── PRIMARY ROW: Highlight colors ── */}
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", padding: "4px 0" }}>
          {HIGHLIGHT_COLORS.map((color) => (
            <button
              key={color.id}
              onClick={(e) => { e.stopPropagation(); onColorPick(color.id); onClose(); }}
              title={`Highlight ${color.label}`}
              style={{
                width: 36, height: 36, borderRadius: "50%",
                background: color.bg, border: `2.5px solid ${color.border}`,
                cursor: "pointer", padding: 0,
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              }}
            />
          ))}
        </div>

        <div style={{ height: 1, background: "var(--rw-border)" }} />

        {/* ── PRIMARY ACTIONS ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <MobileActionBtn
            icon={<BookOpen size={18} />}
            label="Dictionary"
            description="Look up meaning"
            onClick={(e) => { handleAction(e, "meaning"); }}
          />
          <MobileActionBtn
            icon={<Zap size={18} />}
            label="Quick Explain"
            description="Fast AI explanation"
            onClick={(e) => { handleAction(e, "quick_explain"); }}
          />
          <MobileActionBtn
            icon={<Sparkles size={18} />}
            label="Deep Explain"
            description="Detailed AI analysis"
            onClick={(e) => { handleAction(e, "deep_explain"); }}
          />
          {showSummary && (
            <MobileActionBtn
              icon={<FileText size={18} />}
              label="Summarise"
              description="Condense this passage"
              onClick={(e) => { handleAction(e, "summary"); }}
            />
          )}
        </div>

        <div style={{ height: 1, background: "var(--rw-border)" }} />

        {/* ── SECONDARY ACTIONS (2-column grid) ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <SecondaryBtn icon={<Globe size={16} />} label="Google Search" onClick={handleGoogleSearch} />
          <SecondaryBtn icon={<ExternalLink size={16} />} label="Open Browser" onClick={handleOpenBrowser} />
          <SecondaryBtn icon={<StickyNote size={16} />} label="Add Note" onClick={(e) => { handleAction(e, "note"); }} />
          <SecondaryBtn icon={<Copy size={16} />} label="Copy" onClick={(e) => { handleCopy(e); }} />
        </div>
      </div>
    </MobileBottomSheet>
  );
};

// ── Sub-components ──────────────────────────────────────────────────────────

const MobileActionBtn = ({ icon, label, description, onClick }) => (
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
      borderRadius: 12,
      color: "var(--rw-text-primary)",
      fontFamily: "'DM Sans', sans-serif",
      fontSize: 15,
      fontWeight: 500,
      cursor: "pointer",
      minHeight: 52,
      textAlign: "left",
    }}
  >
    <div style={{ color: "var(--rw-accent)", flexShrink: 0 }}>{icon}</div>
    <div style={{ flex: 1 }}>
      <div style={{ fontWeight: 600, fontSize: 14 }}>{label}</div>
      {description && (
        <div style={{ fontSize: 11, color: "var(--rw-text-muted)", marginTop: 1 }}>{description}</div>
      )}
    </div>
  </button>
);

const SecondaryBtn = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: 6,
      padding: "10px 8px",
      background: "var(--rw-card-bg)",
      border: "1px solid var(--rw-border)",
      borderRadius: 12,
      color: "var(--rw-text-secondary)",
      fontFamily: "'DM Sans', sans-serif",
      fontSize: 12,
      fontWeight: 500,
      cursor: "pointer",
      minHeight: 60,
    }}
  >
    <div style={{ color: "var(--rw-text-muted)" }}>{icon}</div>
    {label}
  </button>
);

export default SelectionToolbar;
