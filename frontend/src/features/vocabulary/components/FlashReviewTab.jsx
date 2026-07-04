import React, { useState, useEffect, useRef } from "react";
import { useBreakpoints } from "../../../hooks/useBreakpoints";
import { X, Check } from "lucide-react";

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

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  
  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };
  
  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].screenX;
    handleSwipe();
  };
  
  const handleSwipe = () => {
    if (!flipped) return;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swipe Left -> Harder (Again)
        handleScore("again");
      } else {
        // Swipe Right -> Easier (Good)
        handleScore("good");
      }
    }
  };

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
    transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: isMobileOrSmaller ? "16px" : "32px 0", alignItems: "center" }}>
      <div style={{ width: "100%", maxWidth: 600, display: "flex", justifyContent: "space-between", marginBottom: 16, padding: "0 16px" }}>
        <span style={{ fontSize: 13, color: "var(--rw-page-text-mute)", fontWeight: 600 }}>{currentIndex + 1} / {queue.length}</span>
        <button onClick={onFinish} style={{ background: "transparent", border: "none", color: "var(--rw-page-text-mute)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
          <X size={16} /> Exit
        </button>
      </div>

      <div 
        style={{ width: isMobileOrSmaller ? "95%" : 600, height: isMobileOrSmaller ? 400 : 450, position: "relative", perspective: 1500 }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={() => !flipped && setFlipped(true)}
      >
        {/* Front */}
        <div style={{ ...cardStyle, transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)", cursor: !flipped ? "pointer" : "default" }}>
          <h2 style={{ fontSize: isMobileOrSmaller ? 36 : 56, margin: 0, color: "var(--rw-page-text)", textTransform: "capitalize", textAlign: "center", fontFamily: "'Playfair Display', Georgia, serif" }}>{currentWord.word}</h2>
          {!flipped && <p style={{ position: "absolute", bottom: 24, fontSize: 13, color: "var(--rw-page-text-mute)" }}>Tap or press Space to reveal</p>}
        </div>

        {/* Back */}
        <div style={{ ...cardStyle, transform: flipped ? "rotateY(0deg)" : "rotateY(-180deg)" }}>
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
              { id: "again", label: "Again", time: "<10m", color: "var(--rw-error-text, #ef4444)", num: "1" },
              { id: "hard", label: "Hard", time: "1d", color: "var(--rw-warning-text, #f59e0b)", num: "2" },
              { id: "good", label: "Good", time: "3d", color: "var(--rw-accent)", num: "3" },
              { id: "easy", label: "Easy", time: "7d", color: "var(--rw-success-text, #10b981)", num: "4" }
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
