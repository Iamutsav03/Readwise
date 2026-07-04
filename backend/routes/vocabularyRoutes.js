const express = require("express");
const router = express.Router();
const vocabularyController = require("../controllers/vocabularyController");
// Routes for Vocabulary Vault

router.get("/stats", vocabularyController.getVocabularyStats);
router.get("/", vocabularyController.getVocabulary);
router.delete("/:id", vocabularyController.deleteVocabulary);
router.patch("/:id/review", vocabularyController.submitReview);

module.exports = router;
