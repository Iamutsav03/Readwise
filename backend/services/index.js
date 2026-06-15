// services/index.js
// Top-level barrel for all backend services.
// Controllers import from this single entry point instead of individual paths.
//
// Usage:
//   const { generateAnswer, buildPrompt, fetchRelevantContext } = require('../services');

const gemini = require("./gemini");
const { fetchRelevantContext, fetchContextByScope } = require("./ragService");
const { getCachedResponse, setCachedResponse, invalidatePdf, getCacheStats } = require("./aiCacheService");
const pdfPageService = require("./pdfPageService");

module.exports = {
  // Gemini AI
  generateAnswer: gemini.generateAnswer,
  buildPrompt: gemini.buildPrompt,
  parseResponse: gemini.parseResponse,
  TEACHER_PERSONA: gemini.TEACHER_PERSONA,

  // RAG / context retrieval
  fetchRelevantContext,
  fetchContextByScope,

  // AI response cache
  getCachedResponse,
  setCachedResponse,
  invalidatePdf,
  getCacheStats,

  // PDF page extraction
  pdfPageService,
};
