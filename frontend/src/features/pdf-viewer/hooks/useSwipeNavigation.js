// features/pdf-viewer/hooks/useSwipeNavigation.js
// Detects horizontal swipe gestures for mobile page navigation.
// Physics:
//   - Minimum horizontal distance: 60px
//   - Minimum velocity: 0.3 px/ms
//   - Vertical cancel guard: |deltaY| > |deltaX| * 0.35 → cancel
//   - Text selection guard: cancel if user has text selected
//   - isBlocked guard: cancel if a modal / bottom-sheet is open
// Visual feedback:
//   - Page peek: containerRef receives a CSS translate during swipe
import { useEffect, useRef, useCallback } from "react";

const MIN_DISTANCE = 60;     // px
const MIN_VELOCITY = 0.3;    // px/ms
const VERTICAL_RATIO = 0.35; // |deltaY| / |deltaX| threshold — above this = vertical scroll

/**
 * @param {React.RefObject} containerRef   - the element to listen on
 * @param {function}        onPrev         - navigate to previous page
 * @param {function}        onNext         - navigate to next page
 * @param {boolean}         isBlocked      - true when a modal/bottom-sheet is open
 * @param {boolean}         enabled        - master switch (false on desktop)
 * @param {number}          pageNumber     - current page
 * @param {number}          numPages       - total pages
 */
export function useSwipeNavigation({
  containerRef,
  onPrev,
  onNext,
  isBlocked = false,
  enabled = true,
  pageNumber = 1,
  numPages = 1,
}) {
  const touch = useRef(null); // { x, y, time }
  const peekApplied = useRef(false);

  const applyPeek = useCallback((direction) => {
    if (!containerRef.current || peekApplied.current) return;
    peekApplied.current = true;
    const el = containerRef.current;
    el.style.transition = "transform 0.12s ease-out, opacity 0.12s ease-out";
    el.style.transform = direction === "left"
      ? "translateX(-8px)"
      : "translateX(8px)";
    el.style.opacity = "0.92";
  }, [containerRef]);

  const resetPeek = useCallback(() => {
    if (!containerRef.current || !peekApplied.current) return;
    peekApplied.current = false;
    const el = containerRef.current;
    el.style.transition = "transform 0.18s ease-out, opacity 0.18s ease-out";
    el.style.transform = "";
    el.style.opacity = "";
  }, [containerRef]);

  useEffect(() => {
    if (!enabled) return;

    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e) => {
      if (isBlocked) return;
      // Don't start if user has text selected
      if (window.getSelection()?.toString()) return;
      const t = e.touches[0];
      touch.current = { x: t.clientX, y: t.clientY, time: Date.now() };
    };

    const onTouchMove = (e) => {
      if (!touch.current || isBlocked) return;
      const t = e.touches[0];
      const deltaX = t.clientX - touch.current.x;
      const deltaY = t.clientY - touch.current.y;

      // Cancel if motion is primarily vertical
      if (Math.abs(deltaY) > Math.abs(deltaX) * (1 / VERTICAL_RATIO)) {
        touch.current = null;
        resetPeek();
        return;
      }

      // Show peek effect after 15px to give visual feedback
      if (Math.abs(deltaX) > 15) {
        if (deltaX < 0 && pageNumber < numPages) {
          applyPeek("left");   // going forward
        } else if (deltaX > 0 && pageNumber > 1) {
          applyPeek("right");  // going backward
        }
      }
    };

    const onTouchEnd = (e) => {
      resetPeek();
      if (!touch.current || isBlocked) {
        touch.current = null;
        return;
      }
      // Check text selection — user may have selected text during the gesture
      if (window.getSelection()?.toString()) {
        touch.current = null;
        return;
      }

      const now = Date.now();
      const lastTouch = e.changedTouches[0];
      const deltaX = lastTouch.clientX - touch.current.x;
      const deltaY = lastTouch.clientY - touch.current.y;
      const deltaTime = now - touch.current.time;
      touch.current = null;

      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      // Cancel if movement was primarily vertical
      if (absDeltaY > absDeltaX * (1 / VERTICAL_RATIO)) return;

      // Cancel if didn't meet distance threshold
      if (absDeltaX < MIN_DISTANCE) return;

      // Cancel if didn't meet velocity threshold
      const velocity = absDeltaX / deltaTime;
      if (velocity < MIN_VELOCITY) return;

      if (deltaX < 0 && pageNumber < numPages) {
        onNext();   // swipe left → next page
      } else if (deltaX > 0 && pageNumber > 1) {
        onPrev();   // swipe right → prev page
      }
    };

    const onTouchCancel = () => {
      resetPeek();
      touch.current = null;
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("touchcancel", onTouchCancel, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchCancel);
      resetPeek();
    };
  }, [enabled, isBlocked, onPrev, onNext, pageNumber, numPages, applyPeek, resetPeek, containerRef]);
}
