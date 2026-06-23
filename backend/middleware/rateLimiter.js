// middleware/rateLimiter.js
// Rate limiters to prevent abuse on sensitive endpoints.

const rateLimit = require("express-rate-limit");

// Auth endpoints: 15 requests per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again in 15 minutes." },
});

// AI endpoints: 60 requests per minute per IP
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many AI requests. Please slow down." },
});

// Dictionary endpoints: 120 requests per minute per IP
const dictionaryLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many dictionary requests. Please slow down." },
});

module.exports = { authLimiter, aiLimiter, dictionaryLimiter };
