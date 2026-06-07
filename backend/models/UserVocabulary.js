const mongoose = require("mongoose");

const userVocabularySchema = new mongoose.Schema(
  {
    pdfId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PDF",
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
  },
  { timestamps: true }
);

// Prevent saving the exact same word twice for the same PDF
userVocabularySchema.index({ pdfId: 1, word: 1 }, { unique: true });

module.exports = mongoose.model("UserVocabulary", userVocabularySchema);
