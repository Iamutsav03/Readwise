// features/ai/components/AiPanel.jsx
// Main AI Chat panel shown in the reader sidebar.
// Layout: Header → Scrollable chat history → Suggested prompts (if empty) → Fixed input

import React, { useRef, useEffect, useState, useCallback } from "react";
import useAiChat from "../hooks/useAiChat";
import ChatMessage from "./ChatMessage";
import StudyToolsSection from "./StudyToolsSection";
import StudyToolConfig from "./StudyToolConfig";

// ── Loading dots animation ────────────────────────────────────────────────────
function ThinkingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
      {/* AI avatar */}
      <div
        style={{
          width: 26, height: 26, borderRadius: "50%",
          background: "linear-gradient(135deg, #2a221d, #3a2e24)",
          border: "1px solid rgba(200,164,106,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, fontSize: 12, color: "#C8A46A",
        }}
      >
        ◈
      </div>
      <div
        style={{
          background: "#241D19",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "4px 16px 16px 16px",
          padding: "10px 16px",
          display: "flex", gap: 5, alignItems: "center",
        }}
      >
        <style>{`
          @keyframes ai-dot-bounce {
            0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
            40% { transform: translateY(-5px); opacity: 1; }
          }
          .ai-dot {
            width: 6px; height: 6px; border-radius: 50%;
            background: #C8A46A;
            animation: ai-dot-bounce 1.2s ease-in-out infinite;
          }
          .ai-dot:nth-child(2) { animation-delay: 0.15s; }
          .ai-dot:nth-child(3) { animation-delay: 0.3s; }
        `}</style>
        <div className="ai-dot" />
        <div className="ai-dot" />
        <div className="ai-dot" />
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div
      style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", flex: 1, gap: 10, padding: "24px 16px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 44, height: 44, borderRadius: "50%",
          background: "linear-gradient(135deg, #241D19, #3a2e24)",
          border: "1px solid rgba(200,164,106,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, color: "#C8A46A",
        }}
      >
        ◈
      </div>
      <div>
        <p style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
          color: "#F5EEE4", margin: "0 0 4px",
        }}>
          Chat with this document
        </p>
        <p style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: 11.5,
          color: "rgba(245,238,228,0.5)", margin: 0, lineHeight: 1.5,
        }}>
          Ask questions, get summaries,<br />or generate study materials.
        </p>
      </div>
    </div>
  );
}

