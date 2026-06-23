// routes/authRoutes.js
// Authentication routes.

const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authLimiter } = require("../middleware/rateLimiter");
const { protect } = require("../middleware/auth");

// POST /api/auth/signup
router.post("/signup", authLimiter, authController.signup);

// POST /api/auth/login
router.post("/login", authLimiter, authController.login);

// GET /api/auth/me
router.get("/me", protect, authController.getMe);

module.exports = router;
