// models/Highlight.js
// Stores permanent text highlights for uploaded PDFs.

const mongoose = require("mongoose");

const rectSchema = new mongoose.Schema(
  {
    x: { type: Number, required: true }, // fraction of page width  (0–1)
    y: { type: Number, required: true }, // fraction of page height (0–1)
    w: { type: Number, required: true }, // fraction of page width
    h: { type: Number, required: true }, // fraction of page height
  },
  { _id: false }
);

const highlightSchema = new mongoose.Schema(
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
    pageNumber: {
      type: Number,
      required: true,
    },
    // Cache invalidation fields for dynamic rects
    rectVersion: {
      type: Number,
      default: 1,
    },
    pdfTextHash: {
      type: String,
      required: false,
    },
    selectedText: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      enum: ["yellow", "green", "blue", "pink"],
      default: "yellow",
    },
    textQuote: {
      type: String, // Context surrounding the highlight or exact match
    },
    startOffset: {
      type: Number, // Character index in the extracted PDF page text
    },
    endOffset: {
      type: Number,
    },
    // Bounding boxes stored as fractions (0–1) of page dimensions at scale=1.
    // Used as a fast rendering cache for PDF mode. If missing, dynamically generated.
    rects: {
      type: [rectSchema],
      default: [],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Fast lookup for all highlights on a page
highlightSchema.index({ pdfId: 1, pageNumber: 1 });

module.exports = mongoose.model("Highlight", highlightSchema);
