/**
 * readingStorage.js
 * ─────────────────
 * Thin wrapper around localStorage for persisting per-PDF reading state.
 * All functions are pure and side-effect-free outside of localStorage.
 *
 * Storage schema (keyed by pdf._id):
 * {
 *   pageNumber : number,   // last visited page
 *   numPages   : number,   // total pages
 *   scale      : number,   // last zoom level
 *   activeTab  : string,   // active side panel tab
 *   savedAt    : string,   // ISO timestamp for debugging / future TTL
 * }
 */

import readingProgressStore from "./readingProgressStore";

const STORAGE_PREFIX = "readwise:position:";

const key = (userId, pdfId) => `${STORAGE_PREFIX}${userId}:${pdfId}`;

/**
 * Save reading position for a PDF.
 * @param {string} userId
 * @param {string} pdfId
 * @param {{ pageNumber: number, numPages: number, scale: number, activeTab: string }} state
 */
export function savePosition(userId, pdfId, { pageNumber, numPages, scale, activeTab }) {
    if (!pdfId || !userId) return;
    try {
        const payload = JSON.stringify({ pageNumber, numPages, scale, activeTab, savedAt: new Date().toISOString() });
        localStorage.setItem(key(userId, pdfId), payload);
        // Notify all in-process subscribers immediately (no round-trip through DOM events)
        readingProgressStore.set({ pdfId, pageNumber, numPages });
    } catch {
        // Quota exceeded or private browsing — fail silently.
    }
}

/**
 * Load saved reading position for a PDF.
 * @param {string} userId
 * @param {string} pdfId
 * @returns {{ pageNumber: number, numPages: number, scale: number, activeTab: string } | null}
 */
export function loadPosition(userId, pdfId) {
    if (!pdfId || !userId) return null;
    try {
        const raw = localStorage.getItem(key(userId, pdfId));
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        // Validate shape before trusting it.
        if (
            typeof parsed.pageNumber === "number" &&
            typeof parsed.scale === "number" &&
            parsed.pageNumber >= 1 &&
            parsed.scale > 0
        ) {
            return { 
                pageNumber: parsed.pageNumber, 
                numPages: parsed.numPages || 0,
                scale: parsed.scale, 
                activeTab: parsed.activeTab || null 
            };
        }
        return null;
    } catch {
        return null;
    }
}

/**
 * Remove saved position (e.g. when PDF is deleted).
 * @param {string} userId
 * @param {string} pdfId
 */
export function clearPosition(userId, pdfId) {
    if (!pdfId || !userId) return;
    try {
        localStorage.removeItem(key(userId, pdfId));
    } catch {
        // ignore
    }
}