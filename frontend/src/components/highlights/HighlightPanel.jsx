// src/components/highlights/HighlightPanel.jsx
import React from "react";
import HighlightItem from "./HighlightItem";

const HighlightPanel = ({ highlights = [], onJump, onDelete, onFocus, mobileMode }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#111",
      }}
    >
      {/* Header */}
      {!mobileMode && (
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            flexShrink: 0,
          }}
        >
          <h2
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              fontWeight: 500,
              color: "#e8d8b8",
              margin: 0,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Highlights {highlights.length > 0 && `(${highlights.length})`}
          </h2>
        </div>
      )}

      {/* List */}
      <div
        className="custom-scrollbar"
        style={{
          flex: 1,
          overflowY: "auto",
        }}
      >
        {highlights.length === 0 ? (
          <div
            style={{
              padding: 32,
              textAlign: "center",
              fontFamily: "'DM Sans', sans-serif",
              color: "#6a5a4a",
              fontSize: 13,
            }}
          >
            No highlights yet.
            <br />
            Select text to highlight.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {highlights.map((highlight) => (
              <HighlightItem
                key={highlight._id}
                highlight={highlight}
                onJump={onJump}
                onDelete={onDelete}
                onFocus={onFocus}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HighlightPanel;
