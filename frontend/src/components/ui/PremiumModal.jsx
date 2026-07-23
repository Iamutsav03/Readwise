// components/ui/PremiumModal.jsx
// Beautiful premium/login-wall modal shown when a guest hits a feature limit.
// Listens for window "rw:guest-limit" events AND can be triggered imperatively
// via the GuestSessionContext.openPremiumModal().

import React, { useEffect, useRef } from "react";
import { useGuestSessionContext } from "../../features/auth/GuestSessionContext";
import { useAuth } from "../../features/auth/useAuth";
import {
  Sparkles, BookOpen, Bookmark, Languages, Brain, Layers,
  X, ArrowRight, Users, Lock,
} from "lucide-react";

const FEATURE_LIST = [
  { icon: Brain,     label: "Unlimited AI Explanations" },
  { icon: BookOpen,  label: "Vocabulary Vault" },
  { icon: Layers,    label: "Cloud Sync & Backup" },
  { icon: Bookmark,  label: "Notes & Annotations" },
  { icon: Languages, label: "AI Chat with Documents" },
];

export default function PremiumModal({ onSignup, onSignin }) {
  const { premiumModal, modalCopy, closePremiumModal, openPremiumModal, guestHighlights, guestVocabulary, guestBookmarks } = useGuestSessionContext();
  const { user } = useAuth();
  const backdropRef = useRef(null);

  // Listen for global guest-limit events from httpClient
  useEffect(() => {
    const handleLimit = (e) => openPremiumModal(e.detail?.trigger || "default");
    window.addEventListener("rw:guest-limit", handleLimit);
    return () => window.removeEventListener("rw:guest-limit", handleLimit);
  }, [openPremiumModal]);

  // Close on Escape
  useEffect(() => {
    if (!premiumModal.open) return;
    const handle = (e) => { if (e.key === "Escape") closePremiumModal(); };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [premiumModal.open, closePremiumModal]);

  // Don't show if user is already logged in
  if (!premiumModal.open || user) return null;

  const savedCount = guestHighlights.length + guestVocabulary.length + guestBookmarks.length;

  return (
    <>
      <style>{`
        @keyframes rw-modal-in {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1)   translateY(0); }
        }
        @keyframes rw-backdrop-in {
          from { opacity: 0; } to { opacity: 1; }
        }
        .rw-premium-modal-backdrop {
          position: fixed; inset: 0; z-index: 99998;
          background: rgba(0,0,0,0.65);
          backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          padding: 16px;
          animation: rw-backdrop-in 0.2s ease forwards;
        }
        .rw-premium-modal {
          position: relative;
          width: 100%; max-width: 440px;
          background: var(--rw-card-bg);
          border: 1px solid var(--rw-border);
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 24px 60px rgba(0,0,0,0.4);
          animation: rw-modal-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          font-family: 'DM Sans', sans-serif;
        }
        .rw-pm-close {
          position: absolute; top: 12px; right: 12px;
          width: 28px; height: 28px;
          background: var(--rw-hover-bg);
          border: 1px solid var(--rw-border);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--rw-text-muted);
          transition: all 0.2s; z-index: 1;
        }
        .rw-pm-close:hover { background: var(--rw-border); color: var(--rw-text-primary); }
        .rw-pm-btn-primary {
          width: 100%; padding: 11px 14px;
          background: var(--rw-accent);
          color: var(--rw-accent-text);
          border: none; border-radius: 9px;
          font-family: inherit; font-size: 14px; font-weight: 600;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 7px;
          transition: all 0.2s; margin-bottom: 8px;
        }
        .rw-pm-btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
        .rw-pm-btn-secondary {
          width: 100%; padding: 10px;
          background: transparent;
          color: var(--rw-text-secondary);
          border: 1px solid var(--rw-border); border-radius: 9px;
          font-family: inherit; font-size: 13px; font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .rw-pm-btn-secondary:hover { background: var(--rw-hover-bg); color: var(--rw-text-primary); }
        .rw-pm-feature-row {
          display: flex; align-items: center; gap: 9px;
          padding: 5px 0;
          color: var(--rw-text-secondary);
          font-size: 12.5px;
        }
        .rw-pm-feature-icon {
          width: 24px; height: 24px;
          background: color-mix(in srgb, var(--rw-accent) 15%, transparent);
          border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          color: var(--rw-accent); flex-shrink: 0;
        }
      `}</style>

      <div
        className="rw-premium-modal-backdrop"
        ref={backdropRef}
        onClick={(e) => { if (e.target === backdropRef.current) closePremiumModal(); }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="rw-pm-title"
      >
        <div className="rw-premium-modal">
          {/* Close */}
          <button className="rw-pm-close" onClick={closePremiumModal} aria-label="Close">
            <X size={13} />
          </button>

          {/* Header */}
          <div style={{
            padding: "20px 22px 16px",
            background: "linear-gradient(135deg, color-mix(in srgb, var(--rw-accent) 20%, transparent), color-mix(in srgb, var(--rw-accent) 8%, transparent))",
            borderBottom: "1px solid var(--rw-border)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
              <div style={{
                width: 34, height: 34,
                background: "var(--rw-accent)",
                borderRadius: 10,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--rw-accent-text)",
                flexShrink: 0,
              }}>
                <Lock size={16} />
              </div>
              <div style={{
                fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--rw-accent)",
              }}>
                Free Account Required
              </div>
            </div>
            <h2 id="rw-pm-title" style={{ margin: "0 0 5px", fontSize: 17, fontWeight: 700, color: "var(--rw-text-primary)", lineHeight: 1.3 }}>
              {modalCopy.title}
            </h2>
            <p style={{ margin: 0, fontSize: 12.5, color: "var(--rw-text-secondary)", lineHeight: 1.5 }}>
              {modalCopy.body}
            </p>

            {/* Saved data banner */}
            {savedCount > 0 && (
              <div style={{
                marginTop: 10, padding: "8px 12px",
                background: "color-mix(in srgb, var(--rw-success, #22c55e) 12%, transparent)",
                border: "1px solid color-mix(in srgb, var(--rw-success, #22c55e) 30%, transparent)",
                borderRadius: 8,
                fontSize: 12, color: "var(--rw-text-primary)",
                display: "flex", alignItems: "center", gap: 7,
              }}>
                <Sparkles size={12} style={{ color: "var(--rw-success, #22c55e)", flexShrink: 0 }} />
                <span>
                  You've already saved <strong>{savedCount} item{savedCount !== 1 ? "s" : ""}</strong>. Sign up so they're never lost.
                </span>
              </div>
            )}
          </div>

          {/* Body */}
          <div style={{ padding: "14px 22px 18px" }}>
            {/* Feature list */}
            <p style={{ fontSize: 10, fontWeight: 600, color: "var(--rw-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>
              Free Account Unlocks
            </p>
            <div style={{ marginBottom: 14 }}>
              {FEATURE_LIST.map(({ icon: Icon, label }) => (
                <div key={label} className="rw-pm-feature-row">
                  <div className="rw-pm-feature-icon"><Icon size={12} /></div>
                  {label}
                </div>
              ))}
            </div>

            {/* Actions */}
            <button className="rw-pm-btn-primary" id="rw-pm-signup-btn" onClick={() => { closePremiumModal(); onSignup?.(); }}>
              <Users size={15} />
              Create Free Account
              <ArrowRight size={14} />
            </button>
            <button className="rw-pm-btn-secondary" id="rw-pm-signin-btn" onClick={() => { closePremiumModal(); onSignin?.(); }}>
              Sign In
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
