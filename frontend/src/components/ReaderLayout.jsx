// src/components/ReaderLayout.jsx
import React, { useCallback, useRef, useState, useEffect } from "react";
import { getPDFViewURL, uploadPDF } from "../utils/api";
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
import { useTextSelection } from "../features/ai/hooks/useTextSelection";
import { useNotes } from "../features/notes/hooks/useNotes";
import SelectionToolbar from "../features/ai/components/SelectionToolbar";
import DictionaryPopup from "../features/dictionary/components/DictionaryPopup";
import { useDictionary } from "../features/dictionary/hooks/useDictionary";
import { getSelectionRects } from "../utils/highlightHelpers";
import { BookmarkIcon as BookmarkOutline, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolid } from "@heroicons/react/24/solid";
import MobileZoomPopover from "./reader/MobileZoomPopover";
import { useBreakpoints } from "../hooks/useBreakpoints";
import AppearanceModal from "../theme/AppearanceModal";
import { Lock, LockOpen, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, MoreVertical, Maximize2, Maximize, Sparkles, Search, Edit2, Highlighter, Bookmark as BookmarkIcon, Palette, UploadCloud, FileX } from "lucide-react";

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
  const { isMobileOrSmaller: isMobile, isUltrawide } = useBreakpoints();
  const [fitMode, setFitMode] = useState(() => {
    const saved = localStorage.getItem("rw_fit_mode");
    return saved ? saved : (isMobile ? "width" : "page");
  });
  const [initialExplainContext, setInitialExplainContext] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const [focusedHighlightId, setFocusedHighlightId] = useState(null);
  const [bottomSheetHeightPct, setBottomSheetHeightPct] = useState(0);
  const [isOverflowOpen, setIsOverflowOpen] = useState(false);

  // ── Focus Mode State ────────────────────────────────────────────────────
  const [isFocusMode, setIsFocusMode] = useState(() => {
    const saved = localStorage.getItem("rw_focus_mode");
    return saved !== null ? saved === "true" : isMobile;
  });
  const [isAppearanceOpen, setIsAppearanceOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("rw_fit_mode", fitMode);
  }, [fitMode]);

  useEffect(() => {
    localStorage.setItem("rw_focus_mode", isFocusMode);
  }, [isFocusMode]);
  const [showFocusHint, setShowFocusHint] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isFocusMode) {
        setIsFocusMode(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFocusMode]);

  useEffect(() => {
    let timer;
    if (showFocusHint) {
      timer = setTimeout(() => setShowFocusHint(false), 3000);
    }
    return () => clearTimeout(timer);
  }, [showFocusHint]);

  // ── Highlight State & History ────────────────────────────────────────────
  const highlightState = useHighlights(pdf?._id);
  const history = useHighlightHistory(pdf?._id, highlightState.setHighlights);
  const { selectionInfo, clearSelection } = useTextSelection(scrollHostRef);
  const [dictPopupOpen, setDictPopupOpen] = useState(false);
  const dictionary = useDictionary(pdf?._id);

  // Clear stale dictionary state when selection changes
  useEffect(() => {
    if (selectionInfo) {
      setDictPopupOpen(false);
      dictionary.clear();
    } else {
      setDictPopupOpen(false);
    }
  }, [selectionInfo?.text]); // Only trigger when the selected TEXT changes

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

  const { positionLoaded } = useLastReadPosition({
    pdfId: pdf?._id,
    pageNumber,
    numPages,
    scale,
    activeTab,
    onPageChange,
    onScaleChange,
    onActiveTabChange: setActiveTab,
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

  const handleToolbarAction = useCallback((action) => {
    if (!selectionInfo) return;
    const { text, pageNumber: pageNum } = selectionInfo;

    if (action === "meaning") {
      dictionary.lookup(text, pageNum);
      setDictPopupOpen(true);
      return;
    }

    if (action === "quick_explain") {
      setInitialExplainContext({ text, pageNumber: pageNum, mode: "quick", timestamp: Date.now() });
      setActiveTab("ai");
      clearSelection();
      setDictPopupOpen(false);
      return;
    }

    if (action === "deep_explain") {
      setInitialExplainContext({ text, pageNumber: pageNum, mode: "deep", timestamp: Date.now() });
      setActiveTab("ai");
      clearSelection();
      setDictPopupOpen(false);
      return;
    }

    if (action === "summary") {
      setInitialExplainContext({ text, pageNumber: pageNum, mode: "summary", timestamp: Date.now() });
      setActiveTab("ai");
      clearSelection();
      setDictPopupOpen(false);
      return;
    }
  }, [selectionInfo, clearSelection, setActiveTab, dictionary]);

  const handleDictClose = useCallback(() => {
    setDictPopupOpen(false);
    dictionary.clear();
  }, [dictionary]);

  const handleDictSave = useCallback(() => {
    if (!dictionary.result) return;
    dictionary.save(dictionary.result);
  }, [dictionary]);

  const handleDictExplainFurther = useCallback(() => {
    if (!selectionInfo && !dictionary.result) return;
    const word = dictionary.result?.word || selectionInfo?.text;
    const pageNum = selectionInfo?.pageNumber;
    
    setInitialExplainContext({ text: word, pageNumber: pageNum, timestamp: Date.now() });
    setActiveTab("ai");
    
    setDictPopupOpen(false);
    clearSelection();
  }, [selectionInfo, dictionary, clearSelection, setActiveTab]);

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
        height: "100dvh",
        width: "100vw",
        maxWidth: "100vw",
        overflow: "hidden",
        backgroundColor: "var(--rw-reader-bg)",
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

      {/* ── Focus Mode Exit & Hint ──────────────────────────── */}
      {isFocusMode && (
        <div
          style={{
            position: "absolute", top: 16, right: 16, zIndex: 100,
            display: "flex", gap: 8, alignItems: "center"
          }}
        >
          {showFocusHint && (
            <div
              style={{
                background: "var(--rw-card-bg)", color: "var(--rw-text-primary)",
                padding: "6px 12px", borderRadius: 8, fontSize: 13,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                border: "1px solid var(--rw-border)",
                fontFamily: "'DM Sans', sans-serif",
                opacity: 0.9
              }}
            >
              Press ESC to exit Focus Mode
            </div>
          )}
          <button
            onClick={() => setIsFocusMode(false)}
            title="Exit Focus Mode (ESC)"
            style={{
              background: "var(--rw-card-bg)", color: "var(--rw-text-primary)",
              border: "1px solid var(--rw-border)", borderRadius: 8,
              padding: "8px 12px", cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", fontSize: 13,
              display: "flex", alignItems: "center", gap: 6,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            <LockOpen size={16} /> Exit
          </button>
        </div>
      )}

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
            <SelectionToolbar
              position={selectionInfo.toolbarPosition}
              selectionText={selectionInfo.text}
              pageNumber={selectionInfo.pageNumber}
              onColorPick={handleColorPick}
              onAction={handleToolbarAction}
              onClose={() => { clearSelection(); handleDictClose(); }}
            />
          )}

          {/* Dictionary Popup — rendered alongside toolbar when active */}
          {dictPopupOpen && selectionInfo && (
            <DictionaryPopup
              result={dictionary.result}
              error={dictionary.error}
              isLoading={dictionary.isLoading}
              isSaved={dictionary.isSaved}
              isSaving={dictionary.isSaving}
              onSave={handleDictSave}
              onExplainFurther={handleDictExplainFurther}
              onClose={handleDictClose}
              position={selectionInfo.toolbarPosition}
            />
          )}

          <PDFViewer
            ref={viewerRef}
            scrollHostRef={scrollHostRef}
            fitMode={fitMode}
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
            isFocusMode={isFocusMode}
          />
        </div>

        {/* Right side panel shell — always-visible rail + collapsible panel */}
        <SidePanelShell
          pdfId={pdf?._id}
          pageNumber={pageNumber}
          numPages={pdf?.numPages}
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
          isFocusMode={isFocusMode}
          initialExplainContext={initialExplainContext}
          clearInitialExplainContext={() => setInitialExplainContext(null)}
        />
      </div>

      <AppearanceModal isOpen={isAppearanceOpen} onClose={() => setIsAppearanceOpen(false)} />

      {/* Floating Exit Focus Mode Button (Mobile/Tablet) */}
        {isFocusMode && isMobile && (
          <button
            onClick={() => setIsFocusMode(false)}
            style={{
              position: "absolute",
              top: "max(16px, env(safe-area-inset-top, 16px))",
              right: "max(16px, env(safe-area-inset-right, 16px))",
              zIndex: 9999,
              background: "var(--rw-panel-bg)",
              border: "1px solid var(--rw-border)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              color: "var(--rw-text-primary)",
              padding: "8px 12px",
              borderRadius: "20px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            <LockOpen size={16} /> Exit Focus
          </button>
        )}
      
      {/* ── Toolbar ───────────────────────────────────────────────── */}
      <div className={`focus-transition ${isFocusMode ? "focus-hide-y" : ""}`} style={{ position: "relative", flexShrink: 0, zIndex: 50 }}>
        {/* Hairline progress bar at very top of toolbar */}
        <ReadingProgress progressPct={progressPct} showBadge={false} />

        <div
          className={isMobile ? "" : "toolbar-container"}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: isMobile ? "0 8px" : "0 16px",
            height: 56,
            background: "var(--rw-toolbar-bg)",
            borderTop: "1px solid var(--rw-border)",
            gap: isMobile ? 4 : 8,
            position: "relative",
          }}
        >
          {isMobile ? (
            <>
              {/* MOBILE LAYOUT: Essential icons + Overflow menu */}
              <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                <ToolbarIconBtn onClick={onPrev} disabled={pageNumber <= 1}><ChevronLeft size={16} /></ToolbarIconBtn>
                <PageJumpInput pageNumber={pageNumber} numPages={numPages || 1} onChange={onPageChange} />
                <ToolbarIconBtn onClick={onNext} disabled={pageNumber >= numPages}><ChevronRight size={16} /></ToolbarIconBtn>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <ToolbarIconBtn onClick={handleZoomOut} aria-label="Zoom Out"><ZoomOut size={16} /></ToolbarIconBtn>
                <ToolbarIconBtn onClick={handleZoomIn} aria-label="Zoom In"><ZoomIn size={16} /></ToolbarIconBtn>
                <ToolbarIconBtn onClick={() => { setIsFocusMode(true); setShowFocusHint(true); setActiveTab(null); }} title="Focus Mode"><Lock size={16} /></ToolbarIconBtn>
                <ToolbarIconBtn onClick={() => setIsOverflowOpen(!isOverflowOpen)}><MoreVertical size={16} /></ToolbarIconBtn>
              </div>

              {/* Overflow Menu Dropdown */}
              {isOverflowOpen && (
                <>
                  <div
                    style={{ position: "fixed", inset: 0, zIndex: 99, background: "transparent" }}
                    onClick={() => setIsOverflowOpen(false)}
                    aria-label="Close menu backdrop"
                    role="button"
                    tabIndex={0}
                  />
                  <div style={{
                    position: "absolute", bottom: "calc(env(safe-area-inset-bottom) + 60px)", right: "8px",
                    background: "var(--rw-card-bg)", borderRadius: "12px",
                    border: "1px solid var(--rw-border)", boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                    padding: "8px", display: "flex", flexDirection: "column", gap: "2px",
                    zIndex: 100, minWidth: "220px", maxHeight: "60vh", overflowY: "auto",
                    fontFamily: "'DM Sans', sans-serif"
                  }}>
                    <style>{`
                      .rw-overflow-item {
                        display: flex; align-items: center; justify-content: space-between;
                        min-height: 44px; padding: 0 8px; font-size: 14px; color: var(--rw-text-primary);
                        background: transparent; border: none; border-radius: 8px; cursor: pointer;
                        text-align: left; width: 100%; font-family: 'DM Sans', sans-serif;
                      }
                      .rw-overflow-item:hover, .rw-overflow-item:active {
                        background: var(--rw-border);
                      }
                    `}</style>
                    
                    {/* View Controls */}
                    <div style={{ padding: "4px 8px", fontSize: 11, color: "var(--rw-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>View</div>
                    <button className="rw-overflow-item" aria-label="Fit Width" role="menuitem" onClick={() => { handleFitWidth(); setIsOverflowOpen(false); }}>
                      <span>Fit Width</span>
                      <Maximize2 size={14} />
                    </button>
                    <button className="rw-overflow-item" aria-label="Fit Page" role="menuitem" onClick={() => { handleFitPage(); setIsOverflowOpen(false); }}>
                      <span>Fit Page</span>
                      <Maximize size={14} />
                    </button>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px", minHeight: 44 }}>
                      <span style={{ fontSize: 14 }}>Current Zoom:</span>
                      <span style={{ fontSize: 14, fontWeight: 500 }}>{Math.round(scale * 100)}%</span>
                    </div>
                    
                    <div style={{ height: "1px", background: "var(--rw-border)", margin: "4px 0" }} />
                    
                    {/* Reader Tools */}
                    <div style={{ padding: "4px 8px", fontSize: 11, color: "var(--rw-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Tools</div>
                    <button className="rw-overflow-item" aria-label="Open AI Chat" role="menuitem" onClick={() => { setActiveTab("ai"); setIsOverflowOpen(false); }}>
                      <span>AI Chat</span>
                      <Sparkles size={14} />
                    </button>
                    <button className="rw-overflow-item" aria-label="Open Search" role="menuitem" onClick={() => { setActiveTab("search"); setIsOverflowOpen(false); }}>
                      <span>Search</span>
                      <Search size={14} />
                    </button>
                    <button className="rw-overflow-item" aria-label="Open Notes" role="menuitem" onClick={() => { setActiveTab("notes"); setIsOverflowOpen(false); }}>
                      <span>Notes</span>
                      <Edit2 size={14} />
                    </button>
                    <button className="rw-overflow-item" aria-label="Open Highlights" role="menuitem" onClick={() => { setActiveTab("highlights"); setIsOverflowOpen(false); }}>
                      <span>Highlights</span>
                      <Highlighter size={14} />
                    </button>
                    <button className="rw-overflow-item" aria-label="Toggle Bookmark" role="menuitem" onClick={() => { bookmarkState.toggleBookmark(pageNumber); setIsOverflowOpen(false); }}>
                      <span>Bookmark</span>
                      <BookmarkIcon size={14} fill={bookmarkState.isPageBookmarked(pageNumber) ? "currentColor" : "none"} />
                    </button>

                    <div style={{ height: "1px", background: "var(--rw-border)", margin: "4px 0" }} />
                    
                    {/* Environment */}
                    <div style={{ padding: "4px 8px", fontSize: 11, color: "var(--rw-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Environment</div>
                    <button className="rw-overflow-item" aria-label="Enable Focus Mode" role="menuitem" onClick={() => { setIsFocusMode(true); setShowFocusHint(true); setActiveTab(null); setIsOverflowOpen(false); }}>
                      <span>Focus Mode</span>
                      <Lock size={14} />
                    </button>
                    <button className="rw-overflow-item" aria-label="Change Theme" role="menuitem" onClick={() => { setIsAppearanceOpen(true); setIsOverflowOpen(false); }}>
                      <span>Theme</span>
                      <Palette size={14} />
                    </button>

                    <div style={{ height: "1px", background: "var(--rw-border)", margin: "4px 0" }} />

                    <button className="rw-overflow-item" aria-label="Close Document" role="menuitem" onClick={() => { setIsOverflowOpen(false); onRemove(); }} style={{ color: "var(--rw-danger)" }}>
                      <span>Close Document</span>
                      <FileX size={14} />
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              {/* DESKTOP LAYOUT: Full toolbar */}
              {/* LEFT — page navigation */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <ToolbarIconBtn onClick={onPrev} disabled={pageNumber <= 1} title="Previous page (←)"><ChevronLeft size={16} /></ToolbarIconBtn>
                <PageJumpInput pageNumber={pageNumber} numPages={numPages || 1} onChange={onPageChange} />
                <ToolbarIconBtn onClick={onNext} disabled={pageNumber >= numPages} title="Next page (→)"><ChevronRight size={16} /></ToolbarIconBtn>
              </div>

              {/* CENTER — fit + zoom */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <FitControls fitMode={fitMode} onFitPage={handleFitPage} onFitWidth={handleFitWidth} />
                <Divider />
                <ToolbarIconBtn onClick={handleZoomOut} title="Zoom out"><ZoomOut size={16} /></ToolbarIconBtn>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "var(--rw-text-secondary)", minWidth: 38, textAlign: "center", letterSpacing: "0.01em", cursor: "default", userSelect: "none" }}>
                  {Math.round(scale * 100)}%
                </span>
                <ToolbarIconBtn onClick={handleZoomIn} title="Zoom in"><ZoomIn size={16} /></ToolbarIconBtn>
              </div>

              {/* RIGHT — progress + actions */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <ReadingProgress progressPct={progressPct} showBadge={true} />
                <Divider />
                <ToolbarIconBtn onClick={() => bookmarkState.toggleBookmark(pageNumber)} title={bookmarkState.isPageBookmarked(pageNumber) ? "Remove bookmark (Ctrl+B)" : "Bookmark this page (Ctrl+B)"}>
                  {bookmarkState.isPageBookmarked(pageNumber) ? <BookmarkSolid style={{ width: 16, height: 16 }} /> : <BookmarkOutline style={{ width: 16, height: 16 }} />}
                </ToolbarIconBtn>
                <ToolbarIconBtn onClick={onUploadClick} title="Upload new PDF"><UploadCloud size={16} /></ToolbarIconBtn>
                <ToolbarIconBtn onClick={onRemove} title="Close document" danger><FileX size={16} /></ToolbarIconBtn>
                <ToolbarIconBtn onClick={() => { setIsFocusMode(true); setShowFocusHint(true); setActiveTab(null); }} title="Focus Mode"><Lock size={16} /></ToolbarIconBtn>
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
        : "var(--rw-border)";

  const color = disabled
    ? "rgba(255,255,255,0.15)"
    : hovered && danger ? "#e07060"
      : hovered ? "var(--rw-text-primary)"
        : "var(--rw-text-muted)";

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
    background: "var(--rw-border)",
    flexShrink: 0, margin: "0 2px",
  }} />
);

export default ReaderLayout;