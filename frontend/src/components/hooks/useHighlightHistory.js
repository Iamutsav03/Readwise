// src/components/hooks/useHighlightHistory.js
import { useRef, useState, useCallback, useEffect } from "react";
import { createHighlight, deleteHighlight as apiDeleteHighlight } from "../../utils/highlightApi";

export function useHighlightHistory(pdfId, setHighlights) {
  const undoStack = useRef([]);
  const redoStack = useRef([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Clear history when PDF changes
  useEffect(() => {
    undoStack.current = [];
    redoStack.current = [];
    setCanUndo(false);
    setCanRedo(false);
  }, [pdfId]);

  const updateState = () => {
    setCanUndo(undoStack.current.length > 0);
    setCanRedo(redoStack.current.length > 0);
  };

  /**
   * Action signature:
   * {
   *   type: 'add' | 'remove',
   *   highlight: { ...data }
   * }
   */
  const pushAction = useCallback((action) => {
    undoStack.current.push(action);
    redoStack.current = []; // Clear redo stack on new action
    updateState();
  }, []);

  const undo = useCallback(async () => {
    if (undoStack.current.length === 0) return;
    const action = undoStack.current.pop();

    try {
      if (action.type === "add") {
        // Reverse of 'add' is 'remove'
        await apiDeleteHighlight(action.highlight._id);
        setHighlights((prev) => prev.filter((h) => h._id !== action.highlight._id));
      } else if (action.type === "remove") {
        // Reverse of 'remove' is 'add'
        const saved = await createHighlight(
          action.highlight.pdfId,
          action.highlight.pageNumber,
          action.highlight.selectedText,
          action.highlight.color,
          action.highlight.rects
        );
        // Update the action with the newly generated ID from the DB so redo knows how to remove it
        action.highlight = saved; 
        setHighlights((prev) => [...prev, saved]);
      }
      redoStack.current.push(action);
      updateState();
    } catch (err) {
      console.error("Undo failed:", err);
      // Revert stack on failure
      undoStack.current.push(action);
      updateState();
    }
  }, [setHighlights]);

  const redo = useCallback(async () => {
    if (redoStack.current.length === 0) return;
    const action = redoStack.current.pop();

    try {
      if (action.type === "add") {
        // Replay 'add'
        const saved = await createHighlight(
          action.highlight.pdfId,
          action.highlight.pageNumber,
          action.highlight.selectedText,
          action.highlight.color,
          action.highlight.rects
        );
        action.highlight = saved;
        setHighlights((prev) => [...prev, saved]);
      } else if (action.type === "remove") {
        // Replay 'remove'
        await apiDeleteHighlight(action.highlight._id);
        setHighlights((prev) => prev.filter((h) => h._id !== action.highlight._id));
      }
      undoStack.current.push(action);
      updateState();
    } catch (err) {
      console.error("Redo failed:", err);
      // Revert stack on failure
      redoStack.current.push(action);
      updateState();
    }
  }, [setHighlights]);

  return {
    pushAction,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
