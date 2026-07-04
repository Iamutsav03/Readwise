const mongoose = require("mongoose");

const userVocabularySchema = new mongoose.Schema(
  {
    pdfId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PDF",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    word: {
      type: String,
      required: true,
    },
    meaning: {
      type: String,
      required: true,
    },
    pageNumber: {
      type: Number,
      default: null,
    },
    lookedUpAt: {
      type: Date,
      default: Date.now,
    },
    sourceType: {
      type: String,
      enum: ["dictionary", "quick_meaning"],
      default: "dictionary",
    },
    pdfTitle: {
      type: String,
      default: "Unknown Document",
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    lastReviewed: {
      type: Date,
      default: null,
    },
    nextReviewDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Prevent saving the exact same word twice for the same PDF per user
userVocabularySchema.index({ pdfId: 1, word: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("UserVocabulary", userVocabularySchema);
