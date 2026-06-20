import { Search, X } from "lucide-react";

const LibrarySearch = ({ query, onQueryChange }) => (
  <div style={{
    position: "relative",
    marginBottom: 10,
    padding: "0 6px",
  }}>
    <span style={{
      position: "absolute", left: 16, top: "50%",
      transform: "translateY(-50%)",
      color: "var(--rw-text-secondary)",
      pointerEvents: "none", display: "flex", alignItems: "center"
    }}>
      <Search size={14} />
    </span>

    <input
      type="text"
      value={query}
      onChange={(e) => onQueryChange(e.target.value)}
      placeholder="Search PDFs…"
      style={{
        width: "100%",
        padding: "8px 10px 8px 32px",
        fontSize: 13,
        fontFamily: "'DM Sans', sans-serif",
        color: "var(--rw-text-primary)",
        background: "var(--rw-card-bg)",
        border: "1px solid var(--rw-border)",
        borderRadius: 8,
        outline: "none",
        transition: "border-color 0.15s, box-shadow 0.15s",
        boxSizing: "border-box",
      }}
      onFocus={e => {
        e.target.style.borderColor = "var(--rw-accent)";
        e.target.style.boxShadow = "0 0 0 2px var(--rw-accent-muted)";
      }}
      onBlur={e => {
        e.target.style.borderColor = "var(--rw-border)";
        e.target.style.boxShadow = "none";
      }}
    />

    {query && (
      <button
        onClick={() => onQueryChange("")}
        style={{
          position: "absolute", right: 14, top: "50%",
          transform: "translateY(-50%)",
          background: "var(--rw-hover-bg)", border: "none", borderRadius: "50%",
          width: 18, height: 18, cursor: "pointer",
          color: "var(--rw-text-secondary)", display: "flex", alignItems: "center", justifyContent: "center",
          transition: "color 0.15s, background 0.15s"
        }}
        onMouseEnter={e => {
          e.currentTarget.style.color = "var(--rw-text-primary)";
          e.currentTarget.style.background = "var(--rw-border)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.color = "var(--rw-text-secondary)";
          e.currentTarget.style.background = "var(--rw-hover-bg)";
        }}
        title="Clear search"
      >
        <X size={12} />
      </button>
    )}
  </div>
);

export default LibrarySearch;
