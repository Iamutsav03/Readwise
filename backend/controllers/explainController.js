// controllers/explainController.js
// Handles text-selection explain and Gemini connectivity test endpoints.
// Extracted from aiController.js.

const mongoose = require("mongoose");
const { generateAnswer, buildPrompt } = require("../services/gemini");
const AiChatMessage = require("../models/AiChatMessage");

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
    console.error("[ExplainController] testGemini error:", err);
    return res.status(500).json({ success: false, error: "Internal server error." });
  }
};

/**
 * POST /api/ai/explain-selection
 * Explains selected text — bypasses MongoDB RAG completely to save tokens.
 *
 * Body: { pdfId, pageNumber, selectedText, retryMessageId? }
 */
exports.explainSelection = async (req, res) => {
  try {
    const { pdfId, pageNumber, selectedText, customPrompt, retryMessageId } = req.body;

    if (!pdfId || !mongoose.Types.ObjectId.isValid(pdfId)) {
      return res.status(400).json({ success: false, error: "Valid pdfId is required." });
    }
    if (!selectedText || typeof selectedText !== "string" || !selectedText.trim()) {
      return res.status(400).json({ success: false, error: "selectedText is required." });
    }

    const trimmedText = selectedText.trim();
    const featureType = "explain-selection";

    // Build prompt directly from selected text — no history, no RAG
    const prompt = buildPrompt(featureType, trimmedText, customPrompt || "Explain this text");

    // Save or recover placeholder messages
    let userMsg, assistantMsg;
    if (retryMessageId) {
      assistantMsg = await AiChatMessage.findById(retryMessageId);
      if (!assistantMsg) {
        return res.status(404).json({ success: false, error: "Message to retry not found" });
      }
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

    console.log(`[ExplainController] pdfId=${pdfId} | page=${pageNumber} | chars=${trimmedText.length}`);

    const aiResult = await generateAnswer(prompt);

    if (!aiResult.success) {
      assistantMsg.status = "failed";
      assistantMsg.errorCode = aiResult.code || "AI_ERROR";
      await assistantMsg.save();
      return res.status(500).json({
        success: false,
        code: aiResult.code,
        error: aiResult.error,
        assistantMessage: assistantMsg,
      });
    }

    assistantMsg.content = aiResult.response;
    assistantMsg.status = "completed";
    await assistantMsg.save();

    return res.status(200).json({
      success: true,
      userMessage: userMsg,
      assistantMessage: assistantMsg,
    });
  } catch (err) {
    console.error("[ExplainController] explainSelection error:", err);
    return res.status(500).json({ success: false, error: "Internal server error." });
  }
};
