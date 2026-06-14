// components/FavoritesSection.jsx
import { useState } from "react";
import { useBreakpoints } from "../hooks/useBreakpoints";

const FavoritesSection = ({ favorites, selectedPDF, onSelect, onFavorite, totalFavorites }) => {
  const [expanded, setExpanded] = useState(false);
  const { isTablet } = useBreakpoints();
  
  if (!favorites || favorites.length === 0) return null;

  const displayFavorites = expanded ? favorites : favorites.slice(0, 5);
  const extraCount = totalFavorites - 5;

  return (
    <div style={{ padding: isTablet ? "0 0 2px" : "0 12px 2px" }}>
      {/* Section label */}
      {!isTablet && (
        <p className="rw-section-label" style={{ padding: "0 6px", display: "flex", alignItems: "center", gap: 5 }}>
          Favorites
          <span style={{ fontSize: 11, color: "var(--rw-accent)", lineHeight: 1 }}>★</span>
        </p>
      )}

      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {displayFavorites.map((pdf) => {
          const active = selectedPDF?._id === pdf._id;
          const name = pdf.originalName.replace(/\.pdf$/i, "");

          return (
            <li key={pdf._id} style={{ marginBottom: 1 }}>
              <div
                onClick={() => onSelect(pdf)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "6px 10px", borderRadius: 8,
                  justifyContent: isTablet ? "center" : "flex-start",
                  cursor: "pointer",
                  background: active ? "rgba(200,164,106,0.11)" : "transparent",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => {
                  if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = active ? "rgba(200,164,106,0.11)" : "transparent";
                }}
                title={isTablet ? name : undefined}
              >
                {/* Star icon (no longer a button) */}
                <span style={{ fontSize: 13, color: "var(--rw-accent)", flexShrink: 0, lineHeight: 1 }}>★</span>

                {/* Name */}
                {!isTablet && (
                  <p style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 12.5, fontWeight: active ? 600 : 400,
                    color: active ? "var(--rw-accent)" : "var(--rw-text-primary)",
                    margin: 0, flex: 1, minWidth: 0,
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>
                    {name}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {/* View all toggle */}
      {extraCount > 0 && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", fontSize: 11,
            color: "rgba(245,238,228,0.5)", padding: "6px 10px", margin: "2px 0 0",
            textAlign: "left", width: "100%", transition: "color 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.color = "var(--rw-text-primary)"}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(245,238,228,0.5)"}
        >
          View {extraCount} more favorites
        </button>
      )}

      {expanded && (
        <button
          onClick={() => setExpanded(false)}
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", fontSize: 11,
            color: "rgba(245,238,228,0.5)", padding: "6px 10px", margin: "2px 0 0",
            textAlign: "left", width: "100%", transition: "color 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.color = "var(--rw-text-primary)"}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(245,238,228,0.5)"}
        >
          Show fewer
        </button>
      )}

      {/* Divider */}
      <div style={{ height: 1, background: "var(--rw-border)", margin: "8px 6px 0" }} />
    </div>
  );
};

export default FavoritesSection;
