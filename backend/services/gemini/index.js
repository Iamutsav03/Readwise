// services/gemini/index.js
// Barrel export for the gemini/ service directory.
// Controllers import from here instead of individual files.

const { generateAnswer } = require("./geminiClient");
const { buildPrompt, TEACHER_PERSONA } = require("./promptBuilder");
const { parseResponse } = require("./responseParser");

module.exports = { generateAnswer, buildPrompt, TEACHER_PERSONA, parseResponse };
