// src/components/ui/Badge.jsx
// Small status / label badge using ReadWise CSS variables.

import React from "react";

/**
 * @param {'accent'|'success'|'warning'|'danger'|'muted'} [variant='accent']
 * @param {ReactNode} children
 */
const Badge = ({ variant = "accent", children, style }) => {
  const colors = {
    accent:  { bg: "var(--rw-accent-muted)",   color: "var(--rw-accent)" },
    success: { bg: "rgba(34,197,94,0.15)",      color: "var(--rw-success)" },
    warning: { bg: "rgba(245,158,11,0.15)",     color: "var(--rw-warning)" },
    danger:  { bg: "rgba(239,68,68,0.15)",      color: "var(--rw-danger)" },
    muted:   { bg: "rgba(255,255,255,0.06)",    color: "var(--rw-text-muted)" },
  };

  const { bg, color } = colors[variant] ?? colors.accent;

  return (
    <span
      style={{
        display:      "inline-block",
        padding:      "2px 8px",
        borderRadius: 99,
        fontSize:     10,
        fontWeight:   600,
        fontFamily:   "var(--rw-font-family)",
        letterSpacing:"0.04em",
        textTransform:"uppercase",
        background:   bg,
        color,
        ...style,
      }}
    >
      {children}
    </span>
  );
};

export default Badge;
