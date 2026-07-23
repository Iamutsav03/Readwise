// controllers/pdfLibraryController.js
// Handles PDF library operations: upload, list, view, delete, rename, favorite.
// Extracted from pdfController.js. Page extraction delegated to pdfPageService.

const path = require("path");
const fs = require("fs");

const PDF = require("../models/PDF");
const PDFPage = require("../models/PDFPage");
const Bookmark = require("../models/Bookmark");
const Highlight = require("../models/Highlight");
const Note = require("../models/Note");
const AiChatMessage = require("../models/AiChatMessage");
const SavedWord = require("../models/SavedWord");
const UserVocabulary = require("../models/UserVocabulary");
const ReadingProgress = require("../models/ReadingProgress");
const mongoose = require("mongoose");

const aiCacheService = require("../services/aiCacheService");
const { extractPagesText, saveExtractedPages } = require("../services/pdfPageService");

// ─── Upload ───────────────────────────────────────────────────────────────────

/**
 * POST /api/pdfs/upload
 * Upload a PDF, save metadata, and kick off async text extraction.
 */
const uploadPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const newPDF = await PDF.create({
      originalName: req.file.originalname,
      fileName: req.file.filename,
      fileSize: req.file.size,
      filePath: req.file.path,
      userId: req.user ? req.user.id : undefined,
      guestId: req.guestId ? req.guestId : undefined,
    });

    // Upload to GridFS for persistent storage
    try {
      const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'pdfs' });
      const readStream = fs.createReadStream(req.file.path);
      const uploadStream = bucket.openUploadStream(req.file.filename);
      readStream.pipe(uploadStream);
      
      uploadStream.on('error', (err) => console.error("GridFS Upload Error:", err));
      uploadStream.on('finish', () => console.log(`✅ Saved ${req.file.filename} to GridFS`));
    } catch (gErr) {
      console.error("Failed to initialize GridFS upload:", gErr.message);
    }

    // Fire-and-forget: don't block the HTTP response
    extractPagesText(req.file.path)
      .then((result) => saveExtractedPages(newPDF._id, result))
      .then(() => console.log(`✅ Text extracted: "${newPDF.originalName}" (${newPDF._id})`))
      .catch((err) =>
        console.error(`⚠️  Text extraction failed for "${newPDF.originalName}":`, err.message)
      );

    res.status(201).json({
      message: "PDF uploaded successfully. Text extraction in progress.",
      pdf: newPDF,
    });
  } catch (error) {
    console.error("[PDFLibrary] Upload error:", error.message);
    res.status(500).json({ message: "Server error during upload." });
  }
};

// ─── List ─────────────────────────────────────────────────────────────────────

/**
 * GET /api/pdfs
 * Return all PDFs sorted by lastOpenedAt desc, then createdAt.
 */
const getAllPDFs = async (req, res) => {
  try {
    const pdfs = await PDF.aggregate([
      { $match: req.user ? { userId: new mongoose.Types.ObjectId(req.user.id) } : { guestId: req.guestId } },
      { $addFields: { sortKey: { $ifNull: ["$lastOpenedAt", "$createdAt"] } } },
      { $sort: { sortKey: -1 } },
    ]);
    res.status(200).json(pdfs);
  } catch (error) {
    console.error("[PDFLibrary] Fetch error:", error.message);
    res.status(500).json({ message: "Server error fetching PDFs." });
  }
};

// ─── View ─────────────────────────────────────────────────────────────────────

/**
 * GET /api/pdfs/view/:filename
 * Serve a PDF file for in-browser viewing.
 */
const viewPDF = async (req, res) => {
  try {
    const match = req.user ? { userId: req.user.id } : { guestId: req.guestId };
    const pdf = await PDF.findOne({ fileName: req.params.filename, ...match });
    if (!pdf) {
      return res.status(403).json({ message: "Forbidden or file not found." });
    }

    const filePath = path.join(__dirname, "../uploads", req.params.filename);
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }

    // Try GridFS if not on disk (persists across Render restarts)
    try {
      const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'pdfs' });
      const files = await bucket.find({ filename: req.params.filename }).toArray();
      if (!files || files.length === 0) {
        return res.status(404).json({ message: "File not found on disk or database." });
      }
      res.set('Content-Type', 'application/pdf');
      const downloadStream = bucket.openDownloadStreamByName(req.params.filename);
      downloadStream.on('error', () => {
        res.status(404).end();
      });
      return downloadStream.pipe(res);
    } catch (gErr) {
      console.error("GridFS View error:", gErr.message);
      return res.status(500).json({ message: "Server error fetching file from DB." });
    }
  } catch (error) {
    console.error("[PDFLibrary] View error:", error.message);
    res.status(500).json({ message: "Server error viewing PDF." });
  }
};

// ─── Favorite ─────────────────────────────────────────────────────────────────

/**
 * PATCH /api/pdfs/:id/favorite
 * Toggle isFavorite on a PDF.
 */
const toggleFavorite = async (req, res) => {
  try {
    const pdf = await PDF.findOne({ _id: req.params.id, userId: req.user.id });
    if (!pdf) return res.status(404).json({ message: "PDF not found." });

    pdf.isFavorite = !pdf.isFavorite;
    await pdf.save();
    res.status(200).json({ pdf });
  } catch (error) {
    console.error("[PDFLibrary] Toggle favorite error:", error.message);
    res.status(500).json({ message: "Server error toggling favorite." });
  }
};

// ─── Rename ───────────────────────────────────────────────────────────────────

