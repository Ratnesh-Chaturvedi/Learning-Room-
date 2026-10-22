import React from 'react';
import ThemeToggle from './ThemeToggle';

/**
 * Navbar Component
 * Navigation header with logo, links, theme switch, and room creation action
 */
export default function Navbar({ onOpenCreateRoom, theme, onToggleTheme }) {
  return (
    <header className="sticky top-0 z-50 w-full px-4 sm:px-8 py-3 sm:py-3.5 backdrop-blur-md bg-[var(--color-background)]/85 border-b border-[var(--color-border)]/70 transition-colors duration-200">
      <nav className="mx-auto flex max-w-[1240px] items-center justify-between">
        {/* Brand Logo */}
        <a
          href="#home"
          className="flex items-baseline font-heading text-lg sm:text-xl font-extrabold tracking-tight text-[var(--color-text-primary)] hover:opacity-90 transition-opacity"
          aria-label="Learning Room Home"
        >
          <span>Learning Room</span>
          <span className="text-[var(--color-brand)] text-2xl leading-none ml-0.5">.</span>
        </a>

        {/* Center Navigation Links */}
        <div className="hidden md:flex items-center gap-8 font-medium text-sm text-[var(--color-text-secondary)]">
          <a
            href="#features"
            className="hover:text-[var(--color-text-primary)] transition-colors duration-150"
          >
            Features
          </a>
          <a
            href="#explore"
            className="hover:text-[var(--color-text-primary)] transition-colors duration-150"
          >
            Explore
          </a>
          <a
            href="#why-us"
            className="hover:text-[var(--color-text-primary)] transition-colors duration-150"
          >
            Why us
          </a>
          <a
            href="#resources"
            className="hover:text-[var(--color-text-primary)] transition-colors duration-150"
          >
            Resources
          </a>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Light / Dark Theme Switcher */}
          <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />

          {/* Create Room Primary CTA */}
          <button
            type="button"
            onClick={onOpenCreateRoom}
            className="inline-flex items-center justify-center rounded-full bg-[#39318F] hover:bg-[#5148C8] text-white px-3.5 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold shadow-sm hover:shadow transition-all duration-150 active:scale-[0.98]"
          >
            Create a Room
          </button>
        </div>
      </nav>
    </header>
  );
}
