// features/ai/components/StudyToolsSection.jsx
// Collapsible section that houses the 4 study tool buttons.
// Auto-collapses after first AI interaction. Can be manually re-expanded.

import React, { useState } from "react";
import { ClipboardList, Lightbulb, Target, Layers, Sparkles, ChevronUp, ChevronDown } from "lucide-react";

// Tool registry — extend this to add future tools (Practice Test, Mind Map, etc.)
const STUDY_TOOLS = [
  {
    id: "summary",
    icon: <ClipboardList size={16} />,
    label: "Summarize",
    description: "Key points & revision notes",
    accent: "var(--rw-accent)",
    accentBg: "var(--rw-accent-muted)",
    accentBorder: "var(--rw-border-strong)",
  },
  {
    id: "concepts",
    icon: <Lightbulb size={16} />,
    label: "Key Concepts",
    description: "Important ideas explained",
    accent: "var(--rw-accent)",
    accentBg: "var(--rw-accent-muted)",
    accentBorder: "var(--rw-border-strong)",
  },
  {
    id: "interview",
    icon: <Target size={16} />,
    label: "Interview Questions",
    description: "Q&A for exam prep",
    accent: "var(--rw-accent)",
    accentBg: "var(--rw-accent-muted)",
    accentBorder: "var(--rw-border-strong)",
  },
  {
    id: "flashcards",
    icon: <Layers size={16} />,
    label: "Flashcards",
    description: "Quick revision cards",
    accent: "var(--rw-accent)",
    accentBg: "var(--rw-accent-muted)",
    accentBorder: "var(--rw-border-strong)",
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
        borderTop: "1px solid var(--rw-hover-bg)",
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
          color: "var(--rw-accent)",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 10,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.color = "var(--rw-accent-hover)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.color = "var(--rw-accent)")
        }
      >
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ display: "flex", alignItems: "center" }}><Sparkles size={14} /></span> Study Tools
        </span>
        <span
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
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
                  background: isActive ? tool.accentBg : "var(--rw-card-bg)",
                  border: `1px solid ${isActive ? tool.accentBorder : "var(--rw-border)"}`,  
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
                    e.currentTarget.style.background = "var(--rw-card-bg)";
                    e.currentTarget.style.borderColor = "var(--rw-border)";
                  }
                }}
              >
                <span style={{ display: "flex", alignItems: "center", marginBottom: 2 }}>
                  {tool.icon}
                </span>
                <span
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 11,
                    fontWeight: 600,
                    color: isActive ? tool.accent : "var(--rw-text-primary)",
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
                    color: "var(--rw-text-muted)",
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
