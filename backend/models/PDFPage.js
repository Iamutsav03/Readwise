// models/PDFPage.js
// Stores extracted text content for each page of an uploaded PDF.
// Lives in a separate collection so PDF metadata stays lean and
// text search can be done efficiently without loading the whole doc.

const mongoose = require("mongoose");

const pdfPageSchema = new mongoose.Schema(
    {
        // Reference back to the parent PDF document
        pdfId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PDF",
            required: true,
            index: true, // index for fast lookup when searching a specific PDF
        },

        // 1-based page number matching the original PDF
        pageNumber: {
            type: Number,
            required: true,
        },

        // Full extracted text for this page (may be empty for image-only pages)
        text: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

// Compound index: all pages for a PDF, ordered by page number
pdfPageSchema.index({ pdfId: 1, pageNumber: 1 });

// Full-text index on page content for MongoDB $text search
// This enables fast keyword-based relevance search per PDF
pdfPageSchema.index({ text: "text" });

module.exports = mongoose.model("PDFPage", pdfPageSchema);