import { useState, useCallback, useRef } from "react";
import { lookupWord, lookupAIFallback, saveWord } from "../api/dictionaryApi";
import { quickExplainText } from "../../../services/dictionaryService";

/**
 * Manages dictionary lookup state: loading, result, error, saved status.
 * Uses an in-memory session cache to avoid repeated backend calls during study sessions.
 */
export function useDictionary(pdfId) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // In-memory session cache: avoids hitting the backend for the same word twice
  // per page session. Keyed by normalized word (lowercase + trimmed).
  const sessionCache = useRef({});

  const lookup = useCallback(async (word, pageNumber = null) => {
    if (!word || isLoading) return;

    const cacheKey = word.toLowerCase().trim();

    // Check session cache first
    if (sessionCache.current[cacheKey]) {
      setResult(sessionCache.current[cacheKey]);
      setError(null);
      setIsLoading(false);
      setIsSaved(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setIsSaved(false);

    try {
      let data = await lookupWord(word, pdfId, pageNumber);

      if (data.needsAIFallback) {
        setIsLoading("fallback");
        data = await lookupAIFallback(word, pdfId, pageNumber);
      }

      // Populate session cache
      sessionCache.current[cacheKey] = data;
      setResult(data);
    } catch (err) {
      if (err?.needsAIFallback) {
        try {
          setIsLoading("fallback");
          const aiData = await lookupAIFallback(word, pdfId, pageNumber);
          sessionCache.current[cacheKey] = aiData;
          setResult(aiData);
          return;
        } catch (aiErr) {
          setError(aiErr?.error || "Failed to generate explanation.");
          return;
        }
      }
      const msg = err?.error || "No dictionary definition available.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, pdfId]);

  const quickExplain = useCallback(async (text, pageNumber = null) => {
    if (!text || isLoading) return;

    setIsLoading("quick_explain");
    setError(null);
    setResult(null);
    setIsSaved(false);

    try {
      const data = await quickExplainText(text, pdfId, pageNumber);
      setResult(data);
    } catch (err) {
      setError(err?.error || "Failed to generate quick explanation.");
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, pdfId]);


  const save = useCallback(async (wordData, sourceType = "dictionary") => {
    if (!pdfId || !wordData || isSaving) return;

    setIsSaving(true);
    try {
      await saveWord(pdfId, wordData, sourceType);
      setIsSaved(true);
    } catch (err) {
      console.error("Save word error:", err);
    } finally {
      setIsSaving(false);
    }
  }, [pdfId, isSaving]);

  const clear = useCallback(() => {
    setResult(null);
    setError(null);
    setIsSaved(false);
    setIsLoading(false);
  }, []);

  return {
    isLoading,
    result,
    error,
    isSaved,
    isSaving,
    lookup,
    quickExplain,
    save,
    clear,
  };
}
