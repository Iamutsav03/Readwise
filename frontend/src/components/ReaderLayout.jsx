// src/components/ReaderLayout.jsx
import React, { useCallback, useRef, useState, useEffect } from "react";
import PDFViewer from "./PDFViewer";
import FitControls from "./reader/FitControls";
import PageJumpInput from "./reader/PageJumpInput";
import ReadingProgress from "./reader/ReadingProgress";
import SidePanelShell from "./search/SidePanelShell";
import { useReadingProgress } from "../components/hooks/useReadingProgress";
import { useLastReadPosition } from "../components/hooks/useLastReadPosition";
import { usePdfSearch } from "./hooks/usePdfSearch";
import { useBookmarks } from "./hooks/useBookmarks";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useSearchHighlight } from "./hooks/useSearchHighlight";
import { useHighlights } from "./hooks/useHighlights";
import { useHighlightHistory } from "./hooks/useHighlightHistory";
import { useTextSelection } from "./hooks/useTextSelection";
import { useNotes } from "../features/notes/hooks/useNotes";
import HighlightToolbar from "./highlights/HighlightToolbar";
import { getSelectionRects } from "../utils/highlightHelpers";
import { BookmarkIcon as BookmarkOutline, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolid } from "@heroicons/react/24/solid";
import { useMediaQuery } from "../components/hooks/useMediaQuery";
import MobileZoomPopover from "./reader/MobileZoomPopover";

/**
 * ReaderLayout — full-screen reading view.
 *
 * Layout tree:
 *   <outer col>                     ← full viewport, overflow hidden
 *     <content row>                 ← flex:1, fills space above toolbar
 *       <scroll host>               ← flex:1, PDF scrolls here
 *         <PDFViewer />
 *       <SidePanelShell />          ← [panel 0–300px][rail 40px], right edge
 *     <toolbar row>                 ← fixed 56px bottom bar
 *
 * The PDF viewer shrinks naturally when the side panel opens because
 * the scroll host is flex:1 and SidePanelShell has flex-shrink:0.
 */
