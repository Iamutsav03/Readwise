// controllers/authController.js
// Handles user signup, login, and session validation.

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const UserPreferences = require("../models/UserPreferences");

const SALT_ROUNDS = 12;
const TOKEN_EXPIRY = "7d";

/** Sign a JWT for the given user. */
const signToken = (user) =>
  jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  });

// ─── Signup ───────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/signup
 * Body: { email, password }
 */
exports.signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || typeof email !== "string" || !email.trim()) {
      return res.status(400).json({ message: "Email is required." });
    }
    if (!password || typeof password !== "string" || password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters." });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check uniqueness
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = await User.create({ email: normalizedEmail, passwordHash });

    // Seed default preferences
    await UserPreferences.create({ userId: user._id });

    const token = signToken(user);

    return res.status(201).json({
      message: "Account created successfully.",
      token,
      user: { id: user._id, email: user.email },
    });
  } catch (err) {
    console.error("[Auth] Signup error:", err.message);
    return res.status(500).json({ message: "Server error during signup." });
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = signToken(user);

    return res.status(200).json({
      message: "Logged in successfully.",
      token,
      user: { id: user._id, email: user.email },
    });
  } catch (err) {
    console.error("[Auth] Login error:", err.message);
    return res.status(500).json({ message: "Server error during login." });
  }
};

// ─── Get Me ───────────────────────────────────────────────────────────────────

/**
 * GET /api/auth/me
 * Requires: protect middleware
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash -resetPasswordToken -resetPasswordExpires");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    return res.status(200).json({ user: { id: user._id, email: user.email } });
  } catch (err) {
    console.error("[Auth] getMe error:", err.message);
    return res.status(500).json({ message: "Server error." });
  }
};
