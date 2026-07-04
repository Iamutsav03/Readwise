import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { useBreakpoints } from "../../../hooks/useBreakpoints";
import MobileBottomSheet from "../../../components/MobileBottomSheet";
import { Bookmark, Sparkles, X, Copy } from "lucide-react";

/**
 * Action registry for the dictionary popup.
 * Future actions like Translate, Flashcard, Quiz can be added here.
 */
const ACTION_REGISTRY = [
  {
    id: "save",
    icon: <Bookmark size={14} />,
    label: "Save Word",
    savedLabel: "Saved!",
    type: "save",
  },
  {
    id: "explain",
    icon: <Sparkles size={14} />,
    label: "Explain Further",
    type: "explain",
  },
  {
    id: "copy",
    icon: <Copy size={14} />,
    label: "Copy",
    type: "copy",
  },
];

const styles = {
  overlay: {
    position: "absolute",
    zIndex: 200,
    pointerEvents: "none",
  },
  popup: {
    pointerEvents: "all",
    background: "var(--rw-popup-bg)",
    border: "1px solid var(--rw-border)",
    borderRadius: "12px",
    padding: "16px",
    width: "280px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.1)",
    fontFamily: "var(--rw-font-family)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "10px",
  },
  wordTitle: {
    fontSize: "18px",
    fontWeight: 700,
    color: "var(--rw-text-primary)",
    margin: 0,
    textTransform: "capitalize",
  },
  pronunciation: {
    fontSize: "11px",
    color: "var(--rw-text-secondary)",
    marginTop: "2px",
    fontStyle: "italic",
  },
  badge: {
    background: "var(--rw-accent-muted)",
    border: "1px solid var(--rw-border)",
    borderRadius: "4px",
    padding: "2px 8px",
    fontSize: "11px",
    color: "var(--rw-accent)",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  section: {
    marginBottom: "10px",
  },
  label: {
    fontSize: "10px",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    color: "var(--rw-text-muted)",
    marginBottom: "3px",
  },
  content: {
    fontSize: "13px",
    color: "var(--rw-text-primary)",
    lineHeight: 1.55,
    margin: 0,
  },
  example: {
    fontSize: "12px",
    color: "var(--rw-text-secondary)",
    fontStyle: "italic",
    borderLeft: "2px solid var(--rw-border)",
    paddingLeft: "8px",
    margin: 0,
    lineHeight: 1.5,
  },
  synonyms: {
    display: "flex",
    flexWrap: "wrap",
    gap: "4px",
    marginTop: "4px",
  },
  synonymChip: {
    background: "var(--rw-card-bg)",
    border: "1px solid var(--rw-border)",
    borderRadius: "4px",
    padding: "2px 7px",
    fontSize: "11px",
    color: "var(--rw-text-secondary)",
  },
  divider: {
    height: "1px",
    background: "var(--rw-border)",
    margin: "10px 0",
  },
  actions: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
    alignItems: "center",
    marginTop: "2px",
  },
  closeBtn: {
    marginLeft: "auto",
    background: "transparent",
    border: "none",
    color: "var(--rw-text-muted)",
    cursor: "pointer",
    fontSize: "16px",
    minWidth: "44px",
    minHeight: "44px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  errorBox: {
    padding: "10px",
    borderRadius: "8px",
    background: "rgba(200,50,50,0.1)",
    border: "1px solid rgba(200,50,50,0.2)",
    color: "#ff9999",
    fontSize: "13px",
    textAlign: "center",
    lineHeight: 1.5,
  }
};

