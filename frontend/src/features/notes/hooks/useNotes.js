import { useState, useEffect, useCallback } from "react";
import * as notesApi from "../services/notesApi";

export function useNotes(pdfId) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all notes for a specific PDF
  const fetchNotes = useCallback(async () => {
    if (!pdfId) {
      setNotes([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await notesApi.getNotesForPdf(pdfId);
      // Sort by pageNumber ascending, then by y coordinate or creation time
      const sorted = [...data].sort((a, b) => {
        if (a.pageNumber !== b.pageNumber) {
          return a.pageNumber - b.pageNumber;
        }
        return (a.y || 0) - (b.y || 0) || new Date(a.createdAt) - new Date(b.createdAt);
      });
      setNotes(sorted);
    } catch (err) {
      console.error("Error fetching notes:", err);
      setError(err.message || "Failed to fetch notes.");
    } finally {
      setLoading(false);
    }
  }, [pdfId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Create a note
  const createNote = useCallback(async (pageNumber, initialData = {}) => {
    if (!pdfId) return null;
    setError(null);

    // Calculate a default position: at the end of the page's notes or offset
    const pageNotes = notes.filter((n) => n.pageNumber === pageNumber);
    const defaultY = pageNotes.length * 200; // Visual stacked offset

    const payload = {
      pdfId,
      pageNumber,
      content: initialData.content || "",
      color: initialData.color || "yellow",
      width: initialData.width || 280,
      height: initialData.height || 180,
      x: initialData.x !== undefined ? initialData.x : 10, // Default percent x
      y: initialData.y !== undefined ? initialData.y : 10 + pageNotes.length * 15, // Default percent y
    };

    // Optimistic temporary note
    const tempId = `temp-${Date.now()}`;
    const tempNote = {
      _id: tempId,
      ...payload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setNotes((prev) => {
      const updated = [...prev, tempNote];
      return updated.sort((a, b) => {
        if (a.pageNumber !== b.pageNumber) return a.pageNumber - b.pageNumber;
        return (a.y || 0) - (b.y || 0);
      });
    });

    try {
      const savedNote = await notesApi.createNote(payload);
      setNotes((prev) => prev.map((n) => (n._id === tempId ? savedNote : n)));
      return savedNote;
    } catch (err) {
      console.error("Error creating note:", err);
      setError("Failed to create note. Rolling back.");
      // Rollback optimistic update
      setNotes((prev) => prev.filter((n) => n._id !== tempId));
      throw err;
    }
  }, [pdfId, notes]);

  // Update a note
  const updateNote = useCallback(async (noteId, updateFields) => {
    setError(null);
    let originalNotes;

    setNotes((prev) => {
      originalNotes = prev;
      const updated = prev.map((n) =>
        n._id === noteId ? { ...n, ...updateFields, updatedAt: new Date().toISOString() } : n
      );
      // Re-sort in case y position or pageNumber changed
      return updated.sort((a, b) => {
        if (a.pageNumber !== b.pageNumber) return a.pageNumber - b.pageNumber;
        return (a.y || 0) - (b.y || 0);
      });
    });

    try {
      const updatedNote = await notesApi.updateNote(noteId, updateFields);
      // Replace with backend's confirmed state
      setNotes((prev) => prev.map((n) => (n._id === noteId ? updatedNote : n)));
      return updatedNote;
    } catch (err) {
      console.error("Error updating note:", err);
      setError("Failed to update note. Rolling back.");
      if (originalNotes) {
        setNotes(originalNotes);
      }
      throw err;
    }
  }, []);

  // Delete a note
  const deleteNote = useCallback(async (noteId) => {
    setError(null);
    let originalNotes;

    setNotes((prev) => {
      originalNotes = prev;
      return prev.filter((n) => n._id !== noteId);
    });

    try {
      await notesApi.deleteNote(noteId);
    } catch (err) {
      console.error("Error deleting note:", err);
      setError("Failed to delete note. Rolling back.");
      if (originalNotes) {
        setNotes(originalNotes);
      }
      throw err;
    }
  }, []);

  return {
    notes,
    createNote,
    updateNote,
    deleteNote,
    loading,
    error,
    refetch: fetchNotes,
  };
}
