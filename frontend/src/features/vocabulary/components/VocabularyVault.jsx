import React, { useState } from "react";
import { useBreakpoints } from "../../../hooks/useBreakpoints";
import { useVocabulary } from "../hooks/useVocabulary";
import SavedWordsTab from "./SavedWordsTab";
import LearningQueueTab from "./LearningQueueTab";
import FlashReviewTab from "./FlashReviewTab";
import InsightsTab from "./InsightsTab";
import { BookOpen, Layers, Zap, BarChart2, ArrowLeft } from "lucide-react";

export default function VocabularyVault({ onJumpToSource, onBack }) {
  const [activeTab, setActiveTab] = useState("saved");
  const { vocabulary, stats, isLoading, removeWord, reviewWord, refresh } = useVocabulary();
  const { isMobileOrSmaller } = useBreakpoints();

  const tabs = [
    { id: "saved", label: "Saved Words", icon: <BookOpen size={16} /> },
    { id: "queue", label: "Learning Queue", icon: <Layers size={16} /> },
    { id: "review", label: "Flash Review", icon: <Zap size={16} /> },
    { id: "insights", label: "Insights", icon: <BarChart2 size={16} /> },
  ];

  return (
    <div style={{
      width: "100%",
      height: "100%",
      background: "var(--rw-app-bg)",
      color: "var(--rw-page-text)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      overflow: "hidden"
    }}>
      <div style={{
        width: "100%",
        maxWidth: 1400,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}>
        {/* Header & Tabs */}
        <div style={{
          padding: isMobileOrSmaller ? "10px 12px 0" : "16px 20px 0",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
            {onBack && (
              <button 
                onClick={onBack} 
                style={{ 
                  background: "transparent", border: "none", cursor: "pointer", 
                  color: "var(--rw-page-text-sec)", display: "flex", alignItems: "center", justifyContent: "center",
                  padding: 8, borderRadius: "50%", transition: "background 0.2s"
                }}
                onMouseOver={(e) => e.currentTarget.style.background = "var(--rw-page-hover-bg)"}
                onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
              >
                <ArrowLeft size={24} />
              </button>
            )}
            <h1 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: isMobileOrSmaller ? 24 : 32,
              color: "var(--rw-page-text)",
              margin: 0
            }}>Vocabulary Vault</h1>
          </div>
          
          <div style={{
            display: "flex",
            gap: 8,
            overflowX: "auto",
            paddingBottom: 16,
            scrollbarWidth: "none",
            borderBottom: "1px solid var(--rw-page-border)"
          }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 16px",
                  background: activeTab === tab.id ? "var(--rw-page-card-bg)" : "transparent",
                  border: `1px solid ${activeTab === tab.id ? "var(--rw-page-border)" : "transparent"}`,
                  borderRadius: 20,
                  color: activeTab === tab.id ? "var(--rw-page-text)" : "var(--rw-page-text-sec)",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  fontWeight: activeTab === tab.id ? 600 : 500,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s"
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
          {activeTab === "saved" && (
            <SavedWordsTab
              vocabulary={vocabulary}
              isLoading={isLoading}
              onRemove={removeWord}
              onJumpToSource={onJumpToSource}
            />
          )}
          {activeTab === "queue" && (
            <LearningQueueTab
              vocabulary={vocabulary}
              stats={stats}
              onStartReview={() => setActiveTab("review")}
            />
          )}
          {activeTab === "review" && (
            <FlashReviewTab
              vocabulary={vocabulary}
              onReview={reviewWord}
              onFinish={() => setActiveTab("queue")}
            />
          )}
          {activeTab === "insights" && (
            <InsightsTab stats={stats} />
          )}
        </div>
      </div>
    </div>
  );
}
