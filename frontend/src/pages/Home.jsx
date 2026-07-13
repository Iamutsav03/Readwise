import { useState, useEffect, useRef, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import LandingContent from "../components/Landingcontent";
import ReaderLayout from "../components/ReaderLayout";
import VocabularyVault from "../features/vocabulary/components/VocabularyVault";
import { Menu } from "lucide-react";
import { fetchAllPDFs, uploadPDF, updatePdfLastOpened } from "../utils/api";
import { deletePdf, toggleFavorite, renamePdf } from "../services/pdfActions";
import { usePdfNavigation } from "../hooks/usePdfNavigation";
import { useBreakpoints } from "../hooks/useBreakpoints";
import { useAuth } from "../features/auth/useAuth";
import { useGuestSessionContext } from "../features/auth/GuestSessionContext";
import PremiumModal from "../components/ui/PremiumModal";
import AuthPage from "../features/auth/AuthPage";

const Home = ({ selectedPDF, setSelectedPDF }) => {
  const [pdfs, setPdfs] = useState([]);
  const [activeView, setActiveView] = useState("library"); // library, reader, vocabulary
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const { user } = useAuth();
  const { openPremiumModal, canUploadPdf, incrementUploadCount } = useGuestSessionContext();
  // Auth modal: shown as overlay when guest clicks a locked action
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalDefaultTab, setAuthModalDefaultTab] = useState("signup"); // 'signup' | 'login'
  const [scale, setScale] = useState(() => {
    const saved = localStorage.getItem("rw_scale");
    return saved ? parseFloat(saved) : 1;
  });

  useEffect(() => {
    localStorage.setItem("rw_scale", scale.toString());
  }, [scale]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);
  const fileInputRef = useRef(null);
  const viewerRef = useRef(null);
  const { isMobileOrSmaller } = useBreakpoints();
  
  // Swipe detection refs
  const touchStart = useRef({ x: null, y: null });
  const touchEnd = useRef({ x: null, y: null });

  const { openPdf, closePdf, openVault, goBackToLibrary } = usePdfNavigation(pdfs, selectedPDF, setSelectedPDF, activeView, setActiveView);

  useEffect(() => {
    fetchAllPDFs().then(setPdfs).catch(console.error);
  }, []);

  // ── Upload with guest limit check ───────────────────────────────────────────
  const handleUploadSuccess = useCallback((newPDF) => {
    setPdfs((prev) => [newPDF, ...prev]);
    openPdf(newPDF);
    setPageNumber(1); setNumPages(0);
    if (!user) incrementUploadCount();
  }, [openPdf, user, incrementUploadCount]);

  const checkUploadAllowed = useCallback(() => {
    if (!user && !canUploadPdf) {
      openPremiumModal("upload-limit");
      return false;
    }
    return true;
  }, [user, canUploadPdf, openPremiumModal]);

  const handleFileInputChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!checkUploadAllowed()) { e.target.value = null; return; }
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
  }, [handleUploadSuccess, checkUploadAllowed]);

  const handleGlobalDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleGlobalDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleGlobalDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleGlobalDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
    
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!checkUploadAllowed()) return;
    if (file.type !== "application/pdf") {
      alert("Only PDF files are supported.");
      return;
    }
    const formData = new FormData();
    formData.append("pdf", file);
    uploadPDF(formData)
      .then((data) => handleUploadSuccess(data.pdf))
      .catch((err) => {
        console.error("Home upload error:", err);
        alert(`Upload failed: ${err.message || "Unknown error"}`);
      })
  }, [handleUploadSuccess, checkUploadAllowed]);

  // ── Select / open a PDF (also updates lastOpenedAt) ─────────────────────────
  const handleSelectPdf = useCallback((pdf) => {
    if (isMobileOrSmaller) setIsSidebarOpen(false);
    updatePdfLastOpened(pdf._id).catch(console.error);
    const updated = { ...pdf, lastOpenedAt: new Date().toISOString() };
    setPdfs(prev => prev.map(p => p._id === pdf._id ? updated : p));
    openPdf(updated);
  }, [isMobileOrSmaller, openPdf]);

  // ── Remove / clear ─────────────────────────────────────────────────────────
  const handleGoBack = useCallback(() => {
    goBackToLibrary();
  }, [goBackToLibrary]);

  const handleJumpToSource = useCallback((pdfId, pageNum) => {
    const pdf = pdfs.find(p => String(p._id) === String(pdfId));
    if (pdf) {
      handleSelectPdf(pdf);
      setPageNumber(pageNum || 1);
    }
  }, [pdfs, handleSelectPdf]);

  const handleRemovePdf = useCallback(() => {
    closePdf();
    setPageNumber(1); setNumPages(0);
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

  // ── Swipe to toggle mobile menu ───────────────────────────────────────────
  const onTouchStart = (e) => {
    touchEnd.current = { x: null, y: null };
    touchStart.current = { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY };
  };

  const onTouchMove = (e) => {
    touchEnd.current = { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY };
  };

  const onTouchEnd = () => {
    if (!touchStart.current.x || !touchEnd.current.x) return;
    const dx = touchStart.current.x - touchEnd.current.x;
    const dy = Math.abs(touchStart.current.y - touchEnd.current.y);
    
    // Ignore if mostly scrolling vertically
    if (dy > 40) return;

    if (dx > 50 && isSidebarOpen) {
      // Swiped left
      setIsSidebarOpen(false);
    } else if (dx < -50 && !isSidebarOpen && touchStart.current.x < 100) {
      // Swiped right from the left edge (to avoid accidental menu opening)
      setIsSidebarOpen(true);
    }
  };

  return (
    <div 
      onDragEnter={handleGlobalDragEnter}
      onDragLeave={handleGlobalDragLeave}
      onDragOver={handleGlobalDragOver}
      onDrop={handleGlobalDrop}
      style={{ display: "flex", height: "100dvh", overflow: "hidden", background: "var(--rw-app-bg)", position: "relative" }}
    >
      {/* Global Drag & Drop Overlay */}
      {isDragging && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(42,32,16,0.3)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          pointerEvents: "none" // Let drops pass through to the container
        }}>
          <div style={{
            background: "var(--rw-card-bg)", padding: "40px 60px",
            borderRadius: 16, border: "2px dashed var(--rw-accent)",
            boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
            textAlign: "center"
          }}>
            <h2 style={{ fontFamily: "'Playfair Display',serif", margin: "0 0 8px", fontSize: 24, color: "var(--rw-text-primary)" }}>Drop PDF Anywhere</h2>
            <p style={{ fontFamily: "'DM Sans',sans-serif", margin: 0, fontSize: 14, color: "var(--rw-text-secondary)" }}>Release to Upload and Open</p>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        style={{ display: "none" }}
        onChange={handleFileInputChange}
      />
      
      {/* ── Reader Mode ───────────────────────────────────────────────────────── */}
      {activeView === "reader" && selectedPDF && (
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
            onRemove={handleRemovePdf}
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

      {/* ── Vocabulary Vault (blocked for guests) ─────────────────────────────── */}
      {activeView === "vocabulary" && (
        user ? (
          <div style={{ flex: 1, overflow: "auto", padding: "20px" }}>
            <VocabularyVault 
              pdfs={pdfs} 
              onJumpToSource={handleJumpToSource}
              onBack={handleGoBack}
            />
          </div>
        ) : (
          // Redirect guest away and open modal
          (() => { goBackToLibrary(); openPremiumModal("vocabulary-vault"); return null; })()
        )
      )}

      {/* ── Library / Home Mode ─────────────────────────────────────────────── */}
      <div 
        onTouchStart={isMobileOrSmaller && activeView === "library" ? onTouchStart : undefined}
        onTouchMove={isMobileOrSmaller && activeView === "library" ? onTouchMove : undefined}
        onTouchEnd={isMobileOrSmaller && activeView === "library" ? onTouchEnd : undefined}
        style={{ display: activeView === "library" ? "flex" : "none", flex: 1, overflow: "hidden", position: "relative" }}
      >
        {/* Mobile backdrop overlay */}
        {isMobileOrSmaller && isSidebarOpen && (
          <div 
            onClick={() => setIsSidebarOpen(false)}
            style={{
              position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
              background: "var(--rw-popup-bg)", opacity: 0.8, zIndex: 40,
              backdropFilter: "blur(2px)",
              transition: "opacity 0.3s ease"
            }}
          />
        )}
        
        <Sidebar
          pdfs={pdfs}
          selectedPDF={selectedPDF}
          onUploadSuccess={handleUploadSuccess}
          onSelect={handleSelectPdf}
          onOpenVault={() => {
            if (!user) { openPremiumModal("vocabulary-vault"); return; }
            openVault();
            if (isMobileOrSmaller) setIsSidebarOpen(false);
          }}
          onRemovePdf={handleDeletePdf}
          onFavorite={handleFavorite}
          onRename={handleRename}
          fileInputRef={fileInputRef}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <main id="lc-scroll-host" style={{ flex: 1, overflow: "hidden", position: "relative" }}>
          {isMobileOrSmaller && (
            <button 
              onClick={() => setIsSidebarOpen(true)}
              style={{
                position: "absolute", top: "16px", left: "16px", zIndex: 10,
                background: "var(--rw-card-bg)", color: "var(--rw-text-primary)",
                border: "1px solid var(--rw-border)", borderRadius: "8px",
                width: "44px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)", cursor: "pointer"
              }}
            >
              <Menu size={20} />
            </button>
          )}
          <LandingContent
            onUploadClick={handleUploadClick}
          />
        </main>
      </div>

      {/* ── Global Freemium Components ──────────────────────────────────────── */}
      <PremiumModal
        onSignup={() => { setAuthModalDefaultTab("signup"); setAuthModalOpen(true); }}
        onSignin={() => { setAuthModalDefaultTab("login"); setAuthModalOpen(true); }}
      />

      {/* ── Inline Auth Modal ──────────────────────────────────────────────── */}
      {authModalOpen && (
        <AuthPage
          defaultTab={authModalDefaultTab}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={() => setAuthModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Home;