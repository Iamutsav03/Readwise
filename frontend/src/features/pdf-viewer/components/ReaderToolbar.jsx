// features/pdf-viewer/components/ReaderToolbar.jsx
// v3: Mobile-first redesign.
//   - 44px minimum touch targets
//   - 60px toolbar height on mobile
//   - Safe area inset support (iPhone home bar)
//   - Expanded overflow sheet with reading preferences

import React from "react";
import {
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut, MoreVertical,
  Maximize2, Maximize, Sparkles, Search, Edit2, Highlighter,
  Bookmark as BookmarkIcon, Palette, Lock, UploadCloud, FileX,
  BookOpen, Layout, Settings, Type, AlignJustify, Minus, Plus,
  Sun, Zap,
} from "lucide-react";
import { BookmarkIcon as BookmarkSolid } from "@heroicons/react/24/solid";
import { BookmarkIcon as BookmarkOutline } from "@heroicons/react/24/outline";

import FitControls from "../../../components/reader/FitControls";
import PageJumpInput from "../../../components/reader/PageJumpInput";
import ReadingProgress from "../../../components/reader/ReadingProgress";

// ── Desktop toolbar icon button (unchanged) ───────────────────────────────
const ToolbarIconBtn = ({ children, onClick, disabled, title, danger }) => {
  const [hovered, setHovered] = React.useState(false);

  const bg = disabled
    ? "transparent"
    : hovered && danger ? "rgba(192,57,43,0.15)"
      : hovered ? "rgba(255,255,255,0.09)"
        : "var(--rw-border)";

  const color = disabled
    ? "rgba(255,255,255,0.15)"
    : hovered && danger ? "var(--rw-danger)"
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

// ── Mobile toolbar icon button — 44px touch target ────────────────────────
const MobileIconBtn = ({ children, onClick, disabled, title, danger }) => {
  const color = disabled
    ? "rgba(255,255,255,0.2)"
    : danger ? "var(--rw-danger)"
      : "var(--rw-text-secondary)";

  return (
    <button
      onClick={disabled ? undefined : onClick}
      title={title}
      disabled={disabled}
      data-icon-btn="true"
      className="rw-mobile-toolbar-icon"
      style={{
        width: 44, height: 44, borderRadius: 10,
        border: "none",
        background: "transparent",
        color,
        cursor: disabled ? "default" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, userSelect: "none",
        opacity: disabled ? 0.4 : 1,
        transition: "background 0.12s, opacity 0.12s",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {children}
    </button>
  );
};

// ── Preference slider control ─────────────────────────────────────────────
const PrefSlider = ({ label, value, min, max, step, onChange, formatValue }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 13, color: "var(--rw-text-secondary)", fontFamily: "'DM Sans', sans-serif" }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--rw-text-primary)", fontFamily: "'DM Sans', sans-serif", minWidth: 40, textAlign: "right" }}>
        {formatValue ? formatValue(value) : value}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      style={{
        width: "100%",
        height: 6,
        borderRadius: 3,
        accentColor: "var(--rw-accent)",
        cursor: "pointer",
      }}
    />
  </div>
);

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

  // Reading preference helpers
  const updatePref = (key, value) => {
    const next = { ...readingSettings, [key]: value };
    setReadingSettings(next);
  };

  // ── Comfort Presets ──────────────────────────────────────────────────────
  const COMFORT_PRESETS = [
    { id: "kindle",      label: "Kindle",      fontSize: 18, lineSpacing: 1.8, contentWidth: "650px" },
    { id: "comfortable",label: "Comfortable",  fontSize: 16, lineSpacing: 1.7, contentWidth: "700px" },
    { id: "compact",    label: "Compact",      fontSize: 14, lineSpacing: 1.5, contentWidth: "800px" },
  ];

  const applyPreset = (preset) => {
    setReadingSettings({ fontSize: preset.fontSize, lineSpacing: preset.lineSpacing, contentWidth: preset.contentWidth, preset: preset.id });
  };

  const activePreset = readingSettings?.preset || null;

  const { fontSize = 16, lineSpacing = 1.7, contentWidth = "700px" } = readingSettings || {};
  const brightnessValue = readingSettings?.brightness || 0;

  // Mobile overflow sheet content
  const mobileOverflowContent = (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        .rw-overflow-item {
          display: flex; align-items: center; justify-content: space-between;
          min-height: 44px; padding: 0 16px; font-size: 14px; color: var(--rw-text-primary);
          background: transparent; border: none; border-radius: 8px; cursor: pointer;
          text-align: left; width: 100%; font-family: 'DM Sans', sans-serif;
        }
        .rw-overflow-item:hover, .rw-overflow-item:active { background: var(--rw-border); }
        .rw-overflow-section { padding: 8px 16px 4px; font-size: 11px; color: var(--rw-text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
        .rw-overflow-divider { height: 1px; background: var(--rw-border); margin: 6px 8px; }
      `}</style>

      {/* ── View Section ── */}
      <div className="rw-overflow-section">View</div>
      <button className="rw-overflow-item" onClick={() => { handleFitWidth(); setIsOverflowOpen(false); }}>
        <span>Fit Width</span><Maximize2 size={14} />
      </button>
      <button className="rw-overflow-item" onClick={() => { handleFitPage(); setIsOverflowOpen(false); }}>
        <span>Fit Page</span><Maximize size={14} />
      </button>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", minHeight: 44 }}>
        <span style={{ fontSize: 14 }}>Zoom: {Math.round(scale * 100)}%</span>
        <div style={{ display: "flex", gap: 4 }}>
          <button onClick={handleZoomOut} style={{ padding: "6px 10px", border: "1px solid var(--rw-border)", borderRadius: 6, background: "transparent", color: "var(--rw-text-primary)", cursor: "pointer" }}><Minus size={12} /></button>
          <button onClick={handleZoomIn} style={{ padding: "6px 10px", border: "1px solid var(--rw-border)", borderRadius: 6, background: "transparent", color: "var(--rw-text-primary)", cursor: "pointer" }}><Plus size={12} /></button>
        </div>
      </div>

      <div className="rw-overflow-divider" />

      {/* ── Reading Mode ── */}
      <div className="rw-overflow-section">Reading Mode</div>
      <div style={{ display: "flex", gap: "4px", padding: "4px 16px" }}>
        <button
          style={{ flex: 1, padding: "8px 6px", borderRadius: "8px", background: viewMode === "pdf" ? "var(--rw-accent)" : "transparent", color: viewMode === "pdf" ? "var(--rw-accent-text)" : "var(--rw-text-primary)", border: "1px solid var(--rw-border)", cursor: "pointer", fontSize: 13, fontWeight: 500, fontFamily: "'DM Sans', sans-serif", minHeight: 44 }}
          onClick={() => { handleModeChange("pdf"); setIsOverflowOpen(false); }}
        >PDF</button>
        <button
          style={{ flex: 1, padding: "8px 6px", borderRadius: "8px", background: viewMode === "reading" ? "var(--rw-accent)" : "transparent", color: viewMode === "reading" ? "var(--rw-accent-text)" : "var(--rw-text-primary)", border: "1px solid var(--rw-border)", cursor: "pointer", fontSize: 13, fontWeight: 500, fontFamily: "'DM Sans', sans-serif", minHeight: 44 }}
          onClick={() => { handleModeChange("reading"); setIsOverflowOpen(false); }}
        >Read</button>
      </div>

      {/* ── Reading Preferences (shown when in reading mode) ── */}
      {viewMode === "reading" && (
        <>
          <div className="rw-overflow-divider" />
          <div className="rw-overflow-section">Reading Presets</div>
          {/* Comfort preset pills */}
          <div style={{ display: "flex", gap: 8, padding: "4px 16px 8px" }}>
            {COMFORT_PRESETS.map(preset => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                style={{
                  flex: 1, padding: "8px 4px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                  fontFamily: "'DM Sans', sans-serif", cursor: "pointer", minHeight: 44,
                  border: `1px solid ${activePreset === preset.id ? "var(--rw-accent)" : "var(--rw-border)"}`,
                  background: activePreset === preset.id ? "var(--rw-accent)" : "transparent",
                  color: activePreset === preset.id ? "var(--rw-accent-text)" : "var(--rw-text-primary)",
                  transition: "background 0.15s, color 0.15s, border-color 0.15s",
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="rw-overflow-section">Fine Tune</div>
          <div style={{ padding: "8px 16px", display: "flex", flexDirection: "column", gap: 16 }}>
            <PrefSlider
              label="Font Size"
              value={fontSize}
              min={12}
              max={26}
              step={1}
              onChange={(v) => { updatePref("fontSize", v); updatePref("preset", null); }}
              formatValue={(v) => `${v}px`}
            />
            <PrefSlider
              label="Line Spacing"
              value={lineSpacing}
              min={1.3}
              max={2.2}
              step={0.1}
              onChange={(v) => { updatePref("lineSpacing", parseFloat(v.toFixed(1))); updatePref("preset", null); }}
              formatValue={(v) => v.toFixed(1)}
            />
          </div>
        </>
      )}

      <div className="rw-overflow-divider" />

      {/* ── Tools ── */}
      <div className="rw-overflow-section">Tools</div>
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
        <span>Bookmark Page</span>
        <BookmarkIcon size={14} fill={bookmarkState.isPageBookmarked(pageNumber) ? "currentColor" : "none"} />
      </button>

      <div className="rw-overflow-divider" />

      {/* ── Environment ── */}
      <div className="rw-overflow-section">Environment</div>
      <button className="rw-overflow-item" onClick={() => { setIsFocusMode(true); setShowFocusHint(true); setActiveTab(null); setIsOverflowOpen(false); }}>
        <span>Focus Mode</span><Lock size={14} />
      </button>
      <button className="rw-overflow-item" onClick={() => { setIsAppearanceOpen(true); setIsOverflowOpen(false); }}>
        <span>Theme & Appearance</span><Palette size={14} />
      </button>
      <button className="rw-overflow-item" onClick={() => { onRemove(); setIsOverflowOpen(false); }} style={{ color: "var(--rw-danger, #e07060)" }}>
        <span>Close Document</span><FileX size={14} />
      </button>

      {/* Bottom safe area padding */}
      <div style={{ height: "max(16px, env(safe-area-inset-bottom, 16px))" }} />
    </div>
  );

  return (
    <div className={`focus-transition ${isFocusMode ? "focus-hide-y" : ""}`} style={{ position: "relative", flexShrink: 0, zIndex: 50 }}>
      <ReadingProgress progressPct={progressPct} showBadge={false} />
      <div
        className={isMobile ? "" : "toolbar-container"}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: isMobile
            ? `0 4px max(8px, env(safe-area-inset-bottom, 8px)) 4px`
            : "0 16px",
          height: isMobile ? 60 : 56,
          minHeight: isMobile ? 60 : 56,
          background: "var(--rw-toolbar-bg)", borderTop: "1px solid var(--rw-border)",
          gap: 4, position: "relative",
        }}
      >
        {isMobile ? (
          <>
            {/* Left: Prev / Page / Next */}
            <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
              <MobileIconBtn onClick={onPrev} disabled={pageNumber <= 1} title="Previous page">
                <ChevronLeft size={20} />
              </MobileIconBtn>
              <PageJumpInput pageNumber={pageNumber} numPages={numPages || 1} onChange={onPageChange} />
              <MobileIconBtn onClick={onNext} disabled={pageNumber >= numPages} title="Next page">
                <ChevronRight size={20} />
              </MobileIconBtn>
            </div>

            {/* Right: Quick tools + More */}
            <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
              <MobileIconBtn onClick={() => setActiveTab("search")} title="Search">
                <Search size={18} />
              </MobileIconBtn>
              <MobileIconBtn
                onClick={() => bookmarkState.toggleBookmark(pageNumber)}
                title="Bookmark"
              >
                {bookmarkState.isPageBookmarked(pageNumber)
                  ? <BookmarkSolid style={{ width: 18, height: 18 }} />
                  : <BookmarkOutline style={{ width: 18, height: 18 }} />
                }
              </MobileIconBtn>
              <MobileIconBtn onClick={() => setIsOverflowOpen(!isOverflowOpen)} title="More options">
                <MoreVertical size={20} />
              </MobileIconBtn>
            </div>

            {/* Overflow menu sheet (fixed, above toolbar) */}
            {isOverflowOpen && (
              <>
                {/* Backdrop */}
                <div
                  style={{ position: "fixed", inset: 0, zIndex: 99, background: "var(--rw-overlay)" }}
                  onClick={() => setIsOverflowOpen(false)}
                  role="button"
                  aria-label="Close menu"
                  tabIndex={0}
                />
                {/* Sheet */}
                <div
                  style={{
                    position: "fixed",
                    bottom: `calc(60px + max(0px, env(safe-area-inset-bottom, 0px)))`,
                    left: 0,
                    right: 0,
                    background: "var(--rw-panel-bg)",
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                    boxShadow: "0 -4px 32px rgba(0,0,0,0.2)",
                    border: "1px solid var(--rw-border)",
                    zIndex: 100,
                    maxHeight: "calc(100dvh - 120px)",
                    overflowY: "auto",
                    overscrollBehavior: "contain",
                  }}
                >
                  {/* Drag handle */}
                  <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
                    <div style={{ width: 36, height: 4, borderRadius: 2, background: "var(--rw-border)" }} />
                  </div>
                  {mobileOverflowContent}
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
                >PDF</button>
                <button
                  onClick={() => handleModeChange("reading")}
                  title="Reading View"
                  style={{ background: viewMode === "reading" ? "var(--rw-card-bg)" : "transparent", color: viewMode === "reading" ? "var(--rw-text-primary)" : "var(--rw-text-muted)", border: "none", borderRadius: "6px", padding: "4px 10px", fontSize: "12px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", boxShadow: viewMode === "reading" ? "0 2px 5px rgba(0,0,0,0.1)" : "none", transition: "all 0.2s" }}
                ><BookOpen size={14} /> Read</button>
                <button
                  onClick={() => handleModeChange("split")}
                  title="Split View"
                  style={{ background: viewMode === "split" ? "var(--rw-card-bg)" : "transparent", color: viewMode === "split" ? "var(--rw-text-primary)" : "var(--rw-text-muted)", border: "none", borderRadius: "6px", padding: "4px 10px", fontSize: "12px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", boxShadow: viewMode === "split" ? "0 2px 5px rgba(0,0,0,0.1)" : "none", transition: "all 0.2s" }}
                ><Layout size={14} /> Split</button>
              </div>
              {viewMode !== "pdf" && (
                <>
                  <Divider />
                  <ToolbarIconBtn onClick={() => {
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
