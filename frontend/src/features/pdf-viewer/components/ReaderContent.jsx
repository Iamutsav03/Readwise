// features/pdf-viewer/components/ReaderContent.jsx
import React from "react";
import PDFViewer from "../../../components/PDFViewer";
import SelectionToolbar from "../../../features/ai/components/SelectionToolbar";
import DictionaryPopup from "../../../features/dictionary/components/DictionaryPopup";

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
}) => {
  return (
    <div
      ref={scrollHostRef}
      style={{
        flex: 1, minWidth: 0, overflowX: "auto", overflowY: "auto", display: "block", position: "relative",
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
