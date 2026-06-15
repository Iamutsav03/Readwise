// src/components/ui/Tooltip.jsx
// Simple tooltip that renders above/below/left/right of its child.
// Pure CSS — no external dependencies.

import React, { useState } from "react";

/**
 * @param {string}  text              - Tooltip label
 * @param {'top'|'bottom'|'left'|'right'} [placement='top']
 * @param {ReactNode} children        - The element to attach the tooltip to
 */
const Tooltip = ({ text, placement = "top", children }) => {
  const [visible, setVisible] = useState(false);

  if (!text) return children;

  const offset = 8;
  const placementStyles = {
    top:    { bottom: "calc(100% + " + offset + "px)", left: "50%", transform: "translateX(-50%)" },
    bottom: { top:    "calc(100% + " + offset + "px)", left: "50%", transform: "translateX(-50%)" },
    left:   { right:  "calc(100% + " + offset + "px)", top:  "50%", transform: "translateY(-50%)" },
    right:  { left:   "calc(100% + " + offset + "px)", top:  "50%", transform: "translateY(-50%)" },
  };

  return (
    <div
      style={{ position: "relative", display: "inline-flex" }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          style={{
            position:     "absolute",
            ...placementStyles[placement],
            background:   "rgba(0,0,0,0.75)",
            color:        "#fff",
            fontSize:     11,
            fontFamily:   "var(--rw-font-family)",
            padding:      "4px 8px",
            borderRadius: 5,
            whiteSpace:   "nowrap",
            pointerEvents:"none",
            zIndex:       99999,
            backdropFilter: "blur(4px)",
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
