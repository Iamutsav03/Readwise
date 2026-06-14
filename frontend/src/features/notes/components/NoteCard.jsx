import React, { useState, useEffect, useRef } from "react";
import NoteEditor from "./NoteEditor";
import { NOTE_COLORS, stripHtml } from "../utils/noteHelpers";
import { GripVertical, X, ChevronDown, ChevronUp } from "lucide-react";

export default function NoteCard({
  note,
  activeNoteId,
  onSetActive,
  onUpdate,
  onDelete,
  onJump,
  isHovered,
  onHoverChange,
  onDragStart,
  onDragOver,
  onDrop,
}) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [pendingDelete, setPendingDelete] = useState(false);
  const cardRef = useRef(null);

  const colors = NOTE_COLORS[note.color] || NOTE_COLORS.yellow;
  const isEditing = activeNoteId === note._id;

  // Open note if activeNoteId changes to this note
  useEffect(() => {
    if (isEditing) {
      setIsCollapsed(false);
      // Smooth scroll note card into view
      setTimeout(() => {
        cardRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 100);
    }
  }, [isEditing]);

  const handleCardClick = (e) => {
    // Only set active if they didn't click form formatting buttons
    if (e.target.closest("button") || e.target.closest(".note-content-editor")) return;
    // Cancel pending delete if user clicks elsewhere on the card
    if (pendingDelete) { setPendingDelete(false); return; }
    onSetActive(note._id);
    setIsCollapsed(false);
  };

  const handleToggleCollapse = (e) => {
    e.stopPropagation();
    setIsCollapsed(!isCollapsed);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (pendingDelete) {
      // Second click — confirm deletion
      onDelete(note._id);
    } else {
      // First click — enter pending state
      setPendingDelete(true);
    }
  };

  const handleColorChange = (newColor) => {
    onUpdate(note._id, { color: newColor });
  };

  const handleContentSave = (newContent, newTitle) => {
    onUpdate(note._id, { content: newContent, title: newTitle });
  };

  const textPreview = stripHtml(note.content);
  const isCardHighlighted = isHovered || isEditing;

  return (
    <div
      ref={cardRef}
      draggable
      onDragStart={(e) => onDragStart(e, note._id)}
      onDragOver={(e) => onDragOver(e, note._id)}
      onDrop={(e) => onDrop(e, note._id)}
      onMouseEnter={() => onHoverChange(note._id, true)}
      onMouseLeave={() => onHoverChange(note._id, false)}
      onClick={handleCardClick}
      style={{
        display: "flex",
        flexDirection: "column",
        background: isCardHighlighted ? "var(--rw-hover-bg)" : "var(--rw-card-bg)",
        border: isEditing
          ? `1px solid ${colors.accent}`
          : isHovered
          ? `1px solid ${colors.borderHover}`
          : "1px solid var(--rw-hover-bg)",
        borderRadius: 8,
        padding: "12px",
        boxShadow: isEditing
          ? "0 4px 20px var(--rw-hover-bg)"
          : isHovered
          ? "0 2px 8px var(--rw-hover-bg)"
          : "none",
        transition: "border 0.2s, background 0.2s, box-shadow 0.2s",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        width: "100%", // Fit container width perfectly to prevent layout loops
        boxSizing: "border-box",
        gap: 8,
      }}
    >
      {/* Note Header / Drag handle area */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          userSelect: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {/* Drag Handle Icon */}
          <div
            title="Drag vertically to reorder"
            style={{
              cursor: "ns-resize",
              color: "#5a4d3d",
              fontSize: 12,
              padding: "0 2px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: isHovered ? 0.8 : 0.3,
              transition: "opacity 0.2s",
            }}
          >
            <GripVertical size={12} />
          </div>

          {/* Color Dot indicator */}
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: colors.accent,
              boxShadow: `0 0 4px ${colors.accent}`,
              flexShrink: 0,
            }}
          />

          <span
            onClick={(e) => {
              e.stopPropagation();
              onJump(note.pageNumber);
            }}
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11,
              fontWeight: 500,
              color: "var(--rw-text-primary)",
              background: "var(--rw-border)",
              padding: "2px 6px",
              borderRadius: 4,
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.background = "var(--rw-border-strong)")}
            onMouseLeave={(e) => (e.target.style.background = "var(--rw-border)")}
          >
            Page {note.pageNumber} {note.title ? `(${note.title})` : ""}
          </span>
        </div>

        {/* Actions bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {/* Delete Button — two-step inline confirmation */}
          {(isHovered || pendingDelete) && (
            <button
              onClick={handleDeleteClick}
              title={pendingDelete ? "Click again to confirm deletion" : "Delete Note"}
              style={{
                background: pendingDelete ? "var(--rw-accent-muted)" : "transparent",
                border: pendingDelete ? "1px solid var(--rw-border-strong)" : "none",
                cursor: "pointer",
                color: pendingDelete ? "var(--rw-danger)" : "var(--rw-text-muted)",
                transition: "color 0.15s, background 0.15s, border 0.15s",
                fontSize: pendingDelete ? 10 : 11,
                fontWeight: pendingDelete ? 600 : 400,
                padding: pendingDelete ? "3px 7px" : "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 4,
                letterSpacing: pendingDelete ? "0.03em" : 0,
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                if (!pendingDelete) {
                  e.currentTarget.style.color = "var(--rw-danger)";
                  e.currentTarget.style.background = "var(--rw-accent-muted)";
                }
              }}
              onMouseLeave={(e) => {
                if (!pendingDelete) {
                  e.currentTarget.style.color = "var(--rw-text-muted)";
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              {pendingDelete ? "Delete?" : <X size={12} />}
            </button>
          )}

          {/* Expand/Collapse Toggle */}
          <button
            onClick={handleToggleCollapse}
            title={isCollapsed ? "Expand Note" : "Collapse Note"}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--rw-text-secondary)",
              fontSize: 8,
              padding: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 4,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--rw-text-primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--rw-text-secondary)")}
          >
            {isCollapsed ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
          </button>
        </div>
      </div>

      {/* Note Body */}
      {isCollapsed ? (
        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "12.5px",
            lineHeight: "1.5",
            color: "var(--rw-text-muted)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            paddingLeft: 18,
            fontWeight: 300,
          }}
        >
          {textPreview.trim() || <i style={{ opacity: 0.5 }}>Empty Note (click to edit)</i>}
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            minHeight: 0,
            paddingLeft: 4,
          }}
        >
          {isEditing ? (
            <div style={{ height: "auto", minHeight: 120 }}>
              <NoteEditor
                noteId={note._id}
                initialContent={note.content}
                initialTitle={note.title}
                color={note.color}
                onSave={handleContentSave}
                onColorChange={handleColorChange}
                focusOnMount={note.content === "" && !note.title}
              />
            </div>
          ) : (
            <div
              className="note-html-preview"
              dangerouslySetInnerHTML={{
                __html: note.content || "<i style='opacity: 0.5;'>Empty note. Click to edit.</i>",
              }}
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "13px",
                lineHeight: "1.6",
                color: "var(--rw-text-primary)",
                padding: "10px",
                background: "var(--rw-card-bg)",
                borderRadius: 6,
                border: "1px solid var(--rw-border)",
                overflowY: "auto",
                maxHeight: "220px",
                minHeight: "60px",
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
