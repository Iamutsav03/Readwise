import { useState, useEffect, useRef, useCallback } from "react";
import { Search, BookOpen, Edit2, Star, MoreHorizontal, X, UploadCloud, ChevronLeft, ChevronRight, Maximize, Maximize2, ZoomOut, ZoomIn, Lock, Palette, Zap, Sparkles, FileText, Copy, Send, ClipboardList, Lightbulb, Target, Layers, MessageSquare, ArrowRight } from "lucide-react";
import { BookmarkIcon as BookmarkOutline } from "@heroicons/react/24/outline";

/* ─── Fonts ─────────────────────────────────────────────────────────────── */
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,400;1,500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');`;

/* ─── useBreakpoints (inline, no external dep) ───────────────────────────── */
const useBreakpoints = () => {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 800);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return { isMobileOrSmaller: w < 640 };
};

/* ─── Design tokens (page-level: contrasted against appBg) ──────────────── */
const T = {
  accent:    "var(--rw-accent)",
  panel:     "var(--rw-panel-bg)",
  darkBg:    "var(--rw-sidebar-bg)",   // sidebar dark for CTA page
  appBg:     "var(--rw-app-bg)",
  card:      "var(--rw-page-card-bg)",  // card surface on appBg
  border:    "var(--rw-page-border)",   // border visible on appBg
  textPrim:  "var(--rw-page-text)",     // readable text on appBg
  textSec:   "var(--rw-page-text-sec)", // secondary text on appBg
  textMuted: "var(--rw-page-text-mute)",// muted text on appBg
  toolbar:   "var(--rw-toolbar-bg)",
};

/* ─── Per-page accent colours & icons ───────────────────────────────────── */
const PAGE_META = [
  { accent: "#b8966a", icon: BookOpen, label: "Welcome" },
  { accent: "#7a9e7e", icon: FileText, label: "Library" },
  { accent: "#7b8fc4", icon: Maximize2, label: "Reader" },
  { accent: "#c47b7b", icon: Palette, label: "Selection" },
  { accent: "#9b7bc4", icon: Sparkles, label: "AI Chat" },
  { accent: "#c4a47b", icon: Lightbulb, label: "Study Tools" },
  { accent: "#7bbfc4", icon: MessageSquare, label: "Sticky Notes" },
  { accent: "#b8966a", icon: ArrowRight, label: "Get Started" },
];

/* ─── Shared style snippets ──────────────────────────────────────────────── */
const S = {
  tag: { fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 500, color: T.textSec, textTransform: "uppercase", letterSpacing: "0.11em", margin: "0 0 5px" },
  h2: { fontFamily: "'Playfair Display',serif", fontSize: "clamp(18px,2.5vw,24px)", fontWeight: 600, color: T.textPrim, margin: "0 0 6px", letterSpacing: "-0.02em" },
  sub: { fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: T.textSec, margin: "0 0 14px", fontWeight: 300, lineHeight: 1.6 },
  pageNum: { position: "absolute", bottom: 14, right: 18, fontFamily: "'Playfair Display',serif", fontSize: 11, color: T.textSec, fontStyle: "italic", zIndex: 5 },
  wrap: { height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", padding: "20px 22px", position: "relative", overflow: "hidden" },
};

/* ─── Global animations ──────────────────────────────────────────────────── */
const GLOBAL_CSS = `
${FONTS}
@keyframes noteIn      { from{opacity:0;transform:scale(.93) translateY(6px)} to{opacity:1;transform:scale(1) translateY(0)} }
@keyframes slideUp     { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
@keyframes scalePop    { 0%{transform:scale(1)} 40%{transform:scale(1.12)} 100%{transform:scale(1)} }
@keyframes pulseDot    { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.25)} }
@keyframes fadeInUp    { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
@keyframes progressFill{ from{width:0} }
@keyframes indicatorFade {
  0%{opacity:0;transform:translateX(-50%) translateY(4px)}
  15%{opacity:1;transform:translateX(-50%) translateY(0)}
  70%{opacity:1;transform:translateX(-50%) translateY(0)}
  100%{opacity:0;transform:translateX(-50%) translateY(-3px)}
}
@keyframes pageFlipNext { 0%{transform:perspective(2000px) rotateY(0deg)} 100%{transform:perspective(2000px) rotateY(-180deg)} }
@keyframes pageFlipPrev { 0%{transform:perspective(2000px) rotateY(0deg)} 100%{transform:perspective(2000px) rotateY(180deg)} }
@keyframes flipShadowSweep    { 0%{opacity:0} 45%{opacity:.35} 55%{opacity:.35} 100%{opacity:0} }
@keyframes ambientShadowSweep { 0%{opacity:.18} 50%{opacity:0} 100%{opacity:.18} }

.rw-stagger-1 { animation: slideUp .55s cubic-bezier(.4,0,.2,1) .05s both }
.rw-stagger-2 { animation: slideUp .55s cubic-bezier(.4,0,.2,1) .15s both }
.rw-stagger-3 { animation: slideUp .55s cubic-bezier(.4,0,.2,1) .26s both }
.rw-stagger-4 { animation: slideUp .55s cubic-bezier(.4,0,.2,1) .37s both }

.rw-icon-btn  { border:1px solid var(--rw-page-border); background:transparent; color:${T.textMuted}; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .15s; border-radius:7px; }
.rw-icon-btn:hover { background:var(--rw-page-hover-bg); color:${T.textPrim}; }
.rw-icon-btn.on   { background:var(--rw-accent); color:var(--rw-accent-text); }

.rw-row:hover { background:var(--rw-page-hover-bg); }
.rw-row-actions { display:flex; gap:4px; }
.rw-doc-btn { border:none; border-radius:6px; background:transparent; color:${T.textMuted}; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .15s; width:44px; height:44px; }
.rw-doc-btn:hover { background:var(--rw-page-hover-bg); color:${T.textPrim}; }
.rw-doc-btn.star-on { color:${T.accent}; }

.rw-sel-btn { border:none; background:transparent; color:${T.textPrim}; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:background .13s,transform .1s; border-radius:8px; }
.rw-sel-btn:hover { background:var(--rw-page-hover-bg); transform:scale(1.1); }

.study-tool-card { background:var(--rw-page-card-bg); border:1px solid var(--rw-page-border); border-radius:10px; padding:13px 11px; cursor:pointer; text-align:left; transition:all .2s; }
.study-tool-card:hover  { transform:translateY(-2px); }
.study-tool-card.active { background:var(--rw-accent-muted); border-color:var(--rw-border-strong); }

.rw-continue-card:hover { transform:translateY(-1px); box-shadow:var(--rw-shadow); }

.rw-zone-left,.rw-zone-right { position:absolute; top:50%; transform:translateY(-50%); z-index:60; cursor:pointer; }
.rw-zone-left  { left:7px; }
.rw-zone-right { right:7px; }
.rw-arrow { width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:15px; margin:8px; opacity:1; transition:transform .2s ease; }
.rw-zone-left:hover .rw-arrow,.rw-zone-right:hover .rw-arrow { transform:scale(1.12); }
`;

/* ─── Progress ribbon ───────────────────────────────────────────────────── */
const ProgressRibbon = ({ current, total, accentColor }) => (
  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, zIndex: 200, background: "var(--rw-border)", pointerEvents: "none" }}>
    <div style={{ height: "100%", width: `${((current + 1) / total) * 100}%`, background: accentColor || T.accent, transition: "width .45s cubic-bezier(.4,0,.2,1)", borderRadius: "0 2px 2px 0" }} />
  </div>
);

/* ─── Feature header — replaces old Caption ─────────────────────────────── */
const FeatureHeader = ({ pageIdx, title, sub }) => {
  const meta = PAGE_META[pageIdx] || PAGE_META[0];
  const Icon = meta.icon;
  return (
    <div className="rw-stagger-1" style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14, flexShrink: 0 }}>
      <div style={{ width: 42, height: 42, borderRadius: 11, background: "var(--rw-hover-bg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "1.5px solid var(--rw-border)" }}>
        <Icon size={20} color={meta.accent} />
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{ ...S.tag, color: meta.accent, margin: "0 0 2px" }}>{meta.label}</p>
        <h2 style={{ ...S.h2, color: T.textPrim, margin: 0, fontSize: "clamp(16px,2vw,21px)" }}>{title}</h2>
        {sub && <p style={{ ...S.sub, color: T.textSec, margin: "3px 0 0", fontSize: 13 }}>{sub}</p>}
      </div>
    </div>
  );
};

