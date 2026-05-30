// routes/bookmarkRoutes.js
// Defines routes for bookmark operations.

const express = require("express");
const router = express.Router();
const { addBookmark, getBookmarks, deleteBookmark } = require("../controllers/bookmarkController");

// POST   /api/bookmarks                 - Add/create a bookmark
router.post("/", addBookmark);

// GET    /api/bookmarks/:pdfId          - Retrieve all bookmarks for a specific PDF
router.get("/:pdfId", getBookmarks);

// DELETE /api/bookmarks/:pdfId/:pageNumber - Delete a bookmark by page number
router.delete("/:pdfId/:pageNumber", deleteBookmark);

module.exports = router;
