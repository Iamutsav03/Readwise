import React from "react";
import SearchResultItem from "./SearchResultItem";

const SearchPanel = ({ pageNumber, onJump, inputRef, searchState }) => {
  const {
    query,
    setQuery,
    results,
    totalMatches,
    isSearching,
    error,
    clearQuery,
  } = searchState;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", color: "#e8d8b8", boxSizing: "border-box" }}>
      {/* Header */}
      <div style={{ padding: "20px 16px 12px 16px", borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
        <h3 style={{ margin: 0, fontFamily: "'DM Sans', sans-serif", fontSize: 16, fontWeight: 500, color: "#e8d8b8" }}>
          Search Document
        </h3>
      </div>

      {/* Search Input Container */}
      <div style={{ padding: 16 }}>
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <span style={{ position: "absolute", left: 12, color: "#7a6a58", fontSize: 18, userSelect: "none" }}>⌕</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search text..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 36px 10px 36px",
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: 8,
              color: "#e8d8b8",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              outline: "none",
              transition: "border-color 0.15s, box-shadow 0.15s",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "rgba(184, 150, 106, 0.6)";
              e.target.style.boxShadow = "0 0 0 2px rgba(184, 150, 106, 0.15)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "rgba(255, 255, 255, 0.08)";
              e.target.style.boxShadow = "none";
            }}
          />
          {query && (
            <button
              onClick={clearQuery}
              style={{
                position: "absolute",
                right: 12,
                background: "none",
                border: "none",
                color: "#7a6a58",
                cursor: "pointer",
                fontSize: 14,
                padding: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Status / Results List */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 16px 16px" }} className="custom-scrollbar">
        {isSearching ? (
          <div style={{ textAlign: "center", padding: "20px 0", color: "#7a6a58", fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
            Searching...
          </div>
        ) : error ? (
          <div style={{ color: "#e07060", padding: "10px 0", fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
            {error}
          </div>
        ) : query.trim() ? (
          <div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#7a6a58", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {totalMatches} {totalMatches === 1 ? "result" : "results"} found
            </div>
            {results.map((result, idx) => (
              <SearchResultItem
                key={`${result.pageNumber}-${idx}`}
                result={result}
                isActive={result.pageNumber === pageNumber}
                onJump={onJump}
              />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "40px 16px", color: "#7a6a58", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 300 }}>
            Type a query to search inside the document
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPanel;