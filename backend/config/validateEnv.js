// config/validateEnv.js
// Validates required environment variables on server startup.
// Call this before connectDB() and app.listen() so missing config
// produces a clear error message instead of a cryptic runtime crash.

const REQUIRED_VARS = [
  {
    key: "GEMINI_API_KEY",
    validate: (v) => v && v !== "YOUR_API_KEY_HERE",
    message: 'GEMINI_API_KEY is missing or still set to "YOUR_API_KEY_HERE".',
  },
  {
    key: "MONGO_URI",
    validate: (v) => Boolean(v),
    message: "MONGO_URI is missing. Provide a valid MongoDB connection string.",
  },
];

/**
 * Run validation. Throws a descriptive Error on the first missing variable.
 * Call as: require('./config/validateEnv')()
 */
function validateEnv() {
  for (const { key, validate, message } of REQUIRED_VARS) {
    const value = process.env[key];
    if (!validate(value)) {
      throw new Error(`[validateEnv] Missing required env var: ${key}\n  → ${message}`);
    }
  }

  // PORT is optional — we just warn if it falls back to the default
  if (!process.env.PORT) {
    console.warn("[validateEnv] PORT not set — defaulting to 5000.");
  }

  console.log("✅ Environment validated.");
}

module.exports = validateEnv;
