// controllers/vocabularyController.js
const mongoose = require("mongoose");
const UserVocabulary = require("../models/UserVocabulary");

// GET /api/vocabulary
exports.getVocabulary = async (req, res) => {
  try {
    const vocab = await UserVocabulary.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, vocabulary: vocab });
  } catch (error) {
    console.error("Get vocabulary error:", error);
    return res.status(500).json({ success: false, error: "Failed to fetch vocabulary." });
  }
};

// DELETE /api/vocabulary/:id
exports.deleteVocabulary = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await UserVocabulary.findOneAndDelete({ _id: id, userId: req.user.id });
    if (!deleted) {
      return res.status(404).json({ success: false, error: "Vocabulary not found" });
    }
    return res.status(200).json({ success: true, deletedId: id });
  } catch (error) {
    console.error("Delete vocabulary error:", error);
    return res.status(500).json({ success: false, error: "Failed to delete vocabulary." });
  }
};

// PATCH /api/vocabulary/:id/review
exports.submitReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { score } = req.body; // "again", "hard", "good", "easy"

    if (!["again", "hard", "good", "easy"].includes(score)) {
      return res.status(400).json({ success: false, error: "Invalid score" });
    }

    const vocab = await UserVocabulary.findOne({ _id: id, userId: req.user.id });
    if (!vocab) {
      return res.status(404).json({ success: false, error: "Vocabulary not found" });
    }

    const now = new Date();
    let nextDate = new Date();

    // SM-2 modified intervals
    if (score === "again") {
      nextDate.setMinutes(now.getMinutes() + 10);
    } else if (score === "hard") {
      nextDate.setDate(now.getDate() + 1);
    } else if (score === "good") {
      nextDate.setDate(now.getDate() + 3);
    } else if (score === "easy") {
      nextDate.setDate(now.getDate() + 7);
    }

    vocab.reviewCount = (vocab.reviewCount || 0) + 1;
    vocab.lastReviewed = now;
    vocab.nextReviewDate = nextDate;

    await vocab.save();

    return res.status(200).json({ success: true, vocabulary: vocab });
  } catch (error) {
    console.error("Submit review error:", error);
    return res.status(500).json({ success: false, error: "Failed to submit review." });
  }
};

// GET /api/vocabulary/stats
exports.getVocabularyStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    const [totalSaved, dueCount, newCount, masteredCount, topPdf] = await Promise.all([
      UserVocabulary.countDocuments({ userId }),
      UserVocabulary.countDocuments({ userId, nextReviewDate: { $lte: now } }),
      UserVocabulary.countDocuments({ userId, reviewCount: 0 }),
      UserVocabulary.countDocuments({ userId, reviewCount: { $gt: 4 }, nextReviewDate: { $gt: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000) } }), // Rough heuristic for mastered
      UserVocabulary.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: "$pdfTitle", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 }
      ])
    ]);

    const stats = {
      totalSaved,
      dueCount,
      newCount,
      masteredCount,
      topPdf: topPdf.length > 0 ? topPdf[0] : null,
      streak: 0, // Placeholder for future actual streak tracking
    };

    return res.status(200).json({ success: true, stats });
  } catch (error) {
    console.error("Get vocabulary stats error:", error);
    return res.status(500).json({ success: false, error: "Failed to fetch vocabulary stats." });
  }
};
