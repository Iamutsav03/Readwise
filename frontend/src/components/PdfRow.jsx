import { useState, useRef, useEffect, useCallback } from "react";
import PdfThumbnail from "./PdfThumbnail";
import { loadPosition } from "../utils/readingStorage";
import { useBreakpoints } from "../hooks/useBreakpoints";
import { BookOpen, Star, Edit2, MoreHorizontal, Trash2 } from "lucide-react";

function timeAgo(dateStr) {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Opened just now";
  if (m < 60) return `Opened ${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Opened ${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return "Opened yesterday";
  if (d < 7) return `Opened ${d} days ago`;
  return `Opened ${Math.floor(d / 7)}w ago`;
}

const CSS = `
  .rwpr-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border-radius: 9px;
    cursor: pointer;
    transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
    position: relative;
    min-width: 0;
    width: 100%;
    user-select: none;
  }
  .rwpr-row:hover { 
    background: rgba(255,255,255,0.04); 
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  .rwpr-row.focused { background: rgba(255,255,255,0.07); }
  .rwpr-row.active { background: rgba(200,164,106,0.11); }
  .rwpr-row.active:hover { background: rgba(200,164,106,0.16); }

  .rwpr-text { flex: 1; min-width: 0; overflow: hidden; display: flex; flex-direction: column; justify-content: center; }

  .rwpr-title-group { display: flex; alignItems: center; gap: 6px; }

  .rwpr-name {
    font-size: 13px; font-weight: 500; color: var(--rw-text-primary);
    margin: 0;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    line-height: 1.3; transition: color 0.15s;
    font-family: 'DM Sans', sans-serif;
  }
  .rwpr-row.active .rwpr-name { color: var(--rw-accent); font-weight: 600; }

  .rwpr-meta {
    font-size: 11px; color: rgba(245,238,228,0.5); margin: 2px 0 0;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    font-family: 'DM Sans', sans-serif;
  }
  .rwpr-opened {
    font-size: 10.5px; color: rgba(245,238,228,0.3); margin: 1px 0 0;
    font-style: italic; font-family: 'DM Sans', sans-serif;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  /* Actions */
  .rwpr-actions {
    opacity: 0; pointer-events: none;
    display: flex; gap: 4px;
    transition: opacity 0.18s;
  }
  .rwpr-row:hover .rwpr-actions, .rwpr-row:focus-within .rwpr-actions, .rwpr-row.focused .rwpr-actions {
    opacity: 1; pointer-events: auto;
  }

  .rwpr-btn {
    width: 26px; height: 26px;
    border: none; border-radius: 6px; background: transparent;
    color: var(--rw-text-secondary); cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.15s, color 0.15s;
  }
  .rwpr-btn:hover { background: var(--rw-hover-bg); color: var(--rw-text-primary); }
  .rwpr-btn.star.active { color: var(--rw-accent); }

  .rwpr-rename-input {
    font-size: 13px; font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    color: var(--rw-panel-bg); background: var(--rw-text-primary);
    border: 1.5px solid var(--rw-accent); border-radius: 5px;
    padding: 2px 6px; width: 100%; outline: none;
    line-height: 1.4;
  }
`;

let styleInjected = false;
function injectStyle() {
  if (styleInjected) return;
  styleInjected = true;
  const tag = document.createElement("style");
  tag.textContent = CSS;
  document.head.appendChild(tag);
}

const PdfRow = ({ pdf, active, isFocused, onFocus, onSelect, onFavorite, onRename, onDelete }) => {
  injectStyle();
  const { isTablet } = useBreakpoints();

  const [renaming, setRenaming] = useState(false);
  const [renameVal, setRenameVal] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const inputRef = useRef(null);
  const pressTimer = useRef(null);
  const menuRef = useRef(null);
  const clickTimeoutRef = useRef(null);

  useEffect(() => {
    if (renaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [renaming]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const startRename = useCallback((e) => {
    if (e) e.stopPropagation();
    setRenameVal(pdf.originalName.replace(/\.pdf$/i, ""));
    setRenaming(true);
  }, [pdf.originalName]);

  const commitRename = useCallback(() => {
    const trimmed = renameVal.trim();
    if (trimmed && trimmed !== pdf.originalName.replace(/\.pdf$/i, "")) {
      const finalName = /\.pdf$/i.test(trimmed) ? trimmed : `${trimmed}.pdf`;
      onRename(pdf._id, finalName);
    }
    setRenaming(false);
  }, [renameVal, pdf, onRename]);

  const cancelRename = useCallback(() => {
    setRenaming(false);
    setRenameVal("");
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter") { e.preventDefault(); commitRename(); }
    if (e.key === "Escape") cancelRename();
  }, [commitRename, cancelRename]);

  // Touch / Mobile long press
  const handleTouchStart = () => {
    pressTimer.current = setTimeout(() => {
      setMenuOpen(true);
    }, 600);
  };
  const handleTouchEnd = () => clearTimeout(pressTimer.current);

  const displayName = pdf.originalName.replace(/\.pdf$/i, "");
  const opened = timeAgo(pdf.lastOpenedAt);
  const pos = loadPosition(pdf._id);
  const pageProgress = pos ? `Page ${pos.pageNumber}` : null;

  return (
    <li style={{ marginBottom: 2, listStyle: "none", position: "relative" }}>
      <div
        className={`rwpr-row${active ? " active" : ""}${isFocused ? " focused" : ""}`}
        onClick={(e) => {
          if (renaming) return;
          if (e.detail === 3) {
            // Cancel any pending double-click action
            if (clickTimeoutRef.current) {
              clearTimeout(clickTimeoutRef.current);
              clickTimeoutRef.current = null;
            }
            startRename(e);
          } else if (e.detail === 1 && onFocus) {
            onFocus();
          }
        }}
        onDoubleClick={(e) => {
          if (renaming) return;
          // Set a short delay to wait and see if a third click is coming
          clickTimeoutRef.current = setTimeout(() => {
            onSelect(pdf);
          }, 250); // 250ms delay should be enough to catch a triple-click
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchEnd}
      >
        <PdfThumbnail pdf={pdf} active={active} />

        {!isTablet && (
          <div className="rwpr-text">
            {renaming ? (
              <input
                ref={inputRef}
                className="rwpr-rename-input"
                value={renameVal}
                onChange={(e) => setRenameVal(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={commitRename}
                onClick={(e) => e.stopPropagation()}
                maxLength={120}
              />
            ) : (
              <p className="rwpr-name" title={displayName}>{displayName}</p>
            )}
            <p className="rwpr-meta">
              {pageProgress || "Not started"}
            </p>
            {opened && <p className="rwpr-opened">{opened}</p>}
          </div>
        )}

        {/* Action Menu (Desktop) */}
        {!isTablet && (
          <div className="rwpr-actions" onClick={e => e.stopPropagation()}>
            <button className="rwpr-btn" title="Open" onClick={() => onSelect(pdf)}>
              <BookOpen size={16} />
            </button>
            <button className="rwpr-btn" title="Rename" onClick={startRename}>
              <Edit2 size={16} />
            </button>
            <button className={`rwpr-btn star ${pdf.isFavorite ? "active" : ""}`} title={pdf.isFavorite ? "Remove Favorite" : "Favorite"} onClick={() => onFavorite(pdf._id)}>
              <Star size={16} fill={pdf.isFavorite ? "currentColor" : "none"} />
            </button>
            <div style={{ position: "relative" }} ref={menuRef}>
              <button className="rwpr-btn" title="More" onClick={() => setMenuOpen(!menuOpen)}>
                <MoreHorizontal size={16} />
              </button>
              {menuOpen && (
                <div style={{
                  position: "absolute", right: 0, top: "100%", marginTop: 4,
                  background: "var(--rw-card-bg)", border: "1px solid var(--rw-border)", borderRadius: 8,
                  boxShadow: "0 4px 14px rgba(0,0,0,0.5)", minWidth: 120, zIndex: 100, padding: 4,
                  fontFamily: "'DM Sans', sans-serif"
                }}>
                  <button
                    onClick={() => { onDelete(pdf._id); setMenuOpen(false); }}
                    style={{
                      width: "100%", textAlign: "left", padding: "7px 10px", 
                      background: "transparent", border: "none", borderRadius: 5, cursor: "pointer",
                      fontSize: 12.5, color: "var(--rw-danger)", transition: "background 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--rw-danger-bg, rgba(224,112,96,0.1))"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Actions Sheet Fallback */}
      {isTablet && menuOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end",
        }} onClick={() => setMenuOpen(false)}>
          <div style={{
            background: "var(--rw-card-bg)", width: "100%", padding: 20,
            borderTopLeftRadius: 16, borderTopRightRadius: 16,
            display: "flex", flexDirection: "column", gap: 10
          }} onClick={e => e.stopPropagation()}>
            <p style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 600, color: "var(--rw-text-primary)" }}>{displayName}</p>
            <button onClick={() => { onSelect(pdf); setMenuOpen(false); }} style={{ padding: 12, background: "var(--rw-accent)", color: "var(--rw-accent-text)", border: "none", borderRadius: 8, fontWeight: 600 }}>Open</button>
            <button onClick={() => { startRename(); setMenuOpen(false); }} style={{ padding: 12, background: "var(--rw-hover-bg)", color: "var(--rw-text-primary)", border: "none", borderRadius: 8 }}>Rename</button>
            <button onClick={() => { onFavorite(pdf._id); setMenuOpen(false); }} style={{ padding: 12, background: "var(--rw-hover-bg)", color: "var(--rw-text-primary)", border: "none", borderRadius: 8 }}>{pdf.isFavorite ? "Unfavorite" : "Favorite"}</button>
            <button onClick={() => { onDelete(pdf._id); setMenuOpen(false); }} style={{ padding: 12, background: "var(--rw-danger-bg, rgba(224,112,96,0.1))", color: "var(--rw-danger)", border: "none", borderRadius: 8 }}>Delete</button>
          </div>
        </div>
      )}
    </li>
  );
};

export default PdfRow;
