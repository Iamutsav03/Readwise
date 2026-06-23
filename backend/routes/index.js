// routes/index.js
// Top-level router barrel — mounts all sub-routers under /api.
// server.js does: app.use('/api', require('./routes'))

const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth");
const { aiLimiter, dictionaryLimiter } = require("../middleware/rateLimiter");

// Public routes
router.use("/test", require("./testRoutes"));
router.use("/auth", require("./authRoutes")); // authLimiter is applied inside authRoutes

// Protected routes
router.use("/pdfs",       protect, require("./pdfRoutes"));
router.use("/search",     protect, require("./searchRoutes"));
router.use("/bookmarks",  protect, require("./bookmarkRoutes"));
router.use("/highlights", protect, require("./highlightRoutes"));
router.use("/notes",      protect, require("./noteRoutes"));
router.use("/progress",   protect, require("./progressRoutes"));
router.use("/ai",         protect, aiLimiter, require("./aiRoutes"));
router.use("/dictionary", protect, dictionaryLimiter, require("./dictionaryRoutes"));

module.exports = router;
