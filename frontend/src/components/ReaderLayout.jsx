// src/components/ReaderLayout.jsx
import React, { useCallback, useRef, useState } from "react";
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
import { BookmarkIcon as BookmarkOutline } from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolid } from "@heroicons/react/24/solid";

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

  // ── Search State & Highlighting ──────────────────────────────────────────
  const searchState = usePdfSearch(pdf?._id);
  const customTextRenderer = useSearchHighlight(searchState.query);

  // ── Bookmarks State ─────────────────────────────────────────────────────
  const bookmarkState = useBookmarks(pdf?._id);

  // ── Keyboard Shortcuts ──────────────────────────────────────────────────
  useKeyboardShortcuts({
    onPrev,
    onNext,
    onToggleBookmark: () => bookmarkState.toggleBookmark(pageNumber),
    setActiveTab,
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

  // ── Wheel → horizontal scroll mapping ─────────────────────────────────
  React.useEffect(() => {
    const el = scrollHostRef.current;
    if (!el) return;
    const handleWheel = (e) => {
      if (e.ctrlKey || e.metaKey) return;
      if (el.scrollWidth > el.clientWidth) {
        e.preventDefault();
        el.scrollLeft += e.deltaY + e.deltaX;
      }
    };
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, []);

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
          }}
          className="custom-scrollbar"
        >
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
        />
      </div>

      {/* ── Toolbar ───────────────────────────────────────────────── */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        {/* Hairline progress bar at very top of toolbar */}
        <ReadingProgress progressPct={progressPct} showBadge={false} />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px",
            height: 56,
            background: "#111",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            gap: 8,
          }}
        >
          {/* LEFT — page navigation */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <ToolbarIconBtn
              onClick={onPrev}
              disabled={pageNumber <= 1}
              title="Previous page (←)"
            >‹</ToolbarIconBtn>

            <PageJumpInput
              pageNumber={pageNumber}
              numPages={numPages || 1}
              onChange={onPageChange}
            />

            <ToolbarIconBtn
              onClick={onNext}
              disabled={pageNumber >= numPages}
              title="Next page (→)"
            >›</ToolbarIconBtn>
          </div>

          {/* CENTER — fit + zoom */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <FitControls
              fitMode={fitMode}
              onFitPage={handleFitPage}
              onFitWidth={handleFitWidth}
            />
            <Divider />
            <ToolbarIconBtn onClick={handleZoomOut} title="Zoom out">−</ToolbarIconBtn>
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 12,
                color: "#7a6a52",
                minWidth: 38,
                textAlign: "center",
                letterSpacing: "0.01em",
                cursor: "default",
                userSelect: "none",
              }}
            >
              {Math.round(scale * 100)}%
            </span>
            <ToolbarIconBtn onClick={handleZoomIn} title="Zoom in">+</ToolbarIconBtn>
          </div>

          {/* RIGHT — progress + actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <ReadingProgress progressPct={progressPct} showBadge={true} />
            <Divider />
            <ToolbarIconBtn
              onClick={() => bookmarkState.toggleBookmark(pageNumber)}
              title={bookmarkState.isPageBookmarked(pageNumber) ? "Remove bookmark (Ctrl+B)" : "Bookmark this page (Ctrl+B)"}
            >
              {bookmarkState.isPageBookmarked(pageNumber) ? (
                <BookmarkSolid style={{ width: 16, height: 16 }} />
              ) : (
                <BookmarkOutline style={{ width: 16, height: 16 }} />
              )}
            </ToolbarIconBtn>
            <ToolbarIconBtn onClick={onUploadClick} title="Upload new PDF">↑</ToolbarIconBtn>
            <ToolbarIconBtn onClick={onRemove} title="Remove this PDF" danger>✕</ToolbarIconBtn>
          </div>
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