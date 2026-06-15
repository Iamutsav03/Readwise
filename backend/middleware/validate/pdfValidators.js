// middleware/validate/pdfValidators.js
// Express middleware validators for PDF-related routes.

const mongoose = require("mongoose");

/**
 * Validate that :id param is a valid MongoDB ObjectId.
 */
function validatePdfId(req, res, next) {
  const id = req.params.id;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid or missing PDF id." });
  }
  next();
}

/**
 * Validate rename request body: { name: string, 1-120 chars }.
 */
function validateRename(req, res, next) {
  const { name } = req.body;
  if (!name || typeof name !== "string") {
    return res.status(400).json({ message: "name is required and must be a string." });
  }
  const trimmed = name.trim();
  if (trimmed.length < 1 || trimmed.length > 120) {
    return res.status(400).json({ message: "Name must be between 1 and 120 characters." });
  }
  req.body.name = trimmed; // normalise before hitting controller
  next();
}

/**
 * Validate that a file was attached to the upload request.
 */
function validateUpload(req, res, next) {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }
  next();
}

module.exports = { validatePdfId, validateRename, validateUpload };
