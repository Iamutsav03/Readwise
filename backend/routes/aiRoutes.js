// routes/aiRoutes.js
const express = require("express");
const router = express.Router();
const explainController = require("../controllers/explainController");
const chatController = require("../controllers/chatController");

// Verify Gemini connectivity (no PDF context)
router.post("/test", explainController.testGemini);

// Explain selected text (bypasses RAG/MongoDB)
router.post("/explain-selection", explainController.explainSelection);

// Chat with a PDF document using relevant page context
router.post("/chat", chatController.chat);

// Retrieve full chat history for a PDF
router.get("/history/:pdfId", chatController.getHistory);

// Clear chat history for a PDF
router.delete("/history/:pdfId", chatController.clearHistory);

module.exports = router;
