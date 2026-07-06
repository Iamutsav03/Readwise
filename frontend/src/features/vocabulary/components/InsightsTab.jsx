import React from "react";
import { useBreakpoints } from "../../../hooks/useBreakpoints";
import { BookOpen, TrendingUp, CheckCircle, FileText, Target } from "lucide-react";

export default function InsightsTab({ stats }) {
  const { isMobileOrSmaller } = useBreakpoints();

  const InsightCard = ({ title, value, icon, description, badge, progress }) => (
    <div style={{ 
      background: "var(--rw-page-card-bg)", border: "1px solid var(--rw-page-border)", borderRadius: 16, padding: 24, 
      display: "flex", flexDirection: "column", gap: 16, position: "relative", overflow: "hidden",
      boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--rw-page-text-mute)" }}>
          <div style={{ padding: 8, background: "var(--rw-panel-bg)", borderRadius: 8, color: "var(--rw-page-text-sec)" }}>
            {icon}
          </div>
          <span style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700 }}>{title}</span>
        </div>
        {badge && (
          <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 8px", background: "var(--rw-accent-muted)", color: "var(--rw-accent)", borderRadius: 12 }}>
            {badge}
          </span>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <div style={{ fontSize: 36, fontWeight: 800, color: "var(--rw-page-text)", fontFamily: "'Playfair Display', Georgia, serif" }}>
          {value}
        </div>
      </div>
      {progress !== undefined && (
        <div style={{ height: 4, background: "var(--rw-page-border)", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progress}%`, background: "var(--rw-accent)", borderRadius: 2 }} />
        </div>
      )}
      <div style={{ fontSize: 13, color: "var(--rw-page-text-sec)" }}>
        {description}
      </div>
    </div>
  );

  return (
    <div style={{ padding: isMobileOrSmaller ? "8px 8px 0" : "12px 20px 0", height: "100%", overflowY: "auto" }}>
      <h2 style={{ fontSize: 20, margin: "0 0 12px 0", color: "var(--rw-page-text)", fontFamily: "'Playfair Display', Georgia, serif" }}>Your Progress</h2>
      
      <div style={{ display: "grid", gridTemplateColumns: isMobileOrSmaller ? "1fr" : "1fr 1fr 1fr", gap: 20 }}>
        <InsightCard
          title="Total Saved"
          value={stats?.totalSaved || 0}
          icon={<BookOpen size={18} />}
          description="Total words in your vault."
          badge="+12 this week"
        />
        <InsightCard
          title="Mastered"
          value={stats?.masteredCount || 0}
          icon={<CheckCircle size={18} />}
          description="Words consistently remembered."
          progress={stats?.totalSaved ? ((stats?.masteredCount || 0) / stats.totalSaved) * 100 : 0}
        />
        <InsightCard
          title="Review Streak"
          value={`${stats?.streak || 0}`}
          icon={<TrendingUp size={18} />}
          description="Consecutive days reviewing."
          badge="Active"
        />
        <InsightCard
          title="Retention Rate"
          value="87%"
          icon={<Target size={18} />}
          description="Average recall success rate."
          progress={87}
        />
      </div>

      <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: isMobileOrSmaller ? "1fr" : "2fr 1fr", gap: 20 }}>
        <div style={{ background: "var(--rw-panel-bg)", border: "1px solid var(--rw-page-border)", borderRadius: 16, padding: isMobileOrSmaller ? 16 : 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--rw-page-text)", marginBottom: 24 }}>
            <div style={{ padding: 8, background: "var(--rw-page-card-bg)", borderRadius: 8, border: "1px solid var(--rw-page-border)", color: "var(--rw-page-text-sec)" }}>
              <FileText size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Top Source Document</h3>
          </div>
          {stats?.topPdf ? (
            <div style={{ background: "var(--rw-page-card-bg)", padding: 24, borderRadius: 12, border: "1px solid var(--rw-page-border)" }}>
              <p style={{ margin: "0 0 8px 0", fontSize: 20, fontWeight: 700, color: "var(--rw-page-text)" }}>{stats.topPdf._id}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ flex: 1, height: 6, background: "var(--rw-page-border)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: "70%", background: "var(--rw-accent)", borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--rw-page-text-sec)" }}>{stats.topPdf.count} words</span>
              </div>
            </div>
          ) : (
            <div style={{ padding: 32, textAlign: "center", background: "var(--rw-page-card-bg)", borderRadius: 12, border: "1px dashed var(--rw-page-border)" }}>
              <p style={{ margin: 0, fontSize: 14, color: "var(--rw-page-text-mute)" }}>Read more documents to see your top sources.</p>
            </div>
          )}
        </div>

        <div style={{ background: "var(--rw-page-card-bg)", border: "1px solid var(--rw-page-border)", borderRadius: 16, padding: isMobileOrSmaller ? 16 : 20, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: 32, background: "var(--rw-accent-muted)", color: "var(--rw-accent)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <Target size={32} />
          </div>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 18, fontWeight: 700, color: "var(--rw-page-text)" }}>Weekly Goal</h3>
          <p style={{ margin: "0 0 24px 0", fontSize: 14, color: "var(--rw-page-text-sec)" }}>
            Review 50 words this week to maintain your momentum.
          </p>
          <div style={{ width: "100%", position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, fontWeight: 600, color: "var(--rw-page-text)" }}>
              <span>24 Reviewed</span>
              <span>50 Goal</span>
            </div>
            <div style={{ height: 8, background: "var(--rw-page-border)", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", width: "48%", background: "var(--rw-accent)", borderRadius: 4 }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