/**
 * PATCH /api/pdfs/:id/rename
 * Update a PDF's originalName field.
 */
const renamePDF = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== "string") {
      return res.status(400).json({ message: "name is required." });
    }
    const trimmed = name.trim();
    if (trimmed.length < 1 || trimmed.length > 120) {
      return res.status(400).json({ message: "Name must be 1–120 characters." });
    }

    const pdf = await PDF.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { originalName: trimmed },
      { new: true }
    );
    if (!pdf) return res.status(404).json({ message: "PDF not found." });

    res.status(200).json({ pdf });
  } catch (error) {
    console.error("[PDFLibrary] Rename error:", error.message);
    res.status(500).json({ message: "Server error renaming PDF." });
  }
};

// ─── Last opened ──────────────────────────────────────────────────────────────

/**
 * PATCH /api/pdfs/:id/open
 * Record that the user opened a PDF (updates lastOpenedAt).
 */
const updateLastOpened = async (req, res) => {
  try {
    const pdf = await PDF.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { lastOpenedAt: new Date() },
      { new: true }
    );
    if (!pdf) return res.status(404).json({ message: "PDF not found." });
    res.status(200).json({ pdf });
  } catch (error) {
    console.error("[PDFLibrary] updateLastOpened error:", error.message);
    res.status(500).json({ message: "Server error updating lastOpenedAt." });
  }
};

// ─── Delete ───────────────────────────────────────────────────────────────────

/**
 * DELETE /api/pdfs/:id
 * Delete a PDF and ALL associated data (cascade).
 */
const deletePDF = async (req, res) => {
  try {
    const pdf = await PDF.findOne({ _id: req.params.id, userId: req.user.id });
    if (!pdf) return res.status(404).json({ message: "PDF not found." });

    // 1. Remove file from disk
    if (fs.existsSync(pdf.filePath)) {
      fs.unlinkSync(pdf.filePath);
    }

    // Remove from GridFS
    try {
      const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'pdfs' });
      const files = await bucket.find({ filename: pdf.fileName }).toArray();
      for (const file of files) {
        await bucket.delete(file._id);
      }
    } catch (gErr) {
      console.error("GridFS Delete Error:", gErr.message);
    }

    // 2. Core cascade deletes
    const { deletedCount: pages } = await PDFPage.deleteMany({ pdfId: pdf._id });
    console.log(`🗑️  Removed ${pages} page record(s) for "${pdf.originalName}"`);

    const { deletedCount: bookmarks } = await Bookmark.deleteMany({ pdfId: pdf._id, userId: req.user.id });
    console.log(`🗑️  Removed ${bookmarks} bookmark(s) for "${pdf.originalName}"`);

    const { deletedCount: highlights } = await Highlight.deleteMany({ pdfId: pdf._id, userId: req.user.id });
    console.log(`🗑️  Removed ${highlights} highlight(s) for "${pdf.originalName}"`);

    const { deletedCount: notes } = await Note.deleteMany({ pdfId: pdf._id, userId: req.user.id });
    console.log(`🗑️  Removed ${notes} note(s) for "${pdf.originalName}"`);

    const { deletedCount: progressCount } = await ReadingProgress.deleteMany({ pdfId: pdf._id, userId: req.user.id });
    console.log(`🗑️  Removed ${progressCount} reading progress record(s) for "${pdf.originalName}"`);

    // 3. Auxiliary cascade (non-fatal — logged but never blocks deletion)
    try {
      const { deletedCount: msgs } = await AiChatMessage.deleteMany({ pdfId: pdf._id, userId: req.user.id });
      console.log(`🗑️  Removed ${msgs} AI message(s) for "${pdf.originalName}"`);

      const { deletedCount: words } = await SavedWord.deleteMany({ pdfId: pdf._id, userId: req.user.id });
      console.log(`🗑️  Removed ${words} saved word(s) for "${pdf.originalName}"`);

      const { deletedCount: vocab } = await UserVocabulary.deleteMany({ pdfId: pdf._id, userId: req.user.id });
      console.log(`🗑️  Removed ${vocab} vocabulary entry(ies) for "${pdf.originalName}"`);
    } catch (auxErr) {
      console.error(
        `⚠️  Partial auxiliary cleanup failure for "${pdf.originalName}" — PDF will still be deleted:`,
        auxErr.message
      );
    }

    // 4. Invalidate AI response cache
    await aiCacheService.invalidatePdf(pdf._id);

    // 5. Remove PDF document
    await PDF.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "PDF and all associated data deleted successfully." });
  } catch (error) {
    console.error("[PDFLibrary] Delete error:", error.message);
    res.status(500).json({ message: "Server error deleting PDF." });
  }
};

/**
 * GET /api/pdfs/:id/pages
 * Retrieve the structured text content for a PDF's pages (used by Reading Mode)
 */
const getPdfPages = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if PDF belongs to user
    const pdf = await PDF.findOne({ _id: id, userId: req.user.id });
    if (!pdf) {
      return res.status(404).json({ message: "PDF not found." });
    }

    const pages = await PDFPage.find({ pdfId: id }).sort({ pageNumber: 1 });
    res.status(200).json({ pages, extractionQuality: pdf.extractionQuality || "pending" });
  } catch (error) {
    console.error("[PDFLibrary] getPdfPages error:", error.message);
    res.status(500).json({ message: "Server error retrieving PDF pages." });
  }
};

module.exports = {
  uploadPDF,
  getAllPDFs,
  viewPDF,
  deletePDF,
  toggleFavorite,
  renamePDF,
  updateLastOpened,
  getPdfPages,
};
