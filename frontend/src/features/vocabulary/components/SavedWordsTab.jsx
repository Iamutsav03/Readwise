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
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: isMobileOrSmaller ? 12 : 32 }}>
      {/* Controls */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap", position: "sticky", top: 0, zIndex: 10 }}>
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
      <div style={{ flex: 1, overflow: "hidden", marginTop: "16px" }}>
        {isLoading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--rw-page-text-mute)" }}>Loading vocabulary...</div>
        ) : vocabulary.length === 0 ? (
          <div style={{ padding: "40px 20px", maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
            <h2 style={{ fontSize: 24, fontFamily: "'Playfair Display', Georgia, serif", color: "var(--rw-page-text)", marginBottom: 24 }}>How Vocabulary Vault Works</h2>
            
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: "var(--rw-page-text-mute)", fontSize: 13, textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600, marginBottom: 32, flexWrap: "wrap" }}>
              <span>Select Text</span> <span>→</span>
              <span>Dictionary / Quick Explain</span> <span>→</span>
              <span>Save Word</span> <span>→</span>
              <span>Review Queue</span> <span>→</span>
              <span style={{ color: "var(--rw-accent)" }}>Long-Term Memory</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16, textAlign: "left", background: "var(--rw-panel-bg)", padding: 32, borderRadius: 16, border: "1px solid var(--rw-page-border)" }}>
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}><span style={{ fontSize: 20 }}>📖</span><span style={{ color: "var(--rw-page-text-sec)", lineHeight: 1.5 }}>Save difficult words while reading</span></div>
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}><span style={{ fontSize: 20 }}>💡</span><span style={{ color: "var(--rw-page-text-sec)", lineHeight: 1.5 }}>Save Quick Explain responses</span></div>
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}><span style={{ fontSize: 20 }}>📚</span><span style={{ color: "var(--rw-page-text-sec)", lineHeight: 1.5 }}>Review them using flashcards</span></div>
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}><span style={{ fontSize: 20 }}>🔁</span><span style={{ color: "var(--rw-page-text-sec)", lineHeight: 1.5 }}>Build long-term memory through spaced repetition</span></div>
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}><span style={{ fontSize: 20 }}>📈</span><span style={{ color: "var(--rw-page-text-sec)", lineHeight: 1.5 }}>Track progress through insights</span></div>
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
            itemContent={(index, word) => (
              <div
                onClick={() => setSelectedWord(word)}
                style={{
                  background: "var(--rw-page-card-bg)",
                  border: "1px solid var(--rw-page-border)",
                  borderRadius: "12px",
                  padding: "20px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
                  height: "100%",
                  position: "relative"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.08)";
                  e.currentTarget.style.borderColor = "var(--rw-border-strong)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
                  e.currentTarget.style.borderColor = "var(--rw-page-border)";
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <span style={{ fontWeight: 600, fontSize: "1.1rem", color: "var(--rw-page-text)", fontFamily: "'Playfair Display', Georgia, serif" }}>{word.word}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.5px", padding: "4px 6px", background: "var(--rw-panel-bg)", border: "1px solid var(--rw-page-border)", borderRadius: "4px", color: "var(--rw-page-text-sec)" }}>
                    {word.sourceType === "dictionary" ? <BookOpen size={10} /> : <Zap size={10} />}
                    {word.sourceType === "dictionary" ? "Dict" : "Quick"}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--rw-page-text-sec)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.5 }}>
                  {word.meaning}
                </p>
                <div style={{ marginTop: "auto", paddingTop: "12px", borderTop: "1px solid var(--rw-page-border)", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--rw-page-text-mute)", display: "flex", justifyContent: "space-between" }}>
                    <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "60%" }}>{word.pdfTitle}</span>
                    <span>Pg {word.pageNumber || "?"}</span>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--rw-page-text-mute)", display: "flex", justifyContent: "space-between" }}>
                    <span>Saved: {new Date(word.createdAt).toLocaleDateString()}</span>
                    {word.nextReviewDate && (
                      <span style={{ color: "var(--rw-accent)" }}>Review: {new Date(word.nextReviewDate).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>
            )}
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
