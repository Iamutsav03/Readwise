// routes/progressRoutes.js
// Routes for multi-device reading progress sync.

const express = require("express");
const router = express.Router();
const progressController = require("../controllers/progressController");

// GET /api/progress/:pdfId
router.get("/:pdfId", progressController.getProgress);

// PUT /api/progress/:pdfId
router.put("/:pdfId", progressController.saveProgress);

module.exports = router;
