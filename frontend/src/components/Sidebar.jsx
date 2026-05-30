import { useRef, useState, useCallback } from "react";
import { uploadPDF } from "../utils/api";

const Sidebar = ({
    pdfs,
    selectedPDF,
    onUploadSuccess,
    onSelect,
    onRemovePdf,
    fileInputRef
}) => {
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [hoveredId, setHoveredId] = useState(null);
    const [confirmId, setConfirmId] = useState(null);

    const processFile = useCallback(async (file) => {
        if (!file) return;
        if (file.type !== "application/pdf") { setError("Only PDF files are supported."); return; }
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

    const handleDeleteClick = (e, pdf) => {
        e.stopPropagation();
        if (confirmId === pdf._id) {
            onRemovePdf(pdf._id);
            setConfirmId(null);
        } else {
            setConfirmId(pdf._id);
            // Auto-cancel confirm state after 3s if user doesn't confirm
            setTimeout(() => setConfirmId(id => id === pdf._id ? null : id), 3000);
        }
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');

                .rw-sidebar { font-family: 'DM Sans', sans-serif; }
                .rw-sidebar * { box-sizing: border-box; }

                /* ── Drop zone ── */
                .rw-drop-zone {
                    border: 1.5px dashed #d8cfc3;
                    border-radius: 10px;
                    padding: 14px 12px;
                    text-align: center;
                    cursor: pointer;
                    transition: border-color 0.2s, background 0.2s;
                    background: rgba(255,255,255,0.5);
                }
                .rw-drop-zone:hover,
                .rw-drop-zone.drag {
                    border-color: #b8966a;
                    background: rgba(212,175,120,0.06);
                }

                /* ── Upload button ── */
                .rw-upload-btn {
                    width: 100%;
                    padding: 9px 0;
                    border-radius: 9px;
                    background: #1a1510;
                    color: #f5f0e8;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 13px;
                    font-weight: 500;
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
                    background: #2e2519;
                    transform: translateY(-1px);
                }
                .rw-upload-btn:disabled { opacity: 0.35; cursor: default; transform: none; }

                /* ── PDF list row ── */
                .rw-pdf-row {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 8px 10px;
                    border-radius: 9px;
                    cursor: pointer;
                    transition: background 0.15s;
                    position: relative;
                    /* Prevent any child from expanding beyond row width */
                    min-width: 0;
                    width: 100%;
                }
                .rw-pdf-row:hover { background: rgba(0,0,0,0.04); }
                .rw-pdf-row.active { background: rgba(184,150,106,0.11); }
                .rw-pdf-row.active:hover { background: rgba(184,150,106,0.16); }

                /* ── File icon ── */
                .rw-file-icon {
                    width: 32px;
                    height: 36px;
                    border-radius: 6px;
                    flex-shrink: 0;
                    background: #ede8e0;
                    border: 1px solid #e0d9d0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 13px;
                    position: relative;
                    transition: background 0.15s;
                }
                .rw-pdf-row.active .rw-file-icon {
                    background: rgba(184,150,106,0.18);
                    border-color: rgba(184,150,106,0.3);
                }

                /* ── File text block ── */
                .rw-file-text {
                    flex: 1;
                    min-width: 0; /* critical — allows text to shrink and show ellipsis */
                    overflow: hidden;
                }
                .rw-file-name {
                    font-size: 13px;
                    font-weight: 500;
                    color: #2e2519;
                    margin: 0;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    line-height: 1.3;
                    transition: color 0.15s;
                }
                .rw-pdf-row.active .rw-file-name { color: #8a6a38; }
                .rw-file-meta {
                    font-size: 11px;
                    color: #b0a090;
                    margin: 2px 0 0;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                /* ── Delete button ── */
                .rw-delete-btn {
                    flex-shrink: 0;
                    width: 26px;
                    height: 26px;
                    border: none;
                    border-radius: 6px;
                    background: transparent;
                    cursor: pointer;
                    font-size: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background 0.15s, opacity 0.15s, color 0.15s;
                    color: #c0b0a0;
                }
                .rw-delete-btn.idle {
                    opacity: 0;
                    pointer-events: none;
                }
                .rw-delete-btn.visible {
                    opacity: 0.55;
                    pointer-events: auto;
                }
                .rw-delete-btn.visible:hover {
                    opacity: 1;
                    background: rgba(192,57,43,0.08);
                    color: #c0392b;
                }
                .rw-delete-btn.confirm {
                    opacity: 1;
                    pointer-events: auto;
                    background: rgba(192,57,43,0.1);
                    color: #c0392b;
                    font-size: 10px;
                    font-family: 'DM Sans', sans-serif;
                    font-weight: 600;
                    letter-spacing: 0.02em;
                    width: auto;
                    padding: 0 7px;
                }
                .rw-delete-btn.confirm:hover {
                    background: rgba(192,57,43,0.18);
                }

                /* ── Scrollable list ── */
                .rw-scrollable {
                    overflow-y: auto;
                    overflow-x: hidden; /* no horizontal scroll ever */
                    flex: 1;
                    scrollbar-width: thin;
                    scrollbar-color: #e0d8d0 transparent;
                }
                .rw-scrollable::-webkit-scrollbar { width: 3px; }
                .rw-scrollable::-webkit-scrollbar-thumb {
                    background: #e0d8d0;
                    border-radius: 4px;
                }

                /* ── Section label ── */
                .rw-section-label {
                    font-size: 10px;
                    font-weight: 500;
                    color: #b0a090;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    margin: 0 0 10px;
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
            `}</style>

            <aside className="rw-sidebar" style={{
                width: "340px",
                minWidth: "300px",
                maxWidth: "360px",
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                background: "#faf7f2",
                borderRight: "1px solid #ece7df",
                flexShrink: 0,
                position: "sticky",
                top: 0,
                overflow: "hidden", /* ensure nothing bleeds out */
            }}>

                {/* ── Logo ─────────────────────────────────────── */}
                <div style={{ padding: "20px 20px 14px", flexShrink: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <div style={{
                            width: 26, height: 26, background: "#1a1510",
                            borderRadius: 6, display: "flex", alignItems: "center",
                            justifyContent: "center", fontSize: 13, flexShrink: 0,
                        }}>📖</div>
                        <span style={{
                            fontFamily: "'Playfair Display', Georgia, serif",
                            fontSize: 17, fontWeight: 600, color: "#1a1510", letterSpacing: "-0.01em",
                        }}>ReadWise</span>
                    </div>
                    <p style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 12, color: "#a09278", marginTop: 6, lineHeight: 1.45,
                    }}>
                        Your intelligent reading workspace.
                    </p>
                </div>

                <div style={{ height: 1, background: "#ece7df", flexShrink: 0 }} />

                {/* ── Upload zone ──────────────────────────────── */}
                <div style={{ padding: "14px 18px", flexShrink: 0 }}>
                    <p className="rw-section-label">Upload</p>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf"
                        style={{ display: "none" }}
                        onChange={handleFileChange}
                    />

                    <div
                        className={`rw-drop-zone${dragging ? " drag" : ""}`}
                        onDrop={handleDrop}
                        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                        onDragLeave={() => setDragging(false)}
                        onClick={triggerBrowse}
                    >
                        <div style={{
                            width: 30, height: 30, margin: "0 auto 7px",
                            background: "#ede8e0", borderRadius: 8,
                            display: "flex", alignItems: "center",
                            justifyContent: "center", fontSize: 14,
                        }}>
                            {dragging ? "📂" : "📄"}
                        </div>
                        <p style={{ fontSize: 12.5, color: "#5a4e3e", fontWeight: 500, margin: "0 0 2px" }}>
                            {dragging ? "Drop to upload" : "Drop a PDF here"}
                        </p>
                        <p style={{ fontSize: 11, color: "#b0a090", margin: 0 }}>
                            or click to browse · max 20 MB
                        </p>
                    </div>

                    {error && (
                        <p style={{ fontSize: 11.5, color: "#c0392b", marginTop: 6, margin: "6px 0 0" }}>{error}</p>
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

                    <style>{`@keyframes rw-spin { to { transform: rotate(360deg); } }`}</style>
                </div>

                <div style={{ height: 1, background: "#ece7df", flexShrink: 0 }} />

                {/* ── Recent uploads — scrollable, dominant ─── */}
                <div className="rw-scrollable" style={{ padding: "14px 12px 12px" }}>
                    <p className="rw-section-label" style={{ padding: "0 6px" }}>
                        Recent
                        {pdfs.length > 0 && (
                            <span style={{
                                marginLeft: 6, fontSize: 9.5, fontWeight: 500,
                                background: "#ede8e0", borderRadius: 4,
                                padding: "1px 5px", color: "#9a8a72", letterSpacing: "0.04em",
                            }}>{pdfs.length}</span>
                        )}
                    </p>

                    {pdfs.length === 0 ? (
                        <div className="rw-empty">
                            <div style={{
                                width: 40, height: 40, borderRadius: 10,
                                background: "#ede8e0", display: "flex",
                                alignItems: "center", justifyContent: "center", fontSize: 18,
                            }}>📚</div>
                            <p style={{ fontSize: 12.5, color: "#b0a090", margin: 0, lineHeight: 1.6 }}>
                                No PDFs yet.<br />Upload one to get started.
                            </p>
                        </div>
                    ) : (
                        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                            {pdfs.map((pdf) => {
                                const active = selectedPDF?._id === pdf._id;
                                const hovered = hoveredId === pdf._id;
                                const confirming = confirmId === pdf._id;

                                return (
                                    <li key={pdf._id} style={{ marginBottom: 2 }}>
                                        <div
                                            className={`rw-pdf-row${active ? " active" : ""}`}
                                            onMouseEnter={() => setHoveredId(pdf._id)}
                                            onMouseLeave={() => { setHoveredId(null); }}
                                            onClick={() => onSelect(pdf)}
                                        >
                                            {/* File icon — mimics a tiny page corner fold */}
                                            <div className="rw-file-icon">
                                                <span style={{ fontSize: 13, lineHeight: 1 }}>📄</span>
                                                {/* Active indicator dot */}
                                                {active && (
                                                    <div style={{
                                                        position: "absolute", top: 3, right: 3,
                                                        width: 5, height: 5, borderRadius: "50%",
                                                        background: "#b8966a",
                                                    }} />
                                                )}
                                            </div>

                                            {/* Name + meta */}
                                            <div className="rw-file-text">
                                                <p className="rw-file-name" title={pdf.originalName}>
                                                    {pdf.originalName.replace(/\.pdf$/i, "")}
                                                </p>
                                                <p className="rw-file-meta">
                                                    {(pdf.fileSize / 1024).toFixed(0)} KB
                                                    <span style={{ margin: "0 4px", opacity: 0.5 }}>·</span>
                                                    {new Date(pdf.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                                </p>
                                            </div>

                                            {/* Delete — hover-reveal, two-step confirm */}
                                            <button
                                                className={`rw-delete-btn ${confirming ? "confirm" : hovered || active ? "visible" : "idle"}`}
                                                onClick={(e) => handleDeleteClick(e, pdf)}
                                                title={confirming ? "Click again to confirm deletion" : "Delete"}
                                            >
                                                {confirming ? "Delete?" : "✕"}
                                            </button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                {/* ── Footer tips ───────────────────────────── */}
                <div style={{
                    padding: "12px 20px 16px",
                    borderTop: "1px solid #ece7df",
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
                            fontSize: 11, color: "#c0b0a0",
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