// src/components/highlights/HighlightItem.jsx
import React, { useState } from "react";
import { COLOR_MAP } from "../../utils/highlightHelpers";
import { TrashIcon } from "@heroicons/react/24/outline";

/**
 * A single highlight entry in the side panel.
 */
const HighlightItem = ({ highlight, onJump, onDelete, onFocus }) => {
  const [isHovered, setIsHovered] = useState(false);
  const colorDef = COLOR_MAP[highlight.color] || COLOR_MAP["yellow"];

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        onJump(highlight.pageNumber);
        onFocus(highlight._id);
      }}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: "12px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        background: isHovered ? "rgba(255,255,255,0.03)" : "transparent",
        cursor: "pointer",
        transition: "background 0.2s",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        {/* Color dot and text */}
        <div style={{ display: "flex", gap: 8, overflow: "hidden" }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: colorDef.bg,
              border: `1px solid ${colorDef.border}`,
              marginTop: 4,
              flexShrink: 0,
            }}
          />
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              lineHeight: 1.5,
              color: "#e8d8b8",
              margin: 0,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {highlight.selectedText}
          </p>
        </div>

        {/* Delete button (shows on hover) */}
        {isHovered && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(highlight._id);
            }}
            title="Delete highlight"
            style={{
              background: "transparent",
              border: "none",
              color: "#8a7a62",
              padding: 4,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 4,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--rw-danger)";
              e.currentTarget.style.background = "var(--rw-danger-bg, rgba(224, 112, 96, 0.1))";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--rw-text-muted)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <TrashIcon style={{ width: 14, height: 14 }} />
          </button>
        )}
      </div>

      {/* Page badge */}
      <div style={{ display: "flex", paddingLeft: 18 }}>
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 11,
            color: "#7a6a58",
            background: "rgba(255,255,255,0.05)",
            padding: "2px 6px",
            borderRadius: 4,
          }}
        >
          Page {highlight.pageNumber}
        </span>
      </div>
    </div>
  );
};

export default HighlightItem;