/* ─── "Try it" coach mark ────────────────────────────────────────────────── */
const TryIt = ({ text, done }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 13px", background: "var(--rw-accent-muted)", border: "1px dashed var(--rw-border-strong)", borderRadius: 30, fontSize: 12, fontFamily: "'DM Sans',sans-serif", color: T.textSec, opacity: done ? 0 : 1, transition: "opacity .4s ease", pointerEvents: "none", alignSelf: "flex-start" }}>
    <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.accent, display: "inline-block", animation: "pulseDot 1.4s ease-in-out infinite" }} />
    {text}
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE 1 — Welcome
═══════════════════════════════════════════════════════════════════════════ */
const Page1 = ({ onNext }) => {
  const [v, setV] = useState(false);
  useEffect(() => { const t = setTimeout(() => setV(true), 80); return () => clearTimeout(t); }, []);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 28px", textAlign: "center", position: "relative" }}>
      <div style={{ position: "absolute", top: 20, left: 28, width: 5, height: 5, borderRadius: "50%", background: T.accent, opacity: .35 }} />
      <div style={{ position: "absolute", bottom: 40, right: 36, width: 3, height: 3, borderRadius: "50%", background: T.accent, opacity: .45 }} />

      <div style={{ opacity: v ? 1 : 0, transform: v ? "translateY(0) scale(1)" : "translateY(14px) scale(.93)", transition: "opacity .7s ease, transform .7s cubic-bezier(.34,1.4,.64,1)", marginBottom: 24 }}>
        <svg width="68" height="54" viewBox="0 0 72 58" fill="none">
          <rect x="8" y="6" width="25" height="46" rx="3" fill="#e8d4b4" stroke="#b8966a" strokeWidth="1" />
          <rect x="10" y="8" width="21" height="42" rx="2" fill="#f5ede0" />
          <line x1="14" y1="16" x2="27" y2="16" stroke="#b8966a" strokeWidth="1" strokeLinecap="round" />
          <line x1="14" y1="21" x2="27" y2="21" stroke="#b8966a" strokeWidth="1" strokeLinecap="round" />
          <line x1="14" y1="26" x2="23" y2="26" stroke="#b8966a" strokeWidth="1" strokeLinecap="round" />
          <rect x="34" y="6" width="30" height="46" rx="3" fill="#dfc9a5" stroke="#b8966a" strokeWidth="1" />
          <rect x="36" y="8" width="26" height="42" rx="2" fill="#faf3e8" />
          <line x1="40" y1="16" x2="57" y2="16" stroke="#b8966a" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="40" y1="21" x2="57" y2="21" stroke="#b8966a" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="40" y1="26" x2="52" y2="26" stroke="#b8966a" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="49" cy="50" r="3" fill="#b8966a" opacity=".6" />
        </svg>
      </div>

      <div style={{ opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(10px)", transition: "opacity .65s ease .18s, transform .65s ease .18s" }}>
        <p style={{ ...S.tag, marginBottom: 10 }}>ReadWise · AI Reading Platform</p>
        <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: "clamp(26px,5vw,38px)", fontWeight: 700, color: T.textPrim, lineHeight: 1.15, letterSpacing: "-0.03em", margin: "0 0 12px" }}>
          Reading should feel<br /><em style={{ color: T.accent, fontStyle: "italic" }}>effortless.</em>
        </h1>
        <p style={{ ...S.sub, maxWidth: 300, margin: "0 auto 26px", fontSize: 14 }}>One tool. Every feature you need to read, understand, and remember.</p>
        <button onClick={onNext}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 26px", background: T.accent, color: "var(--rw-accent-text)", border: "none", borderRadius: 12, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 500, letterSpacing: ".03em", transition: "all .2s ease", minHeight: 44 }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}>
          See the features <ArrowRight size={15} />
        </button>
      </div>
      <div style={S.pageNum}>1</div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE 2 — Document Library
═══════════════════════════════════════════════════════════════════════════ */
const Page2 = () => {
  const { isMobileOrSmaller } = useBreakpoints();
  const [docs, setDocs] = useState([
    { id: 1, name: "Deep Work", fav: true, pct: 78, page: 187, total: 240, lastOpened: "2h ago" },
    { id: 2, name: "System Design Interview", fav: false, pct: 34, page: 82, total: 241, lastOpened: "Yesterday" },
    { id: 3, name: "The Almanack of Naval", fav: false, pct: 92, page: 218, total: 237, lastOpened: "3d ago" },
  ]);
  const [renamingId, setRenamingId] = useState(null);
  const [renameVal, setRenameVal] = useState("");
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [hint, setHint] = useState(null);
  const [triedInteract, setTriedInteract] = useState(false);
  const longPressTimer = useRef(null);

  const showHint = (msg) => { setHint(msg); setTriedInteract(true); setTimeout(() => setHint(null), 2000); };
  const toggleFav = (id, e) => { e.stopPropagation(); setDocs(p => p.map(d => d.id === id ? { ...d, fav: !d.fav } : d)); showHint("Favourite toggled"); };
  const startRename = (doc, e) => { if (e) e.stopPropagation(); setRenamingId(doc.id); setRenameVal(doc.name); };
  const commitRename = () => { if (renameVal.trim()) setDocs(p => p.map(d => d.id === renamingId ? { ...d, name: renameVal.trim() } : d)); setRenamingId(null); showHint("Document renamed"); };
  const handleDelete = (id, e) => { e.stopPropagation(); setDocs(p => p.filter(d => d.id !== id)); setMenuOpenId(null); showHint("Document deleted"); };
  const handleTouchStart = (doc) => { longPressTimer.current = setTimeout(() => startRename(doc), 520); };
  const handleTouchEnd = () => { if (longPressTimer.current) clearTimeout(longPressTimer.current); };
  const filtered = docs.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div style={{ ...S.wrap, padding: "18px 18px 14px" }}>
      <div className="rw-stagger-1">
        <FeatureHeader pageIdx={1} title="Your document library." sub="Pick up exactly where you left off." />
      </div>

      {/* Continue card */}
      <div className="rw-continue-card rw-stagger-2"
        style={{ background: "var(--rw-accent-muted)", border: "1px solid var(--rw-border)", borderRadius: 12, padding: "13px 14px", marginBottom: 10, cursor: "pointer", transition: "transform .15s,box-shadow .15s" }}
        onClick={() => showHint("Opening document…")}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: T.accent, textTransform: "uppercase", letterSpacing: ".05em" }}>Continue Reading</p>
            <p style={{ margin: "2px 0 0", fontSize: 15, fontWeight: 600, color: T.textPrim, fontFamily: "'Playfair Display',serif" }}>Deep Work</p>
          </div>
          <p style={{ margin: 0, fontSize: 12, color: T.textMuted, fontStyle: "italic", fontFamily: "'DM Sans',sans-serif" }}>2h ago</p>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
          <p style={{ margin: 0, fontSize: 12, color: T.textMuted }}>Page 187 / 240</p>
          <p style={{ margin: 0, fontSize: 12, color: T.accent, fontWeight: 500 }}>78%</p>
        </div>
        <div style={{ width: "100%", height: 4, background: "var(--rw-border)", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ width: "78%", height: "100%", background: T.accent, borderRadius: 2 }} />
        </div>
      </div>

      {/* Upload zone */}
      <div className="rw-stagger-2"
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); showHint("PDF uploading…"); }}
        style={{ border: `1.5px dashed ${dragOver ? T.accent : "var(--rw-border)"}`, borderRadius: 10, padding: "11px 14px", marginBottom: 10, display: "flex", alignItems: "center", gap: 11, background: dragOver ? "var(--rw-accent-muted)" : "var(--rw-card-bg)", cursor: "pointer", transition: "all .2s", minHeight: 44 }}
        onClick={() => showHint("Opening file picker…")}>
        <div style={{ background: T.accent, color: "var(--rw-accent-text)", padding: 7, borderRadius: 7, display: "flex", flexShrink: 0 }}><UploadCloud size={17} /></div>
        <div>
          <p style={{ margin: 0, fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 500, color: T.textPrim }}>Upload PDF</p>
          <p style={{ margin: 0, fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: T.textMuted }}>{isMobileOrSmaller ? "Tap to browse" : "Drag & drop or click to browse"}</p>
        </div>
      </div>

      {/* Search */}
      <div className="rw-stagger-3" style={{ position: "relative", marginBottom: 10 }}>
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: T.textMuted, display: "flex" }}><Search size={14} /></span>
        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search PDFs…"
          style={{ width: "100%", padding: "10px 10px 10px 34px", fontSize: 14, fontFamily: "'DM Sans',sans-serif", color: T.textPrim, background: "var(--rw-hover-bg)", border: "1px solid var(--rw-border)", borderRadius: 9, outline: "none", boxSizing: "border-box", minHeight: 44 }} />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "var(--rw-border)", border: "none", borderRadius: "50%", width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: T.textMuted }}><X size={14} /></button>
        )}
      </div>

      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: T.textSec, textTransform: "uppercase", letterSpacing: ".08em", margin: "0 0 5px 4px" }}>Recent</p>

      {/* Doc list */}
      <div className="rw-stagger-4" style={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden", paddingBottom: 6 }}>
        {filtered.map(doc => (
          <div key={doc.id} className="rw-row"
            style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 8px", borderRadius: 10, cursor: "pointer", transition: "background .15s", position: "relative" }}
            onClick={() => showHint("Opening document…")}
            onTouchStart={() => isMobileOrSmaller && handleTouchStart(doc)}
            onTouchEnd={handleTouchEnd} onTouchMove={handleTouchEnd}>

            {/* Thumbnail */}
            <div style={{ width: 34, height: 44, background: "var(--rw-reader-bg)", borderRadius: 4, position: "relative", overflow: "hidden", border: "1px solid var(--rw-border)", flexShrink: 0 }}>
              <div style={{ position: "absolute", top: 5, left: 4, right: 4, display: "flex", flexDirection: "column", gap: 3 }}>
                {[80, 90, 60, 85, 75].map((w, i) => <div key={i} style={{ height: 2, background: "var(--rw-border)", borderRadius: 1, width: `${w}%` }} />)}
              </div>
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {renamingId === doc.id ? (
                <input value={renameVal} onChange={e => setRenameVal(e.target.value)} onBlur={commitRename}
                  onKeyDown={e => e.key === "Enter" && commitRename()} autoFocus
                  style={{ width: "100%", fontSize: 14, fontFamily: "'DM Sans',sans-serif", color: T.textPrim, background: "var(--rw-hover-bg)", border: `1.5px solid ${T.accent}`, borderRadius: 5, padding: "2px 6px", outline: "none" }}
                  onClick={e => e.stopPropagation()} />
              ) : (
                <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: T.textPrim, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: "'DM Sans',sans-serif" }}>{doc.name}</p>
              )}
              <p style={{ margin: "2px 0 0", fontSize: 12, color: T.textMuted, fontFamily: "'DM Sans',sans-serif" }}>Page {doc.page} / {doc.total}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 4 }}>
                <div style={{ flex: 1, height: 3, background: "var(--rw-border)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: `${doc.pct}%`, height: "100%", background: T.accent, borderRadius: 2 }} />
                </div>
                <p style={{ margin: 0, fontSize: 11, color: T.accent, fontWeight: 500, fontFamily: "'DM Sans',sans-serif", flexShrink: 0 }}>{doc.pct}%</p>
              </div>
            </div>

            {/* Actions — always visible on mobile */}
            <div className="rw-row-actions" onClick={e => e.stopPropagation()}>
              <button className={`rw-doc-btn ${doc.fav ? "star-on" : ""}`} onClick={e => toggleFav(doc.id, e)} style={{ width: 44, height: 44 }}><Star size={16} fill={doc.fav ? "currentColor" : "none"} /></button>
              <button className="rw-doc-btn" onClick={e => startRename(doc, e)} style={{ width: 44, height: 44 }}><Edit2 size={15} /></button>
              <div style={{ position: "relative" }}>
                <button className="rw-doc-btn" onClick={() => setMenuOpenId(menuOpenId === doc.id ? null : doc.id)} style={{ width: 44, height: 44 }}><MoreHorizontal size={16} /></button>
                {menuOpenId === doc.id && (
                  <div style={{ position: "absolute", right: 0, top: "100%", marginTop: 4, background: "var(--rw-card-bg)", border: "1px solid var(--rw-border)", borderRadius: 9, padding: 4, zIndex: 10, minWidth: 90 }}>
                    <button onClick={e => handleDelete(doc.id, e)} style={{ width: "100%", textAlign: "left", padding: "10px 13px", background: "transparent", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 14, color: "var(--rw-danger)", fontFamily: "'DM Sans',sans-serif" }}>Delete</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 8 }}>
        <TryIt text={isMobileOrSmaller ? "Long-press a title to rename" : "Click to select · Double-click to open"} done={triedInteract} />
      </div>
      {hint && <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: T.accent, margin: "6px 0 0", textAlign: "center", fontStyle: "italic", animation: "fadeInUp .2s ease" }}>{hint}</p>}

      <div style={S.pageNum}>2</div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE 3 — PDF Reader
