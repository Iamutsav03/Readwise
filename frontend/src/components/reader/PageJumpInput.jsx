/**
 * PageJumpInput.jsx
 * ─────────────────
 * Inline page number input that sits between the prev/next arrows.
 * The user sees: ‹  [12]  /  120  ›
 *
 * Props:
 *   pageNumber  – number  (current page, controlled)
 *   numPages    – number  (total pages)
 *   onChange    – (newPage: number) => void
 */

import React, { useState, useEffect, useRef } from "react";

const PageJumpInput = ({ pageNumber, numPages, onChange }) => {
    // Local draft — what the user is currently typing
    const [draft, setDraft] = useState(String(pageNumber));
    const [focused, setFocused] = useState(false);
    const inputRef = useRef(null);

    // Keep draft in sync when page changes externally (arrow keys, restore)
    useEffect(() => {
        if (!focused) setDraft(String(pageNumber));
    }, [pageNumber, focused]);

    const commit = () => {
        const parsed = parseInt(draft, 10);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= numPages) {
            onChange(parsed);
        } else {
            // Reset to current if invalid
            setDraft(String(pageNumber));
        }
        setFocused(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") { inputRef.current?.blur(); }
        if (e.key === "Escape") { setDraft(String(pageNumber)); inputRef.current?.blur(); }
        // Allow only digits and control keys
        if (!/^\d$/.test(e.key) && !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)) {
            e.preventDefault();
        }
        // Prevent arrow key from propagating to ReaderLayout page-turn handler
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") e.stopPropagation();
    };

    // Width scales with digit count so it never looks cramped or overflowing
    const inputWidth = Math.max(28, String(numPages).length * 10 + 14);

    return (
        <div
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                color: "#9a8a72",
                letterSpacing: "0.01em",
                userSelect: "none",
            }}
        >
            <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onFocus={(e) => { setFocused(true); e.target.select(); }}
                onBlur={commit}
                onKeyDown={handleKeyDown}
                style={{
                    width: inputWidth,
                    padding: "3px 5px",
                    borderRadius: 6,
                    border: focused
                        ? "1px solid rgba(184,150,106,0.5)"
                        : "1px solid var(--rw-border-strong)",
                    background: focused
                        ? "rgba(184,150,106,0.1)"
                        : "rgba(255,255,255,0.07)",
                    color: focused ? "var(--rw-text-primary)" : "var(--rw-text-secondary)",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13,
                    fontWeight: 500,
                    textAlign: "center",
                    outline: "none",
                    transition: "border-color 0.15s, background 0.15s, color 0.15s",
                    cursor: "text",
                }}
            />
            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>/</span>
            <span style={{ color: "var(--rw-text-secondary)", fontWeight: 400 }}>{numPages}</span>
        </div>
    );
};

export default PageJumpInput;