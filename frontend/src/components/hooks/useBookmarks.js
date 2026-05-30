// src/components/hooks/useBookmarks.js
// Hook for managing bookmarks with optimistic UI updates and backend synchronization.

import { useState, useEffect, useCallback } from "react";
import { createBookmark, getBookmarksForPdf, removeBookmark } from "../../utils/bookmarkApi";

export function useBookmarks(pdfId) {
  const [bookmarks, setBookmarks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch bookmarks when pdfId changes
  useEffect(() => {
    if (!pdfId) {
      setBookmarks([]);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    getBookmarksForPdf(pdfId)
      .then((data) => {
        if (isMounted) {
          // Sort ascending by page number
          const sorted = [...data].sort((a, b) => a.pageNumber - b.pageNumber);
          setBookmarks(sorted);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || "Failed to load bookmarks.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [pdfId]);

  // Check if a page is bookmarked
  const isPageBookmarked = useCallback(
    (pageNumber) => {
      return bookmarks.some((b) => b.pageNumber === pageNumber);
    },
    [bookmarks]
  );

  // Add bookmark optimistically
  const addBookmark = useCallback(
    async (pageNumber) => {
      if (!pdfId) return;
      if (bookmarks.some((b) => b.pageNumber === pageNumber)) return; // Prevent duplicate

      const tempId = `temp-${Date.now()}`;
      const newBookmark = {
        _id: tempId,
        pdfId,
        pageNumber,
        createdAt: new Date().toISOString(),
      };

      const previousBookmarks = bookmarks;

      // Update state immediately, sorted ascending
      setBookmarks((prev) =>
        [...prev, newBookmark].sort((a, b) => a.pageNumber - b.pageNumber)
      );

      try {
        const saved = await createBookmark(pdfId, pageNumber);
        // Replace temporary local ID with DB ID
        setBookmarks((prev) =>
          prev.map((b) => (b._id === tempId ? saved : b))
        );
      } catch (err) {
        console.error("Add bookmark failed:", err);
        setError("Failed to add bookmark. Rolling back.");
        setBookmarks(previousBookmarks); // Rollback
      }
    },
    [pdfId, bookmarks]
  );

  // Delete bookmark optimistically
  const deleteBookmark = useCallback(
    async (pageNumber) => {
      if (!pdfId) return;

      const previousBookmarks = bookmarks;

      // Update state immediately
      setBookmarks((prev) => prev.filter((b) => b.pageNumber !== pageNumber));

      try {
        await removeBookmark(pdfId, pageNumber);
      } catch (err) {
        console.error("Delete bookmark failed:", err);
        setError("Failed to delete bookmark. Rolling back.");
        setBookmarks(previousBookmarks); // Rollback
      }
    },
    [pdfId, bookmarks]
  );

  // Toggle bookmark
  const toggleBookmark = useCallback(
    async (pageNumber) => {
      if (isPageBookmarked(pageNumber)) {
        await deleteBookmark(pageNumber);
      } else {
        await addBookmark(pageNumber);
      }
    },
    [isPageBookmarked, addBookmark, deleteBookmark]
  );

  return {
    bookmarks,
    isLoading,
    error,
    addBookmark,
    deleteBookmark,
    toggleBookmark,
    isPageBookmarked,
  };
}
