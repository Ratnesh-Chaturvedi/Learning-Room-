import React, { useState } from 'react';
import {
  goldMedal,
  whiteboardPreview,
  footerBooks,
  pencilHolder,
  footerPencil,
  ratneshAvatar,
  aboutUsAvatars,
} from '../../assets';

export default function ActivityView({ onOpenRoom }) {
  const [activeFilter, setActiveFilter] = useState('Full History');
  const [timeFilter, setTimeFilter] = useState('This week');

  const filterButtons = ['Full History', 'Stats', 'Badges', 'Resources'];

  return (
    <div className="w-full max-w-[1560px] mx-auto flex flex-col gap-6 select-none font-sans pb-4">
      {/* ========================================================= */}
      {/* 1. TOP HEADER & MOTTO ROW                                 */}
      {/* ========================================================= */}
      <div className="flex items-start justify-between relative pt-1">
        {/* Left: Radiating rays + Title + Subtitle */}
        <div className="relative">
          {/* 3 Radiating hand-drawn ink ticks */}
          <div className="absolute -top-5 left-0 text-[#1E1F24] dark:text-gray-300 pointer-events-none select-none">
            <svg className="w-5 h-5 -rotate-12" viewBox="0 0 20 20" fill="none">
              <line x1="2" y1="4" x2="7" y2="8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="2" y1="11" x2="8" y2="11" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="3" y1="18" x2="8" y2="14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </div>

          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#18191F] dark:text-[#F3F4F6] tracking-tight">
            Activity
          </h1>
          <p className="text-sm sm:text-base text-[#5E606D] dark:text-[#A0A2B0] mt-1">
            Track your progress & keep moving forward!
          </p>
        </div>

        {/* Right: Floating handwritten quote "Learn. Collaborate. Grow." with curved arrow */}
        <div className="hidden xl:flex items-center gap-2 font-handwriting text-base font-bold text-[#3B3C46] dark:text-[#D4D6E2] pr-6 select-none">
          <div className="text-right leading-tight">
            Learn.<br />Collaborate.<br />Grow.
          </div>
          {/* Curved hand-drawn ink arrow pointing down towards the right card */}
          <svg className="w-7 h-7 text-[#3B3C46] dark:text-[#D4D6E2] -mt-1" viewBox="0 0 32 32" fill="none">
            <path d="M4 10 C 14 6, 22 14, 26 24 M 20 24 L 26 24 L 26 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. MAIN 2-COLUMN SPLIT (LEFT 8 COLS, RIGHT 4 COLS)       */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* ------------------------------------------------------- */}
        {/* LEFT AREA: BANNER + (ACTIVITY FEED & STATS SUB-GRID)    */}
        {/* ------------------------------------------------------- */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          {/* WELCOME TO YOUR ACTIVITY HUB BANNER */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#FFF4EB] via-[#FDF7F2] to-[#F5EFFE] dark:from-[#26222C] dark:via-[#23202E] dark:to-[#1E1B2D] border border-[#FDE5D2] dark:border-[#383348] p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-5 shadow-xs">
            {/* Left text with sparkles */}
            <div className="flex items-center gap-2.5">
              <div className="text-sm sm:text-base text-[#18191F] dark:text-[#F3F4F6] font-medium leading-tight">
                <span>Welcome to your Activity hub,</span>
                <span className="font-heading font-extrabold text-[#18191F] dark:text-white block sm:inline sm:ml-1">
                  Ratnesh!
                </span>
              </div>
              {/* Hand-drawn Sparkles Doodle ✦ ✧ */}
              <div className="flex items-center gap-0.5 text-amber-500 flex-shrink-0">
                <span className="text-base">✦</span>
                <span className="text-xs">✧</span>
              </div>
            </div>

            {/* Center: Gold Medal with Purple Ribbons */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 relative">
              <img
                src={goldMedal}
                alt="Achievement Medal"
                className="w-full h-full object-contain filter drop-shadow-sm select-none"
              />
              {/* Radiating sketch marks around medal */}
              <span className="absolute -top-1 -right-1 text-amber-500 text-xs">✦</span>
              <span className="absolute -bottom-1 -left-1 text-purple-500 text-xs">✧</span>
            </div>

            {/* Right: 4 Pill Filter Buttons */}
            <div className="flex items-center gap-2 flex-wrap justify-center md:justify-end">
              {filterButtons.map((btn) => {
                const isActive = activeFilter === btn;
                return (
                  <button
                    key={btn}
                    type="button"
                    onClick={() => setActiveFilter(btn)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer ${
                      isActive
                        ? 'bg-[#39318F] dark:bg-[#543FE3] text-white shadow-xs'
                        : 'bg-white dark:bg-[#252833] text-[#33353F] dark:text-[#B5B7C2] border border-[#E5E1D8] dark:border-[#383B47] hover:bg-gray-50 dark:hover:bg-[#2C2F3D]'
                    }`}
                  >
                    {btn}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SUB-GRID: ACTIVITY FEED (LEFT) + MY STATS & JOURNEY (RIGHT) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* --------------------------------------------------- */}
            {/* SUB-COLUMN 1: ACTIVITY FEED                         */}
            {/* --------------------------------------------------- */}
            <div className="flex flex-col gap-3">
              {/* Heading */}
              <div className="flex items-center justify-between">
                <div className="relative inline-block">
                  <h2 className="font-heading font-extrabold text-base sm:text-lg text-[#18191F] dark:text-[#F3F4F6]">
                    Activity Feed
                  </h2>
                  {/* Purple hand-drawn scribble underline */}
                  <svg className="absolute -bottom-1 left-0 w-full h-2 text-[#3A3B45] dark:text-gray-400" viewBox="0 0 100 8" fill="none">
                    <path d="M 2 4 Q 30 1, 60 5 T 98 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <button
                  type="button"
                  className="text-xs font-semibold text-[#543FE3] dark:text-[#A798FF] hover:underline flex items-center gap-1"
                >
                  View all →
                </button>
              </div>

              {/* Timeline Container with 4 Items */}
              <div className="relative pl-6 space-y-3 before:absolute before:left-3 before:top-4 before:bottom-4 before:w-0.5 before:bg-[#EAE5DE] dark:before:bg-[#2E313D] flex-1 flex flex-col justify-between">
                {/* Item 1 */}
                <div className="relative group">
                  <div className="absolute -left-6 top-3.5 w-6 h-6 rounded-full bg-[#EAE5FC] dark:bg-[#342D59] text-[#543FE3] dark:text-[#B6A8FF] flex items-center justify-center text-xs font-extrabold ring-4 ring-[#FAF8F5] dark:ring-[#121316]">
                    1
                  </div>
                  <div className="bg-white dark:bg-[#1D1F26] border border-[#EAE5DE] dark:border-[#2D303A] rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs hover:border-[#6C52EE]/40 transition-all">
                    <div className="space-y-1 min-w-0">
                      <h4 className="font-bold text-xs sm:text-sm text-[#18191F] dark:text-[#F3F4F6] truncate">
                        Joined DSA Practice Group
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] sm:text-xs">
                        <span className="text-[#717382] dark:text-[#9193A1]">10m ago</span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Live participation
                        </span>
                      </div>
                    </div>

                    {/* Overlapping User Avatars */}
                    <div className="flex items-center -space-x-1.5 flex-shrink-0">
                      <img src={ratneshAvatar} alt="user" className="w-6 h-6 rounded-full ring-2 ring-white dark:ring-[#1D1F26] object-cover" />
                      <div className="w-6 h-6 rounded-full bg-amber-200 ring-2 ring-white dark:ring-[#1D1F26] flex items-center justify-center text-[10px] font-bold text-amber-700">R</div>
                      <div className="w-6 h-6 rounded-full bg-blue-200 ring-2 ring-white dark:ring-[#1D1F26] flex items-center justify-center text-[10px] font-bold text-blue-700">S</div>
                      <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 ring-2 ring-white dark:ring-[#1D1F26] flex items-center justify-center text-[9px] font-bold text-gray-600 dark:text-gray-300">+2</div>
                    </div>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="relative group">
                  <div className="absolute -left-6 top-3.5 w-6 h-6 rounded-full bg-[#EAE5FC] dark:bg-[#342D59] text-[#543FE3] dark:text-[#B6A8FF] flex items-center justify-center text-xs font-extrabold ring-4 ring-[#FAF8F5] dark:ring-[#121316]">
                    2
                  </div>
                  <div className="bg-white dark:bg-[#1D1F26] border border-[#EAE5DE] dark:border-[#2D303A] rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs hover:border-[#6C52EE]/40 transition-all">
                    <div className="space-y-1 min-w-0">
                      <h4 className="font-bold text-xs sm:text-sm text-[#18191F] dark:text-[#F3F4F6] truncate">
                        Completed System Design Quiz Ch. 4
                      </h4>
                      <div className="text-[11px] sm:text-xs text-[#717382] dark:text-[#9193A1]">
                        2 hours ago
                      </div>
                    </div>

                    {/* Medal Badge Pill */}
                    <div className="flex-shrink-0 bg-[#FFF5ED] dark:bg-[#2D231E] border border-[#FDE5D2] dark:border-[#4B362C] px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-200 shadow-2xs">
                      <svg className="w-4 h-4 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="8" r="6" />
                        <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
                      </svg>
                      <span className="text-[11px] font-bold">Ch. 4 Completed!</span>
                    </div>
                  </div>
                </div>

                {/* Item 3 */}
                <div className="relative group">
                  <div className="absolute -left-6 top-3.5 w-6 h-6 rounded-full bg-[#EAE5FC] dark:bg-[#342D59] text-[#543FE3] dark:text-[#B6A8FF] flex items-center justify-center text-xs font-extrabold ring-4 ring-[#FAF8F5] dark:ring-[#121316]">
                    3
                  </div>
                  <div className="bg-white dark:bg-[#1D1F26] border border-[#EAE5DE] dark:border-[#2D303A] rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs hover:border-[#6C52EE]/40 transition-all">
                    <div className="space-y-1 min-w-0">
                      <h4 className="font-bold text-xs sm:text-sm text-[#18191F] dark:text-[#F3F4F6] truncate">
                        Saved a draft on the Shared Whiteboard
                      </h4>
                      <div className="text-[11px] sm:text-xs text-[#717382] dark:text-[#9193A1]">
                        1 day ago
                      </div>
                    </div>

                    {/* Whiteboard Preview Thumbnail */}
                    <div className="w-16 h-11 rounded-lg border border-[#E5E1D8] dark:border-[#383B47] overflow-hidden flex-shrink-0 bg-white shadow-2xs">
                      <img
                        src={whiteboardPreview}
                        alt="Whiteboard wireframe sketch preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>

                {/* Item 4 */}
                <div className="relative group">
                  <div className="absolute -left-6 top-3.5 w-6 h-6 rounded-full bg-[#EAE5FC] dark:bg-[#342D59] text-[#543FE3] dark:text-[#B6A8FF] flex items-center justify-center text-xs font-extrabold ring-4 ring-[#FAF8F5] dark:ring-[#121316]">
                    4
                  </div>
                  <div className="bg-white dark:bg-[#1D1F26] border border-[#EAE5DE] dark:border-[#2D303A] rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs hover:border-[#6C52EE]/40 transition-all">
                    <div className="space-y-1 min-w-0">
                      <h4 className="font-bold text-xs sm:text-sm text-[#18191F] dark:text-[#F3F4F6] truncate">
                        Had a Google Meet with 4 Friends
                      </h4>
                      <div className="text-[11px] sm:text-xs text-[#717382] dark:text-[#9193A1]">
                        2 days ago
                      </div>
                    </div>

                    {/* Overlapping User Avatars */}
                    <div className="flex items-center -space-x-1.5 flex-shrink-0">
                      <img src={ratneshAvatar} alt="user" className="w-6 h-6 rounded-full ring-2 ring-white dark:ring-[#1D1F26] object-cover" />
                      <div className="w-6 h-6 rounded-full bg-purple-200 ring-2 ring-white dark:ring-[#1D1F26] flex items-center justify-center text-[10px] font-bold text-purple-700">M</div>
                      <div className="w-6 h-6 rounded-full bg-emerald-200 ring-2 ring-white dark:ring-[#1D1F26] flex items-center justify-center text-[10px] font-bold text-emerald-700">T</div>
                      <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 ring-2 ring-white dark:ring-[#1D1F26] flex items-center justify-center text-[9px] font-bold text-gray-600 dark:text-gray-300">+2</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* --------------------------------------------------- */}
            {/* SUB-COLUMN 2: MY STATS & JOURNEY                    */}
            {/* --------------------------------------------------- */}
            <div className="flex flex-col gap-3">
              {/* Heading */}
              <div className="relative inline-block">
                <h2 className="font-heading font-extrabold text-base sm:text-lg text-[#18191F] dark:text-[#F3F4F6]">
                  My Stats & Journey
                </h2>
                {/* Purple hand-drawn scribble underline */}
                <svg className="absolute -bottom-1 left-0 w-full h-2 text-[#3A3B45] dark:text-gray-400" viewBox="0 0 120 8" fill="none">
                  <path d="M 2 4 Q 35 1, 70 5 T 118 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>

              {/* Stats Card */}
              <div className="bg-white dark:bg-[#1D1F26] border border-[#EAE5DE] dark:border-[#2D303A] rounded-3xl p-5 shadow-xs flex flex-col justify-between gap-4 flex-1">
                {/* Study Time Header with Dropdown */}
                <div className="space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#717382] dark:text-[#9A9CA8]">
                      Study Time
                    </span>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#F3EEFE] dark:bg-[#2A2445] text-[#543FE3] dark:text-[#C5BAFF] border border-[#E5DBFD] dark:border-[#3D3466]"
                    >
                      <span>{timeFilter}</span>
                      <span>⌵</span>
                    </button>
                  </div>

                  <div className="flex items-baseline gap-1.5 pt-1">
                    <span className="font-heading font-extrabold text-3xl text-[#18191F] dark:text-[#F3F4F6]">
                      24h
                    </span>
                    <span className="text-xs text-[#717382] dark:text-[#9A9CA8]">
                      this week
                    </span>
                  </div>
                </div>

                {/* Purple Wavy Curve Graph */}
                <div className="h-20 w-full relative">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 240 60" fill="none" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="activityCurveGrad2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6C52EE" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#6C52EE" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 0 45 Q 35 48, 65 30 T 130 38 T 195 18 T 240 22 L 240 60 L 0 60 Z"
                      fill="url(#activityCurveGrad2)"
                    />
                    <path
                      d="M 0 45 Q 35 48, 65 30 T 130 38 T 195 18 T 240 22"
                      stroke="#6C52EE"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                </div>

                {/* Completed Rooms & Current Streak */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#EFEBE4] dark:border-[#2E313D]">
                  <div>
                    <div className="text-xs text-[#717382] dark:text-[#9A9CA8]">
                      Completed Rooms
                    </div>
                    <div className="font-heading font-extrabold text-2xl text-[#18191F] dark:text-[#F3F4F6] mt-0.5">
                      12
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[#717382] dark:text-[#9A9CA8]">
                      Current Streak
                    </div>
                    <div className="font-heading font-extrabold text-2xl text-[#18191F] dark:text-[#F3F4F6] mt-0.5 flex items-center gap-1">
                      <span>🔥</span>
                      <span>5 Days</span>
                    </div>
                  </div>
                </div>

                {/* My Achievements Row */}
                <div className="space-y-2 pt-2 border-t border-[#EFEBE4] dark:border-[#2E313D]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#18191F] dark:text-[#F3F4F6]">
                      My Achievements
                    </span>
                    <span className="text-[11px] font-semibold text-[#543FE3] dark:text-[#A798FF] hover:underline cursor-pointer">
                      Unlockable
                    </span>
                  </div>

                  {/* 4 Ribbon Badges Row */}
                  <div className="grid grid-cols-4 gap-2 text-center items-center">
                    {/* Badge 1: Lavender Ribbon */}
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-12 relative flex items-center justify-center">
                        <svg viewBox="0 0 40 48" className="w-full h-full drop-shadow-2xs" fill="none">
                          <path d="M 20 4 C 28 4, 34 10, 34 18 C 34 26, 28 32, 20 32 C 12 32, 6 26, 6 18 C 6 10, 12 4, 20 4 Z" fill="#EAE5FC" stroke="#6C52EE" strokeWidth="2" />
                          <polygon points="12,30 8,46 16,40 20,44 20,30" fill="#6C52EE" opacity="0.8" />
                          <polygon points="28,30 32,46 24,40 20,44 20,30" fill="#6C52EE" opacity="0.8" />
                        </svg>
                        <svg className="w-4 h-4 text-[#6C52EE] absolute top-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                        </svg>
                      </div>
                    </div>

                    {/* Badge 2: Blue Ribbon */}
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-12 relative flex items-center justify-center">
                        <svg viewBox="0 0 40 48" className="w-full h-full drop-shadow-2xs" fill="none">
                          <path d="M 20 4 C 28 4, 34 10, 34 18 C 34 26, 28 32, 20 32 C 12 32, 6 26, 6 18 C 6 10, 12 4, 20 4 Z" fill="#E5EFFD" stroke="#2563EB" strokeWidth="2" />
                          <polygon points="12,30 8,46 16,40 20,44 20,30" fill="#2563EB" opacity="0.8" />
                          <polygon points="28,30 32,46 24,40 20,44 20,30" fill="#2563EB" opacity="0.8" />
                        </svg>
                        <span className="absolute top-2.5 text-[7px] font-extrabold text-[#2563EB] tracking-tighter">
                          LEAD
                        </span>
                      </div>
                    </div>

                    {/* Badge 3: Gold Star Ribbon */}
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-12 relative flex items-center justify-center">
                        <svg viewBox="0 0 40 48" className="w-full h-full drop-shadow-2xs" fill="none">
                          <path d="M 20 4 C 28 4, 34 10, 34 18 C 34 26, 28 32, 20 32 C 12 32, 6 26, 6 18 C 6 10, 12 4, 20 4 Z" fill="#FFF5ED" stroke="#EA580C" strokeWidth="2" />
                          <polygon points="12,30 8,46 16,40 20,44 20,30" fill="#EA580C" opacity="0.8" />
                          <polygon points="28,30 32,46 24,40 20,44 20,30" fill="#EA580C" opacity="0.8" />
                        </svg>
                        <span className="absolute top-2.5 text-amber-500 text-xs">★</span>
                      </div>
                    </div>

                    {/* Badge 4: Locked Gray Ribbon */}
                    <div className="flex flex-col items-center opacity-50">
                      <div className="w-10 h-12 relative flex items-center justify-center">
                        <svg viewBox="0 0 40 48" className="w-full h-full drop-shadow-2xs" fill="none">
                          <path d="M 20 4 C 28 4, 34 10, 34 18 C 34 26, 28 32, 20 32 C 12 32, 6 26, 6 18 C 6 10, 12 4, 20 4 Z" fill="#F3F4F6" stroke="#9CA3AF" strokeWidth="2" />
                          <polygon points="12,30 8,46 16,40 20,44 20,30" fill="#9CA3AF" opacity="0.8" />
                          <polygon points="28,30 32,46 24,40 20,44 20,30" fill="#9CA3AF" opacity="0.8" />
                        </svg>
                        <svg className="w-3.5 h-3.5 text-gray-500 absolute top-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------- */}
        {/* RIGHT AREA: MILESTONES & GOALS + UPCOMING (4 COLS)     */}
        {/* ------------------------------------------------------- */}
        <div className="xl:col-span-4 flex flex-col gap-5">
          {/* CARD 1: MILESTONES & GOALS */}
          <div className="bg-white dark:bg-[#1D1F26] border border-[#EAE5DE] dark:border-[#2D303A] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="font-heading font-extrabold text-base sm:text-lg text-[#18191F] dark:text-[#F3F4F6]">
              Milestones & Goals
            </h3>

            {/* Goal 1 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#18191F] dark:text-[#F3F4F6]">DSA Mastery</span>
                <span className="font-bold text-[#18191F] dark:text-[#F3F4F6]">78%</span>
              </div>
              <div className="text-[11px] text-[#717382] dark:text-[#9A9CA8]">78% completed</div>
              <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div className="h-full rounded-full bg-[#543FE3]" style={{ width: '78%' }} />
              </div>
            </div>

            {/* Goal 2 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[11px] text-[#717382] dark:text-[#9A9CA8]">78% completed</span>
                <span className="font-bold text-[#18191F] dark:text-[#F3F4F6]">78%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div className="h-full rounded-full bg-[#543FE3]" style={{ width: '78%' }} />
              </div>
            </div>

            {/* Goal 3 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#18191F] dark:text-[#F3F4F6]">DSA Mastery</span>
                <span className="font-bold text-[#18191F] dark:text-[#F3F4F6]">78%</span>
              </div>
              <div className="text-[11px] text-[#717382] dark:text-[#9A9CA8]">80% completed</div>
              <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div className="h-full rounded-full bg-[#543FE3]" style={{ width: '80%' }} />
              </div>
            </div>

            {/* Goal 4 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[11px] text-[#717382] dark:text-[#9A9CA8]">68% completed</span>
                <span className="font-bold text-[#18191F] dark:text-[#F3F4F6]">30%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div className="h-full rounded-full bg-[#543FE3]" style={{ width: '30%' }} />
              </div>
            </div>

            {/* Add Milestones Button */}
            <button
              type="button"
              className="w-full py-2.5 rounded-full border border-[#D5D0C6] dark:border-[#3D404E] text-xs font-semibold text-[#18191F] dark:text-[#F3F4F6] hover:bg-gray-50 dark:hover:bg-[#252833] transition-colors mt-2"
            >
              Add Milestones
            </button>
          </div>

          {/* CARD 2: UPCOMING */}
          <div className="bg-white dark:bg-[#1D1F26] border border-[#EAE5DE] dark:border-[#2D303A] rounded-3xl p-5 sm:p-6 shadow-xs space-y-3.5">
            <h3 className="font-heading font-extrabold text-base sm:text-lg text-[#18191F] dark:text-[#F3F4F6]">
              Upcoming
            </h3>

            {/* Timeline Items */}
            <div className="relative pl-5 space-y-3.5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#EAE5DE] dark:before:bg-[#2E313D]">
              {/* Item 1 */}
              <div className="relative">
                <div className="absolute -left-5 top-0.5 w-4 h-4 rounded-full bg-[#543FE3] text-white flex items-center justify-center text-[10px] font-bold">
                  ✓
                </div>
                <div className="font-bold text-xs text-[#18191F] dark:text-[#F3F4F6]">
                  Web Dev meet tomorrow
                </div>
                <div className="text-[11px] text-[#717382] dark:text-[#9A9CA8]">
                  1 day ago
                </div>
              </div>

              {/* Item 2 */}
              <div className="relative">
                <div className="absolute -left-4 top-1.5 w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" />
                <div className="font-bold text-xs text-[#18191F] dark:text-[#F3F4F6]">
                  Web Dev meet tomorrow
                </div>
                <div className="text-[11px] text-[#717382] dark:text-[#9A9CA8]">
                  2 hours ago
                </div>
              </div>

              {/* Item 3 */}
              <div className="relative">
                <div className="absolute -left-4 top-1.5 w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" />
                <div className="font-bold text-xs text-[#18191F] dark:text-[#F3F4F6]">
                  Web Dev meet tomorrow
                </div>
                <div className="text-[11px] text-[#717382] dark:text-[#9A9CA8]">
                  2 days ago
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

     
     
    </div>
  );
}
