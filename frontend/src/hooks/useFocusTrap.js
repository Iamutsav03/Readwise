import { useEffect, useRef } from "react";

export function useFocusTrap(isActive, containerRef, onClose) {
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      // Save current focus
      previousFocusRef.current = document.activeElement;

      // Find all focusable elements inside container
      if (containerRef.current) {
        const focusableElements = containerRef.current.querySelectorAll(
          'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (firstElement) {
          firstElement.focus();
        }

        const handleKeyDown = (e) => {
          if (e.key === "Escape" && onClose) {
            onClose();
            e.preventDefault();
            return;
          }

          if (e.key !== "Tab") return;

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement.focus();
              e.preventDefault();
            }
          }
        };

        containerRef.current.addEventListener("keydown", handleKeyDown);
        
        return () => {
          if (containerRef.current) {
            containerRef.current.removeEventListener("keydown", handleKeyDown);
          }
        };
      }
    } else {
      // Restore focus on close
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === "function") {
        previousFocusRef.current.focus();
      }
    }
  }, [isActive, containerRef, onClose]);
}
