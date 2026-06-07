import { useState, useEffect, useRef, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import LandingContent from "../components/Landingcontent";
import ReaderLayout from "../components/ReaderLayout";
import { fetchAllPDFs, uploadPDF, updatePdfLastOpened } from "../utils/api";
import { deletePdf, toggleFavorite, renamePdf } from "../services/pdfActions";
import { usePdfNavigation } from "../hooks/usePdfNavigation";

const Home = ({ selectedPDF, setSelectedPDF }) => {
  const [pdfs, setPdfs] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1);
  const fileInputRef = useRef(null);
  const viewerRef = useRef(null);

  const { openPdf, closePdf, goBackToLibrary } = usePdfNavigation(pdfs, selectedPDF, setSelectedPDF);

  useEffect(() => {
    fetchAllPDFs().then(setPdfs).catch(console.error);
  }, []);

  // ── Upload ──────────────────────────────────────────────────────────────────
  const handleUploadSuccess = useCallback((newPDF) => {
    setPdfs((prev) => [newPDF, ...prev]);
    openPdf(newPDF);
    setPageNumber(1); setScale(1); setNumPages(0);
  }, [openPdf]);

  const handleFileInputChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      alert("Please select a valid PDF file.");
      return;
    }
    const formData = new FormData();
    formData.append("pdf", file);
    uploadPDF(formData)
      .then((data) => handleUploadSuccess(data.pdf))
      .catch(() => alert("Upload failed. Make sure the backend is running."))
      .finally(() => { if (fileInputRef.current) fileInputRef.current.value = null; });
  }, [handleUploadSuccess]);

  // ── Select / open a PDF (also updates lastOpenedAt) ─────────────────────────
  const handleSelectPdf = useCallback(async (pdf) => {
    // Optimistically update local state
    const now = new Date().toISOString();
    setPdfs((prev) =>
      prev.map((p) => p._id === pdf._id ? { ...p, lastOpenedAt: now } : p)
    );
    
    // openPdf handles history and setSelectedPDF
    openPdf({ ...pdf, lastOpenedAt: now });
    
    setPageNumber(1); setScale(1); setNumPages(0);

    // Persist to DB silently
    updatePdfLastOpened(pdf._id).catch(console.error);
  }, [openPdf]);

  // ── Remove / clear ─────────────────────────────────────────────────────────
  const handleRemovePdf = useCallback(() => {
    closePdf();
    setPageNumber(1); setScale(1); setNumPages(0);
  }, [closePdf]);

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDeletePdf = useCallback(async (pdfId) => {
    try {
      await deletePdf(pdfId);
      setPdfs((prev) => prev.filter((p) => p._id !== pdfId));
      if (selectedPDF?._id === pdfId) closePdf();
    } catch (err) {
      console.error(err);
      alert("Failed to delete PDF");
    }
  }, [selectedPDF, closePdf]);

  // ── Favorite ───────────────────────────────────────────────────────────────
  const handleFavorite = useCallback(async (pdfId) => {
    // Optimistic flip
    setPdfs((prev) =>
      prev.map((p) => p._id === pdfId ? { ...p, isFavorite: !p.isFavorite } : p)
    );
    try {
      const updated = await toggleFavorite(pdfId);
      setPdfs((prev) =>
        prev.map((p) => p._id === pdfId ? { ...p, isFavorite: updated.isFavorite } : p)
      );
    } catch (err) {
      // Roll back on error
      setPdfs((prev) =>
        prev.map((p) => p._id === pdfId ? { ...p, isFavorite: !p.isFavorite } : p)
      );
      console.error(err);
    }
  }, []);

  // ── Rename ─────────────────────────────────────────────────────────────────
  const handleRename = useCallback(async (pdfId, newName) => {
    // Optimistic update
    setPdfs((prev) =>
      prev.map((p) => p._id === pdfId ? { ...p, originalName: newName } : p)
    );
    try {
      const updated = await renamePdf(pdfId, newName);
      setPdfs((prev) =>
        prev.map((p) => p._id === pdfId ? { ...p, originalName: updated.originalName } : p)
      );
    } catch (err) {
      console.error("Rename failed:", err);
      // Silently revert happens on next fetchAllPDFs, not critical
    }
  }, []);

  // ── Viewer controls ────────────────────────────────────────────────────────
  const goPrev = useCallback(() => setPageNumber((p) => Math.max(p - 1, 1)), []);
  const goNext = useCallback(() => setPageNumber((p) => Math.min(p + 1, numPages)), [numPages]);
  const zoomIn = useCallback(() => setScale((s) => parseFloat(Math.min(s + 0.25, 15).toFixed(3))), []);
  const zoomOut = useCallback(() => setScale((s) => parseFloat(Math.max(s - 0.25, 0.5).toFixed(3))), []);
  const fitToScreen = useCallback(() => viewerRef.current?.fitToScreen?.(), []);
  const handleUploadClick = () => fileInputRef.current?.click();

  // ── Library stats (for landing page) ──────────────────────────────────────
  const favCount = pdfs.filter((p) => p.isFavorite).length;
  const mostRecent = pdfs[0] || null; // already sorted by lastOpenedAt desc

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#f7f4ef" }}>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        style={{ display: "none" }}
        onChange={handleFileInputChange}
      />
      
      {/* ── Reader Mode ───────────────────────────────────────────────────────── */}
      {selectedPDF && (
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          <ReaderLayout
            pdf={selectedPDF}
            viewerRef={viewerRef}
            pageNumber={pageNumber}
            numPages={numPages}
            scale={scale}
            onPageChange={setPageNumber}
            onScaleChange={setScale}
            onNumPagesChange={setNumPages}
            onUploadClick={handleUploadClick}
            onPrev={goPrev}
            onNext={goNext}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onFit={fitToScreen}
            fileInputRef={fileInputRef}
            onFileChange={handleFileInputChange}
          />
        </div>
      )}

      {/* ── Library / Home Mode ─────────────────────────────────────────────── */}
      <div style={{ display: selectedPDF ? "none" : "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar
          pdfs={pdfs}
          selectedPDF={selectedPDF}
          onUploadSuccess={handleUploadSuccess}
          onSelect={handleSelectPdf}
          fileInputRef={fileInputRef}
          onRemovePdf={handleDeletePdf}
          onFavorite={handleFavorite}
          onRename={handleRename}
        />
        <main id="lc-scroll-host" style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
          <LandingContent
            onUploadClick={handleUploadClick}
          />
        </main>
      </div>
    </div>
  );
};

export default Home;