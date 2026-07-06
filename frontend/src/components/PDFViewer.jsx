// src/components/PDFViewer.jsx
import React, { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle, useMemo } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { getPDFViewURL } from "../utils/api";
import { useBreakpoints } from "../hooks/useBreakpoints";
import PDFCanvasLayer from "../features/pdf-viewer/components/PDFCanvasLayer";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

const PDFViewer = forwardRef(function PDFViewer({
  pdf, pageNumber, scale, hideHeader = false, onPageChange, onScaleChange, onNumPagesChange,
  customTextRenderer, searchQuery, pageHighlights, focusedHighlightId, bottomSheetHeightPct = 0,
  scrollHostRef, fitMode = "page", pageNotes = [], activeNoteId = null, hoveredNoteId = null,
  onNoteMarkerClick = () => {}, onHoverNoteChange = () => {}, onUpdateNote = () => {}, isFocusMode = false,
  numPages = 0,
}, ref) {
  const containerRef = useRef(null);
  const pageWidthRef = useRef(0);
  const pageHeightRef = useRef(0);
  const { isMobileOrSmaller: isMobile } = useBreakpoints();
  const isInitialLoad = useRef(true);

  const [pageStack, setPageStack] = useState([{ page: pageNumber, id: Date.now(), dir: 0, rendered: false }]);

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
      if (prev.length <= 1) return prev;
      return [{ ...prev[prev.length - 1], dir: 0 }];
    });
  };

  const fileObj = useMemo(() => {
    const viewUrl = getPDFViewURL(pdf.fileName);
    const token = localStorage.getItem("rw_token");
    return token ? { url: viewUrl, httpHeaders: { Authorization: `Bearer ${token}` } } : viewUrl;
  }, [pdf.fileName]);

  const fitToScreen = useCallback(() => {
    if (!pageWidthRef.current || !pageHeightRef.current) return;
    const scrollHost = scrollHostRef?.current;
    if (!scrollHost) return;
    const availH = scrollHost.clientHeight;
    const availW = scrollHost.clientWidth;
    const heightScale = availH / pageHeightRef.current;
    const widthScale = availW / pageWidthRef.current;
    const newScale = Math.min(heightScale, widthScale);
    onScaleChange(Math.max(0.5, Math.min(parseFloat(newScale.toFixed(3)), 3.0)));
  }, [onScaleChange, scrollHostRef]);

  const fitToWidth = useCallback(() => {
    if (!pageWidthRef.current) return;
    const scrollHost = scrollHostRef?.current;
    if (!scrollHost) return;
    const availW = Math.min(scrollHost.clientWidth, 1600);
    const newScale = availW / pageWidthRef.current;
    onScaleChange(Math.max(0.5, Math.min(parseFloat(newScale.toFixed(3)), 3.0)));
  }, [onScaleChange, scrollHostRef]);

  useImperativeHandle(ref, () => ({ fitToScreen, fitToWidth }), [fitToScreen, fitToWidth]);

  useEffect(() => {
    const handleResize = () => fitMode === "width" ? fitToWidth() : fitToScreen();
    window.addEventListener("resize", handleResize);
    const timeoutId = setTimeout(handleResize, 50);
    return () => { window.removeEventListener("resize", handleResize); clearTimeout(timeoutId); };
  }, [fitToScreen, fitToWidth, fitMode, isFocusMode]);

  const onDocumentLoadSuccess = ({ numPages: n }) => {
    onNumPagesChange(n);
    if (pageNumber > n) onPageChange(1);
  };

  const onPageRenderSuccess = (page, id) => {
    const vp = page.getViewport({ scale: 1 });
    pageWidthRef.current = vp.width;
    pageHeightRef.current = vp.height;

    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      if (fitMode === "width") fitToWidth(); else fitToScreen();
    }

    setPageStack(prev => prev.map(p => p.id === id ? { ...p, rendered: true } : p));
  };

  const [cssScale, setCssScale] = useState(1);
  const zoomTimeout = useRef(null);
  const currentCssScaleRef = useRef(1);

  useEffect(() => {
    const onWheel = (e) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      
      const step = 0.05;
      if (e.deltaY > 0) currentCssScaleRef.current -= step;
      else currentCssScaleRef.current += step;
      currentCssScaleRef.current = Math.max(0.2, Math.min(currentCssScaleRef.current, 5.0));
      
      setCssScale(currentCssScaleRef.current);
      
      if (zoomTimeout.current) clearTimeout(zoomTimeout.current);
      zoomTimeout.current = setTimeout(() => {
        onScaleChange((s) => parseFloat(Math.max(s * currentCssScaleRef.current, 0.5).toFixed(3)));
        currentCssScaleRef.current = 1;
        setCssScale(1);
      }, 150);
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", onWheel);
      if (zoomTimeout.current) clearTimeout(zoomTimeout.current);
    };
  }, [onScaleChange]);

  // Adjacent page numbers for preloading
  const prevPreloadPage = pageNumber > 1 ? pageNumber - 1 : null;
  const nextPreloadPage = numPages && pageNumber < numPages ? pageNumber + 1 : null;
  // Use a reduced scale for preloading to save memory
  const preloadScale = Math.min(scale, 1.0);

  return (
    <div
      ref={containerRef}
      style={{
        width: "fit-content",
        minWidth: "100%",
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#000",
        padding: isFocusMode || isMobile ? "0" : "8px 0",
      }}
    >
      <style>{`
        .pdf-page-layer {
          background: transparent;
          overflow: hidden;
          will-change: opacity, transform;
        }
        .react-pdf__Page { overflow: hidden !important; background-color: transparent !important; }
        .pdf-page-layer.on-top { box-shadow: 4px 0 16px rgba(0,0,0,0.15); }

        /* Kindle-style transitions */
        .page-exit-left   { animation: pageExitToLeft   0.25s cubic-bezier(0.25,0.46,0.45,0.94) forwards; }
        .page-exit-right  { animation: pageExitToRight  0.25s cubic-bezier(0.25,0.46,0.45,0.94) forwards; }
        .page-enter-right { animation: pageEnterFromRight 0.25s cubic-bezier(0.25,0.46,0.45,0.94) forwards; }
        .page-enter-left  { animation: pageEnterFromLeft  0.25s cubic-bezier(0.25,0.46,0.45,0.94) forwards; }
        .page-pre-enter-right { opacity: 0; transform: translateX(6%) scale(0.996); }
        .page-pre-enter-left  { opacity: 0; transform: translateX(-6%) scale(0.996); }

        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      `}</style>

      <div style={{ transform: `scale(${cssScale})`, transformOrigin: "center top", willChange: "transform", transition: cssScale === 1 ? "transform 0.15s ease-out" : "none" }}>
        <Document
          file={fileObj}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex items-center justify-center" style={{ width: "100%", height: "100%", minHeight: "300px" }}>
              <div className="animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600 w-12 h-12" />
            </div>
          }
        error={
          <div className="flex flex-col items-center justify-center" style={{ width: "100%", height: "100%", minHeight: "300px", color: "var(--rw-text-primary)", textAlign: "center", padding: "20px" }}>
            <div style={{ fontSize: "3rem", marginBottom: "16px" }}>⚠️</div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "8px" }}>PDF File Not Found</h3>
            <p style={{ color: "var(--rw-text-muted)", maxWidth: "400px", fontSize: "0.95rem" }}>
              The original file for this document is missing from the server. This often happens if the server was restarted and temporary uploads were cleared.
              <br /><br />
              Please return to the Library and re-upload the PDF to continue reading.
            </p>
          </div>
        }
      >
        {/* Main page stack */}
        <div style={{
          display: "block",
          width: isMobile ? "100%" : "fit-content",
          minWidth: "fit-content",
          margin: isMobile ? "0" : "0 auto",
          position: "relative",
          overflowX: "hidden",
        }}>
          {pageStack.map((p, i) => (
            <PDFCanvasLayer
              key={p.id}
              pageData={p}
              isCurrent={i === pageStack.length - 1}
              isPrev={i === pageStack.length - 2}
              transitionDir={pageStack[pageStack.length - 1].dir}
              isCurrentRendered={pageStack[pageStack.length - 1].rendered}
              scale={scale}
              searchQuery={searchQuery}
              customTextRenderer={customTextRenderer}
              onPageRenderSuccess={onPageRenderSuccess}
              handleAnimationEnd={handleAnimationEnd}
              pageHighlights={pageHighlights}
              focusedHighlightId={focusedHighlightId}
              pageNotes={pageNotes}
              activeNoteId={activeNoteId}
              hoveredNoteId={hoveredNoteId}
              onNoteMarkerClick={onNoteMarkerClick}
              onHoverNoteChange={onHoverNoteChange}
              onUpdateNote={onUpdateNote}
            />
          ))}
        </div>

        {/* Hidden adjacent page preloaders — warm PDF.js render cache */}
        {prevPreloadPage && (
          <div
            aria-hidden="true"
            style={{ position: "absolute", width: 0, height: 0, overflow: "hidden", visibility: "hidden", pointerEvents: "none" }}
          >
            <Page
              key={`preload-prev-${prevPreloadPage}`}
              pageNumber={prevPreloadPage}
              scale={preloadScale}
              renderAnnotationLayer={false}
              renderTextLayer={false}
              loading={null}
            />
          </div>
        )}
        {nextPreloadPage && (
          <div
            aria-hidden="true"
            style={{ position: "absolute", width: 0, height: 0, overflow: "hidden", visibility: "hidden", pointerEvents: "none" }}
          >
            <Page
              key={`preload-next-${nextPreloadPage}`}
              pageNumber={nextPreloadPage}
              scale={preloadScale}
              renderAnnotationLayer={false}
              renderTextLayer={false}
              loading={null}
            />
          </div>
        )}
      </Document>
      </div>
    </div>
  );
});

export default PDFViewer;