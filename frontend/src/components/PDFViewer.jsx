// src/components/PDFViewer.jsx
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { getPDFViewURL } from "../utils/api";
import HighlightOverlayLayer from "./highlights/HighlightOverlayLayer";
import NoteMarker from "../features/notes/components/NoteMarker";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

/**
 * PDFViewer (controlled component)
 * ─────────────────────────────────
 * Props: (unchanged from original)
 *   pdf, pageNumber, scale, hideHeader,
 *   onPageChange, onScaleChange, onNumPagesChange
 *
 * Ref — now exposes TWO methods:
 *   fitToScreen()  – fit full page into viewport (height-constrained)
 *   fitToWidth()   – fit page width to available container width
 *
 * Both read the same pageWidthRef / pageHeightRef captured on render.
 */
const PDFViewer = forwardRef(function PDFViewer(
  {
    pdf,
    pageNumber,
    scale,
    hideHeader = false,
    onPageChange,
    onScaleChange,
    onNumPagesChange,
    customTextRenderer,
    searchQuery,
    pageHighlights,
    focusedHighlightId,
    bottomSheetHeightPct = 0,
    pageNotes = [],
    activeNoteId = null,
    hoveredNoteId = null,
    onNoteMarkerClick = () => {},
    onHoverNoteChange = () => {},
    onUpdateNote = () => {},
  },
  ref
) {
  const containerRef = useRef(null);
  const pageWidthRef = useRef(0);
  const pageHeightRef = useRef(0);
  const isInitialLoad = useRef(true);

  // ── Page Stack for Flip Animation ─────────────────────────────────────────
  const [pageStack, setPageStack] = useState([
    { page: pageNumber, id: Date.now(), dir: 0, rendered: false }
  ]);

  useEffect(() => {
    isInitialLoad.current = true;
    setPageStack([{ page: pageNumber, id: Date.now(), dir: 0, rendered: false }]);
  }, [pdf.fileName]);

  useEffect(() => {
    setPageStack(prev => {
      const curr = prev[prev.length - 1];
      if (curr.page === pageNumber) return prev;
      
      const dir = pageNumber > curr.page ? 1 : -1;
      return [...prev.slice(-1), { page: pageNumber, id: Date.now(), dir, rendered: false }];
    });
  }, [pageNumber]);

  const handleAnimationEnd = (id) => {
    setPageStack(prev => {
      const isCurrent = prev[prev.length - 1].id === id;
      if (isCurrent) {
        // Reset dir to 0 so we don't re-trigger animation, and keep only current
        return [{ ...prev[prev.length - 1], dir: 0 }];
      }
      return prev;
    });
  };

  const pdfURL = getPDFViewURL(pdf.fileName);

  // ── Fit Page (height + width constrained) ────────────────────────────────
  const fitToScreen = useCallback(() => {
    if (!pageWidthRef.current || !pageHeightRef.current) return;
    const scrollHost = containerRef.current?.parentElement;
    if (!scrollHost) return;

    // scrollHost.clientHeight is already the correct available height
    // (window.innerHeight minus the actual rendered footer).
    // On mobile, the bottom sheet is an absolute overlay ON TOP of the scroll host,
    // so we subtract its pixel height so Fit Page fits in the visible area above the sheet.
    const isMobile = window.innerWidth <= 768;
    const sheetPx = isMobile
      ? (bottomSheetHeightPct / 100) * window.innerHeight
      : 0;

    const availH = scrollHost.clientHeight - sheetPx - 4; // 4px sub-pixel margin
    const availW = scrollHost.clientWidth * 0.95; // breathing margin

    const heightScale = availH / pageHeightRef.current;
    const widthScale = availW / pageWidthRef.current;
    const newScale = Math.min(heightScale, widthScale);
    onScaleChange(Math.max(0.5, Math.min(parseFloat(newScale.toFixed(3)), 3.0)));
  }, [onScaleChange, bottomSheetHeightPct]);

  // ── Fit Width (width-only constrained) ───────────────────────────────────
  const fitToWidth = useCallback(() => {
    if (!pageWidthRef.current) return;
    const scrollHost = containerRef.current?.parentElement;
    if (!scrollHost) return;

    // Use 98% of the scroll-host's client width for a small breathing margin.
    const availW = scrollHost.clientWidth * 0.98;
    const newScale = availW / pageWidthRef.current;
    onScaleChange(Math.max(0.5, Math.min(parseFloat(newScale.toFixed(3)), 3.0)));
  }, [onScaleChange]);

  // ── Expose both methods via ref ───────────────────────────────────────────
  useImperativeHandle(ref, () => ({ fitToScreen, fitToWidth }), [
    fitToScreen,
    fitToWidth,
  ]);

  // Re-fit on window resize (respects whichever mode the toolbar last set)
  useEffect(() => {
    window.addEventListener("resize", fitToScreen);
    return () => window.removeEventListener("resize", fitToScreen);
  }, [fitToScreen]);

  // ── Document load ─────────────────────────────────────────────────────────
  const onDocumentLoadSuccess = ({ numPages }) => {
    onNumPagesChange(numPages);
    if (pageNumber > numPages) onPageChange(1);
  };

  // ── Page render success ───────────────────────────────────────────────────
  const onPageRenderSuccess = (page, id) => {
    const vp = page.getViewport({ scale: 1 });
    pageWidthRef.current = vp.width;
    pageHeightRef.current = vp.height;

    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      fitToScreen();
    }

    setPageStack(prev => prev.map(p => p.id === id ? { ...p, rendered: true } : p));
  };

  // ── Zoom wheel shortcut (ctrl/meta + scroll) ──────────────────────────────
  useEffect(() => {
    const onWheel = (e) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const step = 0.25;
      if (e.deltaY > 0) {
        onScaleChange((s) => parseFloat(Math.max(s - step, 0.5).toFixed(3)));
      } else {
        onScaleChange((s) => parseFloat(Math.min(s + step, 15.0).toFixed(3)));
      }
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", onWheel);
    };
  }, [onScaleChange]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      style={{
        width: "fit-content",
        minWidth: "fit-content",
        margin: "0 auto",
        backgroundColor: "#000",
        padding: "16px 0 18px 0",
      }}
    >
      <style>{`
        .pdf-page-layer {
          background: #fff;
          transition: opacity 0.2s;
        }
        .pdf-page-layer.on-top {
          box-shadow: 4px 0 16px rgba(0,0,0,0.15);
        }
        .slide-out-left {
          animation: slideOutLeft 0.35s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .slide-in-left {
          animation: slideInLeft 0.35s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        @keyframes slideOutLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-102%); }
        }
        @keyframes slideInLeft {
          0% { transform: translateX(-102%); }
          100% { transform: translateX(0); }
        }
      `}</style>

      <Document
        file={pdfURL}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={
          <div
            className="flex items-center justify-center"
            style={{ width: "100vw", height: "calc(100vh - 56px)" }}
          >
            <div className="animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600 w-12 h-12" />
          </div>
        }
        error={
          <div
            className="flex items-center justify-center text-red-500 text-sm"
            style={{ width: "100vw", height: "calc(100vh - 56px)" }}
          >
            Failed to load PDF.
          </div>
        }
      >
        <div
          style={{
            display: "block",
            width: "fit-content",
            minWidth: "fit-content",
            margin: "0 auto",
            position: "relative",
            overflowX: "hidden", // Prevents horizontal flicker during animation
          }}
        >
          {pageStack.map((p, i) => {
            const isCurrent = i === pageStack.length - 1;
            const isPrev = i === pageStack.length - 2;
            const currentDir = pageStack[pageStack.length - 1].dir;
            const newPageRendered = pageStack[pageStack.length - 1].rendered;

            let className = "pdf-page-layer";
            let style = {
              position: isCurrent ? "relative" : "absolute",
              top: 0, left: 0, width: "100%", height: "100%",
              opacity: p.rendered ? 1 : 0,
            };

            if (isPrev && currentDir === 1 && newPageRendered) {
              // Going next: old page slides out to the left
              className += " on-top slide-out-left";
              style.zIndex = 2;
            } else if (isCurrent && currentDir === 1) {
              // Going next: new page static beneath
              style.zIndex = 1;
            } else if (isPrev && currentDir === -1) {
              // Going prev: old page static beneath
              style.zIndex = 1;
              style.opacity = 1; // Keep visible even if new page not ready
            } else if (isCurrent && currentDir === -1 && newPageRendered) {
              // Going prev: new page slides in from the left
              className += " on-top slide-in-left";
              style.zIndex = 2;
            } else {
              // Default (no animation or waiting)
              style.zIndex = 1;
            }

            return (
              <div
                key={p.id}
                className={className}
                style={style}
                onAnimationEnd={() => isCurrent && handleAnimationEnd(p.id)}
              >
                <Page
                  key={`pdf-page-${p.id}__q-${(searchQuery || "").trim().toLowerCase()}`}
                  pageNumber={p.page}
                  scale={scale}
                  renderAnnotationLayer={false}
                  renderTextLayer={true}
                  onRenderSuccess={(page) => onPageRenderSuccess(page, p.id)}
                  customTextRenderer={customTextRenderer}
                />
                <HighlightOverlayLayer
                  highlights={pageHighlights}
                  scale={scale}
                  focusedHighlightId={focusedHighlightId}
                />
                {/* Note markers overlay */}
                <div
                  style={{
                    position: "absolute",
                    top: 0, left: 0, right: 0, bottom: 0,
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
          })}
        </div>
      </Document>
    </div>
  );
});

export default PDFViewer;