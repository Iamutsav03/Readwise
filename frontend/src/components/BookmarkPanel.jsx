// src/components/BookmarkPanel.jsx
// Sidebar panel that lists bookmarks and manages bookmark navigation and deletes.

import React from "react";
import BookmarkItem from "./BookmarkItem";

const BookmarkPanel = ({
  bookmarks,
  pageNumber,
  onJump,
  onDelete,
  isLoading,
  error,
  mobileMode,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        color: "var(--rw-text-primary)",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      {!mobileMode && (
        <div
          style={{
            padding: "20px 16px 12px 16px",
            borderBottom: "1px solid var(--rw-border)",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 16,
              fontWeight: 500,
              color: "var(--rw-text-primary)",
            }}
          >
            Bookmarks
          </h3>
        </div>
      )}

      {/* Highlights List */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 16px 16px 16px",
        }}
        className="custom-scrollbar"
      >
        {isLoading ? (
          <div
            style={{
              textAlign: "center",
              padding: "20px 0",
              color: "var(--rw-text-secondary)",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
            }}
          >
            Loading bookmarks...
          </div>
        ) : error ? (
          <div
            style={{
              color: "var(--rw-danger)",
              padding: "10px 0",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
            }}
          >
            {error}
          </div>
        ) : bookmarks.length > 0 ? (
          <div>
            <div
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 11,
                color: "var(--rw-text-secondary)",
                marginBottom: 12,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {bookmarks.length} {bookmarks.length === 1 ? "bookmark" : "bookmarks"} saved
            </div>
            {bookmarks.map((bookmark) => (
              <BookmarkItem
                key={bookmark._id}
                bookmark={bookmark}
                isActive={bookmark.pageNumber === pageNumber}
                onJump={onJump}
                onDelete={onDelete}
              />
            ))}
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "40px 16px",
              color: "var(--rw-text-secondary)",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              fontWeight: 300,
              lineHeight: 1.6,
            }}
          >
            No bookmarks saved for this PDF. Click the bookmark icon in the toolbar or press{" "}
            <kbd
              style={{
                background: "var(--rw-hover-bg)",
                border: "1px solid var(--rw-border-strong)",
                borderRadius: 4,
                padding: "2px 4px",
                fontSize: 11,
              }}
            >
              Ctrl + B
            </kbd>{" "}
            to save pages.
          </div>
        )}
      </div>
    </div>
  );
};

export default BookmarkPanel;
