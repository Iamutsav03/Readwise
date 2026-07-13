// routes/index.js
// Top-level router barrel — mounts all sub-routers under /api.
// server.js does: app.use('/api', require('./routes'))

const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth");
const { optionalAuth, guestLimiter } = require("../middleware/guestAuth");
const { aiLimiter, dictionaryLimiter } = require("../middleware/rateLimiter");

// Public routes
router.use("/test", require("./testRoutes"));
router.use("/auth", require("./authRoutes")); // authLimiter is applied inside authRoutes

// Guest-enabled routes (use optionalAuth and guestLimiter where applicable)
router.use("/pdfs",       optionalAuth, guestLimiter, require("./pdfRoutes"));
router.use("/ai",         optionalAuth, guestLimiter, aiLimiter, require("./aiRoutes"));
router.use("/dictionary", optionalAuth, dictionaryLimiter, require("./dictionaryRoutes"));

// Protected routes (strictly require login)
router.use("/search",     protect, require("./searchRoutes"));
router.use("/bookmarks",  protect, require("./bookmarkRoutes"));
router.use("/highlights", protect, require("./highlightRoutes"));
router.use("/notes",      protect, require("./noteRoutes"));
router.use("/progress",   protect, require("./progressRoutes"));
router.use("/vocabulary", protect, require("./vocabularyRoutes"));

module.exports = router;