const ReaderLayout = ({
  pdf,
  viewerRef,
  pageNumber,
  numPages,
  scale,
  onPageChange,
  onScaleChange,
  onNumPagesChange,
  onRemove,
  onUploadClick,
  onPrev,
  onNext,
  onZoomIn,
  onZoomOut,
  onFit,
  fileInputRef,
  onFileChange,
}) => {
  const scrollHostRef = useRef(null);
  const [fitMode, setFitMode] = useState("page");
  const [activeTab, setActiveTab] = useState(null);
  const [focusedHighlightId, setFocusedHighlightId] = useState(null);
  const [bottomSheetHeightPct, setBottomSheetHeightPct] = useState(0);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // ── Highlight State & History ────────────────────────────────────────────
  const highlightState = useHighlights(pdf?._id);
  const history = useHighlightHistory(pdf?._id, highlightState.setHighlights);
  const { selectionInfo, clearSelection } = useTextSelection(scrollHostRef);

  // ── Search State & Highlighting ──────────────────────────────────────────
  const searchState = usePdfSearch(pdf?._id);
  const customTextRenderer = useSearchHighlight(searchState.query);

  // ── Bookmarks State ─────────────────────────────────────────────────────
  const bookmarkState = useBookmarks(pdf?._id);

  // ── Notes State & Interaction ────────────────────────────────────────────
  const notesState = useNotes(pdf?._id);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [hoveredNoteId, setHoveredNoteId] = useState(null);

  // Collapse notes when notes tab is closed or switched
  useEffect(() => {
    if (activeTab !== "notes") {
      setActiveNoteId(null);
    }
  }, [activeTab]);

  // ── Keyboard Shortcuts ──────────────────────────────────────────────────
  useKeyboardShortcuts({
    onPrev,
    onNext,
    onToggleBookmark: () => bookmarkState.toggleBookmark(pageNumber),
    setActiveTab,
    undoHighlight: history.undo,
    redoHighlight: history.redo,
  });

  // ── Last read position ─────────────────────────────────────────────────
  const { positionLoaded } = useLastReadPosition({
    pdfId: pdf?._id,
    pageNumber,
    scale,
    onPageChange,
    onScaleChange,
  });

  // ── Reading progress ───────────────────────────────────────────────────
  const { progressPct } = useReadingProgress({ pageNumber, numPages });

  // ── Fit Page ───────────────────────────────────────────────────────────
  const handleFitPage = useCallback(() => {
    setFitMode("page");
    viewerRef.current?.fitToScreen();
    onFit?.();
  }, [viewerRef, onFit]);

  // Recalculate Fit Page when bottom sheet resizes on mobile
  useEffect(() => {
    if (isMobile && fitMode === "page") {
      viewerRef.current?.fitToScreen();
    }
  }, [bottomSheetHeightPct, isMobile, fitMode]);

  // ── Fit Width ──────────────────────────────────────────────────────────
  const handleFitWidth = useCallback(() => {
    setFitMode("width");
    viewerRef.current?.fitToWidth();
  }, [viewerRef]);

  // ── Manual zoom clears fit mode ────────────────────────────────────────
  const handleZoomIn = useCallback(() => { setFitMode(null); onZoomIn(); }, [onZoomIn]);
  const handleZoomOut = useCallback(() => { setFitMode(null); onZoomOut(); }, [onZoomOut]);

  // ── Jump to page (used by search results) ─────────────────────────────
  const handleJumpToPage = useCallback((page) => {
    onPageChange(page);
  }, [onPageChange]);

  // ── Handlers for Highlight Actions ──────────────────────────────────────
  const handleColorPick = async (color) => {
    if (!selectionInfo) return;

    // We already checked and guaranteed selection is valid in useTextSelection
    const rects = getSelectionRects(selectionInfo.range, selectionInfo.pageEl);

    try {
      const savedHighlight = await highlightState.addHighlight(
        selectionInfo.pageNumber,
        selectionInfo.text,
        color,
        rects
      );
      history.pushAction({ type: "add", highlight: savedHighlight });
    } catch (err) {
      console.error("Failed to add highlight action", err);
    }
    clearSelection();
  };

  const handleHighlightFocus = useCallback((id) => {
    setFocusedHighlightId(id);
    // Remove focus after animation
    setTimeout(() => setFocusedHighlightId(null), 2000);
  }, []);

  // Hook into highlightState.removeHighlight to add it to history
  const handleHighlightDelete = useCallback(async (id) => {
    try {
      const removed = await highlightState.removeHighlight(id);
      if (removed) {
        history.pushAction({ type: "remove", highlight: removed });
      }
    } catch (err) {
      console.error("Failed to delete highlight action", err);
    }
  }, [highlightState, history]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
        maxWidth: "100vw",
        overflow: "hidden",
        backgroundColor: "#000",
      }}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={onFileChange}
      />

      {/* ── Content row: PDF viewer + right side panel ───────────── */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flex: 1,
          minHeight: 0,   // critical: lets flex children shrink below content height
          overflow: "hidden",
        }}
      >
        {/* PDF scroll host — grows/shrinks as side panel opens */}
        <div
          ref={scrollHostRef}
          style={{
            flex: 1,
            minWidth: 0,    // allow shrinking below natural content width
            overflowX: "auto",
            overflowY: "auto",
            display: "block",
            position: "relative",
          }}
          className="custom-scrollbar"
        >
          {selectionInfo && (
            <HighlightToolbar
              position={selectionInfo.toolbarPosition}
              onColorPick={handleColorPick}
              onClose={clearSelection}
            />
          )}

          <PDFViewer
            ref={viewerRef}
            pdf={pdf}
            pageNumber={pageNumber}
            scale={scale}
            hideHeader={true}
            onPageChange={onPageChange}
            onScaleChange={onScaleChange}
            onNumPagesChange={onNumPagesChange}
            customTextRenderer={customTextRenderer}
            searchQuery={searchState.query}
            pageHighlights={highlightState.highlightsForPage(pageNumber)}
            focusedHighlightId={focusedHighlightId}
            bottomSheetHeightPct={bottomSheetHeightPct}
            pageNotes={notesState.notes.filter((n) => n.pageNumber === pageNumber)}
            activeNoteId={activeNoteId}
            hoveredNoteId={hoveredNoteId}
            onNoteMarkerClick={(id) => {
              setActiveTab("notes");
              // Delay so the NotesPanel has time to mount (tab may have been closed)
              // before the NoteCard useEffect tries to expand & scroll to this note
              setTimeout(() => setActiveNoteId(id), 120);
            }}
            onHoverNoteChange={(id, isHovered) => setHoveredNoteId(isHovered ? id : null)}
            onUpdateNote={notesState.updateNote}
          />
        </div>

        {/* Right side panel shell — always-visible rail + collapsible panel */}
        <SidePanelShell
          pdfId={pdf?._id}
          pageNumber={pageNumber}
          onJump={handleJumpToPage}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchState={searchState}
          bookmarkState={bookmarkState}
          highlightState={{ ...highlightState, removeHighlight: handleHighlightDelete }}
          onHighlightFocus={handleHighlightFocus}
          onBottomSheetHeightChange={setBottomSheetHeightPct}
          notesState={notesState}
          activeNoteId={activeNoteId}
          onSetActiveNote={setActiveNoteId}
          hoveredNoteId={hoveredNoteId}
          onHoverNoteChange={(id, isHovered) => setHoveredNoteId(isHovered ? id : null)}
        />
      </div>

      {/* ── Toolbar ───────────────────────────────────────────────── */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        {/* Hairline progress bar at very top of toolbar */}
        <ReadingProgress progressPct={progressPct} showBadge={false} />

        <div
          className={isMobile ? "" : "toolbar-container"}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: isMobile ? "space-around" : "space-between",
            padding: isMobile ? "0 8px" : "0 16px",
            height: 56,
            background: "#111",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            gap: isMobile ? 0 : 8,
            overflowX: "hidden",
          }}
        >
          {isMobile ? (
            <>
              {/* MOBILE LAYOUT: Compact icons only */}
              <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                <ToolbarIconBtn onClick={onPrev} disabled={pageNumber <= 1}>‹</ToolbarIconBtn>
                <PageJumpInput pageNumber={pageNumber} numPages={numPages || 1} onChange={onPageChange} />
                <ToolbarIconBtn onClick={onNext} disabled={pageNumber >= numPages}>›</ToolbarIconBtn>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <ToolbarIconBtn
                  onClick={() => fitMode === "page" ? handleFitWidth() : handleFitPage()}
                  title={fitMode === "page" ? "Fit Width" : "Fit Page"}
                >
                  {fitMode === "page" ? "↔" : "⊡"}
                </ToolbarIconBtn>

                <button
                  onClick={handleZoomOut}
                  style={{
                    width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)", color: "#e8d8b8", display: "flex",
                    alignItems: "center", justifyContent: "center", cursor: "pointer"
                  }}
                >−</button>
                <button
                  onClick={handleZoomIn}
                  style={{
                    width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)", color: "#e8d8b8", display: "flex",
                    alignItems: "center", justifyContent: "center", cursor: "pointer"
                  }}
                >+</button>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <ToolbarIconBtn onClick={() => bookmarkState.toggleBookmark(pageNumber)}>
                  {bookmarkState.isPageBookmarked(pageNumber) ? <BookmarkSolid style={{ width: 18, height: 18 }} /> : <BookmarkOutline style={{ width: 18, height: 18 }} />}
                </ToolbarIconBtn>
              </div>
            </>
          ) : (
            <>
              {/* DESKTOP LAYOUT: Full toolbar */}
              {/* LEFT — page navigation */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <ToolbarIconBtn onClick={onPrev} disabled={pageNumber <= 1} title="Previous page (←)">‹</ToolbarIconBtn>
                <PageJumpInput pageNumber={pageNumber} numPages={numPages || 1} onChange={onPageChange} />
                <ToolbarIconBtn onClick={onNext} disabled={pageNumber >= numPages} title="Next page (→)">›</ToolbarIconBtn>
              </div>

              {/* CENTER — fit + zoom */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <FitControls fitMode={fitMode} onFitPage={handleFitPage} onFitWidth={handleFitWidth} />
                <Divider />
                <ToolbarIconBtn onClick={handleZoomOut} title="Zoom out">−</ToolbarIconBtn>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#7a6a52", minWidth: 38, textAlign: "center", letterSpacing: "0.01em", cursor: "default", userSelect: "none" }}>
                  {Math.round(scale * 100)}%
                </span>
                <ToolbarIconBtn onClick={handleZoomIn} title="Zoom in">+</ToolbarIconBtn>
              </div>

              {/* RIGHT — progress + actions */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <ReadingProgress progressPct={progressPct} showBadge={true} />
                <Divider />
                <ToolbarIconBtn onClick={() => bookmarkState.toggleBookmark(pageNumber)} title={bookmarkState.isPageBookmarked(pageNumber) ? "Remove bookmark (Ctrl+B)" : "Bookmark this page (Ctrl+B)"}>
                  {bookmarkState.isPageBookmarked(pageNumber) ? <BookmarkSolid style={{ width: 16, height: 16 }} /> : <BookmarkOutline style={{ width: 16, height: 16 }} />}
                </ToolbarIconBtn>
                <ToolbarIconBtn onClick={onUploadClick} title="Upload new PDF">↑</ToolbarIconBtn>
                <ToolbarIconBtn onClick={onRemove} title="Remove this PDF" danger>✕</ToolbarIconBtn>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Shared toolbar primitives (unchanged) ─────────────────────────────────────

const ToolbarIconBtn = ({ children, onClick, disabled, title, danger }) => {
  const [hovered, setHovered] = React.useState(false);

  const bg = disabled
    ? "transparent"
    : hovered && danger ? "rgba(192,57,43,0.15)"
      : hovered ? "rgba(255,255,255,0.09)"
        : "rgba(255,255,255,0.05)";

  const color = disabled
    ? "rgba(255,255,255,0.15)"
    : hovered && danger ? "#e07060"
      : hovered ? "#e8d8b8"
        : "#8a7a62";

  return (
    <button
      onClick={disabled ? undefined : onClick}
      title={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 32, height: 32, borderRadius: 7,
        border: "1px solid rgba(255,255,255,0.07)",
        background: bg, color,
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 16, fontWeight: 400,
        cursor: disabled ? "default" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "background 0.15s, color 0.15s",
        flexShrink: 0, userSelect: "none",
      }}
    >
      {children}
    </button>
  );
};

const Divider = () => (
  <div style={{
    width: 1, height: 20,
    background: "rgba(255,255,255,0.08)",
    flexShrink: 0, margin: "0 2px",
  }} />
);

export default ReaderLayout;