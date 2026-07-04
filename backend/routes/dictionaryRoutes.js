const express = require("express");
const router = express.Router();
const dictionaryController = require("../controllers/dictionaryController");

// Look up a word (checks cache first, then API)
router.post("/lookup", dictionaryController.lookupWord);

// AI Fallback explanation
router.post("/explain", dictionaryController.explainAIFallback);

// AI Quick Explain (sentences/phrases)
router.post("/quick-explain", dictionaryController.quickExplain);

// Save a word to the user's vocabulary for a specific PDF
router.post("/save", dictionaryController.saveWord);

module.exports = router;
