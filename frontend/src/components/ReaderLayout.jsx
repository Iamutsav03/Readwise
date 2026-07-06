// src/components/ReaderLayout.jsx
import React, { useCallback, useRef, useState, useEffect } from "react";
import { LockOpen } from "lucide-react";
import { useReadingProgress } from "../features/pdf-viewer/hooks/useReadingProgress";
import { useLastReadPosition } from "../features/pdf-viewer/hooks/useLastReadPosition";
import { usePdfSearch } from "../features/pdf-viewer/hooks/usePdfSearch";
import { useBookmarks } from "../features/pdf-viewer/hooks/useBookmarks";
import { useKeyboardShortcuts } from "../features/pdf-viewer/hooks/useKeyboardShortcuts";
import { useSearchHighlight } from "../features/pdf-viewer/hooks/useSearchHighlight";
import { useHighlights } from "../features/pdf-viewer/hooks/useHighlights";
import { useHighlightHistory } from "../features/pdf-viewer/hooks/useHighlightHistory";
import { useTextSelection } from "../features/ai/hooks/useTextSelection";
import { useNotes } from "../features/notes/hooks/useNotes";
import { useDictionary } from "../features/dictionary/hooks/useDictionary";
import { getSelectionRects } from "../utils/highlightHelpers";
import { useBreakpoints } from "../hooks/useBreakpoints";
import { usePerformanceMetrics } from "../hooks/usePerformanceMetrics";
import AppearanceModal from "../features/themes/components/AppearanceModal";
import ReaderSidebar from "../features/pdf-viewer/components/ReaderSidebar";
import ReaderToolbar from "../features/pdf-viewer/components/ReaderToolbar";
import ReaderContent from "../features/pdf-viewer/components/ReaderContent";
import ReadingMode from "../features/pdf-viewer/components/ReadingMode";
import SelectionToolbar from "../features/ai/components/SelectionToolbar";
import DictionaryPopup from "../features/dictionary/components/DictionaryPopup";

