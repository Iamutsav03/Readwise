/**
 * FitControls.jsx
 * ───────────────
 * Two mutually exclusive fit mode buttons: "Fit Page" and "Fit Width".
 * Calls the appropriate fit handler; parent owns the actual scale state.
 *
 * Props:
 *   fitMode        – "page" | "width" | null  (controlled by parent)
 *   onFitPage      – () => void
 *   onFitWidth     – () => void
 */

import React from "react";

const BTN_BASE = {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "5px 10px",
    borderRadius: 7,
    border: "1px solid transparent",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 12,
    fontWeight: 500,
    letterSpacing: "0.01em",
    transition: "background 0.15s, color 0.15s, border-color 0.15s",
    whiteSpace: "nowrap",
    userSelect: "none",
};

const BTN_ACTIVE = {
    background: "rgba(184,150,106,0.18)",
    color: "#c8a870",
    borderColor: "rgba(184,150,106,0.35)",
};

const BTN_IDLE = {
    background: "rgba(255,255,255,0.06)",
    color: "#9a8a72",
    borderColor: "rgba(255,255,255,0.08)",
};

const BTN_HOVER = {
    background: "rgba(255,255,255,0.1)",
    color: "#c8b898",
    borderColor: "rgba(255,255,255,0.14)",
};

const FitButton = ({ label, icon, active, onClick }) => {
    const [hovered, setHovered] = React.useState(false);
    const style = active ? BTN_ACTIVE : hovered ? BTN_HOVER : BTN_IDLE;

    return (
        <button
            style={{ ...BTN_BASE, ...style }}
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            title={label}
        >
            <span style={{ fontSize: 13, lineHeight: 1 }}>{icon}</span>
            <span>{label}</span>
        </button>
    );
};

const FitControls = ({ fitMode, onFitPage, onFitWidth }) => {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <FitButton
                label="Fit Page"
                icon="⊡"
                active={fitMode === "page"}
                onClick={onFitPage}
            />
            <FitButton
                label="Fit Width"
                icon="↔"
                active={fitMode === "width"}
                onClick={onFitWidth}
            />
        </div>
    );
};

export default FitControls;