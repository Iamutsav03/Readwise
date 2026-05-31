/**
 * Map note colors to CSS color configurations (Tailored for premium dark-theme side panels)
 */
export const NOTE_COLORS = {
  yellow: {
    bg: "rgba(184, 150, 106, 0.04)",
    border: "rgba(184, 150, 106, 0.15)",
    borderHover: "rgba(184, 150, 106, 0.5)",
    accent: "#b8966a",
    indicator: "🟨",
    text: "#e8d8b8",
  },
  blue: {
    bg: "rgba(109, 165, 192, 0.04)",
    border: "rgba(109, 165, 192, 0.15)",
    borderHover: "rgba(109, 165, 192, 0.5)",
    accent: "#6da5c0",
    indicator: "🟦",
    text: "#d2e6f1",
  },
  green: {
    bg: "rgba(109, 184, 134, 0.04)",
    border: "rgba(109, 184, 134, 0.15)",
    borderHover: "rgba(109, 184, 134, 0.5)",
    accent: "#6db886",
    indicator: "🟩",
    text: "#d0ebd8",
  },
  pink: {
    bg: "rgba(201, 124, 163, 0.04)",
    border: "rgba(201, 124, 163, 0.15)",
    borderHover: "rgba(201, 124, 163, 0.5)",
    accent: "#c97ca3",
    indicator: "🟪",
    text: "#f5d5e3",
  },
  orange: {
    bg: "rgba(223, 154, 99, 0.04)",
    border: "rgba(223, 154, 99, 0.15)",
    borderHover: "rgba(223, 154, 99, 0.5)",
    accent: "#df9a63",
    indicator: "🟧",
    text: "#fadec9",
  },
};

/**
 * Standard debounce utility
 * @param {Function} func
 * @param {number} delay
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

/**
 * Helper to strip HTML tags for simple text preview
 * @param {string} html
 */
export const stripHtml = (html) => {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
};
