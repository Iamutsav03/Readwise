import React from "react";
import { Zap, BookOpen } from "lucide-react";

export default function MeaningButton({ onClick, label = "Meaning" }) {
  const isQuickExplain = label !== "Meaning";
  return (
    <button
      onClick={onClick}
      title={isQuickExplain ? "Quick AI explanation" : "Look up meaning"}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "4px",
        background: isQuickExplain
          ? "linear-gradient(135deg, var(--rw-hover-bg), var(--rw-card-bg))"
          : "linear-gradient(135deg, var(--rw-card-bg), var(--rw-hover-bg))",
        border: "1px solid var(--rw-border)",
        borderRadius: "4px",
        padding: "4px 8px",
        color: "var(--rw-text-primary)",
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "12px",
        fontWeight: 600,
        cursor: "pointer",
        transition: "background 0.2s, transform 0.1s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <span style={{ display: "flex", alignItems: "center" }}>{isQuickExplain ? <Zap size={14} /> : <BookOpen size={14} />}</span>{" "}
      {label}
    </button>
  );
}
