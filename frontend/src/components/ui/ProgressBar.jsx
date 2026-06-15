// src/components/ui/ProgressBar.jsx
// Horizontal progress bar using ReadWise CSS variables.

import React from "react";

/**
 * @param {number}  value           - 0–100
 * @param {string}  [color]         - Defaults to var(--rw-accent)
 * @param {string}  [height='4px']
 * @param {boolean} [animated]      - Subtle shimmer animation while loading
 * @param {string}  [label]         - Optional accessible label
 */
const ProgressBar = ({ value = 0, color, height = "4px", animated = false, label, style }) => {
  const clamped = Math.max(0, Math.min(100, Number(value)));

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      style={{
        width:        "100%",
        height,
        borderRadius: 99,
        background:   "var(--rw-border)",
        overflow:     "hidden",
        ...style,
      }}
    >
      <div
        style={{
          height:     "100%",
          width:      `${clamped}%`,
          background: color || "var(--rw-accent)",
          borderRadius: 99,
          transition: "width 0.4s ease",
          animation:  animated ? "rwShimmer 1.4s infinite" : "none",
        }}
      />
      <style>{`
        @keyframes rwShimmer {
          0%   { opacity: 1; }
          50%  { opacity: 0.6; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default ProgressBar;
