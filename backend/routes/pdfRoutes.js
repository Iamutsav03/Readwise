// routes/pdfRoutes.js
// Defines all routes related to PDF uploads, retrieval, viewing, and deletion.

const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { uploadPDF, getAllPDFs, viewPDF, deletePDF } = require("../controllers/pdfController");

// POST   /api/pdfs/upload          — Upload a new PDF
router.post("/upload", upload.single("pdf"), uploadPDF);

// GET    /api/pdfs                 — List all uploaded PDFs
router.get("/", getAllPDFs);

// GET    /api/pdfs/view/:filename  — Serve a PDF file to the browser
router.get("/view/:filename", viewPDF);

// DELETE /api/pdfs/:id             — Delete a PDF and its page data
router.delete("/:id", deletePDF);

module.exports = router;