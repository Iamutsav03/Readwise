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

function ProgressBars({ usage, LIMITS }) {
  const bars = [
    { label: "Quick Explain", used: usage.quickExplainUsed, max: LIMITS.quickExplain },
    { label: "Deep Explain",  used: usage.deepExplainUsed,  max: LIMITS.deepExplain },
  ];
  return (
    <div style={{ marginTop: 16, padding: "14px 16px", background: "var(--rw-page-card-bg, rgba(255,255,255,0.05))", borderRadius: 12, border: "1px solid var(--rw-border)" }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: "var(--rw-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 10px" }}>
        Your Progress
      </p>
      {bars.map(({ label, used, max }) => {
        const pct = Math.min((used / max) * 100, 100);
        const exhausted = used >= max;
        return (
          <div key={label} style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: "var(--rw-text-secondary)" }}>{label}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: exhausted ? "var(--rw-danger)" : "var(--rw-text-primary)" }}>
                {used}/{max}
              </span>
            </div>
            <div style={{ height: 6, background: "var(--rw-border)", borderRadius: 3, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${pct}%`,
                  background: exhausted
                    ? "var(--rw-danger)"
                    : `linear-gradient(90deg, var(--rw-accent), var(--rw-accent-hover, var(--rw-accent)))`,
                  borderRadius: 3,
                  transition: "width 0.5s ease",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function PremiumModal({ onSignup, onSignin }) {
  const { premiumModal, modalCopy, closePremiumModal, openPremiumModal, guestUsage, LIMITS, guestHighlights, guestVocabulary, guestBookmarks } = useGuestSessionContext();
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
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
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
          padding: 20px;
          animation: rw-backdrop-in 0.2s ease forwards;
        }
        .rw-premium-modal {
          position: relative;
          width: 100%; max-width: 480px;
          background: var(--rw-card-bg);
          border: 1px solid var(--rw-border);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 32px 80px rgba(0,0,0,0.4);
          animation: rw-modal-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          font-family: 'DM Sans', sans-serif;
        }
        .rw-pm-header {
          padding: 28px 28px 20px;
          background: linear-gradient(135deg,
            color-mix(in srgb, var(--rw-accent) 20%, transparent),
            color-mix(in srgb, var(--rw-accent) 8%, transparent)
          );
          border-bottom: 1px solid var(--rw-border);
        }
        .rw-pm-body { padding: 20px 28px 28px; }
        .rw-pm-close {
          position: absolute; top: 16px; right: 16px;
          width: 32px; height: 32px;
          background: var(--rw-hover-bg);
          border: 1px solid var(--rw-border);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--rw-text-muted);
          transition: all 0.2s;
        }
        .rw-pm-close:hover { background: var(--rw-border); color: var(--rw-text-primary); }
        .rw-pm-btn-primary {
          width: 100%; padding: 14px;
          background: var(--rw-accent);
          color: var(--rw-accent-text);
          border: none; border-radius: 10px;
          font-family: inherit; font-size: 15px; font-weight: 600;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: all 0.2s; margin-bottom: 10px;
        }
        .rw-pm-btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
        .rw-pm-btn-secondary {
          width: 100%; padding: 12px;
          background: transparent;
          color: var(--rw-text-secondary);
          border: 1px solid var(--rw-border); border-radius: 10px;
          font-family: inherit; font-size: 14px; font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .rw-pm-btn-secondary:hover { background: var(--rw-hover-bg); color: var(--rw-text-primary); }
        .rw-pm-feature-row {
          display: flex; align-items: center; gap: 10px;
          padding: 7px 0;
          color: var(--rw-text-secondary);
          font-size: 13.5px;
        }
        .rw-pm-feature-icon {
          width: 28px; height: 28px;
          background: color-mix(in srgb, var(--rw-accent) 15%, transparent);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          color: var(--rw-accent); flex-shrink: 0;
        }
        @media (max-width: 480px) {
          .rw-premium-modal { border-radius: 16px; }
          .rw-pm-header, .rw-pm-body { padding-left: 20px; padding-right: 20px; }
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
            <X size={14} />
          </button>

          {/* Header */}
          <div className="rw-pm-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{
                width: 40, height: 40,
                background: "var(--rw-accent)",
                borderRadius: 12,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--rw-accent-text)",
              }}>
                <Lock size={18} />
              </div>
              <div style={{
                fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--rw-accent)",
              }}>
                Freemium Limit
              </div>
            </div>
            <h2 id="rw-pm-title" style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 700, color: "var(--rw-text-primary)", lineHeight: 1.3 }}>
              {modalCopy.title}
            </h2>
            <p style={{ margin: 0, fontSize: 14, color: "var(--rw-text-secondary)", lineHeight: 1.55 }}>
              {modalCopy.body}
            </p>

            {/* Progress already made */}
            {savedCount > 0 && (
              <div style={{
                marginTop: 14, padding: "10px 14px",
                background: "color-mix(in srgb, var(--rw-success, #22c55e) 12%, transparent)",
                border: "1px solid color-mix(in srgb, var(--rw-success, #22c55e) 30%, transparent)",
                borderRadius: 10,
                fontSize: 13, color: "var(--rw-text-primary)",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <Sparkles size={14} style={{ color: "var(--rw-success, #22c55e)", flexShrink: 0 }} />
                <span>
                  You've already saved <strong>{savedCount} item{savedCount !== 1 ? "s" : ""}</strong>.
                  {" "}Create a free account so they're never lost.
                </span>
              </div>
            )}
          </div>

          {/* Body */}
          <div className="rw-pm-body">
            {/* Usage progress */}
            <ProgressBars usage={guestUsage} LIMITS={LIMITS} />

            {/* Feature list */}
            <div style={{ margin: "16px 0" }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--rw-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 10px" }}>
                Free Account Unlocks
              </p>
              {FEATURE_LIST.map(({ icon: Icon, label }) => (
                <div key={label} className="rw-pm-feature-row">
                  <div className="rw-pm-feature-icon"><Icon size={14} /></div>
                  {label}
                </div>
              ))}
            </div>

            {/* Actions */}
            <button className="rw-pm-btn-primary" id="rw-pm-signup-btn" onClick={() => { closePremiumModal(); onSignup?.(); }}>
              <Users size={16} />
              Create Free Account
              <ArrowRight size={15} />
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
