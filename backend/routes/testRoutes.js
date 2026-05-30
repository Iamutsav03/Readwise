// routes/testRoutes.js
// Simple health check route to verify the server is running

const express = require("express");
const router = express.Router();

// GET /api/test
// Returns a simple success message — useful for confirming the server is up
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "✅ ReadWise API is running!",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
