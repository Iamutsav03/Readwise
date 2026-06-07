// features/ai/hooks/useAiChat.js
// Manages AI chat state for a specific PDF.
// Loads chat history from the backend on mount and sends messages via the AI API.
// Designed to be extended with featureType (summaries, flashcards, etc.)

import { useState, useEffect, useCallback, useRef } from "react";
import { sendChatMessage, fetchChatHistory, clearChatHistory, sendExplainSelection } from "../api/aiApi";

/**
 * @param {string} pdfId - The ID of the currently open PDF
 */
export default function useAiChat(pdfId) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Load persisted chat history from MongoDB whenever the PDF changes
  useEffect(() => {
    if (!pdfId) return;
    setMessages([]);
    setError(null);
    setIsHistoryLoading(true);

    fetchChatHistory(pdfId)
      .then((msgs) => setMessages(msgs))
      .catch((err) => {
        console.error("useAiChat: failed to load history", err);
        setError("Could not load chat history.");
      })
      .finally(() => setIsHistoryLoading(false));
  }, [pdfId]);

  /**
   * Handle a chat message request
   * @param {string} text
   * @param {string} featureType
   * @param {object} options - { pageScope, fromPage, toPage, importance, featureOptions }
   */
  const handleSendMessage = useCallback(
    async (text, featureType = "chat", options = {}) => {
      if (!pdfId || !text.trim() || isLoading || isRetrying) return;

      const tempUserMsg = {
        _id: Date.now().toString(),
        role: "user",
        content: text,
        featureType,
        createdAt: new Date().toISOString(),
        status: "completed",
      };

      setMessages((prev) => [...prev, tempUserMsg]);
      setIsLoading(true);
      setError(null);

      try {
        const data = await sendChatMessage(pdfId, text, featureType, null, options);
        if (data.success) {
          setMessages((prev) => {
            const filtered = prev.filter((m) => m._id !== tempUserMsg._id);
            return [...filtered, data.userMessage, data.assistantMessage];
          });
        }
      } catch (err) {
        console.error("AI Chat Error:", err);
        const code = err.code || "AI_ERROR";
        
        const failedMsg = {
          _id: "failed_" + Date.now().toString(),
          role: "assistant",
          content: "Sorry, I couldn't process that. Please try again.",
          featureType,
          createdAt: new Date().toISOString(),
          status: "failed",
          errorCode: code,
          originalText: text,
        };
        
        setMessages((prev) => [...prev, failedMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [pdfId, isLoading, isRetrying]
  );

  /**
   * Clear all messages for this PDF (both locally and in the backend).
   */
  const clearHistory = useCallback(async () => {
    if (!pdfId) return;
    try {
      await clearChatHistory(pdfId);
      setMessages([]);
      setError(null);
    } catch (err) {
      console.error("useAiChat: clearHistory failed", err);
      setError("Failed to clear chat history.");
    }
  }, [pdfId]);

  /**
   * Handle an explain selection request
   */
  const explainSelection = useCallback(
    async (selectedText, pageNumber) => {
      if (!pdfId || !selectedText.trim() || isLoading || isRetrying) return;

      const tempUserMsg = {
        _id: Date.now().toString(),
        role: "user",
        content: selectedText,
        featureType: "explain-selection",
        createdAt: new Date().toISOString(),
        status: "completed",
      };

      setMessages((prev) => [...prev, tempUserMsg]);
      setIsLoading(true);

      try {
        const data = await sendExplainSelection(pdfId, pageNumber, selectedText);
        if (data.success) {
          setMessages((prev) => {
            const filtered = prev.filter((m) => m._id !== tempUserMsg._id);
            return [...filtered, data.userMessage, data.assistantMessage];
          });
        }
      } catch (err) {
        console.error("AI Explain Error:", err);
        const code = err.code || "AI_ERROR";
        
        const failedMsg = {
          _id: "failed_" + Date.now().toString(),
          role: "assistant",
          content: "Sorry, I couldn't explain that text right now. Please try again.",
          featureType: "explain-selection",
          createdAt: new Date().toISOString(),
          status: "failed",
          errorCode: code,
          originalText: selectedText,
          originalPage: pageNumber,
        };
        
        setMessages((prev) => [...prev, failedMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [pdfId, isLoading, isRetrying]
  );

  /**
   * Retry a failed message
   */
  const retryMessage = useCallback(
    async (failedMessageId, text, featureType, pageNumber = null) => {
      if (!pdfId || isLoading || isRetrying) return;

      setIsRetrying(true);
      
      // We don't remove the failed message yet, we let AiPanel show "Attempting to reconnect..."

      try {
        let data;
        if (featureType === "explain-selection") {
          // Send to explain retry
          // We need the ID of the actual assistant message in the DB if it exists, 
          // but if it failed in frontend before DB creation, we just send normally
          const retryId = failedMessageId.startsWith("failed_") ? null : failedMessageId;
          data = await sendExplainSelection(pdfId, pageNumber, text, retryId);
        } else {
          const retryId = failedMessageId.startsWith("failed_") ? null : failedMessageId;
          data = await sendChatMessage(pdfId, text, featureType, retryId);
        }

        if (data.success) {
          setMessages((prev) => {
            // Remove the failed placeholder and add the real messages
            const filtered = prev.filter((m) => m._id !== failedMessageId && m._id !== data.userMessage._id);
            // Also remove any existing assistant message with the same DB ID just in case
            const deduped = filtered.filter(m => m._id !== data.assistantMessage._id);
            // If the userMsg already exists in state, we don't need to add data.userMessage.
            // Wait, if it's a retry, we didn't create a new user message optimistically, 
            // so we should just replace the failed assistant message with the successful one.
            return [...deduped, data.assistantMessage];
          });
        }
      } catch (err) {
        console.error("AI Retry Error:", err);
        // On retry failure, keep the failed message so they can retry again
      } finally {
        setIsRetrying(false);
      }
    },
    [pdfId, isLoading, isRetrying]
  );

  return {
    messages,
    isLoading,
    isRetrying,
    isHistoryLoading,
    error,
    sendMessage: handleSendMessage,
    clearHistory,
    explainSelection,
    retryMessage,
  };
}
