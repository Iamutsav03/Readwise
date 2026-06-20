import { useState, useEffect, useRef, useCallback } from "react";
import { useBreakpoints } from "../hooks/useBreakpoints";
import { Search, BookOpen, Edit2, Star, MoreHorizontal, X, UploadCloud, ChevronLeft, ChevronRight, Maximize, Maximize2, ZoomOut, ZoomIn, Lock, Palette, Zap, Sparkles, FileText, Copy, Send, ClipboardList, Lightbulb, Target, Layers, MessageSquare } from "lucide-react";
import { BookmarkIcon as BookmarkOutline } from "@heroicons/react/24/outline";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,400;1,500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');`;

const S = {
  tag: { fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 500, color: "var(--rw-text-secondary)", textTransform: "uppercase", letterSpacing: "0.11em", margin: "0 0 5px" },
  h2: { fontFamily: "'Playfair Display',serif", fontSize: "clamp(15px,2vw,20px)", fontWeight: 600, color: "var(--rw-panel-bg)", margin: "0 0 4px", letterSpacing: "-0.02em" },
  sub: { fontFamily: "'DM Sans',sans-serif", fontSize: 11.5, color: "var(--rw-text-secondary)", margin: "0 0 12px", fontWeight: 300, lineHeight: 1.5 },
  pageNum: { position: "absolute", bottom: 14, right: 18, fontFamily: "'Playfair Display',serif", fontSize: 11, color: "var(--rw-text-secondary)", fontStyle: "italic", zIndex: 5 },
  wrap: { height: "100%", display: "flex", flexDirection: "column", padding: "20px 22px", position: "relative", overflow: "hidden" },
};

/* Slim integrated caption — replaces the old floating Explainer card */
const Caption = ({ eyebrow, points }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 12 }}>
    <p style={S.tag}>{eyebrow}</p>
    <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 14px" }}>
      {points.map((p, i) => (
        <span key={i} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10.5, color: "var(--rw-text-secondary)", display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--rw-accent)", display: "inline-block", flexShrink: 0 }} />
          {p}
        </span>
      ))}
    </div>
  </div>
);

/* ─── Page 1: Welcome ─────────────────────────────────────────────────────── */
const Page1 = ({ onNext }) => {
  const [v, setV] = useState(false);
  useEffect(() => { setTimeout(() => setV(true), 80); }, []);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 36px", textAlign: "center", position: "relative" }}>
      <div style={{ position: "absolute", top: 24, left: 32, width: 5, height: 5, borderRadius: "50%", background: "var(--rw-accent)", opacity: 0.4 }} />
      <div style={{ position: "absolute", bottom: 44, right: 40, width: 3, height: 3, borderRadius: "50%", background: "var(--rw-accent)", opacity: 0.5 }} />
      <div style={{ opacity: v ? 1 : 0, transform: v ? "translateY(0) scale(1)" : "translateY(14px) scale(0.93)", transition: "opacity 0.7s ease, transform 0.7s cubic-bezier(0.34,1.4,0.64,1)", marginBottom: 22 }}>
        <svg width="64" height="52" viewBox="0 0 72 58" fill="none">
          <rect x="8" y="6" width="25" height="46" rx="3" fill="#e8d4b4" stroke="var(--rw-accent)" strokeWidth="1" />
          <rect x="10" y="8" width="21" height="42" rx="2" fill="#f5ede0" />
          <line x1="14" y1="16" x2="27" y2="16" stroke="var(--rw-accent)" strokeWidth="1" strokeLinecap="round" />
          <line x1="14" y1="21" x2="27" y2="21" stroke="var(--rw-accent)" strokeWidth="1" strokeLinecap="round" />
          <line x1="14" y1="26" x2="23" y2="26" stroke="var(--rw-accent)" strokeWidth="1" strokeLinecap="round" />
          <rect x="34" y="6" width="30" height="46" rx="3" fill="#dfc9a5" stroke="var(--rw-accent)" strokeWidth="1" />
          <rect x="36" y="8" width="26" height="42" rx="2" fill="#faf3e8" />
          <line x1="40" y1="16" x2="57" y2="16" stroke="var(--rw-accent)" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="40" y1="21" x2="57" y2="21" stroke="var(--rw-accent)" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="40" y1="26" x2="52" y2="26" stroke="var(--rw-accent)" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="49" cy="50" r="3" fill="var(--rw-accent)" opacity="0.6" />
        </svg>
      </div>
      <div style={{ opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(10px)", transition: "opacity 0.65s ease 0.18s, transform 0.65s ease 0.18s" }}>
        <p style={S.tag}>ReadWise · AI Reading Platform</p>
        <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: "clamp(22px,3vw,34px)", fontWeight: 700, color: "var(--rw-panel-bg)", lineHeight: 1.15, letterSpacing: "-0.03em", margin: "0 0 10px" }}>
          Reading should feel<br /><em style={{ color: "var(--rw-accent)", fontStyle: "italic" }}>effortless.</em>
        </h1>
        <p style={{ ...S.sub, maxWidth: 290, margin: "0 auto 22px" }}>One tool. Every feature you need to read, understand, and remember.</p>
        <button onClick={onNext} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 20px", background: "var(--rw-panel-bg)", color: "var(--rw-text-primary)", border: "none", borderRadius: 10, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 500, letterSpacing: "0.03em", transition: "all 0.2s ease" }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}>
          See the features <span style={{ fontSize: 15 }}>→</span>
        </button>
      </div>
      <div style={S.pageNum}>1</div>
    </div>
  );
};

