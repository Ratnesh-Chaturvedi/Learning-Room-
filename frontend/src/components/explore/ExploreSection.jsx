import React, { useState } from 'react';
import { burstLines } from '../../assets';

/**
 * ExploreSection Component
 * Recreates the "Find your people, and learn something new." Explore room showcase
 * exactly matching the reference design with large legible cursive typography,
 * properly proportioned (non-stretched) cards, and zero horizontal page overflow.
 */
export default function ExploreSection({ onJoinRoom, onStartRoom }) {
  const [activeCategory, setActiveCategory] = useState('All rooms');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    'All rooms',
    'Design',
    'Coding',
    'Science',
    'Languages',
    'Study sessions',
  ];

  const handleRoomClick = (roomName) => {
    if (onJoinRoom) {
      onJoinRoom(roomName);
    }
  };

  return (
    <section
      id="explore"
      className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-14 sm:py-20 max-w-[1240px] mx-auto scroll-mt-16 overflow-x-clip"
      aria-label="Explore learning rooms"
    >
      {/* Ambient Purple / Lavender Aura Wash on Top-Right */}
      <div
        className="absolute top-0 right-1/4 w-80 h-72 bg-purple-300/25 dark:bg-purple-600/15 rounded-full blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />

      {/* ===================================================================
          1. SECTION HEADER (Headline with Cursive, Radiating Burst & Sparkles)
          =================================================================== */}
      <div className="text-center max-w-3xl mx-auto mb-9 relative">
        {/* Main Headline with 45° anticlockwise burst on text border & sparkles */}
        <h2 className="font-heading text-3xl sm:text-4xl md:text-[44px] font-extrabold tracking-tight text-[var(--color-text-primary)] leading-[1.2] mb-3">
          <span className="relative inline-block">
            {/* 3-line radiating burst on text border angled 45° anticlockwise */}
            <span
              className="absolute -top-[18px] sm:-top-5 -left-[19px] sm:-left-[22px] -rotate-45 pointer-events-none select-none animate-float-slow"
              aria-hidden="true"
            >
              <img
                src={burstLines}
                alt=""
                className="w-7 h-5 sm:w-8 sm:h-6 object-contain dark:invert"
              />
            </span>
            <span>Find your people,&nbsp;</span>
          </span>
          <span className="relative inline-block">
            <span className="font-cursive font-bold italic tracking-normal text-4xl sm:text-5xl md:text-[52px] text-[var(--color-text-primary)] inline-block pr-1 drop-shadow-2xs">
              and learn something new.
            </span>
            {/* 4-point sparkle stars on top-right border of text */}
            <span
              className="hidden sm:inline-flex absolute -right-6 sm:-right-8 -top-2 items-center gap-1 text-[var(--color-text-primary)] pointer-events-none select-none animate-float-medium"
              aria-hidden="true"
            >
              <span className="text-lg">✦</span>
              <span className="text-[10px]">✦</span>
            </span>
          </span>
        </h2>

        {/* Subtitle */}
        <p className="text-[15.5px] sm:text-base text-[var(--color-text-secondary)] leading-relaxed">
          Discover curious minds, open study rooms, and ideas worth sharing.
        </p>
      </div>

      {/* ===================================================================
          2. SEARCH INPUT & CATEGORY FILTER PILLS
          =================================================================== */}
      <div className="flex flex-col items-center gap-3.5 mb-14 w-full max-w-3xl mx-auto">
        {/* Search Bar */}
        <div className="w-full max-w-xl relative">
          <div className="flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] py-2.5 pl-4 pr-3 shadow-xs focus-within:border-[var(--color-brand)] focus-within:ring-2 focus-within:ring-[var(--color-brand)]/20 transition-all">
            <svg
              className="w-4 h-4 text-[var(--color-text-muted)] mr-2 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search topics, rooms, or people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] outline-none"
              aria-label="Search topics, rooms, or people"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] px-1 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Filter Category Pills: all in one single line on big screens */}
        <div className="w-full flex items-center justify-center gap-2 sm:gap-2.5 flex-wrap sm:flex-nowrap">
          {categories.map((category) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs sm:text-[13px] font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#39318F] dark:bg-[#635bdb] text-white font-semibold shadow-xs'
                    : 'border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* ===================================================================
          3. PLAYFUL DOODLES (Large Cursive Text, Kept Contained Inside Bounds)
          =================================================================== */}
      <div className="relative pt-6 pb-12">
        {/* Top-Left: "come as you are ->" (Large cursive, snug over left card) */}
        <div
          className="hidden md:flex absolute left-2 -top-6 items-center gap-2 font-cursive font-bold text-xl sm:text-2xl text-[var(--color-text-primary)] pointer-events-none select-none animate-float-slow"
          aria-hidden="true"
        >
          <span className="-rotate-12 drop-shadow-2xs leading-none">
            come as <br /> you are
          </span>
          <svg className="w-10 h-6 text-[var(--color-text-primary)] -rotate-6" viewBox="0 0 36 22" fill="none">
            <path d="M2 14C12 8 24 10 32 14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M24 8L32 14L26 20" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Top-Right: "<- live now!" with stars (Large cursive, snug over right card) */}
        <div
          className="hidden md:flex absolute right-2 -top-5 items-center gap-2 font-cursive font-bold text-xl sm:text-2xl text-[var(--color-text-primary)] pointer-events-none select-none animate-float-medium"
          aria-hidden="true"
        >
          <svg className="w-9 h-7 text-[var(--color-text-primary)] rotate-6" viewBox="0 0 34 26" fill="none">
            <path d="M30 6C22 14 14 18 4 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M12 12L4 18L10 24" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="rotate-6 drop-shadow-2xs">live now!</span>
          <div className="flex flex-col text-sm text-slate-700 dark:text-slate-300 ml-1">
            <span>☆</span>
            <span className="text-xs -mt-1">★</span>
          </div>
        </div>

        {/* Bottom-Left: "good people, good ideas ☆ ☆" (Large cursive, snug under left card) */}
        <div
          className="hidden md:flex absolute left-2 -bottom-4 items-center gap-2.5 font-cursive font-bold text-2xl sm:text-3xl text-[var(--color-text-primary)] pointer-events-none select-none animate-float-slow"
          aria-hidden="true"
        >
          <div className="-rotate-6 drop-shadow-2xs leading-tight">
            <span>good people,</span>
            <br />
            <span className="pl-5">good ideas</span>
          </div>
          <div className="flex flex-col text-amber-500 text-base">
            <span>☆</span>
            <span className="text-xs">☆</span>
          </div>
        </div>

        {/* ===================================================================
            4. BENTO ROOM CARDS GRID
               Proportionally balanced so left & right cards are NOT stretched!
            =================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* ---------------------------------------------------------------
              CARD 1 (Left Column): Build in public club
              Whiteboard centered horizontally, zero empty white space gap!
              --------------------------------------------------------------- */}
          <div className="lg:col-span-3 max-w-sm sm:max-w-md lg:max-w-none mx-auto w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5 sm:p-4 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full group">
            {/* Header Badge & Sketch Marks */}
            <div className="flex items-center justify-between mb-2.5 shrink-0">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-[var(--color-surface-secondary)] border border-[var(--color-border)]/80 px-2 py-0.5 text-[10px] font-bold text-[var(--color-text-primary)] uppercase tracking-wider">
                <span>🎨</span>
                <span>DESIGN & BUILD</span>
              </span>
              {/* Corner burst */}
              <div className="opacity-60 select-none pointer-events-none">
                <img
                  src={burstLines}
                  alt=""
                  className="w-3.5 h-3.5 object-contain dark:invert"
                />
              </div>
            </div>

            {/* Whiteboard Canvas Visual: Centered horizontally, fills space gracefully without empty white gap */}
            <div className="relative w-full max-w-[320px] lg:max-w-none flex-1 min-h-[260px] sm:min-h-[280px] mx-auto rounded-xl border border-[var(--color-border)] bg-[#faf9f5] dark:bg-[#1a1b18] p-3 shadow-inner overflow-hidden flex flex-col justify-between">
              {/* 4 Corner Thumbtacks */}
              <span className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-600 shadow-xs" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-600 shadow-xs" />
              <span className="absolute bottom-1.5 left-1.5 w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-600 shadow-xs" />
              <span className="absolute bottom-1.5 right-1.5 w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-600 shadow-xs" />

              {/* SVG connection arrows linking sticky notes */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 200 180" fill="none">
                <path d="M 85 85 C 65 75, 55 60, 45 50" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M 115 85 C 135 75, 145 60, 155 50" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M 115 95 C 135 110, 145 125, 155 135" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round" />
              </svg>

              {/* Top Row: Build Together & Share Learn (Enlarged Cursive Text) */}
              <div className="flex items-start justify-between relative z-10">
                {/* Blue Sticky: Build Together */}
                <div className="w-16 h-13 rounded bg-[#dbeafe] dark:bg-[#1e3a5f] text-blue-950 dark:text-blue-100 p-1 shadow-xs -rotate-3 text-center font-cursive font-bold text-xs sm:text-[13px] leading-tight flex items-center justify-center">
                  Build<br />Together
                </div>

                {/* Orange Sticky: Share Learn */}
                <div className="w-16 h-13 rounded bg-[#ffedd5] dark:bg-[#5a3318] text-amber-950 dark:text-amber-100 p-1 shadow-xs rotate-3 text-center font-cursive font-bold text-xs sm:text-[13px] leading-tight flex items-center justify-center">
                  Share<br />Learn
                </div>
              </div>

              {/* Center Oval: "Great Ideas!" (Large Cursive Text) */}
              <div className="self-center my-auto px-4 py-1.5 rounded-full border-2 border-slate-700 dark:border-slate-300 bg-white dark:bg-slate-800 text-[var(--color-text-primary)] font-cursive font-bold text-base sm:text-lg shadow-xs -rotate-2 relative z-10 text-center">
                Great Ideas!
              </div>

              {/* Bottom Row: Lightbulb sketch & Grow Together */}
              <div className="flex items-end justify-between relative z-10">
                {/* Sketched Lightbulb */}
                <div className="text-xl pl-1">💡</div>

                {/* Purple Cursor hovering */}
                <div className="relative -ml-6 mb-1">
                  <svg className="w-4 h-4 text-indigo-600 -rotate-12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
                  </svg>
                </div>

                {/* Green Sticky: Grow Together */}
                <div className="w-16 h-13 rounded bg-[#dcfce7] dark:bg-[#144226] text-emerald-950 dark:text-emerald-100 p-1 shadow-xs rotate-2 text-center font-cursive font-bold text-xs sm:text-[13px] leading-tight flex items-center justify-center">
                  Grow<br />Together
                </div>
              </div>
            </div>

            {/* Content directly below visual (no blank gap, centered horizontally) */}
            <div className="mt-3 w-full max-w-[320px] lg:max-w-none mx-auto shrink-0">
              <h3 className="font-heading font-bold text-base sm:text-lg text-[var(--color-text-primary)] mb-0.5 group-hover:text-[var(--color-brand)] transition-colors">
                Build in public club
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-2.5">
                Make things, share progress, stay curious.
              </p>

              {/* Avatars, Member Count & Join Room Action */}
              <div className="pt-2 border-t border-[var(--color-border)]/60">
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="flex items-center">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces&q=80"
                      alt="Maya"
                      className="w-5 h-5 rounded-full border border-white object-cover shadow-2xs -ml-1 first:ml-0"
                    />
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=faces&q=80"
                      alt="Rohan"
                      className="w-5 h-5 rounded-full border border-white object-cover shadow-2xs -ml-1"
                    />
                    <img
                      src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=64&h=64&fit=crop&crop=faces&q=80"
                      alt="Elena"
                      className="w-5 h-5 rounded-full border border-white object-cover shadow-2xs -ml-1"
                    />
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-[9px] font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center border border-white -ml-1">
                      +9
                    </span>
                  </div>
                  <span className="text-[11.5px] text-[var(--color-text-secondary)] font-medium">
                    12 learning together
                  </span>
                </div>

                {/* Full width purple action button */}
                <button
                  type="button"
                  onClick={() => handleRoomClick('Build in public club')}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#39318F] hover:bg-[#5148c8] text-white py-2 px-3 text-xs font-semibold shadow-xs transition-all active:scale-[0.98] cursor-pointer"
                >
                  <span>Join room</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>

          {/* ---------------------------------------------------------------
              CENTER 2x2 BLOCK (Cols 4 to 9)
              Compact visual heights ensuring zero awkward vertical stretch!
              --------------------------------------------------------------- */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            
            {/* CARD 2 (Center-Top Left): The 25-minute study table */}
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
              <div>
                {/* Header Tag */}
                <div className="mb-2">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-[var(--color-surface-secondary)] border border-[var(--color-border)]/80 px-2 py-0.5 text-[10px] font-bold text-[var(--color-text-primary)] uppercase tracking-wider">
                    <span>⏱</span>
                    <span>FOCUS SESSIONS</span>
                  </span>
                </div>

                {/* Warm photo of students studying together */}
                <div className="relative w-full h-28 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-2xs">
                  <img
                    src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=500&h=300&fit=crop&crop=faces&q=80"
                    alt="Students studying collaboratively with a laptop in a library"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Title & Subtitle */}
                <h3 className="font-heading font-bold text-[15px] text-[var(--color-text-primary)] mt-2.5 mb-0.5 group-hover:text-[var(--color-brand)] transition-colors">
                  The 25-minute study table
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-2.5">
                  Quiet company for deep work.
                </p>
              </div>

              {/* Footer with Avatars, Live Count & Arrow Button */}
              <div className="pt-2 border-t border-[var(--color-border)]/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces&q=80"
                      alt="Student"
                      className="w-5 h-5 rounded-full border border-white object-cover -ml-1 first:ml-0"
                    />
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=faces&q=80"
                      alt="Student"
                      className="w-5 h-5 rounded-full border border-white object-cover -ml-1"
                    />
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-[9px] font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center border border-white -ml-1">
                      +4
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>8 here now</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRoomClick('The 25-minute study table')}
                  className="w-6 h-6 rounded-full border border-[var(--color-border)] flex items-center justify-center text-xs text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-brand)] transition-all cursor-pointer"
                  aria-label="View room"
                >
                  ›
                </button>
              </div>
            </div>

            {/* CARD 3 (Center-Top Right): Frontend playground */}
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
              <div>
                {/* Header Tag & Sparkle */}
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-[var(--color-surface-secondary)] border border-[var(--color-border)]/80 px-2 py-0.5 text-[10px] font-bold text-[var(--color-text-primary)] uppercase tracking-wider">
                    <span>&lt;/&gt;</span>
                    <span>CODING</span>
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-300">✦</span>
                </div>

                {/* Modern Laptop with Code on Screen & Pastel Glow */}
                <div className="relative w-full h-28 rounded-xl bg-gradient-to-r from-purple-50/70 via-white to-sky-50/70 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 border border-[var(--color-border)] p-2 flex items-center justify-center overflow-hidden">
                  {/* Lavender Brush doodle on left */}
                  <svg className="absolute left-2 top-2 w-7 h-10 text-purple-300 dark:text-purple-700/50 pointer-events-none" viewBox="0 0 30 50" fill="none">
                    <path d="M 5 5 Q 25 15, 10 25 T 15 45" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>

                  {/* Centered Laptop Mockup */}
                  <div className="relative w-26 h-18 rounded-md bg-slate-900 border border-slate-700 shadow-md p-1.5 flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="w-10 h-1 bg-purple-400 rounded-full" />
                      <div className="w-14 h-1 bg-emerald-400 rounded-full pl-2" />
                      <div className="w-9 h-1 bg-sky-400 rounded-full pl-3" />
                      <div className="w-12 h-1 bg-amber-400 rounded-full" />
                    </div>
                    <div className="w-full h-1 bg-slate-700 rounded-full self-center" />
                  </div>

                  {/* Code Symbol Doodle </ > on right */}
                  <div className="absolute right-3 top-5 font-mono font-bold text-sm text-[var(--color-text-secondary)]">
                    &lt;/&gt;
                  </div>
                </div>

                {/* Title & Subtitle */}
                <h3 className="font-heading font-bold text-[15px] text-[var(--color-text-primary)] mt-2.5 mb-0.5 group-hover:text-[var(--color-brand)] transition-colors">
                  Frontend playground
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-2.5">
                  Ship tiny experiments with friendly people.
                </p>
              </div>

              {/* Footer with Avatars, LIVE NOW badge & Arrow Button */}
              <div className="pt-2 border-t border-[var(--color-border)]/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=faces&q=80"
                      alt="Coder"
                      className="w-5 h-5 rounded-full border border-white object-cover -ml-1 first:ml-0"
                    />
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces&q=80"
                      alt="Coder"
                      className="w-5 h-5 rounded-full border border-white object-cover -ml-1"
                    />
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-[9px] font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center border border-white -ml-1">
                      +7
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 text-[9.5px] font-bold text-emerald-700 dark:text-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>LIVE NOW</span>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleRoomClick('Frontend playground')}
                  className="w-6 h-6 rounded-full border border-[var(--color-border)] flex items-center justify-center text-xs text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-brand)] transition-all cursor-pointer"
                  aria-label="View room"
                >
                  ›
                </button>
              </div>
            </div>

            {/* CARD 4 (Center-Bottom Left): Curiosity lab */}
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
              <div>
                {/* Header Tag */}
                <div className="mb-2">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-[var(--color-surface-secondary)] border border-[var(--color-border)]/80 px-2 py-0.5 text-[10px] font-bold text-[var(--color-text-primary)] uppercase tracking-wider">
                    <span>🔬</span>
                    <span>SCIENCE</span>
                  </span>
                </div>

                {/* Warm Parchment Illustration: Atom Model, E=mc² (Large Cursive), Ringed Planet */}
                <div className="relative w-full h-24 rounded-xl bg-[#faf6eb] dark:bg-[#201e17] border border-[var(--color-border)] p-2 flex items-center justify-between overflow-hidden">
                  {/* Hand-drawn Rutherford Atom Doodle */}
                  <div className="relative w-14 h-14 ml-1 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-2xs" />
                    <div className="absolute inset-0 rounded-full border border-slate-600 dark:border-slate-400 rotate-45 scale-y-50" />
                    <div className="absolute inset-0 rounded-full border border-slate-600 dark:border-slate-400 -rotate-45 scale-y-50" />
                    <div className="absolute inset-0 rounded-full border border-slate-600 dark:border-slate-400 scale-x-50" />
                  </div>

                  {/* Center Formula: E=mc² in Large Cursive Font */}
                  <div className="font-cursive font-bold text-xl sm:text-2xl text-[var(--color-text-primary)] -rotate-3">
                    E=mc²
                  </div>

                  {/* Hand-drawn Ringed Saturn Planet Doodle */}
                  <div className="relative w-11 h-11 mr-2 flex items-center justify-center">
                    <div className="w-5 h-5 rounded-full bg-amber-300 dark:bg-amber-600 border border-slate-700" />
                    <div className="absolute w-11 h-3 rounded-full border-2 border-slate-700 dark:border-slate-300 -rotate-25" />
                    <span className="absolute -top-1 -right-1 text-[10px]">✦</span>
                  </div>
                </div>

                {/* Title & Subtitle */}
                <h3 className="font-heading font-bold text-[15px] text-[var(--color-text-primary)] mt-2.5 mb-0.5 group-hover:text-[var(--color-brand)] transition-colors">
                  Curiosity lab
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-2.5">
                  Questions welcome. Rabbit holes encouraged.
                </p>
              </div>

              {/* Footer with Avatars & Arrow Button */}
              <div className="pt-2 border-t border-[var(--color-border)]/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <img
                      src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=64&h=64&fit=crop&crop=faces&q=80"
                      alt="Curious"
                      className="w-5 h-5 rounded-full border border-white object-cover -ml-1 first:ml-0"
                    />
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=faces&q=80"
                      alt="Curious"
                      className="w-5 h-5 rounded-full border border-white object-cover -ml-1"
                    />
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-[9px] font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center border border-white -ml-1">
                      +5
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRoomClick('Curiosity lab')}
                  className="w-6 h-6 rounded-full border border-[var(--color-border)] flex items-center justify-center text-xs text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-brand)] transition-all cursor-pointer"
                  aria-label="View room"
                >
                  ›
                </button>
              </div>
            </div>

            {/* CARD 5 (Center-Bottom Right): Language exchange café */}
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
              <div>
                {/* Header Tag */}
                <div className="mb-2">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-[var(--color-surface-secondary)] border border-[var(--color-border)]/80 px-2 py-0.5 text-[10px] font-bold text-[var(--color-text-primary)] uppercase tracking-wider">
                    <span>💬</span>
                    <span>LANGUAGES</span>
                  </span>
                </div>

                {/* Hand-drawn Speech Bubbles: Bonjour!, Hello!, Hola! (Large Cursive Font) */}
                <div className="relative w-full h-24 rounded-xl bg-gradient-to-br from-[#f8f9ff] via-[#ffffff] to-[#fff8f0] dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 border border-[var(--color-border)] p-2 flex items-center justify-around overflow-hidden">
                  {/* Bonjour! Bubble (Periwinkle, Cursive) */}
                  <div className="px-3 py-1 rounded-xl rounded-bl-xs bg-[#c7d2fe] dark:bg-[#312e81] text-indigo-950 dark:text-indigo-100 font-cursive font-bold text-sm shadow-xs -rotate-6">
                    Bonjour!
                  </div>

                  {/* Hello! Bubble (Warm Yellow Sunshine, Large Cursive) */}
                  <div className="px-3.5 py-1.5 rounded-full bg-[#fef08a] dark:bg-[#854d0e] text-amber-950 dark:text-amber-100 font-cursive font-bold text-base shadow-xs rotate-3">
                    Hello!
                  </div>

                  {/* Hola! Bubble (Soft Pink/Coral, Cursive) */}
                  <div className="px-3 py-1 rounded-xl rounded-br-xs bg-[#fbcfe8] dark:bg-[#701a75] text-pink-950 dark:text-pink-100 font-cursive font-bold text-sm shadow-xs -rotate-3">
                    Hola!
                  </div>
                </div>

                {/* Title & Subtitle */}
                <h3 className="font-heading font-bold text-[15px] text-[var(--color-text-primary)] mt-2.5 mb-0.5 group-hover:text-[var(--color-brand)] transition-colors">
                  Language exchange café
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-2.5">
                  Practice. Connect. Learn.
                </p>
              </div>

              {/* Footer with Avatars & Arrow Button */}
              <div className="pt-2 border-t border-[var(--color-border)]/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces&q=80"
                      alt="Language speaker"
                      className="w-5 h-5 rounded-full border border-white object-cover -ml-1 first:ml-0"
                    />
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=faces&q=80"
                      alt="Language speaker"
                      className="w-5 h-5 rounded-full border border-white object-cover -ml-1"
                    />
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-[9px] font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center border border-white -ml-1">
                      +6
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRoomClick('Language exchange café')}
                  className="w-6 h-6 rounded-full border border-[var(--color-border)] flex items-center justify-center text-xs text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-brand)] transition-all cursor-pointer"
                  aria-label="View room"
                >
                  ›
                </button>
              </div>
            </div>

          </div>

          {/* ---------------------------------------------------------------
              CARD 6 (Right Column): Make it make sense
              Moodboard centered horizontally, zero empty white space gap!
              --------------------------------------------------------------- */}
          <div className="lg:col-span-3 max-w-sm sm:max-w-md lg:max-w-none mx-auto w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5 sm:p-4 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full group">
            {/* Header Badge */}
            <div className="flex items-center justify-between mb-2.5 shrink-0">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-[var(--color-surface-secondary)] border border-[var(--color-border)]/80 px-2 py-0.5 text-[10px] font-bold text-[var(--color-text-primary)] uppercase tracking-wider">
                <span>✏️</span>
                <span>CREATIVE WORK</span>
              </span>
              {/* Floating star doodle on top right */}
              <div className="text-slate-600 dark:text-slate-300 text-xs">
                ☆
              </div>
            </div>

            {/* Aesthetic Collage Moodboard: Centered horizontally, fills space gracefully without empty white gap */}
            <div className="relative w-full max-w-[320px] lg:max-w-none flex-1 min-h-[260px] sm:min-h-[280px] mx-auto rounded-xl border border-[var(--color-border)] bg-[#faf9f5] dark:bg-[#1a1b18] p-2 overflow-hidden shadow-inner grid grid-cols-3 grid-rows-3 gap-1.5">
              {/* 1. Torii Gate in water (top left) */}
              <div className="row-span-2 col-span-1 rounded-md overflow-hidden bg-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=200&h=300&fit=crop&q=80"
                  alt="Torii gate"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* 2. Cherry blossoms (top center) */}
              <div className="col-span-1 row-span-1 rounded-md overflow-hidden bg-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1522383225653-ed111181a951?w=150&h=150&fit=crop&q=80"
                  alt="Cherry blossoms"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* 3. Aesthetic geometry / architecture (top right) */}
              <div className="col-span-1 row-span-1 rounded-md overflow-hidden bg-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=150&h=150&fit=crop&q=80"
                  alt="Architecture"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* 4. Emerald green swatch (middle center) */}
              <div className="col-span-1 row-span-1 rounded-md bg-emerald-700 dark:bg-emerald-800" />

              {/* 5. Vinyl record (middle right) */}
              <div className="col-span-1 row-span-1 rounded-md overflow-hidden bg-slate-900 flex items-center justify-center p-1">
                <div className="w-8 h-8 rounded-full border-2 border-slate-700 bg-black flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                </div>
              </div>

              {/* 6. Classical marble bust statue (bottom left & center) */}
              <div className="col-span-2 row-span-1 rounded-md overflow-hidden bg-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=300&h=150&fit=crop&q=80"
                  alt="Classical bust statue"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* 7. Sketched Sticky Note: "Create Share Inspire ♡" in Large Cursive Font */}
              <div className="col-span-1 row-span-1 rounded-md bg-[#fffbeb] dark:bg-[#2d281a] border border-[#fde68a]/60 text-amber-950 dark:text-amber-100 p-1 flex flex-col justify-center text-center font-cursive font-bold text-xs sm:text-[13px] leading-tight shadow-xs -rotate-2">
                <span>Create</span>
                <span>Share</span>
                <span>Inspire ♡</span>
              </div>
            </div>

            {/* Content directly below visual (no blank gap, centered horizontally) */}
            <div className="mt-3 w-full max-w-[320px] lg:max-w-none mx-auto shrink-0">
              <h3 className="font-heading font-bold text-base sm:text-lg text-[var(--color-text-primary)] mb-0.5 group-hover:text-[var(--color-brand)] transition-colors">
                Make it make sense
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-2.5">
                Design. Discuss. Improve.
              </p>

              {/* Avatars & Arrow Button */}
              <div className="pt-2 border-t border-[var(--color-border)]/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=faces&q=80"
                      alt="Creative"
                      className="w-5 h-5 rounded-full border border-white object-cover -ml-1 first:ml-0"
                    />
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces&q=80"
                      alt="Creative"
                      className="w-5 h-5 rounded-full border border-white object-cover -ml-1"
                    />
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-[9px] font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center border border-white -ml-1">
                      +8
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRoomClick('Make it make sense')}
                  className="w-6 h-6 rounded-full border border-[var(--color-border)] flex items-center justify-center text-xs text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-brand)] transition-all cursor-pointer"
                  aria-label="View room"
                >
                  ›
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ===================================================================
          5. BOTTOM BANNER HEADLINE
             "A little corner for every kind of curious ✦ ✦"
             (with "curious" in large cursive script)
          =================================================================== */}
      <div className="text-center max-w-2xl mx-auto mt-14 sm:mt-18 relative">
        <h3 className="font-heading text-2xl sm:text-3xl md:text-[38px] font-extrabold tracking-tight text-[var(--color-text-primary)] leading-[1.2] mb-3">
          <span>A little corner for every kind of </span>
          <span className="relative inline-block whitespace-nowrap">
            <span className="font-cursive font-bold italic tracking-normal text-4xl sm:text-5xl md:text-[54px] text-[var(--color-brand)] dark:text-[#a39aff] inline-block -rotate-2 px-1 drop-shadow-2xs">
              curious
            </span>
            {/* Hand-drawn sketched triple underline under "curious" */}
            <svg
              className="absolute -bottom-2.5 left-0 w-full h-3.5 text-[var(--color-brand)] dark:text-[#a39aff] pointer-events-none opacity-85"
              viewBox="0 0 100 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M2 4C30 2 70 2 98 5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
              <path d="M8 7C35 5 75 5 92 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.8" />
            </svg>
          </span>
          <span className="inline-flex items-center gap-1 ml-2 text-slate-700 dark:text-slate-300 select-none">
            <span className="text-xl">✦</span>
            <span className="text-xs">✦</span>
          </span>
        </h3>

        <p className="text-[15px] sm:text-base text-[var(--color-text-secondary)] mt-3">
          From focused study to creative brainstorming — find your perfect room.
        </p>
      </div>
    </section>
  );
}
