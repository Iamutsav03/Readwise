// features/pdf-viewer/hooks/useHighlights.js
// Hook for managing highlights in the PDF viewer.
// v2: Adds a highlightsByPage index (useMemo) for O(1) lookup, avoiding 
// full-array scans when the document has 100–1000+ highlights.

import { useState, useEffect, useCallback, useMemo } from "react";
import { createHighlight, getHighlightsForPdf, deleteHighlight as apiDeleteHighlight } from "../../../services/highlightService";

export function useHighlights(pdfId) {
  const [highlights, setHighlights] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!pdfId) {
      setHighlights([]);
      return;
    }

    let isMounted = true;
    const fetchHighlights = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getHighlightsForPdf(pdfId);
        if (isMounted) setHighlights(data);
      } catch (err) {
        console.error("Failed to fetch highlights:", err);
        if (isMounted) setError(err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchHighlights();
    return () => { isMounted = false; };
  }, [pdfId]);

  /**
   * Page-indexed map: { [pageNumber]: Highlight[] }
   * Rebuilt only when the highlights array reference changes.
   * Allows PDFCanvasLayer and ReadingMode to get highlights for a specific
   * page in O(1) without re-filtering the entire array.
   */
  const highlightsByPage = useMemo(() => {
    const index = {};
    for (const h of highlights) {
      if (!index[h.pageNumber]) index[h.pageNumber] = [];
      index[h.pageNumber].push(h);
    }
    return index;
  }, [highlights]);

  // Define removeHighlight FIRST so addHighlight can reference it
  const removeHighlight = useCallback(async (id) => {
    const highlightToRemove = highlights.find((h) => h._id === id);
    if (!highlightToRemove) return;

    setHighlights((prev) => prev.filter((h) => h._id !== id));

    try {
      await apiDeleteHighlight(id);
      return highlightToRemove;
    } catch (err) {
      console.error("Failed to delete highlight:", err);
      setHighlights((prev) => [...prev, highlightToRemove]);
      throw err;
    }
  }, [highlights]);

  const addHighlight = useCallback(async (pageNumber, selectedText, color, rects, textQuote, startOffset, endOffset) => {
    // Check for an existing highlight covering the same text/offsets on this page
    // and remove it first so we don't stack highlights on top of each other.
    const existingList = highlightsByPage[pageNumber] || [];
    const existing = existingList.find(h =>
      (h.startOffset !== undefined && startOffset !== undefined && h.startOffset === startOffset && h.endOffset === endOffset) ||
      (h.selectedText === selectedText && (!h.startOffset || !startOffset))
    );

    if (existing) {
      // Remove the old highlight from state immediately and from the server
      setHighlights((prev) => prev.filter((h) => h._id !== existing._id));
      try {
        await apiDeleteHighlight(existing._id);
      } catch (err) {
        console.error("Failed to remove old highlight during replace:", err);
      }
    }

    const tempId = `temp_${Date.now()}`;
    const newHighlight = {
      _id: tempId, pdfId, pageNumber, selectedText, color, rects, textQuote, startOffset, endOffset, createdAt: new Date().toISOString(),
    };

    setHighlights((prev) => [...prev, newHighlight]);

    try {
      const saved = await createHighlight(pdfId, pageNumber, selectedText, color, rects, textQuote, startOffset, endOffset);
      setHighlights((prev) => prev.map((h) => (h._id === tempId ? saved : h)));
      return saved;
    } catch (err) {
      console.error("Failed to add highlight:", err);
      setHighlights((prev) => prev.filter((h) => h._id !== tempId));
      throw err;
    }
  }, [pdfId, highlightsByPage]);

  const highlightsForPage = useCallback((pageNumber) => {
    return highlightsByPage[pageNumber] || [];
  }, [highlightsByPage]);

  return {
    highlights, highlightsByPage, isLoading, error, addHighlight, removeHighlight, highlightsForPage, setHighlights,
  };
}
