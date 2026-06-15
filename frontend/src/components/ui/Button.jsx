// src/components/ui/Button.jsx
// Base button primitive using ReadWise CSS variables.
// Variants: 'primary' | 'ghost' | 'danger' | 'icon'

import React from "react";

const VARIANT_STYLES = {
  primary: {
    background: "var(--rw-accent)",
    color: "var(--rw-accent-text)",
    border: "none",
  },
  ghost: {
    background: "transparent",
    color: "var(--rw-text-secondary)",
    border: "1px solid var(--rw-border)",
  },
  danger: {
    background: "transparent",
    color: "var(--rw-danger)",
    border: "1px solid var(--rw-danger)",
  },
  icon: {
    background: "transparent",
    color: "var(--rw-text-secondary)",
    border: "none",
    padding: "6px",
  },
};

/**
 * @param {object}  props
 * @param {'primary'|'ghost'|'danger'|'icon'} [props.variant='ghost']
 * @param {string}  [props.size='md']  - 'sm' | 'md' | 'lg'
 * @param {boolean} [props.disabled]
 * @param {string}  [props.title]
 * @param {Function} props.onClick
 * @param {ReactNode} props.children
 */
const Button = React.forwardRef(function Button(
  { variant = "ghost", size = "md", disabled, onClick, title, children, style, ...rest },
  ref
) {
  const sizeMap = { sm: "6px 10px", md: "8px 14px", lg: "10px 20px" };
  const fontSize = { sm: 12, md: 13, lg: 15 };

  return (
    <button
      ref={ref}
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        display:        "inline-flex",
        alignItems:     "center",
        justifyContent: "center",
        gap:            6,
        padding:        sizeMap[size] ?? sizeMap.md,
        fontSize:       fontSize[size] ?? 13,
        fontFamily:     "var(--rw-font-family)",
        fontWeight:     500,
        borderRadius:   6,
        cursor:         disabled ? "not-allowed" : "pointer",
        opacity:        disabled ? 0.5 : 1,
        transition:     "background 0.15s, color 0.15s, opacity 0.15s",
        ...VARIANT_STYLES[variant],
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
});

export default Button;
