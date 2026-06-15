// src/types/pdf.types.js
// JSDoc typedefs for PDF-related data structures.
// Import with: import './pdf.types.js' or reference via @typedef in JSDoc.

/**
 * @typedef {Object} PDF
 * @property {string}      _id            - MongoDB ObjectId string
 * @property {string}      originalName   - User-visible filename
 * @property {string}      fileName       - Server-stored filename (UUID)
 * @property {number}      fileSize       - Bytes
 * @property {string}      filePath       - Absolute server-side path
 * @property {boolean}     isFavorite     - Whether the PDF is starred
 * @property {string|null} lastOpenedAt   - ISO date string or null
 * @property {string}      createdAt      - ISO date string
 */

/**
 * @typedef {Object} PDFPage
 * @property {string} _id        - MongoDB ObjectId string
 * @property {string} pdfId      - Parent PDF id
 * @property {number} pageNumber - 1-indexed page number
 * @property {string} text       - Extracted plain text
 */

export {};   // Makes this a module so JSDoc types are scoped
