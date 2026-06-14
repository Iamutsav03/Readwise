import React from "react";
import { NOTE_COLORS } from "../utils/noteHelpers";
import { Bold, Italic, Underline, List } from "lucide-react";

export default function NoteToolbar({ currentColor, onColorChange, onBold, onItalic, onUnderline, onList }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "6px 8px",
        borderBottom: "1px solid var(--rw-border)",
        background: "var(--rw-card-bg)",
        gap: 8,
      }}
    >
      {/* Rich Text Format Options */}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <FormatBtn onClick={onBold} title="Bold (Ctrl+B)">
          <Bold size={14} />
        </FormatBtn>
        <FormatBtn onClick={onItalic} title="Italic (Ctrl+I)">
          <Italic size={14} />
        </FormatBtn>
        <FormatBtn onClick={onUnderline} title="Underline (Ctrl+U)">
          <Underline size={14} />
        </FormatBtn>
        <FormatBtn onClick={onList} title="Bulleted List">
          <List size={14} />
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
                border: isSelected ? "1.5px solid var(--rw-text-primary)" : "1px solid var(--rw-border-strong)",
                cursor: "pointer",
                padding: 0,
                boxShadow: isSelected ? "0 0 0 2px var(--rw-panel-bg)" : "none",
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
        background: hovered ? "var(--rw-hover-bg)" : "transparent",
        border: "none",
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 11,
        color: hovered ? "var(--rw-text-primary)" : "var(--rw-text-muted)",
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
