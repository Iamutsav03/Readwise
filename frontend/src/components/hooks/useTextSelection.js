// src/components/hooks/useTextSelection.js
import { useState, useEffect, useCallback } from "react";

/**
 * Detects text selection within a specific container (the scroll host).
 * Returns selection info and positions for the floating toolbar.
 */
export function useTextSelection(containerRef) {
  const [selectionInfo, setSelectionInfo] = useState(null);

  const clearSelection = useCallback(() => {
    setSelectionInfo(null);
    if (window.getSelection) {
      window.getSelection().removeAllRanges();
    }
  }, []);

  useEffect(() => {
    const handleMouseUp = (e) => {
      // Don't trigger if clicking inside a floating toolbar or panels
      if (e.target.closest(".highlight-toolbar")) return;

      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        // Only clear if we aren't clicking inside the toolbar
        if (selectionInfo && !e.target.closest(".highlight-toolbar")) {
           setSelectionInfo(null);
        }
        return;
      }

      const text = selection.toString().trim();
      if (!text) {
        setSelectionInfo(null);
        return;
      }

      const range = selection.getRangeAt(0);
      
      // Ensure the selection is inside our container
      if (containerRef.current && !containerRef.current.contains(range.commonAncestorContainer)) {
        return;
      }

      // We need to figure out which page we are on.
      // react-pdf pages have the class .react-pdf__Page
      const node = range.commonAncestorContainer.nodeType === 3 
        ? range.commonAncestorContainer.parentElement 
        : range.commonAncestorContainer;
        
      const pageEl = node?.closest ? node.closest(".react-pdf__Page") : null;
      if (!pageEl) return;
      
      const pageNumber = parseInt(pageEl.getAttribute("data-page-number"), 10);
      if (isNaN(pageNumber)) return;

      const rect = range.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();

      // Position relative to the container for the toolbar
      const top = rect.top - containerRect.top + containerRef.current.scrollTop;
      const left = rect.left - containerRect.left + containerRef.current.scrollLeft;
      const width = rect.width;

      setSelectionInfo({
        text,
        range,
        pageNumber,
        pageEl,
        toolbarPosition: { top, left, width },
      });
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        clearSelection();
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      if (container) {
        container.removeEventListener("mouseup", handleMouseUp);
      }
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [containerRef, clearSelection, selectionInfo]);

  return { selectionInfo, clearSelection };
}
