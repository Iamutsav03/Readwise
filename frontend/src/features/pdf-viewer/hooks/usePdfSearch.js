/**
 * usePdfSearch.js
 * ───────────────
 * Owns all search state and orchestrates debounced API calls.
 *
 * Usage:
 *   const search = usePdfSearch(pdfId);
 *   <input value={search.query} onChange={e => search.setQuery(e.target.value)} />
 *   search.results, search.totalMatches, search.isSearching, search.error
 *   search.clearQuery()
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { searchPDF } from "../../../services/pdfService";

const DEBOUNCE_MS = 380;

export function usePdfSearch(pdfId) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [totalMatches, setTotalMatches] = useState(0);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState(null);

    // Used to cancel stale requests when a new one fires.
    const abortRef = useRef(null);
    const timerRef = useRef(null);

    // Clear everything when the PDF changes.
    useEffect(() => {
        setQuery("");
        setResults([]);
        setTotalMatches(0);
        setError(null);
        setIsSearching(false);
    }, [pdfId]);

    // Debounced search effect — fires whenever query or pdfId change.
    useEffect(() => {
        clearTimeout(timerRef.current);
        abortRef.current?.abort();

        const trimmed = query.trim();

        // Reset results instantly when input is cleared so UI updates immediately.
        if (!trimmed) {
            setResults([]);
            setTotalMatches(0);
            setIsSearching(false);
            setError(null);
            return;
        }

        setIsSearching(true);
        setError(null);

        timerRef.current = setTimeout(async () => {
            const controller = new AbortController();
            abortRef.current = controller;

            try {
                const data = await searchPDF(pdfId, trimmed);

                // Ignore if a newer request has already fired.
                if (controller.signal.aborted) return;

                setResults(data.results ?? []);
                setTotalMatches(data.totalMatches ?? 0);
            } catch (err) {
                if (controller.signal.aborted) return;
                setError(err.message ?? "Search failed.");
                setResults([]);
                setTotalMatches(0);
            } finally {
                if (!controller.signal.aborted) setIsSearching(false);
            }
        }, DEBOUNCE_MS);

        return () => {
            clearTimeout(timerRef.current);
        };
    }, [query, pdfId]);

    const clearQuery = useCallback(() => {
        setQuery("");
        setResults([]);
        setTotalMatches(0);
        setError(null);
        setIsSearching(false);
    }, []);

    return {
        query,
        setQuery,
        results,
        totalMatches,
        isSearching,
        error,
        clearQuery,
    };
}