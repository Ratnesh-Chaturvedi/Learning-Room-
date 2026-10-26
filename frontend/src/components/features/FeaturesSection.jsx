import React from 'react';
import { burstLines } from '../../assets';

/**
 * FeaturesSection Component
 * 6 tactile feature showcase cards, each with its own bespoke background gradient,
 * cursive "Keep Learning" heading, enlarged legible floating text, and responsive grid.
 */
export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-24 max-w-[1240px] mx-auto scroll-mt-16"
      aria-label="Features showcase"
    >
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-18 relative">
        {/* Playful floating star doodles on top left and right of title */}
        <div className="absolute -top-7 left-6 sm:left-12 text-amber-400 select-none pointer-events-none text-xl sm:text-2xl font-handwriting rotate-[-12deg] animate-float-slow" aria-hidden="true">
          ⭐ <span className="text-sm font-bold opacity-80">☆</span>
        </div>
        <div className="absolute top-1 right-8 sm:right-16 text-slate-700 dark:text-slate-300 select-none pointer-events-none text-xl sm:text-2xl font-handwriting rotate-12 animate-float-medium" aria-hidden="true">
          ☆ <span className="text-xs">✦</span>
        </div>

        {/* Main Heading with "Keep Learning" in Cursive font */}
        <h2 className="font-heading text-3xl sm:text-4xl md:text-[44px] font-extrabold tracking-tight text-[var(--color-text-primary)] leading-[1.2] mb-3">
          The Features You Need <br className="hidden sm:inline" />
          <span>to </span>
          <span className="relative inline-block whitespace-nowrap">
            <span className="font-cursive font-bold italic tracking-normal text-5xl sm:text-6xl md:text-[64px] text-[var(--color-brand)] dark:text-[#a39aff] inline-block -rotate-2 px-1.5 drop-shadow-2xs">
              Keep Learning
            </span>
            {/* Hand-drawn triple underline under Keep Learning */}
            <svg
              className="absolute -bottom-3 -left-1 w-[105%] h-4 text-[var(--color-brand)] dark:text-[#a39aff] pointer-events-none"
              viewBox="0 0 160 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M2 5C45 2 110 3 158 6" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
              <path d="M10 8C50 6 115 7 148 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.85" />
            </svg>
          </span>
        </h2>

        {/* Subtitle */}
        <p className="text-[15px] sm:text-base text-[var(--color-text-secondary)] mt-4 leading-relaxed">
          Everything you need to run your space. <br className="hidden sm:inline" />
          Build your{' '}
          <span className="relative font-medium text-[var(--color-text-primary)]">
            shared studio
            <svg
              className="absolute -bottom-1 left-0 w-full h-1.5 text-[var(--color-text-primary)] pointer-events-none opacity-70"
              viewBox="0 0 80 6"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M2 3C25 1 55 2 78 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </span>
        </p>
      </div>

      {/* 6 Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
        
        {/* ===================================================================
            CARD 1: Shared Whiteboard Canvas (Lavender & Purple Glow)
            =================================================================== */}
        <div className="relative group rounded-2xl bg-gradient-to-br from-[#f8f6ff] via-[#ffffff] to-[#ede9fe]/50 dark:from-[#232042] dark:via-[#1e1e24] dark:to-[#171720] border border-purple-200/70 dark:border-purple-900/40 hover:border-purple-300 dark:hover:border-purple-700/60 p-5 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-visible">
          {/* Subtle Ambient Radial Wash */}
          <div className="absolute -top-10 -left-10 w-36 h-36 bg-purple-300/20 dark:bg-purple-600/15 rounded-full blur-2xl pointer-events-none" />

          {/* Top-left "Ideas" doodle arrow (floating, enlarged) */}
          <div className="hidden sm:flex absolute -left-10 -top-5 items-center gap-1.5 font-handwriting font-bold text-base sm:text-lg text-purple-950 dark:text-purple-200 select-none pointer-events-none animate-float-slow">
            <span className="-rotate-6 drop-shadow-2xs">Ideas</span>
            <svg className="w-6 h-6 -rotate-12 drop-shadow-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 14c4 4 10 5 14 2" />
              <path d="M14 18l4-2-1-4" />
            </svg>
          </div>

          {/* Top "Undo" doodle arrow (floating, enlarged) */}
          <div className="hidden sm:flex absolute right-12 -top-6 items-center gap-1.5 font-handwriting font-bold text-base sm:text-lg text-purple-950 dark:text-purple-200 select-none pointer-events-none animate-float-medium">
            <span className="drop-shadow-2xs">Undo</span>
            <svg className="w-6 h-6 rotate-45 drop-shadow-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 14c4 4 10 5 14 2" />
              <path d="M14 18l4-2-1-4" />
            </svg>
          </div>

          {/* Lined paper peeking bottom-left */}
          <div className="hidden sm:block absolute -left-3 bottom-8 w-16 h-20 bg-[#fdfdfb] dark:bg-[#232420] border border-[#e2e0d8] dark:border-[#383a34] rounded shadow-xs -rotate-12 -z-10 overflow-hidden p-1.5" aria-hidden="true">
            <div className="notepad-rule" style={{ marginTop: '8px' }} />
            <div className="notepad-rule" style={{ marginTop: '8px' }} />
            <div className="notepad-rule" style={{ marginTop: '8px' }} />
          </div>

          <div className="relative z-10">
            <h3 className="font-heading text-lg font-bold text-[var(--color-text-primary)] mb-4">
              Shared Whiteboard Canvas
            </h3>

            {/* Inner Mockup Window */}
            <div className="relative w-full h-44 rounded-xl border border-purple-200/50 dark:border-purple-900/30 bg-[var(--color-surface)]/80 backdrop-blur-xs overflow-hidden flex flex-col shadow-xs">
              {/* Mini Chrome */}
              <div className="h-5 border-b border-[var(--color-border)] bg-[var(--color-surface-secondary)]/60 flex items-center px-2 gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff5f56]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#ffbd2e]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#27c93f]" />
              </div>

              {/* Canvas Surface with Drawing Shapes & Center Upload Box */}
              <div className="relative flex-1 canvas-dots p-2 overflow-hidden flex items-center justify-center">
                {/* Shapes on left */}
                <div className="absolute left-3 top-3 flex flex-col gap-1.5 items-start">
                  <div className="w-5 h-5 rounded-full bg-rose-300 dark:bg-rose-900/60 border border-rose-400" />
                  <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[18px] border-b-emerald-300 dark:border-b-emerald-800" />
                  <div className="w-4 h-4 bg-amber-200 dark:bg-amber-800 border border-amber-300 rotate-6" />
                </div>

                {/* Center Upload Box */}
                <div className="relative z-10 flex flex-col items-center justify-center bg-[var(--color-surface)] border border-dashed border-[var(--color-border-strong)] rounded-lg p-2.5 shadow-xs">
                  <button type="button" className="flex items-center gap-1.5 rounded bg-[#39318F] text-white px-3 py-1 text-xs font-semibold shadow-xs">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span>Upload</span>
                  </button>
                </div>

                {/* Orange sticky tape: "Image uploads" (static inside canvas) */}
                <div className="absolute right-2 top-2 px-3 py-1 rounded-md bg-[#fed7aa] text-amber-950 font-handwriting font-bold text-sm sm:text-base shadow-xs rotate-3">
                  Image uploads
                </div>

                {/* Brown sticky: "Doodles & drawing" (static inside canvas) */}
                <div className="absolute right-2 bottom-3 px-3 py-1 rounded-md bg-[#fcd34d] text-amber-950 font-handwriting font-bold text-sm sm:text-base shadow-xs -rotate-2">
                  Doodles & drawing
                </div>

                {/* Sketched Stationery Pens on bottom-left */}
                <div className="absolute left-2 -bottom-2 flex items-center -rotate-45 z-10">
                  <div className="w-10 h-2 bg-indigo-300 dark:bg-indigo-700 rounded-sm shadow-xs" />
                  <div className="w-2 h-2 border-r-4 border-r-indigo-400 border-t-2 border-t-transparent border-b-2 border-b-transparent" />
                </div>

                {/* Mini Bottom Toolbar */}
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full px-2 py-0.5 text-[10px] shadow-xs text-[var(--color-text-secondary)]">
                  <span>✏️</span>
                  <span>🖌️</span>
                  <span>T</span>
                  <span>◻️</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom doodle: "No rules" with arrow (floating, enlarged) */}
          <div className="flex items-center justify-center gap-1.5 font-handwriting font-bold text-base sm:text-lg text-[var(--color-text-primary)] mt-3.5 animate-float-gentle">
            <svg className="w-6 h-5 text-[var(--color-text-primary)]" viewBox="0 0 24 16" fill="none">
              <path d="M2 12C8 6 16 6 22 10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M16 6L22 10L19 14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="drop-shadow-2xs">No rules</span>
          </div>
        </div>

        {/* ===================================================================
            CARD 2: Real-Time Group Chat (Sky & Cyan Glow)
            =================================================================== */}
        <div className="relative group rounded-2xl bg-gradient-to-br from-[#f0f9ff] via-[#ffffff] to-[#e0f2fe]/50 dark:from-[#172554] dark:via-[#1a202c] dark:to-[#121824] border border-sky-200/70 dark:border-sky-900/40 hover:border-sky-300 dark:hover:border-sky-700/60 p-5 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-visible">
          {/* Subtle Ambient Radial Wash */}
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-sky-300/20 dark:bg-sky-600/15 rounded-full blur-2xl pointer-events-none" />

          {/* Top-right "Instant chats" doodle (floating, enlarged) */}
          <div className="hidden sm:flex flex-col items-center absolute -right-4 -top-7 font-handwriting font-bold text-base sm:text-lg text-sky-950 dark:text-sky-200 select-none pointer-events-none animate-float-medium">
            <span className="drop-shadow-2xs">Instant chats</span>
            <svg className="w-6 h-6 -rotate-45 drop-shadow-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 14c4 4 10 5 14 2" />
              <path d="M14 18l4-2-1-4" />
            </svg>
          </div>

          <div className="relative z-10">
            <h3 className="font-heading text-lg font-bold text-[var(--color-text-primary)] mb-4">
              Real-Time Group Chat
            </h3>

            {/* Inner Mockup Window */}
            <div className="relative w-full h-44 rounded-xl border border-sky-200/50 dark:border-sky-900/30 bg-[var(--color-surface)]/80 backdrop-blur-xs overflow-hidden flex flex-col shadow-xs">
              {/* Mini Chrome */}
              <div className="h-5 border-b border-[var(--color-border)] bg-[var(--color-surface-secondary)]/60 flex items-center px-2 gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff5f56]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#ffbd2e]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#27c93f]" />
              </div>

              {/* Chat Thread */}
              <div className="flex-1 p-2.5 space-y-2 text-xs overflow-hidden flex flex-col justify-between">
                {/* Message 1 from Maya */}
                <div className="flex items-start gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-blue-400 text-[9px] text-white flex items-center justify-center font-bold">M</span>
                  <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md px-2.5 py-1 shadow-2xs text-[11.5px] leading-tight">
                    Real-time chat typing... <span className="text-amber-500">👋</span>
                  </div>
                </div>

                {/* Message 2 from Elena */}
                <div className="flex items-start gap-1.5 pl-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-[9px] text-white flex items-center justify-center font-bold">E</span>
                  <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md px-2.5 py-1 shadow-2xs text-[11.5px] leading-tight">
                    Everyone have a message boat all!
                  </div>
                </div>

                {/* Message 3 from User (right aligned) */}
                <div className="flex justify-end pr-2">
                  <div className="bg-[var(--color-brand)] text-white rounded-md px-2.5 py-1 shadow-2xs text-[11.5px] leading-tight font-medium">
                    Instant meet up! 🚀
                  </div>
                </div>

                {/* Mini composer */}
                <div className="flex items-center gap-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md px-2 py-1 text-[11px] text-[var(--color-text-muted)] mt-0.5">
                  <span className="flex-1">Message...</span>
                  <span>😊</span>
                  <span>➤</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom doodle: "Talk & sketch" (floating, enlarged) */}
          <div className="flex items-center justify-end gap-1.5 font-handwriting font-bold text-base sm:text-lg text-[var(--color-text-primary)] mt-3.5 animate-float-slow">
            <svg className="w-6 h-5 text-[var(--color-text-primary)]" viewBox="0 0 24 16" fill="none">
              <path d="M2 4C8 10 16 10 22 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M16 10L22 6L18 2" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="drop-shadow-2xs">Talk & sketch</span>
          </div>
        </div>

        {/* ===================================================================
            CARD 3: Google Meet Integration (Emerald & Mint Glow)
            =================================================================== */}
        <div className="relative group rounded-2xl bg-gradient-to-br from-[#ecfdf5] via-[#ffffff] to-[#d1fae5]/50 dark:from-[#064e3b]/70 dark:via-[#18231c] dark:to-[#121c16] border border-emerald-200/70 dark:border-emerald-900/40 hover:border-emerald-300 dark:hover:border-emerald-700/60 p-5 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-visible">
          {/* Subtle Ambient Radial Wash */}
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-emerald-300/20 dark:bg-emerald-600/15 rounded-full blur-2xl pointer-events-none" />

          {/* Top-right "Active!" doodle (floating, enlarged) */}
          <div className="hidden sm:flex flex-col items-center absolute right-3 -top-7 font-handwriting font-bold text-base sm:text-lg text-emerald-900 dark:text-emerald-200 select-none pointer-events-none animate-float-slow">
            <span className="drop-shadow-2xs">Active!</span>
            <svg className="w-5 h-5 drop-shadow-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M12 4v14M6 12l6 6 6-6" />
            </svg>
          </div>

          <div className="relative z-10">
            <h3 className="font-heading text-lg font-bold text-[var(--color-text-primary)] mb-4">
              Google Meet Integration
            </h3>

            {/* Inner Mockup Window */}
            <div className="relative w-full h-44 rounded-xl border border-emerald-200/50 dark:border-emerald-900/30 bg-[var(--color-surface)]/80 backdrop-blur-xs overflow-hidden flex flex-col shadow-xs">
              {/* Frictionless calls annotation header (enlarged) */}
              <div className="text-center font-handwriting text-base sm:text-lg text-emerald-800 dark:text-emerald-300 font-bold py-1 border-b border-[var(--color-border)]/60">
                — Frictionless calls —
              </div>

              {/* Video Conference Tiles */}
              <div className="flex-1 p-2 flex items-center justify-center gap-2">
                {/* Video Tile 1 */}
                <div className="relative flex-1 h-24 rounded-lg overflow-hidden bg-slate-800 shadow-xs flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=150&fit=crop&crop=faces&q=80"
                    alt="Rohan video call"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1 left-1.5 px-1.5 py-0.5 rounded bg-black/60 text-[9px] text-white font-medium">
                    Rohan
                  </div>
                </div>

                {/* Video Tile 2 */}
                <div className="relative flex-1 h-24 rounded-lg overflow-hidden bg-slate-800 shadow-xs flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=150&fit=crop&crop=faces&q=80"
                    alt="Maya video call"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1 left-1.5 px-1.5 py-0.5 rounded bg-black/60 text-[9px] text-white font-medium">
                    Maya
                  </div>
                </div>
              </div>

              {/* Meet Control Icons & Active Capsule (floating, enlarged) */}
              <div className="flex items-center justify-between px-3 pb-2 pt-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] shadow-2xs">📞</span>
                  <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] flex items-center justify-center">🎤</span>
                  <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] flex items-center justify-center">📷</span>
                </div>
                <div className="px-3 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-handwriting font-bold text-sm sm:text-base border border-emerald-300">
                  Active!
                </div>
              </div>
            </div>
          </div>

          {/* Bottom call status pill & mic doodle (floating, enlarged) */}
          <div className="flex items-center justify-center gap-2 mt-3.5 animate-float-medium">
            <span className="font-handwriting text-base text-[var(--color-text-secondary)]">🎙️</span>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-300 dark:border-emerald-800/60 bg-[var(--color-surface)] text-xs sm:text-sm font-semibold text-emerald-800 dark:text-emerald-300 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Call status: connected</span>
            </div>
          </div>
        </div>

        {/* ===================================================================
            CARD 4: Saved Canvas & History (Amber & Warm Honey Glow)
            =================================================================== */}
        <div className="relative group rounded-2xl bg-gradient-to-br from-[#fffbeb] via-[#ffffff] to-[#fef3c7]/50 dark:from-[#451a03]/60 dark:via-[#231e1a] dark:to-[#171513] border border-amber-200/70 dark:border-amber-900/40 hover:border-amber-300 dark:hover:border-amber-700/60 p-5 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-visible">
          {/* Subtle Ambient Radial Wash */}
          <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-amber-300/20 dark:bg-amber-600/15 rounded-full blur-2xl pointer-events-none" />

          {/* Top-right "Always there" doodle (floating, enlarged) */}
          <div className="hidden sm:flex flex-col items-center absolute right-4 -top-7 font-handwriting font-bold text-base sm:text-lg text-amber-950 dark:text-amber-200 select-none pointer-events-none animate-float-medium">
            <span className="drop-shadow-2xs">Always there</span>
            <svg className="w-5 h-5 drop-shadow-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M12 4v14M6 12l6 6 6-6" />
            </svg>
          </div>

          <div className="relative z-10">
            <h3 className="font-heading text-lg font-bold text-[var(--color-text-primary)] mb-4">
              Saved Canvas & History
            </h3>

            {/* Inner Mockup Window */}
            <div className="relative w-full h-44 rounded-xl border border-amber-200/50 dark:border-amber-900/30 bg-[var(--color-surface)]/80 backdrop-blur-xs overflow-hidden flex flex-col shadow-xs">
              {/* Mini Chrome */}
              <div className="h-5 border-b border-[var(--color-border)] bg-[var(--color-surface-secondary)]/60 flex items-center px-2 gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff5f56]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#ffbd2e]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#27c93f]" />
              </div>

              {/* Workspace with Saved Drafts & History Sidebar */}
              <div className="flex-1 flex overflow-hidden">
                {/* Left canvas area with document preview boxes */}
                <div className="flex-1 p-2.5 flex items-center justify-center gap-2">
                  <div className="w-14 h-16 rounded border border-[var(--color-border-strong)] bg-[var(--color-surface)] shadow-2xs p-1 flex flex-col justify-between">
                    <div className="w-4 h-3 bg-amber-200 dark:bg-amber-800/80 rounded-xs" />
                    <div className="space-y-1">
                      <div className="w-full h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
                      <div className="w-2/3 h-1 bg-slate-200 dark:bg-slate-700 rounded-full" />
                    </div>
                  </div>
                  <div className="w-14 h-16 rounded border border-[var(--color-border-strong)] bg-[var(--color-surface)] shadow-2xs p-1 flex flex-col justify-between">
                    <div className="w-full h-6 border border-dashed border-slate-300 dark:border-slate-600 rounded-xs flex items-center justify-center text-[10px] text-slate-400">
                      📐
                    </div>
                    <div className="w-4/5 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
                  </div>
                </div>

                {/* Right History Version Sidebar */}
                <div className="w-26 border-l border-[var(--color-border)] bg-[var(--color-surface)] p-2 space-y-1.5 text-[9.5px]">
                  <span className="font-semibold text-[var(--color-text-primary)] block text-[10.5px]">Historical</span>
                  <div className="p-1.5 rounded bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)]">
                    <div className="font-medium text-[var(--color-text-primary)]">v2.4 Today</div>
                    <div className="text-[8px] text-[var(--color-text-muted)]">10:42 AM • 4 edits</div>
                  </div>
                  <div className="p-1 rounded text-[var(--color-text-muted)]">
                    <div>v2.3 Yesterday</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-1.5 font-handwriting font-bold text-base sm:text-lg text-amber-900 dark:text-amber-200 mt-3.5 animate-float-gentle">
            <span className="drop-shadow-2xs">Automatic cloud autosave</span>
          </div>
        </div>

        {/* ===================================================================
            CARD 5: Online & Offline Status (Rose & Peach Glow)
            =================================================================== */}
        <div className="relative group rounded-2xl bg-gradient-to-br from-[#fff1f2] via-[#ffffff] to-[#ffe4e6]/50 dark:from-[#4c0519]/60 dark:via-[#251c20] dark:to-[#181215] border border-rose-200/70 dark:border-rose-900/40 hover:border-rose-300 dark:hover:border-rose-700/60 p-5 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-visible">
          {/* Subtle Ambient Radial Wash */}
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-rose-300/20 dark:bg-rose-600/15 rounded-full blur-2xl pointer-events-none" />

          {/* Radiating burst lines above pill (floating) */}
          <div className="hidden sm:block absolute right-14 top-2 select-none pointer-events-none animate-float-slow">
            <img
              src={burstLines}
              alt=""
              className="w-6 h-5 object-contain dark:invert"
            />
          </div>

          <div className="relative z-10">
            <h3 className="font-heading text-lg font-bold text-[var(--color-text-primary)] mb-4">
              Online & Offline Status
            </h3>

            {/* Inner Interactive Presence Card */}
            <div className="relative w-full h-44 rounded-xl border border-rose-200/50 dark:border-rose-900/30 bg-[var(--color-surface)]/80 backdrop-blur-xs p-4 flex flex-col justify-center gap-3 shadow-xs">
              {/* User 1 Presence Row */}
              <div className="flex items-center justify-between bg-[var(--color-surface)] p-2 rounded-xl border border-[var(--color-border)] shadow-2xs">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&h=96&fit=crop&crop=faces&q=80"
                      alt="Maya user"
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                  </div>
                  <span className="text-xs font-semibold text-[var(--color-text-primary)]">Elena</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold">
                    Active
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[11px] font-medium">
                    Be right back
                  </span>
                </div>
              </div>

              {/* User 2 Presence Row with Live tooltip checkmark (floating, enlarged) */}
              <div className="flex items-center justify-between bg-[var(--color-surface)] p-2 rounded-xl border border-[var(--color-border)] shadow-2xs">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=faces&q=80"
                      alt="Rohan user"
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                  </div>
                  <span className="text-xs font-semibold text-[var(--color-text-primary)]">Rohan</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold">
                    Active
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-500 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-2xs">
                    ✓ Live status
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom doodle: "Live status" (floating, enlarged) */}
          <div className="flex items-center justify-center gap-1.5 font-handwriting font-bold text-base sm:text-lg text-rose-900 dark:text-rose-200 mt-3.5 animate-float-slow">
            <span className="drop-shadow-2xs">✨ Real-time member heartbeat</span>
          </div>
        </div>

        {/* ===================================================================
            CARD 6: Interactive Collaboration (Fuchsia & Violet Glow)
            =================================================================== */}
        <div className="relative group rounded-2xl bg-gradient-to-br from-[#faf5ff] via-[#ffffff] to-[#f3e8ff]/60 dark:from-[#3b0764]/60 dark:via-[#211a28] dark:to-[#15121c] border border-fuchsia-200/70 dark:border-fuchsia-900/40 hover:border-fuchsia-300 dark:hover:border-fuchsia-700/60 p-5 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-visible">
          {/* Subtle Ambient Radial Wash */}
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-fuchsia-300/20 dark:bg-fuchsia-600/15 rounded-full blur-2xl pointer-events-none" />

          {/* Top-right "Collab!" doodle (floating, enlarged) */}
          <div className="hidden sm:flex flex-col items-center absolute right-6 -top-7 font-handwriting font-bold text-base sm:text-lg text-fuchsia-950 dark:text-fuchsia-200 select-none pointer-events-none animate-float-medium">
            <span className="drop-shadow-2xs">Collab!</span>
            <svg className="w-5 h-5 drop-shadow-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M12 4v14M6 12l6 6 6-6" />
            </svg>
          </div>

          {/* Yellow sticky note: "Collab!" on top right corner (floating, enlarged) */}
          <div className="hidden sm:block absolute -right-3 top-2 w-20 h-16 bg-[#fef08a] dark:bg-[#786317] text-amber-950 dark:text-amber-100 rounded shadow-xs rotate-6 p-2 z-20 text-center font-handwriting font-bold text-base sm:text-lg animate-float-slow">
            Collab!
          </div>

          <div className="relative z-10">
            <h3 className="font-heading text-lg font-bold text-[var(--color-text-primary)] mb-4">
              Interactive Collaboration
            </h3>

            {/* Inner Mockup Window */}
            <div className="relative w-full h-44 rounded-xl border border-fuchsia-200/50 dark:border-fuchsia-900/30 bg-[var(--color-surface)]/80 backdrop-blur-xs overflow-hidden flex flex-col shadow-xs">
              {/* Mini Chrome */}
              <div className="h-5 border-b border-[var(--color-border)] bg-[var(--color-surface-secondary)]/60 flex items-center px-2 gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff5f56]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#ffbd2e]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#27c93f]" />
              </div>

              {/* Collaborative Whiteboard with Cursors & Connected Paths */}
              <div className="relative flex-1 canvas-dots p-2 overflow-hidden flex items-center justify-center">
                {/* SVG curved paths connecting users */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 240 140" fill="none">
                  {/* Purple line from Maya */}
                  <path d="M 45 45 C 90 40, 140 100, 190 90" stroke="#818CF8" strokeWidth="2" strokeDasharray="3 3" />
                  {/* Orange line from Rohan */}
                  <path d="M 180 85 C 140 85, 90 45, 50 45" stroke="#FB923C" strokeWidth="2" />
                </svg>

                {/* Maya collaborator cursor (static inside canvas) */}
                <div className="absolute left-6 top-8 flex items-start gap-1 z-10">
                  <div className="px-2 py-0.5 rounded-full bg-indigo-500 text-white text-[10px] font-bold shadow-xs">
                    Maya
                  </div>
                  <svg className="w-3.5 h-3.5 text-indigo-500 -rotate-12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
                  </svg>
                </div>

                {/* Rohan collaborator cursor (static inside canvas) */}
                <div className="absolute right-8 bottom-6 flex items-start gap-1 z-10">
                  <svg className="w-3.5 h-3.5 text-orange-500 -rotate-12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
                  </svg>
                  <div className="px-2 py-0.5 rounded-full bg-orange-500 text-white text-[10px] font-bold shadow-xs">
                    Rohan
                  </div>
                </div>

                {/* Typing annotations (static inside canvas) */}
                <span className="absolute right-4 top-4 text-xs sm:text-sm font-handwriting text-slate-700 dark:text-slate-200 font-bold drop-shadow-2xs">
                  Cursor Typing.
                </span>
                <span className="absolute left-6 bottom-3 text-xs sm:text-sm font-handwriting text-slate-700 dark:text-slate-200 font-bold drop-shadow-2xs">
                  Typing...
                </span>
              </div>
            </div>
          </div>

          {/* Bottom annotation (floating, enlarged) */}
          <div className="flex items-center justify-center gap-1.5 font-handwriting font-bold text-base sm:text-lg text-fuchsia-900 dark:text-fuchsia-200 mt-3.5 animate-float-medium">
            <span className="drop-shadow-2xs">Multiplayer presence & sync</span>
          </div>
        </div>

      </div>
    </section>
  );
}
