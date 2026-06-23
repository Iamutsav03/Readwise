// controllers/progressController.js
// Handles reading progress sync for multi-device support.

const ReadingProgress = require("../models/ReadingProgress");
const mongoose = require("mongoose");

/**
 * GET /api/progress/:pdfId
 * Returns the saved reading progress for the current user + PDF.
 */
exports.getProgress = async (req, res) => {
  try {
    const { pdfId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(pdfId)) {
      return res.status(400).json({ message: "Invalid pdfId." });
    }

    const progress = await ReadingProgress.findOne({
      pdfId,
      userId: req.user.id,
    }).lean();

    if (!progress) {
      return res.status(404).json({ message: "No progress found." });
    }

    return res.status(200).json({ progress });
  } catch (err) {
    console.error("[Progress] getProgress error:", err.message);
    return res.status(500).json({ message: "Server error fetching progress." });
  }
};

/**
 * PUT /api/progress/:pdfId
 * Upserts the reading progress for the current user + PDF.
 * Body: { pageNumber, numPages, scale, fitMode, focusMode, activeTab }
 */
exports.saveProgress = async (req, res) => {
  try {
    const { pdfId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(pdfId)) {
      return res.status(400).json({ message: "Invalid pdfId." });
    }

    const { pageNumber, numPages, scale, fitMode, focusMode, activeTab } = req.body;

    const update = {
      savedAt: new Date(),
      ...(pageNumber !== undefined && { pageNumber: Number(pageNumber) }),
      ...(numPages   !== undefined && { numPages:   Number(numPages)   }),
      ...(scale      !== undefined && { scale:      Number(scale)      }),
      ...(fitMode    !== undefined && { fitMode                        }),
      ...(focusMode  !== undefined && { focusMode:  Boolean(focusMode) }),
      ...(activeTab  !== undefined && { activeTab                      }),
    };

    const progress = await ReadingProgress.findOneAndUpdate(
      { pdfId, userId: req.user.id },
      { $set: update },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({ progress });
  } catch (err) {
    console.error("[Progress] saveProgress error:", err.message);
    return res.status(500).json({ message: "Server error saving progress." });
  }
};
