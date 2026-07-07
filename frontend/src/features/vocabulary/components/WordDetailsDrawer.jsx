import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { useBreakpoints } from "../../../hooks/useBreakpoints";
import BottomSheet from "../../../components/ui/BottomSheet";
import { useFocusTrap } from "../../../hooks/useFocusTrap";
import { X, ExternalLink, Zap, Trash2, Calendar, BookOpen, Clock } from "lucide-react";

export default function WordDetailsDrawer({ word, onClose, onRemove, onJumpToSource }) {
  const { isMobileOrSmaller } = useBreakpoints();

  const drawerRef = React.useRef(null);
  
  useFocusTrap(true, drawerRef, onClose);

  useEffect(() => {
    const onEsc = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  const content = (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: isMobileOrSmaller ? "20px 16px" : "32px", display: "flex", flexDirection: "column", gap: 24 }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <h2 style={{ margin: "0 0 8px 0", fontSize: 28, color: "var(--rw-page-text)", textTransform: "capitalize", fontFamily: "'Playfair Display', Georgia, serif" }}>{word.word}</h2>
            {!isMobileOrSmaller && (
              <button onClick={onClose} style={{ background: "var(--rw-page-card-bg)", border: "1px solid var(--rw-page-border)", borderRadius: "50%", color: "var(--rw-page-text-sec)", cursor: "pointer", padding: 6, display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }} onMouseOver={e => e.currentTarget.style.background = "var(--rw-page-hover-bg)"} onMouseOut={e => e.currentTarget.style.background = "var(--rw-page-card-bg)"}>
                <X size={18} />
              </button>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 11, padding: "4px 8px", background: "var(--rw-page-accent-muted)", color: "var(--rw-accent)", borderRadius: 4, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              {word.sourceType === "dictionary" ? <BookOpen size={12} /> : <Zap size={12} />}
              {word.sourceType === "dictionary" ? "Dictionary" : "Quick Meaning"}
            </span>
            <span style={{ fontSize: 12, color: "var(--rw-page-text-sec)", display: "flex", alignItems: "center", gap: 4 }}>
              <Calendar size={12} /> {new Date(word.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "1px", color: "var(--rw-page-text-mute)", margin: "0 0 12px 0", borderBottom: "1px solid var(--rw-page-border)", paddingBottom: 8 }}>Meaning</h3>
          <p style={{ margin: 0, fontSize: 16, color: "var(--rw-page-text)", lineHeight: 1.6 }}>{word.meaning}</p>
        </div>

        <div style={{ background: "var(--rw-page-card-bg)", padding: 20, borderRadius: 12, border: "1px solid var(--rw-page-border)" }}>
          <h3 style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "1px", color: "var(--rw-page-text-mute)", margin: "0 0 12px 0" }}>Source Document</h3>
          <p style={{ margin: "0 0 4px 0", fontSize: 15, color: "var(--rw-page-text)", fontWeight: 500 }}>{word.pdfTitle}</p>
          <p style={{ margin: 0, fontSize: 13, color: "var(--rw-page-text-sec)" }}>Page {word.pageNumber || "?"}</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ background: "var(--rw-page-card-bg)", padding: 20, borderRadius: 12, border: "1px solid var(--rw-page-border)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ color: "var(--rw-page-text-mute)", marginBottom: 8 }}><BookOpen size={20} /></div>
            <div style={{ fontSize: 24, fontWeight: 600, color: "var(--rw-page-text)" }}>{word.reviewCount || 0}</div>
            <div style={{ fontSize: 12, color: "var(--rw-page-text-sec)", textTransform: "uppercase", letterSpacing: "0.5px", marginTop: 4 }}>Total Reviews</div>
          </div>
          <div style={{ background: "var(--rw-page-card-bg)", padding: 20, borderRadius: 12, border: "1px solid var(--rw-page-border)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ color: "var(--rw-page-text-mute)", marginBottom: 8 }}><Clock size={20} /></div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--rw-page-text)", marginTop: 4, marginBottom: 2 }}>
              {word.nextReviewDate ? new Date(word.nextReviewDate).toLocaleDateString() : "Pending"}
            </div>
            <div style={{ fontSize: 12, color: "var(--rw-page-text-sec)", textTransform: "uppercase", letterSpacing: "0.5px", marginTop: 4 }}>Next Review</div>
          </div>
        </div>
      </div>

      {/* Sticky Footer */}
      <div style={{ padding: isMobileOrSmaller ? "16px" : "24px 32px", borderTop: "1px solid var(--rw-page-border)", background: "var(--rw-page-card-bg)", display: "flex", flexDirection: "column", gap: 12, zIndex: 10 }}>
        <button
          onClick={onJumpToSource}
          style={{ width: "100%", padding: "14px", background: "var(--rw-accent)", color: "var(--rw-accent-text)", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", transition: "filter 0.2s" }}
          onMouseOver={e => e.currentTarget.style.filter = "brightness(1.1)"}
          onMouseOut={e => e.currentTarget.style.filter = "brightness(1)"}
        >
          <ExternalLink size={18} /> Jump To Source
        </button>
        <button
          onClick={onRemove}
          style={{ width: "100%", padding: "14px", background: "transparent", color: "var(--rw-page-text-sec)", border: "1px solid var(--rw-page-border)", borderRadius: 8, fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", transition: "all 0.2s" }}
          onMouseOver={e => { e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.borderColor = "#ef4444"; e.currentTarget.style.background = "var(--rw-page-hover-bg)"; }}
          onMouseOut={e => { e.currentTarget.style.color = "var(--rw-page-text-sec)"; e.currentTarget.style.borderColor = "var(--rw-page-border)"; e.currentTarget.style.background = "transparent"; }}
        >
          <Trash2 size={16} /> Delete Word
        </button>
      </div>
    </div>
  );

  if (isMobileOrSmaller) {
    return (
      <BottomSheet isOpen={true} onClose={onClose} title="Word Details">
        {content}
      </BottomSheet>
    );
  }

  // Desktop Right Drawer
  const drawer = (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: "flex", justifyContent: "flex-end", pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "var(--rw-overlay, rgba(0,0,0,0.5))", pointerEvents: "all", backdropFilter: "blur(2px)" }} onClick={onClose} />
      <div 
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Word Details"
        style={{ width: Math.min(400, window.innerWidth), background: "var(--rw-app-bg)", height: "100%", borderLeft: "1px solid var(--rw-page-border)", boxShadow: "-4px 0 24px rgba(0,0,0,0.12)", pointerEvents: "all", display: "flex", flexDirection: "column", animation: "slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        {content}
      </div>
      <style>{`
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>
    </div>
  );

  return createPortal(drawer, document.body);
}
