// controllers/noteController.js
// Handles adding, retrieving, updating, and deleting page-attached sticky notes.

const Note = require("../models/Note");

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create a new note
// @route   POST /api/notes
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const addNote = async (req, res) => {
  try {
    const { pdfId, pageNumber, content, title, color, width, height, x, y } = req.body;

    if (!pdfId || pageNumber === undefined) {
      return res.status(400).json({ message: "pdfId and pageNumber are required." });
    }

    const note = await Note.create({
      pdfId,
      userId: req.user.id,
      pageNumber: Number(pageNumber),
      content: content !== undefined ? content : "",
      title: title !== undefined ? title : "",
      color: color !== undefined ? color : "yellow",
      width: width !== undefined ? Number(width) : 280,
      height: height !== undefined ? Number(height) : 180,
      x: x !== undefined ? Number(x) : 0,
      y: y !== undefined ? Number(y) : 0,
    });

    res.status(201).json(note);
  } catch (error) {
    console.error("Add note error:", error.message);
    res.status(500).json({ message: "Server error adding note." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all notes for a specific PDF, sorted page-ascending
// @route   GET /api/notes/:pdfId
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const getNotes = async (req, res) => {
  try {
    const { pdfId } = req.params;

    if (!pdfId) {
      return res.status(400).json({ message: "pdfId is required." });
    }

    const notes = await Note.find({ pdfId, userId: req.user.id }).sort({ pageNumber: 1, createdAt: 1 });
    res.status(200).json(notes);
  } catch (error) {
    console.error("Get notes error:", error.message);
    res.status(500).json({ message: "Server error fetching notes." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update an existing note (content, color, dimensions, position)
// @route   PUT /api/notes/:id
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const updateNote = async (req, res) => {
  try {
    const { content, title, color, width, height, x, y, pageNumber } = req.body;

    const updateFields = {};
    if (content !== undefined) updateFields.content = content;
    if (title !== undefined) updateFields.title = title;
    if (color !== undefined) updateFields.color = color;
    if (width !== undefined) updateFields.width = Number(width);
    if (height !== undefined) updateFields.height = Number(height);
    if (x !== undefined) updateFields.x = Number(x);
    if (y !== undefined) updateFields.y = Number(y);
    if (pageNumber !== undefined) updateFields.pageNumber = Number(pageNumber);

    const updatedNote = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedNote) {
      return res.status(404).json({ message: "Note not found." });
    }

    res.status(200).json(updatedNote);
  } catch (error) {
    console.error("Update note error:", error.message);
    res.status(500).json({ message: "Server error updating note." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete a note by its ID
// @route   DELETE /api/notes/:id
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const deleteNote = async (req, res) => {
  try {
    const deleted = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

    if (!deleted) {
      return res.status(404).json({ message: "Note not found." });
    }

    res.status(200).json({ message: "Note deleted successfully." });
  } catch (error) {
    console.error("Delete note error:", error.message);
    res.status(500).json({ message: "Server error deleting note." });
  }
};

module.exports = {
  addNote,
  getNotes,
  updateNote,
  deleteNote,
};
