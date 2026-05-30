import { useState, useEffect, useRef, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import LandingContent from "../components/Landingcontent";
import ReaderLayout from "../components/ReaderLayout";
import { fetchAllPDFs, uploadPDF , deletePDF } from "../utils/api";

const Home = ({ selectedPDF, setSelectedPDF }) => {
  const [pdfs, setPdfs] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1);
  const fileInputRef = useRef(null);
  const viewerRef = useRef(null);

  useEffect(() => {
    fetchAllPDFs().then(setPdfs).catch(console.error);
  }, []);

  const handleUploadSuccess = useCallback((newPDF) => {
    setPdfs((prev) => [newPDF, ...prev]);
    setSelectedPDF(newPDF);
    setPageNumber(1); setScale(1); setNumPages(0);
  }, [setSelectedPDF]);

  const handleRemovePdf = useCallback(() => {
    setSelectedPDF(null);
    setPageNumber(1); setScale(1); setNumPages(0);
  }, [setSelectedPDF]);

  const handleFileInputChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") { alert("Please select a valid PDF file."); return; }
    const formData = new FormData();
    formData.append("pdf", file);
    uploadPDF(formData)
      .then((data) => handleUploadSuccess(data.pdf))
      .catch(() => alert("Upload failed. Make sure the backend is running."))
      .finally(() => { if (fileInputRef.current) fileInputRef.current.value = null; });
  }, [handleUploadSuccess]);

  const handleDeletePdf = async (pdfId) => {
    console.log("Deleting:", pdfId);
    try {
      await deletePDF(pdfId);

      setPdfs((prev) =>
        prev.filter((pdf) => pdf._id !== pdfId)
      );

      if (selectedPDF?._id === pdfId) {
        setSelectedPDF(null);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete PDF");
    }
  };

  const goPrev = useCallback(() => setPageNumber((p) => Math.max(p - 1, 1)), []);
  const goNext = useCallback(() => setPageNumber((p) => Math.min(p + 1, numPages)), [numPages]);
  const zoomIn = useCallback(() => setScale((s) => parseFloat(Math.min(s + 0.25, 15).toFixed(3))), []);
  const zoomOut = useCallback(() => setScale((s) => parseFloat(Math.max(s - 0.25, 0.5).toFixed(3))), []);
  const fitToScreen = useCallback(() => viewerRef.current?.fitToScreen?.(), []);
  const handleUploadClick = () => fileInputRef.current?.click();

  if (selectedPDF) {
    return (
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
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#f7f4ef" }}>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        style={{ display: "none" }}
        onChange={handleFileInputChange}
      />
      <Sidebar
        pdfs={pdfs}
        selectedPDF={selectedPDF}
        onUploadSuccess={handleUploadSuccess}
        onSelect={setSelectedPDF}
        fileInputRef={fileInputRef}
        onRemovePdf={handleDeletePdf}
      />
      <main id="lc-scroll-host" style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
        <LandingContent onUploadClick={handleUploadClick} />
      </main>
    </div>
  );
};

export default Home;