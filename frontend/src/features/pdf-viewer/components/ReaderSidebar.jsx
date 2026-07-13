// features/pdf-viewer/components/ReaderSidebar.jsx
import React, { useRef, useEffect, useState } from "react";
import SearchPanel from "../../../components/search/SearchPanel";
import BookmarkPanel from "../../../components/BookmarkPanel";
import HighlightPanel from "../../../components/highlights/HighlightPanel";
import { useMediaQuery } from "../../../hooks/useMediaQuery";
import MobileBottomSheet from "../../../components/MobileBottomSheet";
import NotesPanel from "../../../features/notes/components/NotesPanel";
import AiPanel from "../../../features/ai/components/AiPanel";
import { useBreakpoints } from "../../../hooks/useBreakpoints";
import { useAuth } from "../../../features/auth/useAuth";
import { useGuestSessionContext } from "../../../features/auth/GuestSessionContext";

const TABS = [
  { id: "search",     icon: "⌕", label: "Search",     soon: false, guestLocked: false },
  { id: "highlights", icon: "✦", label: "Highlights", soon: false, guestLocked: false },
  { id: "bookmarks", icon: "🔖", label: "Bookmarks", soon: false, guestLocked: false },
  { id: "notes",     icon: "✎", label: "Notes",      soon: false, guestLocked: true,  lockTrigger: "notes" },
  { id: "ai",        icon: "◈", label: "AI Chat",   soon: false, guestLocked: true,  lockTrigger: "ai-chat" },
];

const PANEL_WIDTH = 300;

