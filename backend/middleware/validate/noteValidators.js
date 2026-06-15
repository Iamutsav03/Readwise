// middleware/validate/noteValidators.js
// Express middleware validators for note-related routes.

const mongoose = require("mongoose");

/**
 * Validate note creation body: { pdfId, content, pageNumber }.
 * coordinates (x, y) are optional but validated when present.
 */
function validateNoteBody(req, res, next) {
  const { pdfId, content, pageNumber } = req.body;

  if (!pdfId || !mongoose.Types.ObjectId.isValid(pdfId)) {
    return res.status(400).json({ message: "Valid pdfId is required." });
  }
  if (!content || typeof content !== "string" || !content.trim()) {
    return res.status(400).json({ message: "content is required." });
  }
  if (pageNumber === undefined || pageNumber === null || isNaN(Number(pageNumber))) {
    return res.status(400).json({ message: "pageNumber must be a number." });
  }

  // Optional coordinate validation
  const { x, y } = req.body;
  if (x !== undefined && (isNaN(Number(x)) || Number(x) < 0 || Number(x) > 1)) {
    return res.status(400).json({ message: "x must be a fraction between 0 and 1." });
  }
  if (y !== undefined && (isNaN(Number(y)) || Number(y) < 0 || Number(y) > 1)) {
    return res.status(400).json({ message: "y must be a fraction between 0 and 1." });
  }

  next();
}

module.exports = { validateNoteBody };
