import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export function usePerformanceMetrics({ highlights = [], notes = [], pdfRenderCount = 0 } = {}) {
  const [metrics, setMetrics] = useState({
    fps: 0,
    memory: 0,
    canvasCount: 0,
    listenerCount: "N/A", // Cannot track directly without monkey-patching
    observerCount: "N/A",
  });

  const frame = useRef(0);
  const lastTime = useRef(performance.now());
  const renderTime = useRef(0);
  
  // Track React Render Time
  useEffect(() => {
    const now = performance.now();
    renderTime.current = Math.round(now - lastTime.current);
    lastTime.current = now;
  });

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    let rAF;
    const loop = () => {
      const now = performance.now();
      frame.current += 1;

      if (now - lastTime.current >= 1000) {
        const memory = performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : 0;
        const canvasCount = document.querySelectorAll("canvas").length;
        
        setMetrics({
          fps: frame.current,
          memory,
          canvasCount,
          listenerCount: "N/A",
          observerCount: "N/A",
        });

        frame.current = 0;
        lastTime.current = now;
      }
      rAF = requestAnimationFrame(loop);
    };
    rAF = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rAF);
  }, []);

  const MetricsOverlay = () => {
    if (process.env.NODE_ENV !== "development") return null;
    
    return createPortal(
      <div style={{
        position: "fixed", top: 10, left: 10, zIndex: 99999,
        background: "rgba(0, 0, 0, 0.8)", color: "#0f0",
        padding: "10px", borderRadius: "8px", fontFamily: "monospace",
        fontSize: "12px", pointerEvents: "none", display: "flex", flexDirection: "column", gap: 4
      }}>
        <div style={{ fontWeight: "bold", marginBottom: 4, color: "#fff" }}>Performance Metrics</div>
        <div>FPS: {metrics.fps}</div>
        <div>Render Time: {renderTime.current}ms</div>
        <div>Memory: {metrics.memory ? `${metrics.memory} MB` : "N/A"}</div>
        <div>Canvas Count: {metrics.canvasCount}</div>
        <div>PDF Render Count: {pdfRenderCount}</div>
        <div>Highlights: {highlights.length}</div>
        <div>Notes: {notes.length}</div>
      </div>,
      document.body
    );
  };

  return { metrics, MetricsOverlay };
}
