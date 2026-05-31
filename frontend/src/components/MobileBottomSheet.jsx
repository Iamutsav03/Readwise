import React, { useState, useEffect, useRef } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

/**
 * A bottom sheet for mobile that slides up and can be dismissed via drag or tap.
 */
const MobileBottomSheet = ({ isOpen, onClose, title, children, onHeightChange }) => {
  const [heightPct, setHeightPct] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(isOpen);

  const startY = useRef(0);
  const startHeightRef = useRef(50);

  // Mount/Unmount logic with animation
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Small delay to allow DOM to render before triggering CSS transition
      requestAnimationFrame(() => setIsAnimating(true));
      if (onHeightChange) onHeightChange(heightPct);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setHeightPct(50); // reset
      }, 300); // match CSS duration
      if (onHeightChange) onHeightChange(0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && onHeightChange) {
      onHeightChange(heightPct);
    }
  }, [heightPct, isOpen, onHeightChange]);

  // Touch Handlers for drag handle
  const handleTouchStart = (e) => {
    setIsDragging(true);
    startY.current = e.touches[0].clientY;
    startHeightRef.current = heightPct;
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const y = e.touches[0].clientY;
    const deltaY = startY.current - y; // positive means dragging UP

    // Convert deltaY to percentage of viewport height
    const vh = window.innerHeight;
    const deltaPct = (deltaY / vh) * 100;

    let newHeight = startHeightRef.current + deltaPct;
    newHeight = Math.max(15, Math.min(newHeight, 88));
    setHeightPct(newHeight);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    // If dragged down past 25% height, close the sheet entirely
    if (heightPct < 25) {
      onClose();
      return;
    }
    // Snap to nearest of 50, 85
    const snaps = [50, 85];
    const closest = snaps.reduce((prev, curr) =>
      Math.abs(curr - heightPct) < Math.abs(prev - heightPct) ? curr : prev
    );
    setHeightPct(closest);
  };

  if (!shouldRender) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
        pointerEvents: isOpen ? "auto" : "none", // Prevent clicks while animating out
      }}
    >
      {/* Backdrop visually */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          opacity: isAnimating ? 1 : 0,
          transition: "opacity 0.3s ease",
          pointerEvents: "none", // PDF scrollable behind
        }}
      />

      {/* Sheet */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: `${heightPct}%`,
          background: "#0e0c0a",
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          boxShadow: "0 -4px 20px rgba(0,0,0,0.3)",
          display: "flex",
          flexDirection: "column",
          transform: isAnimating ? "translateY(0)" : "translateY(100%)",
          transition: isDragging ? "none" : "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), height 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          overflow: "hidden",
        }}
      >
        {/* Drag Handle Area */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            width: "100%",
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "grab",
            touchAction: "none",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 40,
              height: 4,
              borderRadius: 2,
              background: "rgba(255,255,255,0.2)",
            }}
          />
        </div>

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px 12px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            flexShrink: 0,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 16,
              color: "#e8d8b8",
            }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#8a7a62",
              padding: 4,
            }}
          >
            <XMarkIcon style={{ width: 24, height: 24 }} />
          </button>
        </div>

        {/* Content */}
        <div
          style={{ flex: 1, overflowY: "auto", overscrollBehavior: "contain" }}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onWheel={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default MobileBottomSheet;
