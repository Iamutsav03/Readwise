import React, { useState, useEffect, useRef } from "react";
import { NOTE_COLORS } from "../utils/noteHelpers";
import { Edit2 } from "lucide-react";

export default function NoteMarker({
  note,
  isActive,
  isHovered,
  onClick,
  onHoverChange,
  onUpdateNote,
}) {
  const [localHover, setLocalHover] = useState(false);
  // Draggable position state — used for coordinate-based (page) notes
  const [dragPos, setDragPos] = useState({ x: note.x || 10, y: note.y || 10 });
  const [isDraggingState, setIsDraggingState] = useState(false);
  const isDraggingRef = useRef(false);
  const didMoveRef = useRef(false);
  const finalPosRef = useRef({ x: note.x || 10, y: note.y || 10 });
  const colors = NOTE_COLORS[note.color] || NOTE_COLORS.yellow;

  // Text-anchored note: created from a text selection in Reading Mode.
  // These notes don't have meaningful PDF coordinates.
  // Render as a small non-draggable badge anchored to top-right of the page overlay.
  const hasTextAnchor = (note.startOffset != null || note.textQuote) && note.x === 0 && note.y === 0;

  if (hasTextAnchor) {
    return (
      <div
        onClick={() => onClick(note._id)}
        onMouseEnter={() => { setLocalHover(true); if (onHoverChange) onHoverChange(note._id, true); }}
        onMouseLeave={() => { setLocalHover(false); if (onHoverChange) onHoverChange(note._id, false); }}
        title={note.textQuote ? `Note on: "${note.textQuote.slice(0, 40)}…"` : "Note"}
        style={{
          position: "absolute",
          top: "6px",
          right: "6px",
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: colors.accent,
          border: `2px solid var(--rw-text-primary)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 60,
          boxShadow: (isActive || localHover)
            ? `0 0 0 3px ${colors.accent}, 0 4px 12px rgba(0,0,0,0.2)`
            : "0 2px 6px rgba(0,0,0,0.15)",
          transition: "box-shadow 0.15s",
        }}
      >
        <Edit2 size={10} style={{ color: "var(--rw-text-primary)", transform: "none" }} />
      </div>
    );
  }
  // Sync display position when the note prop changes (e.g. after save confirmation)
  useEffect(() => {
    if (!isDraggingRef.current) {
      setDragPos({ x: note.x, y: note.y });
      finalPosRef.current = { x: note.x, y: note.y };
    }
  }, [note.x, note.y]);

  const handleMouseEnter = () => {
    setLocalHover(true);
    if (onHoverChange) onHoverChange(note._id, true);
  };

  const handleMouseLeave = () => {
    setLocalHover(false);
    if (onHoverChange) onHoverChange(note._id, false);
  };

  const handlePointerDown = (startEvent) => {
    // Only left-button mouse or touch
    if (startEvent.type === "mousedown" && startEvent.button !== 0) return;

    startEvent.preventDefault();
    startEvent.stopPropagation();

    isDraggingRef.current = false; // will become true only after first movement
    didMoveRef.current = false;

    // The marker lives inside the notes-overlay div (top:0 left:0 right:0 bottom:0),
    // which has the exact same bounding rect as the PDF page beneath it.
    // We can't use closest(".react-pdf__Page") because the marker is no longer
    // a descendant of the Page — it's in a sibling overlay div.
    const markerEl = startEvent.currentTarget;
    const pageEl = markerEl.parentElement; // the overlay container = same size as page
    if (!pageEl) return;

    const onMove = (moveEvent) => {
      const clientX = moveEvent.touches
        ? moveEvent.touches[0].clientX
        : moveEvent.clientX;
      const clientY = moveEvent.touches
        ? moveEvent.touches[0].clientY
        : moveEvent.clientY;

      const rect = pageEl.getBoundingClientRect();
      let pctX = ((clientX - rect.left) / rect.width) * 100;
      let pctY = ((clientY - rect.top) / rect.height) * 100;

      // Clamp inside page boundaries
      pctX = Math.max(1, Math.min(99, pctX));
      pctY = Math.max(1, Math.min(99, pctY));

      const newPos = {
        x: parseFloat(pctX.toFixed(2)),
        y: parseFloat(pctY.toFixed(2)),
      };

      if (!isDraggingRef.current) {
        isDraggingRef.current = true;
        setIsDraggingState(true);    // trigger re-render for visual update
      }
      didMoveRef.current = true;
      finalPosRef.current = newPos;  // always store the latest position in the ref
      setDragPos(newPos);            // update visual display
    };

    const onEnd = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);

      if (didMoveRef.current && onUpdateNote) {
        // Use the ref value — guaranteed to be the final drag position
        onUpdateNote(note._id, {
          x: finalPosRef.current.x,
          y: finalPosRef.current.y,
        });
      }

      // Small delay before clearing isDragging so the click handler can check it
      setTimeout(() => {
        isDraggingRef.current = false;
        setIsDraggingState(false);   // trigger re-render to restore normal visual state
      }, 50);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);
  };

  const handleClick = (e) => {
    e.stopPropagation();
    // Ignore click if this was actually a drag
    if (didMoveRef.current) {
      didMoveRef.current = false;
      return;
    }
    onClick(note._id);
  };

  const showHighlight = isHovered || localHover || isActive || isDraggingState;

  return (
    <div
      onMouseDown={handlePointerDown}
      onTouchStart={handlePointerDown}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        position: "absolute",
        left: `${dragPos.x}%`,
        top: `${dragPos.y}%`,
        transform: "translate(-50%, -50%)",
        zIndex: isDraggingState ? 200 : showHighlight ? 100 : 50,
        cursor: isDraggingState ? "grabbing" : "grab",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "auto",
        // Disable CSS transition while dragging so marker follows pointer exactly
        transition: isDraggingState
          ? "none"
          : "left 0.12s ease-out, top 0.12s ease-out",
        userSelect: "none",
        touchAction: "none",
      }}
    >
      {/* Comment-bubble pin */}
      <div
        style={{
          width: showHighlight ? 28 : 22,
          height: showHighlight ? 28 : 22,
          borderRadius: "50% 50% 50% 0",
          transform: "rotate(-45deg)",
          background: colors.accent,
          border: showHighlight ? "2px solid var(--rw-text-primary)" : "1.5px solid var(--rw-text-primary)",
          boxShadow: showHighlight
            ? `0 4px 12px var(--rw-hover-bg), 0 0 0 2px ${colors.accent}`
            : "0 2px 6px var(--rw-hover-bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "width 0.15s, height 0.15s, box-shadow 0.15s",
        }}
      >
        <span
          style={{
            transform: "rotate(45deg)",
            display: "flex",
            alignItems: "center",
            color: "var(--rw-text-primary)",
            fontWeight: "bold",
            lineHeight: 1,
            userSelect: "none",
          }}
        >
          <Edit2 size={showHighlight ? 12 : 9} />
        </span>
      </div>

      {/* Pulsing ring */}
      {showHighlight && (
        <div
          style={{
            position: "absolute",
            width: 38,
            height: 38,
            borderRadius: "50%",
            border: `1.5px solid ${colors.accent}`,
            animation: "marker-pulse 1.5s infinite ease-in-out",
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
}
