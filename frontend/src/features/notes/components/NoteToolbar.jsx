import React from "react";
import { NOTE_COLORS } from "../utils/noteHelpers";

export default function NoteToolbar({ currentColor, onColorChange, onBold, onItalic, onUnderline, onList }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "6px 8px",
        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
        background: "rgba(255, 255, 255, 0.02)",
        gap: 8,
      }}
    >
      {/* Rich Text Format Options */}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <FormatBtn onClick={onBold} title="Bold (Ctrl+B)">
          <b>B</b>
        </FormatBtn>
        <FormatBtn onClick={onItalic} title="Italic (Ctrl+I)">
          <i>I</i>
        </FormatBtn>
        <FormatBtn onClick={onUnderline} title="Underline (Ctrl+U)">
          <u>U</u>
        </FormatBtn>
        <FormatBtn onClick={onList} title="Bulleted List">
          • List
        </FormatBtn>
      </div>

      {/* Color Selection Swatches */}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {Object.entries(NOTE_COLORS).map(([colorName, config]) => {
          const isSelected = currentColor === colorName;
          return (
            <button
              key={colorName}
              onClick={() => onColorChange(colorName)}
              title={`Switch color to ${colorName}`}
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: config.accent,
                border: isSelected ? "1.5px solid #fff" : "1px solid rgba(255,255,255,0.15)",
                cursor: "pointer",
                padding: 0,
                boxShadow: isSelected ? "0 0 0 2px #111" : "none",
                transform: isSelected ? "scale(1.15)" : "scale(1)",
                transition: "transform 0.15s, border 0.15s",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

const FormatBtn = ({ children, onClick, title }) => {
  const [hovered, setHovered] = React.useState(false);
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      title={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "2px 6px",
        borderRadius: 4,
        background: hovered ? "rgba(255, 255, 255, 0.06)" : "transparent",
        border: "none",
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 11,
        color: hovered ? "#e8d8b8" : "#8a7a62",
        cursor: "pointer",
        transition: "background 0.1s, color 0.1s",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </button>
  );
};
