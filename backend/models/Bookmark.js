// models/Bookmark.js
// Stores bookmark pages for uploaded PDFs.

const mongoose = require("mongoose");

const bookmarkSchema = new mongoose.Schema(
  {
    // Reference back to the parent PDF document
    pdfId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PDF",
      required: true,
      index: true,
    },

    // 1-based page number matching the bookmarked page
    pageNumber: {
      type: Number,
      required: true,
    },
    // User who bookmarked
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    // Track when the bookmark was created, no need for updatedAt
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound index to guarantee uniqueness: a page in a PDF can only be bookmarked once per user
bookmarkSchema.index({ pdfId: 1, pageNumber: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("Bookmark", bookmarkSchema);
