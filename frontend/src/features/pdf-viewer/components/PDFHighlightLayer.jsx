// features/pdf-viewer/components/PDFHighlightLayer.jsx
import React from "react";
import { COLOR_MAP } from "../../../utils/highlightHelpers";

/**
 * Renders highlights as absolute positioned divs over the PDF page.
 * Receives highlights for the current page and rendering scale.
 */
const PDFHighlightLayer = ({ highlights = [], scale = 1, focusedHighlightId = null }) => {
  if (highlights.length === 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: "none", // Let clicks pass through to text layer
        zIndex: 10, // Above text layer but below annotations/toolbar
      }}
    >
      {highlights.map((highlight) => (
        <React.Fragment key={highlight._id}>
          {highlight.rects.map((rect, idx) => {
            const colorDef = COLOR_MAP[highlight.color] || COLOR_MAP["yellow"];
            const isFocused = highlight._id === focusedHighlightId;

            return (
              <div
                key={`${highlight._id}-${idx}`}
                className={`highlight-rect ${isFocused ? "focused" : ""}`}
                style={{
                  position: "absolute",
                  left: `${rect.x * 100}%`,
                  top: `${rect.y * 100}%`,
                  width: `${rect.w * 100}%`,
                  height: `${rect.h * 100}%`,
                  backgroundColor: colorDef.bg,
                  borderBottom: `2px solid ${colorDef.border}`,
                  mixBlendMode: "multiply", // Makes it look like a real marker
                  transition: "background-color 0.3s, box-shadow 0.3s",
                  boxShadow: isFocused ? `0 0 0 2px ${colorDef.border}, 0 0 10px ${colorDef.bg}` : "none",
                  // Slightly round corners for a natural look
                  borderRadius: "2px",
                }}
              />
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
};

export default PDFHighlightLayer;
