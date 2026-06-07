import React from "react";

export default function ExplainSelectionButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      title="Explain with AI"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "4px",
        background: "linear-gradient(135deg, #2a221d, #3a2e24)",
        border: "1px solid rgba(200,164,106,0.3)",
        borderRadius: "4px",
        padding: "4px 8px",
        color: "#C8A46A",
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "12px",
        fontWeight: 600,
        cursor: "pointer",
        transition: "background 0.2s, transform 0.1s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#3a2e24";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "linear-gradient(135deg, #2a221d, #3a2e24)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <span style={{ fontSize: "14px" }}>◈</span> Explain
    </button>
  );
}
