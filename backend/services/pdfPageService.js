// services/pdfPageService.js
// PDF text extraction helpers — called by pdfLibraryController during upload.
// Extracted from pdfController.js.

const fs = require("fs");
const PDFPage = require("../models/PDFPage");

/**
 * Extract page-wise text from a PDF file on disk using pdfjs-dist.
 *
 * @param {string} filePath - Absolute path to the PDF file
 * @returns {Promise<Array<{ pageNumber: number, text: string }>>}
 */
async function extractPagesText(filePath) {
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

      pages.push({ pageNumber: pageNum, text });
    } catch (err) {
      // Non-fatal: store empty text for image-only pages
      pages.push({ pageNumber: pageNum, text: "" });
    }
  }

  return pages;
}

/**
 * Bulk-insert extracted pages into the PDFPage collection.
 *
 * @param {string|import('mongoose').Types.ObjectId} pdfId
 * @param {Array<{ pageNumber: number, text: string }>} pages
 */
async function saveExtractedPages(pdfId, pages) {
  if (!pages || pages.length === 0) return;
  const docs = pages.map(({ pageNumber, text }) => ({ pdfId, pageNumber, text }));
  await PDFPage.insertMany(docs, { ordered: false });
}

module.exports = { extractPagesText, saveExtractedPages };
