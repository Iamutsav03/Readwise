const mongoose = require("mongoose");

const savedWordSchema = new mongoose.Schema(
  {
    pdfId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PDF",
      required: true,
      index: true,
    },
    word: {
      type: String,
      required: true,
    },
    meaning: {
      type: String,
      required: true,
    },
    partOfSpeech: {
      type: String,
      default: "",
    },
    example: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SavedWord", savedWordSchema);
