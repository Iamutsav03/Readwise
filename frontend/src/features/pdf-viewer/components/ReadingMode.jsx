// features/pdf-viewer/components/ReadingMode.jsx
// v2: Virtualized via react-virtuoso. Reports visible page back to global state
// via IntersectionObserver-style rangeChanged callback with 50% threshold + 200ms debounce.
// Handles extraction quality warnings with an "Open Anyway" escape hatch.
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Virtuoso } from "react-virtuoso";
import { useBreakpoints } from "../../../hooks/useBreakpoints";
import httpClient from "../../../services/httpClient";

const COLOR_MAP_READING = {
  yellow: "rgba(252, 224, 114, 0.45)",
  green:  "rgba(164, 227, 169, 0.45)",
  blue:   "rgba(161, 212, 245, 0.45)",
  pink:   "rgba(250, 194, 219, 0.45)",
};

/**
 * Renders a single block of text within a page, with highlight spans overlaid.
 */
const TextBlock = React.memo(({ block, pageNum, highlights }) => {
  const pageHighlights = highlights.filter(
    (h) =>
      h.pageNumber === pageNum &&
      h.startOffset !== undefined &&
      h.endOffset !== undefined &&
      h.startOffset < block.endOffset &&
      h.endOffset > block.startOffset
  );

  if (pageHighlights.length === 0) {
    return block.text;
  }

  const sorted = [...pageHighlights].sort((a, b) => a.startOffset - b.startOffset);
  let lastIdx = 0;
  const els = [];

  sorted.forEach((h, i) => {
    const start = Math.max(0, h.startOffset - block.startOffset);
    const end = Math.min(block.text.length, h.endOffset - block.startOffset);
    if (start > lastIdx) {
      els.push(<span key={`t-${i}`}>{block.text.slice(lastIdx, start)}</span>);
    }
    if (end > start) {
      els.push(
        <mark
          key={`m-${h._id}`}
          style={{
            backgroundColor: COLOR_MAP_READING[h.color] || COLOR_MAP_READING.yellow,
            color: "inherit",
            padding: "2px 0",
            borderRadius: "2px",
          }}
        >
          {block.text.slice(start, end)}
        </mark>
      );
    }
    lastIdx = Math.max(lastIdx, end);
  });

  if (lastIdx < block.text.length) {
    els.push(<span key="t-end">{block.text.slice(lastIdx)}</span>);
  }

  return els;
});

/**
 * Renders a single page's content block.
 * Includes text blocks, highlights, and a page-level notes card for page notes.
 */
