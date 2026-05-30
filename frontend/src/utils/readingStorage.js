/**
 * readingStorage.js
 * ─────────────────
 * Thin wrapper around localStorage for persisting per-PDF reading state.
 * All functions are pure and side-effect-free outside of localStorage.
 *
 * Storage schema (keyed by pdf._id):
 * {
 *   pageNumber : number,   // last visited page
 *   scale      : number,   // last zoom level
 *   savedAt    : string,   // ISO timestamp for debugging / future TTL
 * }
 */

const STORAGE_PREFIX = "readwise:position:";

const key = (pdfId) => `${STORAGE_PREFIX}${pdfId}`;

/**
 * Save reading position for a PDF.
 * @param {string} pdfId
 * @param {{ pageNumber: number, scale: number }} state
 */
export function savePosition(pdfId, { pageNumber, scale }) {
    if (!pdfId) return;
    try {
        const payload = JSON.stringify({ pageNumber, scale, savedAt: new Date().toISOString() });
        localStorage.setItem(key(pdfId), payload);
    } catch {
        // Quota exceeded or private browsing — fail silently.
    }
}

/**
 * Load saved reading position for a PDF.
 * @param {string} pdfId
 * @returns {{ pageNumber: number, scale: number } | null}
 */
export function loadPosition(pdfId) {
    if (!pdfId) return null;
    try {
        const raw = localStorage.getItem(key(pdfId));
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        // Validate shape before trusting it.
        if (
            typeof parsed.pageNumber === "number" &&
            typeof parsed.scale === "number" &&
            parsed.pageNumber >= 1 &&
            parsed.scale > 0
        ) {
            return { pageNumber: parsed.pageNumber, scale: parsed.scale };
        }
        return null;
    } catch {
        return null;
    }
}

/**
 * Remove saved position (e.g. when PDF is deleted).
 * @param {string} pdfId
 */
export function clearPosition(pdfId) {
    if (!pdfId) return;
    try {
        localStorage.removeItem(key(pdfId));
    } catch {
        // ignore
    }
}