// components/LibrarySearch.jsx
// Search input for the Library section. Controlled — parent owns query state.

const LibrarySearch = ({ query, onQueryChange }) => (
  <div style={{
    position: "relative",
    marginBottom: 10,
    padding: "0 6px",
  }}>
    {/* Search icon */}
    <span style={{
      position: "absolute", left: 18, top: "50%",
      transform: "translateY(-50%)",
      fontSize: 12, color: "#c0b0a0",
      pointerEvents: "none", lineHeight: 1,
    }}>
      🔍
    </span>

    <input
      type="text"
      value={query}
      onChange={(e) => onQueryChange(e.target.value)}
      placeholder="Search PDFs…"
      style={{
        width: "100%",
        padding: "7px 10px 7px 30px",
        fontSize: 12.5,
        fontFamily: "'DM Sans', sans-serif",
        color: "var(--rw-hover-bg)",
        background: "rgba(255,255,255,0.65)",
        border: "1.5px solid #e0d8d0",
        borderRadius: 8,
        outline: "none",
        transition: "border-color 0.18s, background 0.18s",
        boxSizing: "border-box",
      }}
      onFocus={e => {
        e.target.style.borderColor = "var(--rw-accent)";
        e.target.style.background = "var(--rw-text-primary)";
      }}
      onBlur={e => {
        e.target.style.borderColor = "#e0d8d0";
        e.target.style.background = "rgba(255,255,255,0.65)";
      }}
    />

    {/* Clear button */}
    {query && (
      <button
        onClick={() => onQueryChange("")}
        style={{
          position: "absolute", right: 14, top: "50%",
          transform: "translateY(-50%)",
          background: "none", border: "none", cursor: "pointer",
          fontSize: 13, color: "#b0a090", padding: 0, lineHeight: 1,
          display: "flex", alignItems: "center",
        }}
        title="Clear search"
      >
        ×
      </button>
    )}
  </div>
);

export default LibrarySearch;
