// src/components/hooks/useHighlights.js
import { useState, useEffect, useCallback, useMemo } from "react";
import { createHighlight, getHighlightsForPdf, deleteHighlight as apiDeleteHighlight } from "../../utils/highlightApi";

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
    return () => {
      isMounted = false;
    };
  }, [pdfId]);

  const addHighlight = useCallback(async (pageNumber, selectedText, color, rects) => {
    // Optimistic UI update
    const tempId = `temp_${Date.now()}`;
    const newHighlight = {
      _id: tempId,
      pdfId,
      pageNumber,
      selectedText,
      color,
      rects,
      createdAt: new Date().toISOString(),
    };

    setHighlights((prev) => [...prev, newHighlight]);

    try {
      const saved = await createHighlight(pdfId, pageNumber, selectedText, color, rects);
      setHighlights((prev) => prev.map((h) => (h._id === tempId ? saved : h)));
      return saved;
    } catch (err) {
      console.error("Failed to add highlight:", err);
      // Rollback
      setHighlights((prev) => prev.filter((h) => h._id !== tempId));
      throw err;
    }
  }, [pdfId]);

  const removeHighlight = useCallback(async (id) => {
    // Find the highlight to potentially rollback
    const highlightToRemove = highlights.find((h) => h._id === id);
    if (!highlightToRemove) return;

    // Optimistic remove
    setHighlights((prev) => prev.filter((h) => h._id !== id));

    try {
      await apiDeleteHighlight(id);
      return highlightToRemove;
    } catch (err) {
      console.error("Failed to delete highlight:", err);
      // Rollback
      setHighlights((prev) => [...prev, highlightToRemove]);
      throw err;
    }
  }, [highlights]);

  // Expose selector for a specific page
  const highlightsForPage = useCallback((pageNumber) => {
    return highlights.filter((h) => h.pageNumber === pageNumber);
  }, [highlights]);

  return {
    highlights,
    isLoading,
    error,
    addHighlight,
    removeHighlight,
    highlightsForPage,
    // Provide a way to manually set state from history (undo/redo)
    setHighlights,
  };
}
