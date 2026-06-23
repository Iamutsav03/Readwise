// features/pdf-viewer/components/PDFCanvasLayer.jsx
import React from "react";
import { Page } from "react-pdf";
import PDFHighlightLayer from "./PDFHighlightLayer";
import NoteMarker from "../../../features/notes/components/NoteMarker";

/**
 * PDFCanvasLayer manages the rendering of a single PDF page using react-pdf,
 * along with its superimposed highlight and note marker layers.
 * 
 * (Note: react-pdf's Page component internally handles both canvas and text layers.
 *  This component serves as the unified page layer wrapper).
 */
const PDFCanvasLayer = ({
  pageData,
  isCurrent,
  isPrev,
  transitionDir,
  isCurrentRendered,
  scale,
  searchQuery,
  customTextRenderer,
  onPageRenderSuccess,
  handleAnimationEnd,
  pageHighlights,
  focusedHighlightId,
  pageNotes,
  activeNoteId,
  hoveredNoteId,
  onNoteMarkerClick,
  onHoverNoteChange,
  onUpdateNote,
}) => {
  const [hasRendered, setHasRendered] = React.useState(false);

  const handleRenderSuccess = (page) => {
    setHasRendered(true);
    onPageRenderSuccess(page, pageData.id);
  };

  const isSizingLayer = isCurrent ? isCurrentRendered || !isPrev : isPrev && !isCurrentRendered;
  let className = "pdf-page-layer";
  let style = {
    position: isSizingLayer ? "relative" : "absolute",
    top: 0, left: 0, width: "100%", height: "100%",
    opacity: 1, // Keep visible to show loading state
  };

  if (isPrev && transitionDir === 1) {
    if (isCurrentRendered) {
      className += " on-top slide-out-left";
    } else {
      className += " on-top";
    }
    style.zIndex = 2;
  } else if (isCurrent && transitionDir === 1) {
    style.zIndex = 1;
  } else if (isPrev && transitionDir === -1) {
    style.zIndex = 1;
  } else if (isCurrent && transitionDir === -1) {
    if (isCurrentRendered) {
      className += " on-top slide-in-left";
    } else {
      className += " on-top pre-slide-in-left";
    }
    style.zIndex = 2;
  } else {
    style.zIndex = 1;
  }

  return (
    <div
      className={className}
      style={style}
      onAnimationEnd={() => handleAnimationEnd(pageData.id)}
    >
      <Page
        key={`pdf-page-${pageData.id}__q-${(searchQuery || "").trim().toLowerCase()}`}
        pageNumber={pageData.page}
        scale={scale}
        renderAnnotationLayer={false}
        renderTextLayer={true}
        onRenderSuccess={handleRenderSuccess}
        customTextRenderer={customTextRenderer}
        loading={hasRendered ? null : (
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(90deg, var(--rw-app-bg) 0%, var(--rw-card-bg) 50%, var(--rw-app-bg) 100%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s infinite linear",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 10
          }}>
            <div className="animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600 w-8 h-8" />
          </div>
        )}
      />
      <PDFHighlightLayer
        highlights={pageHighlights}
        scale={scale}
        focusedHighlightId={focusedHighlightId}
      />
      <div
        style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          pointerEvents: "none", zIndex: 30,
        }}
      >
        {pageNotes.map((note) => (
          <NoteMarker
            key={note._id}
            note={note}
            isActive={activeNoteId === note._id}
            isHovered={hoveredNoteId === note._id}
            onClick={onNoteMarkerClick}
            onHoverChange={onHoverNoteChange}
            onUpdateNote={onUpdateNote}
          />
        ))}
      </div>
    </div>
  );
};

export default PDFCanvasLayer;
