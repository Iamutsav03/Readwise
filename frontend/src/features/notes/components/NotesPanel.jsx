import React, { useState, useMemo } from "react";
import NoteCard from "./NoteCard";
import { stripHtml } from "../utils/noteHelpers";
import { Search, X, AlertTriangle, Edit2 } from "lucide-react";

export default function NotesPanel({
  notes,
  createNote,
  updateNote,
  deleteNote,
  loading,
  error,
  pageNumber,
  onJump,
  activeNoteId,
  onSetActiveNote,
  hoveredNoteId,
  onHoverNoteChange,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [draggedNoteId, setDraggedNoteId] = useState(null);

  // Group and filter notes
  const filteredAndGroupedNotes = useMemo(() => {
    // 1. Filter by search query if any
    const query = searchQuery.trim().toLowerCase();
    const filtered = notes.filter((note) => {
      if (!query) return true;
      const plainText = stripHtml(note.content).toLowerCase();
      const pageStr = `page ${note.pageNumber}`;
      return plainText.includes(query) || pageStr.includes(query);
    });

    // 2. Group by page number
    const groups = {};
    filtered.forEach((note) => {
      const page = note.pageNumber;
      if (!groups[page]) {
        groups[page] = [];
      }
      groups[page].push(note);
    });

    // 3. Return sorted pages keys
    return Object.keys(groups)
      .map(Number)
      .sort((a, b) => a - b)
      .map((page) => ({
        page,
        notesList: groups[page].sort((a, b) => (a.y || 0) - (b.y || 0)),
      }));
  }, [notes, searchQuery]);

  const handleCreateNote = async () => {
    try {
      const newNote = await createNote(pageNumber);
      if (newNote) {
        onSetActiveNote(newNote._id);
      }
    } catch (err) {
      console.error("Failed to create note:", err);
    }
  };

  // Drag and drop reordering handlers
  const handleDragStart = (e, noteId) => {
    setDraggedNoteId(noteId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", noteId);
  };

  const handleDragOver = (e, targetNoteId) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetNoteId) => {
    e.preventDefault();
    if (!draggedNoteId || draggedNoteId === targetNoteId) return;

    const draggedNote = notes.find((n) => n._id === draggedNoteId);
    const targetNote = notes.find((n) => n._id === targetNoteId);

    if (!draggedNote || !targetNote) return;

    const targetPage = targetNote.pageNumber;
    const pageNotes = notes
      .filter((n) => n.pageNumber === targetPage)
      .sort((a, b) => (a.y || 0) - (b.y || 0));

    const draggedIdx = pageNotes.findIndex((n) => n._id === draggedNoteId);
    let targetIdx = pageNotes.findIndex((n) => n._id === targetNoteId);

    const reorderedNotes = [...pageNotes];
    if (draggedIdx !== -1) {
      reorderedNotes.splice(draggedIdx, 1);
    }
    targetIdx = reorderedNotes.findIndex((n) => n._id === targetNoteId);
    reorderedNotes.splice(targetIdx + 1, 0, draggedNote);

    for (let i = 0; i < reorderedNotes.length; i++) {
      const noteToUpdate = reorderedNotes[i];
      const newY = 10 + i * 15; 
      const updateFields = {
        y: newY,
      };
      if (noteToUpdate.pageNumber !== targetPage) {
        updateFields.pageNumber = targetPage;
      }
      
      updateNote(noteToUpdate._id, updateFields);
    }

    setDraggedNoteId(null);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "var(--rw-panel-bg)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Title Header */}
      <div
        style={{
          padding: "20px 16px 12px 16px",
          borderBottom: "1px solid var(--rw-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "14px",
            fontWeight: 500,
            color: "var(--rw-text-primary)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Notes
        </h3>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 500,
            color: "var(--rw-text-secondary)",
            background: "var(--rw-border)",
            padding: "2px 6px",
            borderRadius: "4px",
          }}
        >
          {notes.length} {notes.length === 1 ? "note" : "notes"}
        </span>
      </div>

      {/* Toolbar / Search & Add */}
      <div
        style={{
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          background: "transparent",
          flexShrink: 0,
        }}
      >
        <button
          onClick={handleCreateNote}
          style={{
            width: "100%",
            padding: "10px 12px",
            background: "var(--rw-accent)",
            color: "var(--rw-accent-text)",
            border: "none",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            transition: "background 0.2s, transform 0.1s",
            boxShadow: "0 2px 8px var(--rw-hover-bg)",
            textTransform: "uppercase",
            letterSpacing: "0.03em",
          }}
          onMouseEnter={(e) => (e.target.style.background = "var(--rw-accent-hover)")}
          onMouseLeave={(e) => (e.target.style.background = "var(--rw-accent)")}
        >
          <span style={{ fontSize: "14px", fontWeight: "bold" }}>+</span> New Note on Page {pageNumber}
        </button>

        {/* Search Input for Search-Ready Architecture */}
        <div style={{ position: "relative" }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes..."
            style={{
              width: "100%",
              padding: "8px 12px 8px 30px",
              fontSize: "12px",
              background: "var(--rw-border)",
              border: "1px solid var(--rw-border)",
              borderRadius: "6px",
              color: "var(--rw-text-primary)",
              outline: "none",
              boxSizing: "border-box",
              transition: "border 0.2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--rw-accent)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--rw-border)")}
          />
          <span
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "13px",
              color: "var(--rw-text-secondary)",
              pointerEvents: "none",
            }}
          >
            <Search size={14} />
          </span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                fontSize: "10px",
                color: "var(--rw-text-secondary)",
                cursor: "pointer",
              }}
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div
          style={{
            margin: "0 16px 12px 16px",
            padding: "10px",
            borderRadius: "6px",
            background: "var(--rw-accent-muted)",
            border: "1px solid var(--rw-border-strong)",
            color: "var(--rw-danger)",
            fontSize: "12px",
            flexShrink: 0,
          }}
        >
          <AlertTriangle size={14} style={{ marginRight: 6 }} /> {error}
        </div>
      )}

      {/* Notes List Scroll Area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "0 16px 16px 16px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
        className="custom-scrollbar"
      >
        {loading && notes.length === 0 ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "40px 0",
              color: "var(--rw-text-secondary)",
              fontSize: "13px",
            }}
          >
            Loading notes...
          </div>
        ) : filteredAndGroupedNotes.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "60px 16px",
              textAlign: "center",
              color: "var(--rw-text-muted)",
            }}
          >
            <span style={{ marginBottom: "8px", color: "var(--rw-accent)" }}><Edit2 size={24} /></span>
            <p style={{ margin: 0, fontSize: "13px", fontWeight: 300, color: "var(--rw-text-secondary)" }}>
              {searchQuery ? "No matching notes found" : "No notes saved yet"}
            </p>
            <p style={{ margin: "4px 0 0 0", fontSize: "11px", opacity: 0.6 }}>
              {searchQuery ? "Try a different query" : "Click '+ New Note' to start annotating this PDF"}
            </p>
          </div>
        ) : (
          filteredAndGroupedNotes.map(({ page, notesList }) => (
            <div key={page} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {/* Page Section Title */}
              <div
                style={{
                  fontSize: "10.5px",
                  fontWeight: 600,
                  color: "var(--rw-text-secondary)",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  borderBottom: "1px solid var(--rw-border)",
                  paddingBottom: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>Page {page}</span>
                <span style={{ opacity: 0.6 }}>{notesList.length}</span>
              </div>

              {/* Note Cards List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {notesList.map((note) => (
                  <NoteCard
                    key={note._id}
                    note={note}
                    activeNoteId={activeNoteId}
                    onSetActive={onSetActiveNote}
                    onUpdate={updateNote}
                    onDelete={deleteNote}
                    onJump={onJump}
                    isHovered={hoveredNoteId === note._id}
                    onHoverChange={onHoverNoteChange}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