// ── Main Panel ────────────────────────────────────────────────────────────────
export default function AiPanel({ pdfId, pageNumber = 1, numPages = 100, mobileMode = false }) {
  const { messages, isLoading, isRetrying, isHistoryLoading, error, sendMessage, clearHistory, explainSelection, retryMessage } =
    useAiChat(pdfId);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [activeTool, setActiveTool] = useState(null);

  // Auto-scroll to bottom whenever new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isRetrying]);

  // Listen for text selection explanations triggered from the reader
  useEffect(() => {
    const handleExplain = (e) => {
      const { text, pageNumber } = e.detail;
      explainSelection(text, pageNumber);
    };

    window.addEventListener("ai:explain", handleExplain);
    return () => window.removeEventListener("ai:explain", handleExplain);
  }, [explainSelection]);

  const handleSend = useCallback(
    (text, featureType = "chat", options = {}) => {
      const msg = (text ?? input).trim();
      if (!msg || isLoading) return;
      setInput("");
      sendMessage(msg, featureType, options);
    },
    [input, isLoading, sendMessage]
  );

  const handleGenerateStudyTool = useCallback((config) => {
    const { toolId, pageScope, fromPage, toPage } = config;
    let msg = `Please generate ${toolId}`;
    if (pageScope === "current") msg += ` for page ${fromPage}.`;
    else if (pageScope === "range") msg += ` for pages ${fromPage}-${toPage}.`;
    else if (pageScope === "chapter") msg += ` for the current chapter (around page ${fromPage}).`;
    else msg += ` for the entire document.`;

    handleSend(msg, toolId, config);
    setActiveTool(null);
  }, [handleSend]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <div
      style={{
        display: "flex", flexDirection: "column", height: "100%",
        background: "#1A1512", overflow: "hidden",
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div
        style={{
          padding: "14px 14px 10px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 15, color: "#C8A46A" }}>◈</span>
          <p style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
            color: "#F5EEE4", margin: 0,
          }}>
            Chat with Document
          </p>
        </div>

        {/* Clear history button — only shown when there are messages */}
        {hasMessages && (
          <button
            onClick={clearHistory}
            title="Clear conversation"
            style={{
              background: "transparent", border: "none", cursor: "pointer",
              color: "rgba(245,238,228,0.35)", fontSize: 14, padding: "2px 4px",
              borderRadius: 4, lineHeight: 1, transition: "color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#e07060")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(245,238,228,0.35)")}
          >
            🗑
          </button>
        )}
      </div>

      {/* ── Scrollable message area ─────────────────────────────────── */}
      <div
        ref={scrollRef}
        style={{
          flex: 1, overflowY: "auto", overflowX: "hidden",
          padding: "14px 12px 0",
          display: "flex", flexDirection: "column",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(255,255,255,0.08) transparent",
        }}
      >
        {isHistoryLoading ? (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            flex: 1, gap: 8,
            fontFamily: "'DM Sans', sans-serif", fontSize: 12,
            color: "rgba(245,238,228,0.4)",
          }}>
            <span style={{ animation: "ai-dot-bounce 1s infinite" }}>Loading history…</span>
          </div>
        ) : !hasMessages ? (
            <EmptyState />
        ) : (
          <>
            {messages.map((msg) => (
              <ChatMessage key={msg._id} message={msg} onRetry={() => retryMessage(msg._id, msg.originalText, msg.featureType, msg.originalPage)} />
            ))}
            
            {isLoading && !isRetrying && (
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
                 <div style={{
                   width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg, #2a221d, #3a2e24)",
                   border: "1px solid rgba(200,164,106,0.3)", display: "flex", alignItems: "center", justifyContent: "center",
                   fontSize: 12
                 }}>◈</div>
                 <div style={{ fontSize: 13, color: "rgba(200,164,106,0.8)", fontFamily: "'DM Sans', sans-serif", fontStyle: "italic" }}>
                   Thinking...
                 </div>
              </div>
            )}
            
            {isRetrying && (
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
                 <div style={{
                   width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg, #2a221d, #3a2e24)",
                   border: "1px solid rgba(200,164,106,0.3)", display: "flex", alignItems: "center", justifyContent: "center",
                   fontSize: 12
                 }}>◈</div>
                 <div style={{ fontSize: 13, color: "#e2b36b", fontFamily: "'DM Sans', sans-serif", fontStyle: "italic" }}>
                   Attempting to reconnect to AI...
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Study Tools Section (Collapsible) */}
      {!isLoading && !isRetrying && (
        <StudyToolsSection
          hasMessages={hasMessages}
          onSelectTool={setActiveTool}
          activeTool={activeTool}
          disabled={isLoading}
        />
      )}

      {/* Study Tool Config Panel (Slide-in) */}
      {activeTool && (
        <StudyToolConfig
          toolId={activeTool}
          currentPage={pageNumber}
          numPages={numPages}
          onGenerate={handleGenerateStudyTool}
          onClose={() => setActiveTool(null)}
          isLoading={isLoading}
        />
      )}

      {/* ── Error message ─────────────────────────────────────────── */}
      {error && (
        <div
          style={{
            margin: "0 12px 6px",
            padding: "8px 12px",
            background: "rgba(224,112,96,0.1)",
            border: "1px solid rgba(224,112,96,0.2)",
            borderRadius: 8,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 11.5, color: "#e07060",
            flexShrink: 0,
          }}
        >
          ⚠ {error}
        </div>
      )}

      {/* ── Fixed input bar ─────────────────────────────────────────── */}
      <div
        style={{
          padding: "10px 12px 12px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
          background: "#1A1512",
        }}
      >
        <div
          style={{
            display: "flex", gap: 8, alignItems: "flex-end",
            background: "#241D19",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 10,
            padding: "8px 10px",
            transition: "border-color 0.15s",
          }}
          onFocusCapture={(e) =>
            (e.currentTarget.style.borderColor = "rgba(200,164,106,0.35)")
          }
          onBlurCapture={(e) =>
            (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")
          }
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about this PDF…"
            rows={1}
            disabled={isLoading}
            style={{
              flex: 1, background: "transparent", border: "none", outline: "none",
              resize: "none", overflow: "hidden",
              fontFamily: "'DM Sans', sans-serif", fontSize: 13,
              color: "#F5EEE4", lineHeight: 1.5,
              caretColor: "#C8A46A",
            }}
            onInput={(e) => {
              // Auto-grow textarea up to ~4 lines
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 88) + "px";
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            style={{
              flexShrink: 0, width: 30, height: 30, borderRadius: 8,
              background: input.trim() && !isLoading
                ? "linear-gradient(135deg, #C8A46A, #a8843a)"
                : "rgba(255,255,255,0.06)",
              border: "none", cursor: input.trim() && !isLoading ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, color: input.trim() && !isLoading ? "#1A1512" : "rgba(255,255,255,0.2)",
              transition: "background 0.2s, color 0.2s",
              marginBottom: 1,
            }}
            title="Send message"
          >
            ↑
          </button>
        </div>
        <p style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: 10,
          color: "rgba(245,238,228,0.25)", margin: "5px 0 0", textAlign: "center",
        }}>
          Answers are based on extracted PDF content only.
        </p>
      </div>
    </div>
  );
}
