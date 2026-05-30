// server.js
// Main entry point for the ReadWise backend server.

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "DELETE"],
}));

app.use(express.json());

// Serve uploaded files statically
// e.g. http://localhost:5000/uploads/filename.pdf
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/test", require("./routes/testRoutes"));
app.use("/api/pdfs", require("./routes/pdfRoutes"));
app.use("/api/search", require("./routes/searchRoutes")); // NEW: search inside PDF
app.use("/api/bookmarks", require("./routes/bookmarkRoutes"));

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ message: "An unexpected server error occurred." });
});

// ── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});