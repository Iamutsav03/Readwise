import React from "react";
import { MagnifyingGlassIcon, PlusIcon, MinusIcon } from "@heroicons/react/24/outline";

/**
 * A tiny popover menu for zoom controls on mobile.
 */
const MobileZoomPopover = ({ scale, onZoomIn, onZoomOut, onClose }) => {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 60, // Above the footer
        left: "50%",
        transform: "translateX(-50%)",
        background: "var(--rw-card-bg)",
        border: "1px solid var(--rw-border-strong)",
        borderRadius: 8,
        padding: "8px 12px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
        zIndex: 100,
      }}
    >
      <button
        onClick={onZoomOut}
        style={{
          background: "transparent",
          border: "none",
          color: "var(--rw-text-primary)",
          padding: 8,
          cursor: "pointer",
        }}
      >
        <MinusIcon style={{ width: 20, height: 20 }} />
      </button>

      <span
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14,
          color: "var(--rw-accent)",
          minWidth: 40,
          textAlign: "center",
        }}
      >
        {Math.round(scale * 100)}%
      </span>

      <button
        onClick={onZoomIn}
        style={{
          background: "transparent",
          border: "none",
          color: "var(--rw-text-primary)",
          padding: 8,
          cursor: "pointer",
        }}
      >
        <PlusIcon style={{ width: 20, height: 20 }} />
      </button>
      
      {/* Invisible overlay to close when clicking outside */}
      <div 
        onClick={onClose} 
        style={{ position: 'fixed', inset: 0, zIndex: -1 }} 
      />
    </div>
  );
};

export default MobileZoomPopover;
