// services/ragService.js
// Retrieval-Augmented Generation (RAG) context fetching.
// Extracted from aiController.js — handles MongoDB text search, paragraph
// ranking, deduplication, and character-capped context assembly.

const mongoose = require("mongoose");
const PDFPage = require("../models/PDFPage");
const {
  MAX_SEARCH_PAGES,
  MAX_PARAGRAPHS,
  MAX_CONTEXT_CHARS,
} = require("../constants/aiConstants");

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Split a page's text into clean, deduplicated paragraphs.
 * @param {{ text: string, pageNumber: number }} page
 * @returns {Array<{ pageNumber: number, text: string }>}
 */
function cleanAndExtractParagraphs(page) {
  if (!page.text) return [];
  const rawParagraphs = page.text.split(/\n\n|\n/);
  const result = [];

  for (let text of rawParagraphs) {
    text = text.trim();
    if (text.length < 30) continue;
    if (/^(page \d+|readwise|copyright|all rights reserved)/i.test(text)) continue;
    result.push({ pageNumber: page.pageNumber, text });
  }
  return result;
}

/**
 * Score a paragraph by how many query tokens it contains.
 * @param {string}   text
 * @param {string[]} queryTokens
 * @returns {number}
 */
function scoreParagraph(text, queryTokens) {
  const lower = text.toLowerCase();
  return queryTokens.reduce((n, t) => n + (lower.includes(t) ? 1 : 0), 0);
}

/**
 * Deduplicates and optionally re-ranks an array of paragraphs.
 * @param {Array<{ pageNumber: number, text: string }>} paragraphs
 * @param {string[]} queryTokens
 * @returns {Array<{ pageNumber: number, text: string }>}
 */
function deduplicateAndRank(paragraphs, queryTokens) {
  const seen = new Set();
  const unique = paragraphs.filter((p) => {
    if (seen.has(p.text)) return false;
    seen.add(p.text);
    return true;
  });

  if (queryTokens.length > 0) {
    unique.forEach((p) => { p.score = scoreParagraph(p.text, queryTokens); });
    unique.sort((a, b) => b.score - a.score || a.pageNumber - b.pageNumber);
  }
  return unique;
}

/**
 * Select top paragraphs up to a character cap, then re-sort by page order.
 * @param {Array} paragraphs
 * @param {number} maxChars
 * @param {number} [maxParagraphs]
 * @returns {{ selected: Array, pageNumbersSet: Set<number> }}
 */
function selectWithinBudget(paragraphs, maxChars, maxParagraphs = MAX_PARAGRAPHS) {
  const selected = [];
  let charCount = 0;
  const pageNumbersSet = new Set();

  for (const p of paragraphs) {
    if (selected.length >= maxParagraphs) break;
    if (charCount + p.text.length > maxChars) break;
    selected.push(p);
    charCount += p.text.length;
    pageNumbersSet.add(p.pageNumber);
  }

  selected.sort((a, b) => a.pageNumber - b.pageNumber);
  return { selected, pageNumbersSet };
}

/**
 * Assemble the final context object from selected paragraphs.
 */
