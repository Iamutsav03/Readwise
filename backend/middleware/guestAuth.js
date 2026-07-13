// middleware/guestAuth.js
const jwt = require("jsonwebtoken");
const GuestUsage = require("../models/GuestUsage");

// Middleware to allow EITHER a valid JWT user OR a valid Guest UUID.
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const guestId = req.headers["x-guest-id"];

  // 1. Check for JWT
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { id: decoded.id, email: decoded.email };
      return next();
    } catch (err) {
      // Fall through to guest check if token is invalid/expired
    }
  }

  // 2. Check for Guest ID
  if (guestId && typeof guestId === "string" && guestId.trim()) {
    req.guestId = guestId.trim();
    return next();
  }

  // 3. Neither present
  return res.status(401).json({ message: "Not authenticated. Please log in or provide a guest ID." });
};

// Middleware to enforce guest usage limits
const guestLimiter = async (req, res, next) => {
  // If it's a logged-in user, no guest limits apply
  if (req.user) {
    return next();
  }

  if (!req.guestId) {
    return res.status(401).json({ message: "Guest ID is missing." });
  }

  try {
    let usage = await GuestUsage.findOne({ guestId: req.guestId });
    if (!usage) {
      usage = new GuestUsage({ guestId: req.guestId });
    }

    // Update last active
    usage.lastActiveAt = Date.now();
    await usage.save();

    // Determine the action based on the route
    const path = req.originalUrl;
    
    // PDF Upload Limit
    if (path.includes("/api/pdfs/upload") && req.method === "POST") {
      if (usage.uploadedPdfCount >= 1) {
        return res.status(403).json({ code: "GUEST_LIMIT_REACHED", message: "Free document limit reached." });
      }
      usage.uploadedPdfCount += 1;
      await usage.save();
      return next();
    }

    // AI Explain Limits
    if (path.includes("/api/ai/explain-selection") && req.method === "POST") {
      // In a real app, we might distinguish between quick and deep explain by checking req.body.
      // Assuming this endpoint handles Quick Explain for now.
      const explainType = req.body.explainType || "quick";
      
      if (explainType === "deep") {
        if (usage.deepExplainUsed >= 2) {
          return res.status(403).json({ code: "GUEST_LIMIT_REACHED", message: "Deep explain limit reached." });
        }
        usage.deepExplainUsed += 1;
      } else {
        if (usage.quickExplainUsed >= 5) {
          return res.status(403).json({ code: "GUEST_LIMIT_REACHED", message: "Quick explain limit reached." });
        }
        usage.quickExplainUsed += 1;
      }
      
      await usage.save();
      return next();
    }
    
    // AI Chat Limit (Blocked completely)
    if (path.includes("/api/ai/chat")) {
      return res.status(403).json({ code: "GUEST_LIMIT_REACHED", message: "AI Chat requires a free account." });
    }

    // For any other routes that pass through guestLimiter, just proceed.
    return next();
  } catch (err) {
    console.error("[GuestLimiter] Error:", err);
    return res.status(500).json({ message: "Internal server error checking limits." });
  }
};

module.exports = { optionalAuth, guestLimiter };
