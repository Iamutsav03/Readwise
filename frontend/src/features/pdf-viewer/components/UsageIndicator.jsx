// features/pdf-viewer/components/UsageIndicator.jsx
// Small "fuel gauge" widget in the reader for guest users.
// Shows Quick Explain (n/5) and Deep Explain (n/2) usage with block bars.
// Hidden for logged-in users.

import React, { useState } from "react";
import { useAuth } from "../../../features/auth/useAuth";
import { useGuestSessionContext } from "../../../features/auth/GuestSessionContext";
import { Zap, Brain, BookOpen } from "lucide-react";

function BlockBar({ used, max, color }) {
  return (
    <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: 2,
            background: i < used ? color : "rgba(255,255,255,0.15)",
            transition: "background 0.3s",
          }}
        />
      ))}
    </div>
  );
}

export default function UsageIndicator() {
  const { user } = useAuth();
  const { guestUsage, LIMITS, openPremiumModal } = useGuestSessionContext();
  const [expanded, setExpanded] = useState(false);

  // Hidden for logged-in users
  if (user) return null;

  const quickExhausted = guestUsage.quickExplainUsed >= LIMITS.quickExplain;
  const deepExhausted  = guestUsage.deepExplainUsed  >= LIMITS.deepExplain;
  const anyExhausted   = quickExhausted || deepExhausted;

  const rows = [
    {
      icon: Zap,
      label: "Quick Explain",
      used: guestUsage.quickExplainUsed,
      max: LIMITS.quickExplain,
      exhausted: quickExhausted,
      trigger: "quick-explain-limit",
    },
    {
      icon: Brain,
      label: "Deep Explain",
      used: guestUsage.deepExplainUsed,
      max: LIMITS.deepExplain,
      exhausted: deepExhausted,
      trigger: "deep-explain-limit",
    },
  ];

  return (
    <>
      <style>{`
        .rw-usage-widget {
          position: relative;
          font-family: 'DM Sans', sans-serif;
        }
        .rw-usage-pill {
          display: flex; align-items: center; gap: 6px;
          padding: 5px 10px;
          background: var(--rw-card-bg);
          border: 1px solid var(--rw-border);
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 12px;
          color: var(--rw-text-muted);
          white-space: nowrap;
        }
        .rw-usage-pill:hover { border-color: var(--rw-accent); color: var(--rw-text-primary); }
        .rw-usage-pill.exhausted { border-color: var(--rw-danger); color: var(--rw-danger); }
        .rw-usage-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          min-width: 210px;
          background: var(--rw-card-bg);
          border: 1px solid var(--rw-border);
          border-radius: 12px;
          padding: 14px;
          box-shadow: 0 12px 32px rgba(0,0,0,0.25);
          z-index: 1000;
          animation: rw-fade-up 0.15s ease forwards;
        }
        @keyframes rw-fade-up {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .rw-usage-row {
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 10px;
        }
        .rw-usage-row:last-child { margin-bottom: 0; }
        .rw-usage-upgrade-btn {
          width: 100%;
          margin-top: 12px;
          padding: 8px;
          background: color-mix(in srgb, var(--rw-accent) 15%, transparent);
          border: 1px solid var(--rw-accent);
          border-radius: 8px;
          color: var(--rw-accent);
          font-family: inherit;
          font-size: 12px; font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .rw-usage-upgrade-btn:hover { background: var(--rw-accent); color: var(--rw-accent-text); }
      `}</style>

      <div className="rw-usage-widget" onMouseLeave={() => setExpanded(false)}>
        <button
          className={`rw-usage-pill ${anyExhausted ? "exhausted" : ""}`}
          onClick={() => setExpanded((p) => !p)}
          title="View AI usage"
        >
          <Zap size={12} />
          <span>
            {guestUsage.quickExplainUsed}/{LIMITS.quickExplain}
          </span>
          <span style={{ opacity: 0.4 }}>·</span>
          <Brain size={12} />
          <span>
            {guestUsage.deepExplainUsed}/{LIMITS.deepExplain}
          </span>
        </button>

        {expanded && (
          <div className="rw-usage-dropdown">
            <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 600, color: "var(--rw-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              AI Usage
            </p>

            {rows.map(({ icon: Icon, label, used, max, exhausted, trigger }) => (
              <div key={label} className="rw-usage-row">
                <Icon size={13} style={{ color: exhausted ? "var(--rw-danger)" : "var(--rw-accent)", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ fontSize: 12, color: "var(--rw-text-secondary)" }}>{label}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: exhausted ? "var(--rw-danger)" : "var(--rw-text-primary)" }}>
                      {used}/{max}
                    </span>
                  </div>
                  <BlockBar
                    used={used}
                    max={max}
                    color={exhausted ? "var(--rw-danger)" : "var(--rw-accent)"}
                  />
                </div>
              </div>
            ))}

            <div style={{ margin: "10px 0 0", padding: "8px 0 0", borderTop: "1px solid var(--rw-border)" }}>
              <div className="rw-usage-row" style={{ marginBottom: 0 }}>
                <BookOpen size={13} style={{ color: "var(--rw-success, #22c55e)", flexShrink: 0 }} />
                <div style={{ flex: 1, display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "var(--rw-text-secondary)" }}>Dictionary</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--rw-success, #22c55e)" }}>Unlimited</span>
                </div>
              </div>
            </div>

            <button
              className="rw-usage-upgrade-btn"
              onClick={() => { setExpanded(false); openPremiumModal("default"); }}
            >
              ✦ Unlock Unlimited — Free Account
            </button>
          </div>
        )}
      </div>
    </>
  );
}
