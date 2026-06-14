import React, { useRef, useEffect, useState } from "react";
import NoteToolbar from "./NoteToolbar";
import { debounce } from "../utils/noteHelpers";

export default function NoteEditor({
  initialContent,
  initialTitle,
  noteId,
  color,
  onSave,
  onColorChange,
  focusOnMount,
}) {
  const editorRef = useRef(null);
  const titleInputRef = useRef(null);
  
  const [isFocused, setIsFocused] = useState(false);
  const [title, setTitle] = useState(initialTitle || "");
  const [showTitleInput, setShowTitleInput] = useState(!!initialTitle);
  
  const debouncedSaveRef = useRef(null);

  useEffect(() => {
    debouncedSaveRef.current = debounce((html, currentTitle) => {
      onSave(html, currentTitle);
    }, 600);
  }, [onSave]);

  // Reset editor state when noteId changes
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = initialContent || "";
    }
    setTitle(initialTitle || "");
    setShowTitleInput(!!initialTitle);
  }, [noteId, initialContent, initialTitle]);

  // Handle focus on mount if requested
  useEffect(() => {
    if (focusOnMount) {
      if (showTitleInput && titleInputRef.current) {
        titleInputRef.current.focus();
      } else if (editorRef.current) {
        editorRef.current.focus();
        const range = document.createRange();
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  }, [focusOnMount, noteId, showTitleInput]);

  const handleInput = () => {
    if (editorRef.current && debouncedSaveRef.current) {
      const htmlContent = editorRef.current.innerHTML;
      debouncedSaveRef.current(htmlContent, title);
    }
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (editorRef.current && debouncedSaveRef.current) {
      debouncedSaveRef.current(editorRef.current.innerHTML, newTitle);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (editorRef.current) {
      onSave(editorRef.current.innerHTML, title);
    }
  };

  const executeCommand = (command, value = null) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, value);
      handleInput(); // Trigger input save
    }
  };

  const handleAddHeadingClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowTitleInput(true);
    // Focus title input on next tick
    setTimeout(() => {
      titleInputRef.current?.focus();
    }, 50);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        border: isFocused ? "1px solid var(--rw-accent)" : "1px solid var(--rw-border)",
        borderRadius: 6,
        background: "var(--rw-panel-bg)",
        overflow: "hidden",
        boxShadow: isFocused ? "0 4px 16px var(--rw-hover-bg)" : "none",
        transition: "border-color 0.2s, box-shadow 0.2s",
        height: "100%",
        minHeight: 130,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <NoteToolbar
        currentColor={color}
        onColorChange={onColorChange}
        onBold={() => executeCommand("bold")}
        onItalic={() => executeCommand("italic")}
        onUnderline={() => executeCommand("underline")}
        onList={() => executeCommand("insertUnorderedList")}
      />

      {/* Title Input or 'Add Heading' button */}
      <div
        style={{
          padding: "6px 12px 0 12px",
          display: "flex",
          alignItems: "center",
          background: "transparent",
        }}
      >
        {showTitleInput ? (
          <input
            ref={titleInputRef}
            type="text"
            value={title}
            onChange={handleTitleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            placeholder="Heading (e.g. xyz topic)..."
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              borderBottom: "1px solid var(--rw-border)",
              color: "var(--rw-text-primary)",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "12.5px",
              fontWeight: 600,
              padding: "4px 0 6px 0",
              outline: "none",
              caretColor: "var(--rw-accent)",
            }}
          />
        ) : (
          <button
            onClick={handleAddHeadingClick}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--rw-accent)",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "11px",
              fontWeight: 500,
              padding: "4px 0",
              opacity: 0.8,
              transition: "opacity 0.15s",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.8")}
          >
            <span>+</span> Add Heading
          </button>
        )}
      </div>

      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
        className="note-content-editor"
        style={{
          flex: 1,
          padding: "8px 12px 12px 12px",
          outline: "none",
          fontSize: "13px",
          lineHeight: "1.6",
          color: "var(--rw-text-primary)",
          fontFamily: "'DM Sans', sans-serif",
          overflowY: "auto",
          minHeight: "80px",
          maxHeight: "100%",
          cursor: "text",
          caretColor: "var(--rw-accent)",
        }}
      />
    </div>
  );
}
