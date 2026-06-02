// routes/highlightRoutes.js
// Defines routes for highlight CRUD operations.

const express = require("express");
const router = express.Router();
const {
  addHighlight,
  getHighlights,
  deleteHighlight,
} = require("../controllers/highlightController");

// POST   /api/highlights          — Create a new highlight
router.post("/", addHighlight);

// GET    /api/highlights/:pdfId   — Get all highlights for a PDF
router.get("/:pdfId", getHighlights);

// DELETE /api/highlights/:id      — Delete a highlight by _id
router.delete("/:id", deleteHighlight);

module.exports = router;
