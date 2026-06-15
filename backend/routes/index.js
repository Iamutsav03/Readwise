// routes/index.js
// Top-level router barrel — mounts all sub-routers under /api.
// server.js does: app.use('/api', require('./routes'))

const express = require("express");
const router = express.Router();

router.use("/test",       require("./testRoutes"));
router.use("/pdfs",       require("./pdfRoutes"));
router.use("/search",     require("./searchRoutes"));
router.use("/bookmarks",  require("./bookmarkRoutes"));
router.use("/highlights", require("./highlightRoutes"));
router.use("/notes",      require("./noteRoutes"));
router.use("/ai",         require("./aiRoutes"));
router.use("/dictionary", require("./dictionaryRoutes"));

module.exports = router;
