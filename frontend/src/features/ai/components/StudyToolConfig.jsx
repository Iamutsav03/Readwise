// features/ai/components/StudyToolConfig.jsx
// Configuration panel that slides in when a study tool is selected.
// Allows scope, importance, and feature-specific settings before generating.

import React, { useState } from "react";
import { ClipboardList, Lightbulb, Target, Layers, Sparkles, X } from "lucide-react";

const IMPORTANCE_OPTIONS = [
  {
    id: "high",
    label: "High",
    color: "var(--rw-danger)",
    description: "Definitions, key concepts & exam topics only",
  },
  {
    id: "medium",
    label: "Medium",
    color: "var(--rw-accent)",
    description: "Key ideas + supporting examples",
  },
  {
    id: "low",
    label: "Low",
    color: "var(--rw-success)",
    description: "Everything — concepts, examples & side notes",
  },
];

const SUMMARY_LENGTHS = [
  { id: "quick", label: "Quick Revision", desc: "Bullet points only" },
  { id: "standard", label: "Standard", desc: "Balanced overview" },
  { id: "detailed", label: "Detailed", desc: "Comprehensive coverage" },
];

const DIFFICULTY_OPTIONS = [
  { id: "easy", label: "Easy" },
  { id: "medium", label: "Medium" },
  { id: "hard", label: "Hard" },
  { id: "mixed", label: "Mixed" },
];

const QUESTION_TYPES = [
  { id: "mcq", label: "MCQ" },
  { id: "short", label: "Short Answer" },
  { id: "mixed", label: "Mixed" },
];

const FLASHCARD_STYLES = [
  { id: "exam", label: "Exam Revision" },
  { id: "interview", label: "Interview Prep" },
  { id: "concept", label: "Concept Learning" },
];

const QUESTION_COUNTS = [10, 20, 30];
const CARD_COUNTS = [20, 40, 60];

