// features/pdf-viewer/components/PDFCanvasLayer.jsx
// v2: Tracks text layer readiness via a MutationObserver on the page wrapper.
// Passes textLayerReady + pageEl to PDFHighlightLayer to eliminate the race condition.
import React, { useRef, useState, useEffect } from "react";
import { Page } from "react-pdf";
import PDFHighlightLayer from "./PDFHighlightLayer";
import NoteMarker from "../../../features/notes/components/NoteMarker";

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
  const [hasRendered, setHasRendered] = useState(false);
  const [textLayerReady, setTextLayerReady] = useState(false);
  const wrapperRef = useRef(null);

  const handleRenderSuccess = (page) => {
    setHasRendered(true);
    onPageRenderSuccess(page, pageData.id);
  };

  // Watch for the text layer to appear in the DOM after page renders
  useEffect(() => {
    if (!hasRendered || !wrapperRef.current) return;

    // The text layer might already be there synchronously after a render
    const existing = wrapperRef.current.querySelector(".react-pdf__Page__textContent");
    if (existing && existing.childNodes.length > 0) {
      setTextLayerReady(true);
      return;
    }

    // Otherwise observe for it
    const observer = new MutationObserver(() => {
      const el = wrapperRef.current && wrapperRef.current.querySelector(".react-pdf__Page__textContent");
      if (el && el.childNodes.length > 0) {
        setTextLayerReady(true);
        observer.disconnect();
      }
    });

    observer.observe(wrapperRef.current, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [hasRendered]);

  // Reset text layer readiness when page changes
  useEffect(() => {
    setTextLayerReady(false);
    setHasRendered(false);
  }, [pageData.page]);

  const isSizingLayer = isCurrent ? isCurrentRendered || !isPrev : isPrev && !isCurrentRendered;
  let className = "pdf-page-layer";
  let style = {
    position: isSizingLayer ? "relative" : "absolute",
    top: 0, left: 0, width: "100%", height: "100%",
    opacity: 1,
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
      ref={wrapperRef}
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
        textLayerReady={textLayerReady}
        pageEl={wrapperRef.current}
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
