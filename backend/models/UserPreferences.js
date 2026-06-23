// models/UserPreferences.js
// Stores per-user app settings: theme, reader defaults, toolbar state.

const mongoose = require("mongoose");

const userPreferencesSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    theme: {
      type: String,
      default: "dark",
    },
    readerSettings: {
      defaultFitMode:    { type: String, default: "page" },
      defaultZoom:       { type: Number, default: 1 },
      focusModeOnOpen:   { type: Boolean, default: false },
    },
    toolbarPreferences: {
      sidebarOpen: { type: Boolean, default: false },
      activeTab:   { type: String, default: null },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserPreferences", userPreferencesSchema);
