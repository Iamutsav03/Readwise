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
}) => {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const { favorites, hasFavorites, totalFavorites } = useFavorites(pdfs);
  const { query, setQuery, filtered } = usePdfLibrarySearch(pdfs);
  
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
          border: 1.5px dashed rgba(245,238,228,0.15);
          border-radius: 8px;
          padding: 14px 12px;
          text-align: center;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
          background: #241D19;
        }
        .rw-drop-zone:hover, .rw-drop-zone.drag {
          border-color: #C8A46A;
          background: rgba(200,164,106,0.05);
        }

        /* ── Upload button ── */
        .rw-upload-btn {
          width: 100%;
          padding: 9px 0;
          border-radius: 8px;
          background: #C8A46A;
          color: #1A1512;
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
          background: #d9b67f;
          transform: translateY(-1px);
        }
        .rw-upload-btn:disabled { opacity: 0.5; cursor: default; transform: none; }

        /* ── Scrollable list ── */
        .rw-scrollable {
          overflow-y: auto;
          overflow-x: hidden;
          flex: 1;
          scrollbar-width: thin;
          scrollbar-color: rgba(245,238,228,0.2) transparent;
        }
        .rw-scrollable::-webkit-scrollbar { width: 3px; }
        .rw-scrollable::-webkit-scrollbar-thumb {
          background: rgba(245,238,228,0.2);
          border-radius: 4px;
        }

        /* ── Section label ── */
        .rw-section-label {
          font-size: 10px;
          font-weight: 600;
          color: rgba(245,238,228,0.5);
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

      <aside className="rw-sidebar" style={{
        width: "340px",
        minWidth: "300px",
        maxWidth: "360px",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#1A1512",
        borderRight: "1px solid rgba(255,255,255,0.05)",
        flexShrink: 0,
        position: "sticky",
        top: 0,
        overflow: "hidden",
      }}>

        {/* ── Logo ───────────────────────────────────────── */}
        <div style={{ padding: "20px 20px 14px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{
              width: 26, height: 26, background: "#C8A46A",
              borderRadius: 6, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 13, flexShrink: 0,
            }}>📖</div>
            <span style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 17, fontWeight: 600, color: "#F5EEE4", letterSpacing: "-0.01em",
            }}>ReadWise</span>
          </div>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12, color: "rgba(245,238,228,0.7)", marginTop: 6, lineHeight: 1.45,
          }}>
            Your intelligent reading workspace.
          </p>
        </div>

        <div style={{ height: 1, background: "rgba(255,255,255,0.05)", flexShrink: 0 }} />

        {/* ── Scrollable ─────────────── */}
        <div className="rw-scrollable" style={{ padding: "14px 12px 12px", display: "flex", flexDirection: "column" }}>

          {/* CONTINUE READING */}
          {mostRecent && (() => {
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
                    background: "#241D19",
                    border: "1px solid rgba(255,255,255,0.05)",
                    borderRadius: 8,
                    cursor: "pointer",
                    transition: "transform 0.15s, background 0.15s",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.background = "#2a221d";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.background = "#241D19";
                  }}
                  title="Continue reading"
                >
                  <p style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13, fontWeight: 600, color: "#F5EEE4",
                    margin: "0 0 6px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>
                    {mostRecent.originalName.replace(/\.pdf$/i, "")}
                  </p>
                  <div style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 11, color: "rgba(245,238,228,0.7)", margin: 0,
                    display: "flex", flexDirection: "column", gap: 3
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Page {p} / {total > 1 ? total : "?"}</span>
                      <span style={{ color: "#C8A46A", fontWeight: 500 }}>{pct}% Completed</span>
                    </div>
                    <span style={{ fontSize: 10, opacity: 0.8, marginTop: 2 }}>{timeAgo(mostRecent.lastOpenedAt) || "Never opened"}</span>
                  </div>
                </div>
              </div>
            );
          })()}


          {/* ── Upload zone ─────────────────────────────────── */}
          <div style={{ padding: "0 6px 14px", flexShrink: 0 }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />

            {pdfs.length === 0 ? (
              <>
                <p className="rw-section-label">Upload</p>
                <div
                  className={`rw-drop-zone${dragging ? " drag" : ""}`}
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onClick={triggerBrowse}
                >
                  <div style={{
                    width: 30, height: 30, margin: "0 auto 7px",
                    background: "#1A1512", borderRadius: 8,
                    display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: 14,
                  }}>
                    {dragging ? "📂" : "📄"}
                  </div>
                  <p style={{ fontSize: 12.5, color: "#F5EEE4", fontWeight: 500, margin: "0 0 2px" }}>
                    {dragging ? "Drop to upload" : "Drop a PDF here"}
                  </p>
                  <p style={{ fontSize: 11, color: "rgba(245,238,228,0.5)", margin: 0 }}>
                    or click to browse · max 20 MB
                  </p>
                </div>
                {error && (
                  <p style={{ fontSize: 11.5, color: "#e07060", margin: "6px 0 0" }}>{error}</p>
                )}
                <button
                  className="rw-upload-btn"
                  onClick={triggerBrowse}
                  disabled={uploading}
                >
                  {uploading
                    ? <><span style={{ display: "inline-block", animation: "rw-spin 0.8s linear infinite" }}>◌</span> Uploading…</>
                    : <><span style={{ fontSize: 14 }}>+</span> Choose a PDF</>
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
                  style={{ marginTop: 0 }}
                >
                  {uploading
                    ? <><span style={{ display: "inline-block", animation: "rw-spin 0.8s linear infinite" }}>◌</span> Uploading…</>
                    : <><span style={{ fontSize: 14 }}>+</span> Upload PDF</>
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
                    background: "#241D19", borderRadius: 4,
                    padding: "1px 5px", color: "rgba(245,238,228,0.7)", letterSpacing: "0.04em",
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
                  background: "#241D19", display: "flex",
                  alignItems: "center", justifyContent: "center", fontSize: 18,
                }}>📚</div>
                <p style={{ fontSize: 12.5, color: "rgba(245,238,228,0.5)", margin: 0, lineHeight: 1.6 }}>
                  No PDFs yet.<br />Upload one to get started.
                </p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="rw-empty" style={{ padding: "18px 16px" }}>
                <p style={{ fontSize: 12.5, color: "rgba(245,238,228,0.5)", margin: 0 }}>
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
                    onSelect={onSelect}
                    onFavorite={onFavorite}
                    onRename={onRename}
                    onDelete={onRemovePdf}
                  />
                ))}
              </ul>
            )}
          </div>
          
          {/* ── AI Workspace Placeholder ─────────────────────── */}
          <div style={{ marginTop: "auto", paddingTop: 20 }}>
            <div style={{
              padding: "12px", background: "rgba(200,164,106,0.06)",
              borderRadius: 8, border: "1px solid rgba(200,164,106,0.15)"
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#C8A46A", fontFamily: "'DM Sans', sans-serif" }}>AI Workspace</span>
                <span style={{ fontSize: 9, fontWeight: 500, color: "rgba(245,238,228,0.7)", background: "#241D19", padding: "2px 5px", borderRadius: 4, textTransform: "uppercase" }}>Coming Soon</span>
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", fontSize: 11.5, color: "rgba(245,238,228,0.5)", fontFamily: "'DM Sans', sans-serif", display: "flex", flexDirection: "column", gap: 3 }}>
                <li>✨ Chat with PDF</li>
                <li>📝 Summaries</li>
                <li>📇 Flashcards</li>
                <li>🎯 Quiz Generation</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── Footer tips ─────────────────────────────────── */}
        <div style={{
          padding: "12px 20px 16px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}>
          {[
            ["📎", "PDFs up to 20 MB"],
            ["⌨️", "Arrow keys turn pages"],
          ].map(([icon, text]) => (
            <div key={text} style={{
              display: "flex", alignItems: "center", gap: 6,
              fontSize: 11, color: "rgba(245,238,228,0.5)",
            }}>
              <span style={{ fontSize: 11 }}>{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;