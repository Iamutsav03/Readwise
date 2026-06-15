// routes/pdfRoutes.js
// Defines all routes related to PDF uploads, retrieval, viewing, and deletion.

const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {
  uploadPDF,
  getAllPDFs,
  viewPDF,
  deletePDF,
  toggleFavorite,
  renamePDF,
  updateLastOpened,
} = require("../controllers/pdfLibraryController");

// POST   /api/pdfs/upload         — Upload a new PDF
router.post("/upload", upload.single("pdf"), uploadPDF);

// GET    /api/pdfs                — List all uploaded PDFs (sorted by lastOpenedAt)
router.get("/", getAllPDFs);

// GET    /api/pdfs/view/:filename — Serve a PDF file to the browser
router.get("/view/:filename", viewPDF);

// PATCH  /api/pdfs/:id/favorite  — Toggle isFavorite
router.patch("/:id/favorite", toggleFavorite);

// PATCH  /api/pdfs/:id/rename    — Rename a PDF
router.patch("/:id/rename", renamePDF);

// PATCH  /api/pdfs/:id/open      — Record that user opened a PDF
router.patch("/:id/open", updateLastOpened);

// DELETE /api/pdfs/:id           — Delete a PDF and its data
router.delete("/:id", deletePDF);

module.exports = router;