function buildContextResult(selected, pageNumbersSet) {
  if (selected.length === 0) {
    return { contextText: "", pageNumbers: [], paragraphCount: 0 };
  }
  const contextText = selected
    .map((p) => `[Page ${p.pageNumber}]\n${p.text}`)
    .join("\n\n");
  const pageNumbers = Array.from(pageNumbersSet).sort((a, b) => a - b);
  return { contextText, pageNumbers, paragraphCount: selected.length };
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Retrieve the most relevant paragraphs for a query using MongoDB $text search
 * with keyword-overlap re-ranking. Falls back to sequential pages when no
 * text-search index match is found.
 *
 * @param {string} pdfId
 * @param {string} query
 * @returns {Promise<{ contextText: string, pageNumbers: number[], paragraphCount: number }>}
 */
async function fetchRelevantContext(pdfId, query) {
  const id = new mongoose.Types.ObjectId(pdfId);

  let pages = [];
  try {
    pages = await PDFPage.find(
      { pdfId: id, $text: { $search: query } },
      { score: { $meta: "textScore" }, text: 1, pageNumber: 1 }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(MAX_SEARCH_PAGES)
      .lean();
  } catch (err) {
    console.warn("[RAG] MongoDB text search failed, using fallback:", err.message);
  }

  if (pages.length === 0) {
    pages = await PDFPage.find(
      { pdfId: id, text: { $exists: true, $ne: "" } },
      { text: 1, pageNumber: 1 }
    )
      .sort({ pageNumber: 1 })
      .limit(MAX_SEARCH_PAGES)
      .lean();
  }

  if (pages.length === 0) return { contextText: "", pageNumbers: [], paragraphCount: 0 };

  const allParagraphs = pages.flatMap(cleanAndExtractParagraphs);
  const queryTokens = query.toLowerCase().split(/\s+/).filter((t) => t.length > 3);
  const ranked = deduplicateAndRank(allParagraphs, queryTokens);
  const { selected, pageNumbersSet } = selectWithinBudget(ranked, MAX_CONTEXT_CHARS);

  return buildContextResult(selected, pageNumbersSet);
}

/**
 * Retrieve pages within an explicit scope (current / range / chapter / all).
 * Used by study tools for precise, token-optimised context windows.
 *
 * @param {string} pdfId
 * @param {string} pageScope   - "current" | "range" | "chapter" | "all"
 * @param {number} fromPage
 * @param {number} toPage
 * @param {string} [query]
 * @returns {Promise<{ contextText: string, pageNumbers: number[], paragraphCount: number }>}
 */
async function fetchContextByScope(pdfId, pageScope, fromPage, toPage, query = "") {
  // "all" delegates to the full-document RAG path
  if (!pageScope || pageScope === "all") {
    return fetchRelevantContext(pdfId, query);
  }

  const id = new mongoose.Types.ObjectId(pdfId);
  const startNum = Number(fromPage);
  const endNum = Number(toPage);

  let pageFilter;
  if (pageScope === "current") {
    pageFilter = { pdfId: id, pageNumber: startNum };
  } else if (pageScope === "range" && startNum && endNum) {
    pageFilter = { pdfId: id, pageNumber: { $gte: startNum, $lte: endNum } };
  } else if (pageScope === "chapter") {
    // Heuristic: ±5 page window around current page
    const start = Math.max(1, startNum - 5);
    const end = startNum + 5;
    pageFilter = { pdfId: id, pageNumber: { $gte: start, $lte: end } };
  } else {
    return fetchRelevantContext(pdfId, query);
  }

  const pages = await PDFPage.find(pageFilter, { text: 1, pageNumber: 1 })
    .sort({ pageNumber: 1 })
    .lean();

  console.log("[RAG] Retrieved pages:", pages.map((p) => p.pageNumber));

  if (!pages.length) return { contextText: "", pageNumbers: [], paragraphCount: 0 };

  const allParagraphs = pages.flatMap(cleanAndExtractParagraphs);
  const queryTokens = query.toLowerCase().split(/\s+/).filter((t) => t.length > 3);
  const ranked = deduplicateAndRank(allParagraphs, queryTokens);

  // Tighter char limits for scoped requests
  let maxChars = MAX_CONTEXT_CHARS;
  if (pageScope === "current") maxChars = 1500;
  else if (pageScope === "range" || pageScope === "chapter") maxChars = 3000;

  const { selected, pageNumbersSet } = selectWithinBudget(ranked, maxChars);

  console.log(
    `[RAG] scope=${pageScope} pages=${fromPage}-${toPage} | paras=${selected.length} | chars=${selected.reduce((n, p) => n + p.text.length, 0)}`
  );

  return buildContextResult(selected, pageNumbersSet);
}

module.exports = { fetchRelevantContext, fetchContextByScope };
