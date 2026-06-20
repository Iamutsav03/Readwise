// components/Sidebar.jsx
// Lightweight document library sidebar.
// Structure: Logo → Upload → Favorites (conditional) → Library (search + list)

import { useRef, useState, useCallback, useEffect } from "react";
import { uploadPDF } from "../utils/api";
import useFavorites from "../hooks/useFavorites";
import usePdfLibrarySearch from "../hooks/usePdfLibrarySearch";
import FavoritesSection from "./FavoritesSection";
import LibrarySearch from "./LibrarySearch";
import PdfRow from "./PdfRow";
import { loadPosition } from "../utils/readingStorage";
import readingProgressStore from "../utils/readingProgressStore";
import AppearanceModal from "../theme/AppearanceModal";
import { useTheme } from "../theme/useTheme";
import { useBreakpoints } from "../hooks/useBreakpoints";
import { BookOpen, FileText, FolderOpen, Library, Palette, Paperclip, Keyboard } from "lucide-react";

// ── Time helper ────────────────────────────────────────────────────────────────
function timeAgo(dateStr) {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Opened just now";
  if (m < 60) return `Opened ${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Opened ${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return "Opened yesterday";
  if (d < 7) return `Opened ${d} days ago`;
  return `Opened ${Math.floor(d / 7)}w ago`;
}

const Sidebar = ({
  pdfs,
  selectedPDF,
  onUploadSuccess,
  onSelect,
  onRemovePdf,
  onFavorite,
  onRename,
  fileInputRef,
  isOpen,     // for mobile drawer
  onClose,    // to close mobile drawer
}) => {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [isAppearanceOpen, setIsAppearanceOpen] = useState(false);
  const { activeTheme } = useTheme();
  const { isMobileOrSmaller, isTablet } = useBreakpoints();

  const { favorites, hasFavorites, totalFavorites } = useFavorites(pdfs);
  const { query, setQuery, filtered } = usePdfLibrarySearch(pdfs);
  
  // Track visual focus (single click selection) independently of opened document
  const [focusedPdfId, setFocusedPdfId] = useState(null);
  
  const mostRecent = pdfs.length > 0 ? pdfs[0] : null;

  // Live progress: subscribe to the store for instant updates (no refresh needed)
  const [liveProgress, setLiveProgress] = useState(() => readingProgressStore.get());
  useEffect(() => readingProgressStore.subscribe(setLiveProgress), []);

  const processFile = useCallback(async (file) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      setError("Only PDF files are supported.");
      return;
    }
    setError(""); setUploading(true);
    try {
      const formData = new FormData();
      formData.append("pdf", file);
      const data = await uploadPDF(formData);
      onUploadSuccess(data.pdf);
      if (fileInputRef?.current) fileInputRef.current.value = null;
    } catch {
      setError("Upload failed. Is the backend running?");
    } finally {
      setUploading(false);
    }
  }, [onUploadSuccess, fileInputRef]);

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    processFile(e.dataTransfer.files?.[0]);
  }, [processFile]);

  const handleFileChange = (e) => processFile(e.target.files?.[0]);
  const triggerBrowse = () => fileInputRef?.current?.click();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');

        .rw-sidebar { font-family: 'DM Sans', sans-serif; }
        .rw-sidebar * { box-sizing: border-box; }

        /* ── Drop zone ── */
        .rw-drop-zone {
          border: 1.5px dashed var(--rw-border);
          border-radius: 8px;
          padding: 14px 12px;
          text-align: center;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
          background: var(--rw-card-bg);
        }
        .rw-drop-zone:hover, .rw-drop-zone.drag {
          border-color: var(--rw-accent);
          background: var(--rw-accent-muted);
        }

        /* ── Upload button ── */
        .rw-upload-btn {
          width: 100%;
          padding: 9px 0;
          border-radius: 8px;
          background: var(--rw-accent);
          color: var(--rw-accent-text);
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          letter-spacing: 0.02em;
          transition: background 0.18s, transform 0.15s;
          margin-top: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .rw-upload-btn:hover:not(:disabled) {
          background: var(--rw-accent-hover);
          transform: translateY(-1px);
        }
        .rw-upload-btn:disabled { opacity: 0.5; cursor: default; transform: none; }

        /* ── Scrollable list ── */
        .rw-scrollable {
          overflow-y: auto;
          overflow-x: hidden;
          flex: 1;
          scrollbar-width: thin;
          scrollbar-color: var(--rw-scrollbar) transparent;
        }
        .rw-scrollable::-webkit-scrollbar { width: 3px; }
        .rw-scrollable::-webkit-scrollbar-thumb {
          background: var(--rw-scrollbar);
          border-radius: 4px;
        }

        /* ── Section label ── */
        .rw-section-label {
          font-size: 10px;
          font-weight: 600;
          color: var(--rw-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin: 0 0 10px;
          font-family: 'DM Sans', sans-serif;
        }

        /* ── Empty state ── */
        .rw-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 28px 16px;
          gap: 8px;
          text-align: center;
        }

        @keyframes rw-spin { to { transform: rotate(360deg); } }
      `}</style>

      <aside className={`rw-sidebar ${isMobileOrSmaller && !isOpen ? 'closed' : 'open'}`} style={{
        width: isMobileOrSmaller ? "100vw" : (isTablet ? "80px" : "340px"),
        minWidth: isTablet ? "80px" : "300px",
        maxWidth: isTablet ? "80px" : "360px",
        height: "100dvh",
        display: isMobileOrSmaller && !isOpen ? "none" : "flex",
        flexDirection: "column",
        background: "var(--rw-sidebar-bg)",
        borderRight: "1px solid var(--rw-border)",
        flexShrink: 0,
        position: isMobileOrSmaller ? "fixed" : "sticky",
        top: 0,
        left: 0,
        zIndex: isMobileOrSmaller ? 50 : 1,
        overflow: "hidden",
        transition: "width 0.3s ease, transform 0.3s ease",
      }}>

        {/* ── Logo ───────────────────────────────────────── */}
        <div style={{ padding: isTablet ? "20px 0" : "20px 20px 14px", flexShrink: 0, display: "flex", flexDirection: "column", alignItems: isTablet ? "center" : "flex-start" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{
              width: 26, height: 26, background: "var(--rw-accent)",
              borderRadius: 6, display: "flex", alignItems: "center",
              justifyContent: "center", color: "var(--rw-accent-text)", flexShrink: 0,
            }}><BookOpen size={16} /></div>
            {!isTablet && (
              <span style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 17, fontWeight: 600, color: "var(--rw-text-primary)", letterSpacing: "-0.01em",
              }}>ReadWise</span>
            )}
          </div>
          {!isTablet && (
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12, color: "var(--rw-text-secondary)", marginTop: 6, lineHeight: 1.45,
            }}>
              Your intelligent reading workspace.
            </p>
          )}
        </div>

        <div style={{ height: 1, background: "var(--rw-border)", flexShrink: 0 }} />

        {/* ── Scrollable ─────────────── */}
        <div className="rw-scrollable" style={{ padding: "14px 12px 12px", display: "flex", flexDirection: "column" }}>

          {/* CONTINUE READING */}
          {mostRecent && !isTablet && (() => {
            // Use live store data when the most-recent PDF is currently open,
            // fall back to localStorage for previously-read PDFs.
            const isLive = liveProgress.pdfId === mostRecent._id;
            const p     = isLive ? liveProgress.pageNumber : (loadPosition(mostRecent._id)?.pageNumber || 1);
            const total = isLive ? liveProgress.numPages   : (loadPosition(mostRecent._id)?.numPages  || 0);
            const pct   = total > 1 ? Math.round((p / total) * 100) : 0;
            return (
              <div style={{ padding: "0 6px 12px" }}>
                <p className="rw-section-label">Continue Reading</p>
                <div
                  onClick={() => onSelect(mostRecent)}
                  style={{
                    padding: "12px 14px",
                    background: "var(--rw-card-bg)",
                    border: "1px solid var(--rw-border)",
                    borderRadius: 8,
                    cursor: "pointer",
                    transition: "transform 0.15s, background 0.15s",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.background = "var(--rw-hover-bg)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.background = "var(--rw-card-bg)";
                  }}
                  title="Continue reading"
                >
                  <p style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13, fontWeight: 600, color: "var(--rw-text-primary)",
                    margin: "0 0 6px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>
                    {mostRecent.originalName.replace(/\.pdf$/i, "")}
                  </p>
                  <div style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 11, color: "var(--rw-text-secondary)", margin: 0,
                    display: "flex", flexDirection: "column", gap: 3
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Page {p} / {total > 1 ? total : "?"}</span>
                      <span style={{ color: "var(--rw-accent)", fontWeight: 500 }}>{pct}% Completed</span>
                    </div>
                    <span style={{ fontSize: 10, opacity: 0.8, marginTop: 2 }}>{timeAgo(mostRecent.lastOpenedAt) || "Never opened"}</span>
                  </div>
                </div>
              </div>
            );
          })()}


          {/* ── Upload zone ─────────────────────────────────── */}
          <div style={{ padding: "0 6px 14px", flexShrink: 0 }}>


            {pdfs.length === 0 ? (
              <>
                {!isTablet && <p className="rw-section-label">Upload</p>}
                <div
                  className={`rw-drop-zone${dragging ? " drag" : ""}`}
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onClick={triggerBrowse}
                  style={{
                    padding: isTablet ? "14px 0" : "14px 12px",
                  }}
                >
                  <div style={{
                    width: 30, height: 30, margin: isTablet ? "0 auto" : "0 auto 7px",
                    background: "var(--rw-sidebar-bg)", borderRadius: 8,
                    display: "flex", alignItems: "center",
                    justifyContent: "center", color: "var(--rw-text-secondary)",
                  }}>
                    {dragging ? <FolderOpen size={18} /> : <FileText size={18} />}
                  </div>
                  {!isTablet && (
                    <>
                      <p style={{ fontSize: 12.5, color: "var(--rw-text-primary)", fontWeight: 500, margin: "0 0 2px" }}>
                        {dragging ? "Drop to upload" : "Drop a PDF here"}
                      </p>
                      <p style={{ fontSize: 11, color: "var(--rw-text-muted)", margin: 0 }}>
                        or click to browse · max 20 MB
                      </p>
                    </>
                  )}
                </div>
                {error && (
                  <p style={{ fontSize: 11.5, color: "#e07060", margin: "6px 0 0" }}>{error}</p>
                )}
                <button
                  className="rw-upload-btn"
                  onClick={triggerBrowse}
                  disabled={uploading}
                  style={{
                    padding: isTablet ? "9px 0" : "9px 0",
                  }}
                >
                  {uploading
                    ? <><span style={{ display: "inline-block", animation: "rw-spin 0.8s linear infinite" }}>◌</span> {!isTablet && "Uploading…"}</>
                    : <><span style={{ fontSize: 14 }}>+</span> {!isTablet && "Choose a PDF"}</>
                  }
                </button>
              </>
            ) : (
              <>
                {error && (
                  <p style={{ fontSize: 11.5, color: "#e07060", margin: "0 0 6px" }}>{error}</p>
                )}
                <button
                  className="rw-upload-btn"
                  onClick={triggerBrowse}
                  disabled={uploading}
                  style={{ marginTop: 0, padding: isTablet ? "9px 0" : "9px 0" }}
                >
                  {uploading
                    ? <><span style={{ display: "inline-block", animation: "rw-spin 0.8s linear infinite" }}>◌</span> {!isTablet && "Uploading…"}</>
                    : <><span style={{ fontSize: 14 }}>+</span> {!isTablet && "Upload PDF"}</>
                  }
                </button>
              </>
            )}
          </div>

          {/* FAVORITES */}
          <FavoritesSection
            favorites={favorites}
            selectedPDF={selectedPDF}
            onSelect={onSelect}
            onFavorite={onFavorite}
            totalFavorites={totalFavorites}
          />

          {/* LIBRARY */}
          <div style={{ marginTop: hasFavorites ? 10 : 0 }}>
              <p className="rw-section-label" style={{ padding: "0 6px" }}>
                Recent PDFs
                {pdfs.length > 0 && (
                  <span style={{
                    marginLeft: 6, fontSize: 9.5, fontWeight: 500,
                    background: "var(--rw-card-bg)", borderRadius: 4,
                    padding: "1px 5px", color: "var(--rw-text-secondary)", letterSpacing: "0.04em",
                  }}>{pdfs.length}</span>
                )}
              </p>

            {/* Search — only shown when there are PDFs */}
            {pdfs.length > 0 && (
              <LibrarySearch query={query} onQueryChange={setQuery} />
            )}

            {/* PDF list */}
            {pdfs.length === 0 ? (
              <div className="rw-empty">
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: "var(--rw-card-bg)", display: "flex", color: "var(--rw-text-muted)",
                  alignItems: "center", justifyContent: "center",
                }}><Library size={20} /></div>
                <p style={{ fontSize: 12.5, color: "var(--rw-text-muted)", margin: 0, lineHeight: 1.6 }}>
                  No PDFs yet.<br />Upload one to get started.
                </p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="rw-empty" style={{ padding: "18px 16px" }}>
                <p style={{ fontSize: 12.5, color: "var(--rw-text-muted)", margin: 0 }}>
                  No PDFs found
                </p>
              </div>
            ) : (
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {filtered.map((pdf) => (
                  <PdfRow
                    key={pdf._id}
                    pdf={pdf}
                    active={selectedPDF?._id === pdf._id}
                    isFocused={focusedPdfId === pdf._id}
                    onFocus={() => setFocusedPdfId(pdf._id)}
                    onSelect={onSelect}
                    onFavorite={onFavorite}
                    onRename={onRename}
                    onDelete={onRemovePdf}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* ── Appearance Button ───────────────────────────────── */}
        <div style={{ padding: "0 20px 12px", flexShrink: 0 }}>
          <button
            onClick={() => setIsAppearanceOpen(true)}
            style={{
              width: "100%",
              padding: "10px 14px",
              background: "var(--rw-card-bg)",
              border: "1px solid var(--rw-border)",
              borderRadius: "8px",
              color: "var(--rw-text-primary)",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "13px",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              transition: "background 0.15s ease",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--rw-hover-bg)"}
            onMouseLeave={e => e.currentTarget.style.background = "var(--rw-card-bg)"}
          >
            <Palette size={16} />
            <span>Appearance: {activeTheme?.name}</span>
          </button>
        </div>

        {/* ── Footer tips ─────────────────────────────────── */}
        <div style={{
          padding: "12px 20px 16px",
          borderTop: "1px solid var(--rw-border)",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}>
          {[
            [<Paperclip size={12} key="size" />, "PDFs up to 20 MB"],
            [<Keyboard size={12} key="keys" />, "Arrow keys turn pages"],
          ].map(([icon, text]) => (
            <div key={text} style={{
              display: "flex", alignItems: "center", gap: 6,
              fontSize: 11, color: "var(--rw-text-muted)",
            }}>
              <div style={{ display: "flex", alignItems: "center", color: "var(--rw-text-muted)" }}>{icon}</div>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </aside>

      <AppearanceModal 
        isOpen={isAppearanceOpen} 
        onClose={() => setIsAppearanceOpen(false)} 
      />
    </>
  );
};

export default Sidebar;