import React from "react";
import { ArrowLeftIcon, ArrowRightIcon, MinusIcon, PlusIcon, ArrowPathIcon, XMarkIcon, ArrowUpTrayIcon } from "@heroicons/react/24/outline";

/**
 * FooterControls – sticky bottom bar containing navigation, zoom, fit, upload & remove actions.
 * Uses Tailwind CSS for glassmorphism effect and responsive layout.
 */
const FooterControls = ({
  pageNumber,
  numPages,
  onPrev,
  onNext,
  onZoomOut,
  onZoomIn,
  scale,
  onFit,
  onUploadClick,
  onRemove,
}) => {
  return (
    <footer className="fixed inset-x-0 bottom-0 bg-black/75 backdrop-blur-xl border-t border-white/15 px-4 py-3 flex items-center justify-center gap-3 shadow-2xl h-20 z-50">
      {/* Navigation */}
      <button
        onClick={onPrev}
        disabled={pageNumber <= 1}
        className="p-2 rounded-full hover:bg-white/20 disabled:opacity-40 transition-colors text-white"
        title="Previous page (←)"
      >
        <ArrowLeftIcon className="h-5 w-5" />
      </button>
      <span className="text-sm text-white whitespace-nowrap font-medium">
        {pageNumber} / {numPages}
      </span>
      <button
        onClick={onNext}
        disabled={pageNumber >= numPages}
        className="p-2 rounded-full hover:bg-white/20 disabled:opacity-40 transition-colors text-white"
        title="Next page (→)"
      >
        <ArrowRightIcon className="h-5 w-5" />
      </button>

      {/* Divider */}
      <div className="h-6 w-px bg-white/20" />

      {/* Zoom controls */}
      <button
        onClick={onZoomOut}
        className="p-2 rounded-full hover:bg-white/20 transition-colors text-white"
        title="Zoom out (Ctrl+-)"
      >
        <MinusIcon className="h-5 w-5" />
      </button>
      <span className="text-sm text-white whitespace-nowrap font-medium w-12 text-center">{Math.round(scale * 100)}%</span>
      <button
        onClick={onZoomIn}
        className="p-2 rounded-full hover:bg-white/20 transition-colors text-white"
        title="Zoom in (Ctrl++)"
      >
        <PlusIcon className="h-5 w-5" />
      </button>
      {/* Fit to screen */}
      <button
        onClick={onFit}
        className="p-2 rounded-full hover:bg-white/20 transition-colors text-white"
        title="Fit to screen"
      >
        <ArrowPathIcon className="h-5 w-5" />
      </button>

      {/* Divider */}
      <div className="h-6 w-px bg-white/20" />

      {/* Upload new PDF */}
      <button
        onClick={onUploadClick}
        className="p-2 rounded-full hover:bg-white/20 transition-colors text-white"
        title="Upload new PDF"
      >
        <ArrowUpTrayIcon className="h-5 w-5" />
      </button>

      {/* Remove PDF */}
      <button
        onClick={onRemove}
        className="p-2 rounded-full hover:bg-red-500/50 transition-colors text-red-400"
        title="Remove PDF"
      >
        <XMarkIcon className="h-5 w-5" />
      </button>
    </footer>
  );
};

export default FooterControls;
