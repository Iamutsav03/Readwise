// features/pdf-viewer/components/ReaderContent.jsx
import React, { useCallback } from "react";
import PDFViewer from "../../../components/PDFViewer";
import { useSwipeNavigation } from "../hooks/useSwipeNavigation";

export const ReaderContent = ({
  scrollHostRef,
  viewerRef,
  selectionInfo,
  handleColorPick,
  handleToolbarAction,
  clearSelection,
  handleDictClose,
  dictPopupOpen,
  dictionary,
  handleDictSave,
  handleDictExplainFurther,
  pdf,
  pageNumber,
  scale,
  fitMode,
  onPageChange,
  onScaleChange,
  onNumPagesChange,
  customTextRenderer,
  searchState,
  highlightState,
  focusedHighlightId,
  bottomSheetHeightPct,
  notesState,
  activeNoteId,
  hoveredNoteId,
  setActiveTab,
  setActiveNoteId,
  setHoveredNoteId,
  isFocusMode,
  // Swipe guard — true when a bottom sheet / modal is open
  isBottomSheetOpen = false,
  onPrev,
  onNext,
  numPages = 0,
}) => {
  // Block native context menu inside the PDF area to prevent it
  // stealing focus from our custom selection toolbar
  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
  }, []);

  // Swipe navigation (mobile only — hook is a no-op when enabled=false)
  useSwipeNavigation({
    containerRef: scrollHostRef,
    onPrev,
    onNext,
    isBlocked: isBottomSheetOpen || !!selectionInfo,
    enabled: true, // hook checks touch capability
    pageNumber,
    numPages,
  });

  const memoizedPageHighlights = React.useMemo(
    () => highlightState.highlightsForPage(pageNumber),
    [highlightState.highlights, pageNumber]
  );

  const memoizedPageNotes = React.useMemo(
    () => notesState.notes.filter((n) => n.pageNumber === pageNumber),
    [notesState.notes, pageNumber]
  );

  return (
    <div
      ref={scrollHostRef}
      onContextMenu={handleContextMenu}
      style={{
        flex: 1,
        minWidth: 0,
        overflowX: "auto",
        overflowY: "auto",
        display: "block",
        position: "relative",
        // Allow vertical panning, reserve horizontal for swipe gestures
        touchAction: "pan-y",
        // Prevent accidental browser back-swipe gesture
        overscrollBehaviorX: "none",
      }}
      className="custom-scrollbar"
    >
      <PDFViewer
        ref={viewerRef}
        scrollHostRef={scrollHostRef}
        fitMode={fitMode}
        pdf={pdf}
        pageNumber={pageNumber}
        scale={scale}
        numPages={numPages}
        hideHeader={true}
        onPageChange={onPageChange}
        onScaleChange={onScaleChange}
        onNumPagesChange={onNumPagesChange}
        customTextRenderer={customTextRenderer}
        searchQuery={searchState.query}
        pageHighlights={memoizedPageHighlights}
        focusedHighlightId={focusedHighlightId}
        bottomSheetHeightPct={bottomSheetHeightPct}
        pageNotes={memoizedPageNotes}
        activeNoteId={activeNoteId}
        hoveredNoteId={hoveredNoteId}
        onNoteMarkerClick={(id) => {
          setActiveTab("notes");
          setTimeout(() => setActiveNoteId(id), 120);
        }}
        onHoverNoteChange={(id, isHovered) => setHoveredNoteId(isHovered ? id : null)}
        onUpdateNote={notesState.updateNote}
        isFocusMode={isFocusMode}
      />
    </div>
  );
};

export default ReaderContent;
