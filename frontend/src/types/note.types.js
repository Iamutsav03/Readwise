// src/types/note.types.js
// JSDoc typedefs for sticky-note data structures.

/**
 * @typedef {Object} Note
 * @property {string}      _id        - MongoDB ObjectId string
 * @property {string}      pdfId      - Parent PDF id
 * @property {number}      pageNumber - 1-indexed page number
 * @property {string}      content    - Note body text (markdown-lite)
 * @property {number}      [x]        - Horizontal pin position as fraction (0–1)
 * @property {number}      [y]        - Vertical pin position as fraction   (0–1)
 * @property {string}      createdAt  - ISO date string
 * @property {string}      updatedAt  - ISO date string
 */

export {};
