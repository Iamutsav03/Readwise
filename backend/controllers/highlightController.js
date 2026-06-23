// controllers/highlightController.js
// Handles creating, retrieving, and deleting text highlights.

const Highlight = require("../models/Highlight");

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Save a new highlight
// @route   POST /api/highlights
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const addHighlight = async (req, res) => {
  try {
    const { pdfId, pageNumber, selectedText, color, rects, startOffset, endOffset, textQuote } = req.body;

    if (!pdfId || pageNumber == null || !selectedText || !color) {
      return res.status(400).json({
        message: "pdfId, pageNumber, selectedText and color are required.",
      });
    }

    const highlight = await Highlight.create({
      pdfId,
      userId: req.user.id,
      pageNumber: Number(pageNumber),
      selectedText: selectedText.trim(),
      color,
      rects: Array.isArray(rects) ? rects : [],
      startOffset,
      endOffset,
      textQuote,
    });

    res.status(201).json(highlight);
  } catch (error) {
    console.error("Add highlight error:", error.message);
    res.status(500).json({ message: "Server error adding highlight." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all highlights for a PDF, sorted page-ascending
// @route   GET /api/highlights/:pdfId
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const getHighlights = async (req, res) => {
  try {
    const { pdfId } = req.params;

    if (!pdfId) {
      return res.status(400).json({ message: "pdfId is required." });
    }

    const highlights = await Highlight.find({ pdfId, userId: req.user.id }).sort({
      pageNumber: 1,
      createdAt: 1,
    });

    res.status(200).json(highlights);
  } catch (error) {
    console.error("Get highlights error:", error.message);
    res.status(500).json({ message: "Server error fetching highlights." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete a highlight by its _id
// @route   DELETE /api/highlights/:id
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const deleteHighlight = async (req, res) => {
  try {
    const deleted = await Highlight.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

    if (!deleted) {
      return res.status(404).json({ message: "Highlight not found." });
    }

    res.status(200).json({ message: "Highlight deleted successfully." });
  } catch (error) {
    console.error("Delete highlight error:", error.message);
    res.status(500).json({ message: "Server error deleting highlight." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Patch a highlight (used to persist dynamically-computed rects)
// @route   PATCH /api/highlights/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const updateHighlight = async (req, res) => {
  try {
    const { rects, rectVersion, color } = req.body;

    // Only allow patching safe fields
    const update = {};
    if (Array.isArray(rects))     update.rects = rects;
    if (rectVersion != null)      update.rectVersion = rectVersion;
    if (color)                    update.color = color;

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ message: "Nothing to update." });
    }

    const highlight = await Highlight.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      update,
      { new: true }
    );

    if (!highlight) {
      return res.status(404).json({ message: "Highlight not found." });
    }

    res.status(200).json(highlight);
  } catch (error) {
    console.error("Update highlight error:", error.message);
    res.status(500).json({ message: "Server error updating highlight." });
  }
};

module.exports = { addHighlight, getHighlights, deleteHighlight, updateHighlight };