const SoonPanel = ({ label }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 10, padding: 24, textAlign: "center" }}>
    <div style={{ padding: "4px 10px", borderRadius: 6, background: "rgba(184,150,106,0.1)", border: "1px solid rgba(184,150,106,0.2)", fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 500, color: "var(--rw-accent)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
      Coming soon
    </div>
    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#4a3e30", margin: 0, fontWeight: 300 }}>{label} will appear here</p>
  </div>
);

const RailBtn = ({ tab, isActive, onClick, locked }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      title={tab.soon ? `${tab.label} (coming soon)` : locked ? `${tab.label} — requires a free account` : tab.label}
      style={{ width: 40, height: 40, border: "none", borderRadius: 0, cursor: tab.soon ? "default" : "pointer", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", transition: "background 0.15s", flexShrink: 0 }}
    >
      {isActive && <div style={{ position: "absolute", right: 0, top: "20%", bottom: "20%", width: 2, borderRadius: "2px 0 0 2px", background: "var(--rw-accent)" }} />}
      <span style={{ fontSize: 19, lineHeight: 1, color: isActive ? "var(--rw-accent)" : hovered && !tab.soon ? "var(--rw-accent-hover)" : "var(--rw-text-secondary)", transition: "color 0.15s", opacity: tab.soon || locked ? 0.4 : 1, userSelect: "none" }}>
        {tab.icon}
      </span>
      {tab.soon && <div style={{ position: "absolute", top: 7, right: 8, width: 4, height: 4, borderRadius: "50%", background: "var(--rw-card-bg)", opacity: 0.4 }} />}
      {locked && !tab.soon && (
        <div style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, borderRadius: "50%", background: "var(--rw-accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 5, color: "var(--rw-accent-text)", lineHeight: 1 }}>🔒</span>
        </div>
      )}
    </button>
  );
};

const ReaderSidebar = ({
  pdfId, pageNumber, numPages, onJump, activeTab, setActiveTab,
  searchState, bookmarkState, highlightState, onHighlightFocus,
  onBottomSheetHeightChange, notesState, activeNoteId, onSetActiveNote,
  hoveredNoteId, onHoverNoteChange, isFocusMode, initialExplainContext, clearInitialExplainContext,
}) => {
  const searchInputRef = useRef(null);
  const isOpen = activeTab !== null;
  const { isMobileOrSmaller: isMobile, isTablet } = useBreakpoints();
  const { user } = useAuth();
  const { openPremiumModal } = useGuestSessionContext();

  useEffect(() => {
    if (activeTab === "search") {
      const id = requestAnimationFrame(() => { setTimeout(() => searchInputRef.current?.focus(), 50); });
      return () => cancelAnimationFrame(id);
    }
  }, [activeTab]);

  const handleRailClick = (tab) => {
    if (tab.soon) return;
    // Block guest from accessing locked tabs
    if (!user && tab.guestLocked) {
      openPremiumModal(tab.lockTrigger);
      return;
    }
    setActiveTab((prev) => (prev === tab.id ? null : tab.id));
  };

  const renderPanel = () => {
    switch (activeTab) {
      case "search":
        return <SearchPanel pageNumber={pageNumber} onJump={onJump} inputRef={searchInputRef} searchState={searchState} mobileMode={isMobile} />;
      case "bookmarks":
        return <BookmarkPanel bookmarks={bookmarkState.bookmarks} pageNumber={pageNumber} onJump={onJump} onDelete={bookmarkState.deleteBookmark} isLoading={bookmarkState.isLoading} error={bookmarkState.error} mobileMode={isMobile} />;
      case "highlights":
        return <HighlightPanel highlights={highlightState.highlights} onJump={onJump} onDelete={highlightState.removeHighlight} onFocus={onHighlightFocus} mobileMode={isMobile} />;
      case "notes":
        return <NotesPanel notes={notesState.notes} createNote={notesState.createNote} updateNote={notesState.updateNote} deleteNote={notesState.deleteNote} loading={notesState.loading} error={notesState.error} pageNumber={pageNumber} onJump={onJump} activeNoteId={activeNoteId} onSetActiveNote={onSetActiveNote} hoveredNoteId={hoveredNoteId} onHoverNoteChange={onHoverNoteChange} />;
      case "ai":
        return <AiPanel pdfId={pdfId} pageNumber={pageNumber} numPages={numPages} mobileMode={isMobile} initialExplainContext={initialExplainContext} clearInitialExplainContext={clearInitialExplainContext} />;
      default:
        return null;
    }
  };

  const hideShell = isFocusMode;
  
  return (
    <div className={`focus-transition ${hideShell ? "focus-hide-x" : ""}`} style={{ display: hideShell ? "none" : "flex", flexDirection: "row", height: "100%", flexShrink: 0, position: isTablet ? "absolute" : "relative", right: isTablet ? 0 : "auto", top: isTablet ? 0 : "auto", bottom: isTablet ? 0 : "auto", zIndex: isMobile ? 9999 : (isTablet ? 10 : 1) }}>
      {isMobile ? (
        <MobileBottomSheet isOpen={isOpen} onClose={() => setActiveTab(null)} title={TABS.find((t) => t.id === activeTab)?.label || "Panel"} onHeightChange={onBottomSheetHeightChange} fullScreen={true}>
          {renderPanel()}
        </MobileBottomSheet>
      ) : (
        <div className={`side-panel ${isOpen ? "open" : ""}`} style={{ boxShadow: isTablet && isOpen ? "-4px 0 16px rgba(0,0,0,0.1)" : "none", borderLeft: isTablet && isOpen ? "1px solid var(--rw-border)" : "none" }}>
          <div className="side-panel-inner">{renderPanel()}</div>
        </div>
      )}
      {!isMobile && (
        <div style={{ width: 40, flexShrink: 0, background: "var(--rw-rail-bg)", borderLeft: "1px solid var(--rw-border)", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 8, gap: 2, overflowY: "auto", overflowX: "hidden", scrollbarWidth: "none" }}>
          {TABS.map((tab) => (
            <RailBtn
              key={tab.id}
              tab={tab}
              isActive={activeTab === tab.id}
              locked={!user && tab.guestLocked}
              onClick={() => handleRailClick(tab)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReaderSidebar;