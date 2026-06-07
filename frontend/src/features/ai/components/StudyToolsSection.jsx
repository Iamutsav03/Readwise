// features/ai/components/StudyToolsSection.jsx
// Collapsible section that houses the 4 study tool buttons.
// Auto-collapses after first AI interaction. Can be manually re-expanded.

import React, { useState } from "react";

// Tool registry — extend this to add future tools (Practice Test, Mind Map, etc.)
const STUDY_TOOLS = [
  {
    id: "summary",
    icon: "📋",
    label: "Summarize",
    description: "Key points & revision notes",
    accent: "#5a8fd4",
    accentBg: "rgba(90,143,212,0.08)",
    accentBorder: "rgba(90,143,212,0.2)",
  },
  {
    id: "concepts",
    icon: "💡",
    label: "Key Concepts",
    description: "Important ideas explained",
    accent: "#c8a46a",
    accentBg: "rgba(200,164,106,0.08)",
    accentBorder: "rgba(200,164,106,0.2)",
  },
  {
    id: "interview",
    icon: "🎯",
    label: "Interview Questions",
    description: "Q&A for exam prep",
    accent: "#7ac9a0",
    accentBg: "rgba(122,201,160,0.08)",
    accentBorder: "rgba(122,201,160,0.2)",
  },
  {
    id: "flashcards",
    icon: "🃏",
    label: "Flashcards",
    description: "Quick revision cards",
    accent: "#c49de0",
    accentBg: "rgba(196,157,224,0.08)",
    accentBorder: "rgba(196,157,224,0.2)",
  },
];

export default function StudyToolsSection({
  hasMessages,
  onSelectTool,
  activeTool,
  disabled,
}) {
  // Expanded when there are no messages yet; collapses after first interaction
  const [expanded, setExpanded] = useState(true);

  // When messages arrive, collapse automatically (only on first collapse)
  const wasCollapsed = hasMessages && expanded === true && expanded !== "user-toggled";

  return (
    <div
      style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        flexShrink: 0,
      }}
    >
      {/* Section header / toggle */}
      <button
        onClick={() => setExpanded((v) => !v)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 12px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "rgba(200,164,106,0.8)",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 10,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.color = "rgba(200,164,106,1)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.color = "rgba(200,164,106,0.8)")
        }
      >
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontSize: 11 }}>✨</span> Study Tools
        </span>
        <span
          style={{
            fontSize: 9,
            transition: "transform 0.2s",
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            display: "inline-block",
          }}
        >
          ▲
        </span>
      </button>

      {/* Expandable tool grid */}
      {expanded && (
        <div
          style={{
            padding: "0 10px 10px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 6,
          }}
        >
          {STUDY_TOOLS.map((tool) => {
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                disabled={disabled}
                onClick={() => onSelectTool(isActive ? null : tool.id)}
                style={{
                  background: isActive ? tool.accentBg : "#1e1a17",
                  border: `1px solid ${isActive ? tool.accent : "rgba(255,255,255,0.07)"}`,
                  borderRadius: 8,
                  padding: "8px 10px",
                  cursor: disabled ? "not-allowed" : "pointer",
                  textAlign: "left",
                  opacity: disabled ? 0.5 : 1,
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (!disabled && !isActive) {
                    e.currentTarget.style.background = tool.accentBg;
                    e.currentTarget.style.borderColor = tool.accentBorder;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!disabled && !isActive) {
                    e.currentTarget.style.background = "#1e1a17";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                  }
                }}
              >
                <span style={{ fontSize: 14, display: "block", marginBottom: 2 }}>
                  {tool.icon}
                </span>
                <span
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 11,
                    fontWeight: 600,
                    color: isActive ? tool.accent : "#F5EEE4",
                    display: "block",
                    lineHeight: 1.3,
                    marginBottom: 2,
                  }}
                >
                  {tool.label}
                </span>
                <span
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 9.5,
                    color: "rgba(245,238,228,0.4)",
                    display: "block",
                    lineHeight: 1.3,
                  }}
                >
                  {tool.description}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
