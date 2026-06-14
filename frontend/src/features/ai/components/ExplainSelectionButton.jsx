import React from "react";
import { Sparkles } from "lucide-react";

export default function ExplainSelectionButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      title="Explain with AI"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "4px",
        background: "linear-gradient(135deg, var(--rw-hover-bg), var(--rw-border))",
        border: "1px solid var(--rw-border)",
        borderRadius: "4px",
        padding: "4px 8px",
        color: "var(--rw-accent)",
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "12px",
        fontWeight: 600,
        cursor: "pointer",
        transition: "background 0.2s, transform 0.1s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--rw-border)";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "linear-gradient(135deg, var(--rw-hover-bg), var(--rw-border))";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <span style={{ display: "flex", alignItems: "center" }}><Sparkles size={14} /></span> Explain
    </button>
  );
}
