import React from 'react';
import { burstLines } from '../../assets';

/**
 * TactileStationery Component
 * Surrounding playful desk elements (sticky notes, stickers, doodles, ruled pads)
 * Perfectly positioned closely hugging the workspace without overflowing
 */
export default function TactileStationery() {
  return (
    <div className="pointer-events-none select-none" aria-hidden="true">
      {/* 1. Lined Notebook Sheet (tucked snugly on top-left behind window) */}
      <div className="hidden lg:block absolute -left-5 top-6 w-24 xl:w-28 h-32 xl:h-36 bg-[#fdfdfb] dark:bg-[#232420] border border-[#e2e0d8] dark:border-[#383a34] rounded-md shadow-xs -rotate-6 z-0 overflow-hidden pl-4 pr-2 pt-2">
        <div className="absolute left-3.5 top-0 bottom-0 w-[1px] bg-red-300 dark:bg-red-900/60" />
        <div className="notepad-rule" />
        <div className="notepad-rule" />
        <div className="notepad-rule" />
        <div className="notepad-rule" />
        <div className="notepad-rule" />
      </div>

      {/* 2. Pink Sticky Note ("Team sync" with scribbles) */}
      <div className="hidden md:flex flex-col absolute -left-5 top-24 w-22 xl:w-26 h-20 xl:h-22 bg-[#ffccd5] dark:bg-[#6b3543] text-pink-950 dark:text-pink-100 rounded shadow-sm -rotate-6 z-20 p-2.5 animate-float-gentle">
        <div className="washi-tape" />
        <span className="font-handwriting font-bold text-base xl:text-lg tracking-tight mt-0.5">Team sync</span>
        <div className="w-4/5 h-[1.5px] bg-pink-700/40 dark:bg-pink-300/40 rounded mt-1.5" />
        <div className="w-1/2 h-[1.5px] bg-pink-700/40 dark:bg-pink-300/40 rounded mt-1" />
      </div>

      {/* 3. Yellow Smiley Sticker (tucked on bottom-left) */}
      <div className="hidden sm:block absolute -left-2 bottom-16 z-20 drop-shadow-xs rotate-6 animate-float-slow">
        <svg viewBox="0 0 36 36" className="w-7 h-7" fill="none">
          <circle cx="18" cy="18" r="16" fill="#FDE047" stroke="#1E293B" strokeWidth="2" />
          <circle cx="13" cy="15" r="2.2" fill="#1E293B" />
          <circle cx="23" cy="15" r="2.2" fill="#1E293B" />
          <path d="M12 21 C 14 26, 22 26, 24 21" stroke="#1E293B" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </div>

      {/* 4. Doodle: "Shared whiteboard" - enlarged, floating, closely pointing directly into whiteboard canvas */}
      <div className="hidden md:flex flex-col absolute -left-7 xl:-left-12 bottom-28 xl:bottom-32 z-20 items-end text-right font-handwriting font-bold text-lg sm:text-xl xl:text-2xl text-[var(--color-text-primary)] animate-float-slow">
        <div className="leading-tight -rotate-3 pr-1 drop-shadow-2xs">
          <span>Shared</span>
          <br />
          <span>whiteboard</span>
        </div>
        <svg className="w-14 h-9 text-[var(--color-text-primary)] translate-x-4 -translate-y-0.5 drop-shadow-xs" viewBox="0 0 46 28" fill="none">
          {/* Hand-drawn arrow curving and pointing directly into whiteboard edge */}
          <path d="M 4 20 C 16 18, 28 12, 42 8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M 32 6 L 42 8 L 36 17" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* 5. Left Star Doodle */}
      <div className="hidden sm:block absolute -left-3 bottom-6 text-lg font-bold text-amber-500 z-10 animate-float-gentle">
        ☆
      </div>

      {/* --- RIGHT SIDE STATIONERY --- */}

      {/* 6. Doodle: Radiating Burst Lines at top-right */}
      <div className="hidden sm:block absolute right-0 -top-4 z-10 animate-float-slow">
        <img
          src={burstLines}
          alt=""
          className="w-7 h-5 object-contain dark:invert"
        />
      </div>

      {/* 7. Doodle: "Compact chat" - enlarged, floating, closely pointing directly into the side chat header */}
      <div className="hidden md:flex flex-col absolute right-4 xl:right-8 -top-14 xl:-top-16 z-20 items-center font-handwriting font-bold text-lg sm:text-xl xl:text-2xl text-[var(--color-text-primary)] animate-float-medium">
        <div className="leading-tight rotate-2 text-center mb-0.5 drop-shadow-2xs">
          <span>Compact</span>
          <br />
          <span>chat</span>
        </div>
        <svg className="w-10 h-9 text-[var(--color-text-primary)] drop-shadow-xs" viewBox="0 0 34 30" fill="none">
          {/* Curved arrow pointing directly down into the side chat header */}
          <path d="M 17 3 C 17 10, 17 16, 17 24" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M 10 18 L 17 25 L 24 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* 8. Purple Sticky Note (tucked on right) */}
      <div className="hidden md:block absolute -right-3 top-20 w-14 xl:w-16 h-14 xl:h-16 bg-[#e9d5ff] dark:bg-[#582977] rounded shadow-xs rotate-6 z-10 overflow-hidden animate-float-gentle">
        <div className="corner-fold" />
      </div>

      {/* 9. Sparkle Doodle ✦ beside purple note */}
      <div className="hidden sm:block absolute -right-6 top-16 text-base font-bold text-indigo-500 z-20 animate-float-slow">
        ✦
      </div>

      {/* 11. Yellow 5-point Star Doodle (shifted down outside the chat frame) */}
      <div className="hidden sm:block absolute -right-3 -bottom-3 text-base font-bold text-amber-400 z-10 animate-float-slow">
        ★
      </div>

      {/* 12. Blue Periwinkle Star Sticker (below frame) */}
      <div className="hidden sm:block absolute right-4 -bottom-4 z-10 drop-shadow-xs rotate-12 animate-float-gentle">
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#818CF8">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </div>
    </div>
  );
}
