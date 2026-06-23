// controllers/bookmarkController.js
// Handles adding, retrieving, and deleting page bookmarks.

const Bookmark = require("../models/Bookmark");

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Add a page bookmark for a PDF (prevents duplicates using upsert)
// @route   POST /api/bookmarks
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const addBookmark = async (req, res) => {
  try {
    const { pdfId, pageNumber } = req.body;

    if (!pdfId || pageNumber === undefined) {
      return res.status(400).json({ message: "pdfId and pageNumber are required." });
    }

    // Use findOneAndUpdate with upsert to prevent duplicate key errors and return the doc
    const bookmark = await Bookmark.findOneAndUpdate(
      { pdfId, pageNumber: Number(pageNumber), userId: req.user.id },
      { pdfId, pageNumber: Number(pageNumber), userId: req.user.id },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json(bookmark);
  } catch (error) {
    console.error("Add bookmark error:", error.message);
    res.status(500).json({ message: "Server error adding bookmark." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all bookmarks for a specific PDF, sorted ascending by pageNumber
// @route   GET /api/bookmarks/:pdfId
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const getBookmarks = async (req, res) => {
  try {
    const { pdfId } = req.params;

    if (!pdfId) {
      return res.status(400).json({ message: "pdfId parameter is required." });
    }

    const bookmarks = await Bookmark.find({ pdfId, userId: req.user.id }).sort({ pageNumber: 1 });
    res.status(200).json(bookmarks);
  } catch (error) {
    console.error("Get bookmarks error:", error.message);
    res.status(500).json({ message: "Server error fetching bookmarks." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete a specific page bookmark by pdfId and pageNumber
// @route   DELETE /api/bookmarks/:pdfId/:pageNumber
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const deleteBookmark = async (req, res) => {
  try {
    const { pdfId, pageNumber } = req.params;

    if (!pdfId || pageNumber === undefined) {
      return res.status(400).json({ message: "pdfId and pageNumber are required." });
    }

    const deleted = await Bookmark.findOneAndDelete({
      pdfId,
      pageNumber: Number(pageNumber),
      userId: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Bookmark not found." });
    }

    res.status(200).json({ message: "Bookmark deleted successfully." });
  } catch (error) {
    console.error("Delete bookmark error:", error.message);
    res.status(500).json({ message: "Server error deleting bookmark." });
  }
};

module.exports = {
  addBookmark,
  getBookmarks,
  deleteBookmark,
};
