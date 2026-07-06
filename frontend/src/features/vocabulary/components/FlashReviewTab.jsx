import React, { useState, useEffect, useRef } from "react";
import { useBreakpoints } from "../../../hooks/useBreakpoints";
import { X, Check } from "lucide-react";
import { useDrag } from "@use-gesture/react";

export default function FlashReviewTab({ vocabulary, onReview, onFinish }) {
  const { isMobileOrSmaller } = useBreakpoints();
  const [flipped, setFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Initialize queue once when component mounts
  const [queue] = useState(() => {
    const now = new Date();
    return vocabulary.filter(w => !w.nextReviewDate || new Date(w.nextReviewDate) <= now);
  });

  const currentWord = queue[currentIndex];

  const handleScore = async (score) => {
    if (!currentWord) return;
    try {
      await onReview(currentWord._id, score);
    } catch (err) {}
    setFlipped(false);
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onFinish();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!currentWord) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped(true);
      }
      if (flipped) {
        if (e.key === "1") handleScore("again");
        if (e.key === "2") handleScore("hard");
        if (e.key === "3") handleScore("good");
        if (e.key === "4") handleScore("easy");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentWord, flipped, queue.length, currentIndex]);

  const containerRef = useRef(null);

  const [dragProps, setDragProps] = useState({ x: 0, rot: 0, scale: 1 });
  const [feedbackColor, setFeedbackColor] = useState("transparent");

  const bind = useDrag(({ down, movement: [mx], direction: [xDir], velocity: [vx] }) => {
    if (!flipped) return;

    const trigger = vx > 0.2 || Math.abs(mx) > 100; // threshold
    const dir = xDir < 0 ? -1 : 1; // -1 = left (Hard/Again), 1 = right (Good)

    if (!down && trigger) {
      if (dir === -1) {
        setFeedbackColor("var(--rw-danger, rgba(239, 68, 68, 0.2))");
        setTimeout(() => setFeedbackColor("transparent"), 200);
        handleScore("again");
      } else {
        setFeedbackColor("var(--rw-success, rgba(16, 185, 129, 0.2))");
        setTimeout(() => setFeedbackColor("transparent"), 200);
        handleScore("good");
      }
      setDragProps({ x: 0, rot: 0, scale: 1 });
    } else if (!down) {
      setDragProps({ x: 0, rot: 0, scale: 1 });
    } else {
      setDragProps({ x: mx, rot: mx / 10, scale: 1.05 });
    }
  });

  if (!currentWord) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: 32 }}>
        <div style={{ width: 64, height: 64, background: "var(--rw-accent-muted)", color: "var(--rw-accent)", borderRadius: 32, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
          <Check size={32} />
        </div>
        <h2 style={{ margin: "0 0 8px 0", color: "var(--rw-page-text)", fontFamily: "'Playfair Display', Georgia, serif" }}>Session Complete</h2>
        <p style={{ margin: "0 0 24px 0", color: "var(--rw-page-text-sec)" }}>You've reviewed all scheduled words.</p>
        <button onClick={onFinish} style={{ padding: "12px 24px", background: "var(--rw-page-card-bg)", border: "1px solid var(--rw-border-strong)", borderRadius: 8, color: "var(--rw-page-text)", fontWeight: 600, cursor: "pointer" }}>Back to Queue</button>
      </div>
    );
  }

  const cardStyle = {
    position: "absolute", width: "100%", height: "100%", backfaceVisibility: "hidden",
    borderRadius: 16, background: "var(--rw-page-card-bg)", border: "1px solid var(--rw-border-strong)",
    boxShadow: "0 12px 48px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", padding: isMobileOrSmaller ? 24 : 48,
    transition: "transform var(--anim-flip, 300ms) cubic-bezier(0.4, 0, 0.2, 1)"
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: isMobileOrSmaller ? "8px 8px 0" : "12px 0 0", alignItems: "center" }}>
      <div style={{ width: "100%", maxWidth: 600, display: "flex", justifyContent: "space-between", marginBottom: 16, padding: "0 16px" }}>
        <span style={{ fontSize: 13, color: "var(--rw-page-text-mute)", fontWeight: 600 }}>{currentIndex + 1} / {queue.length}</span>
        <button onClick={onFinish} style={{ background: "transparent", border: "none", color: "var(--rw-page-text-mute)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
          <X size={16} /> Exit
        </button>
      </div>

      <div 
        ref={containerRef}
        {...bind()}
        style={{ 
          width: isMobileOrSmaller ? "100%" : 600, maxWidth: 600, height: isMobileOrSmaller ? 400 : 450, 
          position: "relative", perspective: 1500, touchAction: "none",
          transform: `translate3d(${dragProps.x}px, 0, 0) rotateZ(${dragProps.rot}deg) scale(${dragProps.scale})`,
          transition: dragProps.x === 0 ? "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)" : "none",
          zIndex: 10
        }}
        onClick={() => !flipped && setFlipped(true)}
      >
        {/* Front */}
        <div style={{ ...cardStyle, transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)", cursor: !flipped ? "pointer" : "grab" }}>
          <h2 style={{ fontSize: isMobileOrSmaller ? 36 : 56, margin: 0, color: "var(--rw-page-text)", textTransform: "capitalize", textAlign: "center", fontFamily: "'Playfair Display', Georgia, serif" }}>{currentWord.word}</h2>
          {!flipped && <p style={{ position: "absolute", bottom: 24, fontSize: 13, color: "var(--rw-page-text-mute)" }}>Tap or press Space to reveal</p>}
        </div>

        {/* Back */}
        <div style={{ ...cardStyle, transform: flipped ? "rotateY(0deg)" : "rotateY(-180deg)", cursor: "grab" }}>
          {/* Feedback Overlay */}
          <div style={{ position: "absolute", inset: 0, background: feedbackColor, borderRadius: 16, transition: "background 0.2s", pointerEvents: "none" }} />
          
          <p style={{ fontSize: isMobileOrSmaller ? 18 : 22, color: "var(--rw-page-text)", lineHeight: 1.6, textAlign: "center", margin: "0 0 32px 0" }}>{currentWord.meaning}</p>
          <div style={{ padding: 12, background: "var(--rw-panel-bg)", border: "1px solid var(--rw-page-border)", borderRadius: 8, width: "100%", textAlign: "center" }}>
            <span style={{ fontSize: 12, color: "var(--rw-page-text-mute)", textTransform: "uppercase", letterSpacing: "1px" }}>Source</span>
            <p style={{ margin: "4px 0 0 0", fontSize: 14, color: "var(--rw-page-text-sec)", fontWeight: 500 }}>{currentWord.pdfTitle}</p>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 40, width: isMobileOrSmaller ? "95%" : 600 }}>
        {!flipped ? (
          <button
            onClick={() => setFlipped(true)}
            style={{ width: "100%", minHeight: 48, background: "var(--rw-accent)", border: "none", borderRadius: 12, color: "var(--rw-accent-text)", fontSize: 16, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
          >
            Show Answer
          </button>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
            {[
              { id: "again", label: "Again", time: "<10m", color: "var(--rw-danger)", num: "1" },
              { id: "hard", label: "Hard", time: "1d", color: "var(--rw-warning)", num: "2" },
              { id: "good", label: "Good", time: "3d", color: "var(--rw-accent)", num: "3" },
              { id: "easy", label: "Easy", time: "7d", color: "var(--rw-success)", num: "4" }
            ].map(btn => (
              <button
                key={btn.id}
                onClick={() => handleScore(btn.id)}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  background: "var(--rw-page-card-bg)", border: `1px solid var(--rw-border-strong)`, borderRadius: 12,
                  minHeight: 56, cursor: "pointer", transition: "transform 0.1s"
                }}
                onMouseEnter={e => e.currentTarget.style.border = `1px solid ${btn.color}`}
                onMouseLeave={e => e.currentTarget.style.border = `1px solid var(--rw-border-strong)`}
              >
                <span style={{ fontSize: 14, fontWeight: 700, color: btn.color }}>{btn.label}</span>
                <span style={{ fontSize: 11, color: "var(--rw-page-text-mute)" }}>{btn.time}</span>
                {!isMobileOrSmaller && <span style={{ position: "absolute", top: 4, right: 6, fontSize: 10, color: "var(--rw-page-text-mute)", background: "var(--rw-panel-bg)", padding: "2px 6px", borderRadius: 4 }}>{btn.num}</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
