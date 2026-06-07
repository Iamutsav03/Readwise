// controllers/aiController.js
// Handles all AI-related HTTP requests.
// Designed to support future features: summaries, flashcards, quizzes, explain, note expansion.

const { generateAnswer } = require("../services/geminiService");
const { buildPrompt } = require("../services/promptBuilder");
const { getCachedResponse, setCachedResponse } = require("../services/aiCacheService");
const PDFPage = require("../models/PDFPage");
const AiChatMessage = require("../models/AiChatMessage");
const mongoose = require("mongoose");

// ── Constants ──────────────────────────────────────────────────────────────────
const MAX_SEARCH_PAGES = 10;
const MAX_PARAGRAPHS = 5;

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Splits text into paragraphs, cleaning and removing duplicates.
 */
function cleanAndExtractParagraphs(page) {
  if (!page.text) return [];
  // Split by double newline or single newline
  const rawParagraphs = page.text.split(/\n\n|\n/);
  const cleanParagraphs = [];
  
  for (let text of rawParagraphs) {
    text = text.trim();
    // Remove very short strings, common headers/footers/page numbers
    if (text.length < 30) continue;
    if (/^(page \d+|readwise|copyright|all rights reserved)/i.test(text)) continue;
    
    cleanParagraphs.push({
      pageNumber: page.pageNumber,
      text,
    });
  }
  return cleanParagraphs;
}

/**
 * Simple keyword overlap scorer.
 */
function scoreParagraph(text, queryTokens) {
  const lowerText = text.toLowerCase();
  let score = 0;
  for (const token of queryTokens) {
    if (lowerText.includes(token)) score++;
  }
  return score;
}

/**
 * Retrieve the most relevant paragraphs for a given PDF and query.
 *
 * @param {string} pdfId
 * @param {string} query
 * @returns {Promise<{ contextText: string, pageNumbers: number[], paragraphCount: number }>}
 */
async function getRelevantParagraphs(pdfId, query) {
  const id = new mongoose.Types.ObjectId(pdfId);

  // 1. Fetch top candidate pages
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
    console.warn("MongoDB text search failed, using fallback:", err.message);
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

  // 2. Extract and clean paragraphs from pages
  let allParagraphs = [];
  for (const p of pages) {
    allParagraphs.push(...cleanAndExtractParagraphs(p));
  }

  // Deduplicate exact strings
  const seen = new Set();
  const uniqueParagraphs = [];
  for (const p of allParagraphs) {
    if (!seen.has(p.text)) {
      seen.add(p.text);
      uniqueParagraphs.push(p);
    }
  }

  // 3. Re-rank paragraphs by keyword overlap with query
  const queryTokens = query.toLowerCase().split(/\s+/).filter(t => t.length > 3);
  
  // If query is too short or generic, just use the first few paragraphs
  if (queryTokens.length > 0) {
    uniqueParagraphs.forEach(p => {
      p.score = scoreParagraph(p.text, queryTokens);
    });
    // Sort descending by score, then by page number
    uniqueParagraphs.sort((a, b) => b.score - a.score || a.pageNumber - b.pageNumber);
  }

  // 4. Select top paragraphs and enforce character limits
  const selected = [];
  let charCount = 0;
  const pageNumbersSet = new Set();

  for (const p of uniqueParagraphs) {
    if (selected.length >= MAX_PARAGRAPHS) break;
    if (charCount + p.text.length > 4000) break; // Entire PDF cap
    
    selected.push(p);
    charCount += p.text.length;
    pageNumbersSet.add(p.pageNumber);
  }

  // Re-sort selected sequentially by page number for reading flow
  selected.sort((a, b) => a.pageNumber - b.pageNumber);

  const contextText = selected.map(p => `[Page ${p.pageNumber}]\n${p.text}`).join("\n\n");
  const pageNumbers = Array.from(pageNumbersSet).sort((a, b) => a - b);

  return {
    contextText,
    pageNumbers,
    paragraphCount: selected.length
  };
}

