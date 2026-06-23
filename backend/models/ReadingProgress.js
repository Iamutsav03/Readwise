// models/ReadingProgress.js
// Stores per-user, per-PDF reading state for multi-device sync.

const mongoose = require("mongoose");

const readingProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    pdfId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PDF",
      required: true,
      index: true,
    },
    pageNumber: { type: Number, default: 1 },
    numPages:   { type: Number, default: 0 },
    scale:      { type: Number, default: 1 },
    fitMode:    { type: String, default: "page" }, // 'page' | 'width' | null
    focusMode:  { type: Boolean, default: false },
    activeTab:  { type: String, default: null },
    savedAt:    { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// One progress record per user per PDF
readingProgressSchema.index({ userId: 1, pdfId: 1 }, { unique: true });

module.exports = mongoose.model("ReadingProgress", readingProgressSchema);