const ReaderLayout = ({
  pdf, viewerRef, pageNumber, numPages, scale,
  onPageChange, onScaleChange, onNumPagesChange,
  onRemove, onUploadClick, onPrev, onNext,
  onZoomIn, onZoomOut, onFit, fileInputRef, onFileChange,
}) => {
  const scrollHostRef = useRef(null);
  const selectionHostRef = useRef(null);
  const { isMobileOrSmaller: isMobile } = useBreakpoints();
  const [fitMode, setFitMode] = useState(() => {
    const saved = localStorage.getItem("rw_fit_mode");
    return (saved && saved !== "null") ? saved : (isMobile ? "width" : "page");
  });
  const [initialExplainContext, setInitialExplainContext] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const [focusedHighlightId, setFocusedHighlightId] = useState(null);
  const [bottomSheetHeightPct, setBottomSheetHeightPct] = useState(0);
  const [isOverflowOpen, setIsOverflowOpen] = useState(false);

  const [isFocusMode, setIsFocusMode] = useState(() => {
    const saved = localStorage.getItem("rw_focus_mode");
    return saved !== null ? saved === "true" : isMobile;
  });
  
  const [viewMode, setViewMode] = useState(() => {
    const saved = localStorage.getItem("rw_view_mode");
    if (isMobile) return "reading"; // mobile defaults to reading mode
    return saved || "pdf";
  });
  
  const [readingSettings, setReadingSettings] = useState(() => {
    const saved = localStorage.getItem("rw_reading_settings");
    return saved ? JSON.parse(saved) : { fontSize: 16, lineSpacing: 1.6, contentWidth: "700px" };
  });

  const [isAppearanceOpen, setIsAppearanceOpen] = useState(false);
  const [showFocusHint, setShowFocusHint] = useState(false);

  useEffect(() => { localStorage.setItem("rw_fit_mode", fitMode); }, [fitMode]);
  useEffect(() => { localStorage.setItem("rw_focus_mode", isFocusMode); }, [isFocusMode]);
  useEffect(() => { localStorage.setItem("rw_view_mode", viewMode); }, [viewMode]);
  useEffect(() => { localStorage.setItem("rw_reading_settings", JSON.stringify(readingSettings)); }, [readingSettings]);

  // Fallback from split view if resized to mobile
  useEffect(() => {
    if (isMobile && viewMode === "split") {
      setViewMode("reading");
    }
  }, [isMobile, viewMode]);

  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === "Escape" && isFocusMode) setIsFocusMode(false); };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFocusMode]);

  useEffect(() => {
    let timer;
    if (showFocusHint) timer = setTimeout(() => setShowFocusHint(false), 3000);
    return () => clearTimeout(timer);
  }, [showFocusHint]);

  const highlightState = useHighlights(pdf?._id);
  const history = useHighlightHistory(pdf?._id, highlightState.setHighlights);
  const { selectionInfo, clearSelection, restoreSelection } = useTextSelection(selectionHostRef);
  const [dictPopupOpen, setDictPopupOpen] = useState(false);
  const dictionary = useDictionary(pdf?._id);

  useEffect(() => {
    setDictPopupOpen(false);
    dictionary.clear();
  }, [selectionInfo?.text]); // reset only when selection text changes — not on every render

  const searchState = usePdfSearch(pdf?._id);
  const customTextRenderer = useSearchHighlight(searchState.query);
  const bookmarkState = useBookmarks(pdf?._id);
  const notesState = useNotes(pdf?._id);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [hoveredNoteId, setHoveredNoteId] = useState(null);

  const { MetricsOverlay } = usePerformanceMetrics({
    highlights: highlightState.highlights,
    notes: notesState.notes,
    pdfRenderCount: 0 // Cannot easily lift canvas render counts without refs, will leave 0 for now
  });

  useEffect(() => { if (activeTab !== "notes") setActiveNoteId(null); }, [activeTab]);

  useKeyboardShortcuts({
    onPrev, onNext, onToggleBookmark: () => bookmarkState.toggleBookmark(pageNumber),
    setActiveTab, undoHighlight: history.undo, redoHighlight: history.redo,
  });

  useLastReadPosition({
    pdfId: pdf?._id, pageNumber, numPages, scale, activeTab,
    onPageChange, onScaleChange, onActiveTabChange: setActiveTab,
  });

  const { progressPct } = useReadingProgress({ pageNumber, numPages });

  const handleFitPage = useCallback(() => { setFitMode("page"); viewerRef.current?.fitToScreen(); onFit?.(); }, [viewerRef, onFit]);
  useEffect(() => { if (isMobile && fitMode === "page") viewerRef.current?.fitToScreen(); }, [bottomSheetHeightPct, isMobile, fitMode, viewerRef]);

  const handleFitWidth = useCallback(() => { setFitMode("width"); viewerRef.current?.fitToWidth(); }, [viewerRef]);
  const handleZoomIn = useCallback(() => { setFitMode(null); onZoomIn(); }, [onZoomIn]);
  const handleZoomOut = useCallback(() => { setFitMode(null); onZoomOut(); }, [onZoomOut]);
  const handleJumpToPage = useCallback((page) => onPageChange(page), [onPageChange]);

  const handleColorPick = async (color) => {
    if (!selectionInfo) return;
    const rects = getSelectionRects(selectionInfo.range, selectionInfo.pageEl);
    try {
      const savedHighlight = await highlightState.addHighlight(
        selectionInfo.pageNumber, 
        selectionInfo.text, 
        color, 
        rects,
        selectionInfo.textQuote || selectionInfo.text,
        selectionInfo.startOffset,
        selectionInfo.endOffset
      );
      history.pushAction({ type: "add", highlight: savedHighlight });
    } catch (err) { console.error("Failed to add highlight", err); }
    clearSelection();
  };

  const handleToolbarAction = useCallback(async (action) => {
    if (!selectionInfo) return;
    const { text, pageNumber: pageNum, textQuote, startOffset, endOffset } = selectionInfo;

    if (action === "meaning") {
      dictionary.lookup(text, pageNum);
      setDictPopupOpen(true);
      return;
    }
    
    if (action === "quick_explain") {
      dictionary.quickExplain(text, pageNum);
      setDictPopupOpen(true);
      return;
    }

    // Create a text-anchored note from the selection
    if (action === "note") {
      try {
        await notesState.createNote(pageNum, {
          content: `"${text}"`,
          textQuote: textQuote || text,
          startOffset,
          endOffset,
        });
        setActiveTab("notes");
      } catch (err) {
        console.error("Failed to create note from selection:", err);
      }
      clearSelection();
      return;
    }

    const mode = action === "deep_explain" ? "deep" : "summary";
    setInitialExplainContext({ text, pageNumber: pageNum, mode, timestamp: Date.now() });
    setActiveTab("ai");
    clearSelection();
    setDictPopupOpen(false);
  }, [selectionInfo, clearSelection, setActiveTab, dictionary, notesState]);

  const handleDictClose = useCallback(() => { setDictPopupOpen(false); dictionary.clear(); }, [dictionary]);
  const handleDictSave = useCallback(() => { 
    if (dictionary.result) {
      const sourceType = dictionary.result.source === "ai" && !dictionary.result.partOfSpeech ? "quick_meaning" : "dictionary";
      dictionary.save(dictionary.result, sourceType); 
    }
  }, [dictionary]);
  const handleDictExplainFurther = useCallback(() => {
    if (!selectionInfo && !dictionary.result) return;
    setInitialExplainContext({ text: dictionary.result?.word || selectionInfo?.text, pageNumber: selectionInfo?.pageNumber, timestamp: Date.now() });
    setActiveTab("ai");
    setDictPopupOpen(false);
    clearSelection();
  }, [selectionInfo, dictionary, clearSelection, setActiveTab]);

  const handleHighlightFocus = useCallback((id) => {
    setFocusedHighlightId(id);
    setTimeout(() => setFocusedHighlightId(null), 2000);
  }, []);

  const handleHighlightDelete = useCallback(async (id) => {
    try {
      const removed = await highlightState.removeHighlight(id);
      if (removed) history.pushAction({ type: "remove", highlight: removed });
    } catch (err) { console.error("Failed to delete highlight", err); }
  }, [highlightState, history]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", width: "100%", maxWidth: "100%", overflow: "hidden", backgroundColor: "var(--rw-reader-bg)" }}>
      <MetricsOverlay />
      <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={onFileChange} />

      {isFocusMode && (
        <div style={{ position: "absolute", top: 16, right: 16, zIndex: 100, display: "flex", gap: 8, alignItems: "center" }}>
          {showFocusHint && (
            <div style={{ background: "var(--rw-card-bg)", color: "var(--rw-text-primary)", padding: "6px 12px", borderRadius: 8, fontSize: 13, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", border: "1px solid var(--rw-border)", fontFamily: "'DM Sans', sans-serif", opacity: 0.9 }}>
              Press ESC to exit Focus Mode
            </div>
          )}
          <button onClick={() => setIsFocusMode(false)} title="Exit Focus Mode (ESC)" style={{ background: "var(--rw-card-bg)", color: "var(--rw-text-primary)", border: "1px solid var(--rw-border)", borderRadius: 8, padding: "8px 12px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 13, display: "flex", alignItems: "center", gap: 6, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
            <LockOpen size={16} /> Exit
          </button>
        </div>
      )}

      <div ref={selectionHostRef} style={{ display: "flex", flexDirection: "row", flex: 1, minHeight: 0, overflow: "hidden" }}>
        {(viewMode === "pdf" || viewMode === "split") && (
          <ReaderContent 
            scrollHostRef={scrollHostRef} viewerRef={viewerRef}
            selectionInfo={selectionInfo} handleColorPick={handleColorPick} handleToolbarAction={handleToolbarAction} clearSelection={clearSelection}
            handleDictClose={handleDictClose} dictPopupOpen={dictPopupOpen} dictionary={dictionary} handleDictSave={handleDictSave} handleDictExplainFurther={handleDictExplainFurther}
            pdf={pdf} pageNumber={pageNumber} scale={scale} fitMode={fitMode}
            onPageChange={onPageChange} onScaleChange={onScaleChange} onNumPagesChange={onNumPagesChange}
            customTextRenderer={customTextRenderer} searchState={searchState} highlightState={highlightState} focusedHighlightId={focusedHighlightId} bottomSheetHeightPct={bottomSheetHeightPct}
            notesState={notesState} activeNoteId={activeNoteId} hoveredNoteId={hoveredNoteId}
            setActiveTab={setActiveTab} setActiveNoteId={setActiveNoteId} setHoveredNoteId={setHoveredNoteId} isFocusMode={isFocusMode}
            // Swipe navigation props
            onPrev={onPrev} onNext={onNext} numPages={numPages}
            isBottomSheetOpen={activeTab !== null}
          />
        )}
        
        {/* Split View Divider */}
        {viewMode === "split" && (
          <div style={{ width: "1px", background: "var(--rw-border)", zIndex: 10 }} />
        )}

        {(viewMode === "reading" || viewMode === "split") && (
          <ReadingMode
            pdf={pdf}
            pageNumber={pageNumber}
            onPageChange={onPageChange}
            readingSettings={readingSettings}
            setReadingSettings={setReadingSettings}
            highlightState={highlightState}
            notesState={notesState}
            activeNoteId={activeNoteId}
            hoveredNoteId={hoveredNoteId}
            setActiveNoteId={setActiveNoteId}
            setHoveredNoteId={setHoveredNoteId}
            setActiveTab={setActiveTab}
            // Swipe navigation props
            onPrev={onPrev} onNext={onNext} numPages={numPages}
            isBottomSheetOpen={activeTab !== null}
          />
        )}

        {/* Global floating components tied to selectionHostRef */}
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
        
        <ReaderSidebar
          pdfId={pdf?._id} pageNumber={pageNumber} numPages={pdf?.numPages}
          onJump={handleJumpToPage} activeTab={activeTab} setActiveTab={setActiveTab}
          searchState={searchState} bookmarkState={bookmarkState}
          highlightState={{ ...highlightState, removeHighlight: handleHighlightDelete }}
          onHighlightFocus={handleHighlightFocus} onBottomSheetHeightChange={setBottomSheetHeightPct}
          notesState={notesState} activeNoteId={activeNoteId} onSetActiveNote={setActiveNoteId}
          hoveredNoteId={hoveredNoteId} onHoverNoteChange={(id, isHovered) => setHoveredNoteId(isHovered ? id : null)}
          isFocusMode={isFocusMode} initialExplainContext={initialExplainContext} clearInitialExplainContext={() => setInitialExplainContext(null)}
        />
      </div>

      <AppearanceModal isOpen={isAppearanceOpen} onClose={() => setIsAppearanceOpen(false)} />

      {isFocusMode && isMobile && (
        <button onClick={() => setIsFocusMode(false)} style={{ position: "absolute", top: "max(16px, env(safe-area-inset-top, 16px))", right: "max(16px, env(safe-area-inset-right, 16px))", zIndex: 9999, background: "var(--rw-panel-bg)", border: "1px solid var(--rw-border)", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", color: "var(--rw-text-primary)", padding: "8px 12px", borderRadius: "20px", display: "flex", alignItems: "center", gap: "6px", fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}>
          <LockOpen size={16} /> Exit Focus
        </button>
      )}

      <ReaderToolbar 
        isMobile={isMobile} isFocusMode={isFocusMode} progressPct={progressPct} pageNumber={pageNumber} numPages={numPages} scale={scale} fitMode={fitMode}
        onPrev={onPrev} onNext={onNext} onPageChange={onPageChange} handleZoomIn={handleZoomIn} handleZoomOut={handleZoomOut} handleFitWidth={handleFitWidth} handleFitPage={handleFitPage}
        setIsFocusMode={setIsFocusMode} setShowFocusHint={setShowFocusHint} setActiveTab={setActiveTab}
        bookmarkState={bookmarkState} onUploadClick={onUploadClick} onRemove={onRemove}
        isOverflowOpen={isOverflowOpen} setIsOverflowOpen={setIsOverflowOpen} setIsAppearanceOpen={setIsAppearanceOpen}
        viewMode={viewMode} setViewMode={setViewMode} readingSettings={readingSettings} setReadingSettings={setReadingSettings}

      />
    </div>
  );
};

export default ReaderLayout;