/**
 * Fetch pages within an explicit scope (current / range / all).
 * Used by study tools for precise, token-optimized context.
 *
 * @param {string} pdfId
 * @param {string} pageScope  - "current" | "range" | "all"
 * @param {number} fromPage
 * @param {number} toPage
 * @param {string} query - used for paragraph ranking
 */
async function getPagesByScope(pdfId, pageScope, fromPage, toPage, query = "") {
  const id = new mongoose.Types.ObjectId(pdfId);
  const startNum = Number(fromPage);
  const endNum = Number(toPage);

  let pageFilter;
  if (pageScope === "current") {
    pageFilter = { pdfId: id, pageNumber: startNum };
  } else if (pageScope === "range" && startNum && endNum) {
    pageFilter = { pdfId: id, pageNumber: { $gte: startNum, $lte: endNum } };
  } else if (pageScope === "chapter") {
    // Heuristic: Fetch a 10-page window around the current page
    // (A more robust solution would query an extracted TOC/Outline collection)
    const start = Math.max(1, startNum - 5);
    const end = startNum + 5;
    pageFilter = { pdfId: id, pageNumber: { $gte: start, $lte: end } };
  } else {
    // "all" — fall back to existing full-doc RAG
    return getRelevantParagraphs(pdfId, query);
  }

  const pages = await PDFPage.find(pageFilter, { text: 1, pageNumber: 1 })
    .sort({ pageNumber: 1 })
    .lean();

  console.log("Retrieved pages:", pages.map(p => p.pageNumber));

  if (!pages.length) return { contextText: "", pageNumbers: [], paragraphCount: 0 };

  let allParagraphs = [];
  for (const p of pages) allParagraphs.push(...cleanAndExtractParagraphs(p));

  const seen = new Set();
  const unique = allParagraphs.filter(p => {
    if (seen.has(p.text)) return false;
    seen.add(p.text);
    return true;
  });

  // Rank by query keywords if available
  const tokens = query.toLowerCase().split(/\s+/).filter(t => t.length > 3);
  if (tokens.length > 0) {
    unique.forEach(p => { p.score = scoreParagraph(p.text, tokens); });
    unique.sort((a, b) => b.score - a.score || a.pageNumber - b.pageNumber);
  }

  // Set char limits based on scope rules
  let maxChars = 4000;
  if (pageScope === "current") maxChars = 1500;
  else if (pageScope === "range" || pageScope === "chapter") maxChars = 3000;

  const selected = [];
  let charCount = 0;
  const pageNumbersSet = new Set();
  for (const p of unique) {
    if (charCount + p.text.length > maxChars) break;
    selected.push(p);
    charCount += p.text.length;
    pageNumbersSet.add(p.pageNumber);
  }

  selected.sort((a, b) => a.pageNumber - b.pageNumber);
  const contextText = selected.map(p => `[Page ${p.pageNumber}]\n${p.text}`).join("\n\n");
  const pageNumbers = Array.from(pageNumbersSet).sort((a, b) => a - b);

  console.log(`[AI Scope] scope=${pageScope} pages=${fromPage}-${toPage} | paras=${selected.length} | chars=${contextText.length}`);

  return { contextText, pageNumbers, paragraphCount: selected.length };
}



// ── Endpoints ──────────────────────────────────────────────────────────────────

/**
 * POST /api/ai/test
 * Simple endpoint to verify Gemini API connectivity (no PDF context).
 */
exports.testGemini = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ success: false, error: "Message is required." });
    }

    const result = await generateAnswer(message.trim());
    if (result.success) return res.status(200).json({ success: true, answer: result.response });
    return res.status(500).json({ success: false, error: result.error });
  } catch (err) {
    console.error("AI Controller (test) Error:", err);
    return res.status(500).json({ success: false, error: "Internal server error." });
  }
};

/**
 * POST /api/ai/chat
 * Main chat endpoint — retrieves relevant PDF pages via MongoDB text search,
 * builds a compact context, sends it to Gemini, and persists both messages.
 *
 * Body: { pdfId: string, message: string, featureType?: string }
 */
