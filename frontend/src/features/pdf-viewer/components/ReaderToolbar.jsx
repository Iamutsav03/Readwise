// features/pdf-viewer/components/ReaderToolbar.jsx
// Extracted from ReaderLayout.jsx to reduce file size.

import React from "react";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, MoreVertical, Maximize2, Maximize, Sparkles, Search, Edit2, Highlighter, Bookmark as BookmarkIcon, Palette, Lock, UploadCloud, FileX, BookOpen, Layout, Settings } from "lucide-react";
import { BookmarkIcon as BookmarkSolid } from "@heroicons/react/24/solid";
import { BookmarkIcon as BookmarkOutline } from "@heroicons/react/24/outline";

import FitControls from "../../../components/reader/FitControls";
import PageJumpInput from "../../../components/reader/PageJumpInput";
import ReadingProgress from "../../../components/reader/ReadingProgress";

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
  <div style={{ width: 1, height: 20, background: "var(--rw-border)", flexShrink: 0, margin: "0 2px" }} />
);

export const ReaderToolbar = ({
  isMobile,
  isFocusMode,
  progressPct,
  pageNumber,
  numPages,
  scale,
  fitMode,
  onPrev,
  onNext,
  onPageChange,
  handleZoomIn,
  handleZoomOut,
  handleFitWidth,
  handleFitPage,
  setIsFocusMode,
  setShowFocusHint,
  setActiveTab,
  bookmarkState,
  onUploadClick,
  onRemove,
  isOverflowOpen,
  setIsOverflowOpen,
  setIsAppearanceOpen,
  viewMode,
  setViewMode,
  readingSettings,
  setReadingSettings,
}) => {
  const isSplitDisabled = isMobile;

  const handleModeChange = (mode) => {
    if (mode === "split" && isSplitDisabled) return;
    setViewMode(mode);
  };

  return (
    <div className={`focus-transition ${isFocusMode ? "focus-hide-y" : ""}`} style={{ position: "relative", flexShrink: 0, zIndex: 50 }}>
      <ReadingProgress progressPct={progressPct} showBadge={false} />
      <div
        className={isMobile ? "" : "toolbar-container"}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: isMobile ? "0 8px" : "0 16px", height: 56,
          background: "var(--rw-toolbar-bg)", borderTop: "1px solid var(--rw-border)",
          gap: isMobile ? 4 : 8, position: "relative",
        }}
      >
        {isMobile ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
              <ToolbarIconBtn onClick={onPrev} disabled={pageNumber <= 1}><ChevronLeft size={16} /></ToolbarIconBtn>
              <PageJumpInput pageNumber={pageNumber} numPages={numPages || 1} onChange={onPageChange} />
              <ToolbarIconBtn onClick={onNext} disabled={pageNumber >= numPages}><ChevronRight size={16} /></ToolbarIconBtn>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <ToolbarIconBtn onClick={handleZoomOut} aria-label="Zoom Out"><ZoomOut size={16} /></ToolbarIconBtn>
              <ToolbarIconBtn onClick={handleZoomIn} aria-label="Zoom In"><ZoomIn size={16} /></ToolbarIconBtn>
              <ToolbarIconBtn onClick={onRemove} title="Close Document" danger><FileX size={16} /></ToolbarIconBtn>
              <ToolbarIconBtn onClick={() => { setIsFocusMode(true); setShowFocusHint(true); setActiveTab(null); }} title="Focus Mode"><Lock size={16} /></ToolbarIconBtn>
              <ToolbarIconBtn onClick={() => setIsOverflowOpen(!isOverflowOpen)}><MoreVertical size={16} /></ToolbarIconBtn>
            </div>
            {isOverflowOpen && (
              <>
                <div style={{ position: "fixed", inset: 0, zIndex: 99, background: "transparent" }} onClick={() => setIsOverflowOpen(false)} aria-label="Close menu backdrop" role="button" tabIndex={0} />
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
                    .rw-overflow-item:hover, .rw-overflow-item:active { background: var(--rw-border); }
                  `}</style>
                  
                  <div style={{ padding: "4px 8px", fontSize: 11, color: "var(--rw-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>View</div>
                  <button className="rw-overflow-item" onClick={() => { handleFitWidth(); setIsOverflowOpen(false); }}>
                    <span>Fit Width</span><Maximize2 size={14} />
                  </button>
                  <button className="rw-overflow-item" onClick={() => { handleFitPage(); setIsOverflowOpen(false); }}>
                    <span>Fit Page</span><Maximize size={14} />
                  </button>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px", minHeight: 44 }}>
                    <span style={{ fontSize: 14 }}>Current Zoom:</span>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{Math.round(scale * 100)}%</span>
                  </div>
                  
                  <div style={{ height: "1px", background: "var(--rw-border)", margin: "4px 0" }} />
                  
                  <div style={{ padding: "4px 8px", fontSize: 11, color: "var(--rw-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Reading Mode</div>
                  <div style={{ display: "flex", gap: "4px", padding: "4px 8px" }}>
                    <button 
                      style={{ flex: 1, padding: "6px", borderRadius: "6px", background: viewMode === "pdf" ? "var(--rw-accent)" : "transparent", color: viewMode === "pdf" ? "white" : "var(--rw-text-primary)", border: "1px solid var(--rw-border)", cursor: "pointer", fontSize: 12, fontWeight: 500 }}
                      onClick={() => { handleModeChange("pdf"); setIsOverflowOpen(false); }}
                    >PDF</button>
                    <button 
                      style={{ flex: 1, padding: "6px", borderRadius: "6px", background: viewMode === "reading" ? "var(--rw-accent)" : "transparent", color: viewMode === "reading" ? "white" : "var(--rw-text-primary)", border: "1px solid var(--rw-border)", cursor: "pointer", fontSize: 12, fontWeight: 500 }}
                      onClick={() => { handleModeChange("reading"); setIsOverflowOpen(false); }}
                    >Read</button>
                  </div>
                  
                  <div style={{ height: "1px", background: "var(--rw-border)", margin: "4px 0" }} />

                  <div style={{ padding: "4px 8px", fontSize: 11, color: "var(--rw-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Tools</div>
                  <button className="rw-overflow-item" onClick={() => { setActiveTab("ai"); setIsOverflowOpen(false); }}>
                    <span>AI Chat</span><Sparkles size={14} />
                  </button>
                  <button className="rw-overflow-item" onClick={() => { setActiveTab("search"); setIsOverflowOpen(false); }}>
                    <span>Search</span><Search size={14} />
                  </button>
                  <button className="rw-overflow-item" onClick={() => { setActiveTab("notes"); setIsOverflowOpen(false); }}>
                    <span>Notes</span><Edit2 size={14} />
                  </button>
                  <button className="rw-overflow-item" onClick={() => { setActiveTab("highlights"); setIsOverflowOpen(false); }}>
                    <span>Highlights</span><Highlighter size={14} />
                  </button>
                  <button className="rw-overflow-item" onClick={() => { bookmarkState.toggleBookmark(pageNumber); setIsOverflowOpen(false); }}>
                    <span>Bookmark</span><BookmarkIcon size={14} fill={bookmarkState.isPageBookmarked(pageNumber) ? "currentColor" : "none"} />
                  </button>

                  <div style={{ height: "1px", background: "var(--rw-border)", margin: "4px 0" }} />
                  
                  <div style={{ padding: "4px 8px", fontSize: 11, color: "var(--rw-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Environment</div>
                  <button className="rw-overflow-item" onClick={() => { setIsFocusMode(true); setShowFocusHint(true); setActiveTab(null); setIsOverflowOpen(false); }}>
                    <span>Focus Mode</span><Lock size={14} />
                  </button>
                  <button className="rw-overflow-item" onClick={() => { setIsAppearanceOpen(true); setIsOverflowOpen(false); }}>
                    <span>Theme</span><Palette size={14} />
                  </button>

                  <div style={{ height: "1px", background: "var(--rw-border)", margin: "4px 0" }} />
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <ToolbarIconBtn onClick={onPrev} disabled={pageNumber <= 1} title="Previous page (←)"><ChevronLeft size={16} /></ToolbarIconBtn>
              <PageJumpInput pageNumber={pageNumber} numPages={numPages || 1} onChange={onPageChange} />
              <ToolbarIconBtn onClick={onNext} disabled={pageNumber >= numPages} title="Next page (→)"><ChevronRight size={16} /></ToolbarIconBtn>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <FitControls fitMode={fitMode} onFitPage={handleFitPage} onFitWidth={handleFitWidth} />
              <Divider />
              {/* View Mode Switcher */}
              <div style={{ display: "flex", background: "rgba(0,0,0,0.05)", borderRadius: "8px", padding: "2px", border: "1px solid var(--rw-border)" }}>
                <button
                  onClick={() => handleModeChange("pdf")}
                  title="PDF View"
                  style={{ background: viewMode === "pdf" ? "var(--rw-card-bg)" : "transparent", color: viewMode === "pdf" ? "var(--rw-text-primary)" : "var(--rw-text-muted)", border: "none", borderRadius: "6px", padding: "4px 10px", fontSize: "12px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", boxShadow: viewMode === "pdf" ? "0 2px 5px rgba(0,0,0,0.1)" : "none", transition: "all 0.2s" }}
                >
                  PDF
                </button>
                <button
                  onClick={() => handleModeChange("reading")}
                  title="Reading View"
                  style={{ background: viewMode === "reading" ? "var(--rw-card-bg)" : "transparent", color: viewMode === "reading" ? "var(--rw-text-primary)" : "var(--rw-text-muted)", border: "none", borderRadius: "6px", padding: "4px 10px", fontSize: "12px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", boxShadow: viewMode === "reading" ? "0 2px 5px rgba(0,0,0,0.1)" : "none", transition: "all 0.2s" }}
                >
                  <BookOpen size={14} /> Read
                </button>
                <button
                  onClick={() => handleModeChange("split")}
                  title="Split View"
                  style={{ background: viewMode === "split" ? "var(--rw-card-bg)" : "transparent", color: viewMode === "split" ? "var(--rw-text-primary)" : "var(--rw-text-muted)", border: "none", borderRadius: "6px", padding: "4px 10px", fontSize: "12px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", boxShadow: viewMode === "split" ? "0 2px 5px rgba(0,0,0,0.1)" : "none", transition: "all 0.2s" }}
                >
                  <Layout size={14} /> Split
                </button>
              </div>
              {viewMode !== "pdf" && (
                <>
                  <Divider />
                  <ToolbarIconBtn onClick={() => {
                    // Simple cycle for now; in a full implementation this would open a popover
                    const newSize = readingSettings.fontSize >= 24 ? 14 : readingSettings.fontSize + 2;
                    setReadingSettings({ ...readingSettings, fontSize: newSize });
                  }} title={`Font Size: ${readingSettings?.fontSize}px (Click to increase)`}><Settings size={16} /></ToolbarIconBtn>
                </>
              )}
              <Divider />
              <ToolbarIconBtn onClick={handleZoomOut} title="Zoom out"><ZoomOut size={16} /></ToolbarIconBtn>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "var(--rw-text-secondary)", minWidth: 38, textAlign: "center", letterSpacing: "0.01em", cursor: "default", userSelect: "none" }}>{Math.round(scale * 100)}%</span>
              <ToolbarIconBtn onClick={handleZoomIn} title="Zoom in"><ZoomIn size={16} /></ToolbarIconBtn>
            </div>
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
  );
};

export default ReaderToolbar;
