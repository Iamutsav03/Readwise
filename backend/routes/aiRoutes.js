const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");

// Verify Gemini connectivity (no PDF context)
router.post("/test", aiController.testGemini);

// Chat with a PDF document using relevant page context
router.post("/chat", aiController.chat);

// Explain selected text (bypasses RAG/MongoDB)
router.post("/explain-selection", aiController.explainSelection);

// Retrieve full chat history for a PDF
router.get("/history/:pdfId", aiController.getHistory);

// Clear chat history for a PDF
router.delete("/history/:pdfId", aiController.clearHistory);

module.exports = router;
