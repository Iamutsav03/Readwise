// models/Note.js
// Stores sticky notes for uploaded PDFs attached to a specific page.

const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
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
    content: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      default: "",
    },
    color: {
      type: String,
      default: "yellow",
    },
    width: {
      type: Number,
      default: 280,
    },
    height: {
      type: Number,
      default: 180,
    },
    x: {
      type: Number,
      default: 0,
    },
    y: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast query of all notes in a specific PDF or a specific page
noteSchema.index({ pdfId: 1, pageNumber: 1 });

module.exports = mongoose.model("Note", noteSchema);
