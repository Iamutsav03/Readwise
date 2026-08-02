// features/ai/hooks/useTextSelection.js
// v2: Improved mobile text selection.
//   - Uses selectionchange event (fires after handle drag, before touchend)
//   - 150ms debounce to stabilize selection before showing toolbar
//   - Stores and restores the Range if browser clears it when toolbar mounts
//   - Blocks native context menu on the scroll host via onContextMenu (handled in consumer)
//   - Keeps mouseup for desktop compatibility

import { useState, useEffect, useCallback, useRef } from "react";

const MAX_SELECTION_LENGTH = 1500;
const SELECTION_DEBOUNCE_MS = 800;

/**
 * Detects text selection within a specific container (the scroll host).
 * Returns selection info and positions for the floating toolbar.
 * Includes character limits and optional surrounding context extraction.
 */
export function useTextSelection(containerRef) {
  const [selectionInfo, setSelectionInfo] = useState(null);
  const debounceTimer = useRef(null);
  const savedRange = useRef(null); // Saved Range for restoration if browser clears it

  const clearSelection = useCallback(() => {
    setSelectionInfo(null);
    savedRange.current = null;
    if (window.getSelection) {
      window.getSelection().removeAllRanges();
    }
  }, []);

  // Restore saved range if the browser accidentally deselects text
  // (happens on iOS when floating UI mounts)
  const restoreSelection = useCallback(() => {
    if (!savedRange.current) return;
    try {
      const sel = window.getSelection();
      if (sel && (sel.isCollapsed || !sel.toString())) {
        sel.removeAllRanges();
        sel.addRange(savedRange.current);
      }
    } catch (_) { /* ignore cross-document errors */ }
  }, []);

  const processSelection = useCallback((e) => {
    // Don't trigger if clicking inside floating toolbars
    if (e?.target?.closest?.(".selection-toolbar") || e?.target?.closest?.(".highlight-toolbar")) return;

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      // Only clear if not clicking inside a toolbar
      if (selectionInfo && !e?.target?.closest?.(".selection-toolbar")) {
        setSelectionInfo(null);
        savedRange.current = null;
      }
      return;
    }

    const text = selection.toString().trim();
    if (!text) {
      setSelectionInfo(null);
      savedRange.current = null;
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

    const startBlock = range.startContainer.nodeType === 3
      ? range.startContainer.parentElement.closest("[data-start-offset]")
      : (range.startContainer.closest ? range.startContainer.closest("[data-start-offset]") : null);
    const endBlock = range.endContainer.nodeType === 3
      ? range.endContainer.parentElement.closest("[data-start-offset]")
      : (range.endContainer.closest ? range.endContainer.closest("[data-start-offset]") : null);

    if (startBlock && endBlock) {
      const getOffsetWithinBlock = (blockNode, targetContainer, targetOffset) => {
        try {
          const tempRange = document.createRange();
          tempRange.selectNodeContents(blockNode);
          tempRange.setEnd(targetContainer, targetOffset);
          return tempRange.toString().length;
        } catch (e) {
          return 0;
        }
      };

      const blockStart = parseInt(startBlock.getAttribute("data-start-offset") || "0", 10);
      startOffset = blockStart + getOffsetWithinBlock(startBlock, range.startContainer, range.startOffset);

      const blockEnd = parseInt(endBlock.getAttribute("data-start-offset") || "0", 10);
      endOffset = blockEnd + getOffsetWithinBlock(endBlock, range.endContainer, range.endOffset);

      textQuote = text;
    }

    const rect = range.getBoundingClientRect();
    const top = rect.top;
    const left = rect.left;
    const width = rect.width;
    const height = rect.height;

    // Save range so we can restore if browser clears it
    try {
      savedRange.current = range.cloneRange();
    } catch (_) { savedRange.current = null; }

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
  }, [containerRef, clearSelection, selectionInfo]);

  useEffect(() => {
    const handleMouseUp = (e) => {
      processSelection(e);
    };

    // selectionchange fires on mobile after the user releases text handles
    // We debounce it to wait for the selection to stabilize
    const handleSelectionChange = () => {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        processSelection(null);
      }, SELECTION_DEBOUNCE_MS);
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        clearSelection();
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("selectionchange", handleSelectionChange);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      clearTimeout(debounceTimer.current);
      if (container) {
        container.removeEventListener("mouseup", handleMouseUp);
      }
      document.removeEventListener("selectionchange", handleSelectionChange);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [containerRef, processSelection, clearSelection]);

  return { selectionInfo, clearSelection, restoreSelection };
}
