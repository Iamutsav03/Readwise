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
import { loadPosition, savePosition } from "../../utils/readingStorage";

const SAVE_DEBOUNCE_MS = 800;

export function useLastReadPosition({
    pdfId,
    pageNumber,
    scale,
    onPageChange,
    onScaleChange,
}) {
    const [positionLoaded, setPositionLoaded] = useState(false);
    const saveTimer = useRef(null);
    // Track the id we last loaded so switching PDFs always restores correctly.
    const lastLoadedId = useRef(null);

    // ── Restore on PDF open ──────────────────────────────────────────────────
    useEffect(() => {
        if (!pdfId || lastLoadedId.current === pdfId) return;
        lastLoadedId.current = pdfId;
        setPositionLoaded(false);

        const saved = loadPosition(pdfId);
        if (saved) {
            onPageChange(saved.pageNumber);
            onScaleChange(saved.scale);
        }
        // Mark as loaded whether or not there was saved state.
        // (A short rAF gives state setters time to flush before the viewer renders.)
        requestAnimationFrame(() => setPositionLoaded(true));
    }, [pdfId, onPageChange, onScaleChange]);

    // ── Persist on change (debounced) ────────────────────────────────────────
    useEffect(() => {
        if (!pdfId || !positionLoaded) return;
        clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => {
            savePosition(pdfId, { pageNumber, scale });
        }, SAVE_DEBOUNCE_MS);
        return () => clearTimeout(saveTimer.current);
    }, [pdfId, pageNumber, scale, positionLoaded]);

    return { positionLoaded };
}