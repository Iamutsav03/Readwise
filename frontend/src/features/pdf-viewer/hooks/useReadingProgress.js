/**
 * useReadingProgress.js
 * ─────────────────────
 * Derives reading progress from current page and total pages.
 * Also tracks which pages have been visited in this session.
 *
 * Usage:
 *   const { progressPct, pagesVisited } = useReadingProgress({ pageNumber, numPages });
 *
 * Returns:
 *   progressPct  – 0–100 float, rounded to 1 decimal
 *   pagesVisited – Set of page numbers seen this session
 */

import { useEffect, useRef, useState } from "react";

export function useReadingProgress({ pageNumber, numPages }) {
    const [pagesVisited, setPagesVisited] = useState(new Set());
    const prevPdfPageRef = useRef(null);

    // Track visited pages
    useEffect(() => {
        if (!pageNumber || !numPages) return;
        setPagesVisited((prev) => {
            if (prev.has(pageNumber)) return prev;
            const next = new Set(prev);
            next.add(pageNumber);
            return next;
        });
    }, [pageNumber, numPages]);

    const progressPct =
        numPages > 0
            ? Math.min(100, parseFloat(((pageNumber / numPages) * 100).toFixed(1)))
            : 0;

    return { progressPct, pagesVisited };
}