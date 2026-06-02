// routes/noteRoutes.js
// Defines routes for note CRUD operations.

const express = require("express");
const router = express.Router();
const {
  addNote,
  getNotes,
  updateNote,
  deleteNote,
} = require("../controllers/noteController");

// POST   /api/notes          - Create a new note
router.post("/", addNote);

// GET    /api/notes/:pdfId   - Get all notes for a specific PDF
router.get("/:pdfId", getNotes);

// PUT    /api/notes/:id      - Update an existing note (content, color, size, position)
router.put("/:id", updateNote);

// DELETE /api/notes/:id      - Delete a note by its ID
router.delete("/:id", deleteNote);

module.exports = router;
