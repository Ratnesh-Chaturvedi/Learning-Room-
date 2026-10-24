import React from 'react';

/**
 * ThemeToggle Component
 * Pill capsule dual-state theme toggle with moon and sun icons matching the dashboard design
 */
export default function ThemeToggle({ theme, onToggleTheme }) {
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={onToggleTheme}
      className="flex items-center bg-[#EAE6DF] dark:bg-[#282A33] rounded-full p-0.5 border border-[#DFDAD0] dark:border-[#383A46] shadow-2xs hover:border-[#CEC7BC] dark:hover:border-[#4A4D5C] transition-all cursor-pointer select-none"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Moon Side (Dark) */}
      <div
        className={`flex items-center justify-center w-6 h-6 rounded-full transition-all duration-200 ${
          isDark
            ? 'bg-[#543FE3] text-amber-200 shadow-xs'
            : 'text-[#585B6B] hover:text-[#3B3D4A]'
        }`}
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      </div>

      {/* Sun Side (Light) */}
      <div
        className={`flex items-center justify-center w-6 h-6 rounded-full transition-all duration-200 ${
          !isDark
            ? 'bg-white text-amber-500 shadow-xs'
            : 'text-gray-400 hover:text-gray-300'
        }`}
      >
        <svg
          className="w-3.5 h-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      </div>
    </button>
  );
}
