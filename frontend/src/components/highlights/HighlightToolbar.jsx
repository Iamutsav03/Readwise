// src/components/highlights/HighlightToolbar.jsx
import React from "react";
import { HIGHLIGHT_COLORS } from "../../utils/highlightHelpers";

/**
 * Floating toolbar that appears above selected text.
 */
const HighlightToolbar = ({ position, onColorPick, onClose }) => {
  if (!position) return null;

  // Position it slightly above the selection
  const style = {
    position: "absolute",
    top: position.top - 45, // 45px above the selection
    left: position.left + position.width / 2, // Centered on selection
    transform: "translateX(-50%)",
    zIndex: 100, // Above PDF text layer
    display: "flex",
    gap: "8px",
    padding: "6px 8px",
    background: "#1a1a1a",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    alignItems: "center",
  };

  return (
    <div className="highlight-toolbar" style={style}>
      {HIGHLIGHT_COLORS.map((color) => (
        <button
          key={color.id}
          onClick={(e) => {
            e.stopPropagation();
            onColorPick(color.id);
          }}
          title={color.label}
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: color.bg,
            border: `2px solid ${color.border}`,
            cursor: "pointer",
            padding: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "transform 0.1s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        />
      ))}
      
      <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.1)", margin: "0 4px" }} />
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        title="Cancel"
        style={{
          background: "transparent",
          border: "none",
          color: "#aaa",
          cursor: "pointer",
          fontSize: 18,
          lineHeight: 1,
          padding: "0 4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#aaa")}
      >
        ×
      </button>
    </div>
  );
};

export default HighlightToolbar;
