import React, { useState, useMemo } from "react";
import { useBreakpoints } from "../../../hooks/useBreakpoints";
import WordDetailsDrawer from "./WordDetailsDrawer";
import { Search, Filter, BookOpen, Zap } from "lucide-react";
import { Virtuoso } from "react-virtuoso";

export default function SavedWordsTab({ vocabulary, isLoading, onRemove, onJumpToSource }) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all"); // all, dictionary, quick_meaning
  const [selectedWord, setSelectedWord] = useState(null);
  const { isMobileOrSmaller } = useBreakpoints();

  // Helper to get SRS status
  const getSrsStatus = (word) => {
    if (!word.reviewCount) return { label: "New", color: "var(--rw-accent, #3b82f6)", bg: "var(--rw-accent-muted, rgba(59, 130, 246, 0.1))" };
    if (word.reviewCount < 3) return { label: "Learning", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)" };
    if (word.difficulty === "hard") return { label: "Difficult", color: "var(--rw-error-text, #ef4444)", bg: "var(--rw-error-bg, rgba(239, 68, 68, 0.1))" };
    return { label: "Mastered", color: "#10b981", bg: "rgba(16, 185, 129, 0.1)" };
  };

  const getStreak = (word) => word.streak || 0;

  const filtered = useMemo(() => {
    let list = vocabulary;
    if (filterType !== "all") {
      list = list.filter(w => w.sourceType === filterType);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(w => 
        w.word.toLowerCase().includes(q) || 
        w.meaning.toLowerCase().includes(q) ||
        (w.pdfTitle && w.pdfTitle.toLowerCase().includes(q))
      );
    }
    return list;
  }, [vocabulary, search, filterType]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: isMobileOrSmaller ? "8px 8px 0" : "12px 20px 0" }}>
      {/* Controls */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap", position: "sticky", top: 0, zIndex: 10, background: "var(--rw-app-bg)", paddingBottom: 8 }}>
        <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
          <Search size={16} style={{ position: "absolute", left: 12, top: 12, color: "var(--rw-page-text-mute)" }} />
          <input
            type="text"
            placeholder="Search words, meanings, or PDFs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "10px 10px 10px 36px",
              background: "var(--rw-page-card-bg)", border: "1px solid var(--rw-page-border)",
              borderRadius: 8, color: "var(--rw-page-text)", fontFamily: "inherit"
            }}
          />
        </div>
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          style={{
            padding: "10px 16px", background: "var(--rw-page-card-bg)", border: "1px solid var(--rw-page-border)",
            borderRadius: 8, color: "var(--rw-page-text)", fontFamily: "inherit", cursor: "pointer"
          }}
        >
          <option value="all">All Sources</option>
          <option value="dictionary">Dictionary</option>
          <option value="quick_meaning">Quick Meaning</option>
        </select>
      </div>

      {/* Grid */}
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", marginTop: 0 }}>
        {isLoading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--rw-page-text-mute)" }}>Loading vocabulary...</div>
        ) : vocabulary.length === 0 ? (
          <div style={{ padding: isMobileOrSmaller ? "12px 8px" : "20px 12px", maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
            <h2 style={{ fontSize: isMobileOrSmaller ? 20 : 24, fontFamily: "'Playfair Display', Georgia, serif", color: "var(--rw-page-text)", marginBottom: 24 }}>How Vocabulary Vault Works</h2>
            
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: "var(--rw-page-text-mute)", fontSize: 13, textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600, marginBottom: 32, flexWrap: "wrap" }}>
              <span>Select Text</span> <span>→</span>
              <span>Dictionary / Quick Explain</span> <span>→</span>
              <span>Save Word</span> <span>→</span>
              <span>Review Queue</span> <span>→</span>
              <span style={{ color: "var(--rw-accent)" }}>Long-Term Memory</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16, textAlign: "left", background: "var(--rw-page-card-bg)", padding: isMobileOrSmaller ? 20 : 32, borderRadius: 16, border: "1px solid var(--rw-page-border)" }}>
              <div style={{ display: "flex", gap: isMobileOrSmaller ? 12 : 16, alignItems: "flex-start" }}><span style={{ fontSize: isMobileOrSmaller ? 18 : 20 }}>📖</span><span style={{ color: "var(--rw-page-text-sec)", lineHeight: 1.5, fontSize: isMobileOrSmaller ? 14 : 16 }}>Save difficult words while reading</span></div>
              <div style={{ display: "flex", gap: isMobileOrSmaller ? 12 : 16, alignItems: "flex-start" }}><span style={{ fontSize: isMobileOrSmaller ? 18 : 20 }}>💡</span><span style={{ color: "var(--rw-page-text-sec)", lineHeight: 1.5, fontSize: isMobileOrSmaller ? 14 : 16 }}>Save Quick Explain responses</span></div>
              <div style={{ display: "flex", gap: isMobileOrSmaller ? 12 : 16, alignItems: "flex-start" }}><span style={{ fontSize: isMobileOrSmaller ? 18 : 20 }}>📚</span><span style={{ color: "var(--rw-page-text-sec)", lineHeight: 1.5, fontSize: isMobileOrSmaller ? 14 : 16 }}>Review them using flashcards</span></div>
              <div style={{ display: "flex", gap: isMobileOrSmaller ? 12 : 16, alignItems: "flex-start" }}><span style={{ fontSize: isMobileOrSmaller ? 18 : 20 }}>🔁</span><span style={{ color: "var(--rw-page-text-sec)", lineHeight: 1.5, fontSize: isMobileOrSmaller ? 14 : 16 }}>Build long-term memory through spaced repetition</span></div>
              <div style={{ display: "flex", gap: isMobileOrSmaller ? 12 : 16, alignItems: "flex-start" }}><span style={{ fontSize: isMobileOrSmaller ? 18 : 20 }}>📈</span><span style={{ color: "var(--rw-page-text-sec)", lineHeight: 1.5, fontSize: isMobileOrSmaller ? 14 : 16 }}>Track progress through insights</span></div>
            </div>
            
            <button 
              onClick={() => {
                if (window.history.state && window.history.state.view === "vocabulary") {
                  window.history.back();
                } else {
                  window.location.href = "/";
                }
              }} 
              style={{ marginTop: 32, padding: "14px 28px", background: "var(--rw-accent)", color: "var(--rw-accent-text)", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", transition: "transform 0.2s" }}
              onMouseOver={e => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}
            >
              Open a PDF and save your first word
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--rw-page-text-mute)" }}>No words found matching your search.</div>
        ) : (
          <Virtuoso
            data={filtered}
            useWindowScroll={false}
            components={{
              List: React.forwardRef(({ style, children, ...props }, ref) => (
                <div
                  ref={ref}
                  {...props}
                  style={{
                    ...style,
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: "16px",
                    padding: "4px"
                  }}
                >
                  {children}
                </div>
              )),
              Item: ({ children, ...props }) => <div {...props} style={{ margin: 0 }}>{children}</div>
            }}
            itemContent={(index, word) => {
              const status = getSrsStatus(word);
              const streak = getStreak(word);
              
              return (
              <div
                onClick={() => setSelectedWord(word)}
                style={{
                  background: "var(--rw-page-card-bg)",
                  border: "1px solid var(--rw-page-border)",
                  borderRadius: "16px",
                  padding: "20px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
                  height: "100%",
                  position: "relative",
                  overflow: "hidden"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.08)";
                  e.currentTarget.style.borderColor = "var(--rw-border-strong)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
                  e.currentTarget.style.borderColor = "var(--rw-page-border)";
                }}
              >
                {/* SRS Status Badge */}
                <div style={{ position: "absolute", top: 0, right: 0, padding: "4px 12px", background: status.bg, color: status.color, borderBottomLeftRadius: 12, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>
                  {status.label}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: "1.2rem", color: "var(--rw-page-text)", fontFamily: "'Playfair Display', Georgia, serif" }}>{word.word}</span>
                </div>
                
                <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--rw-page-text-sec)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.5 }}>
                  {word.meaning}
                </p>
                
                <div style={{ marginTop: "auto", paddingTop: "12px", borderTop: "1px dashed var(--rw-page-border)", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem", color: "var(--rw-page-text-mute)" }}>
                    <BookOpen size={12} />
                    <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "60%", fontWeight: 500 }}>{word.pdfTitle}</span>
                    <span style={{ marginLeft: "auto" }}>Pg {word.pageNumber || "?"}</span>
                  </div>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem", color: "var(--rw-page-text-mute)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ color: streak > 2 ? "#f59e0b" : "inherit" }}>🔥 {streak}</span>
                      <span>Streak</span>
                    </div>
                    {word.nextReviewDate ? (
                      <span style={{ color: "var(--rw-accent)", fontWeight: 500 }}>Due: {new Date(word.nextReviewDate).toLocaleDateString()}</span>
                    ) : (
                      <span>Saved: {new Date(word.createdAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>
            )}}
          />
        )}
      </div>

      {/* Details Drawer */}
      {selectedWord && (
        <WordDetailsDrawer
          word={selectedWord}
          onClose={() => setSelectedWord(null)}
          onRemove={() => { onRemove(selectedWord._id); setSelectedWord(null); }}
          onJumpToSource={() => onJumpToSource(selectedWord.pdfId, selectedWord.pageNumber)}
        />
      )}
    </div>
  );
}
