// src/components/search/SidePanelShell.jsx
/**
 * SidePanelShell.jsx
 * ──────────────────
 * The permanent right-edge structure of the reader. Two parts:
 *
 * 1. Icon rail (40px, always visible)
 *    A slim vertical strip of tab icons — Search and Bookmarks are now active.
 *    Clicking an icon either opens its panel or closes if already active.
 *
 * 2. Panel area (300px, animated open/close)
 *    Width transitions between 0 and 300px via CSS.
 *    Renders the active panel's content.
 *    When closed, overflow:hidden hides everything cleanly.
 */

import React, { useRef, useEffect, useState } from "react";
import SearchPanel from "./SearchPanel";
import BookmarkPanel from "../BookmarkPanel";
import HighlightPanel from "../highlights/HighlightPanel";
import { useMediaQuery } from "../hooks/useMediaQuery";
import MobileBottomSheet from "../MobileBottomSheet";
import NotesPanel from "../../features/notes/components/NotesPanel";

// ── Tab registry ─────────────────────────────────────────────────────────────
const TABS = [
  { id: "search", icon: "⌕", label: "Search", soon: false },
  { id: "highlights", icon: "✦", label: "Highlights", soon: false },
  { id: "bookmarks", icon: "🔖", label: "Bookmarks", soon: false },
  { id: "notes", icon: "✎", label: "Notes", soon: false },
  { id: "ai", icon: "◈", label: "AI Chat", soon: true },
];

const PANEL_WIDTH = 300; // px — also used for transition

// ── Coming-soon placeholder ───────────────────────────────────────────────────
const SoonPanel = ({ label }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      gap: 10,
      padding: 24,
      textAlign: "center",
    }}
  >
    <div
      style={{
        padding: "4px 10px",
        borderRadius: 6,
        background: "rgba(184,150,106,0.1)",
        border: "1px solid rgba(184,150,106,0.2)",
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 10,
        fontWeight: 500,
        color: "#b8966a",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
      }}
    >
      Coming soon
    </div>
    <p
      style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 13,
        color: "#4a3e30",
        margin: 0,
        fontWeight: 300,
      }}
    >
      {label} will appear here
    </p>
  </div>
);

// ── Rail icon button ──────────────────────────────────────────────────────────
const RailBtn = ({ tab, isActive, onClick }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={tab.soon ? `${tab.label} (coming soon)` : tab.label}
      style={{
        width: 40,
        height: 40,
        border: "none",
        borderRadius: 0,
        cursor: tab.soon ? "default" : "pointer",
        background: "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        transition: "background 0.15s",
        flexShrink: 0,
      }}
    >
      {/* Active left-border accent */}
      {isActive && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "20%",
            bottom: "20%",
            width: 2,
            borderRadius: "2px 0 0 2px",
            background: "#b8966a",
          }}
        />
      )}

      <span
        style={{
          fontSize: 19,
          lineHeight: 1,
          color: isActive
            ? "#c8a870"
            : hovered && !tab.soon
            ? "#c8b898"
            : "#7a6a58",
          transition: "color 0.15s",
          opacity: tab.soon ? 0.3 : 1,
          userSelect: "none",
        }}
      >
        {tab.icon}
      </span>

      {/* "Soon" dot */}
      {tab.soon && (
        <div
          style={{
            position: "absolute",
            top: 7,
            right: 8,
            width: 4,
            height: 4,
            borderRadius: "50%",
            background: "#3a3028",
            opacity: 0.4,
          }}
        />
      )}
    </button>
  );
};

// ── Main shell ────────────────────────────────────────────────────────────────
const SidePanelShell = ({
  pdfId,
  pageNumber,
  onJump,
  activeTab,
  setActiveTab,
  searchState,
  bookmarkState,
  highlightState,
  onHighlightFocus,
  onBottomSheetHeightChange,
  notesState,
  activeNoteId,
  onSetActiveNote,
  hoveredNoteId,
  onHoverNoteChange,
}) => {
  const searchInputRef = useRef(null);
  const isOpen = activeTab !== null;
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Autofocus the search input whenever the search tab opens.
  useEffect(() => {
    if (activeTab === "search") {
      // rAF ensures the panel has finished animating into view.
      const id = requestAnimationFrame(() => {
        setTimeout(() => searchInputRef.current?.focus(), 50);
      });
      return () => cancelAnimationFrame(id);
    }
  }, [activeTab]);

  const handleRailClick = (tab) => {
    if (tab.soon) return;
    setActiveTab((prev) => (prev === tab.id ? null : tab.id));
  };

  const renderPanel = () => {
    switch (activeTab) {
      case "search":
        return (
          <SearchPanel
            pageNumber={pageNumber}
            onJump={onJump}
            inputRef={searchInputRef}
            searchState={searchState}
            mobileMode={isMobile}
          />
        );
      case "bookmarks":
        return (
          <BookmarkPanel
            bookmarks={bookmarkState.bookmarks}
            pageNumber={pageNumber}
            onJump={onJump}
            onDelete={bookmarkState.deleteBookmark}
            isLoading={bookmarkState.isLoading}
            error={bookmarkState.error}
            mobileMode={isMobile}
          />
        );
      case "highlights":
        return (
          <HighlightPanel
            highlights={highlightState.highlights}
            onJump={onJump}
            onDelete={highlightState.removeHighlight}
            onFocus={onHighlightFocus}
            mobileMode={isMobile}
          />
        );
      case "notes":
        return (
          <NotesPanel
            notes={notesState.notes}
            createNote={notesState.createNote}
            updateNote={notesState.updateNote}
            deleteNote={notesState.deleteNote}
            loading={notesState.loading}
            error={notesState.error}
            pageNumber={pageNumber}
            onJump={onJump}
            activeNoteId={activeNoteId}
            onSetActiveNote={onSetActiveNote}
            hoveredNoteId={hoveredNoteId}
            onHoverNoteChange={onHoverNoteChange}
          />
        );
      case "ai": {
        const tab = TABS.find((t) => t.id === activeTab);
        return <SoonPanel label={tab?.label ?? activeTab} />;
      }
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        height: "100%",
        flexShrink: 0,
      }}
    >
      {/* ── Collapsible panel / Bottom Sheet ────────────────────── */}
      {isMobile ? (
        <MobileBottomSheet
          isOpen={isOpen}
          onClose={() => setActiveTab(null)}
          title={TABS.find((t) => t.id === activeTab)?.label || "Panel"}
          onHeightChange={onBottomSheetHeightChange}
        >
          {renderPanel()}
        </MobileBottomSheet>
      ) : (
        <div className={`side-panel ${isOpen ? "open" : ""}`}>
          <div className="side-panel-inner">
            {renderPanel()}
          </div>
        </div>
      )}

      {/* ── Always-visible icon rail ───────────────────────────────── */}
      <div
        style={{
          width: 40,
          flexShrink: 0,
          background: "#0a0806",
          borderLeft: "1px solid rgba(255,255,255,0.05)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: 8,
          gap: 2,
          overflowY: "auto",
          overflowX: "hidden",
          scrollbarWidth: "none",
        }}
      >
        {TABS.map((tab) => (
          <RailBtn
            key={tab.id}
            tab={tab}
            isActive={activeTab === tab.id}
            onClick={() => handleRailClick(tab)}
          />
        ))}
      </div>
    </div>
  );
};

export default SidePanelShell;