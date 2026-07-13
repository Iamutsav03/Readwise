// models/GuestUsage.js
// Tracks usage limits for anonymous guests using a guestId (UUID).

const mongoose = require("mongoose");

const guestUsageSchema = new mongoose.Schema(
  {
    guestId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    quickExplainUsed: {
      type: Number,
      default: 0,
    },
    deepExplainUsed: {
      type: Number,
      default: 0,
    },
    uploadedPdfCount: {
      type: Number,
      default: 0,
    },
    // We can expire guest usage after some time if we want, 
    // e.g., 30 days of inactivity to keep the DB clean.
    lastActiveAt: {
      type: Date,
      default: Date.now,
      index: { expires: "30d" },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("GuestUsage", guestUsageSchema);
