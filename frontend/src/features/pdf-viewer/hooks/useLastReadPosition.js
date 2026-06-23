/**
 * useLastReadPosition.js
 * ──────────────────────
 * Loads the saved reading position when a PDF is opened,
 * and persists updates (debounced) whenever page or scale changes.
 *
 * Usage:
 *   const { positionLoaded } = useLastReadPosition({
 *     pdfId, pageNumber, scale, onPageChange, onScaleChange
 *   });
 *
 * Returns:
 *   positionLoaded – boolean, true once the saved state has been applied
 *                   (use to guard UI until the correct page is shown)
 */

import { useEffect, useRef, useState } from "react";
import { loadPosition, savePosition } from "../../../utils/readingStorage";
import { useAuth } from "../../auth/useAuth";
import { getProgress, saveProgress } from "../../../services/progressService";

const SAVE_DEBOUNCE_MS = 800;

export function useLastReadPosition({
    pdfId,
    pageNumber,
    numPages,
    scale,
    activeTab,
    onPageChange,
    onScaleChange,
    onActiveTabChange,
}) {
    const { user } = useAuth();
    const [positionLoaded, setPositionLoaded] = useState(false);
    const saveTimer = useRef(null);
    const lastLoadedId = useRef(null);

    // ── Restore on PDF open ──────────────────────────────────────────────────
    useEffect(() => {
        if (!pdfId || !user || lastLoadedId.current === pdfId) return;
        lastLoadedId.current = pdfId;
        setPositionLoaded(false);

        const restore = (saved) => {
            if (saved) {
                if (saved.pageNumber) onPageChange(saved.pageNumber);
                if (saved.scale) onScaleChange(saved.scale);
                if (saved.activeTab && onActiveTabChange) onActiveTabChange(saved.activeTab);
            }
            requestAnimationFrame(() => setPositionLoaded(true));
        };

        // Try API first, fallback to localStorage
        getProgress(pdfId).then((progress) => {
            restore(progress);
        }).catch(() => {
            restore(loadPosition(user.id, pdfId));
        });

    }, [pdfId, user, onPageChange, onScaleChange, onActiveTabChange]);

    // ── Persist on change (debounced) ────────────────────────────────────────
    useEffect(() => {
        if (!pdfId || !user || !positionLoaded) return;
        clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => {
            const data = { pageNumber, numPages, scale, activeTab };
            savePosition(user.id, pdfId, data);
            saveProgress(pdfId, data).catch(err => console.error("Failed to sync progress to DB", err));
        }, SAVE_DEBOUNCE_MS);
        return () => clearTimeout(saveTimer.current);
    }, [pdfId, user, pageNumber, numPages, scale, activeTab, positionLoaded]);

    return { positionLoaded };
}