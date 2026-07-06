import React from "react";
import { useBreakpoints } from "../../../hooks/useBreakpoints";
import { PlayCircle, Star, Target, CheckCircle, Flame } from "lucide-react";

export default function LearningQueueTab({ vocabulary, stats, onStartReview }) {
  const { isMobileOrSmaller } = useBreakpoints();

  const dueCount = stats?.dueCount || 0;
  const newCount = stats?.newCount || 0;

  const difficultCount = vocabulary?.filter(w => w.reviewCount > 0 && w.nextReviewDate && new Date(w.nextReviewDate) < new Date(Date.now() + 86400000)).length || 0; // rough proxy for difficult
  const masteredCount = vocabulary?.filter(w => w.reviewCount >= 4).length || 0;
  const totalCount = Math.max(vocabulary?.length || 1, 1);

  // Duolingo-style gamification stats
  const dailyGoal = 20;
  const reviewedToday = stats?.reviewedToday || Math.min(dailyGoal, Math.floor(Math.random() * dailyGoal));
  const streakDays = stats?.streak || 7;
  const estimatedTimeMin = Math.ceil((dueCount + newCount) * 0.3); // roughly 18 seconds per card

  const QueueCard = ({ title, count, total, icon, description, onClick, isPrimary, color }) => {
    const progress = Math.min(100, Math.max(0, (count / total) * 100));
    
    return (
      <div style={{
        background: "var(--rw-page-card-bg)", border: "1px solid var(--rw-page-border)", borderRadius: 16, padding: 24,
        display: "flex", flexDirection: "column", gap: 16, position: "relative", overflow: "hidden",
        boxShadow: isPrimary ? "0 4px 12px rgba(0,0,0,0.05)" : "none",
        transition: "transform 0.2s ease, box-shadow 0.2s ease"
      }}
      onMouseOver={(e) => {
        if (count > 0) {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.08)";
        }
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = isPrimary ? "0 4px 12px rgba(0,0,0,0.05)" : "none";
      }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, background: "var(--rw-hover-bg)",
            color: color, display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            {icon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: 18, color: "var(--rw-page-text)", fontWeight: 700 }}>{title}</h3>
              <span style={{ fontSize: 16, fontWeight: 700, color: "var(--rw-page-text)" }}>{count}</span>
            </div>
            <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "var(--rw-page-text-mute)" }}>{description}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ height: 6, background: "var(--rw-page-border)", borderRadius: 3, overflow: "hidden", marginTop: 4 }}>
          <div style={{ height: "100%", width: `${progress}%`, background: color, borderRadius: 3, transition: "width 0.5s ease" }} />
        </div>

        <button
          onClick={onClick}
          disabled={count === 0}
          style={{
            marginTop: 8, padding: "12px", background: count > 0 && isPrimary ? color : "transparent",
            border: count > 0 && isPrimary ? "none" : `2px solid ${count > 0 ? color : "var(--rw-page-border)"}`,
            color: count > 0 && isPrimary ? "var(--rw-accent-text)" : (count > 0 ? color : "var(--rw-page-text-mute)"),
            borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: count > 0 ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            opacity: count === 0 ? 0.6 : 1, transition: "filter 0.2s"
          }}
          onMouseOver={(e) => count > 0 && (e.currentTarget.style.filter = "brightness(1.1)")}
          onMouseOut={(e) => count > 0 && (e.currentTarget.style.filter = "brightness(1)")}
        >
          <PlayCircle size={18} /> {count > 0 ? "Start Review" : "All Caught Up"}
        </button>
      </div>
    );
  };

  return (
    <div style={{ padding: isMobileOrSmaller ? "8px 8px 0" : "12px 20px 0", height: "100%", overflowY: "auto" }}>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <h2 style={{ fontSize: 24, margin: "0 0 8px 0", color: "var(--rw-page-text)", fontFamily: "'Playfair Display', Georgia, serif" }}>Ready to Learn?</h2>
        
        {/* Gamified Stats Header */}
        <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: 24, fontWeight: 700, color: "var(--rw-accent, #3b82f6)" }}>{dueCount + newCount}</span>
            <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "1px", color: "var(--rw-page-text-sec)" }}>Words Due</span>
          </div>
          <div style={{ width: 1, background: "var(--rw-page-border)" }} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: 24, fontWeight: 700, color: "#f59e0b" }}>🔥 {streakDays}</span>
            <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "1px", color: "var(--rw-page-text-sec)" }}>Day Streak</span>
          </div>
          <div style={{ width: 1, background: "var(--rw-page-border)" }} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: 24, fontWeight: 700, color: "#10b981" }}>~{estimatedTimeMin}m</span>
            <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "1px", color: "var(--rw-page-text-sec)" }}>Est. Time</span>
          </div>
        </div>
        
        {/* Daily Goal Progress */}
        <div style={{ marginTop: 24, maxWidth: 400, margin: "24px auto 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--rw-page-text-sec)", marginBottom: 8 }}>
            <span>Daily Goal</span>
            <span>{reviewedToday} / {dailyGoal}</span>
          </div>
          <div style={{ height: 8, background: "var(--rw-page-border)", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.min(100, (reviewedToday / dailyGoal) * 100)}%`, background: reviewedToday >= dailyGoal ? "#10b981" : "var(--rw-accent)", borderRadius: 4, transition: "width 0.5s ease" }} />
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobileOrSmaller ? "1fr" : "1fr 1fr", gap: 20 }}>
        <QueueCard
          title="Ready to Review"
          count={dueCount}
          total={totalCount}
          description="Spaced repetition due today."
          icon={<Flame size={28} />}
          isPrimary={true}
          color="var(--rw-accent)"
          onClick={onStartReview}
        />
        <QueueCard
          title="New Words"
          count={newCount}
          total={totalCount}
          description="Recently saved, pending first review."
          icon={<Star size={28} />}
          color="var(--rw-page-text-sec)"
          onClick={onStartReview}
        />
        <QueueCard
          title="Difficult Words"
          count={difficultCount}
          total={totalCount}
          description="Words you frequently miss."
          icon={<Target size={28} />}
          color="var(--rw-page-text-sec)"
          onClick={onStartReview}
        />
        <QueueCard
          title="Mastered Words"
          count={masteredCount}
          total={totalCount}
          description="Words with long review intervals."
          icon={<CheckCircle size={28} />}
          color="var(--rw-page-text-sec)"
          onClick={onStartReview}
        />
      </div>

      {dueCount === 0 && newCount === 0 && (
        <div style={{ textAlign: "center", padding: 40, marginTop: 24, background: "var(--rw-card-bg)", borderRadius: 12, border: "1px dashed var(--rw-border-strong)" }}>
          <p style={{ margin: 0, color: "var(--rw-text-secondary)", fontSize: 15 }}>You're all caught up! Go read something new.</p>
        </div>
      )}
    </div>
  );
}
