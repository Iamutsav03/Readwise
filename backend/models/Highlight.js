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
    selectedText: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      enum: ["yellow", "green", "blue", "pink"],
      default: "yellow",
    },
    // Bounding boxes stored as fractions (0–1) of page dimensions at scale=1.
    // Scale-independent: overlay rendering multiplies by current rendered dimensions.
    rects: [rectSchema],
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Fast lookup for all highlights on a page
highlightSchema.index({ pdfId: 1, pageNumber: 1 });

module.exports = mongoose.model("Highlight", highlightSchema);
