// src/components/ui/BottomSheet.jsx
// Mobile bottom sheet — moved from MobileBottomSheet.jsx into components/ui/.
// All original logic preserved exactly.

import React, { useState, useEffect, useRef } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useFocusTrap } from "../../hooks/useFocusTrap";

/**
 * A bottom sheet for mobile that slides up and can be dismissed via drag or tap.
 *
 * @param {boolean}  isOpen
 * @param {Function} onClose
 * @param {string}   title
 * @param {ReactNode} children
 * @param {Function} [onHeightChange]
 * @param {boolean}  [fullScreen=false]
 */
const BottomSheet = ({ isOpen, onClose, title, children, onHeightChange, fullScreen = false }) => {
  const initialHeight = fullScreen ? 95 : 50;
  const [heightPct, setHeightPct] = useState(initialHeight);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(isOpen);

  const startY = useRef(0);
  const startHeightRef = useRef(initialHeight);
  const containerRef = useRef(null);

  useFocusTrap(isOpen, containerRef, onClose);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      requestAnimationFrame(() => setIsAnimating(true));
      if (onHeightChange) onHeightChange(heightPct);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setHeightPct(initialHeight);
      }, 300);
      if (onHeightChange) onHeightChange(0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && onHeightChange) onHeightChange(heightPct);
  }, [heightPct, isOpen, onHeightChange]);

  const handleTouchStart = (e) => {
    setIsDragging(true);
    startY.current = e.touches[0].clientY;
    startHeightRef.current = heightPct;
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const deltaY   = startY.current - e.touches[0].clientY;
    const deltaPct = (deltaY / window.innerHeight) * 100;
    let newHeight  = Math.max(15, Math.min(startHeightRef.current + deltaPct, fullScreen ? 98 : 88));
    setHeightPct(newHeight);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (heightPct < 20) { onClose(); return; }
    const snaps = fullScreen ? [50, 95] : [50, 85];
    const closest = snaps.reduce((prev, curr) =>
      Math.abs(curr - heightPct) < Math.abs(prev - heightPct) ? curr : prev
    );
    setHeightPct(closest);
  };

  if (!shouldRender) return null;

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 50, pointerEvents: isOpen ? "auto" : "none" }}>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "var(--rw-overlay)", opacity: isAnimating ? 1 : 0, transition: "opacity 0.3s ease", zIndex: 9999, pointerEvents: "auto" }} />
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        height: `${heightPct}%`,
        background: "var(--rw-panel-bg)",
        borderTopLeftRadius: 16, borderTopRightRadius: 16,
        boxShadow: "var(--rw-shadow)",
        display: "flex", flexDirection: "column",
        transform: isAnimating ? "translateY(0)" : "translateY(100%)",
        transition: isDragging ? "none" : `transform var(--anim-sheet, 250ms) cubic-bezier(0.4,0,0.2,1), height var(--anim-sheet, 250ms) cubic-bezier(0.4,0,0.2,1)`,
        overflow: "hidden", zIndex: 10000,
      }}>
        <div onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
          style={{ width: "100%", height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "grab", touchAction: "none", flexShrink: 0 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: "var(--rw-border)" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px 12px", borderBottom: "1px solid var(--rw-border)", flexShrink: 0 }}>
          <h2 style={{ margin: 0, fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: "var(--rw-text-primary)" }}>{title}</h2>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "var(--rw-text-muted)", padding: 4 }}>
            <XMarkIcon style={{ width: 24, height: 24 }} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", overscrollBehavior: "contain" }}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e)  => e.stopPropagation()}
          onWheel={(e)      => e.stopPropagation()}>
          {children}
          {/* Safe area bottom padding for iPhone home bar */}
          <div style={{ height: "max(0px, env(safe-area-inset-bottom, 0px))" }} />
        </div>
      </div>
    </div>
  );
};

export default BottomSheet;
