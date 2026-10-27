import React, { useState, useMemo } from 'react';
import { Tldraw, atom, createTLCurrentUser } from 'tldraw';
import 'tldraw/tldraw.css';
import SideChat from '../chat/SideChat';
import TactileStationery from './TactileStationery';

/**
 * FloatingMockup Component
 * macOS window housing the interactive whiteboard, meet status, and chat panel,
 * accented with an ambient pastel aura and surrounding desk stationery.
 */
export default function FloatingMockup({ theme = 'light' }) {
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [activeLeftTab, setActiveLeftTab] = useState('canvas');
  const [meetConnected, setMeetConnected] = useState(true);

  // Fully isolated user preferences so the landing page canvas is NEVER affected by the room's theme toggle
  const mockupUser = useMemo(() => {
    const userPrefs = atom('mockupUserPrefs', {
      id: 'mockup-preview-user',
      name: 'Preview User',
      colorScheme: theme === 'dark' ? 'dark' : 'light',
    });
    return createTLCurrentUser({
      userPreferences: userPrefs,
      setUserPreferences: (newPrefs) => {
        userPrefs.set(newPrefs);
      },
    });
  }, [theme]);

  return (
    <div className="relative mx-auto w-full max-w-[940px] px-2 sm:px-4 py-8">
      {/* Pastel Sunset Ambient Aura Glow */}
      <div className="ambient-aura" aria-hidden="true" />

      {/* Surrounding Desk Stationery & Doodles */}
      <TactileStationery />

      {/* The Floating Window Container */}
      <div className="relative z-10 w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-window)] overflow-hidden transition-all duration-300">
        {/* macOS Window Chrome Header */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-secondary)]/70 backdrop-blur-xs select-none">
          {/* Traffic light window controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]" />
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]" />
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#27c93f] border border-[#1aab29]" />
          </div>

          {/* Google Meet Live Badge */}
          <div
            onClick={() => setMeetConnected((prev) => !prev)}
            role="button"
            tabIndex={0}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] sm:text-xs font-semibold cursor-pointer hover:opacity-90 transition-opacity"
            title="Click to toggle Google Meet status"
          >
            <span
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                meetConnected ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'
              }`}
            />
            <span className="hidden sm:inline">{meetConnected ? 'Google Meet Connected' : 'Google Meet Muted'}</span>
            <span className="sm:hidden">{meetConnected ? 'Meet Live' : 'Muted'}</span>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsChatOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-colors"
              title="Toggle Side Chat"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span className="hidden sm:inline">{isChatOpen ? 'Hide Chat' : 'Chat'}</span>
              <span className="w-4 h-4 rounded-full bg-[var(--color-brand)] text-white text-[10px] flex items-center justify-center font-bold">
                3
              </span>
            </button>
          </div>
        </div>

        {/* Window Body: Left Sidebar + Whiteboard Canvas + Side Chat */}
        <div className="flex w-full h-[460px] sm:h-[500px] md:h-[520px] overflow-hidden relative">
          {/* Left Vertical Icon Strip */}
          <nav
            className="w-10 sm:w-12 border-r border-[var(--color-border)] bg-[var(--color-surface-secondary)]/50 flex flex-col items-center py-2 sm:py-3 gap-1.5 sm:gap-2 shrink-0 z-10"
            aria-label="Room tools"
          >
            <button
              type="button"
              onClick={() => setActiveLeftTab('docs')}
              className={`p-2 rounded-lg text-xs transition-colors ${
                activeLeftTab === 'docs'
                  ? 'bg-[var(--color-brand)] text-white shadow-xs'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]'
              }`}
              title="Documents & Notes"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => setActiveLeftTab('canvas')}
              className={`p-2 rounded-lg text-xs transition-colors ${
                activeLeftTab === 'canvas'
                  ? 'bg-[var(--color-brand)] text-white shadow-xs'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]'
              }`}
              title="Whiteboard Canvas"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => setActiveLeftTab('shapes')}
              className={`p-2 rounded-lg text-xs transition-colors ${
                activeLeftTab === 'shapes'
                  ? 'bg-[var(--color-brand)] text-white shadow-xs'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]'
              }`}
              title="Shapes & Wireframes"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => setActiveLeftTab('diagram')}
              className={`p-2 rounded-lg text-xs transition-colors ${
                activeLeftTab === 'diagram'
                  ? 'bg-[var(--color-brand)] text-white shadow-xs'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]'
              }`}
              title="Diagram Flow"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </button>

            <div className="flex-1" />

            <button
              type="button"
              onClick={() => alert('Room Settings')}
              className="p-2 rounded-lg text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-colors"
              title="Settings"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
          </nav>

          {/* Central Interactive Whiteboard Canvas */}
          <main className="relative flex-1 h-full overflow-hidden" data-lenis-prevent>
            <div className="w-full h-full relative" data-lenis-prevent>
              <Tldraw user={mockupUser} autoFocus={false} />
            </div>

            {/* Reopen Chat Button when collapsed */}
            {!isChatOpen && (
              <button
                type="button"
                onClick={() => setIsChatOpen(true)}
                className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] shadow-md text-xs font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] transition-all z-30"
                title="Open Side Chat"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span>Side chat</span>
                <span className="w-4 h-4 rounded-full bg-[var(--color-brand)] text-white text-[10px] flex items-center justify-center font-bold">
                  3
                </span>
              </button>
            )}
          </main>

          {/* Right Side Chat Panel */}
          <SideChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} floating={false} />
        </div>
      </div>
    </div>
  );
}
