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
  },
  {
    // Automatically adds createdAt and updatedAt fields
    timestamps: true,
  }
);

module.exports = mongoose.model("PDF", pdfSchema);