exports.chat = async (req, res) => {
  try {
    const { pdfId, message, featureType = "chat", retryMessageId, pageScope, fromPage, toPage, importance = "high", featureOptions = {} } = req.body;

    // Input validation
    if (!pdfId || !mongoose.Types.ObjectId.isValid(pdfId)) {
      return res.status(400).json({ success: false, error: "Valid pdfId is required." });
    }
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ success: false, error: "Message is required." });
    }

    const trimmedMessage = message.trim();

    console.log({
      featureType,
      pageScope,
      fromPage,
      toPage,
      pdfId
    });

    // 1. Retrieve relevant paragraphs — use explicit scope if provided by study tools
    const useExplicitScope = pageScope && pageScope !== "all";
    const { contextText, pageNumbers, paragraphCount } = useExplicitScope
      ? await getPagesByScope(pdfId, pageScope, fromPage, toPage, trimmedMessage)
      : await getRelevantParagraphs(pdfId, trimmedMessage);

    if (!contextText) {
      return res.status(200).json({
        success: false,
        error: "No text content found for this PDF. It may be an image-based PDF.",
      });
    }

    // 2. Fetch recent conversation history
    const historyMessages = await AiChatMessage.find({ pdfId, status: "completed" })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    
    historyMessages.reverse();

    // 3. Build the prompt
    const prompt = buildPrompt(featureType, contextText, trimmedMessage, historyMessages, { importance, featureOptions });

    console.log("Context pages sent to Gemini:", pageNumbers);

    // 4. Save placeholder messages or use existing if retrying
    let userMsg, assistantMsg;
    if (retryMessageId) {
      assistantMsg = await AiChatMessage.findById(retryMessageId);
      if (!assistantMsg) return res.status(404).json({ success: false, error: "Message to retry not found" });
      assistantMsg.status = "pending";
      await assistantMsg.save();
    } else {
      [userMsg, assistantMsg] = await Promise.all([
        AiChatMessage.create({
          pdfId,
          role: "user",
          content: trimmedMessage,
          featureType,
          status: "completed",
        }),
        AiChatMessage.create({
          pdfId,
          role: "assistant",
          content: "",
          contextPages: pageNumbers,
          contextParagraphs: paragraphCount,
          featureType,
          status: "pending",
        }),
      ]);
    }

    console.log(
      `[AI Chat] pdfId=${pdfId} | feat=${featureType} | pages=${pageNumbers.join(",")} | paras=${paragraphCount} | chars=${contextText.length}`
    );

    // 5. Check cache first
    const cacheOptions = { pageScope, fromPage, toPage, importance, featureOptions };
    const cachedResponse = await getCachedResponse(pdfId, featureType, trimmedMessage, cacheOptions);
    if (cachedResponse) {
      assistantMsg.content = cachedResponse;
      assistantMsg.status = "completed";
      await assistantMsg.save();
      return res.status(200).json({ success: true, userMessage: userMsg, assistantMessage: assistantMsg });
    }

    // 6. Call Gemini
    const aiResult = await generateAnswer(prompt);

    if (!aiResult.success) {
      // Mark as failed
      assistantMsg.status = "failed";
      assistantMsg.errorCode = aiResult.code || "AI_ERROR";
      await assistantMsg.save();
      return res.status(500).json({ success: false, code: aiResult.code, error: aiResult.error, assistantMessage: assistantMsg });
    }

    // 7. Success - Update placeholder and cache
    assistantMsg.content = aiResult.response;
    assistantMsg.status = "completed";
    await assistantMsg.save();
    await setCachedResponse(pdfId, featureType, trimmedMessage, aiResult.response, cacheOptions);

    return res.status(200).json({
      success: true,
      userMessage: userMsg,
      assistantMessage: assistantMsg,
    });
  } catch (err) {
    console.error("AI Controller (chat) Error:", err);
    return res.status(500).json({ success: false, error: "Internal server error." });
  }
};

