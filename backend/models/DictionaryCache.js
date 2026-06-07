const mongoose = require("mongoose");

const dictionaryCacheSchema = new mongoose.Schema(
  {
    word: {
      type: String,
      required: true,
      unique: true,
      index: true,
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
    pronunciation: {
      type: String,
      default: "",
    },
    synonyms: {
      type: [String],
      default: [],
    },
    accessCount: {
      type: Number,
      default: 1,
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DictionaryCache", dictionaryCacheSchema);
