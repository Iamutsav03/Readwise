// src/components/RecentUploads.jsx
// List of previously uploaded PDFs shown in sidebar

const RecentUploads = ({ pdfs, selectedPDF, onSelect }) => {
    return (
        <div>
            <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "11px", color: "rgba(255,255,255,0.28)",
                textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px",
            }}>
                Recent
            </p>

            {pdfs.length === 0 ? (
                <p style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "13px", color: "rgba(255,255,255,0.22)",
                    lineHeight: "1.6",
                }}>
                    Your uploaded PDFs will appear here.
                </p>
            ) : (
                <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                    {pdfs.map((pdf) => {
                        const isActive = selectedPDF?._id === pdf._id;
                        return (
                            <li key={pdf._id}>
                                <button
                                    onClick={() => onSelect(pdf)}
                                    style={{
                                        width: "100%", display: "flex", alignItems: "center", gap: "11px",
                                        padding: "10px 12px", borderRadius: "10px", cursor: "pointer",
                                        transition: "all 0.16s ease", border: "none", textAlign: "left",
                                        background: isActive ? "rgba(212, 175, 120, 0.1)" : "transparent",
                                        outline: isActive ? "1px solid rgba(212, 175, 120, 0.25)" : "1px solid transparent",
                                        marginBottom: "4px",
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isActive) e.currentTarget.style.background = "var(--rw-border)";
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive) e.currentTarget.style.background = "transparent";
                                    }}
                                >
                                    {/* PDF icon */}
                                    <div style={{
                                        width: "32px", height: "32px", flexShrink: 0,
                                        background: isActive ? "rgba(212, 175, 120, 0.15)" : "var(--rw-hover-bg)",
                                        borderRadius: "8px",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: "14px",
                                    }}>
                                        📄
                                    </div>

                                    {/* File info */}
                                    <div style={{ overflow: "hidden", flex: 1 }}>
                                        <p style={{
                                            fontFamily: "'DM Sans', sans-serif",
                                            fontSize: "13px",
                                            fontWeight: "500",
                                            color: isActive ? "var(--rw-accent)" : "rgba(255,255,255,0.75)",
                                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                            margin: 0,
                                        }}>
                                            {pdf.originalName.replace(".pdf", "")}
                                        </p>
                                        <p style={{
                                            fontFamily: "'DM Sans', sans-serif",
                                            fontSize: "11px",
                                            color: "rgba(255,255,255,0.28)",
                                            margin: "2px 0 0",
                                        }}>
                                            {(pdf.fileSize / 1024).toFixed(0)} KB · {new Date(pdf.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                        </p>
                                    </div>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default RecentUploads;