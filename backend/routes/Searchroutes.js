// routes/searchRoutes.js
// Registers search-related routes.

const express = require("express");
const router = express.Router();
const { searchInPdf } = require("../controllers/searchController");

// POST /api/search/:pdfId
// Body: { "query": "your search term" }
// Searches extracted page text of the specified PDF.
router.post("/:pdfId", searchInPdf);

module.exports = router;