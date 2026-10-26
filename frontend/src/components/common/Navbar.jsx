import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { learningRoomLogo } from '../../assets';


export default function Navbar({ onOpenCreateRoom, theme, onToggleTheme }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Actual navigation sections matching the landing page content
  const navLinks = [
    { name: 'Features', href: '/#features' },
    { name: 'Explore', href: '/#explore' },
    { name: 'About Us', href: '/#about' },
  ];

  const handleNavClick = (e, href) => {
    if (window.location.pathname === '/' && href.startsWith('/#')) {
      e.preventDefault();
      const id = href.replace('/#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Close mobile drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 w-full px-4 sm:px-8 py-2.5 sm:py-3.5 backdrop-blur-md bg-[var(--color-background)]/90 border-b border-[var(--color-border)]/70 transition-colors duration-200">
        <nav className="mx-auto flex max-w-[1240px] items-center justify-between">
          {/* Brand Logo with tight line gap */}
          <a
            href="#home"
            className="flex items-center gap-2 sm:gap-2.5 font-heading text-base sm:text-xl font-extrabold tracking-tight text-[var(--color-text-primary)] hover:opacity-90 transition-opacity shrink-0 select-none"
            aria-label="Learning Room Home"
          >
            <img
              src={learningRoomLogo}
              alt="Learning Room Logo"
              className="w-7 h-7 sm:w-9 sm:h-9 object-contain shrink-0 drop-shadow-2xs"
            />
            <div className="flex flex-col sm:flex-row sm:items-baseline leading-[1.05] sm:leading-tight">
              <span>Learning</span>
              <span className="sm:ml-1.5 -mt-0.5 sm:mt-0">
                Room<span className="text-[var(--color-brand)] text-lg sm:text-2xl leading-none ml-0.5">.</span>
              </span>
            </div>
          </a>

          {/* Desktop Center Navigation Links (Features, Explore, About Us) */}
          <div className="hidden md:flex items-center gap-8 font-medium text-sm text-[var(--color-text-secondary)]">
            {navLinks.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="hover:text-[var(--color-text-primary)] transition-colors duration-150"
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle (Always visible) */}
            <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />

            {/* Desktop Action Buttons */}
            <div className="hidden md:flex items-center gap-2.5">
              <button
                type="button"
                onClick={onOpenCreateRoom}
                className="inline-flex items-center justify-center rounded-full bg-[#39318F] hover:bg-[#5148C8] text-white px-4 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold shadow-sm hover:shadow transition-all duration-150 active:scale-[0.98] cursor-pointer"
              >
                Create a Room
              </button>

              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center rounded-full bg-[#F3EEFE] hover:bg-[#E7DFFD] dark:bg-[#2A2440] dark:hover:bg-[#362E52] text-[#543FE3] dark:text-[#C5BAFF] border border-[#DDD4FA] dark:border-[#4B3E70] px-4 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold shadow-2xs hover:shadow-xs transition-all duration-150 active:scale-[0.98] cursor-pointer"
              >
                Dashboard
              </Link>
            </div>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-[var(--color-text-primary)] transition-colors cursor-pointer"
              aria-label="Open navigation menu"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </nav>
      </header>

      {/* Smooth Mobile Slide-over Drawer (From Right Side) */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-visibility duration-300 ${
          mobileMenuOpen ? 'pointer-events-auto visible' : 'pointer-events-none invisible'
        }`}
      >
        {/* Backdrop with smooth fade */}
        <div
          className={`fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300 ease-in-out ${
            mobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Slide-over panel with smooth right-to-left slide */}
        <div
          className={`fixed inset-y-0 right-0 w-full max-w-[295px] bg-[#FFFDF9] dark:bg-[#181920] shadow-2xl border-l border-[#EDE8E0] dark:border-[#2C2E3B] flex flex-col justify-between p-5 z-50 transform transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Scrollable Container */}
          <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar">
            {/* 1. Header with Logo & Close Button */}
            <div className="flex items-center justify-between pb-3.5 border-b border-gray-200/70 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <img
                  src={learningRoomLogo}
                  alt="Learning Room Logo"
                  className="w-7 h-7 object-contain shrink-0"
                />
                <div className="font-heading font-extrabold text-base text-[var(--color-text-primary)]">
                  Learning Room<span className="text-[var(--color-brand)]">.</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 flex items-center justify-center text-gray-500 text-sm transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            {/* 2. Navigation Links (Features, Explore, About Us) */}
            <div className="space-y-1">
              <div className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-2 mb-2">
                Navigation
              </div>
              {navLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => {
                    setMobileMenuOpen(false);
                    handleNavClick(e, item.href);
                  }}
                  className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-gray-100 dark:hover:bg-gray-800/80 transition-colors"
                >
                  {item.name}
                </a>
              ))}
            </div>

            {/* 3. Action Buttons (Positioned BELOW the Navigation) */}
            <div className="pt-4 border-t border-gray-200/70 dark:border-gray-800 space-y-2.5">
              <div className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-2 mb-1.5">
                Quick Actions
              </div>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenCreateRoom?.();
                }}
                className="w-full inline-flex items-center justify-center rounded-full bg-[#39318F] hover:bg-[#5148C8] active:scale-95 text-white py-2.5 text-sm font-semibold shadow-sm transition-all cursor-pointer"
              >
                Create a Room
              </button>

              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full inline-flex items-center justify-center rounded-full bg-[#F3EEFE] hover:bg-[#E7DFFD] dark:bg-[#2A2440] dark:hover:bg-[#362E52] active:scale-95 text-[#543FE3] dark:text-[#C5BAFF] border border-[#DDD4FA] dark:border-[#4B3E70] py-2.5 text-sm font-bold shadow-2xs transition-all cursor-pointer"
              >
                Dashboard
              </Link>
            </div>
          </div>

          {/* 4. Bottom Footer with Visual Mode Theme Toggle */}
          <div className="pt-4 mt-4 border-t border-gray-200/70 dark:border-gray-800 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Visual Mode
            </span>
            <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
          </div>
        </div>
      </div>
    </>
  );
}
