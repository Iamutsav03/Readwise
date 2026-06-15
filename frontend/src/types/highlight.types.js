// src/types/highlight.types.js
// JSDoc typedefs for highlight-related data structures.

/**
 * @typedef {Object} Rect
 * @property {number} x  - Left edge as fraction of page width  (0–1)
 * @property {number} y  - Top edge as fraction of page height  (0–1)
 * @property {number} w  - Width as fraction of page width      (0–1)
 * @property {number} h  - Height as fraction of page height    (0–1)
 */

/**
 * @typedef {Object} Highlight
 * @property {string}   _id          - MongoDB ObjectId string
 * @property {string}   pdfId        - Parent PDF id
 * @property {number}   pageNumber   - 1-indexed page number
 * @property {string}   selectedText - The highlighted text content
 * @property {string}   color        - One of: yellow | green | blue | pink
 * @property {Rect[]}   rects        - Bounding rectangles (fractions)
 * @property {string}   createdAt    - ISO date string
 */

export {};
