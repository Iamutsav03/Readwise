// src/features/vocabulary/hooks/useVocabulary.js
import { useState, useEffect, useCallback } from "react";
import * as vocabApi from "../../../services/vocabularyService";

export function useVocabulary() {
  const [vocabulary, setVocabulary] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [vData, sData] = await Promise.all([
        vocabApi.getVocabulary(),
        vocabApi.getVocabularyStats()
      ]);
      setVocabulary(vData);
      setStats(sData);
    } catch (err) {
      console.error("Failed to fetch vocabulary", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const removeWord = async (id) => {
    try {
      await vocabApi.deleteVocabulary(id);
      setVocabulary(prev => prev.filter(w => w._id !== id));
      if (stats) setStats(prev => ({ ...prev, totalSaved: prev.totalSaved - 1 }));
    } catch (err) {
      console.error("Failed to delete word", err);
    }
  };

  const reviewWord = async (id, score) => {
    try {
      const updated = await vocabApi.submitReview(id, score);
      setVocabulary(prev => prev.map(w => w._id === id ? updated : w));
      return updated;
    } catch (err) {
      console.error("Failed to review word", err);
      throw err;
    }
  };

  return {
    vocabulary,
    stats,
    isLoading,
    removeWord,
    reviewWord,
    refresh: fetchAll
  };
}