═══════════════════════════════════════════════════════════════════════════ */
const Page3 = () => {
  const { isMobileOrSmaller } = useBreakpoints();
  const [scale, setScale] = useState(100);
  const [fitMode, setFitMode] = useState("page");
  const [page, setPage] = useState(187);
  const [focusMode, setFocusMode] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [toast, setToast] = useState(null);
  const [tried, setTried] = useState(false);
  const totalPages = 240;
  const BTN = isMobileOrSmaller ? 44 : 32;

  const startX = useRef(null);
  const startY = useRef(null);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const THRESHOLD = 60;

  const flash = (label) => { setToast(label); setTried(true); setTimeout(() => setToast(null), 1100); };
  const zoom = (delta) => { setFitMode(null); setScale(s => Math.max(50, Math.min(1500, s + delta))); flash(`${Math.max(50, Math.min(1500, scale + delta))}%`); };
  const setFit = (mode) => { setFitMode(mode); flash(mode === "width" ? "Fit Width" : "Fit Page"); };
  const nav = (dir) => { setPage(p => Math.max(1, Math.min(totalPages, p + (dir === "next" ? 1 : -1)))); setTried(true); };

  const onTouchStart = (e) => {
    if (!isMobileOrSmaller) return;
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    setIsDragging(true);
    setDragX(0);
  };

  const onTouchMove = (e) => {
    if (startX.current === null || !isMobileOrSmaller) return;
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;
    if (Math.abs(dx) > Math.abs(dy)) {
      e.stopPropagation(); // Stop global carousel from swiping
      const atStart = page <= 1 && dx > 0;
      const atEnd = page >= totalPages && dx < 0;
      const factor = atStart || atEnd ? 0.15 : 0.8;
      setDragX(dx * factor);
    }
  };

  const onTouchEnd = (e) => {
    if (startX.current === null || !isMobileOrSmaller) { setIsDragging(false); return; }
    const dx = e.changedTouches[0].clientX - startX.current;
    const dy = e.changedTouches[0].clientY - startY.current;
    if (Math.abs(dx) > Math.abs(dy)) {
      e.stopPropagation();
      if (dx < -THRESHOLD && page < totalPages) nav("next");
      else if (dx > THRESHOLD && page > 1) nav("prev");
    }
    setDragX(0);
    setIsDragging(false);
    startX.current = null;
  };

  const pageBoxStyle = fitMode === "width"
    ? { width: "92%", height: "70%" }
    : fitMode === "page"
      ? { width: "52%", height: "88%" }
      : { width: `${52 * (scale / 100)}%`, height: `${88 * (scale / 100)}%`, maxWidth: "98%", maxHeight: "95%" };

  const iconSz = isMobileOrSmaller ? 20 : 16;

  return (
    <div style={{ ...S.wrap, padding: isMobileOrSmaller ? "18px 18px 0" : "18px 20px 0" }}>
      <div className="rw-stagger-1">
        <FeatureHeader pageIdx={2} title="Smooth, powerful reader." sub="Zoom, bookmark, and focus — all at your fingertips." />
      </div>

      {/* Page surface */}
      <div 
        style={{ flex: 1, minHeight: 0, position: "relative", background: focusMode ? "var(--rw-sidebar-bg)" : "var(--rw-app-bg)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", margin: isMobileOrSmaller ? "0 -18px" : "0 -22px", overflow: "hidden", transition: "background .3s ease", touchAction: isMobileOrSmaller ? "pan-y" : "auto" }}
        onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
      >

        {toast && <div style={{ position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)", background: "var(--rw-card-bg)", color: T.textPrim, border: "1px solid var(--rw-border)", padding: "8px 18px", borderRadius: 20, fontSize: 13, fontFamily: "'DM Sans',sans-serif", animation: "noteIn .18s ease", whiteSpace: "nowrap", boxShadow: "var(--rw-shadow)" }}>{toast}</div>}

        {focusMode && isMobileOrSmaller && (
          <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)" }}>
            <button onClick={() => { setFocusMode(false); flash("Focus off"); }} style={{ padding: "11px 22px", borderRadius: 22, background: "var(--rw-hover-bg)", color: T.textPrim, border: "1px solid var(--rw-border)", fontSize: 14, backdropFilter: "blur(4px)", display: "flex", alignItems: "center", gap: 6, minHeight: 44 }}><Lock size={16} /> Exit Focus</button>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div style={{ flexShrink: 0, margin: isMobileOrSmaller ? "0 -18px" : "0 -22px" }}>
        <div style={{ height: 3, background: "var(--rw-border)" }}>
          <div style={{ height: "100%", width: `${(page / totalPages) * 100}%`, background: T.accent, transition: "width .3s" }} />
        </div>

        {isMobileOrSmaller ? (
          <div style={{ background: "var(--rw-toolbar-bg)", borderTop: "1px solid var(--rw-border)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 14px", borderBottom: "1px solid var(--rw-border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button className="rw-icon-btn" style={{ width: BTN, height: BTN }} onClick={() => nav("prev")}><ChevronLeft size={iconSz} /></button>
                <span style={{ fontSize: 14, fontFamily: "'DM Sans',sans-serif", color: T.textPrim, minWidth: 66, textAlign: "center" }}>{page} / {totalPages}</span>
                <button className="rw-icon-btn" style={{ width: BTN, height: BTN }} onClick={() => nav("next")}><ChevronRight size={iconSz} /></button>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button className="rw-icon-btn" style={{ width: BTN, height: BTN }} onClick={() => zoom(-25)}><ZoomOut size={iconSz} /></button>
                <span style={{ fontSize: 13, color: T.textSec, minWidth: 44, textAlign: "center", fontFamily: "'DM Sans',sans-serif" }}>{fitMode ? (fitMode === "page" ? "Fit" : "Wide") : `${scale}%`}</span>
                <button className="rw-icon-btn" style={{ width: BTN, height: BTN }} onClick={() => zoom(25)}><ZoomIn size={iconSz} /></button>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", padding: "6px 14px 8px" }}>
              <button className={`rw-icon-btn ${fitMode === "page" ? "on" : ""}`} style={{ width: BTN, height: BTN }} onClick={() => setFit("page")}><Maximize2 size={iconSz} /></button>
              <button className={`rw-icon-btn ${fitMode === "width" ? "on" : ""}`} style={{ width: BTN, height: BTN }} onClick={() => setFit("width")}><Maximize size={iconSz} /></button>
              <div style={{ width: 1, height: 22, background: "var(--rw-border)" }} />
              <button className={`rw-icon-btn ${bookmarked ? "on" : ""}`} style={{ width: BTN, height: BTN }} onClick={() => { setBookmarked(b => !b); flash(bookmarked ? "Bookmark removed" : "Bookmarked"); }}><BookmarkOutline style={{ width: iconSz, height: iconSz }} /></button>
              <button className={`rw-icon-btn ${focusMode ? "on" : ""}`} style={{ width: BTN, height: BTN }} onClick={() => { setFocusMode(f => !f); flash(focusMode ? "Focus off" : "Focus on"); }}><Lock size={iconSz} /></button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", height: 52, background: "var(--rw-toolbar-bg)", borderTop: "1px solid var(--rw-border)", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <button className="rw-icon-btn" style={{ width: 32, height: 32 }} onClick={() => nav("prev")}><ChevronLeft size={16} /></button>
              <span style={{ border: "1px solid var(--rw-border)", color: T.textPrim, padding: "3px 10px", borderRadius: 7, fontSize: 13, fontFamily: "'DM Sans',sans-serif" }}>{page} / {totalPages}</span>
              <button className="rw-icon-btn" style={{ width: 32, height: 32 }} onClick={() => nav("next")}><ChevronRight size={16} /></button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <button className={`rw-icon-btn ${fitMode === "page" ? "on" : ""}`} style={{ width: 32, height: 32 }} onClick={() => setFit("page")}><Maximize2 size={15} /></button>
              <button className={`rw-icon-btn ${fitMode === "width" ? "on" : ""}`} style={{ width: 32, height: 32 }} onClick={() => setFit("width")}><Maximize size={15} /></button>
              <div style={{ width: 1, height: 20, background: "var(--rw-border)", margin: "0 2px" }} />
              <button className="rw-icon-btn" style={{ width: 32, height: 32 }} onClick={() => zoom(-25)}><ZoomOut size={15} /></button>
              <span style={{ fontSize: 12, color: T.textSec, minWidth: 40, textAlign: "center", fontFamily: "'DM Sans',sans-serif" }}>{fitMode ? (fitMode === "page" ? "Fit" : "Wide") : `${scale}%`}</span>
              <button className="rw-icon-btn" style={{ width: 32, height: 32 }} onClick={() => zoom(25)}><ZoomIn size={15} /></button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <button className={`rw-icon-btn ${bookmarked ? "on" : ""}`} style={{ width: 32, height: 32 }} onClick={() => { setBookmarked(b => !b); flash(bookmarked ? "Bookmark removed" : "Bookmarked"); }}><BookmarkOutline style={{ width: 15, height: 15 }} /></button>
              <button className={`rw-icon-btn ${focusMode ? "on" : ""}`} style={{ width: 32, height: 32 }} onClick={() => { setFocusMode(f => !f); flash(focusMode ? "Focus off" : "Focus on"); }}><Lock size={15} /></button>
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: "8px 0 0" }}>
        <TryIt text={isMobileOrSmaller ? "Swipe to turn pages or tap buttons" : "Try zooming or turning pages below"} done={tried} />
      </div>
      <div style={S.pageNum}>3</div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE 4 — Text Selection
═══════════════════════════════════════════════════════════════════════════ */
const Page4 = () => {
  const { isMobileOrSmaller } = useBreakpoints();
  const [actionLabel, setActionLabel] = useState(null);
  const [tried, setTried] = useState(false);
  const [toolbarOpen, setToolbarOpen] = useState(false);
  const containerRef = useRef(null);
  const timeoutRef = useRef(null);

  const showAction = (label) => { 
    setActionLabel(label); 
    setTried(true); 
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setActionLabel(null), 2000); 
    if (isMobileOrSmaller) setToolbarOpen(false);
  };
  const BTN = isMobileOrSmaller ? 44 : 32;
  const iconSz = isMobileOrSmaller ? 20 : 16;

  const toolbarItems = [
    { icon: Palette, label: "Highlight", action: "Highlight applied" },
    { icon: BookOpen, label: "Define", action: "Definition shown" },
    { icon: Zap, label: "Quick Explain", action: "Quick Explain" },
    { icon: Sparkles, label: "Deep Explain", action: "Deep Explain" },
    { icon: FileText, label: "Summarise", action: "Summary generated" },
    { icon: Copy, label: "Copy", action: "Text copied" },
  ];

  return (
    <div style={{ ...S.wrap, padding: "18px 18px" }}>
      <div className="rw-stagger-1">
        <FeatureHeader pageIdx={3} title="Select any text to understand it." sub="Quick Explain, Deep Explain, definitions — one tap." />
      </div>

      <div className="rw-stagger-2" style={{ flex: 1, minHeight: 0, background: "var(--rw-page-card-bg)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 -2px" }}>
        <div style={{ width: "88%", maxWidth: 460, background: "var(--rw-app-bg)", padding: isMobileOrSmaller ? "22px 18px" : "30px 32px", borderRadius: 10, boxShadow: "var(--rw-shadow)", position: "relative", border: "1px solid var(--rw-page-border)" }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: isMobileOrSmaller ? 15.5 : 14.5, color: T.textPrim, lineHeight: 1.85, margin: 0 }}>
            Reading complex documents is difficult. Select any text to instantly unlock understanding.
            <br /><br />
            <span 
              ref={containerRef} 
              onClick={() => setToolbarOpen(!toolbarOpen)}
              style={{ background: toolbarOpen ? "var(--rw-selection-color)" : "var(--rw-accent-muted)", position: "relative", borderRadius: 2, padding: "2px 0", cursor: "pointer", transition: "background 0.2s" }}
            >
              This makes processing academic papers effortless.
              {/* Toolbar — above on desktop, below on mobile */}
              <div 
                onClick={(e) => e.stopPropagation()}
                style={{
                position: "absolute",
                ...(isMobileOrSmaller ? { top: "110%", marginTop: 8 } : { bottom: "110%", marginBottom: 8 }),
                left: "50%", transform: `translateX(-50%) scale(${toolbarOpen ? 1 : 0.95})`,
                display: "flex", gap: 3, padding: "5px 7px",
                background: "var(--rw-card-bg)", border: "1px solid var(--rw-border-strong)",
                borderRadius: 14, boxShadow: "var(--rw-shadow)",
                alignItems: "center", zIndex: 100,
                opacity: toolbarOpen ? 1 : 0,
                pointerEvents: toolbarOpen ? "auto" : "none",
                transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                flexWrap: isMobileOrSmaller ? "wrap" : "nowrap",
                justifyContent: "center",
                width: isMobileOrSmaller ? 240 : "max-content",
              }}>
                {toolbarItems.map((item, i) => (
                  <button key={i} className="rw-sel-btn" title={item.label}
                    style={{ width: BTN, height: BTN }}
                    onClick={(e) => { e.stopPropagation(); showAction(item.action); }}>
                    <item.icon size={iconSz} />
                  </button>
                ))}
              </div>
            </span>
          </div>

          {/* Action toast */}
          <div style={{ position: "absolute", bottom: -50, left: "50%", transform: "translateX(-50%)", background: T.accent, color: "var(--rw-accent-text)", padding: isMobileOrSmaller ? "9px 22px" : "7px 18px", borderRadius: 22, fontSize: 13, fontFamily: "'DM Sans',sans-serif", fontWeight: 600, whiteSpace: "nowrap", boxShadow: "var(--rw-shadow)", opacity: actionLabel ? 1 : 0, transition: "opacity .3s", pointerEvents: "none", animation: actionLabel ? "scalePop .25s ease" : "none" }}>
            {actionLabel}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <TryIt text={toolbarOpen ? "Tap a button in the toolbar" : "Tap the highlighted text above"} done={tried} />
      </div>
      <div style={S.pageNum}>4</div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE 5 — AI Chat
═══════════════════════════════════════════════════════════════════════════ */
const Page5 = () => {
  const { isMobileOrSmaller } = useBreakpoints();
  const [inputVal, setInputVal] = useState("");
  const [messages, setMessages] = useState([
    { type: "user", text: "What is the main idea?" },
    { type: "ai", text: "Focused, distraction-free work is rare — and increasingly valuable." },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [tried, setTried] = useState(false);
  const scrollRef = useRef(null);
  const bodyFS = isMobileOrSmaller ? 14 : 13;

  useEffect(() => { 
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const simulateSend = (text) => {
    if (!text?.trim()) return;
    setMessages(p => [...p, { type: "user", text }]);
    setInputVal(""); setIsTyping(true); setTried(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(p => [...p, { type: "ai", text: "Based on the document, this refers to eliminating shallow distractions to reach peak cognitive output." }]);
    }, 1300);
  };

  const suggestions = ["Summarise Chapter 3", "Give me 5 key takeaways", "Explain 'attention residue'"];

  return (
    <div style={{ ...S.wrap, padding: isMobileOrSmaller ? "18px 18px 0" : "18px 20px 0" }}>
      <div className="rw-stagger-1">
        <FeatureHeader pageIdx={4} title="Your PDF answers back." sub="RAG-powered answers grounded in your document." />
      </div>

      {/* Suggestion chips */}
      {messages.length <= 2 && (
        <div className="rw-stagger-2" style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => simulateSend(s)}
              style={{ padding: "7px 13px", background: "var(--rw-page-hover-bg)", border: "1px solid var(--rw-page-border)", borderRadius: 22, fontSize: 12, fontFamily: "'DM Sans',sans-serif", color: T.textPrim, cursor: "pointer", minHeight: 36, transition: "background .15s" }}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="rw-stagger-3" style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", gap: 12, overflowY: "auto", paddingBottom: 10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.type === "user" ? "flex-end" : "flex-start", gap: 8 }}>
            {m.type === "ai" && (
              <div style={{ width: isMobileOrSmaller ? 30 : 26, height: isMobileOrSmaller ? 30 : 26, borderRadius: "50%", background: "linear-gradient(135deg,var(--rw-hover-bg),var(--rw-border))", border: "1px solid var(--rw-border)", display: "flex", alignItems: "center", justifyContent: "center", color: T.accent, flexShrink: 0 }}>
                <Sparkles size={isMobileOrSmaller ? 15 : 13} />
              </div>
            )}
            <div style={{ background: "var(--rw-page-card-bg)", border: m.type === "user" ? "1px solid var(--rw-page-border)" : "1px solid var(--rw-page-hover-bg)", padding: isMobileOrSmaller ? "12px 15px" : "10px 13px", borderRadius: m.type === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px", maxWidth: "85%", animation: "fadeInUp .25s ease" }}>
              <p style={{ margin: 0, fontFamily: "'DM Sans',sans-serif", fontSize: bodyFS, color: T.textPrim, lineHeight: 1.65 }}>{m.text}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", border: "1px solid var(--rw-border)", display: "flex", alignItems: "center", justifyContent: "center", color: T.accent }}><Sparkles size={13} /></div>
            <div style={{ fontSize: 13, color: T.accent, fontFamily: "'DM Sans',sans-serif", fontStyle: "italic", alignSelf: "center" }}>Thinking…</div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="rw-stagger-4" style={{ padding: "10px 0 14px", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", background: "var(--rw-page-card-bg)", border: "1px solid var(--rw-page-border)", borderRadius: 12, padding: isMobileOrSmaller ? "10px 12px" : "8px 10px" }}>
          <input type="text" value={inputVal} onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => e.key === "Enter" && simulateSend(inputVal)}
            placeholder="Ask anything about this PDF…"
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontFamily: "'DM Sans',sans-serif", fontSize: bodyFS, color: T.textPrim, minHeight: 24 }} />
          <button onClick={() => simulateSend(inputVal)}
            style={{ width: isMobileOrSmaller ? 42 : 32, height: isMobileOrSmaller ? 42 : 32, borderRadius: 9, background: "var(--rw-page-hover-bg)", border: "none", color: T.textMuted, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            <Send size={isMobileOrSmaller ? 18 : 14} />
          </button>
        </div>
        <div style={{ marginTop: 8 }}>
          <TryIt text="Type a question or tap a suggestion above" done={tried} />
        </div>
      </div>
      <div style={{ ...S.pageNum, color: T.textMuted }}>5</div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE 6 — Study Tools
═══════════════════════════════════════════════════════════════════════════ */
const STUDY_OUTPUT = {
  summary: { body: "Deep Work argues that distraction-free concentration is increasingly rare — and increasingly valuable. Cultivating it is a competitive advantage." },
  concepts: { items: ["Deep Work — focused, undistracted cognitive effort", "Attention Residue — the cost of switching tasks", "Fixed-Schedule Productivity — work backward from a hard stop"] },
  interview: { items: ["How does deep work differ from working long hours?", "What is attention residue and why does it matter?"] },
  flashcards: { cards: [{ q: "What is Deep Work?", a: "Focused, distraction-free professional activity." }, { q: "What is Attention Residue?", a: "Cognitive cost from switching tasks too often." }] },
};

const TOOLS = [
  { id: "summary", icon: ClipboardList, label: "Summarise", desc: "Key points" },
  { id: "concepts", icon: Lightbulb, label: "Concepts", desc: "Key ideas" },
  { id: "interview", icon: Target, label: "Interview Qs", desc: "Exam prep" },
  { id: "flashcards", icon: Layers, label: "Flashcards", desc: "Revision" },
];

const Page6 = () => {
  const { isMobileOrSmaller } = useBreakpoints();
  const [activeTool, setActiveTool] = useState("interview");
  const [scope, setScope] = useState("current");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState(null);
  const [flipped, setFlipped] = useState({});
  const [tried, setTried] = useState(false);
  const bodyFS = 13;

  const generate = () => { setLoading(true); setOutput(null); setTried(true); setTimeout(() => { setLoading(false); setOutput(activeTool); }, 1400); };
  const out = output ? STUDY_OUTPUT[output] : null;

  return (
    <div style={{ ...S.wrap, padding: isMobileOrSmaller ? "18px 18px 10px" : "18px 20px 10px" }}>
      <div className="rw-stagger-1">
        <FeatureHeader pageIdx={5} title="Study smarter, not harder." sub="Pick a tool, pick a scope, generate instantly." />
      </div>

      {/* Tool selector — horizontal scrollable pills on mobile */}
      {isMobileOrSmaller ? (
        <div className="rw-stagger-2" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 12, flexShrink: 0, scrollbarWidth: "none", touchAction: "pan-x" }}
             onTouchStart={e => e.stopPropagation()} onTouchMove={e => e.stopPropagation()} onTouchEnd={e => e.stopPropagation()}>
          <style>{`.no-scrollbar::-webkit-scrollbar{display:none}`}</style>
          {TOOLS.map(t => (
            <button key={t.id} className="no-scrollbar"
              onClick={() => { setActiveTool(t.id); setOutput(null); }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "10px 16px", background: activeTool === t.id ? T.accent : "var(--rw-page-card-bg)", border: `1.5px solid ${activeTool === t.id ? T.accent : "var(--rw-page-border)"}`, borderRadius: 12, cursor: "pointer", flexShrink: 0, minHeight: 44, transition: "all .2s" }}>
              <t.icon size={18} color={activeTool === t.id ? "var(--rw-accent-text)" : T.accent} />
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: activeTool === t.id ? 600 : 400, color: activeTool === t.id ? "var(--rw-accent-text)" : T.textPrim, whiteSpace: "nowrap" }}>{t.label}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="rw-stagger-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
          {TOOLS.map(t => (
            <div key={t.id} className={`study-tool-card ${activeTool === t.id ? "active" : ""}`} onClick={() => { setActiveTool(t.id); setOutput(null); }}>
              <t.icon size={17} color={T.accent} style={{ marginBottom: 5 }} />
              <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: T.textPrim, fontFamily: "'DM Sans',sans-serif" }}>{t.label}</p>
              <p style={{ margin: 0, fontSize: 11, color: T.textMuted, fontFamily: "'DM Sans',sans-serif" }}>{t.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* Scope toggle */}
      <div className="rw-stagger-3" style={{ display: "flex", gap: 6, marginBottom: 10, flexShrink: 0 }}>
        {[{ id: "current", l: "Current page" }, { id: "chapter", l: "Chapter" }].map(s => (
          <button key={s.id} onClick={() => setScope(s.id)}
            style={{ flex: 1, padding: isMobileOrSmaller ? "11px" : "7px", background: scope === s.id ? T.accent : "var(--rw-page-hover-bg)", color: scope === s.id ? "var(--rw-accent-text)" : T.textPrim, border: "none", borderRadius: 8, fontSize: 13, fontWeight: scope === s.id ? 600 : 400, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", minHeight: 44, transition: "all .2s" }}>
            {s.l}
          </button>
        ))}
      </div>

      {/* Generate button */}
      <button className="rw-stagger-4" onClick={generate} disabled={loading}
        style={{ width: "100%", flexShrink: 0, padding: isMobileOrSmaller ? "15px" : "11px", background: T.accent, color: "var(--rw-accent-text)", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, display: "flex", justifyContent: "center", alignItems: "center", gap: 7, cursor: loading ? "default" : "pointer", fontFamily: "'DM Sans',sans-serif", marginBottom: 12, minHeight: 48, opacity: loading ? .7 : 1, transition: "opacity .2s" }}>
        {loading ? "Generating…" : <><Sparkles size={17} /> Generate</>}
      </button>

      {/* Output */}
      <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
        {out && !loading && (
          <div style={{ background: "var(--rw-page-card-bg)", border: "1px solid var(--rw-page-border)", borderRadius: 11, padding: isMobileOrSmaller ? 16 : 13, animation: "noteIn .25s ease" }}>
            {out.body && <p style={{ margin: 0, fontFamily: "'DM Sans',sans-serif", fontSize: bodyFS, color: T.textPrim, lineHeight: 1.65, fontWeight: 300 }}>{out.body}</p>}
            {out.items && (
              <ul style={{ margin: 0, padding: "0 0 0 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                {out.items.map((it, i) => <li key={i} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: bodyFS, color: T.textPrim, fontWeight: 300, lineHeight: 1.6 }}>{it}</li>)}
              </ul>
            )}
            {out.cards && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <style>{`
                  .flip-card { perspective:800px; cursor:pointer; height:${isMobileOrSmaller ? 64 : 56}px; }
                  .flip-inner { position:relative; width:100%; height:100%; transition:transform .5s; transform-style:preserve-3d; }
                  .flip-card.flipped .flip-inner { transform:rotateY(180deg); }
                  .flip-face { position:absolute; inset:0; backface-visibility:hidden; display:flex; align-items:center; padding:10px 13px; border-radius:9px; }
                  .flip-back { transform:rotateY(180deg); }
                `}</style>
                {out.cards.map((c, i) => (
                  <div key={i} className={`flip-card ${flipped[i] ? "flipped" : ""}`} onClick={() => setFlipped(f => ({ ...f, [i]: !f[i] }))}>
                    <div className="flip-inner">
                      <div className="flip-face" style={{ background: "var(--rw-page-hover-bg)" }}>
                        <p style={{ margin: 0, fontSize: bodyFS, color: T.textPrim, fontWeight: 500, fontFamily: "'DM Sans',sans-serif" }}>Q: {c.q}</p>
                      </div>
                      <div className="flip-face flip-back" style={{ background: "var(--rw-accent-muted)" }}>
                        <p style={{ margin: 0, fontSize: bodyFS, color: T.textPrim, fontWeight: 300, fontFamily: "'DM Sans',sans-serif" }}>A: {c.a}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <p style={{ margin: "2px 0 0", fontSize: 12, color: T.textMuted, textAlign: "center", fontFamily: "'DM Sans',sans-serif", fontStyle: "italic" }}>Tap a card to flip</p>
              </div>
            )}
          </div>
        )}
        {!out && !loading && (
          <div style={{ marginTop: 4 }}>
            <TryIt text="Pick a tool and tap Generate" done={tried} />
          </div>
        )}
      </div>
      <div style={{ ...S.pageNum, color: T.textMuted }}>6</div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE 7 — Sticky Notes
═══════════════════════════════════════════════════════════════════════════ */
const NOTE_PREFILLS = [
  { title: "Follow up", text: "Check sources for this claim." },
  { title: "Exam material", text: "Memorise this — likely to come up." },
  { title: "Contradiction", text: "Author contradicts an earlier point here." },
  { title: "Good quote", text: "Use this in the essay draft." },
];

const Page7 = () => {
  const { isMobileOrSmaller } = useBreakpoints();
  const [notes, setNotes] = useState([{ id: 1, x: 30, y: 22, title: "Follow up", text: "Check sources for this claim." }]);
  const [activeId, setActiveId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editVal, setEditVal] = useState("");
  const [dragId, setDragId] = useState(null);
  const [tried, setTried] = useState(false);
  const pdfRef = useRef(null);
  const dragMoved = useRef(false);
  const MAX = 5;

  const placeNote = (clientX, clientY) => {
    if (notes.length >= MAX || !pdfRef.current) return;
    const rect = pdfRef.current.getBoundingClientRect();
    const x = Math.max(6, Math.min(88, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(6, Math.min(80, ((clientY - rect.top) / rect.height) * 100));
    const id = Date.now();
    setNotes(p => [...p, { id, x, y, ...NOTE_PREFILLS[p.length % NOTE_PREFILLS.length] }]);
    setActiveId(id);
    setTried(true);
  };

  const handleSurfaceClick = (e) => {
    if (e.target.closest(".note-pin") || e.target.closest(".note-card")) return;
    if (activeId !== null) { setActiveId(null); return; }
    placeNote(e.clientX, e.clientY);
  };

  const handlePinDown = (id, e) => {
    e.stopPropagation(); dragMoved.current = false; setDragId(id);
  };

  useEffect(() => {
    if (dragId === null) return;
    const onMove = (e) => {
      dragMoved.current = true;
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;
      const rect = pdfRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = Math.max(6, Math.min(88, ((cx - rect.left) / rect.width) * 100));
      const y = Math.max(6, Math.min(80, ((cy - rect.top) / rect.height) * 100));
      setNotes(p => p.map(n => n.id === dragId ? { ...n, x, y } : n));
    };
    const onTouchMove = (e) => { e.preventDefault(); onMove(e); };
    const onUp = () => setDragId(null);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [dragId]);

  const removeNote = (id, e) => { e.stopPropagation(); setNotes(p => p.filter(n => n.id !== id)); if (activeId === id) setActiveId(null); };
  const PIN = isMobileOrSmaller ? 42 : 28;
  const PIN_ICON = isMobileOrSmaller ? 18 : 13;

  return (
    <div style={{ ...S.wrap, padding: "18px 18px 14px" }}>
      <div className="rw-stagger-1">
        <FeatureHeader pageIdx={6} title="Drop notes right on the page." sub="Tap to pin, drag to reposition." />
      </div>

      <div ref={pdfRef} onClick={handleSurfaceClick}
        className="rw-stagger-2"
        style={{ flex: 1, minHeight: 0, background: "var(--rw-page-card-bg)", border: "1px solid var(--rw-page-border)", borderRadius: 12, padding: "18px 18px", position: "relative", cursor: notes.length < MAX && activeId === null ? "crosshair" : "default", overflow: "hidden" }}>

        {/* Fake text lines */}
        {[78, 92, 85, 70, 95, 80, 60, 88, 76, 90, 72, 85, 65, 90].map((w, i) => (
          <div key={i} style={{ height: 5, borderRadius: 3, background: "var(--rw-page-border)", width: `${w}%`, marginBottom: isMobileOrSmaller ? 11 : 9 }} />
        ))}

        <div style={{ position: "absolute", bottom: 12, left: 18, fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: T.textMuted, pointerEvents: "none" }}>
          {notes.length < MAX && activeId === null
            ? (isMobileOrSmaller ? "Tap anywhere to drop a note" : "Click anywhere · drag pins to move")
            : activeId !== null ? "Tap outside to close"
              : "All 5 note slots used"}
        </div>

        {notes.map(note => (
          <div key={note.id} style={{ position: "absolute", left: `${note.x}%`, top: `${note.y}%`, zIndex: dragId === note.id ? 30 : 10 }}>
            {/* Pin */}
            <div className="note-pin"
              onMouseDown={e => handlePinDown(note.id, e)}
              onTouchStart={e => handlePinDown(note.id, e)}
              onClick={e => { e.stopPropagation(); if (dragMoved.current) return; setActiveId(activeId === note.id ? null : note.id); setEditingId(null); }}
              style={{ width: PIN, height: PIN, borderRadius: "50% 50% 50% 4px", background: "var(--rw-page-card-bg)", border: `2px solid ${T.accent}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: dragId === note.id ? "grabbing" : "grab", transform: `translate(-50%,-50%) scale(${dragId === note.id ? 1.14 : 1})`, boxShadow: "var(--rw-shadow)", transition: dragId === note.id ? "none" : "transform .15s,box-shadow .15s", color: T.accent, touchAction: dragId === note.id ? "none" : "auto" }}>
              <MessageSquare size={PIN_ICON} fill={dragId === note.id ? T.accent : "none"} />
            </div>

            {/* Card */}
            {activeId === note.id && (
              <div className="note-card" onClick={e => e.stopPropagation()}
                style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", top: "30px", width: isMobileOrSmaller ? 220 : 185, maxWidth: "calc(100vw - 60px)", background: "var(--rw-page-card-bg)", border: "1px solid var(--rw-page-border)", borderRadius: 12, padding: isMobileOrSmaller ? "14px 16px" : "11px 13px", boxShadow: "var(--rw-shadow)", zIndex: 20, animation: "noteIn .2s ease" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  {editingId === note.id ? (
                    <input value={editVal} onChange={e => setEditVal(e.target.value)}
                      onBlur={() => { setNotes(p => p.map(n => n.id === note.id ? { ...n, title: editVal } : n)); setEditingId(null); }}
                      autoFocus
                      style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: T.accent, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", border: "none", borderBottom: `1px solid ${T.accent}`, outline: "none", background: "transparent", width: "70%" }} />
                  ) : (
                    <span onClick={() => { setEditingId(note.id); setEditVal(note.title); }} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: T.accent, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", cursor: "text" }}>{note.title}</span>
                  )}
                  <button onClick={e => removeNote(note.id, e)} style={{ background: "none", border: "none", cursor: "pointer", color: T.textMuted, fontSize: 18, lineHeight: 1, padding: "0 2px", minWidth: 24, minHeight: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                </div>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: isMobileOrSmaller ? 13.5 : 12, color: T.textPrim, margin: 0, lineHeight: 1.55, fontWeight: 300 }}>{note.text}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 10 }}>
        <TryIt text="Tap anywhere on the page to drop a note" done={tried} />
      </div>
      <div style={S.pageNum}>7</div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE 8 — CTA
═══════════════════════════════════════════════════════════════════════════ */
const Page8 = ({ onUploadClick }) => {
  const [v, setV] = useState(false);
  useEffect(() => { const t = setTimeout(() => setV(true), 100); return () => clearTimeout(t); }, []);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 28px", textAlign: "center", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, var(--rw-page-border) 0%, transparent 70%)", top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" }} />

      <div style={{ opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(14px)", transition: "opacity .7s ease, transform .7s ease" }}>
        <div style={{ fontSize: 26, marginBottom: 18, color: T.textPrim }}>✦</div>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 500, color: T.accent, textTransform: "uppercase", letterSpacing: ".14em", margin: "0 0 18px" }}>ReadWise</p>
        <p style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: "clamp(17px,2.5vw,24px)", fontStyle: "italic", color: T.textPrim, lineHeight: 1.55, margin: "0 0 8px", fontWeight: 500 }}>"The best reading tool<br />disappears."</p>
        <p style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(15px,2vw,20px)", color: T.textPrim, lineHeight: 1.5, margin: "0 0 30px", fontWeight: 600 }}>Only understanding remains.</p>
        <button onClick={onUploadClick}
          style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "13px 28px", background: T.accent, color: "var(--rw-accent-text)", border: "none", borderRadius: 12, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 500, letterSpacing: ".02em", transition: "all .22s ease", minHeight: 48 }}
          onMouseEnter={e => { e.currentTarget.style.opacity = ".88"; e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}>
          Upload your first PDF <ArrowRight size={15} />
        </button>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: T.textMuted, marginTop: 14 }}>No account needed · Free to start</p>
      </div>

      <div style={{ position: "absolute", bottom: 16, right: 20, fontFamily: "'Playfair Display',serif", fontSize: 11, color: T.textMuted, fontStyle: "italic", opacity: 0.4 }}>8</div>
    </div>
  );
};

/* ─── Page registry ──────────────────────────────────────────────────────── */
const PAGES = [Page1, Page2, Page3, Page4, Page5, Page6, Page7, Page8];

/* ═══════════════════════════════════════════════════════════════════════════
   BOTTOM NAV — dot indicators for mobile
═══════════════════════════════════════════════════════════════════════════ */
const BottomNav = ({ current, total, onGo }) => (
  <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 0 14px", background: "var(--rw-app-bg)" }}>
    {Array.from({ length: total }).map((_, i) => (
      <button key={i} onClick={() => onGo(i)}
        style={{ width: i === current ? 22 : 7, height: 7, borderRadius: 4, background: i === current ? T.accent : "var(--rw-border)", border: "none", cursor: "pointer", padding: 0, transition: "all .3s cubic-bezier(.4,0,.2,1)", minWidth: 7 }} />
    ))}
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   BOOK CONTAINER — desktop page-flip
═══════════════════════════════════════════════════════════════════════════ */
const BookContainer = ({ onUploadClick }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [flip, setFlip] = useState(null);
  const [showIndicator, setShowIndicator] = useState(false);
  const indicatorTimer = useRef(null);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const total = PAGES.length;
  const FLIP_MS = 620;

  const goTo = useCallback((idx) => {
    if (flip || idx < 0 || idx >= total || idx === currentPage) return;
    const dir = idx > currentPage ? "next" : "prev";
    setFlip({ dir, from: currentPage, to: idx });
    setTimeout(() => { setCurrentPage(idx); setFlip(null); }, FLIP_MS);
    setShowIndicator(true);
    clearTimeout(indicatorTimer.current);
    indicatorTimer.current = setTimeout(() => setShowIndicator(false), 1800);
  }, [currentPage, flip, total]);

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; touchStartY.current = e.touches[0].clientY; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) { if (dx < 0) goTo(currentPage + 1); else goTo(currentPage - 1); }
    touchStartX.current = null; touchStartY.current = null;
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") goTo(currentPage + 1);
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") goTo(currentPage - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentPage, flip, goTo]);

  useEffect(() => () => clearTimeout(indicatorTimer.current), []);


  const renderPaper = (idx) => {
    const PageComp = PAGES[idx];
    return (
      <div style={{ position: "absolute", inset: 0, background: "var(--rw-app-bg)", overflow: "hidden" }}>
        {idx === 0 && (
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
            {Array.from({ length: 32 }).map((_, i) => <div key={i} style={{ position: "absolute", left: 0, right: 0, top: `${3 + i * 3.1}%`, height: "0.5px", background: "var(--rw-border)", opacity: 0.5 }} />)}
            <div style={{ position: "absolute", left: 44, top: 0, bottom: 0, width: "0.5px", background: "var(--rw-border)", opacity: 0.65 }} />
          </div>
        )}
        <div style={{ position: "relative", zIndex: 1, height: "100%" }}>
          <PageComp onNext={() => goTo(idx + 1)} onUploadClick={onUploadClick} />
        </div>
        <ProgressRibbon current={idx} total={PAGES.length} accentColor={PAGE_META[idx]?.accent} />
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 0, margin: 0 }}>
      <div style={{ position: "relative", flex: 1, width: "100%", minHeight: 0 }}
        onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>

        {/* Depth layers */}
        <div style={{ position: "absolute", inset: 0, transform: "translateX(6px) translateY(9px)", background: "var(--rw-border)", opacity: 0.35, filter: "blur(6px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, transform: "translateX(3px) translateY(4px)", background: "var(--rw-border)", opacity: 0.2, pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, background: "var(--rw-hover-bg)", border: "1px solid var(--rw-border)", transform: "translate(2px,2px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, background: "var(--rw-card-bg)", border: "1px solid var(--rw-border)", transform: "translate(1px,1px)", pointerEvents: "none" }} />

        {/* Book frame */}
        <div style={{ position: "absolute", inset: 0, border: "1px solid var(--rw-border)", overflow: "hidden", boxShadow: "inset 3px 0 6px rgba(0,0,0,.03)" }}>
          {renderPaper(flip ? flip.to : currentPage)}

          {flip && (
            <div style={{ position: "absolute", inset: 0, zIndex: 40, pointerEvents: "none", background: flip.dir === "next" ? "linear-gradient(to right,rgba(0,0,0,.18),rgba(0,0,0,0) 30%)" : "linear-gradient(to left,rgba(0,0,0,.18),rgba(0,0,0,0) 30%)", animation: `ambientShadowSweep ${FLIP_MS}ms ease forwards` }} />
          )}

          {flip && (
            <div style={{ position: "absolute", inset: 0, zIndex: 50, transformStyle: "preserve-3d", transformOrigin: flip.dir === "next" ? "right center" : "left center", animation: `${flip.dir === "next" ? "pageFlipNext" : "pageFlipPrev"} ${FLIP_MS}ms cubic-bezier(.45,.05,.55,.95) forwards` }}>
              <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden" }}>
                {renderPaper(flip.from)}
                <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: flip.dir === "next" ? "linear-gradient(to left,rgba(0,0,0,.22),rgba(0,0,0,0) 55%)" : "linear-gradient(to right,rgba(0,0,0,.22),rgba(0,0,0,0) 55%)", animation: `flipShadowSweep ${FLIP_MS}ms ease forwards` }} />
              </div>
              <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                {renderPaper(flip.to)}
                <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: flip.dir === "next" ? "linear-gradient(to right,rgba(0,0,0,.22),rgba(0,0,0,0) 55%)" : "linear-gradient(to left,rgba(0,0,0,.22),rgba(0,0,0,0) 55%)", animation: `flipShadowSweep ${FLIP_MS}ms ease forwards` }} />
              </div>
            </div>
          )}

          {/* Arrow nav */}
          {currentPage > 0 && (
            <div className="rw-zone-left" onClick={() => goTo(currentPage - 1)}>
              <div className="rw-arrow" style={{ background: "var(--rw-hover-bg)", color: T.textPrim }}>‹</div>
            </div>
          )}
          {currentPage < total - 1 && (
            <div className="rw-zone-right" onClick={() => goTo(currentPage + 1)}>
              <div className="rw-arrow" style={{ background: "var(--rw-hover-bg)", color: T.textPrim }}>›</div>
            </div>
          )}
        </div>

        {/* Page indicator */}
        <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", pointerEvents: "none", zIndex: 70, animation: showIndicator ? "indicatorFade 1.8s ease forwards" : "none", opacity: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 20, background: "var(--rw-hover-bg)", backdropFilter: "blur(6px)", border: "1px solid var(--rw-border)" }}>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, letterSpacing: ".06em", color: T.textSec }}>{currentPage + 1} / {total}</span>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, letterSpacing: ".04em", color: T.accent }}>{PAGE_META[currentPage]?.label}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   MOBILE CAROUSEL — horizontal swipe with spring spring spring
═══════════════════════════════════════════════════════════════════════════ */
const MobileCarousel = ({ onUploadClick }) => {
  const [current, setCurrent] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(null);
  const startY = useRef(null);
  const total = PAGES.length;
  const THRESHOLD = 48;

  const goTo = (idx) => {
    if (idx < 0 || idx >= total) return;
    setCurrent(idx);
    setDragX(0);
  };

  const onTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const onTouchMove = (e) => {
    if (startX.current === null) return;
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;
    // Only hijack horizontal swipes
    if (Math.abs(dx) > Math.abs(dy)) {
      // Rubber-band resistance at edges
      const atStart = current === 0 && dx > 0;
      const atEnd = current === total - 1 && dx < 0;
      const factor = atStart || atEnd ? 0.25 : 1;
      setDragX(dx * factor);
    }
  };

  const onTouchEnd = (e) => {
    if (startX.current === null) { setIsDragging(false); return; }
    const dx = e.changedTouches[0].clientX - startX.current;
    const dy = e.changedTouches[0].clientY - startY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > THRESHOLD) {
      if (dx < 0) goTo(current + 1);
      else goTo(current - 1);
    } else {
      setDragX(0);
    }
    startX.current = null;
    setIsDragging(false);
  };

  return (
    <div style={{ height: "100%", width: "100%", display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--rw-app-bg)" }}>
      {/* Global progress ribbon */}
      <ProgressRibbon current={current} total={total} accentColor={PAGE_META[current]?.accent} />

      {/* Sliding viewport */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}
        onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>

        {/* Render current ±1 for perf */}
        {PAGES.map((PageComp, idx) => {
          const visible = Math.abs(idx - current) <= 1;
          if (!visible) return null;
          const offset = (idx - current) * 100;
          const translateX = offset + (dragX / window.innerWidth) * 100;
          return (
            <div key={idx} style={{
              position: "absolute", inset: 0,
              transform: `translateX(${translateX}%)`,
              transition: isDragging ? "none" : "transform .42s cubic-bezier(.35,.9,.45,1)",
              willChange: "transform",
              background: "var(--rw-app-bg)",
              overflow: "hidden",
            }}>
              {/* Ruled paper lines only on first page */}
              {idx === 0 && (
                <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
                  {Array.from({ length: 28 }).map((_, i) => <div key={i} style={{ position: "absolute", left: 0, right: 0, top: `${4 + i * 3.5}%`, height: "0.5px", background: "var(--rw-border)", opacity: 0.45 }} />)}
                </div>
              )}
              <div style={{ position: "relative", zIndex: 1, height: "100%" }}>
                <PageComp onNext={() => goTo(idx + 1)} onUploadClick={onUploadClick} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom nav */}
      <BottomNav current={current} total={total} onGo={goTo} />
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   ROOT EXPORT
═══════════════════════════════════════════════════════════════════════════ */
const LandingContentWrapper = ({ onUploadClick }) => {
  const { isMobileOrSmaller } = useBreakpoints();

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      {isMobileOrSmaller
        ? <MobileCarousel onUploadClick={onUploadClick} />
        : (
          <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <BookContainer onUploadClick={onUploadClick} />
          </div>
        )
      }
    </>
  );
};

export default LandingContentWrapper;