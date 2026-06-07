import { useEffect, useCallback } from "react";

export function usePdfNavigation(pdfs, selectedPDF, setSelectedPDF) {
  // Initialize the base history state if not present, and handle deep links
  useEffect(() => {
    // Check if URL is a deep link like /reader/:id
    const path = window.location.pathname;
    const match = path.match(/^\/reader\/([a-f0-9]{24})$/i); // MongoDB ObjectId regex

    if (match && match[1]) {
      const pdfIdFromUrl = match[1];
      const found = pdfs.find(p => p._id === pdfIdFromUrl);
      if (found) {
        window.history.replaceState({ view: "reader", pdfId: pdfIdFromUrl }, "", `/reader/${pdfIdFromUrl}`);
        setSelectedPDF(found);
        return;
      }
    }

    if (!window.history.state || window.history.state.view !== "library") {
      // If we are currently showing a PDF (e.g. from hot-reload), ensure history state reflects it.
      if (selectedPDF) {
        window.history.replaceState({ view: "reader", pdfId: selectedPDF._id }, "", `/reader/${selectedPDF._id}`);
      } else {
        window.history.replaceState({ view: "library" }, "", "/");
      }
    }
  }, [pdfs]);

  // Listen for browser Back/Forward (popstate)
  useEffect(() => {
    const handlePopState = (e) => {
      const state = e.state;
      if (state && state.view === "reader" && state.pdfId) {
        const pdf = pdfs.find((p) => p._id === state.pdfId);
        if (pdf) {
          setSelectedPDF(pdf);
        } else {
          // If PDF was deleted or not found, fall back to library
          window.history.replaceState({ view: "library" }, "", "/");
          setSelectedPDF(null);
        }
      } else {
        // State is library or null
        setSelectedPDF(null);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [pdfs, setSelectedPDF]);

  const openPdf = useCallback((pdf) => {
    if (!pdf) return;
    
    // Prevent duplicate entries if we are already viewing this exact PDF
    const currentState = window.history.state;
    if (currentState && currentState.view === "reader" && currentState.pdfId === pdf._id) {
      return; 
    }

    // Push new state
    window.history.pushState({ view: "reader", pdfId: pdf._id }, "", `/reader/${pdf._id}`);
    setSelectedPDF(pdf);
  }, [setSelectedPDF]);

  const closePdf = useCallback(() => {
    // If we're already at the library state, do nothing
    const currentState = window.history.state;
    if (currentState && currentState.view === "library") {
      setSelectedPDF(null);
      return;
    }

    window.history.pushState({ view: "library" }, "", "/");
    setSelectedPDF(null);
  }, [setSelectedPDF]);

  const goBackToLibrary = useCallback(() => {
    // If the history indicates we came from the library, use native back
    // This allows native Forward to work afterwards.
    // We check if history length > 1, but technically we can just try history.back()
    // if we know the previous state was the library.
    // A robust way: if we are in "reader" state, just call back().
    // The popstate listener will handle setting selectedPDF to null.
    if (window.history.state && window.history.state.view === "reader") {
      window.history.back();
    } else {
      // Fallback
      closePdf();
    }
  }, [closePdf]);

  return { openPdf, closePdf, goBackToLibrary };
}
