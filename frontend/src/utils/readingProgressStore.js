/**
 * readingProgressStore.js
 * ────────────────────────
 * A tiny pub/sub store that lets any component subscribe to live reading
 * progress changes (page, numPages, pdfId) without prop-drilling or Context.
 *
 * Usage:
 *   // Write (inside reader):
 *   readingProgressStore.set({ pdfId, pageNumber, numPages, savedAt })
 *
 *   // Read (anywhere):
 *   const pos = readingProgressStore.get();
 *
 *   // Subscribe (inside hooks/components):
 *   const unsub = readingProgressStore.subscribe(handler);
 *   return unsub; // in cleanup
 */

let _state = { pdfId: null, pageNumber: 1, numPages: 0, savedAt: 0 };
const _listeners = new Set();

const readingProgressStore = {
  get: () => _state,

  set: (patch) => {
    _state = { ..._state, ...patch };
    _listeners.forEach((fn) => fn(_state));
    // Also fire the legacy DOM event so Sidebar's existing listener works
    window.dispatchEvent(
      new CustomEvent("readwise:position-update", { detail: _state })
    );
  },

  subscribe: (fn) => {
    _listeners.add(fn);
    return () => _listeners.delete(fn);
  },
};

export default readingProgressStore;
