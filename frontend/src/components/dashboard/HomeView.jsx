import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  aboutUsCollab,
  footerBooks,
  studySunset,
  ratneshAvatar,
  bulbIcon,
} from '../../assets';
import QuickActionCard from '../common/QuickActionCard';
import RoomCard from '../room/RoomCard';

/**
 * HomeView Component
 * Dedicated home view for the Dashboard with Welcome Hero, Quick Actions,
 * My Rooms preview, Recently Joined, and User Profile column.
 * Uses modular components (QuickActionCard, RoomCard) for high maintainability.
 */
export default function HomeView({
  onOpenJoin,
  onOpenCreate,
  onOpenMeet,
}) {
  const navigate = useNavigate();

  // Quick Action items configuration
  const quickActions = [
    {
      title: 'Join a Room',
      description: 'Enter a room code',
      bgClass: 'bg-[#F3EEFE] dark:bg-[#252238]',
      borderClass: 'border-[#E8DFFD] dark:border-[#3A3358]',
      iconBgClass: 'bg-white dark:bg-[#322B4D]',
      iconColorClass: 'text-[#6C52EE]',
      onClick: () => onOpenJoin?.(),
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="23 7 16 12 23 17 23 7" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
      ),
    },
    {
      title: 'Create Room',
      description: 'Start a new room',
      bgClass: 'bg-[#FFF8EA] dark:bg-[#2E281F]',
      borderClass: 'border-[#FBEECF] dark:border-[#4B3F2E]',
      iconBgClass: 'bg-white dark:bg-[#3D3528]',
      iconColorClass: 'text-amber-600',
      onClick: onOpenCreate,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      ),
    },
    {
      title: 'Open Meet',
      description: 'Start a video call',
      bgClass: 'bg-[#EDF8F2] dark:bg-[#1C2C24]',
      borderClass: 'border-[#D5EFE1] dark:border-[#2C4A3A]',
      iconBgClass: 'bg-white dark:bg-[#273E32]',
      iconColorClass: '',
      onClick: onOpenMeet,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="6" width="12" height="12" rx="2" fill="#00832d" />
          <polygon points="14,9 20,5 20,19 14,15" fill="#ea4335" />
          <rect x="3" y="6" width="4" height="4" fill="#ffba00" />
          <rect x="2" y="14" width="4" height="4" fill="#0066da" />
          <rect x="4" y="8" width="8" height="8" rx="1.5" fill="#ffffff" />
        </svg>
      ),
    },
    {
      title: 'Explore Rooms',
      description: 'Find public rooms',
      bgClass: 'bg-[#FFF1EC] dark:bg-[#322320]',
      borderClass: 'border-[#FDE0D5] dark:border-[#523732]',
      iconBgClass: 'bg-white dark:bg-[#432F2A]',
      iconColorClass: 'text-orange-600',
      onClick: () => navigate('/dashboard/explore'),
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </svg>
      ),
    },
  ];

  // Recently joined rooms data
  const recentlyJoinedRooms = [
    {
      title: 'DSA Discussion',
      time: '2 hours ago',
      code: 'DSA-DISCUSS',
      avatars: [
        { label: 'D', bg: 'bg-blue-100 text-blue-700' },
        { label: 'K', bg: 'bg-indigo-100 text-indigo-700' },
      ],
    },
    {
      title: 'Web Dev Help',
      time: '1 day ago',
      code: 'WEB-DEV-HELP',
      avatars: [
        { label: 'E', bg: 'bg-emerald-100 text-emerald-700' },
        { label: 'T', bg: 'bg-teal-100 text-teal-700' },
      ],
    },
    {
      title: 'Design Ideas',
      time: '2 days ago',
      code: 'DESIGN-IDEAS',
      avatars: [
        { label: 'P', bg: 'bg-pink-100 text-pink-700' },
        { label: 'R', bg: 'bg-rose-100 text-rose-700' },
      ],
    },
  ];

  return (
    <main className="flex-1 p-5 sm:p-6 lg:p-7 grid grid-cols-1 xl:grid-cols-12 gap-6 max-w-[1560px] mx-auto w-full">
      {/* ========================================================= */}
      {/* 1. CENTER / MAIN DASHBOARD AREA (8 Cols on XL)            */}
      {/* ========================================================= */}
      <div className="xl:col-span-8 flex flex-col gap-6">
        {/* HERO / WELCOME BANNER CARD */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#FFF5ED] via-[#F9F4FE] to-[#F1EAFF] dark:from-[#242129] dark:via-[#22212E] dark:to-[#1C1A2B] border border-[#EFE8DF] dark:border-[#353245] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          {/* Ambient Soft Glow Backdrop */}
          <div className="absolute top-0 right-1/4 w-72 h-72 rounded-full bg-gradient-to-br from-amber-200/30 to-purple-300/30 dark:from-purple-900/20 dark:to-indigo-900/20 blur-3xl pointer-events-none" />

          {/* Left Text & CTA */}
          <div className="flex-1 z-10 space-y-4">
            {/* Lightbulb Doodle */}
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#18191F] dark:text-[#F3F4F6] tracking-tight">
                Welcome back,
              </h1>
            </div>

            {/* "Ratnesh!" in Editorial Italic Serif with Purple Scribble Underline */}
            <div className="relative inline-block">
              <span className="font-editorial italic font-bold text-4xl sm:text-5xl text-[#18191F] dark:text-[#FFFFFF] tracking-tight">
                Ratnesh!
              </span>
              {/* Purple hand-drawn ink scribble underline */}
              <svg
                className="absolute -bottom-2 left-0 w-full h-3 text-[#6C52EE] overflow-visible"
                viewBox="0 0 160 14"
                fill="none"
              >
                <path
                  d="M 2 8 Q 40 2, 80 8 T 158 5"
                  stroke="currentColor"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <p className="text-sm sm:text-base text-[#5A5C66] dark:text-[#A6A8B4] max-w-sm pt-2 leading-relaxed">
              Let's make today more productive, learn something new together.
            </p>

            {/* Floating Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => onOpenJoin?.()}
                className="inline-flex items-center gap-2 bg-[#543FE3] hover:bg-[#4532CD] active:scale-95 text-white font-medium text-sm px-5 py-2.5 rounded-full shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
              >
                <span>Join a Room</span>
                <span>→</span>
              </button>
              <button
                type="button"
                onClick={onOpenCreate}
                className="inline-flex items-center gap-1.5 bg-white dark:bg-[#252833] hover:bg-gray-50 dark:hover:bg-[#2F3240] active:scale-95 text-[#252730] dark:text-[#EDEBF5] border border-[#E0DCD4] dark:border-[#3E4150] font-medium text-sm px-4 py-2.5 rounded-full transition-all cursor-pointer shadow-2xs"
              >
                <span>Create Room</span>
                <span className="text-base leading-none font-bold">+</span>
              </button>
            </div>
          </div>

          {/* Right Illustration: 4 friends studying + Doodle Quotes */}
          <div className="relative flex-shrink-0 z-10 w-full max-w-xs sm:max-w-sm md:max-w-[340px] flex justify-center">
            {/* Handwritten Doodle above the girl: "Learn. Collaborate. Grow." */}
            <div className="absolute -top-5 right-2 font-handwriting text-base font-bold text-[#3B3C46] dark:text-[#D4D6E2] leading-tight text-right select-none rotate-[4deg]">
              Learn.<br />Collaborate.<br />Grow.
              {/* Hand-drawn curved arrow doodle */}
              <svg className="w-6 h-6 text-[#3B3C46] dark:text-[#D4D6E2] inline-block ml-1 -mt-1" viewBox="0 0 24 24" fill="none">
                <path d="M4 18 Q 12 12, 18 4 M 14 4 L 18 4 L 18 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Lightbulb doodle image from assets floating above the boy */}
            <div className="absolute -top-7 left-5 select-none animate-bounce" style={{ animationDuration: '4s' }}>
              <img
                src={bulbIcon}
                alt="Idea bulb"
                className="w-10 h-10 object-contain drop-shadow-xs dark:invert-[0.9]"
              />
            </div>

            {/* 4 Anime Study Friends Illustration */}
            <img
              src={aboutUsCollab}
              alt="Study group collaborating"
              className="w-full h-auto object-contain filter drop-shadow-md select-none pointer-events-none"
            />
          </div>
        </div>

        {/* ===================================================== */}
        {/* QUICK ACTIONS SECTION (Powered by QuickActionCard)    */}
        {/* ===================================================== */}
        <div className="space-y-3.5">
          {/* Heading with 3 hand-drawn ray marks */}
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#1E1F24] dark:text-gray-300" viewBox="0 0 16 16" fill="none">
              <line x1="2" y1="3" x2="6" y2="7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="1" y1="8" x2="6" y2="8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="2" y1="13" x2="6" y2="9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
            <h2 className="font-heading font-extrabold text-lg text-[#18191F] dark:text-[#F3F4F6] tracking-tight">
              Quick Actions
            </h2>
          </div>

          {/* Reusable QuickActionCard Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {quickActions.map((action) => (
              <QuickActionCard
                key={action.title}
                title={action.title}
                description={action.description}
                icon={action.icon}
                onClick={action.onClick}
                bgClass={action.bgClass}
                borderClass={action.borderClass}
                iconBgClass={action.iconBgClass}
                iconColorClass={action.iconColorClass}
              />
            ))}
          </div>
        </div>

        {/* ===================================================== */}
        {/* BOTTOM SECTION: MY ROOMS & RECENTLY JOINED SPLIT       */}
        {/* ===================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* ----------------- MY ROOMS ----------------- */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="relative inline-block">
                <h3 className="font-heading font-extrabold text-base text-[#18191F] dark:text-[#F3F4F6]">
                  My Rooms
                </h3>
                {/* Hand-drawn scribble underline */}
                <svg className="absolute -bottom-1 left-0 w-full h-2 text-[#3A3B45] dark:text-gray-400" viewBox="0 0 80 8" fill="none">
                  <path d="M 2 4 Q 25 1, 45 5 T 78 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <button
                type="button"
                onClick={() => navigate('/dashboard/my-rooms')}
                className="text-xs font-semibold text-[#543FE3] dark:text-[#A798FF] hover:underline flex items-center gap-1 cursor-pointer"
              >
                View all →
              </button>
            </div>

            {/* Reusable RoomCard (Horizontal Variant) */}
            <RoomCard
              variant="horizontal"
              title="Study Buddies"
              subtitle="Let's prepare for exams together! 📚"
              thumbnail={studySunset}
              status="live"
              members="6 members"
              onJoin={() => onOpenJoin?.('STUDY-BUDDIES')}
              buttonText="Join Room →"
            />
          </div>

          {/* ----------------- RECENTLY JOINED ----------------- */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="relative inline-block">
                <h3 className="font-heading font-extrabold text-base text-[#18191F] dark:text-[#F3F4F6]">
                  Recently Joined
                </h3>
                {/* Hand-drawn scribble underline */}
                <svg className="absolute -bottom-1 left-0 w-full h-2 text-[#3A3B45] dark:text-gray-400" viewBox="0 0 100 8" fill="none">
                  <path d="M 2 4 Q 30 1, 60 5 T 98 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <button
                type="button"
                onClick={() => navigate('/dashboard/my-rooms')}
                className="text-xs font-semibold text-[#543FE3] dark:text-[#A798FF] hover:underline flex items-center gap-1 cursor-pointer"
              >
                View all →
              </button>
            </div>

            {/* List of Recently Joined Rooms (Compact RoomCard Variant) */}
            <div className="space-y-2">
              {recentlyJoinedRooms.map((room) => (
                <RoomCard
                  key={room.title}
                  variant="compact"
                  title={room.title}
                  time={room.time}
                  avatars={room.avatars}
                  onJoin={() => onOpenJoin?.(room.code)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. RIGHT SIDEBAR / PROFILE COLUMN (4 Cols on XL)         */}
      {/* ========================================================= */}
      <div className="xl:col-span-4 flex flex-col gap-5">
        {/* TOP PROFILE CARD */}
        <div className="bg-white dark:bg-[#1C1E25] border border-[#EAE5DE] dark:border-[#2D303A] rounded-3xl p-6 text-center relative shadow-xs">
          {/* Pencil Edit Icon in Top Right */}
          <button
            type="button"
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
            title="Edit Profile"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </button>

          {/* Avatar with Purple Border and Online Status Dot */}
          <div className="relative inline-block mx-auto mt-2 mb-3">
            <div className="w-24 h-24 rounded-full ring-4 ring-[#E9E4FC] dark:ring-[#372E5A] overflow-hidden p-0.5 bg-white dark:bg-[#1C1E25]">
              <img
                src={ratneshAvatar}
                alt="Ratnesh Chaturvedi"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            {/* Green Online Dot at bottom right */}
            <span className="absolute bottom-1 right-2 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-[#1C1E25]" />
          </div>

          {/* User Details */}
          <h3 className="font-heading font-extrabold text-lg text-[#18191F] dark:text-[#F3F4F6] tracking-tight">
            Ratnesh Chaturvedi
          </h3>
          <p className="text-xs text-[#717382] dark:text-[#9A9CA8] mt-0.5">
            Learner • Dreamer • Builder
          </p>

          {/* Quote Badge with Little Sparks Doodle */}
          <div className="relative inline-block mt-3 mb-5">
            <span className="bg-[#F3EFFE] dark:bg-[#2A2445] text-[#543FE3] dark:text-[#C5BAFF] px-4 py-1.5 rounded-full text-xs font-semibold font-editorial italic tracking-wide inline-flex items-center">
              “Better together.”
            </span>
            {/* Sparks Doodle on the right */}
            <svg className="w-3.5 h-3.5 text-[#543FE3] dark:text-[#C5BAFF] absolute -top-1 -right-3" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0L9.5 5.5L15 8L9.5 10.5L8 16L6.5 10.5L1 8L6.5 5.5L8 0Z" />
            </svg>
          </div>

          {/* 3 Stats in Grid */}
          <div className="grid grid-cols-3 divide-x divide-[#EFEBE4] dark:divide-[#2E313D] pt-3 border-t border-[#EFEBE4] dark:border-[#2E313D]">
            <div className="px-1 text-center">
              <div className="flex justify-center text-gray-500 dark:text-gray-400 mb-1">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                </svg>
              </div>
              <div className="font-heading font-extrabold text-base text-[#18191F] dark:text-[#F3F4F6]">
                12
              </div>
              <div className="text-[11px] text-[#717382] dark:text-[#9A9CA8]">
                Rooms
              </div>
            </div>

            <div className="px-1 text-center">
              <div className="flex justify-center text-gray-500 dark:text-gray-400 mb-1">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className="font-heading font-extrabold text-base text-[#18191F] dark:text-[#F3F4F6]">
                120+
              </div>
              <div className="text-[11px] text-[#717382] dark:text-[#9A9CA8]">
                Members
              </div>
            </div>

            <div className="px-1 text-center">
              <div className="flex justify-center text-amber-500 mb-1">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <div className="font-heading font-extrabold text-base text-[#18191F] dark:text-[#F3F4F6]">
                3.9
              </div>
              <div className="text-[11px] text-[#717382] dark:text-[#9A9CA8]">
                Rating
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE CARD: YOUR LEARNING JOURNEY */}
        <div className="bg-white dark:bg-[#1C1E25] border border-[#EAE5DE] dark:border-[#2D303A] rounded-2xl p-5 shadow-xs space-y-3">
          <h4 className="font-heading font-bold text-sm text-[#18191F] dark:text-[#F3F4F6]">
            Your Learning Journey
          </h4>

          {/* Smooth Wavy Line Curve Graph */}
          <div className="h-16 w-full relative">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 240 60" fill="none" preserveAspectRatio="none">
              <defs>
                <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6C52EE" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#6C52EE" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Area under wave */}
              <path
                d="M 0 50 Q 40 38, 80 44 T 160 30 T 235 15 L 235 60 L 0 60 Z"
                fill="url(#purpleGrad)"
              />
              {/* Smooth curve stroke */}
              <path
                d="M 0 50 Q 40 38, 80 44 T 160 30 T 235 15"
                stroke="#6C52EE"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
              {/* Glowing endpoint dot */}
              <circle cx="235" cy="15" r="4.5" fill="#6C52EE" />
              <circle cx="235" cy="15" r="7" stroke="#6C52EE" strokeWidth="1.5" strokeOpacity="0.4" fill="none" />
            </svg>
          </div>

          <p className="text-xs text-[#717382] dark:text-[#9A9CA8] text-center">
            Keep going! You're on a great path.
          </p>
        </div>

        {/* BOTTOM CARD: EXPLORE MORE ROOMS */}
        <div
          onClick={() => navigate('/dashboard/explore')}
          className="group bg-[#FFF5ED] dark:bg-[#2C211D] border border-[#FEE6D6] dark:border-[#4B342C] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:shadow-md transition-all relative overflow-hidden"
        >
          {/* Book stack illustration */}
          <div className="w-16 h-16 relative flex-shrink-0">
            <img
              src={footerBooks}
              alt="Stack of books"
              className="w-full h-full object-contain filter drop-shadow-2xs group-hover:scale-105 transition-transform"
            />
          </div>

          {/* Handwritten Callout */}
          <div className="text-right">
            <div className="font-handwriting font-bold text-xl sm:text-2xl text-[#18191F] dark:text-[#F3F4F6] leading-tight">
              Explore<br />More Rooms →
            </div>
          </div>

          {/* Hand-drawn Sparkle Doodle */}
          <svg className="w-4 h-4 text-amber-500 absolute top-2.5 right-2" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0L9.5 5.5L15 8L9.5 10.5L8 16L6.5 10.5L1 8L6.5 5.5L8 0Z" />
          </svg>
        </div>
      </div>
    </main>
  );
}
