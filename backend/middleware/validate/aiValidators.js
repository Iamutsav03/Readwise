// middleware/validate/aiValidators.js
// Express middleware validators for AI-related routes.

const mongoose = require("mongoose");

/**
 * Validate chat request body: { pdfId, message }.
 */
function validateChatBody(req, res, next) {
  const { pdfId, message } = req.body;
  if (!pdfId || !mongoose.Types.ObjectId.isValid(pdfId)) {
    return res.status(400).json({ success: false, error: "Valid pdfId is required." });
  }
  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ success: false, error: "message is required." });
  }
  next();
}

/**
 * Validate explain-selection request body: { pdfId, selectedText }.
 */
function validateExplainBody(req, res, next) {
  const { pdfId, selectedText } = req.body;
  if (!pdfId || !mongoose.Types.ObjectId.isValid(pdfId)) {
    return res.status(400).json({ success: false, error: "Valid pdfId is required." });
  }
  if (!selectedText || typeof selectedText !== "string" || !selectedText.trim()) {
    return res.status(400).json({ success: false, error: "selectedText is required." });
  }
  next();
}

module.exports = { validateChatBody, validateExplainBody };