/* ─── Page 2: Document Library ───────────────────────────────────────────── */
const Page2 = () => {
  const { isMobileOrSmaller } = useBreakpoints();
  const [docs, setDocs] = useState([
    { id: 1, name: "Deep Work", fav: true, pct: 78, page: 187, total: 240, lastOpened: "2h ago" },
    { id: 2, name: "System Design Interview", fav: false, pct: 34, page: 82, total: 241, lastOpened: "Yesterday" },
    { id: 3, name: "The Almanack of Naval", fav: false, pct: 92, page: 218, total: 237, lastOpened: "3d ago" },
  ]);
  const [focusedId, setFocusedId] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [renameVal, setRenameVal] = useState("");
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [hint, setHint] = useState(null);
  const longPressTimer = useRef(null);

  const showHint = (msg) => { setHint(msg); setTimeout(() => setHint(null), 2200); };

  const toggleFav = (id, e) => {
    e.stopPropagation();
    setDocs(p => p.map(d => d.id === id ? { ...d, fav: !d.fav } : d));
    showHint("Favorite toggled");
  };
  const startRename = (doc, e) => { if (e) e.stopPropagation(); setRenamingId(doc.id); setRenameVal(doc.name); };
  const commitRename = () => {
    if (renameVal.trim()) setDocs(p => p.map(d => d.id === renamingId ? { ...d, name: renameVal.trim() } : d));
    setRenamingId(null);
    showHint("Document renamed");
  };
  const handleDelete = (id, e) => {
    e.stopPropagation();
    setDocs(p => p.filter(d => d.id !== id));
    setMenuOpenId(null);
    showHint("Document deleted");
  };
  
  const handleRowClick = (doc, e) => {
    if (renamingId === doc.id) return;
    if (e.detail === 3 && !isMobileOrSmaller) { startRename(doc); }
    else if (e.detail === 2 && !isMobileOrSmaller) { showHint("Opening document…"); }
    else { setFocusedId(doc.id); }
  };

  const handleTouchStart = (doc) => {
    longPressTimer.current = setTimeout(() => {
      startRename(doc);
    }, 500);
  };
  
  const handleTouchEndOrMove = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const filteredDocs = docs.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const rowStyle = (doc) => ({
    display: "flex", alignItems: "center", gap: isMobileOrSmaller ? 14 : 10, padding: isMobileOrSmaller ? "12px 14px" : "8px 10px", borderRadius: 9,
    cursor: "pointer", transition: "background 0.15s, transform 0.1s",
    background: focusedId === doc.id ? "rgba(184,150,106,0.12)" : "transparent",
    position: "relative",
  });

  const bodyFontSize = isMobileOrSmaller ? 14.5 : 13;
  const subFontSize = isMobileOrSmaller ? 12 : 11;
  const iconSize = isMobileOrSmaller ? 18 : 14;

  return (
    <div style={{ ...S.wrap, padding: isMobileOrSmaller ? "18px 16px" : "18px 20px" }}>
      <Caption eyebrow="Feature · Library" points={["Drag & drop upload", "Auto-tracked progress", "Instant search"]} />
      <h2 style={{...S.h2, fontSize: isMobileOrSmaller ? 24 : S.h2.fontSize}}>Your document library.</h2>
      <p style={{...S.sub, fontSize: isMobileOrSmaller ? 13 : S.sub.fontSize}}>Pick up exactly where you left off.</p>

      <div
        style={{ background: "rgba(200,164,106,0.11)", border: "1px solid var(--rw-border)", borderRadius: 10, padding: "12px", marginBottom: 10, display: "flex", flexDirection: "column", gap: 8, cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s" }}
        onClick={() => showHint("Opening document…")} className="demo-continue-card">
        <style>{`.demo-continue-card:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }`}</style>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ margin: 0, fontSize: isMobileOrSmaller ? 11 : 10, fontWeight: 600, color: "var(--rw-accent)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Continue Reading</p>
            <p style={{ margin: "2px 0 0", fontSize: isMobileOrSmaller ? 15 : 13.5, fontWeight: 600, color: "var(--rw-panel-bg)", fontFamily: "'Playfair Display',serif" }}>Deep Work</p>
          </div>
          <p style={{ margin: 0, fontSize: subFontSize, color: "#8a7a60", fontStyle: "italic", fontFamily: "'DM Sans',sans-serif" }}>2h ago</p>
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 4 }}>
            <p style={{ margin: 0, fontSize: subFontSize, color: "#8a7a60", fontFamily: "'DM Sans',sans-serif" }}>Page 187 / 240</p>
            <p style={{ margin: 0, fontSize: subFontSize, color: "var(--rw-accent)", fontWeight: 500, fontFamily: "'DM Sans',sans-serif" }}>78%</p>
          </div>
          <div style={{ width: "100%", height: 3, background: "rgba(184,150,106,0.2)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ width: "78%", height: "100%", background: "var(--rw-accent)", borderRadius: 2 }} />
          </div>
        </div>
      </div>

      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); showHint("PDF uploading…"); }}
        style={{ border: `1.5px dashed ${dragOver ? "var(--rw-accent)" : "var(--rw-border)"}`, borderRadius: 10, padding: isMobileOrSmaller ? "14px" : "11px", marginBottom: 10, display: "flex", alignItems: "center", gap: 10, background: dragOver ? "rgba(200,164,106,0.08)" : "var(--rw-card-bg)", cursor: "pointer", transition: "all 0.2s" }}
        onClick={() => showHint("Opening file picker…")}>
        <div style={{ background: "var(--rw-accent)", color: "var(--rw-panel-bg)", padding: 6, borderRadius: 6, display: "flex" }}><UploadCloud size={isMobileOrSmaller ? 20 : 16} /></div>
        <div>
          <p style={{ margin: 0, fontFamily: "'DM Sans',sans-serif", fontSize: bodyFontSize, fontWeight: 500, color: "var(--rw-panel-bg)" }}>Upload PDF</p>
          <p style={{ margin: 0, fontFamily: "'DM Sans',sans-serif", fontSize: subFontSize, color: "#8a7a60" }}>{isMobileOrSmaller ? "Tap to browse" : "Drag & drop or click to browse"}</p>
        </div>
      </div>

      <div style={{ position: "relative", marginBottom: 9 }}>
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#8a7a60", display: "flex" }}><Search size={isMobileOrSmaller ? 16 : 13} /></span>
        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search PDFs…"
          style={{ width: "100%", padding: isMobileOrSmaller ? "10px 10px 10px 36px" : "7px 10px 7px 30px", fontSize: bodyFontSize, fontFamily: "'DM Sans', sans-serif", color: "var(--rw-panel-bg)", background: "#faf3e8", border: "1px solid var(--rw-border)", borderRadius: 8, outline: "none", boxSizing: "border-box" }} />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "rgba(184,150,106,0.15)", border: "none", borderRadius: "50%", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#8a7a60" }}><X size={14} /></button>
        )}
      </div>

      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: isMobileOrSmaller ? 10.5 : 9.5, color: "var(--rw-text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px 6px" }}>Recent</p>

      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", paddingBottom: 8 }}>
        <style>{`
          .demo-row:hover { background: rgba(184,150,106,0.06); }
          .demo-row-actions { opacity: 0; pointer-events: none; display: flex; gap: 4px; transition: opacity 0.15s; }
          .demo-row:hover .demo-row-actions, .demo-row.focused .demo-row-actions { opacity: 1; pointer-events: auto; }
          .demo-btn { width: 32px; height: 32px; border: none; border-radius: 6px; background: transparent; color: #8a7a60; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
          .demo-btn:hover { background: rgba(184,150,106,0.15); color: var(--rw-panel-bg); }
          .demo-btn.star.active { color: var(--rw-accent); }
          .demo-thumbnail { width: 34px; height: 42px; background: #fff; border-radius: 4px; position: relative; overflow: hidden; border: 1px solid rgba(0,0,0,0.1); flex-shrink: 0; }
          .demo-thumbnail-inner { position: absolute; top: 4px; left: 4px; right: 4px; display: flex; flex-direction: column; gap: 3px; }
          .demo-line { height: 2px; background: #e0e0e0; border-radius: 1px; }
        `}</style>
        {filteredDocs.map(doc => (
          <div key={doc.id} className={`demo-row ${focusedId === doc.id ? "focused" : ""}`} style={rowStyle(doc)} onClick={e => handleRowClick(doc, e)}
            onTouchStart={() => isMobileOrSmaller && handleTouchStart(doc)} onTouchEnd={handleTouchEndOrMove} onTouchMove={handleTouchEndOrMove}>
            <div className="demo-thumbnail">
              <div className="demo-thumbnail-inner">
                <div className="demo-line" style={{ width: "80%" }} /><div className="demo-line" style={{ width: "90%" }} /><div className="demo-line" style={{ width: "60%" }} />
                <div className="demo-line" style={{ width: "85%", marginTop: 4 }} /><div className="demo-line" style={{ width: "75%" }} />
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              {renamingId === doc.id ? (
                <input value={renameVal} onChange={e => setRenameVal(e.target.value)} onBlur={commitRename} onKeyDown={e => e.key === "Enter" && commitRename()} autoFocus
                  style={{ width: "100%", fontSize: bodyFontSize, fontFamily: "'DM Sans',sans-serif", color: "var(--rw-panel-bg)", background: "#faf3e8", border: "1.5px solid var(--rw-accent)", borderRadius: 5, padding: "2px 6px", outline: "none" }}
                  onClick={e => e.stopPropagation()} />
              ) : (
                <p style={{ margin: 0, fontSize: bodyFontSize, fontWeight: 500, color: "var(--rw-panel-bg)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: "'DM Sans',sans-serif" }} title={doc.name}>{doc.name}</p>
              )}
              <p style={{ margin: "2px 0 0", fontSize: subFontSize, color: "#8a7a60", fontFamily: "'DM Sans',sans-serif" }}>Page {doc.page} / {doc.total}</p>
              <p style={{ margin: "1px 0 0", fontSize: subFontSize - 1, color: "rgba(138,122,96,0.7)", fontStyle: "italic", fontFamily: "'DM Sans',sans-serif" }}>{doc.lastOpened}</p>
            </div>
            <div className="demo-row-actions" onClick={e => e.stopPropagation()} style={isMobileOrSmaller ? { opacity: 1, pointerEvents: "auto", gap: 0 } : {}}>
              <button className="demo-btn" title="Open" onClick={() => showHint("Opening document…")}><BookOpen size={iconSize} /></button>
              <button className="demo-btn" title="Rename" onClick={e => startRename(doc, e)}><Edit2 size={iconSize} /></button>
              <button className={`demo-btn star ${doc.fav ? "active" : ""}`} onClick={e => toggleFav(doc.id, e)}><Star size={iconSize} fill={doc.fav ? "currentColor" : "none"} /></button>
              <div style={{ position: "relative" }}>
                <button className="demo-btn" onClick={() => setMenuOpenId(menuOpenId === doc.id ? null : doc.id)}><MoreHorizontal size={iconSize} /></button>
                {menuOpenId === doc.id && (
                  <div style={{ position: "absolute", right: 0, top: "100%", marginTop: 4, background: "var(--rw-card-bg)", border: "1px solid var(--rw-border)", borderRadius: 8, padding: 4, zIndex: 10, minWidth: 80 }}>
                    <button onClick={e => handleDelete(doc.id, e)} style={{ width: "100%", textAlign: "left", padding: "8px 12px", background: "transparent", border: "none", borderRadius: 5, cursor: "pointer", fontSize: bodyFontSize, color: "#e07060" }}>Delete</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: "var(--rw-accent)", margin: "4px 0 0", textAlign: "center", fontStyle: "italic", minHeight: 14 }}>
        {hint || (isMobileOrSmaller ? "Tap to open · Long-press to rename" : "Click: select · Double-click: open · Triple-click: rename")}
      </p>
      <div style={S.pageNum}>2</div>
    </div>
  );
};

/* ─── Page 3: PDF Reader ──────────────────────────────────────────────────── */
const Page3 = () => {
  const { isMobileOrSmaller } = useBreakpoints();
  const [scale, setScale] = useState(100);
  const [fitMode, setFitMode] = useState("page");
  const [page, setPage] = useState(187);
  const [focusMode, setFocusMode] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [toast, setToast] = useState(null);
  const totalPages = 240;

  const flashToast = (label) => { setToast(label); setTimeout(() => setToast(null), 1100); };
  const changeZoom = (delta) => { setFitMode(null); setScale(s => Math.max(50, Math.min(1500, s + delta))); };
  const setFit = (mode) => { setFitMode(mode); flashToast(mode === "width" ? "Fit Width" : "Fit Page"); };
  const nav = (dir) => { setPage(p => Math.max(1, Math.min(totalPages, p + (dir === "next" ? 1 : -1)))); };

  const pageBoxStyle = fitMode === "width"
    ? { width: "92%", height: "70%" }
    : fitMode === "page"
      ? { width: "52%", height: "88%" }
      : { width: `${52 * (scale / 100)}%`, height: `${88 * (scale / 100)}%`, maxWidth: "98%", maxHeight: "95%" };

  const iconSize = isMobileOrSmaller ? 18 : 15;
  const btnSize = isMobileOrSmaller ? 40 : 30;

  return (
    <div style={{ ...S.wrap, padding: isMobileOrSmaller ? "18px 16px 0" : "18px 20px 0" }}>
      <Caption eyebrow="Feature · Reader" points={["Smooth page transitions", "Zoom 50%–1500%", "Focus mode"]} />
      <div style={{ flex: 1, position: "relative", background: focusMode ? "#1c1c1c" : "#f9f9f9", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", margin: isMobileOrSmaller ? "0 -16px" : "0 -22px", overflow: "hidden", transition: "background 0.3s ease" }}>
        <div style={{ ...pageBoxStyle, background: "#fff", boxShadow: focusMode ? "0 8px 32px rgba(0,0,0,0.4)" : "0 4px 20px rgba(0,0,0,0.06)", border: "1px solid #e0e0e0", borderRadius: 4, display: "flex", flexDirection: "column", padding: "9% 8%", transition: "all 0.32s cubic-bezier(0.4,0,0.2,1)", position: "relative" }}>
          <div style={{ width: "40%", height: isMobileOrSmaller ? 10 : 14, background: "#e0e0e0", marginBottom: isMobileOrSmaller ? 12 : 18, borderRadius: 2 }} />
          {[100, 95, 100, 80, 100, 92].map((w, i) => <div key={i} style={{ width: `${w}%`, height: isMobileOrSmaller ? 5 : 7, background: i === 2 ? "rgba(255,200,60,0.55)" : "#f0f0f0", marginBottom: isMobileOrSmaller ? 7 : 9, borderRadius: 2 }} />)}
          <span style={{ position: "absolute", bottom: 10, right: 14, fontFamily: "'Playfair Display',serif", fontSize: 10, color: "#9a9a9a", fontStyle: "italic" }}>{page}</span>
        </div>
        {toast && (
          <div style={{ position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.78)", color: "#fff", padding: "8px 16px", borderRadius: 20, fontSize: isMobileOrSmaller ? 13 : 11.5, fontFamily: "'DM Sans', sans-serif", animation: "noteIn 0.18s ease" }}>{toast}</div>
        )}
        {focusMode && isMobileOrSmaller && (
           <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)" }}>
             <button onClick={() => { setFocusMode(false); flashToast("Focus mode off"); }} style={{ padding: "10px 20px", borderRadius: 20, background: "rgba(255,255,255,0.15)", color: "#fff", border: "none", fontSize: 13, backdropFilter: "blur(4px)", display: "flex", alignItems: "center", gap: 6 }}><Lock size={16} /> Exit Focus</button>
           </div>
        )}
      </div>

      <div style={{ flexShrink: 0, margin: isMobileOrSmaller ? "0 -16px" : "0 -22px" }}>
        <style>{`
          .demo-icon-btn { width: ${btnSize}px; height: ${btnSize}px; border-radius: 7px; border: 1px solid rgba(0,0,0,0.05); background: transparent; color: var(--rw-text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
          .demo-icon-btn:hover { background: rgba(0,0,0,0.05); color: var(--rw-panel-bg); }
          .demo-icon-btn.on { background: var(--rw-panel-bg); color: var(--rw-text-primary); }
        `}</style>
        <div style={{ height: 3, width: "100%", background: "var(--rw-border)" }}>
          <div style={{ height: "100%", width: `${(page / totalPages) * 100}%`, background: "var(--rw-accent)", transition: "width 0.3s" }} />
        </div>
        
        {isMobileOrSmaller ? (
          <div style={{ display: "flex", flexDirection: "column", background: "var(--rw-toolbar-bg)", borderTop: "1px solid var(--rw-border)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 12px", borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
               <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                 <button className="demo-icon-btn" onClick={() => nav("prev")}><ChevronLeft size={iconSize} /></button>
                 <div style={{ background: "transparent", border: "1px solid var(--rw-border)", color: "var(--rw-panel-bg)", padding: "4px 8px", borderRadius: 6, fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>{page} / {totalPages}</div>
                 <button className="demo-icon-btn" onClick={() => nav("next")}><ChevronRight size={iconSize} /></button>
               </div>
               <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                 <button className="demo-icon-btn" onClick={() => changeZoom(-25)}><ZoomOut size={iconSize} /></button>
                 <span style={{ fontSize: 13, color: "var(--rw-text-secondary)", minWidth: 42, textAlign: "center", fontFamily: "'DM Sans', sans-serif" }}>{fitMode ? (fitMode === "page" ? "Fit" : "Wide") : `${scale}%`}</span>
                 <button className="demo-icon-btn" onClick={() => changeZoom(25)}><ZoomIn size={iconSize} /></button>
               </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", padding: "6px 12px" }}>
               <button className={`demo-icon-btn ${fitMode === "page" ? "on" : ""}`} onClick={() => setFit("page")}><Maximize2 size={iconSize} /></button>
               <button className={`demo-icon-btn ${fitMode === "width" ? "on" : ""}`} onClick={() => setFit("width")}><Maximize size={iconSize} /></button>
               <div style={{ width: 1, height: 20, background: "var(--rw-border)", margin: "0 2px" }} />
               <button className={`demo-icon-btn ${bookmarked ? "on" : ""}`} onClick={() => { setBookmarked(b => !b); flashToast(bookmarked ? "Bookmark removed" : "Bookmarked"); }}><BookmarkOutline style={{ width: iconSize, height: iconSize }} /></button>
               <button className={`demo-icon-btn ${focusMode ? "on" : ""}`} onClick={() => { setFocusMode(f => !f); flashToast(focusMode ? "Focus mode off" : "Focus mode on"); }}><Lock size={iconSize} /></button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", height: 54, background: "var(--rw-toolbar-bg)", borderTop: "1px solid var(--rw-border)", gap: 6, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <button className="demo-icon-btn" onClick={() => nav("prev")}><ChevronLeft size={16} /></button>
              <div style={{ background: "transparent", border: "1px solid var(--rw-border)", color: "var(--rw-panel-bg)", padding: "2px 8px", borderRadius: 6, fontSize: 12.5, fontFamily: "'DM Sans', sans-serif" }}>{page} / {totalPages}</div>
              <button className="demo-icon-btn" onClick={() => nav("next")}><ChevronRight size={16} /></button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <button className={`demo-icon-btn ${fitMode === "page" ? "on" : ""}`} onClick={() => setFit("page")}><Maximize2 size={15} /></button>
              <button className={`demo-icon-btn ${fitMode === "width" ? "on" : ""}`} onClick={() => setFit("width")}><Maximize size={15} /></button>
              <div style={{ width: 1, height: 20, background: "var(--rw-border)", margin: "0 2px" }} />
              <button className="demo-icon-btn" onClick={() => changeZoom(-25)}><ZoomOut size={15} /></button>
              <span style={{ fontSize: 11.5, color: "var(--rw-text-secondary)", minWidth: 38, textAlign: "center", fontFamily: "'DM Sans', sans-serif" }}>{fitMode ? (fitMode === "page" ? "Fit" : "Wide") : `${scale}%`}</span>
              <button className="demo-icon-btn" onClick={() => changeZoom(25)}><ZoomIn size={15} /></button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <button className={`demo-icon-btn ${bookmarked ? "on" : ""}`} onClick={() => { setBookmarked(b => !b); flashToast(bookmarked ? "Bookmark removed" : "Bookmarked"); }}><BookmarkOutline style={{ width: 15, height: 15 }} /></button>
              <button className={`demo-icon-btn ${focusMode ? "on" : ""}`} onClick={() => { setFocusMode(f => !f); flashToast(focusMode ? "Focus mode off" : "Focus mode on"); }}><Lock size={15} /></button>
            </div>
          </div>
        )}
      </div>
      <div style={S.pageNum}>3</div>
    </div>
  );
};

/* ─── Page 4: Text Selection ─────────────────────────────────────────────── */
const Page4 = () => {
  const { isMobileOrSmaller } = useBreakpoints();
  const [actionLabel, setActionLabel] = useState(null);
  const containerRef = useRef(null);
  const [toolbarPos, setToolbarPos] = useState({ top: -52, flip: false });

  const showAction = (label) => { setActionLabel(label); setTimeout(() => setActionLabel(null), 2200); };

  useEffect(() => {
    if (isMobileOrSmaller && containerRef.current) {
      // Check if there is enough space above the text
      const rect = containerRef.current.getBoundingClientRect();
      // A quick heuristic: if the top is too close to the screen edge, flip it below
      if (rect.top < 100) {
        setToolbarPos({ top: "100%", marginTop: 12, flip: true });
      } else {
        setToolbarPos({ top: -56, marginTop: 0, flip: false });
      }
    } else {
      setToolbarPos({ top: -52, marginTop: 0, flip: false });
    }
  }, [isMobileOrSmaller]);

  const btnSize = isMobileOrSmaller ? 40 : 30;
  const iconSize = isMobileOrSmaller ? 18 : 15;

  return (
    <div style={{ ...S.wrap, padding: isMobileOrSmaller ? "18px 16px" : "18px 20px" }}>
      <Caption eyebrow="Feature · Selection" points={["Quick & Deep Explain", "Instant definitions", "One-click summary"]} />
      <div style={{ flex: 1, background: "#f9f9f9", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", margin: isMobileOrSmaller ? "0 -16px" : "0 -22px" }}>
        <style>{`
          .demo-sel-btn { width: ${btnSize}px; height: ${btnSize}px; border-radius: 8px; border: none; background: transparent; color: var(--rw-text-primary); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.13s, transform 0.1s; }
          .demo-sel-btn:hover { background: var(--rw-hover-bg); transform: scale(1.1); }
        `}</style>
        <div style={{ width: "82%", maxWidth: 480, background: "#fff", padding: isMobileOrSmaller ? "20px" : "30px 32px", borderRadius: 8, boxShadow: "0 4px 20px rgba(0,0,0,0.05)", position: "relative", border: "1px solid #eaeaea" }}>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobileOrSmaller ? 16 : 14.5, color: "var(--rw-panel-bg)", lineHeight: 1.8, margin: 0 }}>
            Reading complex documents is difficult. Select any text to instantly unlock understanding.
            <br /><br />
            <span ref={containerRef} style={{ background: "rgba(184,150,106,0.25)", position: "relative", borderRadius: 2, padding: "2px 0" }}>
              This makes processing academic papers effortless.
              <div style={{ position: "absolute", top: toolbarPos.top, marginTop: toolbarPos.marginTop, left: "50%", transform: "translateX(-50%)", display: "flex", gap: isMobileOrSmaller ? "4px" : "2px", padding: "5px", background: "var(--rw-card-bg)", border: "1px solid var(--rw-border-strong)", borderRadius: "12px", boxShadow: "0 8px 28px rgba(0,0,0,0.18)", alignItems: "center", zIndex: 100, flexWrap: isMobileOrSmaller ? "wrap" : "nowrap", justifyContent: "center", width: isMobileOrSmaller ? 240 : "auto" }}>
                <button className="demo-sel-btn" onClick={() => showAction("Highlight applied")}><Palette size={iconSize} /></button>
                <div style={{ width: 1, height: 18, background: "var(--rw-border-strong)", margin: "0 2px" }} />
                <button className="demo-sel-btn" title="Meaning" onClick={() => showAction("Definition shown")}><BookOpen size={iconSize} /></button>
                <button className="demo-sel-btn" title="Quick Explain" onClick={() => showAction("Quick Explain")}><Zap size={iconSize} /></button>
                <button className="demo-sel-btn" title="Deep Explain" onClick={() => showAction("Deep Explain")}><Sparkles size={iconSize} /></button>
                <button className="demo-sel-btn" title="Summarise" onClick={() => showAction("Summary generated")}><FileText size={iconSize} /></button>
                <div style={{ width: 1, height: 18, background: "var(--rw-border-strong)", margin: "0 2px" }} />
                <button className="demo-sel-btn" onClick={() => showAction("Text copied")}><Copy size={iconSize} /></button>
              </div>
            </span>
          </p>
          <div style={{ position: "absolute", bottom: -44, left: "50%", transform: "translateX(-50%)", background: "var(--rw-accent)", color: "var(--rw-panel-bg)", padding: isMobileOrSmaller ? "8px 20px" : "6px 16px", borderRadius: 20, fontSize: isMobileOrSmaller ? 14 : 12.5, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, whiteSpace: "nowrap", boxShadow: "0 4px 14px rgba(0,0,0,0.15)", opacity: actionLabel ? 1 : 0, transition: "opacity 0.3s", pointerEvents: "none" }}>
            {actionLabel}
          </div>
        </div>
      </div>
      <div style={S.pageNum}>4</div>
    </div>
  );
};

/* ─── Page 5: AI Chat ────────────────────────────────────────────────────── */
const Page5 = () => {
  const { isMobileOrSmaller } = useBreakpoints();
  const [inputVal, setInputVal] = useState("");
  const [messages, setMessages] = useState([{ type: "user", text: "What is the main idea?" }, { type: "ai", text: "Focused, distraction-free work is rare — and increasingly valuable." }]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const simulateSend = (text) => {
    if (!text) return;
    setMessages(prev => [...prev, { type: "user", text }]);
    setInputVal("");
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { type: "ai", text: "Based on the document, this refers to eliminating shallow distractions to reach peak cognitive output." }]);
    }, 1300);
  };

  const bodyFontSize = isMobileOrSmaller ? 14 : 12.5;

  return (
    <div style={{ ...S.wrap, padding: isMobileOrSmaller ? "18px 16px 0" : "18px 20px 0", background: "var(--rw-panel-bg)" }}>
      <p style={S.tag}>Feature · AI Chat</p>
      <h2 style={{ ...S.h2, color: "var(--rw-text-primary)", fontSize: isMobileOrSmaller ? 24 : S.h2.fontSize }}>Your PDF answers back.</h2>
      <p style={{ ...S.sub, color: "rgba(255,255,255,0.45)", fontSize: isMobileOrSmaller ? 13 : S.sub.fontSize }}>RAG-powered answers, grounded in your document.</p>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14, overflowY: "auto", margin: "0 -2px", paddingBottom: 10 }}>
        {messages.length === 0 && !isTyping && (
          <div style={{ textAlign: "center", marginTop: 30 }}>
            <Sparkles size={isMobileOrSmaller ? 26 : 22} color="var(--rw-accent)" style={{ marginBottom: 8 }} />
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: bodyFontSize, color: "var(--rw-text-primary)", fontWeight: 600 }}>Try asking:</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.type === "user" ? "flex-end" : "flex-start", gap: 8 }}>
            {m.type === "ai" && <div style={{ width: isMobileOrSmaller ? 30 : 24, height: isMobileOrSmaller ? 30 : 24, borderRadius: "50%", background: "linear-gradient(135deg, var(--rw-hover-bg), var(--rw-border))", border: "1px solid var(--rw-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--rw-accent)", flexShrink: 0 }}><Sparkles size={isMobileOrSmaller ? 16 : 12} /></div>}
            <div style={{ background: "var(--rw-card-bg)", border: m.type === "user" ? "1px solid var(--rw-border)" : "1px solid var(--rw-hover-bg)", padding: isMobileOrSmaller ? "12px 16px" : "9px 13px", borderRadius: m.type === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px", maxWidth: "85%" }}>
              <p style={{ margin: 0, fontFamily: "'DM Sans', sans-serif", fontSize: bodyFontSize, color: "var(--rw-text-primary)", lineHeight: 1.6 }}>{m.text}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ width: isMobileOrSmaller ? 30 : 24, height: isMobileOrSmaller ? 30 : 24, borderRadius: "50%", border: "1px solid var(--rw-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--rw-accent)" }}><Sparkles size={isMobileOrSmaller ? 16 : 12} /></div>
            <div style={{ fontSize: bodyFontSize, color: "var(--rw-accent)", fontFamily: "'DM Sans', sans-serif", fontStyle: "italic", alignSelf: "center" }}>Thinking…</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ padding: "10px 0 14px" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", background: "var(--rw-card-bg)", border: "1px solid var(--rw-border)", borderRadius: 10, padding: isMobileOrSmaller ? "10px 12px" : "7px 9px" }}>
          <input type="text" value={inputVal} onChange={e => setInputVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && simulateSend(inputVal)} placeholder="Ask anything about this PDF…"
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontFamily: "'DM Sans', sans-serif", fontSize: bodyFontSize, color: "var(--rw-text-primary)" }} />
          <button onClick={() => simulateSend(inputVal)} style={{ width: isMobileOrSmaller ? 38 : 28, height: isMobileOrSmaller ? 38 : 28, borderRadius: 8, background: "var(--rw-hover-bg)", border: "none", color: "var(--rw-text-muted)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Send size={isMobileOrSmaller ? 18 : 14} /></button>
        </div>
      </div>
      <div style={S.pageNum}>5</div>
    </div>
  );
};

/* ─── Page 6: Study Tools ────────────────────────────────────────────────── */
const STUDY_OUTPUT = {
  summary: { body: "Deep Work argues that distraction-free concentration is increasingly rare — and increasingly valuable. Cultivating it is a competitive advantage." },
  concepts: { items: ["Deep Work — focused, undistracted cognitive effort", "Attention Residue — the cost of switching tasks", "Fixed-Schedule Productivity — work backward from a hard stop"] },
  interview: { items: ["How does deep work differ from working long hours?", "What is attention residue and why does it matter?"] },
  flashcards: { cards: [{ q: "What is Deep Work?", a: "Focused, distraction-free professional activity." }, { q: "What is Attention Residue?", a: "Cognitive cost from switching tasks too often." }] },
};

const Page6 = () => {
  const { isMobileOrSmaller } = useBreakpoints();
  const [activeTool, setActiveTool] = useState("interview");
  const [scope, setScope] = useState("current");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState(null);
  const [flipped, setFlipped] = useState({});

  const simulateGenerate = () => {
    setLoading(true); setOutput(null);
    setTimeout(() => { setLoading(false); setOutput(activeTool); }, 1400);
  };

  const tools = [
    { id: "summary", icon: ClipboardList, label: "Summarize", desc: "Key points & notes" },
    { id: "concepts", icon: Lightbulb, label: "Key Concepts", desc: "Ideas explained" },
    { id: "interview", icon: Target, label: "Interview Qs", desc: "Q&A for exam prep" },
    { id: "flashcards", icon: Layers, label: "Flashcards", desc: "Revision cards" },
  ];

  const out = output ? STUDY_OUTPUT[output] : null;
  const bodyFontSize = isMobileOrSmaller ? 13 : 11.5;

  return (
    <div style={{ ...S.wrap, padding: isMobileOrSmaller ? "18px 16px 0" : "18px 20px 0", background: "var(--rw-panel-bg)" }}>
      <p style={S.tag}>Feature · Study Tools</p>
      <h2 style={{ ...S.h2, color: "var(--rw-text-primary)", fontSize: isMobileOrSmaller ? 24 : S.h2.fontSize }}>Study smarter, not harder.</h2>
      <p style={{ ...S.sub, color: "rgba(255,255,255,0.45)", fontSize: isMobileOrSmaller ? 13 : S.sub.fontSize }}>Choose a tool, pick a scope, generate instantly.</p>

      <style>{`
        .demo-study-tool { background: var(--rw-card-bg); border: 1px solid var(--rw-border); border-radius: 8px; padding: 10px 8px; cursor: pointer; text-align: left; transition: all 0.2s; }
        .demo-study-tool:hover { transform: translateY(-2px); }
        .demo-study-tool.active { background: var(--rw-accent-muted); border-color: var(--rw-border-strong); }
        .demo-flip-card { perspective: 800px; cursor: pointer; height: ${isMobileOrSmaller ? 64 : 56}px; touch-action: manipulation; }
        .demo-flip-inner { position: relative; width: 100%; height: 100%; transition: transform 0.5s; transform-style: preserve-3d; }
        .demo-flip-card.is-flipped .demo-flip-inner { transform: rotateY(180deg); }
        .demo-flip-face { position: absolute; inset: 0; backface-visibility: hidden; display: flex; align-items: center; padding: 8px 11px; border-radius: 8px; }
        .demo-flip-back { transform: rotateY(180deg); }
      `}</style>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: isMobileOrSmaller ? 12 : 8, fontFamily: "'DM Sans', sans-serif" }}>
        {tools.map(t => (
          <div key={t.id} className={`demo-study-tool ${activeTool === t.id ? "active" : ""}`} onClick={() => { setActiveTool(t.id); setOutput(null); }}>
            <t.icon size={isMobileOrSmaller ? 20 : 16} color="var(--rw-accent)" style={{ marginBottom: 5 }} />
            <p style={{ margin: 0, fontSize: isMobileOrSmaller ? 13 : 11.5, fontWeight: 600, color: "var(--rw-text-primary)" }}>{t.label}</p>
            <p style={{ margin: 0, fontSize: isMobileOrSmaller ? 11 : 9.5, color: "var(--rw-text-muted)" }}>{t.desc}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 6, margin: "10px 0" }}>
        {[{ id: "current", l: "Current page" }, { id: "chapter", l: "Chapter" }].map(s => (
          <button key={s.id} onClick={() => setScope(s.id)} style={{ flex: 1, padding: isMobileOrSmaller ? "10px" : "6px", background: scope === s.id ? "var(--rw-accent)" : "var(--rw-hover-bg)", color: scope === s.id ? "var(--rw-panel-bg)" : "var(--rw-text-primary)", border: "none", borderRadius: 7, fontSize: isMobileOrSmaller ? 12 : 10.5, fontWeight: scope === s.id ? 600 : 400, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", touchAction: "manipulation" }}>{s.l}</button>
        ))}
      </div>

      <button onClick={simulateGenerate} disabled={loading} style={{ width: "100%", padding: isMobileOrSmaller ? "14px" : "10px", background: "linear-gradient(135deg, var(--rw-accent), #d9a05b)", color: "var(--rw-panel-bg)", border: "none", borderRadius: 8, fontSize: isMobileOrSmaller ? 14 : 12.5, fontWeight: 600, display: "flex", justifyContent: "center", alignItems: "center", gap: 6, cursor: loading ? "default" : "pointer", fontFamily: "'DM Sans',sans-serif", marginBottom: 10, touchAction: "manipulation" }}>
        {loading ? "Generating…" : <><Sparkles size={isMobileOrSmaller ? 18 : 14} /> Generate</>}
      </button>

      <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
        {out && !loading && (
          <div style={{ background: "var(--rw-card-bg)", border: "1px solid var(--rw-border)", borderRadius: 10, padding: isMobileOrSmaller ? 16 : 12, animation: "noteIn 0.25s ease" }}>
            {out.body && <p style={{ margin: 0, fontFamily: "'DM Sans',sans-serif", fontSize: bodyFontSize, color: "var(--rw-text-primary)", lineHeight: 1.6, fontWeight: 300 }}>{out.body}</p>}
            {out.items && (
              <ul style={{ margin: 0, padding: "0 0 0 16px", display: "flex", flexDirection: "column", gap: 6 }}>
                {out.items.map((it, i) => <li key={i} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: bodyFontSize, color: "var(--rw-text-primary)", fontWeight: 300, lineHeight: 1.5 }}>{it}</li>)}
              </ul>
            )}
            {out.cards && (
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {out.cards.map((c, i) => (
                  <div key={i} className={`demo-flip-card ${flipped[i] ? "is-flipped" : ""}`} onClick={() => setFlipped(f => ({ ...f, [i]: !f[i] }))}>
                    <div className="demo-flip-inner">
                      <div className="demo-flip-face" style={{ background: "var(--rw-hover-bg)" }}>
                        <p style={{ margin: 0, fontSize: bodyFontSize, color: "var(--rw-text-primary)", fontWeight: 500 }}>Q: {c.q}</p>
                      </div>
                      <div className="demo-flip-face demo-flip-back" style={{ background: "var(--rw-accent-muted)" }}>
                        <p style={{ margin: 0, fontSize: bodyFontSize, color: "var(--rw-text-primary)", fontWeight: 300 }}>A: {c.a}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <p style={{ margin: "2px 0 0", fontSize: isMobileOrSmaller ? 11 : 9.5, color: "var(--rw-text-muted)", textAlign: "center", fontFamily: "'DM Sans',sans-serif", fontStyle: "italic" }}>Tap a card to flip</p>
              </div>
            )}
          </div>
        )}
        {!out && !loading && <p style={{ textAlign: "center", fontSize: isMobileOrSmaller ? 13 : 11, color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans',sans-serif", fontStyle: "italic", marginTop: 16 }}>Output will appear here</p>}
      </div>
      <div style={S.pageNum}>6</div>
    </div>
  );
};

/* ─── Page 7: Sticky Notes (drag-to-create + draggable pins) ────────────── */
const NOTE_PREFILLS = [
  { title: "Follow up", text: "Check sources for this claim." },
  { title: "Exam material", text: "Memorise this — likely to come up." },
  { title: "Contradiction", text: "Author contradicts an earlier point here." },
  { title: "Good quote", text: "Use this in the essay draft." },
];

const Page7 = () => {
  const { isMobileOrSmaller } = useBreakpoints();
  const [notes, setNotes] = useState([{ id: 1, x: 28, y: 24, title: "Follow up", text: "Check sources for this claim." }]);
  const [activeId, setActiveId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editVal, setEditVal] = useState("");
  const [dragId, setDragId] = useState(null);
  const pdfRef = useRef(null);
  const dragMoved = useRef(false);
  const MAX = 5;

  const placeNote = (clientX, clientY) => {
    if (notes.length >= MAX) return;
    const rect = pdfRef.current.getBoundingClientRect();
    const x = Math.max(6, Math.min(88, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(6, Math.min(80, ((clientY - rect.top) / rect.height) * 100));
    const prefill = NOTE_PREFILLS[notes.length % NOTE_PREFILLS.length];
    const id = Date.now();
    setNotes(p => [...p, { id, x, y, ...prefill }]);
    setActiveId(id);
  };

  const handleSurfaceClick = (e) => {
    if (e.target.closest(".note-pin") || e.target.closest(".note-card")) return;
    if (activeId !== null) { setActiveId(null); return; }
    // For touch devices, handleSurfaceClick might fire on touch. 
    // Usually touch triggers onClick unless prevented.
    const cx = e.clientX ?? (e.touches && e.touches[0].clientX);
    const cy = e.clientY ?? (e.touches && e.touches[0].clientY);
    if(cx !== undefined) placeNote(cx, cy);
  };

  const handlePinDown = (id, e) => {
    e.stopPropagation();
    dragMoved.current = false;
    setDragId(id);
  };
  
  useEffect(() => {
    if (dragId === null) return;
    const onMove = (e) => {
      dragMoved.current = true;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const rect = pdfRef.current.getBoundingClientRect();
      const x = Math.max(6, Math.min(88, ((clientX - rect.left) / rect.width) * 100));
      const y = Math.max(6, Math.min(80, ((clientY - rect.top) / rect.height) * 100));
      setNotes(p => p.map(n => n.id === dragId ? { ...n, x, y } : n));
    };
    const onTouchMove = (e) => {
      // Prevent scrolling the page while dragging the note
      e.preventDefault(); 
      onMove(e);
    };
    const onUp = () => { setDragId(null); };
    
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

  const pinSize = isMobileOrSmaller ? 40 : 26;
  const pinIconSize = isMobileOrSmaller ? 18 : 12;

  return (
    <div style={{ ...S.wrap, padding: isMobileOrSmaller ? "18px 16px" : "18px 20px" }}>
      <Caption eyebrow="Feature · Sticky Notes" points={["Tap to drop a pin", "Drag to reposition", "Title + rich note body"]} />
      <div ref={pdfRef} onClick={handleSurfaceClick}
        style={{ flex: 1, background: "#fdfaf3", border: "1px solid var(--rw-border)", borderRadius: 10, padding: isMobileOrSmaller ? "20px 16px" : "16px 20px", position: "relative", cursor: notes.length < MAX && activeId === null ? "crosshair" : "default", overflow: "hidden", margin: isMobileOrSmaller ? "0 -4px" : "0 -2px" }}>
        {[78, 92, 85, 70, 95, 80, 60, 88, 76, 90, 72, 85, 65, 90].map((w, i) => (
          <div key={i} style={{ height: 4, borderRadius: 3, background: "rgba(42,32,16,0.08)", width: `${w}%`, marginBottom: 10 }} />
        ))}
        <div style={{ position: "absolute", bottom: 10, left: 20, fontFamily: "'DM Sans',sans-serif", fontSize: isMobileOrSmaller ? 11.5 : 10, color: "#9a8870", pointerEvents: "none" }}>
          {notes.length < MAX && activeId === null ? (isMobileOrSmaller ? "Tap anywhere to drop a note" : "Click anywhere to drop a note · drag a pin to move it") : activeId !== null ? "Tap outside to close" : "All note slots used"}
        </div>

        {notes.map((note, i) => (
          <div key={note.id} style={{ position: "absolute", left: `${note.x}%`, top: `${note.y}%`, zIndex: dragId === note.id ? 30 : 10 }}>
            <div className="note-pin"
              onMouseDown={e => handlePinDown(note.id, e)}
              onTouchStart={e => handlePinDown(note.id, e)}
              onClick={e => { e.stopPropagation(); if (dragMoved.current) return; setActiveId(activeId === note.id ? null : note.id); setEditingId(null); }}
              style={{ width: pinSize, height: pinSize, borderRadius: "50% 50% 50% 4px", background: "var(--rw-panel-bg)", border: "2px solid var(--rw-accent)", display: "flex", alignItems: "center", justifyContent: "center", cursor: dragId === note.id ? "grabbing" : "grab", transform: `translate(-50%,-50%) ${dragId === note.id ? "scale(1.18)" : "scale(1)"}`, boxShadow: dragId === note.id ? "0 6px 18px rgba(0,0,0,0.25)" : "0 2px 8px rgba(0,0,0,0.18)", transition: dragId === note.id ? "none" : "transform 0.15s, box-shadow 0.15s", color: "var(--rw-accent)", touchAction: dragId === note.id ? "none" : "auto" }}>
              <MessageSquare size={pinIconSize} fill={dragId === note.id ? "var(--rw-accent)" : "none"} />
            </div>
            {activeId === note.id && (
              <div className="note-card" onClick={e => e.stopPropagation()}
                style={{ position: "absolute", left: isMobileOrSmaller ? "-60px" : "30px", top: isMobileOrSmaller ? "30px" : "-10px", width: isMobileOrSmaller ? 220 : 178, background: "var(--rw-text-primary)", border: "1px solid var(--rw-border)", borderRadius: 10, padding: isMobileOrSmaller ? "14px 16px" : "10px 12px", boxShadow: "0 4px 18px rgba(0,0,0,0.14)", zIndex: 20, animation: "noteIn 0.2s ease" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                  {editingId === note.id ? (
                    <input value={editVal} onChange={e => setEditVal(e.target.value)}
                      onBlur={() => { setNotes(p => p.map(n => n.id === note.id ? { ...n, title: editVal } : n)); setEditingId(null); }}
                      autoFocus
                      style={{ fontFamily: "'DM Sans',sans-serif", fontSize: isMobileOrSmaller ? 11 : 9.5, color: "var(--rw-accent)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", border: "none", borderBottom: "1px solid var(--rw-accent)", outline: "none", background: "transparent", width: "70%" }} />
                  ) : (
                    <span onClick={() => { setEditingId(note.id); setEditVal(note.title); }} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: isMobileOrSmaller ? 11 : 9.5, color: "var(--rw-accent)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", cursor: "text" }}>{note.title}</span>
                  )}
                  <button onClick={e => removeNote(note.id, e)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--rw-text-muted)", fontSize: 16, padding: "0 4px" }}>×</button>
                </div>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: isMobileOrSmaller ? 13 : 11.5, color: "#3a2e20", margin: 0, lineHeight: 1.5, fontWeight: 300 }}>{note.text}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={S.pageNum}>7</div>
    </div>
  );
};

/* ─── Page 8: Final CTA ──────────────────────────────────────────────────── */
const Page8 = ({ onUploadClick }) => {
  const [v, setV] = useState(false);
  useEffect(() => { setTimeout(() => setV(true), 100); }, []);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 36px", textAlign: "center", background: "var(--rw-panel-bg)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle, rgba(184,150,106,0.1) 0%, transparent 70%)", top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" }} />
      <div style={{ opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(14px)", transition: "opacity 0.7s ease, transform 0.7s ease" }}>
        <div style={{ fontSize: 26, marginBottom: 16, opacity: 0.6 }}>✦</div>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 500, color: "var(--rw-accent)", textTransform: "uppercase", letterSpacing: "0.14em", margin: "0 0 16px" }}>ReadWise</p>
        <p style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: "clamp(16px,2.2vw,23px)", fontStyle: "italic", color: "var(--rw-text-primary)", lineHeight: 1.5, margin: "0 0 7px", fontWeight: 500 }}>"The best reading tool<br />disappears."</p>
        <p style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(14px,1.8vw,19px)", color: "var(--rw-text-primary)", lineHeight: 1.5, margin: "0 0 26px", fontWeight: 600 }}>Only understanding remains.</p>
        <button onClick={onUploadClick}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 24px", background: "var(--rw-text-primary)", color: "var(--rw-panel-bg)", border: "none", borderRadius: 10, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 500, letterSpacing: "0.02em", transition: "all 0.22s ease" }}
          onMouseEnter={e => { e.currentTarget.style.opacity = "0.9"; e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}>
          Upload your first PDF <span style={{ fontSize: 16 }}>→</span>
        </button>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "rgba(255,255,255,0.22)", marginTop: 13 }}>No account needed · Free to start</p>
      </div>
      <div style={{ position: "absolute", bottom: 16, right: 20, fontFamily: "'Playfair Display',serif", fontSize: 11, color: "rgba(255,255,255,0.2)", fontStyle: "italic" }}>8</div>
    </div>
  );
};

/* ─── Page Registry ───────────────────────────────────────────────────────── */
const PAGES = [Page1, Page2, Page3, Page4, Page5, Page6, Page7, Page8];
const PAGE_TITLES = ["Welcome", "Library", "PDF Reader", "Selection", "AI Chat", "Study Tools", "Sticky Notes", "Begin Reading"];
const DARK_PAGES = new Set([4, 5, 7]); // AI Chat, Study Tools, Final CTA use panel-dark background

/* ─── Book Container — real paper-style page flip ───────────────────────── */
/*
  Two-leaf hinge technique:
  - The "static stack" beneath always shows the page AFTER the flip lands (the target page),
    so when the turning leaf finishes rotating away, the content underneath is already correct.
  - The turning "leaf" is a single absolutely-positioned panel with two faces (front/back),
    each backface-hidden, rotated together via one transform. It hinges from the edge being
    turned (right edge for next, left edge for prev) so it behaves like a real page corner.
  - A shadow gradient sweeps across the leaf as it rotates past 90deg to sell paper depth.
*/
const BookContainer = ({ onUploadClick }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [flip, setFlip] = useState(null); // { dir: 'next'|'prev', from: idx, to: idx }
  const [showIndicator, setShowIndicator] = useState(false);
  const indicatorTimer = useRef(null);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const totalPages = PAGES.length;
  const FLIP_MS = 620;

  const goTo = (idx) => {
    if (flip || idx < 0 || idx >= totalPages || idx === currentPage) return;
    const dir = idx > currentPage ? "next" : "prev";
    setFlip({ dir, from: currentPage, to: idx });
    setTimeout(() => { setCurrentPage(idx); setFlip(null); }, FLIP_MS);
    setShowIndicator(true);
    clearTimeout(indicatorTimer.current);
    indicatorTimer.current = setTimeout(() => setShowIndicator(false), 1800);
  };

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
  }, [currentPage, flip]);

  useEffect(() => () => clearTimeout(indicatorTimer.current), []);

  const bgFor = (idx) => DARK_PAGES.has(idx) ? "var(--rw-panel-bg)" : "var(--rw-app-bg)";

  const renderPaper = (idx) => {
    const PageComp = PAGES[idx];
    const isDark = DARK_PAGES.has(idx);
    return (
      <div style={{ position: "absolute", inset: 0, background: bgFor(idx), overflow: "hidden" }}>
        {!isDark && (
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
            {Array.from({ length: 32 }).map((_, i) => <div key={i} style={{ position: "absolute", left: 0, right: 0, top: `${3 + i * 3.1}%`, height: "0.5px", background: "rgba(196,182,164,0.15)" }} />)}
            <div style={{ position: "absolute", left: 44, top: 0, bottom: 0, width: "0.5px", background: "rgba(196,182,164,0.22)" }} />
          </div>
        )}
        <div style={{ position: "relative", zIndex: 1, height: "100%" }}>
          <PageComp onNext={() => goTo(idx + 1)} onUploadClick={onUploadClick} />
        </div>
      </div>
    );
  };

  const isDarkCurrent = DARK_PAGES.has(currentPage);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 0, margin: 0 }}>
      <style>{`
        ${FONTS}
        @keyframes noteIn { from { opacity:0; transform:scale(0.93) translateY(6px); } to { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes indicatorFade {
          0%   { opacity: 0; transform: translateX(-50%) translateY(4px); }
          15%  { opacity: 1; transform: translateX(-50%) translateY(0); }
          70%  { opacity: 1; transform: translateX(-50%) translateY(0); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-3px); }
        }
        @keyframes pageFlipNext {
          0%   { transform: perspective(2000px) rotateY(0deg); }
          100% { transform: perspective(2000px) rotateY(-180deg); }
        }
        @keyframes pageFlipPrev {
          0%   { transform: perspective(2000px) rotateY(0deg); }
          100% { transform: perspective(2000px) rotateY(180deg); }
        }
        @keyframes flipShadowSweep {
          0%   { opacity: 0; }
          45%  { opacity: 0.35; }
          55%  { opacity: 0.35; }
          100% { opacity: 0; }
        }
        @keyframes ambientShadowSweep {
          0%   { opacity: 0.18; }
          50%  { opacity: 0; }
          100% { opacity: 0.18; }
        }
        .rw-zone-left, .rw-zone-right {
          position: absolute; top: 50%; transform: translateY(-50%);
          width: auto; height: auto; z-index: 60; cursor: pointer;
        }
        .rw-zone-left  { left: 7px; }
        .rw-zone-right { right: 7px; }
        .rw-arrow {
          width: 32px; height: 32px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; font-size: 15px;
          margin: 8px; opacity: 1; transition: transform 0.2s ease;
        }
        .rw-zone-left:hover .rw-arrow, .rw-zone-right:hover .rw-arrow { transform: scale(1.12); }
      `}</style>

      <div style={{ position: "relative", flex: 1, width: "100%", minHeight: 0 }}
        onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        {/* Depth layers under the book */}
        <div style={{ position: "absolute", inset: 0, transform: "translateX(6px) translateY(9px)", background: "rgba(26,21,16,0.09)", filter: "blur(6px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, transform: "translateX(3px) translateY(4px)", background: "rgba(26,21,16,0.05)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, background: "#ece6da", border: "1px solid #d4ccbf", transform: "translate(2px,2px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, background: "#f2ece2", border: "1px solid #ddd5c8", transform: "translate(1px,1px)", pointerEvents: "none" }} />

        {/* Book frame */}
        <div style={{ position: "absolute", inset: 0, border: `1px solid ${isDarkCurrent ? "var(--rw-hover-bg)" : "#e2dbd0"}`, overflow: "hidden", boxShadow: "inset 3px 0 12px rgba(0,0,0,0.03)" }}>

          {/* Base layer: the page the flip will land on, always rendered underneath */}
          {renderPaper(flip ? flip.to : currentPage)}

          {/* Ambient shadow cast onto the static page by the lifting leaf, sweeps opposite the leaf's travel */}
          {flip && (
            <div style={{
              position: "absolute", inset: 0, zIndex: 40, pointerEvents: "none",
              background: flip.dir === "next"
                ? "linear-gradient(to right, rgba(0,0,0,0.18), rgba(0,0,0,0) 30%)"
                : "linear-gradient(to left, rgba(0,0,0,0.18), rgba(0,0,0,0) 30%)",
              animation: `ambientShadowSweep ${FLIP_MS}ms ease forwards`,
            }} />
          )}

          {/* Turning leaf: only present mid-flip */}
          {flip && (
            <div style={{
              position: "absolute", inset: 0, zIndex: 50,
              transformStyle: "preserve-3d",
              transformOrigin: flip.dir === "next" ? "right center" : "left center",
              animation: `${flip.dir === "next" ? "pageFlipNext" : "pageFlipPrev"} ${FLIP_MS}ms cubic-bezier(0.45,0.05,0.55,0.95) forwards`,
            }}>
              {/* Front face: the page being left (visible 0deg -> 90deg) */}
              <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden" }}>
                {renderPaper(flip.from)}
                <div style={{
                  position: "absolute", inset: 0, pointerEvents: "none",
                  background: flip.dir === "next"
                    ? "linear-gradient(to left, rgba(0,0,0,0.22), rgba(0,0,0,0) 55%)"
                    : "linear-gradient(to right, rgba(0,0,0,0.22), rgba(0,0,0,0) 55%)",
                  animation: `flipShadowSweep ${FLIP_MS}ms ease forwards`,
                }} />
              </div>
              {/* Back face: the page being revealed (visible 90deg -> 180deg, pre-flipped so it reads correctly) */}
              <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                {renderPaper(flip.to)}
                <div style={{
                  position: "absolute", inset: 0, pointerEvents: "none",
                  background: flip.dir === "next"
                    ? "linear-gradient(to right, rgba(0,0,0,0.22), rgba(0,0,0,0) 55%)"
                    : "linear-gradient(to left, rgba(0,0,0,0.22), rgba(0,0,0,0) 55%)",
                  animation: `flipShadowSweep ${FLIP_MS}ms ease forwards`,
                }} />
              </div>
            </div>
          )}

          {/* Nav zones */}
          {currentPage > 0 && (
            <div className="rw-zone-left" onClick={() => goTo(currentPage - 1)}>
              <div className="rw-arrow" style={{ background: isDarkCurrent ? "var(--rw-border)" : "rgba(26,21,16,0.07)", color: isDarkCurrent ? "var(--rw-text-primary)" : "#3a2e20" }}>‹</div>
            </div>
          )}
          {currentPage < totalPages - 1 && (
            <div className="rw-zone-right" onClick={() => goTo(currentPage + 1)}>
              <div className="rw-arrow" style={{ background: isDarkCurrent ? "var(--rw-border)" : "rgba(26,21,16,0.07)", color: isDarkCurrent ? "var(--rw-text-primary)" : "#3a2e20" }}>›</div>
            </div>
          )}
        </div>

        {/* Page indicator */}
        <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", pointerEvents: "none", zIndex: 70, animation: showIndicator ? "indicatorFade 1.8s ease forwards" : "none", opacity: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 20, background: isDarkCurrent ? "rgba(255,255,255,0.07)" : "rgba(26,21,16,0.06)", backdropFilter: "blur(6px)", border: `1px solid ${isDarkCurrent ? "var(--rw-border)" : "rgba(26,21,16,0.07)"}` }}>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, letterSpacing: "0.06em", color: isDarkCurrent ? "rgba(232,216,184,0.7)" : "rgba(58,46,32,0.5)" }}>{currentPage + 1} / {totalPages}</span>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, letterSpacing: "0.04em", color: isDarkCurrent ? "rgba(184,150,106,0.6)" : "rgba(184,150,106,0.8)" }}>{PAGE_TITLES[currentPage]}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Mobile Story Flow ───────────────────────────────────────────────────── */
const MobileStoryPage = ({ PageComp, idx, onUploadClick }) => {
  const isDark = DARK_PAGES.has(idx);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setIsVisible(true); }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ height: "100dvh", width: "100vw", scrollSnapAlign: "start", scrollSnapStop: "always", display: "flex", flexDirection: "column", background: isDark ? "var(--rw-panel-bg)" : "var(--rw-app-bg)", position: "relative", overflow: "hidden" }}>
      <div style={{ flex: 1, opacity: isVisible ? 1 : 0, transform: isVisible ? "translateY(0)" : "translateY(20px)", transition: "opacity 0.8s ease, transform 0.8s cubic-bezier(0.4,0,0.2,1)", display: "flex", flexDirection: "column", position: "relative" }}>
        <PageComp onNext={() => { }} onUploadClick={onUploadClick} />
      </div>
      {idx < PAGES.length - 1 && (
        <div style={{ position: "absolute", bottom: 28, left: "50%", opacity: isVisible ? 0.5 : 0, transition: "opacity 1s ease 0.5s", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, pointerEvents: "none" }}>
          <span style={{ fontSize: 9, fontFamily: "'DM Sans',sans-serif", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--rw-text-secondary)" }}>Scroll</span>
          <span style={{ color: "var(--rw-text-secondary)" }}>↓</span>
        </div>
      )}
    </div>
  );
};

/* ─── Export Wrapper ──────────────────────────────────────────────────────── */
const LandingContentWrapper = ({ onUploadClick }) => {
  const { isMobileOrSmaller } = useBreakpoints();

  if (isMobileOrSmaller) {
    return (
      <div style={{ height: "100dvh", width: "100vw", overflowY: "auto", overflowX: "hidden", scrollSnapType: "y mandatory", background: "var(--rw-app-bg)", scrollBehavior: "smooth" }} className="custom-scrollbar">
        <style>{`
          ${FONTS}
          @keyframes mobileBounce { 0%,20%,50%,80%,100%{transform:translateY(0) translateX(-50%)} 40%{transform:translateY(-7px) translateX(-50%)} 60%{transform:translateY(-3px) translateX(-50%)} }
          @keyframes noteIn { from{opacity:0;transform:scale(0.93) translateY(6px)} to{opacity:1;transform:scale(1) translateY(0)} }
          @keyframes cursorBlink { 0%,100%{opacity:1} 50%{opacity:0} }
          @keyframes dotBounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }
        `}</style>
        {PAGES.map((PageComp, idx) => <MobileStoryPage key={idx} PageComp={PageComp} idx={idx} onUploadClick={onUploadClick} />)}
      </div>
    );
  }

  return <BookContainer onUploadClick={onUploadClick} />;
};

export default LandingContentWrapper;