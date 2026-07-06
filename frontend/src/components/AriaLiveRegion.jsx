import React, { useState, useEffect } from "react";

/**
 * A global ARIA live region for screen reader announcements.
 * Use this component once at the root of the app, and expose a global function
 * or event to trigger messages.
 */
let announceFn = () => {};

export const announce = (message) => {
  announceFn(message);
};

export default function AriaLiveRegion() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    announceFn = (msg) => {
      setMessage(msg);
      // Clear message after announcement so the same message can be repeated
      setTimeout(() => setMessage(""), 3000);
    };
    return () => { announceFn = () => {}; };
  }, []);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: "absolute",
        width: 1,
        height: 1,
        margin: -1,
        padding: 0,
        overflow: "hidden",
        clip: "rect(0, 0, 0, 0)",
        whiteSpace: "nowrap",
        border: 0,
      }}
    >
      {message}
    </div>
  );
}