const PageBlock = React.memo(({ page, highlights, pageNotes, fontSize, lineSpacing }) => {
  const textHighlights = highlights.filter(
    (h) => h.pageNumber === page.pageNumber && h.startOffset !== undefined
  );

  // Page notes = notes on this page that have no textQuote (they're generic page notes)
  const genericPageNotes = (pageNotes || []).filter(
    (n) => n.pageNumber === page.pageNumber && !n.textQuote
  );

  return (
    <div
      data-page={page.pageNumber}
      style={{ marginBottom: "60px", position: "relative" }}
    >
      {page.structuredContent && page.structuredContent.length > 0 ? (
        page.structuredContent.map((block, idx) => {
          if (block.type === "heading") {
            return (
              <h2
                key={idx}
                data-start-offset={block.startOffset}
                style={{
                  fontSize: `${Math.round(fontSize * 1.4)}px`,
                  fontWeight: "bold",
                  margin: "1.5em 0 0.5em",
                  color: "var(--rw-text-primary)",
                }}
              >
                <TextBlock block={block} pageNum={page.pageNumber} highlights={textHighlights} />
              </h2>
            );
          }
          return (
            <p
              key={idx}
              data-start-offset={block.startOffset}
              style={{ marginBottom: "1em", color: "var(--rw-page-text)" }}
            >
              <TextBlock block={block} pageNum={page.pageNumber} highlights={textHighlights} />
            </p>
          );
        })
      ) : (
        <p style={{ color: "var(--rw-text-muted)", fontStyle: "italic" }}>
          {page.text || "No readable text on this page."}
        </p>
      )}

      {/* Page Notes Card */}
      {genericPageNotes.length > 0 && (
        <div
          style={{
            marginTop: "20px",
            padding: "12px 16px",
            border: "1px solid var(--rw-border)",
            borderRadius: "8px",
            backgroundColor: "var(--rw-card-bg)",
          }}
        >
          <div
            style={{
              fontSize: "0.8em",
              fontWeight: 600,
              color: "var(--rw-text-muted)",
              marginBottom: "8px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            📌 Page Notes ({genericPageNotes.length})
          </div>
          {genericPageNotes.map((note) => (
            <div
              key={note._id}
              style={{
                fontSize: "0.9em",
                color: "var(--rw-text-primary)",
                padding: "4px 0",
                borderTop: "1px solid var(--rw-border)",
              }}
            >
              • {note.content || <em style={{ color: "var(--rw-text-muted)" }}>Empty note</em>}
            </div>
          ))}
        </div>
      )}

      {/* Page divider */}
      <div
        style={{
          textAlign: "center",
          marginTop: "30px",
          padding: "10px 0",
          borderTop: "1px solid var(--rw-border)",
          color: "var(--rw-text-muted)",
          fontSize: "0.75em",
          userSelect: "none",
          letterSpacing: "0.08em",
        }}
      >
        — Page {page.pageNumber} —
      </div>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────

const ReadingMode = ({
  pdf,
  pageNumber,
  onPageChange,
  readingSettings,
  highlightState,
  notesState,
}) => {
  const { isMobileOrSmaller } = useBreakpoints();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [extractionQuality, setExtractionQuality] = useState("pending");
  const [openAnyway, setOpenAnyway] = useState(false);
  const virtuosoRef = useRef(null);
  const debounceRef = useRef(null);
  const isScrollingToPageRef = useRef(false); // prevent feedback loop

  const { fontSize = 16, lineSpacing = 1.6, contentWidth = "700px" } = readingSettings || {};
  const highlights = highlightState?.highlights || [];
  const notes = notesState?.notes || [];

  // Fetch structured pages + extraction quality on mount
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const res = await httpClient.get(`/pdfs/${pdf._id}/pages`);
        setPages(res.data.pages || []);
        setExtractionQuality(res.data.extractionQuality || "pending");
      } catch (err) {
        console.error("ReadingMode: failed to fetch pages:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [pdf._id]);

  // Scroll to target page when global pageNumber changes (PDF Mode → Reading sync)
  useEffect(() => {
    if (loading || pages.length === 0 || !virtuosoRef.current) return;
    const idx = pages.findIndex((p) => p.pageNumber === pageNumber);
    if (idx === -1) return;
    isScrollingToPageRef.current = true;
    virtuosoRef.current.scrollToIndex({ index: idx, align: "start", behavior: "auto" });
    // Release lock after animation completes
    setTimeout(() => { isScrollingToPageRef.current = false; }, 500);
  }, [pageNumber, loading, pages]);

  // When Virtuoso reports the visible range, debounce and sync back to global state
  const handleRangeChanged = useCallback(
    ({ startIndex }) => {
      if (isScrollingToPageRef.current) return; // ignore programmatic scrolls
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const visiblePage = pages[startIndex];
        if (visiblePage && visiblePage.pageNumber !== pageNumber) {
          onPageChange(visiblePage.pageNumber);
        }
      }, 200); // 200ms debounce to prevent jitter
    },
    [pages, pageNumber, onPageChange]
  );

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  // ─── Render states ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: "var(--rw-app-bg)" }}>
        <div className="animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600 w-12 h-12" />
      </div>
    );
  }

  const qualityIsPoor = extractionQuality === "poor";

  if (qualityIsPoor && !openAnyway) {
    return (
      <div
        className="flex-1 flex flex-col items-center justify-center"
        style={{ backgroundColor: "var(--rw-app-bg)", padding: "40px 20px", textAlign: "center" }}
      >
        <div style={{ fontSize: "3rem", marginBottom: "16px" }}>⚠️</div>
        <h3 style={{ color: "var(--rw-text-primary)", fontSize: "1.2rem", fontWeight: 600, marginBottom: "10px" }}>
          Reading Mode may not display correctly
        </h3>
        <p style={{ color: "var(--rw-text-muted)", maxWidth: "420px", marginBottom: "24px", fontSize: "0.95rem", lineHeight: 1.6 }}>
          This document appears to contain multiple columns, scanned pages, or images without text layers. 
          Reading Mode works best with single-column, text-based PDFs.
        </p>
        <button
          onClick={() => setOpenAnyway(true)}
          style={{
            padding: "10px 24px",
            borderRadius: "8px",
            border: "1px solid var(--rw-border)",
            background: "var(--rw-card-bg)",
            color: "var(--rw-text-primary)",
            cursor: "pointer",
            fontSize: "0.95rem",
          }}
        >
          Open Anyway
        </button>
      </div>
    );
  }

  return (
    <div
      className="reading-mode-container"
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--rw-app-bg)",
        color: "var(--rw-text-primary)",
        fontFamily: "var(--rw-reading-font, 'Literata', 'Georgia', serif)",
        fontSize: `${fontSize}px`,
        lineHeight: lineSpacing,
        overflow: "hidden",
      }}
    >
      {/* Extraction quality banner (poor but opened anyway) */}
      {qualityIsPoor && openAnyway && (
        <div
          style={{
            padding: "8px 16px",
            backgroundColor: "rgba(255, 180, 0, 0.15)",
            borderBottom: "1px solid rgba(255, 180, 0, 0.4)",
            color: "var(--rw-text-primary)",
            fontSize: "0.8rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          ⚠️ This document may have extraction issues — text order may be incorrect.
        </div>
      )}

      <Virtuoso
        ref={virtuosoRef}
        style={{ flex: 1 }}
        data={pages}
        overscan={3} // ±3 pages buffer to prevent pop-in
        rangeChanged={handleRangeChanged}
        itemContent={(index, page) => (
          <div
            key={page.pageNumber}
            style={{
              padding: isMobileOrSmaller ? "20px 16px" : "40px 0",
            }}
          >
            <div style={{ maxWidth: contentWidth, margin: "0 auto" }}>
              <PageBlock
                page={page}
                highlights={highlights}
                pageNotes={notes}
                fontSize={fontSize}
                lineSpacing={lineSpacing}
              />
            </div>
          </div>
        )}
      />
    </div>
  );
};

export default ReadingMode;
