// features/auth/hooks/useGuestSession.js
// Manages the anonymous guest session using localStorage.
// Provides: guestId, local data stores (highlights, bookmarks, vocabulary, progress),
// and the migrateToAccount function called upon signup/login.

import { useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "../../../config";

const STORAGE_KEY_GUEST_ID    = "rw_guest_id";
const STORAGE_KEY_HIGHLIGHTS  = "rw_guest_highlights";
const STORAGE_KEY_BOOKMARKS   = "rw_guest_bookmarks";
const STORAGE_KEY_VOCABULARY  = "rw_guest_vocabulary";
const STORAGE_KEY_PROGRESS    = "rw_guest_progress";
const STORAGE_KEY_USAGE       = "rw_guest_usage";

/** Generate a UUID v4 */
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function readLS(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeLS(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* storage full, ignore */ }
}

// ── Initial usage state ────────────────────────────────────────────────────────
const DEFAULT_USAGE = { quickExplainUsed: 0, deepExplainUsed: 0, uploadedPdfCount: 0 };

export function useGuestSession() {
  // Ensure a stable guestId persists across sessions
  const [guestId] = useState(() => {
    let id = localStorage.getItem(STORAGE_KEY_GUEST_ID);
    if (!id) {
      id = generateUUID();
      localStorage.setItem(STORAGE_KEY_GUEST_ID, id);
    }
    return id;
  });

  const [guestHighlights, setGuestHighlights] = useState(() =>
    readLS(STORAGE_KEY_HIGHLIGHTS, [])
  );
  const [guestBookmarks, setGuestBookmarks] = useState(() =>
    readLS(STORAGE_KEY_BOOKMARKS, [])
  );
  const [guestVocabulary, setGuestVocabulary] = useState(() =>
    readLS(STORAGE_KEY_VOCABULARY, [])
  );
  const [guestProgress, setGuestProgress] = useState(() =>
    readLS(STORAGE_KEY_PROGRESS, null)
  );
  const [guestUsage, setGuestUsage] = useState(() =>
    readLS(STORAGE_KEY_USAGE, DEFAULT_USAGE)
  );

  // Persist state to localStorage whenever it changes
  useEffect(() => writeLS(STORAGE_KEY_HIGHLIGHTS, guestHighlights), [guestHighlights]);
  useEffect(() => writeLS(STORAGE_KEY_BOOKMARKS,  guestBookmarks),  [guestBookmarks]);
  useEffect(() => writeLS(STORAGE_KEY_VOCABULARY, guestVocabulary), [guestVocabulary]);
  useEffect(() => { if (guestProgress) writeLS(STORAGE_KEY_PROGRESS, guestProgress); }, [guestProgress]);
  useEffect(() => writeLS(STORAGE_KEY_USAGE, guestUsage), [guestUsage]);

  // ── Limits ────────────────────────────────────────────────────────────────────
  const LIMITS = { quickExplain: 5, deepExplain: 2, uploadedPdf: 1 };

  const canQuickExplain = guestUsage.quickExplainUsed < LIMITS.quickExplain;
  const canDeepExplain  = guestUsage.deepExplainUsed  < LIMITS.deepExplain;
  const canUploadPdf    = guestUsage.uploadedPdfCount  < LIMITS.uploadedPdf;

  const incrementQuickExplain = useCallback(() => {
    setGuestUsage((prev) => ({ ...prev, quickExplainUsed: prev.quickExplainUsed + 1 }));
  }, []);
  const incrementDeepExplain = useCallback(() => {
    setGuestUsage((prev) => ({ ...prev, deepExplainUsed: prev.deepExplainUsed + 1 }));
  }, []);
  const incrementUploadCount = useCallback(() => {
    setGuestUsage((prev) => ({ ...prev, uploadedPdfCount: prev.uploadedPdfCount + 1 }));
  }, []);

  // ── Local data mutations ──────────────────────────────────────────────────────
  const addGuestHighlight = useCallback((highlight) => {
    const item = { ...highlight, _id: `guest_${Date.now()}`, createdAt: new Date().toISOString() };
    setGuestHighlights((prev) => [...prev, item]);
    return item;
  }, []);

  const removeGuestHighlight = useCallback((id) => {
    setGuestHighlights((prev) => prev.filter((h) => h._id !== id));
  }, []);

  const addGuestBookmark = useCallback((bookmark) => {
    const item = { ...bookmark, _id: `guest_bm_${Date.now()}`, createdAt: new Date().toISOString() };
    setGuestBookmarks((prev) => [...prev, item]);
    return item;
  }, []);

  const removeGuestBookmark = useCallback((id) => {
    setGuestBookmarks((prev) => prev.filter((b) => b._id !== id));
  }, []);

  const addGuestVocabulary = useCallback((word) => {
    const item = { ...word, _id: `guest_v_${Date.now()}`, createdAt: new Date().toISOString() };
    setGuestVocabulary((prev) => [...prev, item]);
    return item;
  }, []);

  const setGuestProgressData = useCallback((data) => {
    setGuestProgress(data);
  }, []);

  // ── Migration ─────────────────────────────────────────────────────────────────
  /**
   * Called after the user signs up or logs in.
   * Sends all local guest data to the backend for merging.
   */
  const migrateToAccount = useCallback(async (token) => {
    try {
      const payload = {
        guestId,
        highlights: guestHighlights,
        bookmarks:  guestBookmarks,
        vocabulary: guestVocabulary,
        readingProgress: guestProgress,
      };

      const res = await fetch(`${API_BASE_URL}/api/auth/migrate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        // Clear all local guest data after successful migration
        clearGuestData();
        console.log("[GuestSession] Migration successful.");
      } else {
        console.error("[GuestSession] Migration failed:", await res.text());
      }
    } catch (err) {
      console.error("[GuestSession] Migration error:", err);
    }
  }, [guestId, guestHighlights, guestBookmarks, guestVocabulary, guestProgress]);

  const clearGuestData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY_GUEST_ID);
    localStorage.removeItem(STORAGE_KEY_HIGHLIGHTS);
    localStorage.removeItem(STORAGE_KEY_BOOKMARKS);
    localStorage.removeItem(STORAGE_KEY_VOCABULARY);
    localStorage.removeItem(STORAGE_KEY_PROGRESS);
    localStorage.removeItem(STORAGE_KEY_USAGE);
    setGuestHighlights([]);
    setGuestBookmarks([]);
    setGuestVocabulary([]);
    setGuestProgress(null);
    setGuestUsage(DEFAULT_USAGE);
  }, []);

  return {
    guestId,
    guestHighlights,
    guestBookmarks,
    guestVocabulary,
    guestProgress,
    guestUsage,
    LIMITS,
    canQuickExplain,
    canDeepExplain,
    canUploadPdf,
    incrementQuickExplain,
    incrementDeepExplain,
    incrementUploadCount,
    addGuestHighlight,
    removeGuestHighlight,
    addGuestBookmark,
    removeGuestBookmark,
    addGuestVocabulary,
    setGuestProgressData,
    migrateToAccount,
    clearGuestData,
  };
}
