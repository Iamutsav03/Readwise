// models/PDF.js
// Mongoose schema for storing uploaded PDF metadata

const mongoose = require("mongoose");

const pdfSchema = new mongoose.Schema(
  {
    // Original file name from the user's computer
    originalName: {
      type: String,
      required: true,
    },

    // File name as saved on the server (unique)
    fileName: {
      type: String,
      required: true,
    },

    // User who uploaded the file (optional for guests)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    },

    // Guest ID for anonymous uploads
    guestId: {
      type: String,
      required: false,
      index: true,
    },

    // File size in bytes
    fileSize: {
      type: Number,
      required: true,
    },

    // Path where file is stored on disk
    filePath: {
      type: String,
      required: true,
    },

    // Whether the user has starred this PDF
    isFavorite: {
      type: Boolean,
      default: false,
    },

    // Quality of the backend text extraction pipeline
    extractionQuality: {
      type: String,
      enum: ["pending", "good", "poor"],
      default: "pending",
    },

    // Timestamp of the last time the user opened this PDF
    lastOpenedAt: {
      type: Date,
      default: null,
    },
  },
  {
    // Automatically adds createdAt and updatedAt fields
    timestamps: true,
  }
);

module.exports = mongoose.model("PDF", pdfSchema);
