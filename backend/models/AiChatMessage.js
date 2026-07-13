// models/AiChatMessage.js
// Stores individual AI chat messages per PDF conversation.
// Each document represents one message (user or assistant) in a PDF chat session.

const mongoose = require("mongoose");

const aiChatMessageSchema = new mongoose.Schema(
  {
    // The PDF this conversation belongs to
    pdfId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PDF",
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    },

    guestId: {
      type: String,
      required: false,
      index: true,
    },

    // Who sent the message
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },

    // The message text content
    content: {
      type: String,
      default: "",
    },

    // Optional: store which page numbers were used as context for this response
    // Useful for future "view source" or citation features
    contextPages: {
      type: [Number],
      default: [],
    },

    // Number of source paragraphs used to generate this response
    contextParagraphs: {
      type: Number,
      default: 0,
    },

    // Optional: the AI feature type that generated this message
    // e.g. "chat", "summary", "flashcards", "quiz", "explain", "interview", "concepts"
    // Designed to support future feature extensions without schema changes
    featureType: {
      type: String,
      default: "chat",
    },

    // Tracks the current state of an AI request to support retries and streaming
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "completed", // User messages are completed by default
    },

    // Stores the structured error code if status is "failed"
    errorCode: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // createdAt is the message timestamp
  }
);

// Index for fast retrieval of all messages for a PDF in chronological order
aiChatMessageSchema.index({ pdfId: 1, createdAt: 1 });

module.exports = mongoose.model("AiChatMessage", aiChatMessageSchema);
