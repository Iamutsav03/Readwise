// features/ai/components/ChatMessage.jsx
// Renders a single chat bubble for user or assistant messages.
// Uses the ReadWise dark espresso theme.

import React from "react";

// ── Simple markdown renderer for bold/italic/code in AI responses ─────────────
function renderInlineMarkdown(text) {
  if (!text) return null;

  const parts = [];
  // Split on **bold**, *italic*, and `code` patterns
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[2]) {
      parts.push(<strong key={match.index}>{match[2]}</strong>);
    } else if (match[3]) {
      parts.push(<em key={match.index}>{match[3]}</em>);
    } else if (match[4]) {
      parts.push(
        <code
          key={match.index}
          style={{
            background: "rgba(255,255,255,0.08)",
            borderRadius: 3,
            padding: "1px 5px",
            fontSize: "0.9em",
            fontFamily: "monospace",
          }}
        >
          {match[4]}
        </code>
      );
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
}

// ── Render assistant content: split by line breaks and bullet points ──────────
function AssistantContent({ content }) {
  const paragraphs = content.split(/\n+/).filter(Boolean);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {paragraphs.map((para, i) => {
        const isBullet = /^[-•*]\s/.test(para);
        return (
          <p
            key={i}
            style={{
              margin: 0,
              paddingLeft: isBullet ? 12 : 0,
              position: "relative",
              lineHeight: 1.6,
            }}
          >
            {isBullet && (
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  color: "#C8A46A",
                  fontWeight: 700,
                }}
              >
                •
              </span>
            )}
            {renderInlineMarkdown(isBullet ? para.slice(2) : para)}
          </p>
        );
      })}
    </div>
  );
}

// ── Format timestamp ──────────────────────────────────────────────────────────
function formatTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ── Main ChatMessage component ────────────────────────────────────────────────
export default function ChatMessage({ message, onRetry }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 12,
        }}
      >
        <div
          style={{
            maxWidth: "82%",
            background: "linear-gradient(135deg, #C8A46A, #a8843a)",
            borderRadius: "16px 16px 4px 16px",
            padding: "10px 14px",
            boxShadow: "0 2px 8px rgba(200,164,106,0.2)",
          }}
        >
          {message.featureType === "explain-selection" ? (
            <div>
              <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5, opacity: 0.8, display: "block", marginBottom: 4 }}>
                Explaining Selected Text:
              </span>
              <div style={{
                background: "rgba(26,21,18,0.2)",
                padding: "8px 10px",
                borderLeft: "2px solid rgba(26,21,18,0.4)",
                borderRadius: 4,
                fontStyle: "italic",
                marginBottom: 4
              }}>
                "{message.content}"
              </div>
            </div>
          ) : (
            <p
              style={{
                margin: 0,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                color: "#1A1512",
                fontWeight: 500,
                lineHeight: 1.55,
              }}
            >
              {message.content}
            </p>
          )}
          <p
            style={{
              margin: "5px 0 0",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 10,
              color: "rgba(26,21,18,0.6)",
              textAlign: "right",
            }}
          >
            {formatTime(message.createdAt)}
          </p>
        </div>
      </div>
    );
  }

  // Assistant bubble
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        marginBottom: 12,
        alignItems: "flex-start",
      }}
    >
      {/* AI avatar icon */}
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #2a221d, #3a2e24)",
          border: "1px solid rgba(200,164,106,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginTop: 2,
          fontSize: 12,
        }}
      >
        ◈
      </div>

      <div
        style={{
          maxWidth: "88%",
          background: message.status === "failed" ? "rgba(220, 53, 69, 0.1)" : "#241D19",
          border: message.status === "failed" ? "1px solid rgba(220, 53, 69, 0.3)" : "1px solid rgba(255,255,255,0.06)",
          borderRadius: "4px 16px 16px 16px",
          padding: "10px 14px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        }}
      >
        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            color: message.status === "failed" ? "#ff8b8b" : "#F5EEE4",
            lineHeight: 1.6,
          }}
        >
          {message.status === "failed" ? (
            <div>
              <p style={{ margin: "0 0 8px" }}>AI is currently experiencing high demand. Please try again in a few moments.</p>
              <button
                onClick={onRetry}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(220, 53, 69, 0.5)",
                  color: "#ff8b8b",
                  borderRadius: 4,
                  padding: "4px 12px",
                  fontSize: 12,
                  fontFamily: "'DM Sans', sans-serif",
                  cursor: "pointer",
                  marginTop: 4,
                }}
              >
                ↻ Retry
              </button>
            </div>
          ) : (
            <AssistantContent content={message.content} />
          )}
        </div>

        {/* Show which pages were used as context */}
        {message.contextPages?.length > 0 && (
          <p
            style={{
              margin: "7px 0 0",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 10,
              color: "rgba(200,164,106,0.6)",
            }}
          >
            📄 Pages Used: {message.contextPages.join(", ")}
            {message.contextParagraphs ? ` · Source Paragraphs: ${message.contextParagraphs}` : ""}
            <span style={{ opacity: 0.5 }}> · {formatTime(message.createdAt)}</span>
          </p>
        )}
        {!message.contextPages?.length && (
          <p
            style={{
              margin: "5px 0 0",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 10,
              color: "rgba(245,238,228,0.3)",
            }}
          >
            {formatTime(message.createdAt)}
          </p>
        )}
      </div>
    </div>
  );
}
