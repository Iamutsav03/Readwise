// controllers/searchController.js
// Searches extracted page text for a given query within a specific PDF.

const mongoose = require("mongoose");
const PDF = require("../models/PDF");
const PDFPage = require("../models/PDFPage");

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Count how many times a query string appears in a body of text.
// Matching is case-insensitive.
// ─────────────────────────────────────────────────────────────────────────────
const countMatches = (text, query) => {
    if (!text || !query) return 0;
    // Escape special regex characters in the query so user input is safe
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "gi");
    const found = text.match(regex);
    return found ? found.length : 0;
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Search all pages of a specific PDF for a text query
// @route   POST /api/search/:pdfId
// @access  Public
//
// Request body:  { "query": "deadlock" }
//
// Response:
// {
//   "query": "deadlock",
//   "pdfId": "...",
//   "pdfName": "operating-systems.pdf",
//   "totalMatches": 3,
//   "results": [
//     { "pageNumber": 10, "matchCount": 2, "snippet": "...context..." },
//     { "pageNumber": 17, "matchCount": 1, "snippet": "...context..." }
//   ]
// }
// ─────────────────────────────────────────────────────────────────────────────
const searchInPdf = async (req, res) => {
    try {
        const { pdfId } = req.params;
        const { query } = req.body;

        // ── Validate inputs ────────────────────────────────────────────────────
        if (!mongoose.Types.ObjectId.isValid(pdfId)) {
            return res.status(400).json({ message: "Invalid PDF ID." });
        }

        if (!query || typeof query !== "string" || query.trim() === "") {
            return res.status(400).json({ message: "Search query cannot be empty." });
        }

        const trimmedQuery = query.trim();

        // ── Confirm the PDF exists ─────────────────────────────────────────────
        const pdf = await PDF.findById(pdfId);
        if (!pdf) {
            return res.status(404).json({ message: "PDF not found." });
        }

        // ── Fetch all pages for this PDF ───────────────────────────────────────
        const pages = await PDFPage.find({ pdfId }).sort({ pageNumber: 1 }).select("pageNumber text");

        if (pages.length === 0) {
            return res.status(200).json({
                query: trimmedQuery,
                pdfId,
                pdfName: pdf.originalName,
                message: "Text extraction is still in progress or this PDF has no extractable text.",
                totalMatches: 0,
                results: [],
            });
        }

        // ── Search each page ───────────────────────────────────────────────────
        const results = [];
        let totalMatches = 0;

        for (const page of pages) {
            const matchCount = countMatches(page.text, trimmedQuery);

            if (matchCount > 0) {
                totalMatches += matchCount;

                // Build a short context snippet around the first match
                const snippet = buildSnippet(page.text, trimmedQuery);

                results.push({
                    pageNumber: page.pageNumber,
                    matchCount,
                    snippet,
                });
            }
        }

        return res.status(200).json({
            query: trimmedQuery,
            pdfId,
            pdfName: pdf.originalName,
            totalMatches,
            results,
        });
    } catch (error) {
        console.error("Search error:", error.message);
        res.status(500).json({ message: "Server error during search." });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Extract a short snippet of text surrounding the first match.
// Returns up to ~160 characters centered on the first occurrence.
// ─────────────────────────────────────────────────────────────────────────────
const buildSnippet = (text, query, contextLength = 80) => {
    if (!text) return "";

    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i");
    const matchIndex = text.search(regex);

    if (matchIndex === -1) return "";

    const start = Math.max(0, matchIndex - contextLength);
    const end = Math.min(text.length, matchIndex + query.length + contextLength);

    let snippet = text.slice(start, end).replace(/\s+/g, " ").trim();

    if (start > 0) snippet = "…" + snippet;
    if (end < text.length) snippet = snippet + "…";

    return snippet;
};

module.exports = { searchInPdf };