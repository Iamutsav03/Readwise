// features/pdf-viewer/components/PDFHighlightLayer.jsx
// v2: Removed race condition. Rect computation is triggered only after
// the react-pdf text layer has fully rendered (via textLayerReady prop).
// Generated rects are persisted to the backend for future loads.
import React, { useRef, useState, useEffect, useCallback } from "react";
import { COLOR_MAP } from "../../../utils/highlightHelpers";
import httpClient from "../../../services/httpClient";

/**
 * Renders highlights as absolute positioned divs over the PDF page.
 * @param {Array}   highlights         - Highlights for this page
 * @param {number}  scale              - Current render scale
 * @param {string}  focusedHighlightId - ID of the focused highlight
 * @param {boolean} textLayerReady     - Set to true only after react-pdf text layer mounts
 * @param {Element} pageEl             - The .react-pdf__Page DOM element (passed from parent)
 */
const PDFHighlightLayer = ({
  highlights = [],
  scale = 1,
  focusedHighlightId = null,
  textLayerReady = false,
  pageEl = null,
}) => {
  const [dynamicRects, setDynamicRects] = useState({});
  const persistedRef = useRef(new Set()); // track which we've already saved to backend

  const computeDynamicRects = useCallback(() => {
    if (!pageEl || highlights.length === 0) return;

    const textLayer = pageEl.querySelector(".react-pdf__Page__textContent");
    if (!textLayer) return;

    // Build a flat text node map over the text layer once
    const walk = document.createTreeWalker(textLayer, NodeFilter.SHOW_TEXT, null, false);
    let fullText = "";
    const nodes = [];
    let curr = walk.nextNode();
    while (curr) {
      nodes.push({ node: curr, start: fullText.length, end: fullText.length + curr.textContent.length });
      fullText += curr.textContent;
      curr = walk.nextNode();
    }

    const newRects = {};
    let hasChanges = false;

    highlights.forEach((h) => {
      // Already have stored rects → skip
      if (h.rects && h.rects.length > 0) return;
      // Already computed dynamically → skip
      if (dynamicRects[h._id]) return;
      if (!h.textQuote) return;

      const needle = h.textQuote.replace(/\s+/g, " ").trim();
      const matchIdx = fullText.indexOf(needle);
      if (matchIdx === -1) return;

      const matchEnd = matchIdx + needle.length;
      const range = document.createRange();
      let startSet = false;

      for (const n of nodes) {
        if (!startSet && matchIdx >= n.start && matchIdx < n.end) {
          range.setStart(n.node, matchIdx - n.start);
          startSet = true;
        }
        if (startSet && matchEnd > n.start && matchEnd <= n.end) {
          range.setEnd(n.node, matchEnd - n.start);
          break;
        }
      }

      if (!range.startContainer) return;

      const pageRect = pageEl.getBoundingClientRect();
      const rectsFrac = Array.from(range.getClientRects()).map((r) => ({
        x: (r.left - pageRect.left) / pageRect.width,
        y: (r.top - pageRect.top) / pageRect.height,
        w: r.width / pageRect.width,
        h: r.height / pageRect.height,
      })).filter((r) => r.w > 0 && r.h > 0);

      if (rectsFrac.length > 0) {
        newRects[h._id] = rectsFrac;
        hasChanges = true;

        // Persist to backend if not already done for this highlight
        if (!persistedRef.current.has(h._id)) {
          persistedRef.current.add(h._id);
          httpClient
            .patch(`/highlights/${h._id}`, {
              rects: rectsFrac,
              rectVersion: (h.rectVersion || 0) + 1,
            })
            .catch((err) => console.warn("[HighlightLayer] Could not persist rects:", err.message));
        }
      }
    });

    if (hasChanges) {
      setDynamicRects((prev) => ({ ...prev, ...newRects }));
    }
  }, [highlights, dynamicRects, pageEl]);

  // Re-run only when the text layer has signalled it is ready
  useEffect(() => {
    if (!textLayerReady) return;
    computeDynamicRects();
  }, [textLayerReady, computeDynamicRects]);

  if (highlights.length === 0) return null;

  // Determine blend mode based on theme (dark mode: use 'screen', light: 'multiply')
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const blendMode = isDark ? "screen" : "multiply";

  return (
    <div
      style={{
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        pointerEvents: "none",
        zIndex: 10,
      }}
    >
      {highlights.map((highlight) => {
        const rects =
          highlight.rects && highlight.rects.length > 0
            ? highlight.rects
            : dynamicRects[highlight._id] || [];

        if (rects.length === 0) return null;

        return (
          <React.Fragment key={highlight._id}>
            {rects.map((rect, idx) => {
              const colorDef = COLOR_MAP[highlight.color] || COLOR_MAP["yellow"];
              const isFocused = highlight._id === focusedHighlightId;
              return (
                <div
                  key={`${highlight._id}-${idx}`}
                  className={`highlight-rect ${isFocused ? "focused" : ""}`}
                  style={{
                    position: "absolute",
                    left: `${rect.x * 100}%`,
                    top: `${rect.y * 100}%`,
                    width: `${rect.w * 100}%`,
                    height: `${rect.h * 100}%`,
                    backgroundColor: colorDef.bg,
                    borderBottom: `2px solid ${colorDef.border}`,
                    mixBlendMode: blendMode,
                    transition: "background-color 0.3s, box-shadow 0.3s",
                    boxShadow: isFocused ? `0 0 0 2px ${colorDef.border}, 0 0 10px ${colorDef.bg}` : "none",
                    borderRadius: "2px",
                  }}
                />
              );
            })}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default PDFHighlightLayer;
