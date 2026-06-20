import { useState, useMemo } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { getPDFViewURL } from "../services/pdfService";
import { FileText } from "lucide-react";
import { useInView } from "react-intersection-observer";

// Ensure worker is set up
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const PdfThumbnail = ({ pdf, active }) => {
  const [numPages, setNumPages] = useState(null);
  const [error, setError] = useState(false);
  const { ref, inView } = useInView({ triggerOnce: true, rootMargin: "200px 0px" });

  const url = useMemo(() => getPDFViewURL(pdf.fileName), [pdf.fileName]);

  const onDocumentLoadSuccess = ({ numPages }) => setNumPages(numPages);
  const onDocumentLoadError = () => setError(true);

  return (
    <div 
      ref={ref}
      style={{
        width: 32, height: 42, 
        borderRadius: 4, flexShrink: 0,
        background: active ? "rgba(200,164,106,0.18)" : "var(--rw-card-bg)",
        border: `1px solid ${active ? "var(--rw-accent)" : "var(--rw-border)"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden", position: "relative",
        transition: "all 0.15s ease",
        color: active ? "var(--rw-accent)" : "var(--rw-text-secondary)"
      }}
    >
      {inView && !error ? (
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={<FileText size={16} opacity={0.3} />}
          error={<FileText size={16} opacity={0.6} />}
        >
          <Page 
            pageNumber={1} 
            width={32} 
            renderTextLayer={false} 
            renderAnnotationLayer={false}
            loading={null}
          />
        </Document>
      ) : (
        <FileText size={16} />
      )}
      {active && (
        <div style={{
          position: "absolute", top: -2, right: -2,
          width: 6, height: 6, borderRadius: "50%", background: "var(--rw-accent)",
          border: "1px solid var(--rw-card-bg)"
        }} />
      )}
    </div>
  );
};

export default PdfThumbnail;
