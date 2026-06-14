// hooks/useBreakpoints.js
import { useState, useEffect } from "react";

export function useBreakpoints() {
  const [breakpoints, setBreakpoints] = useState({
    isMobileSmall: false,
    isMobile: false,
    isTablet: false,
    isLaptop: false,
    isDesktop: false,
    isUltrawide: false,
    isSuperUltrawide: false,
    // Aggregates for convenience
    isMobileOrSmaller: false,
    isTabletOrSmaller: false,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setBreakpoints({
        isMobileSmall: width < 480,
        isMobile: width >= 480 && width < 768,
        isTablet: width >= 768 && width < 1024,
        isLaptop: width >= 1024 && width < 1366,
        isDesktop: width >= 1366 && width < 1920,
        isUltrawide: width >= 1920 && width < 2560,
        isSuperUltrawide: width >= 2560,
        // Aggregates
        isMobileOrSmaller: width < 768,
        isTabletOrSmaller: width < 1024,
      });
    };

    // Initial check
    handleResize();

    // Listen to resize
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return breakpoints;
}
