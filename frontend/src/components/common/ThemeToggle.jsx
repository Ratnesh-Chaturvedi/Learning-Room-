import React from 'react';

/**
 * ThemeToggle Component
 * Sleek, refined button for switching between Light and Dark visual modes
 */
export default function ThemeToggle({ theme, onToggleTheme }) {
  const isLight = theme === 'light';

  return (
    <button
      type="button"
      onClick={onToggleTheme}
      className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-all duration-150 focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]"
      aria-label={`Switch to ${isLight ? 'dark' : 'light'} theme`}
      title={`Switch to ${isLight ? 'dark' : 'light'} theme`}
    >
      {isLight ? (
        <svg
          className="w-3.5 h-3.5 transition-transform duration-200 hover:-rotate-12 text-[var(--color-text-secondary)]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      ) : (
        <svg
          className="w-3.5 h-3.5 transition-transform duration-200 hover:rotate-45 text-amber-300"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      )}
    </button>
  );
}
