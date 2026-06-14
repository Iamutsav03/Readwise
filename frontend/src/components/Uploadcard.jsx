// src/components/UploadCard.jsx
// Upload zone used inside the Sidebar

import { useState, useCallback } from "react";
import { uploadPDF } from "../utils/api";

const UploadCard = ({ onUploadSuccess, fileInputRef, triggerUpload }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [dragging, setDragging] = useState(false);

    const validateAndSet = (file) => {
        setError("");
        if (!file) return;
        if (file.type !== "application/pdf") {
            setError("Only PDF files are supported.");
            return;
        }
        setSelectedFile(file);
    };

    const handleFileChange = (e) => validateAndSet(e.target.files?.[0]);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setDragging(false);
        validateAndSet(e.dataTransfer.files?.[0]);
    }, []);

    const handleDragOver = (e) => { e.preventDefault(); setDragging(true); };
    const handleDragLeave = () => setDragging(false);

    const handleUpload = async () => {
        if (!selectedFile) return;
        setUploading(true);
        setError("");
        try {
            const formData = new FormData();
            formData.append("pdf", selectedFile);
            const data = await uploadPDF(formData);
            onUploadSuccess(data.pdf);
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = null;
        } catch (err) {
            console.error(err);
            setError("Upload failed. Is the backend running?");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div>
            <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "11px", color: "rgba(255,255,255,0.28)",
                textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px",
            }}>
                Upload
            </p>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                style={{ display: "none" }}
                onChange={handleFileChange}
            />

            {/* Drop zone */}
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={triggerUpload}
                style={{
                    border: dragging
                        ? "1.5px dashed rgba(212, 175, 120, 0.6)"
                        : "1.5px dashed rgba(255,255,255,0.12)",
                    borderRadius: "12px",
                    padding: "24px 16px",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    background: dragging
                        ? "rgba(212, 175, 120, 0.05)"
                        : "rgba(255,255,255,0.02)",
                }}
            >
                <div style={{
                    width: "40px", height: "40px", margin: "0 auto 10px",
                    background: "var(--rw-hover-bg)", borderRadius: "10px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "18px",
                }}>
                    {dragging ? "📂" : "📄"}
                </div>
                <p style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "13px", color: "rgba(255,255,255,0.55)",
                    marginBottom: "4px", fontWeight: "500",
                }}>
                    {selectedFile ? selectedFile.name : "Drop a PDF here"}
                </p>
                <p style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "11.5px", color: "rgba(255,255,255,0.25)",
                }}>
                    {selectedFile
                        ? `${(selectedFile.size / 1024).toFixed(0)} KB`
                        : "or click to browse · max 20MB"}
                </p>
            </div>

            {/* Error */}
            {error && (
                <p style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "12px", color: "#f08080", marginTop: "8px",
                }}>
                    {error}
                </p>
            )}

            {/* Upload button */}
            <button
                onClick={handleUpload}
                disabled={uploading || !selectedFile}
                style={{
                    width: "100%", padding: "11px 0",
                    borderRadius: "10px",
                    background: selectedFile ? "var(--rw-accent)" : "var(--rw-hover-bg)",
                    color: selectedFile ? "#0f0f0f" : "rgba(255,255,255,0.25)",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "13.5px", fontWeight: "500",
                    letterSpacing: "0.02em", border: "none", cursor: selectedFile ? "pointer" : "not-allowed",
                    transition: "all 0.18s ease", marginTop: "12px",
                }}
                onMouseEnter={(e) => {
                    if (selectedFile && !uploading) {
                        e.currentTarget.style.background = "#e0c088";
                        e.currentTarget.style.transform = "translateY(-1px)";
                    }
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = selectedFile ? "var(--rw-accent)" : "var(--rw-hover-bg)";
                    e.currentTarget.style.transform = "translateY(0)";
                }}
            >
                {uploading ? "Uploading…" : "Upload PDF"}
            </button>
        </div>
    );
};

export default UploadCard;