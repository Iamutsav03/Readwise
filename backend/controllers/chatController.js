// controllers/chatController.js
// Handles PDF chat, chat history retrieval and clearing.
// Extracted from aiController.js.

const mongoose = require("mongoose");
const { generateAnswer, buildPrompt } = require("../services/gemini");
const { getCachedResponse, setCachedResponse } = require("../services/aiCacheService");
const { fetchRelevantContext, fetchContextByScope } = require("../services/ragService");
const AiChatMessage = require("../models/AiChatMessage");

/**
 * POST /api/ai/chat
 * Main chat endpoint — retrieves relevant PDF pages via MongoDB text search,
 * builds a compact context, sends it to Gemini, and persists both messages.
 *
 * Body: { pdfId, message, featureType?, retryMessageId?, pageScope?, fromPage?,
 *         toPage?, importance?, featureOptions? }
 */
exports.chat = async (req, res) => {
  try {
    const {
      pdfId,
      message,
      featureType = "chat",
      retryMessageId,
      pageScope,
      fromPage,
      toPage,
      importance = "high",
      featureOptions = {},
    } = req.body;

    // Input validation
    if (!pdfId || !mongoose.Types.ObjectId.isValid(pdfId)) {
      return res.status(400).json({ success: false, error: "Valid pdfId is required." });
    }
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ success: false, error: "Message is required." });
    }

    const trimmedMessage = message.trim();

    console.log({ featureType, pageScope, fromPage, toPage, pdfId });

    // 1. Retrieve relevant context — use explicit scope when provided by study tools
    const useExplicitScope = pageScope && pageScope !== "all";
    const { contextText, pageNumbers, paragraphCount } = useExplicitScope
      ? await fetchContextByScope(pdfId, pageScope, fromPage, toPage, trimmedMessage)
      : await fetchRelevantContext(pdfId, trimmedMessage);

    if (!contextText) {
      return res.status(200).json({
        success: false,
        error: "No text content found for this PDF. It may be an image-based PDF.",
      });
    }

    // 2. Fetch recent conversation history (last 10 completed messages)
    const historyMessages = await AiChatMessage.find({ pdfId, status: "completed" })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    historyMessages.reverse();

    // 3. Build the Gemini prompt
    const prompt = buildPrompt(featureType, contextText, trimmedMessage, historyMessages, {
      importance,
      featureOptions,
    });

    console.log("[ChatController] Context pages sent to Gemini:", pageNumbers);

    // 4. Save placeholder messages (or recover existing if retrying)
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
      `[ChatController] pdfId=${pdfId} | feat=${featureType} | pages=${pageNumbers.join(",")} | paras=${paragraphCount} | chars=${contextText.length}`
    );

    // 5. Check response cache
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

    // 7. Persist and cache the response
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
    console.error("[ChatController] chat error:", err);
    return res.status(500).json({ success: false, error: "Internal server error." });
  }
};

/**
 * GET /api/ai/history/:pdfId
 * Returns the full chat history for a given PDF in chronological order.
 */
exports.getHistory = async (req, res) => {
  try {
    const { pdfId } = req.params;
    if (!pdfId || !mongoose.Types.ObjectId.isValid(pdfId)) {
      return res.status(400).json({ success: false, error: "Valid pdfId is required." });
    }

    const messages = await AiChatMessage.find({ pdfId }).sort({ createdAt: 1 }).lean();
    return res.status(200).json({ success: true, messages });
  } catch (err) {
    console.error("[ChatController] getHistory error:", err);
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
    console.error("[ChatController] clearHistory error:", err);
    return res.status(500).json({ success: false, error: "Internal server error." });
  }
};
