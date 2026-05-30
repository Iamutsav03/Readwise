/**
 * SearchResultItem.jsx
 * ────────────────────
 * Renders one search result: page badge, match count, and snippet.
 * Calls onJump(pageNumber) when clicked.
 *
 * Props:
 *   result      – { pageNumber, matchCount, snippet }
 *   isActive    – boolean  (currently viewed page matches this result)
 *   onJump      – (pageNumber: number) => void
 */

import React, { useState } from "react";

const SearchResultItem = ({ result, isActive, onJump }) => {
    const [hovered, setHovered] = useState(false);
    const { pageNumber, matchCount, snippet } = result;

    // Bold the query matches inside snippet — the API returns plain text,
    // so we highlight any content wrapped in ** if the backend uses that
    // convention, otherwise we render as-is.
    const renderSnippet = (text) => {
        if (!text) return null;
        // Support **bold** convention from backend snippets.
        const parts = text.split(/(\*\*[^*]+\*\*)/g);
        return parts.map((part, i) =>
            part.startsWith("**") && part.endsWith("**") ? (
                <strong
                    key={i}
                    style={{ color: "#c8a870", fontWeight: 600, background: "rgba(184,150,106,0.12)", borderRadius: 2, padding: "0 1px" }}
                >
                    {part.slice(2, -2)}
                </strong>
            ) : (
                <span key={i}>{part}</span>
            )
        );
    };

    return (
        <button
            onClick={() => onJump(pageNumber)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "10px 12px",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                background: isActive
                    ? "rgba(184,150,106,0.13)"
                    : hovered
                        ? "rgba(255,255,255,0.05)"
                        : "transparent",
                borderLeft: `2px solid ${isActive ? "#b8966a" : "transparent"}`,
                transition: "background 0.15s, border-color 0.15s",
                marginBottom: 2,
                // Prevent layout from expanding the panel.
                minWidth: 0,
                boxSizing: "border-box",
            }}
        >
            {/* Header row — page + match count */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 5,
                    gap: 6,
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {/* Page badge */}
                    <span
                        style={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: 10.5,
                            fontWeight: 600,
                            color: isActive ? "#c8a870" : "#9a8a72",
                            background: isActive
                                ? "rgba(184,150,106,0.18)"
                                : "rgba(255,255,255,0.06)",
                            border: `1px solid ${isActive ? "rgba(184,150,106,0.35)" : "rgba(255,255,255,0.08)"}`,
                            borderRadius: 5,
                            padding: "2px 7px",
                            letterSpacing: "0.03em",
                            transition: "all 0.15s",
                            whiteSpace: "nowrap",
                        }}
                    >
                        Page {pageNumber}
                    </span>
                </div>

                {/* Match count pill */}
                <span
                    style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 10,
                        color: "#6a5a48",
                        letterSpacing: "0.02em",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                    }}
                >
                    {matchCount} {matchCount === 1 ? "match" : "matches"}
                </span>
            </div>

            {/* Snippet */}
            <p
                style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 12,
                    color: hovered || isActive ? "#c8b898" : "#7a6a58",
                    lineHeight: 1.6,
                    margin: 0,
                    // Clamp to 3 lines so long snippets don't dominate.
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    fontWeight: 300,
                    transition: "color 0.15s",
                }}
            >
                {renderSnippet(snippet)}
            </p>
        </button>
    );
};

export default SearchResultItem;