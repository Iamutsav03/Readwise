/**
 * ReadingProgress.jsx
 * ───────────────────
 * Two visual elements rendered as a single component:
 *
 * 1. A hairline progress bar pinned to the very top of the toolbar
 *    (position:absolute, top:0, left:0, right:0, height:2px).
 * 2. A small percentage badge inline with the other toolbar controls.
 *
 * The bar fills left-to-right in a warm gold tone matching the ReadWise palette.
 *
 * Props:
 *   progressPct – 0–100  number
 *   showBadge   – boolean (default true) — show the inline "73%" label
 */

import React from "react";

const ReadingProgress = ({ progressPct, showBadge = true }) => {
    const pct = Math.max(0, Math.min(100, progressPct));

    return (
        <>
            {/* ── Hairline bar ──────────────────────────────────────────── */}
            {/* Parent toolbar must have position:relative for this to anchor */}
            <div
                aria-hidden="true"
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 2,
                    background: "rgba(255,255,255,0.05)",
                    pointerEvents: "none",
                    zIndex: 10,
                }}
            >
                <div
                    style={{
                        height: "100%",
                        width: `${pct}%`,
                        background: "linear-gradient(90deg, #b8966a 0%, #d4b896 100%)",
                        transition: "width 0.35s cubic-bezier(0.4,0,0.2,1)",
                        borderRadius: "0 1px 1px 0",
                    }}
                />
            </div>

            {/* ── Inline badge ──────────────────────────────────────────── */}
            {showBadge && (
                <div
                    title={`Reading progress: ${pct}%`}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "4px 9px",
                        borderRadius: 7,
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        cursor: "default",
                        userSelect: "none",
                    }}
                >
                    {/* Mini arc indicator */}
                    <svg
                        width="14" height="14" viewBox="0 0 14 14"
                        style={{ flexShrink: 0 }}
                    >
                        <circle cx="7" cy="7" r="5.5" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                        <circle
                            cx="7" cy="7" r="5.5"
                            fill="none"
                            stroke="#b8966a"
                            strokeWidth="2"
                            strokeDasharray={`${2 * Math.PI * 5.5}`}
                            strokeDashoffset={`${2 * Math.PI * 5.5 * (1 - pct / 100)}`}
                            strokeLinecap="round"
                            transform="rotate(-90 7 7)"
                            style={{ transition: "stroke-dashoffset 0.35s cubic-bezier(0.4,0,0.2,1)" }}
                        />
                    </svg>
                    <span
                        style={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: 12,
                            fontWeight: 500,
                            color: pct === 100 ? "#c8a870" : "#9a8a72",
                            letterSpacing: "0.02em",
                            minWidth: 30,
                            textAlign: "right",
                        }}
                    >
                        {pct === 100 ? "✓" : `${pct}%`}
                    </span>
                </div>
            )}
        </>
    );
};

export default ReadingProgress;