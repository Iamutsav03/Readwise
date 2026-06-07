// hooks/usePdfLibrarySearch.js
// Client-side, instant search over the PDF list by originalName.
// No backend call — filters the already-loaded list.

import { useState, useMemo } from "react";

const usePdfLibrarySearch = (pdfs = []) => {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pdfs;
    return pdfs.filter((p) =>
      p.originalName.toLowerCase().includes(q)
    );
  }, [pdfs, query]);

  return { query, setQuery, filtered };
};

export default usePdfLibrarySearch;
