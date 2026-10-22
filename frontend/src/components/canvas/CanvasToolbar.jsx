import React from 'react';

/**
 * CanvasToolbar Component
 * Floating tactile toolbar positioned cleanly at the bottom of the canvas
 */
export default function CanvasToolbar({
  activeTool,
  setActiveTool,
  setDrawingColor,
  onAddNewSticky,
  onClearCanvas,
}) {
  return (
    <div
      className="absolute bottom-2.5 sm:bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 sm:gap-1.5 p-1 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] shadow-md z-30 backdrop-blur-sm max-w-[95%] overflow-x-auto"
      role="toolbar"
      aria-label="Whiteboard tools"
    >
      {/* Select / Move */}
      <button
        type="button"
        onClick={() => setActiveTool('select')}
        className={`flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full text-xs transition-all ${
          activeTool === 'select'
            ? 'bg-[var(--color-brand)] text-white shadow-sm'
            : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]'
        }`}
        title="Select & Move (V)"
        aria-label="Select tool"
      >
        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
        </svg>
      </button>

      {/* Pen */}
      <button
        type="button"
        onClick={() => {
          setActiveTool('pen');
          setDrawingColor('#252522');
        }}
        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs transition-all ${
          activeTool === 'pen'
            ? 'bg-[var(--color-brand)] text-white shadow-sm'
            : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]'
        }`}
        title="Draw with Pen (P)"
        aria-label="Pen tool"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
        </svg>
      </button>

      {/* Highlighter */}
      <button
        type="button"
        onClick={() => setActiveTool('highlighter')}
        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs transition-all ${
          activeTool === 'highlighter'
            ? 'bg-[var(--color-brand)] text-white shadow-sm'
            : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]'
        }`}
        title="Highlighter (H)"
        aria-label="Highlighter tool"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 11-6 6v3h3l6-6" />
          <path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4" />
        </svg>
      </button>

      {/* Eraser */}
      <button
        type="button"
        onClick={() => setActiveTool('eraser')}
        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs transition-all ${
          activeTool === 'eraser'
            ? 'bg-[var(--color-brand)] text-white shadow-sm'
            : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]'
        }`}
        title="Eraser (E)"
        aria-label="Eraser tool"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" />
          <path d="M22 21H7" />
        </svg>
      </button>

      {/* Text Tool */}
      <button
        type="button"
        onClick={() => setActiveTool('text')}
        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
          activeTool === 'text'
            ? 'bg-[var(--color-brand)] text-white shadow-sm'
            : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]'
        }`}
        title="Click canvas to add text (T)"
        aria-label="Text tool"
      >
        T
      </button>

      {/* Add Sticky Note */}
      <button
        type="button"
        onClick={onAddNewSticky}
        className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-all"
        title="Add Sticky Note (N)"
        aria-label="Add sticky note"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z" />
          <path d="M15 3v4a2 2 0 0 0 2 2h4" />
        </svg>
      </button>

      {/* Clear canvas */}
      <button
        type="button"
        onClick={onClearCanvas}
        className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-red-500 transition-all"
        title="Clear canvas drawings"
        aria-label="Clear drawings"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="1" />
          <circle cx="19" cy="12" r="1" />
          <circle cx="5" cy="12" r="1" />
        </svg>
      </button>
    </div>
  );
}
