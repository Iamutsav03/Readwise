// features/ai/components/SelectionToolbar.jsx
import React, { useEffect, useState, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { HIGHLIGHT_COLORS } from "../../../utils/highlightHelpers";
import ExplainSelectionButton from "./ExplainSelectionButton";
import MeaningButton from "../../dictionary/components/MeaningButton";
import { X } from "lucide-react";

// Count words in a string (simple split on whitespace)
function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Floating toolbar that appears above selected text.
 * Future-proof action registry pattern.
 */
const SelectionToolbar = ({ position, selectionText, onColorPick, onAction, onClose }) => {
  const [adjustedPosition, setAdjustedPosition] = useState(null);
  const toolbarRef = useRef(null);
  const wordCount = countWords(selectionText || "");
  // 1 word → "Meaning" (dictionary first)
  // 2+ words → "Quick Explain" (mongo cache → AI)
  const isMultiWord = wordCount > 1;
  const meaningLabel = isMultiWord ? "Quick Explain" : "Meaning";

  useLayoutEffect(() => {
    if (!position) return;
    
    // Default position (above the selection)
    let left = position.left + position.width / 2;
    let top = position.top - 50; // default offset above

    // If we have the ref, we can do precise bounding checks
    if (toolbarRef.current) {
      const rect = toolbarRef.current.getBoundingClientRect();
      const margin = 10;

      // Clamp Left/Right
      if (left - rect.width / 2 < margin) {
        left = rect.width / 2 + margin;
      } else if (left + rect.width / 2 > window.innerWidth - margin) {
        left = window.innerWidth - rect.width / 2 - margin;
      }

      // Clamp Top/Bottom
      if (top < margin) {
        // Not enough space above, flip to below the selection
        top = position.top + (position.height || 20) + 10;
      }
    } else {
      // Fallback rough clamping before mount
      const TOOLBAR_WIDTH = 320;
      if (left < TOOLBAR_WIDTH / 2) {
        left = TOOLBAR_WIDTH / 2 + 10;
      } else if (left > window.innerWidth - TOOLBAR_WIDTH / 2) {
        left = window.innerWidth - TOOLBAR_WIDTH / 2 - 10;
      }
    }

    setAdjustedPosition({ top, left });
  }, [position, selectionText]);

  if (!adjustedPosition) return null;

  const style = {
    position: "absolute",
    top: adjustedPosition.top,
    left: adjustedPosition.left,
    transform: "translateX(-50%)",
    zIndex: 100, // Above PDF text layer
    display: "flex",
    gap: "8px",
    padding: "6px 8px",
    background: "var(--rw-card-bg)",
    border: "1px solid var(--rw-border-strong)",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
    alignItems: "center",
  };

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(selectionText).then(() => {
      onClose(); // Optional: close after copy
    });
  };

  const handleAction = (e, actionType) => {
    e.stopPropagation();
    onAction(actionType);
  };

  const toolbarContent = (
    <div
      ref={toolbarRef}
      className="selection-toolbar"
      style={style}
      onMouseDown={(e) => e.preventDefault()} // ← Critical: prevents browser from clearing text selection when clicking toolbar buttons
    >
      {/* Highlighters */}
      <div style={{ display: "flex", gap: "6px" }}>
        {HIGHLIGHT_COLORS.map((color) => (
          <button
            key={color.id}
            onClick={(e) => {
              e.stopPropagation();
              onColorPick(color.id);
            }}
            title={color.label}
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: color.bg,
              border: `2px solid ${color.border}`,
              cursor: "pointer",
              padding: 0,
              transition: "transform 0.1s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          />
        ))}
      </div>

      <div style={{ width: 1, height: 20, background: "var(--rw-border-strong)", margin: "0 2px" }} />

      {/* Basic Actions */}
      <button
        onClick={handleCopy}
        title="Copy Text"
        style={{
          background: "transparent", border: "none", color: "var(--rw-text-muted)", cursor: "pointer",
          fontSize: "12px", fontFamily: "'DM Sans', sans-serif", padding: "4px"
        }}
      >
        Copy
      </button>

      <div style={{ width: 1, height: 20, background: "var(--rw-border-strong)", margin: "0 2px" }} />

      {/* Meaning / Quick Explain Button — always shown for any selection */}
      <MeaningButton
        label={meaningLabel}
        onClick={(e) => {
          // > 5 words → route to full AI explain instead of dictionary
          if (wordCount > 5) {
            handleAction(e, "explain");
          } else {
            handleAction(e, "meaning");
          }
        }}
      />

      {/* AI Explain — for deeper/full explanations */}
      <ExplainSelectionButton onClick={(e) => handleAction(e, "explain")} />

      {/* Close Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        title="Cancel"
        style={{
          background: "transparent", border: "none", color: "var(--rw-text-secondary)", cursor: "pointer",
          fontSize: 18, lineHeight: 1, padding: "0 4px", display: "flex"
        }}
      >
        <X size={16} />
      </button>
    </div>
  );

  return createPortal(toolbarContent, document.body);
};

export default SelectionToolbar;
