// controllers/pdfController.js
// Handles PDF upload (with text extraction), listing, viewing, and deletion.

const path = require("path");
const fs = require("fs");

const PDF = require("../models/PDF");
const PDFPage = require("../models/PDFPage");
const Bookmark = require("../models/Bookmark");

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Extract page-wise text from a PDF file on disk
//
// pdf-parse gives us all text concatenated via data.text, but we need
// per-page granularity. We use the `pagerender` hook to capture each page's
// text content before it is merged.
// ─────────────────────────────────────────────────────────────────────────────
const extractPagesText = async (filePath) => {
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const data = new Uint8Array(fs.readFileSync(filePath));

  const loadingTask = pdfjsLib.getDocument({ data });
  const pdfDocument = await loadingTask.promise;

  const pages = [];

  for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
    try {
      const page = await pdfDocument.getPage(pageNum);

      const textContent = await page.getTextContent();

      const text = textContent.items
        .map((item) => item.str)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      pages.push({
        pageNumber: pageNum,
        text,
      });
    } catch (err) {
      pages.push({
        pageNumber: pageNum,
        text: "",
      });
    }
  }

  return pages;
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Bulk-insert extracted pages into PDFPage collection
// ─────────────────────────────────────────────────────────────────────────────
const saveExtractedPages = async (pdfId, pages) => {
  if (!pages || pages.length === 0) return;

  const docs = pages.map(({ pageNumber, text }) => ({ pdfId, pageNumber, text }));
  await PDFPage.insertMany(docs, { ordered: false });
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Upload a PDF, save metadata, extract and store page text
// @route   POST /api/pdfs/upload
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const uploadPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    // 1. Save PDF metadata to MongoDB
    const newPDF = await PDF.create({
      originalName: req.file.originalname,
      fileName: req.file.filename,
      fileSize: req.file.size,
      filePath: req.file.path,
    });

    // 2. Extract text asynchronously — don't block the HTTP response.
    //    The client gets a fast reply; extraction continues in the background.
    extractPagesText(req.file.path)
      .then((pages) => saveExtractedPages(newPDF._id, pages))
      .then(() => {
        console.log(`✅ Text extracted: "${newPDF.originalName}" (${newPDF._id})`);
      })
      .catch((err) => {
        // Non-fatal: PDF is still readable, just not text-searchable yet
        console.error(`⚠️  Text extraction failed for "${newPDF.originalName}":`, err.message);
      });

    res.status(201).json({
      message: "PDF uploaded successfully. Text extraction in progress.",
      pdf: newPDF,
    });
  } catch (error) {
    console.error("Upload error:", error.message);
    res.status(500).json({ message: "Server error during upload." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all uploaded PDFs (newest first)
// @route   GET /api/pdfs
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const getAllPDFs = async (req, res) => {
  try {
    const pdfs = await PDF.find().sort({ createdAt: -1 });
    res.status(200).json(pdfs);
  } catch (error) {
    console.error("Fetch error:", error.message);
    res.status(500).json({ message: "Server error fetching PDFs." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Serve a PDF file for in-browser viewing
// @route   GET /api/pdfs/view/:filename
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const viewPDF = (req, res) => {
  try {
    const filePath = path.join(__dirname, "../uploads", req.params.filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found." });
    }

    res.sendFile(filePath);
  } catch (error) {
    console.error("View error:", error.message);
    res.status(500).json({ message: "Server error viewing PDF." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete a PDF and ALL associated page data (cascade delete)
// @route   DELETE /api/pdfs/:id
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const deletePDF = async (req, res) => {
  try {
    const pdf = await PDF.findById(req.params.id);

    if (!pdf) {
      return res.status(404).json({ message: "PDF not found." });
    }

    // 1. Remove file from disk
    if (fs.existsSync(pdf.filePath)) {
      fs.unlinkSync(pdf.filePath);
    }

    // 2. Cascade delete: remove all extracted page documents
    const { deletedCount } = await PDFPage.deleteMany({ pdfId: pdf._id });
    console.log(`🗑️  Removed ${deletedCount} page record(s) for "${pdf.originalName}"`);

    // Cascade delete: remove all bookmarks for this PDF
    const { deletedCount: deletedBookmarksCount } = await Bookmark.deleteMany({ pdfId: pdf._id });
    console.log(`🗑️  Removed ${deletedBookmarksCount} bookmark(s) for "${pdf.originalName}"`);

    // 3. Remove the PDF metadata document
    await PDF.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "PDF and all associated page data deleted successfully.",
    });
  } catch (error) {
    console.error("Delete error:", error.message);
    res.status(500).json({ message: "Server error deleting PDF." });
  }
};

module.exports = { uploadPDF, getAllPDFs, viewPDF, deletePDF };