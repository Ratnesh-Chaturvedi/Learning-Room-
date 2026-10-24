import React, { useState } from 'react';
import RoomCard from '../room/RoomCard';
import {
  aboutUsCollab,
  studyPlanNotebook,
  exploreRocket,
  roomDsa,
  roomWebdev,
  roomExams,
  studySunset,
  gradCapPurple,
  footerBooks,
  pencilHolder,
  footerPencil,
  ratneshAvatar,
} from '../../assets';

export default function ExploreView({ onOpenRoom, onOpenCreateRoom }) {
  const [activeCategory, setActiveCategory] = useState('All Rooms');

  const categories = [
    { name: 'All Rooms', icon: '✦', isSparkle: true },
    { name: 'Coding', icon: '</>' },
    { name: 'Design', icon: '🎨' },
    { name: 'Science', icon: '⚗️' },
    { name: 'Languages', icon: '🌐' },
    { name: 'Study Sessions', icon: '🎓' },
  ];

  const trendingRooms = [
    {
      id: 'dsa-practice',
      title: 'DSA Practice Group',
      subtitle: 'Solve. Discuss. Improve.',
      status: 'Live',
      statusType: 'live',
      thumbnail: roomDsa,
      members: '24 members',
      avatarCount: '+6',
    },
    {
      id: 'web-dev-hub',
      title: 'Web Development Hub',
      subtitle: 'Build. Share. Learn.',
      status: 'Live',
      statusType: 'live',
      thumbnail: roomWebdev,
      members: '32 members',
      avatarCount: '+12',
    },
    {
      id: 'competitive-exams',
      title: 'Competitive Exams Prep',
      subtitle: 'Together for a bigger goal.',
      status: 'Scheduled',
      statusType: 'scheduled',
      thumbnail: roomExams,
      members: '20 members',
      avatarCount: '+4',
    },
    {
      id: 'languages-circle',
      title: 'Languages Circle',
      subtitle: 'Practice. Speak. Connect.',
      status: 'Live',
      statusType: 'live',
      thumbnail: studySunset,
      members: '28 members',
      avatarCount: '+7',
    },
  ];

  return (
    <div className="w-full max-w-[1560px] mx-auto flex flex-col gap-6 select-none font-sans pb-4">
      {/* ========================================================= */}
      {/* 1. HERO BANNER: DISCOVER ROOMS, EXPLORE IDEAS             */}
      {/* ========================================================= */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#FFF5ED] via-[#FBF4FC] to-[#F1EAFF] dark:from-[#242129] dark:via-[#22212E] dark:to-[#1C1A2B] border border-[#EFE8DF] dark:border-[#353245] p-6 sm:p-8 flex flex-col gap-6 shadow-xs">
        {/* Soft Ambient Glow */}
        <div className="absolute top-0 right-1/4 w-80 h-80 rounded-full bg-gradient-to-br from-amber-200/30 to-purple-300/30 dark:from-purple-900/20 dark:to-indigo-900/20 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          {/* Left Headline & Subtitle */}
          <div className="flex-1 space-y-3 relative">
            {/* 3 Radiating hand-drawn ink ticks above Discover */}
            <div className="text-[#1E1F24] dark:text-gray-300 pointer-events-none -mb-1">
              <svg className="w-6 h-6 -rotate-12" viewBox="0 0 20 20" fill="none">
                <line x1="2" y1="4" x2="7" y2="8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                <line x1="2" y1="11" x2="8" y2="11" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                <line x1="3" y1="18" x2="8" y2="14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </div>

            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-[42px] text-[#18191F] dark:text-[#F3F4F6] tracking-tight leading-tight">
              Discover rooms,
              <br />
              <span>explore </span>
              <span className="font-editorial italic font-normal text-3xl sm:text-4xl lg:text-[44px] relative inline-block">
                ideas.
                {/* Purple hand-drawn ink scribble underline */}
                <svg
                  className="absolute -bottom-1 left-0 w-full h-3 text-[#6C52EE] overflow-visible"
                  viewBox="0 0 120 12"
                  fill="none"
                >
                  <path
                    d="M 2 7 Q 30 1, 60 7 T 118 4"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="text-sm sm:text-base text-[#5A5C66] dark:text-[#A6A8B4] max-w-md pt-1 leading-relaxed">
              Join amazing learning spaces, meet curious minds, and be a part of something bigger.
            </p>

            {/* Sparkle Doodles ✦ ✧ */}
            <div className="absolute right-4 top-2 text-amber-500 hidden sm:flex items-center gap-1">
              <span className="text-sm">✦</span>
              <span className="text-xs">✧</span>
            </div>
          </div>

          {/* Right Illustration: 4 Friends Studying + Doodles */}
          <div className="relative flex-shrink-0 w-full max-w-xs sm:max-w-sm md:max-w-[360px] flex justify-center">
            {/* Handwritten "Learn. Share. Grow." above the left boy */}
            <div className="absolute -top-5 left-2 font-handwriting text-base font-bold text-[#3B3C46] dark:text-[#D4D6E2] leading-tight select-none rotate-[-4deg]">
              Learn.<br />Share. Grow.
              {/* Hand-drawn curved arrow doodle pointing down */}
              <svg className="w-5 h-5 text-[#3B3C46] dark:text-[#D4D6E2] inline-block ml-1 -mt-1" viewBox="0 0 24 24" fill="none">
                <path d="M4 14 C 10 10, 16 12, 20 8 M 16 6 L 20 8 L 18 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Floating Purple Graduation Cap above the right girl */}
            <div className="absolute -top-7 right-4 w-16 h-16 sm:w-20 sm:h-20 select-none animate-float-slow">
              <img
                src={gradCapPurple}
                alt="Graduation Cap"
                className="w-full h-full object-contain filter drop-shadow-md select-none"
              />
              <span className="absolute -top-1 -right-1 text-amber-500 text-xs">✦</span>
            </div>

            {/* 4 Anime Study Friends Illustration */}
            <img
              src={aboutUsCollab}
              alt="Study group collaborating"
              className="w-full h-auto object-contain filter drop-shadow-md select-none pointer-events-none"
            />
          </div>
        </div>

        {/* Category Filter Pills (Aligned horizontally at bottom of banner) */}
        <div className="flex items-center gap-2.5 overflow-x-auto custom-scrollbar pt-2 relative z-10 flex-wrap">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.name;
            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => setActiveCategory(cat.name)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#543FE3] text-white shadow-xs'
                    : 'bg-white dark:bg-[#252833] text-[#33353F] dark:text-[#B5B7C2] border border-[#E5E1D8] dark:border-[#383B47] hover:bg-gray-50 dark:hover:bg-[#2C2F3D]'
                }`}
              >
                <span>{cat.name}</span>
                {cat.icon && (
                  <span className={cat.isSparkle ? 'text-amber-300 font-bold' : 'text-xs'}>
                    {cat.icon}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. MIDDLE ROW: FEATURED ROOM & CREATE YOUR OWN ROOM       */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* CARD 1: FEATURED ROOM (8 of 12 cols on LG) */}
        <div className="lg:col-span-8 bg-gradient-to-r from-[#FFF5ED] via-[#FDF7F4] to-[#F5EFFE] dark:from-[#26222C] dark:via-[#23202E] dark:to-[#1E1B2D] border border-[#FDE5D2] dark:border-[#383348] rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-5 relative overflow-hidden">
          {/* Top-Right Hand-drawn Loop Doodle */}
          <div className="absolute top-2 right-4 text-gray-400 dark:text-gray-600 pointer-events-none select-none">
            <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
              <path d="M4 12 C 12 4, 24 6, 26 14 C 28 22, 18 26, 12 22 C 8 18, 12 10, 20 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>

          {/* Left Illustration: Spiral Study Plan Notebook with Coffee Cup */}
          <div className="w-36 h-36 sm:w-44 sm:h-44 flex-shrink-0 relative flex items-center justify-center">
            <img
              src={studyPlanNotebook}
              alt="Study Plan Notebook and coffee"
              className="w-full h-full object-contain filter drop-shadow-sm select-none"
            />
            {/* Hand-drawn Sparkles */}
            <span className="absolute top-2 left-2 text-amber-500 text-xs">✦</span>
            <span className="absolute bottom-4 right-2 text-purple-500 text-xs">✧</span>
          </div>

          {/* Right Details & Join CTA */}
          <div className="flex-1 space-y-2.5 min-w-0">
            {/* Featured Room Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EAE5FC] dark:bg-[#342D59] text-[#543FE3] dark:text-[#B6A8FF]">
              <span>☆</span>
              <span>Featured Room</span>
            </div>

            {/* Room Title with 3 ticks */}
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-[#18191F] dark:text-[#F3F4F6] tracking-tight">
                Build a Study Plan Together
              </h3>
              {/* Radiating ticks */}
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" viewBox="0 0 16 16" fill="none">
                <line x1="2" y1="4" x2="8" y2="4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="2" y1="8" x2="12" y2="8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="2" y1="12" x2="8" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>

            <p className="text-xs sm:text-sm text-[#5D5F6B] dark:text-[#A0A2B0]">
              Plan, discuss and stay on track with your goals.
            </p>

            {/* Bottom Row: Avatars, Members & Join Button */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-3">
                {/* Overlapping User Avatars */}
                <div className="flex items-center -space-x-1.5">
                  <img src={ratneshAvatar} alt="user" className="w-6 h-6 rounded-full ring-2 ring-white dark:ring-[#1D1F26] object-cover" />
                  <div className="w-6 h-6 rounded-full bg-amber-200 ring-2 ring-white dark:ring-[#1D1F26] flex items-center justify-center text-[10px] font-bold text-amber-700">R</div>
                  <div className="w-6 h-6 rounded-full bg-blue-200 ring-2 ring-white dark:ring-[#1D1F26] flex items-center justify-center text-[10px] font-bold text-blue-700">S</div>
                  <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 ring-2 ring-white dark:ring-[#1D1F26] flex items-center justify-center text-[9px] font-bold text-gray-600 dark:text-gray-300">+8</div>
                </div>

                {/* Status Indicator */}
                <span className="inline-flex items-center gap-1.5 text-xs text-[#5D5F6B] dark:text-[#A0A2B0]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Live Now • 12 members</span>
                </span>
              </div>

              {/* Join Room CTA */}
              <button
                type="button"
                onClick={() => onOpenRoom('STUDY-PLAN')}
                className="bg-[#543FE3] hover:bg-[#4330C8] active:scale-95 text-white font-medium text-xs sm:text-sm px-5 py-2 rounded-full transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <span>Join Room</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>

        {/* CARD 2: CREATE YOUR OWN ROOM (4 of 12 cols on LG) */}
        <div className="lg:col-span-4 bg-[#F3EEFE] dark:bg-[#252238] border border-[#E7DDFD] dark:border-[#3A3358] rounded-3xl p-5 sm:p-6 shadow-xs flex items-center justify-between gap-4 relative overflow-hidden">
          {/* Left Text & CTA */}
          <div className="space-y-3 z-10">
            <h3 className="font-heading font-extrabold text-xl text-[#18191F] dark:text-white leading-tight">
              Create Your
              <br />
              Own Room
            </h3>

            <p className="text-xs text-[#6F7180] dark:text-[#B5B7C2] max-w-[180px] leading-relaxed">
              Start a new study room, invite your friends and learn together!
            </p>

            <button
              type="button"
              onClick={onOpenCreateRoom}
              className="bg-white dark:bg-[#322B4D] hover:bg-gray-50 dark:hover:bg-[#3D355C] active:scale-95 text-[#18191F] dark:text-[#F3F4F6] border border-[#DDD5F5] dark:border-[#4B3F70] text-xs font-semibold px-4 py-2 rounded-full transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <span>Create Room</span>
              <span>→</span>
            </button>
          </div>

          {/* Right Rocket Illustration with Clouds & Sparkles */}
          <div className="w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0 relative flex items-center justify-center">
            {/* Sparkles around rocket */}
            <span className="absolute top-2 left-2 text-purple-400 text-xs">✦</span>
            <span className="absolute bottom-2 right-1 text-amber-400 text-xs">✧</span>
            <img
              src={exploreRocket}
              alt="Rocket launching"
              className="w-full h-full object-contain filter drop-shadow-xs select-none group-hover:scale-105 transition-transform"
            />
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. TRENDING ROOMS SECTION                                 */}
      {/* ========================================================= */}
      <div className="space-y-3.5 pt-2">
        {/* Header with Crown Doodle */}
        <div className="flex items-center gap-2 relative">
          <span className="text-lg">🔥</span>
          <h2 className="font-heading font-extrabold text-lg sm:text-xl text-[#18191F] dark:text-[#F3F4F6] tracking-tight">
            Trending Rooms
          </h2>

          {/* Hand-drawn Crown Doodle 👑 */}
          <div className="text-amber-500 select-none ml-1">
            <svg className="w-5 h-5 -rotate-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 18 L5 8 L10 13 L14 6 L19 13 L21 8 L23 18 Z" />
            </svg>
          </div>
        </div>

        {/* 4 Cards Grid powered by unified RoomCard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {trendingRooms.map((room) => (
            <RoomCard
              key={room.id}
              variant="grid"
              title={room.title}
              subtitle={room.subtitle}
              thumbnail={room.thumbnail}
              status={room.statusType}
              members={room.members}
              avatarCount={room.avatarCount}
              onJoin={() => onOpenRoom?.(room.id)}
            />
          ))}
        </div>
      </div>

 
    </div>
  );
}
