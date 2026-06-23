// features/ai/hooks/useTextSelection.js
import { useState, useEffect, useCallback } from "react";

const MAX_SELECTION_LENGTH = 1500;

/**
 * Detects text selection within a specific container (the scroll host).
 * Returns selection info and positions for the floating toolbar.
 * Includes character limits and optional surrounding context extraction.
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
      // Don't trigger if clicking inside floating toolbars
      if (e.target.closest(".selection-toolbar") || e.target.closest(".highlight-toolbar")) return;

      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        if (selectionInfo && !e.target.closest(".selection-toolbar")) {
          setSelectionInfo(null);
        }
        return;
      }

      const text = selection.toString().trim();
      if (!text) {
        setSelectionInfo(null);
        return;
      }

      if (text.length > MAX_SELECTION_LENGTH) {
        alert("Please select a smaller portion of text.");
        clearSelection();
        return;
      }

      const range = selection.getRangeAt(0);

      if (containerRef.current && !containerRef.current.contains(range.commonAncestorContainer)) {
        return;
      }

      // Find the page number (supports both react-pdf and Reading Mode structured content)
      const node = range.commonAncestorContainer.nodeType === 3
        ? range.commonAncestorContainer.parentElement
        : range.commonAncestorContainer;

      const pageEl = node?.closest ? (node.closest(".react-pdf__Page") || node.closest("[data-page]")) : null;
      if (!pageEl) return;

      const pageNumberAttr = pageEl.getAttribute("data-page-number") || pageEl.getAttribute("data-page");
      const pageNumber = parseInt(pageNumberAttr, 10);
      if (isNaN(pageNumber)) return;

      // Extract text offsets if in Reading Mode (which uses [data-start-offset] blocks)
      let startOffset = null;
      let endOffset = null;
      let textQuote = text;
      
      const startBlock = range.startContainer.nodeType === 3 ? range.startContainer.parentElement.closest("[data-start-offset]") : (range.startContainer.closest ? range.startContainer.closest("[data-start-offset]") : null);
      const endBlock = range.endContainer.nodeType === 3 ? range.endContainer.parentElement.closest("[data-start-offset]") : (range.endContainer.closest ? range.endContainer.closest("[data-start-offset]") : null);

      if (startBlock && endBlock) {
        const getOffsetWithinBlock = (blockNode, targetContainer, targetOffset) => {
          let offset = 0;
          const walk = document.createTreeWalker(blockNode, NodeFilter.SHOW_TEXT, null, false);
          let curr = walk.nextNode();
          while (curr) {
            if (curr === targetContainer) return offset + targetOffset;
            offset += curr.textContent.length;
            curr = walk.nextNode();
          }
          return offset;
        };
        
        const blockStart = parseInt(startBlock.getAttribute("data-start-offset") || "0", 10);
        startOffset = blockStart + getOffsetWithinBlock(startBlock, range.startContainer, range.startOffset);
        
        const blockEnd = parseInt(endBlock.getAttribute("data-start-offset") || "0", 10);
        endOffset = blockEnd + getOffsetWithinBlock(endBlock, range.endContainer, range.endOffset);
        
        textQuote = text;
      }

      const rect = range.getBoundingClientRect();

      // Position relative to viewport (for Portals)
      const top = rect.top;
      const left = rect.left;
      const width = rect.width;
      const height = rect.height;

      setSelectionInfo({
        text,
        textQuote,
        startOffset,
        endOffset,
        range,
        pageNumber,
        pageEl,
        toolbarPosition: { top, left, width, height },
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
      // Also handle touchend for mobile selection
      container.addEventListener("touchend", handleMouseUp);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      if (container) {
        container.removeEventListener("mouseup", handleMouseUp);
        container.removeEventListener("touchend", handleMouseUp);
      }
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [containerRef, clearSelection, selectionInfo]);

  return { selectionInfo, clearSelection };
}
