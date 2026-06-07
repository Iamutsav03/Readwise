import React from "react";

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
          ? "linear-gradient(135deg, #2a1e3a, #342443)"
          : "linear-gradient(135deg, #1e2d3a, #243342)",
        border: isQuickExplain
          ? "1px solid rgba(180,130,220,0.35)"
          : "1px solid rgba(100,170,220,0.3)",
        borderRadius: "4px",
        padding: "4px 8px",
        color: isQuickExplain ? "#c49de0" : "#7bbde0",
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
      <span style={{ fontSize: "14px" }}>{isQuickExplain ? "⚡" : "📖"}</span>{" "}
      {label}
    </button>
  );
}
