// src/components/BookmarkItem.jsx
// Renders a single bookmark item in the sidebar list.

import React, { useState } from "react";

const BookmarkItem = ({ bookmark, isActive, onJump, onDelete }) => {
  const [hovered, setHovered] = useState(false);
  const [deleteHovered, setDeleteHovered] = useState(false);
  const { pageNumber, createdAt } = bookmark;

  // Formats creation date beautifully for user reference
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 12px",
        borderRadius: 8,
        background: isActive
          ? "rgba(184, 150, 106, 0.13)"
          : hovered
          ? "rgba(255, 255, 255, 0.05)"
          : "transparent",
        borderLeft: `2px solid ${isActive ? "#b8966a" : "transparent"}`,
        transition: "background 0.15s, border-color 0.15s",
        marginBottom: 4,
        boxSizing: "border-box",
        minWidth: 0,
      }}
    >
      {/* Jump to page trigger */}
      <div
        onClick={() => onJump(pageNumber)}
        style={{
          flex: 1,
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          gap: 4,
          minWidth: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#c8a870", fontSize: 13, userSelect: "none" }}>🔖</span>
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              fontWeight: 600,
              color: isActive ? "#c8a870" : "#e8d8b8",
              letterSpacing: "0.01em",
            }}
          >
            Page {pageNumber}
          </span>
        </div>
        {createdAt && (
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 10,
              color: "#7a6a58",
              paddingLeft: 20,
            }}
          >
            {formatDate(createdAt)}
          </span>
        )}
      </div>

      {/* Remove bookmark trigger */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(pageNumber);
        }}
        onMouseEnter={() => setDeleteHovered(true)}
        onMouseLeave={() => setDeleteHovered(false)}
        title="Remove bookmark"
        style={{
          background: "none",
          border: "none",
          color: deleteHovered ? "#e07060" : "#7a6a58",
          cursor: "pointer",
          fontSize: 14,
          padding: "6px 8px",
          borderRadius: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "color 0.15s, background-color 0.15s",
          backgroundColor: deleteHovered ? "rgba(224, 112, 96, 0.1)" : "transparent",
        }}
      >
        ✕
      </button>
    </div>
  );
};

export default BookmarkItem;
