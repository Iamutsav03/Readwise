// components/PdfActionsMenu.jsx
import { useState, useRef, useEffect } from "react";
import { MoreHorizontal } from "lucide-react";

const PdfActionsMenu = ({ onOpen, onRename, onFavorite, onDelete, isFavorite }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const menuRef = useRef(null);
  const confirmTimer = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
        setConfirmDelete(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const toggleMenu = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
    setConfirmDelete(false);
  };

  const handleAction = (e, action) => {
    e.stopPropagation();
    action();
    setIsOpen(false);
    setConfirmDelete(false);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (confirmDelete) {
      clearTimeout(confirmTimer.current);
      onDelete();
      setIsOpen(false);
      setConfirmDelete(false);
    } else {
      setConfirmDelete(true);
      confirmTimer.current = setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  return (
    <div ref={menuRef} style={{ position: "relative", flexShrink: 0 }}>
      <button
        onClick={toggleMenu}
        style={{
          width: 26, height: 26,
          border: "none", borderRadius: 6,
          background: isOpen ? "var(--rw-hover-bg)" : "transparent", cursor: "pointer",
          fontSize: 16, color: "rgba(245,238,228,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 0.15s, color 0.15s",
          lineHeight: 1, paddingBottom: 6, // visually center the dots
        }}
        onMouseEnter={(e) => { if (!isOpen) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "var(--rw-text-primary)"; }}
        onMouseLeave={(e) => { if (!isOpen) e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(245,238,228,0.5)"; }}
      >
        <MoreHorizontal size={16} />
      </button>

      {isOpen && (
        <div style={{
          position: "absolute", right: 0, top: "100%", marginTop: 4,
          background: "var(--rw-card-bg)", border: "1px solid var(--rw-border)", borderRadius: 8,
          boxShadow: "0 4px 14px rgba(0,0,0,0.5)",
          minWidth: 160, zIndex: 100, padding: 4,
          fontFamily: "'DM Sans', sans-serif",
        }}>
          <button
            onClick={(e) => handleAction(e, onOpen)}
            style={menuItemStyle}
            onMouseEnter={e => e.currentTarget.style.background = "var(--rw-border)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            Open
          </button>
          <button
            onClick={(e) => handleAction(e, onRename)}
            style={menuItemStyle}
            onMouseEnter={e => e.currentTarget.style.background = "var(--rw-border)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            Rename
          </button>
          <button
            onClick={(e) => handleAction(e, onFavorite)}
            style={menuItemStyle}
            onMouseEnter={e => e.currentTarget.style.background = "var(--rw-border)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
          </button>
          <div style={{ height: 1, background: "var(--rw-border)", margin: "4px 0" }} />
          <button
            onClick={handleDelete}
            style={{
              ...menuItemStyle,
              color: "var(--rw-danger)",
              background: confirmDelete ? "var(--rw-danger-bg, rgba(224,112,96,0.1))" : "transparent"
            }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--rw-danger-bg, rgba(224,112,96,0.1))"}
            onMouseLeave={e => {
              if (!confirmDelete) e.currentTarget.style.background = "transparent";
            }}
          >
            {confirmDelete ? "Click to confirm delete" : "Delete"}
          </button>
        </div>
      )}
    </div>
  );
};

const menuItemStyle = {
  width: "100%", textAlign: "left",
  padding: "7px 10px", background: "transparent",
  border: "none", borderRadius: 5, cursor: "pointer",
  fontSize: 12.5, color: "var(--rw-text-primary)",
  transition: "background 0.15s",
};

export default PdfActionsMenu;
