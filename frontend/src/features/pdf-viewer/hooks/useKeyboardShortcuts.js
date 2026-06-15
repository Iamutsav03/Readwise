// src/components/hooks/useKeyboardShortcuts.js
// Hook for listening to global keyboard shortcuts in the PDF Reader view.

import { useEffect } from "react";

export function useKeyboardShortcuts({
  onPrev,
  onNext,
  onToggleBookmark,
  setActiveTab,
  undoHighlight,
  redoHighlight,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Helper to check if the target is an editable input or field
      const isInputField = (el) => {
        if (!el) return false;
        const tagName = el.tagName;
        return (
          tagName === "INPUT" ||
          tagName === "TEXTAREA" ||
          tagName === "SELECT" ||
          el.isContentEditable
        );
      };

      const inInput = isInputField(e.target);

      // Escape key closes search panel, even when focused on search input
      if (e.key === "Escape") {
        e.preventDefault();
        setActiveTab(null);
        return;
      }

      // If typing inside an input field, ignore all other reader shortcuts
      if (inInput) return;

      // Ctrl + F -> Toggle search panel
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        setActiveTab("search");
        return;
      }

      // Arrow Left -> Previous page
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        onPrev();
        return;
      }

      // Arrow Right -> Next page
      if (e.key === "ArrowRight") {
        e.preventDefault();
        onNext();
        return;
      }

      // Ctrl + B -> Toggle bookmark on current page
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        onToggleBookmark();
        return;
      }
      // Ctrl+Z: Undo highlight
      if (e.ctrlKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undoHighlight?.();
        return;
      }

      // Ctrl+Y: Redo highlight
      if (e.ctrlKey && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redoHighlight?.();
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onPrev, onNext, onToggleBookmark, setActiveTab]);
}
