// services/pdfPageService.js
// PDF text extraction helpers — called by pdfLibraryController during upload.
// Extracted from pdfController.js.
// v2: adds extraction quality detection (multi-column / scanned PDF heuristics).

const fs = require("fs");
const crypto = require("crypto");
const PDFPage = require("../models/PDFPage");
const PDF = require("../models/PDF");

/**
 * Computes a short hash of a text layer to use as a cache key for highlight rects.
 * @param {string} text
 * @returns {string}
 */
function hashText(text) {
  return crypto.createHash("md5").update(text).digest("hex").slice(0, 12);
}

/**
 * Detects whether a page's text items represent a multi-column layout.
 * Heuristic: if there is a significant horizontal gap (> 20% of page width)
 * between sorted items at the same Y level, it's likely two columns.
 *
 * @param {Array} items - Sorted PDF text items
 * @param {object} viewport - PDF page viewport
 * @returns {"good"|"poor"}
 */
function detectExtractionQuality(allPageResults) {
  const totalPages = allPageResults.length;
  if (totalPages === 0) return "poor";

  let emptyPages = 0;
  let multiColumnHits = 0;

  for (const { textItems, viewport } of allPageResults) {
    if (!textItems || textItems.length === 0) {
      emptyPages++;
      continue;
    }

    // Group items by approximate Y row (within 4pt tolerance)
    const rows = {};
    for (const item of textItems) {
      const y = Math.round(item.transform[5] / 4) * 4;
      if (!rows[y]) rows[y] = [];
      rows[y].push(item.transform[4]); // x positions
    }

    // Check for large horizontal gaps within rows
    const pageWidth = viewport ? viewport.width : 600;
    let rowsWithGap = 0;
    let totalRows = 0;
    for (const xPositions of Object.values(rows)) {
      if (xPositions.length < 2) continue;
      totalRows++;
      const sorted = xPositions.sort((a, b) => a - b);
      for (let i = 1; i < sorted.length; i++) {
        const gap = sorted[i] - sorted[i - 1];
        if (gap > pageWidth * 0.25) {
          rowsWithGap++;
          break;
        }
      }
    }
    if (totalRows > 0 && rowsWithGap / totalRows > 0.4) {
      multiColumnHits++;
    }
  }

  // If majority of pages are empty → scanned
  if (emptyPages / totalPages > 0.7) return "poor";
  // If significant share of pages are multi-column → warn
  if (multiColumnHits / totalPages > 0.4) return "poor";

  return "good";
}

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
  const allPageResults = [];

  for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
    try {
      const page = await pdfDocument.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1 });
      const textContent = await page.getTextContent();
      
      // Sort items roughly top-to-bottom, left-to-right (PDF coords start from bottom-left)
      const items = textContent.items.sort((a, b) => {
        if (Math.abs(b.transform[5] - a.transform[5]) > 5) {
          return b.transform[5] - a.transform[5];
        }
        return a.transform[4] - b.transform[4];
      });

      allPageResults.push({ textItems: items, viewport });

      const structuredContent = [];
      let currentBlock = null;
      let lastY = null;
      let rawText = "";

      for (const item of items) {
        if (!item.str.trim()) {
           rawText += item.str;
           if (currentBlock) currentBlock.text += item.str;
           continue;
        }

        const y = item.transform[5];
        const height = Math.abs(item.transform[3]);
        
        let newBlockType = "paragraph";
        if (height > 14) {
          newBlockType = "heading";
        }
        
        const yDiff = lastY !== null ? Math.abs(lastY - y) : 0;
        const isNewLine = yDiff > height * 0.5;
        const isNewParagraph = yDiff > height * 1.5;
        
        if (!currentBlock || isNewParagraph || currentBlock.type !== newBlockType) {
           if (currentBlock) {
              currentBlock.endOffset = rawText.length;
              structuredContent.push(currentBlock);
              rawText += "\n\n";
           }
           
           currentBlock = {
              type: newBlockType,
              text: item.str,
              startOffset: rawText.length
           };
           rawText += item.str;
        } else {
           if (isNewLine) {
             if (currentBlock.text.endsWith("-")) {
                currentBlock.text = currentBlock.text.slice(0, -1);
                rawText = rawText.slice(0, -1);
             } else if (!currentBlock.text.endsWith(" ")) {
                currentBlock.text += " ";
                rawText += " ";
             }
           }
           currentBlock.text += item.str;
           rawText += item.str;
        }
        
        lastY = y;
      }
      
      if (currentBlock) {
         currentBlock.endOffset = rawText.length;
         structuredContent.push(currentBlock);
      }

      pages.push({
        pageNumber: pageNum,
        text: rawText,
        structuredContent,
        textHash: hashText(rawText),
      });
    } catch (err) {
      allPageResults.push({ textItems: [], viewport: null });
      pages.push({ pageNumber: pageNum, text: "", structuredContent: [], textHash: "" });
    }
  }

  const extractionQuality = detectExtractionQuality(allPageResults);

  return { pages, extractionQuality };
}

/**
 * Bulk-insert extracted pages into the PDFPage collection.
 * Also updates the PDF document's extractionQuality flag.
 *
 * @param {string|import('mongoose').Types.ObjectId} pdfId
 * @param {{ pages: Array, extractionQuality: string }} result
 */
async function saveExtractedPages(pdfId, { pages, extractionQuality }) {
  if (!pages || pages.length === 0) return;
  const docs = pages.map(({ pageNumber, text, structuredContent, textHash }) => ({
    pdfId, pageNumber, text, structuredContent, textHash,
  }));
  await PDFPage.insertMany(docs, { ordered: false });
  // Update extractionQuality on the PDF document
  await PDF.findByIdAndUpdate(pdfId, { extractionQuality });
}

module.exports = { extractPagesText, saveExtractedPages };