// ── Reusable pill button ────────────────────────────────────────────────────
function PillOption({ label, desc, isSelected, onClick, color = "var(--rw-accent)" }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: "1 1 auto",
        padding: "4px 8px",
        border: `1px solid ${isSelected ? color : "var(--rw-border)"}`,
        borderRadius: 6,
        background: isSelected ? `rgba(${hexToRgb(color)},0.12)` : "transparent",
        color: isSelected ? color : "rgba(245,238,228,0.6)",
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 11,
        fontWeight: isSelected ? 600 : 400,
        cursor: "pointer",
        transition: "all 0.15s",
        textAlign: "center",
        lineHeight: 1.3,
      }}
    >
      {label}
      {desc && (
        <span style={{ display: "block", fontSize: 9, opacity: 0.6, marginTop: 1 }}>
          {desc}
        </span>
      )}
    </button>
  );
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`
    : "200,164,106";
}

// ── Section label ───────────────────────────────────────────────────────────
function ConfigLabel({ children }) {
  return (
    <p
      style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 9.5,
        fontWeight: 600,
        color: "var(--rw-text-muted)",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        margin: "0 0 5px",
      }}
    >
      {children}
    </p>
  );
}

// ── Page Range Inputs ────────────────────────────────────────────────────────
function PageRangeInput({ fromPage, toPage, numPages, onChange }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6 }}>
      <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(245,238,228,0.5)" }}>
        From
      </label>
      <input
        type="number"
        min={1}
        max={numPages}
        value={fromPage}
        onChange={(e) => onChange("from", Math.max(1, Math.min(numPages, +e.target.value)))}
        style={inputStyle}
      />
      <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(245,238,228,0.5)" }}>
        To
      </label>
      <input
        type="number"
        min={fromPage}
        max={numPages}
        value={toPage}
        onChange={(e) => onChange("to", Math.max(fromPage, Math.min(numPages, +e.target.value)))}
        style={inputStyle}
      />
    </div>
  );
}

const inputStyle = {
  width: 54,
  padding: "4px 8px",
  border: "1px solid var(--rw-border-strong)",
  borderRadius: 5,
  background: "var(--rw-card-bg)",
  color: "var(--rw-text-primary)",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 12,
  textAlign: "center",
  outline: "none",
};

// ── TOOL ICONS ────────────────────────────────────────────────────────────
const TOOL_META = {
  summary: { icon: <ClipboardList size={14} />, label: "Summarize", accent: "#5a8fd4" },
  concepts: { icon: <Lightbulb size={14} />, label: "Key Concepts", accent: "var(--rw-accent)" },
  interview: { icon: <Target size={14} />, label: "Interview Questions", accent: "var(--rw-success)" },
  flashcards: { icon: <Layers size={14} />, label: "Flashcards", accent: "#c49de0" },
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function StudyToolConfig({
  toolId,
  currentPage,
  numPages,
  onGenerate,
  onClose,
  isLoading,
}) {
  const [pageScope, setPageScope] = useState("current");
  const [fromPage, setFromPage] = useState(currentPage);
  const [toPage, setToPage] = useState(Math.min(currentPage + 4, numPages || currentPage));
  const [importance, setImportance] = useState("high");

  // Feature-specific state
  const [summaryLength, setSummaryLength] = useState("standard");
  const [difficulty, setDifficulty] = useState("mixed");
  const [questionType, setQuestionType] = useState("mixed");
  const [questionCount, setQuestionCount] = useState(20);
  const [cardCount, setCardCount] = useState(20);
  const [flashcardStyle, setFlashcardStyle] = useState("exam");

  const meta = TOOL_META[toolId] || { icon: <Sparkles size={14} />, label: "Generate", accent: "var(--rw-accent)" };

  const handlePageRange = (field, val) => {
    if (field === "from") setFromPage(val);
    else setToPage(val);
  };

  const handleGenerate = () => {
    let resolvedFromPage = currentPage;
    let resolvedToPage = currentPage;

    if (pageScope === "range") {
      resolvedFromPage = fromPage;
      resolvedToPage = toPage;
    } else if (pageScope === "all") {
      resolvedFromPage = 1;
      resolvedToPage = numPages;
    } else if (pageScope === "chapter") {
      // Backend handles "chapter" scope heuristic around currentPage
      resolvedFromPage = currentPage;
      resolvedToPage = currentPage;
    }

    onGenerate({
      toolId,
      pageScope,
      fromPage: resolvedFromPage,
      toPage: resolvedToPage,
      importance,
      featureOptions: {
        summaryLength,
        difficulty,
        questionType,
        questionCount,
        cardCount,
        flashcardStyle,
      },
    });
  };

  // ── Estimated Cost / Words Logic ──
  let costBadge = null;
  let wordEstimate = "";
  if (pageScope === "current") {
    costBadge = { label: "🟢 Fast", color: "var(--rw-success)" };
    wordEstimate = "~500 words";
  } else if (pageScope === "chapter") {
    costBadge = { label: "🟡 Medium", color: "var(--rw-accent)" };
    wordEstimate = "~2,000 words";
  } else if (pageScope === "all") {
    costBadge = { label: "🔴 Expensive", color: "var(--rw-danger)" };
    wordEstimate = "~18,000 words";
  } else if (pageScope === "range") {
    const pCount = Math.max(1, toPage - fromPage + 1);
    wordEstimate = `~${pCount * 500} words`;
    if (pCount <= 3) costBadge = { label: "🟢 Fast", color: "var(--rw-success)" };
    else if (pCount <= 10) costBadge = { label: "🟡 Medium", color: "var(--rw-accent)" };
    else costBadge = { label: "🔴 Expensive", color: "var(--rw-danger)" };
  }

  return (
    <div
      style={{
        borderTop: "1px solid var(--rw-hover-bg)",
        padding: "12px 12px 14px",
        background: "var(--rw-panel-bg)",
        animation: "slideDown 0.15s ease",
        flexShrink: 0,
      }}
    >
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Config header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, color: meta.accent }}>
          {meta.icon} Configure {meta.label}
        </span>
        <button
          onClick={onClose}
          style={{
            background: "transparent", border: "none", color: "var(--rw-text-muted)",
            cursor: "pointer", fontSize: 13, padding: "1px 4px", lineHeight: 1,
          }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Scrollable Settings Area */}
      <div
        style={{
          maxHeight: "25vh", // Prevents vertical overflow on small screens
          overflowY: "auto",
          overflowX: "hidden",
          paddingRight: 4,
          marginBottom: 12,
          scrollbarWidth: "thin",
          scrollbarColor: "var(--rw-border) transparent",
        }}
      >
        {/* PAGE SCOPE */}
        <div style={{ marginBottom: 10 }}>
        <ConfigLabel>Pages</ConfigLabel>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          <PillOption
            label={`Current (${currentPage})`}
            isSelected={pageScope === "current"}
            onClick={() => setPageScope("current")}
            color={meta.accent}
          />
          <PillOption
            label="Current Chapter"
            isSelected={pageScope === "chapter"}
            onClick={() => setPageScope("chapter")}
            color={meta.accent}
          />
          <PillOption
            label="Range"
            isSelected={pageScope === "range"}
            onClick={() => setPageScope("range")}
            color={meta.accent}
          />
          <PillOption
            label="Entire PDF"
            isSelected={pageScope === "all"}
            onClick={() => setPageScope("all")}
            color={meta.accent}
          />
        </div>

        {/* Cost & Words indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
          {costBadge && (
            <span style={{ fontSize: 10, fontFamily: "'DM Sans', sans-serif", color: costBadge.color, fontWeight: 600 }}>
              {costBadge.label}
            </span>
          )}
          <span style={{ fontSize: 10, fontFamily: "'DM Sans', sans-serif", color: "var(--rw-text-muted)" }}>
            Context: {wordEstimate}
          </span>
        </div>

        {pageScope === "all" && numPages > 50 && (
          <div style={{ marginTop: 8, padding: "6px 8px", background: "rgba(224,112,96,0.1)", border: "1px solid rgba(224,112,96,0.2)", borderRadius: 6 }}>
            <span style={{ fontSize: 10, fontFamily: "'DM Sans', sans-serif", color: "var(--rw-danger)" }}>
              <strong>Note:</strong> Generating from a {numPages}-page PDF uses significantly more AI resources. Consider using Current Chapter or a Custom Range for better precision.
            </span>
          </div>
        )}

        {pageScope === "range" && (
          <PageRangeInput
            fromPage={fromPage}
            toPage={toPage}
            numPages={numPages}
            onChange={handlePageRange}
          />
        )}
      </div>

      {/* IMPORTANCE */}
      <div style={{ marginBottom: 10 }}>
        <ConfigLabel>Importance</ConfigLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {IMPORTANCE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setImportance(opt.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "5px 8px",
                border: `1px solid ${importance === opt.id ? opt.color : "rgba(255,255,255,0.07)"}`,
                borderRadius: 6,
                background: importance === opt.id ? `rgba(${hexToRgb(opt.color)},0.1)` : "transparent",
                cursor: "pointer",
                transition: "all 0.12s",
                textAlign: "left",
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: opt.color, flexShrink: 0 }} />
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: importance === opt.id ? opt.color : "rgba(245,238,228,0.65)", fontWeight: importance === opt.id ? 600 : 400 }}>
                {opt.label} — <span style={{ opacity: 0.7, fontWeight: 400, fontSize: 10 }}>{opt.description}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* FEATURE-SPECIFIC SETTINGS */}
      {toolId === "summary" && (
        <div style={{ marginBottom: 10 }}>
          <ConfigLabel>Summary Length</ConfigLabel>
          <div style={{ display: "flex", gap: 5 }}>
            {SUMMARY_LENGTHS.map((opt) => (
              <PillOption
                key={opt.id}
                label={opt.label}
                desc={opt.desc}
                isSelected={summaryLength === opt.id}
                onClick={() => setSummaryLength(opt.id)}
                color={meta.accent}
              />
            ))}
          </div>
        </div>
      )}

      {toolId === "interview" && (
        <>
          <div style={{ marginBottom: 10 }}>
            <ConfigLabel>Question Type</ConfigLabel>
            <div style={{ display: "flex", gap: 5 }}>
              {QUESTION_TYPES.map((opt) => (
                <PillOption
                  key={opt.id}
                  label={opt.label}
                  isSelected={questionType === opt.id}
                  onClick={() => setQuestionType(opt.id)}
                  color={meta.accent}
                />
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <ConfigLabel>Difficulty</ConfigLabel>
            <div style={{ display: "flex", gap: 5 }}>
              {DIFFICULTY_OPTIONS.map((opt) => (
                <PillOption
                  key={opt.id}
                  label={opt.label}
                  isSelected={difficulty === opt.id}
                  onClick={() => setDifficulty(opt.id)}
                  color={meta.accent}
                />
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <ConfigLabel>Question Count</ConfigLabel>
            <div style={{ display: "flex", gap: 5 }}>
              {QUESTION_COUNTS.map((n) => (
                <PillOption
                  key={n}
                  label={`${n}`}
                  isSelected={questionCount === n}
                  onClick={() => setQuestionCount(n)}
                  color={meta.accent}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {toolId === "flashcards" && (
        <>
          <div style={{ marginBottom: 10 }}>
            <ConfigLabel>Flashcard Style</ConfigLabel>
            <div style={{ display: "flex", gap: 5 }}>
              {FLASHCARD_STYLES.map((opt) => (
                <PillOption
                  key={opt.id}
                  label={opt.label}
                  isSelected={flashcardStyle === opt.id}
                  onClick={() => setFlashcardStyle(opt.id)}
                  color={meta.accent}
                />
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <ConfigLabel>Card Count</ConfigLabel>
            <div style={{ display: "flex", gap: 5 }}>
              {CARD_COUNTS.map((n) => (
                <PillOption
                  key={n}
                  label={`${n} cards`}
                  isSelected={cardCount === n}
                  onClick={() => setCardCount(n)}
                  color={meta.accent}
                />
              ))}
            </div>
          </div>
        </>
      )}

      </div>

      {/* GENERATE BUTTON */}
      <button
        onClick={handleGenerate}
        disabled={isLoading}
        style={{
          width: "100%",
          padding: "8px 0",
          background: isLoading
            ? "var(--rw-hover-bg)"
            : `linear-gradient(135deg, ${meta.accent}, ${meta.accent}cc)`,
          border: "none",
          borderRadius: 8,
          color: isLoading ? "rgba(255,255,255,0.3)" : "var(--rw-panel-bg)",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 12,
          fontWeight: 700,
          cursor: isLoading ? "not-allowed" : "pointer",
          transition: "all 0.2s",
          letterSpacing: "0.02em",
        }}
      >
        {isLoading ? "Generating…" : `Generate ${meta.label}`}
      </button>
    </div>
  );
}
