const mongoose = require("mongoose");
const DictionaryCache = require("../models/DictionaryCache");
const UserVocabulary = require("../models/UserVocabulary");
const PDF = require("../models/PDF");
const geminiService = require("../services/geminiService");

const TECHNICAL_TERMS = new Set([
  "ipc", "deadlock", "semaphore", "mutex", "starvation", "thrashing", 
  "hypervisor", "virtualization", "process", "thread", "scheduling", 
  "paging", "segmentation", "cache memory", "dma", "shell", "kernel"
]);

// Acronyms that dictionary APIs don't handle well — skip straight to AI
const ACRONYMS = new Set([
  "ipc", "dma", "cpu", "os", "dbms", "ram", "rom", "tcp", "udp",
  "api", "gui", "osi", "dns", "http", "https", "url", "ip", "mac",
  "io", "vm", "fifo", "lifo", "bst", "dfs", "bfs", "sql"
]);

/**
 * Normalizes a word: lowercase, trim, remove punctuation
 */
function normalizeWord(word) {
  if (!word) return "";
  return word.toLowerCase().trim().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
}



/**
 * POST /api/dictionary/lookup
 * Looks up a word in the dictionary cache, falling back to dictionaryapi.dev
 */
exports.lookupWord = async (req, res) => {
  try {
    const { word, pdfId, pageNumber } = req.body;
    if (!word || typeof word !== "string") {
      return res.status(400).json({ success: false, error: "Word is required" });
    }

    const normalized = normalizeWord(word);
    if (!normalized) {
      return res.status(400).json({ success: false, error: "Invalid word" });
    }

    // 1. Check MongoDB Cache
    let cached = await DictionaryCache.findOne({ word: normalized });
    
    if (cached) {
      cached.accessCount += 1;
      cached.lastAccessedAt = new Date();
      await cached.save();
      console.log(`[DICT] CACHE HIT: "${normalized}"`);
      return res.status(200).json({
        success: true,
        word: cached.word,
        meaning: cached.meaning,
        partOfSpeech: cached.partOfSpeech,
        example: cached.example,
        pronunciation: cached.pronunciation,
        synonyms: cached.synonyms,
        source: "cache",
      });
    }

    console.log(`[DICT] CACHE MISS: "${normalized}"`);

    const wordParts = normalized.split(/\s+/);
    const isPhrase = wordParts.length > 1;
    const isAcronym = ACRONYMS.has(normalized);

    // 2. Fast-route acronyms and multi-word phrases to AI (skip dictionaryapi.dev)
    if (isPhrase || isAcronym) {
      console.log(`[DICT] FAST ROUTE TO AI (${isPhrase ? "phrase" : "acronym"}): "${normalized}"`);
      return res.status(200).json({ success: false, needsAIFallback: true });
    }

    // 2. Fetch from Dictionary API
    let response;
    try {
      response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(normalized)}`);
    } catch (fetchErr) {
      console.warn(`[DICT] Fetch from api.dictionaryapi.dev failed for "${normalized}":`, fetchErr);
      return res.status(200).json({ success: false, needsAIFallback: true });
    }
    
    if (!response.ok) {
      console.warn(`[DICT] Dictionary API returned status ${response.status} for "${normalized}" → AI fallback`);
      return res.status(200).json({ success: false, needsAIFallback: true });
    }

    let data;
    try {
      data = await response.json();
    } catch (jsonErr) {
      console.warn(`[DICT] Failed to parse Dictionary API response for "${normalized}":`, jsonErr);
      return res.status(200).json({ success: false, needsAIFallback: true });
    }

    if (!data || !data.length) {
      console.log(`[DICT] DICTIONARY EMPTY for "${normalized}" → AI fallback`);
      return res.status(200).json({ success: false, needsAIFallback: true });
    }

    // 3. Extract best data
    const entry = data[0];
    const meaningObj = entry.meanings?.[0];
    const definitionObj = meaningObj?.definitions?.[0];

    const meaningText = definitionObj?.definition || "";
    const partOfSpeech = meaningObj?.partOfSpeech || "";
    const example = definitionObj?.example || "";
    const synonyms = meaningObj?.synonyms || [];

    // Poor quality detection: short definition = not useful enough
    if (!meaningText || meaningText.length < 10) {
      console.log(`[DICT] POOR QUALITY definition for "${normalized}" (length: ${meaningText.length}) → AI fallback`);
      return res.status(200).json({ success: false, needsAIFallback: true });
    }
    let pronunciation = entry.phonetic || "";
    if (!pronunciation && entry.phonetics && entry.phonetics.length > 0) {
      const phoneticWithText = entry.phonetics.find(p => p.text);
      if (phoneticWithText) {
        pronunciation = phoneticWithText.text;
      }
    }

    // 4. Save to Cache
    const newCache = await DictionaryCache.create({
      word: normalized,
      meaning: meaningText,
      partOfSpeech,
      example,
      pronunciation,
      synonyms,
      accessCount: 1,
      lastAccessedAt: new Date(),
    });

    console.log(`[DICT] DICTIONARY API HIT: "${normalized}"`);

    return res.status(200).json({
      success: true,
      word: newCache.word,
      meaning: newCache.meaning,
      partOfSpeech: newCache.partOfSpeech,
      example: newCache.example,
      pronunciation: newCache.pronunciation,
      synonyms: newCache.synonyms,
      source: "api",
    });

  } catch (error) {
    console.error("Dictionary lookup error:", error);
    return res.status(500).json({ success: false, error: "Internal server error during dictionary lookup." });
  }
};

/**
 * POST /api/dictionary/explain
 * AI Fallback endpoint using Gemini
 */
exports.explainAIFallback = async (req, res) => {
  try {
    const { word, pdfId, pageNumber } = req.body;
    if (!word) {
      return res.status(400).json({ success: false, error: "Word is required" });
    }

    const normalized = normalizeWord(word);
    console.log(`[DICT] AI FALLBACK HIT: "${normalized}"`);

    const prompt = `You are an expert teacher.
Explain this word or term for a beginner.

Word:
${normalized}

Return ONLY valid JSON with no markdown formatting. The JSON must exactly match this structure:
{
  "meaning": "Simple one-line meaning",
  "partOfSpeech": "noun/verb/etc or empty string",
  "example": "Relatable analogy or real world example",
  "synonyms": ["concept 1", "concept 2", "concept 3"]
}

Rules:
- Never use textbook language.
- Never copy definitions.
- Assume the user is a student.
- Keep response concise and easy.`;

    const aiResult = await geminiService.generateAnswer(prompt, []); // No RAG context needed
    
    if (!aiResult.success) {
      throw new Error(`AI Fallback failed: ${aiResult.error}`);
    }

    const aiText = aiResult.response;

    // Parse the JSON block
    let parsedResult;
    try {
      const cleanedJson = aiText.replace(/```json/g, "").replace(/```/g, "").trim();
      parsedResult = JSON.parse(cleanedJson);
    } catch (err) {
      console.error("Failed to parse AI dictionary fallback JSON:", err, aiText);
      // Fallback if AI didn't follow JSON format correctly
      parsedResult = {
        meaning: aiText,
        partOfSpeech: "",
        example: "",
        synonyms: []
      };
    }

    // Save to Cache
    const newCache = await DictionaryCache.create({
      word: normalized,
      meaning: parsedResult.meaning,
      partOfSpeech: parsedResult.partOfSpeech || "",
      example: parsedResult.example || "",
      pronunciation: "AI Generated",
      synonyms: parsedResult.synonyms || [],
      accessCount: 1,
      lastAccessedAt: new Date(),
    });

    return res.status(200).json({
      success: true,
      word: newCache.word,
      meaning: newCache.meaning,
      partOfSpeech: newCache.partOfSpeech,
      example: newCache.example,
      pronunciation: newCache.pronunciation,
      synonyms: newCache.synonyms,
      source: "ai",
    });

  } catch (error) {
    console.error("AI Fallback error:", error);
    return res.status(500).json({ success: false, error: "Failed to generate AI explanation." });
  }
};

/**
 * POST /api/dictionary/quick-explain
 * AI Quick Explain endpoint using Gemini for phrases/sentences.
 */
exports.quickExplain = async (req, res) => {
  try {
    const { text, pdfId, pageNumber } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, error: "Text is required" });
    }
    const trimmed = text.trim();
    console.log(`[DICT] AI QUICK EXPLAIN HIT: "${trimmed.substring(0, 50)}..."`);

    const prompt = `You are an expert teacher explaining concepts to a beginner.

Text selected by the user:
"${trimmed}"

Return ONLY valid JSON with no markdown formatting. The JSON must exactly match this structure:
{
  "meaning": "A concise, plain-language explanation in 1-3 sentences. No textbook jargon.",
  "contextExample": "A short example that directly uses or relates to the selected text and its real-world context (as if from the same topic).",
  "generalExample": "A simple everyday example that illustrates the same concept from scratch, as if explaining to someone who knows nothing about the topic."
}

Rules:
- meaning: Keep it short, simple, and jargon-free.
- contextExample: Must be relevant to the actual subject/domain of the selected text.
- generalExample: Must be a relatable real-world analogy or everyday scenario.
- Never repeat the same wording across the three fields.`;

    const aiResult = await geminiService.generateAnswer(prompt, []);
    
    if (!aiResult.success) {
      throw new Error(`Quick Explain failed: ${aiResult.error}`);
    }

    const aiText = aiResult.response;

    let parsedResult;
    try {
      const cleanedJson = aiText.replace(/```json/g, "").replace(/```/g, "").trim();
      parsedResult = JSON.parse(cleanedJson);
    } catch (err) {
      console.error("Failed to parse Quick Explain JSON:", err, aiText);
      parsedResult = { meaning: aiText };
    }

    return res.status(200).json({
      success: true,
      word: trimmed.length > 30 ? trimmed.substring(0, 30) + "..." : trimmed,
      meaning: parsedResult.meaning,
      contextExample: parsedResult.contextExample,
      generalExample: parsedResult.generalExample,
      source: "ai",
    });

  } catch (error) {
    console.error("Quick Explain error:", error);
    return res.status(500).json({ success: false, error: "Failed to generate quick explanation." });
  }
};


/**
 * POST /api/dictionary/save
 * Saves a word for future Vocabulary Builder feature
 */
exports.saveWord = async (req, res) => {
  try {
    const { pdfId, word, meaning, pageNumber, sourceType } = req.body;

    if (!pdfId || !mongoose.Types.ObjectId.isValid(pdfId)) {
      return res.status(400).json({ success: false, error: "Valid pdfId is required" });
    }
    if (!word) {
      return res.status(400).json({ success: false, error: "Word is required" });
    }

    const normalized = normalizeWord(word);

    // Prevent duplicates for the same PDF in UserVocabulary per user
    const existing = await UserVocabulary.findOne({ pdfId, word: normalized, userId: req.user.id });
    if (existing) {
      return res.status(200).json({ success: true, savedWord: existing, message: "Word already saved" });
    }

    // Lookup the PDF title for denormalization
    const pdf = await PDF.findById(pdfId).select("originalName").lean();
    const pdfTitle = pdf?.originalName || "Unknown Document";

    const savedWord = await UserVocabulary.create({
      pdfId,
      userId: req.user.id,
      word: normalized,
      meaning,
      pageNumber: pageNumber || null,
      sourceType: sourceType || "dictionary",
      pdfTitle,
    });

    return res.status(201).json({ success: true, savedWord });

  } catch (error) {
    console.error("Dictionary save error:", error);
    return res.status(500).json({ success: false, error: "Internal server error during word save." });
  }
};
