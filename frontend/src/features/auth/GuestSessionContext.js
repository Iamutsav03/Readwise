// features/auth/GuestSessionContext.js
// A React context that provides guest session state globally.
// Wraps the useGuestSession hook and exposes a PremiumModal trigger.

import React, { createContext, useContext, useState, useCallback } from "react";
import { useGuestSession } from "./hooks/useGuestSession";

export const GuestSessionContext = createContext(null);

/**
 * Maps trigger keys to user-friendly copy for the PremiumModal.
 */
const MODAL_COPY = {
  "upload-limit": {
    title: "You've reached your free document limit",
    body:  "Create a free account to upload unlimited PDFs, get cloud sync, and keep your reading history forever.",
  },
  "quick-explain-limit": {
    title: "You've used all 5 free Quick Explains",
    body:  "Create a free account to unlock unlimited AI explanations, Vocabulary Vault, cloud sync and much more.",
  },
  "deep-explain-limit": {
    title: "You've used all 2 free Deep Explains",
    body:  "Create a free account to unlock unlimited AI explanations and powerful reading tools.",
  },
  "vocabulary-vault": {
    title: "Vocabulary Vault is a premium feature",
    body:  "Create a free account to review, study, and manage all your saved words in one powerful place.",
  },
  "ai-chat": {
    title: "AI Chat is available after creating your free account",
    body:  "Chat with your documents, ask questions, and get instant summaries — all for free with an account.",
  },
  "notes": {
    title: "Notes require a free account",
    body:  "Create a free account to annotate PDFs, organise your thoughts, and sync notes across devices.",
  },
  "split-view": {
    title: "Split View requires a free account",
    body:  "Read two documents side by side. Sign up for free to unlock this and many more features.",
  },
  "analytics": {
    title: "Reading Analytics requires a free account",
    body:  "Track your reading speed, time spent, and progress across all your documents.",
  },
  default: {
    title: "This feature requires a free account",
    body:  "Create a free account to unlock this and many more powerful reading features.",
  },
};

export function GuestSessionProvider({ children }) {
  const guestSession = useGuestSession();

  const [premiumModal, setPremiumModal] = useState({ open: false, trigger: "default" });

  const openPremiumModal = useCallback((trigger = "default") => {
    setPremiumModal({ open: true, trigger });
  }, []);

  const closePremiumModal = useCallback(() => {
    setPremiumModal((prev) => ({ ...prev, open: false }));
  }, []);

  const modalCopy = MODAL_COPY[premiumModal.trigger] || MODAL_COPY.default;

  return (
    <GuestSessionContext.Provider
      value={{
        ...guestSession,
        premiumModal,
        modalCopy,
        openPremiumModal,
        closePremiumModal,
      }}
    >
      {children}
    </GuestSessionContext.Provider>
  );
}

export function useGuestSessionContext() {
  const ctx = useContext(GuestSessionContext);
  if (!ctx) throw new Error("useGuestSessionContext must be used within GuestSessionProvider");
  return ctx;
}
