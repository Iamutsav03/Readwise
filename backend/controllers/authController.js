// controllers/authController.js
// Handles user signup, login, and session validation.

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const UserPreferences = require("../models/UserPreferences");
const PDF = require("../models/PDF");
const AiChatMessage = require("../models/AiChatMessage");
const Highlight = require("../models/Highlight");
const Bookmark = require("../models/Bookmark");
const SavedWord = require("../models/SavedWord");
const ReadingProgress = require("../models/ReadingProgress");
const GuestUsage = require("../models/GuestUsage");

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

// ─── Migrate Guest ────────────────────────────────────────────────────────────

/**
 * POST /api/auth/migrate
 * Body: { guestId, highlights, bookmarks, vocabulary, readingProgress }
 */
exports.migrateGuest = async (req, res) => {
  try {
    const { guestId, highlights, bookmarks, vocabulary, readingProgress } = req.body;
    const userId = req.user.id;

    if (!guestId) {
      return res.status(400).json({ message: "guestId is required for migration." });
    }

    // 1. Merge Usage & Delete GuestUsage
    const guestUsage = await GuestUsage.findOne({ guestId });
    if (guestUsage) {
      await User.findByIdAndUpdate(userId, {
        $inc: {
          "usage.quickExplain": guestUsage.quickExplainUsed,
          "usage.deepExplain": guestUsage.deepExplainUsed
        }
      });
      await GuestUsage.deleteOne({ guestId });
    }

    // 2. Transfer PDF ownership
    await PDF.updateMany({ guestId }, { $set: { userId, guestId: null } });
    
    // 3. Transfer AiChatMessage ownership
    await AiChatMessage.updateMany({ guestId }, { $set: { userId, guestId: null } });

    // 4. Insert Highlights
    if (Array.isArray(highlights) && highlights.length > 0) {
      const newHighlights = highlights.map(h => ({
        ...h,
        userId,
        _id: undefined,
      }));
      await Highlight.insertMany(newHighlights);
    }

    // 5. Insert Bookmarks
    if (Array.isArray(bookmarks) && bookmarks.length > 0) {
      const newBookmarks = bookmarks.map(b => ({
        ...b,
        userId,
        _id: undefined,
      }));
      await Bookmark.insertMany(newBookmarks);
    }

    // 6. Insert Vocabulary
    if (Array.isArray(vocabulary) && vocabulary.length > 0) {
      const newVocab = vocabulary.map(v => ({
        ...v,
        userId,
        _id: undefined,
      }));
      await SavedWord.insertMany(newVocab);
    }

    // 7. Update Reading Progress
    if (readingProgress && readingProgress.pdfId) {
      await ReadingProgress.findOneAndUpdate(
        { userId, pdfId: readingProgress.pdfId },
        { 
          pageNumber: readingProgress.pageNumber,
          scale: readingProgress.scale,
          activeTab: readingProgress.activeTab
        },
        { upsert: true, new: true }
      );
    }

    res.status(200).json({ message: "Migration successful." });
  } catch (err) {
    console.error("[AuthController] migrateGuest error:", err);
    res.status(500).json({ message: "Server error during migration." });
  }
};
