// components/PdfRow.jsx
// A single PDF row in the library list.
//
// Default: [icon] Name  Size · Date  "Opened Xh ago"
// Hover:   same + fade-in action buttons  ⭐ ✏ 🗑
// Rename:  clicking ✏ makes the name an <input>; Enter/Blur saves, Escape cancels.

import { useState, useRef, useEffect, useCallback } from "react";
import PdfActionsMenu from "./PdfActionsMenu";
import { loadPosition } from "../utils/readingStorage";

// ── Time helper ────────────────────────────────────────────────────────────────
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

// ── Inline styles injected once ───────────────────────────────────────────────
const CSS = `
  .rwpr-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border-radius: 9px;
    cursor: pointer;
    transition: background 0.15s;
    position: relative;
    min-width: 0;
    width: 100%;
  }
  .rwpr-row:hover  { background: rgba(255,255,255,0.04); }
  .rwpr-row.active { background: rgba(200,164,106,0.11); }
  .rwpr-row.active:hover { background: rgba(200,164,106,0.16); }

  /* File icon */
  .rwpr-icon {
    width: 32px; height: 36px;
    border-radius: 6px; flex-shrink: 0;
    background: #241D19; border: 1px solid rgba(255,255,255,0.05);
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; position: relative;
    transition: background 0.15s;
  }
  .rwpr-row.active .rwpr-icon {
    background: rgba(200,164,106,0.18);
    border-color: rgba(200,164,106,0.3);
  }

  /* Text block */
  .rwpr-text { flex: 1; min-width: 0; overflow: hidden; }

  .rwpr-name {
    font-size: 13px; font-weight: 500; color: #F5EEE4;
    margin: 0;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    line-height: 1.3; transition: color 0.15s;
    font-family: 'DM Sans', sans-serif;
  }
  .rwpr-row.active .rwpr-name { color: #C8A46A; font-weight: 600; }

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
    transition: opacity 0.18s;
  }
  .rwpr-row:hover .rwpr-actions, .rwpr-row:focus-within .rwpr-actions {
    opacity: 1; pointer-events: auto;
  }

  .rwpr-rename-input {
    font-size: 13px; font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    color: #1A1512; background: #F5EEE4;
    border: 1.5px solid #C8A46A; border-radius: 5px;
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

// ── Component ─────────────────────────────────────────────────────────────────
const PdfRow = ({ pdf, active, onSelect, onFavorite, onRename, onDelete }) => {
  injectStyle();

  const [renaming, setRenaming] = useState(false);
  const [renameVal, setRenameVal] = useState("");
  const inputRef = useRef(null);

  // Focus rename input when it appears
  useEffect(() => {
    if (renaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [renaming]);

  const startRename = useCallback((e) => {
    e.stopPropagation();
    setRenameVal(pdf.originalName.replace(/\.pdf$/i, ""));
    setRenaming(true);
  }, [pdf.originalName]);

  const commitRename = useCallback(() => {
    const trimmed = renameVal.trim();
    if (trimmed && trimmed !== pdf.originalName.replace(/\.pdf$/i, "")) {
      // Append .pdf if not already present
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

  const handleFavClick = useCallback(() => {
    onFavorite(pdf._id);
  }, [onFavorite, pdf._id]);

  const handleDeleteClick = useCallback(() => {
    onDelete(pdf._id);
  }, [onDelete, pdf._id]);

  const handleOpenClick = useCallback(() => {
    onSelect(pdf);
  }, [onSelect, pdf]);

  const displayName = pdf.originalName.replace(/\.pdf$/i, "");
  const opened = timeAgo(pdf.lastOpenedAt);
  const pos = loadPosition(pdf._id);
  const pageProgress = pos ? `Page ${pos.pageNumber}` : null;

  return (
    <li style={{ marginBottom: 2, listStyle: "none" }}>
      <div
        className={`rwpr-row${active ? " active" : ""}`}
        onClick={() => !renaming && onSelect(pdf)}
      >
        {/* Icon */}
        <div className="rwpr-icon">
          <span style={{ fontSize: 13, lineHeight: 1 }}>📄</span>
          {active && (
            <div style={{
              position: "absolute", top: 3, right: 3,
              width: 5, height: 5, borderRadius: "50%", background: "#C8A46A",
            }} />
          )}
        </div>

        {/* Name + meta */}
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

        {/* Action Menu */}
        <div className="rwpr-actions">
          <PdfActionsMenu
            onOpen={handleOpenClick}
            onRename={startRename}
            onFavorite={handleFavClick}
            onDelete={handleDeleteClick}
            isFavorite={pdf.isFavorite}
          />
        </div>
      </div>
    </li>
  );
};

export default PdfRow;