/**
 * POST /api/ai/explain-selection
 * Specific, heavily-optimized endpoint for "Explain Selected Text".
 * Bypasses MongoDB RAG completely to save tokens and latency.
 *
 * Body: { pdfId, pageNumber, selectedText }
 */
exports.explainSelection = async (req, res) => {
  try {
    const { pdfId, pageNumber, selectedText, retryMessageId } = req.body;

    if (!pdfId || !mongoose.Types.ObjectId.isValid(pdfId)) {
      return res.status(400).json({ success: false, error: "Valid pdfId is required." });
    }
    if (!selectedText || typeof selectedText !== "string" || !selectedText.trim()) {
      return res.status(400).json({ success: false, error: "selectedText is required." });
    }

    const trimmedText = selectedText.trim();
    const featureType = "explain-selection";

    // 1. Build prompt directly using the selected text (no history, no RAG)
    const prompt = buildPrompt(featureType, trimmedText, "Explain this text");

    // 2. Save placeholder
    let userMsg, assistantMsg;
    if (retryMessageId) {
      assistantMsg = await AiChatMessage.findById(retryMessageId);
      if (!assistantMsg) return res.status(404).json({ success: false, error: "Message to retry not found" });
      assistantMsg.status = "pending";
      await assistantMsg.save();
    } else {
      [userMsg, assistantMsg] = await Promise.all([
        AiChatMessage.create({
          pdfId,
          role: "user",
          content: trimmedText,
          featureType,
          status: "completed",
        }),
        AiChatMessage.create({
          pdfId,
          role: "assistant",
          content: "",
          contextPages: pageNumber ? [pageNumber] : [],
          contextParagraphs: 1,
          featureType,
          status: "pending",
        }),
      ]);
    }

    console.log(`[AI Explain] pdfId=${pdfId} | page=${pageNumber} | chars=${trimmedText.length}`);

    // 3. Call Gemini
    const aiResult = await generateAnswer(prompt);

    if (!aiResult.success) {
      assistantMsg.status = "failed";
      assistantMsg.errorCode = aiResult.code || "AI_ERROR";
      await assistantMsg.save();
      return res.status(500).json({ success: false, code: aiResult.code, error: aiResult.error, assistantMessage: assistantMsg });
    }

    // 4. Success - Update placeholder
    assistantMsg.content = aiResult.response;
    assistantMsg.status = "completed";
    await assistantMsg.save();

    return res.status(200).json({
      success: true,
      userMessage: userMsg,
      assistantMessage: assistantMsg,
    });
  } catch (err) {
    console.error("AI Controller (explain) Error:", err);
    return res.status(500).json({ success: false, error: "Internal server error." });
  }
};

/**
 * GET /api/ai/history/:pdfId
 * Returns the full chat history for a given PDF, in chronological order.
 */
exports.getHistory = async (req, res) => {
  try {
    const { pdfId } = req.params;

    if (!pdfId || !mongoose.Types.ObjectId.isValid(pdfId)) {
      return res.status(400).json({ success: false, error: "Valid pdfId is required." });
    }

    const messages = await AiChatMessage.find({ pdfId })
      .sort({ createdAt: 1 })
      .lean();

    return res.status(200).json({ success: true, messages });
  } catch (err) {
    console.error("AI Controller (history) Error:", err);
    return res.status(500).json({ success: false, error: "Internal server error." });
  }
};

/**
 * DELETE /api/ai/history/:pdfId
 * Clears the full chat history for a given PDF.
 */
exports.clearHistory = async (req, res) => {
  try {
    const { pdfId } = req.params;

    if (!pdfId || !mongoose.Types.ObjectId.isValid(pdfId)) {
      return res.status(400).json({ success: false, error: "Valid pdfId is required." });
    }

    await AiChatMessage.deleteMany({ pdfId });
    return res.status(200).json({ success: true, message: "Chat history cleared." });
  } catch (err) {
    console.error("AI Controller (clear) Error:", err);
    return res.status(500).json({ success: false, error: "Internal server error." });
  }
};
