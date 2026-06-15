import { useState, useEffect } from "react";

/**
 * Custom hook to detect if a media query matches.
 * @param {string} query - The CSS media query (e.g., "(max-width: 768px)")
 * @returns {boolean} True if the media query matches, false otherwise.
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    // Check initially if window is defined (SSR safety, though this is CRA)
    if (typeof window !== "undefined") {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    const documentChangeHandler = (e) => setMatches(e.matches);

    // Some older browsers might not support addEventListener on MediaQueryList
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener("change", documentChangeHandler);
    } else {
      mediaQueryList.addListener(documentChangeHandler);
    }

    return () => {
      if (mediaQueryList.removeEventListener) {
        mediaQueryList.removeEventListener("change", documentChangeHandler);
      } else {
        mediaQueryList.removeListener(documentChangeHandler);
      }
    };
  }, [query]);

  return matches;
}