export default function DictionaryPopup({
  result,
  error,
  isLoading,
  isSaved,
  isSaving,
  onSave,
  onExplainFurther,
  onOpenVault,
  onClose,
  position,
}) {
  const popupRef = useRef(null);
  const [adjustedPos, setAdjustedPos] = useState({ top: 0, left: 0 });
  const { isMobileOrSmaller: isMobile } = useBreakpoints();

  useLayoutEffect(() => {
    if (!position || !popupRef.current) return;
    
    // Position object typically contains bounding rect top/left/width/height from selection
    // Note: The SelectionToolbar creates 'position' as { top, left, width }.
    // Because it's a portal to document.body, we use absolute coordinates based on the window.
    
    const popupRect = popupRef.current.getBoundingClientRect();
    const margin = 10;
    
    let left = position.left + (position.width || 0) / 2;
    let top = position.top + margin;

    // Shift left if overflowing right edge
    if (left + popupRect.width + margin > window.innerWidth) {
      left = window.innerWidth - popupRect.width - margin;
    }
    // Prevent shifting too far left
    if (left < margin) {
      left = margin;
    }

    // Shift above if overflowing bottom edge
    if (top + popupRect.height + margin > window.innerHeight) {
      top = position.top - popupRect.height - margin;
      // If it still overflows top, stick it to the bottom
      if (top < margin) {
        top = window.innerHeight - popupRect.height - margin;
      }
    }

    setAdjustedPos({ top, left });
  }, [position, isLoading, result, error]);

  // Keyboard escape to close
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Compute popup position
  const popupStyle = {
    ...styles.popup,
    position: "absolute",
    top: adjustedPos.top,
    left: adjustedPos.left,
    transform: "none",
    animation: "fadeInUp 0.15s ease",
    zIndex: 99999,
  };

  const handleAction = (actionId) => {
    if (actionId === "save") {
      onSave();
    } else if (actionId === "explain") {
      onExplainFurther();
    } else if (actionId === "copy") {
      const textToCopy = result?.meaning ? `${result.word}: ${result.meaning}` : result?.word;
      if (textToCopy) navigator.clipboard.writeText(textToCopy);
    }
  };

  const popupContent = (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .rw-dict-btn:focus-visible {
          outline: 2px solid var(--rw-accent);
          outline-offset: 2px;
        }
      `}</style>
      <div
        ref={isMobile ? null : popupRef}
        style={isMobile ? { padding: "0 16px 24px", fontFamily: "var(--rw-font-family)" } : popupStyle}
        onMouseDown={(e) => e.stopPropagation()} // Stop propagation so ReaderLayout doesn't clear selection
      >
        {isLoading && (
          <div style={{ color: "var(--rw-accent)", fontSize: 13, textAlign: "center", padding: "8px 0" }}>
            {isLoading === "fallback" ? "Getting a deeper explanation..." : "Looking up meaning..."}
          </div>
        )}

        {!isLoading && error && (
          <div>
            <div style={styles.errorBox}>{error}</div>
            <div style={{ ...styles.divider, marginTop: "10px" }} />
            <div style={styles.actions}>
              <button
                className="rw-dict-btn"
                onClick={onExplainFurther}
                style={{ background: "transparent", border: "1px solid var(--rw-border)", color: "var(--rw-accent)", borderRadius: 6, padding: "8px 12px", minHeight: 44, display: "inline-flex", gap: 6, alignItems: "center", fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
              >
                <Sparkles size={14} /> Explain AI
              </button>
              <button className="rw-dict-btn" onClick={onClose} style={styles.closeBtn}><X size={16} /></button>
            </div>
          </div>
        )}

        {!isLoading && result && (
          <>
            {/* Header: Word + PoS badge */}
            <div style={styles.header}>
              <div>
                <p style={styles.wordTitle}>{result.word}</p>
                {result.pronunciation && (
                  <p style={styles.pronunciation}>{result.pronunciation}</p>
                )}
              </div>
              {result.partOfSpeech && (
                <span style={styles.badge}>{result.partOfSpeech}</span>
              )}
            </div>

            {/* Meaning */}
            <div style={styles.section}>
              <p style={styles.label}>Meaning</p>
              <p style={styles.content}>{result.meaning}</p>
            </div>

            {/* Example */}
            {result.example && (
              <div style={styles.section}>
                <p style={styles.label}>Example</p>
                <p style={styles.example}>"{result.example}"</p>
              </div>
            )}

            {/* Synonyms */}
            {result.synonyms?.length > 0 && (
              <div style={styles.section}>
                <p style={styles.label}>Synonyms</p>
                <div style={styles.synonyms}>
                  {result.synonyms.slice(0, 5).map((s, i) => (
                    <span key={i} style={styles.synonymChip}>{s}</span>
                  ))}
                </div>
              </div>
            )}

            <div style={styles.divider} />

            {/* Action Registry */}
            <div style={styles.actions}>
              {ACTION_REGISTRY.map((action) => {
                if (action.type === "save") {
                  return (
                    <button
                      key={action.id}
                      className="rw-dict-btn"
                      onClick={() => handleAction(action.id)}
                      disabled={isSaved || isSaving}
                      style={{
                        background: isSaved ? "var(--rw-accent-muted)" : "transparent",
                        border: `1px solid ${isSaved ? "var(--rw-border-strong)" : "var(--rw-border-strong)"}`,
                        color: isSaved ? "var(--rw-accent)" : "var(--rw-text-secondary)",
                        borderRadius: 6,
                        padding: "8px 12px",
                        minHeight: 44,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 13,
                        cursor: isSaved ? "default" : "pointer",
                        fontFamily: "'DM Sans', sans-serif",
                        transition: "all 0.2s",
                      }}
                    >
                      {action.icon} {isSaved ? (action.savedLabel || "Saved!") : action.label}
                    </button>
                  );
                }
                return (
                  <button
                    key={action.id}
                    className="rw-dict-btn"
                    onClick={() => handleAction(action.id)}
                    style={{
                      background: "linear-gradient(135deg, var(--rw-hover-bg), var(--rw-border))",
                      border: "1px solid var(--rw-border)",
                      color: "var(--rw-accent)",
                      borderRadius: 6,
                      padding: "8px 12px",
                      minHeight: 44,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 13,
                      cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 600,
                    }}
                  >
                    {action.icon} {action.label}
                  </button>
                );
              })}
              {isSaved && onOpenVault && (
                <button
                  className="rw-dict-btn"
                  onClick={onOpenVault}
                  style={{
                    background: "transparent",
                    border: "1px solid var(--rw-accent)",
                    color: "var(--rw-accent)",
                    borderRadius: 6,
                    padding: "8px 12px",
                    minHeight: 44,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 13,
                    cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                    transition: "all 0.2s",
                  }}
                >
                  <Bookmark size={14} /> Open Vault
                </button>
              )}
              <button className="rw-dict-btn" onClick={onClose} style={styles.closeBtn} title="Close"><X size={16} /></button>
            </div>
          </>
        )}
      </div>
    </>
  );

  if (isMobile) {
    return (
      <MobileBottomSheet
        isOpen={true}
        onClose={onClose}
        title="Dictionary"
        fullScreen={false}
      >
        {popupContent}
      </MobileBottomSheet>
    );
  }

  return createPortal(popupContent, document.body);
}
