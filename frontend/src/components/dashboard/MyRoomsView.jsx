import React, { useState, useEffect } from 'react';
import {
  studySunset,
  studyPlanNotebook,
  roomWebdev,
  roomDsa,
  ratneshAvatar,
  burstLines,
} from '../../assets';

export default function MyRoomsView({ onOpenRoom, onOpenCreateRoom }) {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [historyFilter, setHistoryFilter] = useState('All');
  const [pendingInviteDismissed, setPendingInviteDismissed] = useState(false);
  const [acceptedInvite, setAcceptedInvite] = useState(false);

  // Close history drawer on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isHistoryDrawerOpen) {
        setIsHistoryDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isHistoryDrawerOpen]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isHistoryDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isHistoryDrawerOpen]);

  // Filter tabs matching the screenshot
  const filterTabs = [
    { name: 'All', label: 'All Rooms (8)', count: 8 },
    { name: 'Joined', label: 'Joined (5)', count: 5 },
    { name: 'Hosted', label: 'Hosted by Me (3)', count: 3 },
    { name: 'Archived', label: 'Archived (8)', count: 8 },
  ];

  // Room sessions history data with start-to-end times and calculated durations
  const roomHistoryData = [
    {
      id: 'hist-1',
      title: 'Algorithms Room',
      code: 'LR-8921',
      role: 'Joined',
      topic: 'Dynamic Programming & Graphs',
      date: 'Today, Oct 24',
      startTime: '10:00 AM',
      endTime: '11:45 AM',
      duration: '1h 45m',
      durationMinutes: 105,
      host: 'Rohan K.',
      participants: 6,
      avatarColors: ['bg-indigo-400', 'bg-emerald-400', 'bg-amber-400'],
      status: 'Completed',
    },
    {
      id: 'hist-2',
      title: 'Study Buddies',
      code: 'LR-4102',
      role: 'Hosted',
      topic: 'Raft consensus & distributed state',
      date: 'Today, Oct 24',
      startTime: '08:30 AM',
      endTime: '10:00 AM',
      duration: '1h 30m',
      durationMinutes: 90,
      host: 'Ratnesh (You)',
      participants: 6,
      avatarColors: ['bg-purple-400', 'bg-rose-400', 'bg-sky-400'],
      status: 'Live Now',
    },
    {
      id: 'hist-3',
      title: 'Web Dev Collaborative',
      code: 'LR-3294',
      role: 'Hosted',
      topic: 'React 19 Server Actions & Tailwind V4',
      date: 'Yesterday, Oct 23',
      startTime: '04:00 PM',
      endTime: '06:15 PM',
      duration: '2h 15m',
      durationMinutes: 135,
      host: 'Ratnesh (You)',
      participants: 8,
      avatarColors: ['bg-amber-400', 'bg-emerald-400', 'bg-violet-400'],
      status: 'Completed',
    },
    {
      id: 'hist-4',
      title: 'System Design Prep',
      code: 'LR-7719',
      role: 'Joined',
      topic: 'Scalable Message Queues & Kafka',
      date: 'Yesterday, Oct 23',
      startTime: '02:00 PM',
      endTime: '03:30 PM',
      duration: '1h 30m',
      durationMinutes: 90,
      host: 'Aarav Mehta',
      participants: 5,
      avatarColors: ['bg-pink-400', 'bg-teal-400', 'bg-indigo-400'],
      status: 'Completed',
    },
    {
      id: 'hist-5',
      title: 'Design Theory Circle',
      code: 'LR-1082',
      role: 'Joined',
      topic: 'Heuristic evaluation & micro-interactions',
      date: 'Oct 22, 2026',
      startTime: '04:00 PM',
      endTime: '05:40 PM',
      duration: '1h 40m',
      durationMinutes: 100,
      host: 'Priya Sharma',
      participants: 4,
      avatarColors: ['bg-rose-400', 'bg-indigo-400', 'bg-emerald-400'],
      status: 'Completed',
    },
    {
      id: 'hist-6',
      title: 'DSA Study Table',
      code: 'LR-5632',
      role: 'Hosted',
      topic: 'Binary Trees & Segment Trees',
      date: 'Oct 21, 2026',
      startTime: '09:00 PM',
      endTime: '11:15 PM',
      duration: '2h 15m',
      durationMinutes: 135,
      host: 'Ratnesh (You)',
      participants: 7,
      avatarColors: ['bg-cyan-400', 'bg-amber-400', 'bg-violet-400'],
      status: 'Completed',
    },
    {
      id: 'hist-7',
      title: 'Literature Society',
      code: 'LR-2291',
      role: 'Joined',
      topic: 'Japanese Post-Modern Literature Discussion',
      date: 'Oct 20, 2026',
      startTime: '07:00 PM',
      endTime: '08:45 PM',
      duration: '1h 45m',
      durationMinutes: 105,
      host: 'Ananya Verma',
      participants: 12,
      avatarColors: ['bg-emerald-400', 'bg-sky-400', 'bg-rose-400'],
      status: 'Completed',
    },
    {
      id: 'hist-8',
      title: 'Late Night Focus Pod',
      code: 'LR-9011',
      role: 'Joined',
      topic: 'Deep silent study & Pomodoro 50/10',
      date: 'Oct 19, 2026',
      startTime: '11:00 PM',
      endTime: '01:30 AM',
      duration: '2h 30m',
      durationMinutes: 150,
      host: 'Dev Sharma',
      participants: 9,
      avatarColors: ['bg-purple-400', 'bg-indigo-400', 'bg-teal-400'],
      status: 'Completed',
    },
  ];

  const filteredHistory = roomHistoryData.filter((item) => {
    if (historyFilter === 'All') return true;
    if (historyFilter === 'Hosted') return item.role === 'Hosted';
    if (historyFilter === 'Joined') return item.role === 'Joined';
    return true;
  });

  return (
    <div className="w-full max-w-[1560px] mx-auto space-y-6 animate-fade-in relative">
      {/* ========================================================= */}
      {/* TOP HEADER SECTION (Exact match to screenshot)            */}
      {/* ========================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2 sm:pt-3">
        <div className="flex flex-wrap items-baseline gap-x-3.5 gap-y-1">
          {/* 3 Radiating burst doodle on top-left corner of "My Rooms" */}
          <div className="relative inline-block">
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
            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#18191F] dark:text-[#F3F4F6] tracking-tight">
              My Rooms
            </h1>
          </div>

          {/* Line 2: "All your shared spaces in one place" (Editorial Italic Serif + Squiggle) */}
          <div className="relative inline-block">
            <h2 className="font-editorial italic font-medium text-2xl sm:text-3xl lg:text-[34px] text-[#18191F] dark:text-[#FFFFFF] tracking-tight">
              All your shared spaces in one place
            </h2>
            {/* Purple hand-drawn ink squiggle underline */}
            <svg
              className="absolute -bottom-2 left-0 w-full h-3 text-[#543FE3] overflow-visible"
              viewBox="0 0 340 12"
              fill="none"
            >
              <path
                d="M 2 7 Q 60 1, 130 7 T 260 6 T 338 6"
                stroke="currentColor"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Subtitle description with sparkle stars */}
          <div className="flex items-center gap-2 mt-3 text-sm sm:text-base text-[#5A5C66] dark:text-[#A6A8B4]">
            <span>Jump back into your persistent study tables or create a new one to invite friends.</span>
            <span className="text-[#543FE3] dark:text-[#A798FF] text-xs select-none">✦ ✧</span>
          </div>
        </div>

        {/* Action Buttons: "Join a Room" & "Create Room +" */}
        <div className="flex items-center gap-3 self-start lg:self-center">
          <button
            type="button"
            onClick={() => onOpenRoom?.()}
            className="inline-flex items-center justify-center bg-white dark:bg-[#252833] hover:bg-gray-50 dark:hover:bg-[#2D303D] active:scale-95 text-[#18191F] dark:text-gray-100 border border-[#D5CFCA] dark:border-[#3E4150] font-medium text-sm px-5 py-2.5 rounded-full transition-all cursor-pointer shadow-2xs"
          >
            Join a Room
          </button>
          <button
            type="button"
            onClick={() => onOpenCreateRoom?.()}
            className="inline-flex items-center justify-center bg-[#543FE3] hover:bg-[#4632D0] active:scale-95 text-white font-medium text-sm px-6 py-2.5 rounded-full shadow-md shadow-indigo-500/25 transition-all cursor-pointer"
          >
            Create Room +
          </button>
        </div>
      </div>

      {/* Filter Tabs Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
        {filterTabs.map((tab) => {
          const isActive = selectedFilter === tab.name;
          return (
            <button
              key={tab.name}
              type="button"
              onClick={() => setSelectedFilter(tab.name)}
              className={`px-4 py-2 rounded-full font-medium text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#543FE3] text-white shadow-xs'
                  : 'bg-[#F2ECE3]/80 hover:bg-[#EAE2D7] dark:bg-[#272935] text-[#4E505B] dark:text-[#C1C3CE]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* MAIN TWO-COLUMN CONTENT GRID                              */}
      {/* Left 8 Cols (4 Rooms) | Right 4 Cols (Fast Access)        */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 relative">
        {/* Handwritten "Back to Work! ✦" with curved arrow pointing to right panel */}
        <div className="hidden xl:block absolute -top-12 right-72 pointer-events-none select-none z-10">
          <div className="font-handwriting font-bold text-base text-[#18191F] dark:text-gray-200 rotate-[-4deg] flex items-center gap-1">
            <span>Back to Work!</span>
            <span className="text-xs">✦</span>
          </div>
          <svg className="w-10 h-10 text-[#18191F] dark:text-gray-200 ml-4 -mt-1" viewBox="0 0 36 36" fill="none">
            <path d="M 6 8 Q 24 10, 26 28 M 20 24 L 26 29 L 30 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* --------------------------------------------------------- */}
        {/* LEFT COLUMN: 4 ROOM CARDS IN 2X2 GRID                     */}
        {/* --------------------------------------------------------- */}
        <div className="xl:col-span-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* ----------------------------------------------------- */}
            {/* CARD 1: Study Buddies (with Whiteboard preview)       */}
            {/* ----------------------------------------------------- */}
            <div className="bg-white dark:bg-[#1E202B] border border-[#E9E4DB] dark:border-[#2F3140] rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
              <div className="flex gap-3.5">
                {/* Sakura Sunset Thumbnail with • Live Badge */}
                <div className="relative w-36 sm:w-40 h-28 sm:h-32 rounded-xl overflow-hidden shrink-0 shadow-2xs">
                  <img
                    src={studySunset}
                    alt="Study Buddies"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 bg-[#181920]/80 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1.5 border border-white/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Live</span>
                  </div>
                </div>

                {/* Right content of Card 1 */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <h3 className="font-heading font-extrabold text-base text-[#18191F] dark:text-gray-100 truncate">
                      Study Buddies
                    </h3>
                    <div className="flex items-center gap-1 text-[11px] text-[#696B78] dark:text-gray-400 shrink-0">
                      <span>👥</span>
                      <span>6 members</span>
                    </div>
                  </div>

                  {/* Whiteboard Sketch Container */}
                  <div className="my-2 bg-[#F6F8FB] dark:bg-[#262836] border border-[#E3E7EE] dark:border-[#383A4A] rounded-lg p-2 text-[10px]">
                    <div className="flex items-center justify-between text-[#505260] dark:text-gray-300 font-semibold mb-1 border-b border-[#E3E7EE] dark:border-[#383A4A] pb-0.5">
                      <span className="truncate">Raft election state</span>
                      <div className="flex items-center gap-0.5 text-gray-400 text-[9px] shrink-0">
                        <span>○</span>
                        <span>-</span>
                        <span>○</span>
                        <span>○</span>
                      </div>
                    </div>
                    {/* Sketch wireframe diagram */}
                    <svg className="w-full h-7 text-[#7A7F92] dark:text-gray-400" viewBox="0 0 160 30" fill="none">
                      <rect x="4" y="5" width="30" height="20" rx="3" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 2" fill="none" />
                      <line x1="34" y1="15" x2="60" y2="15" stroke="currentColor" strokeWidth="1.2" />
                      <polygon points="60,12 65,15 60,18" fill="currentColor" />
                      <rect x="66" y="5" width="40" height="20" rx="3" stroke="currentColor" strokeWidth="1.2" fill="none" />
                      <line x1="106" y1="15" x2="128" y2="15" stroke="currentColor" strokeWidth="1.2" />
                      <polygon points="128,12 133,15 128,18" fill="currentColor" />
                      <circle cx="145" cy="15" r="8" stroke="currentColor" strokeWidth="1.2" fill="none" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Card 1 Bottom Row */}
              <div className="flex items-center justify-between pt-3 border-t border-[#F2EDE5] dark:border-[#2D2F3C] mt-2">
                {/* 3 Avatars + +2 */}
                <div className="flex items-center -space-x-2">
                  <img
                    src={ratneshAvatar}
                    alt="Ratnesh"
                    className="w-7 h-7 rounded-full ring-2 ring-white dark:ring-[#1E202B] object-cover"
                  />
                  <div className="w-7 h-7 rounded-full bg-[#E5D7FC] text-[#543FE3] font-bold text-[10px] flex items-center justify-center ring-2 ring-white dark:ring-[#1E202B]">
                    RK
                  </div>
                  <div className="w-7 h-7 rounded-full bg-[#FFE6D4] text-[#D46B28] font-bold text-[10px] flex items-center justify-center ring-2 ring-white dark:ring-[#1E202B]">
                    AS
                  </div>
                  <div className="w-7 h-7 rounded-full bg-[#F0EDE6] dark:bg-[#343746] text-[#636573] dark:text-gray-300 font-bold text-[10px] flex items-center justify-center ring-2 ring-white dark:ring-[#1E202B]">
                    +2
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenRoom?.('LR-4102')}
                  className="inline-flex items-center gap-1.5 bg-[#543FE3] hover:bg-[#4632D0] active:scale-95 text-white font-medium text-xs sm:text-sm px-4 py-1.5 rounded-full transition-all cursor-pointer shadow-2xs"
                >
                  <span>Enter Room</span>
                  <span>→</span>
                </button>
              </div>
            </div>

            {/* ----------------------------------------------------- */}
            {/* CARD 2: System Design Prep (Notebook background)      */}
            {/* ----------------------------------------------------- */}
            <div className="bg-white dark:bg-[#1E202B] border border-[#E9E4DB] dark:border-[#2F3140] rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                {/* Desk Notebook Banner with overlaid labels */}
                <div className="relative w-full h-28 sm:h-32 rounded-xl overflow-hidden shadow-2xs">
                  <img
                    src={studyPlanNotebook}
                    alt="System Design Prep"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Overlay pill on top-left: System Design Prep */}
                  <div className="absolute top-2.5 left-2.5 bg-[#181920]/85 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-lg border border-white/10 shadow-xs">
                    System Design Prep
                  </div>
                  {/* Overlay pill on top-right: Last active 2h ago */}
                  <div className="absolute top-2.5 right-2.5 bg-white/90 dark:bg-[#20222D]/90 backdrop-blur-xs text-[#444652] dark:text-gray-200 text-[10px] font-semibold px-2.5 py-1 rounded-full border border-gray-200/80 dark:border-gray-700/60 shadow-2xs">
                    Last active 2h ago
                  </div>
                </div>
              </div>

              {/* Card 2 Bottom Row */}
              <div className="flex items-center justify-between pt-3 border-t border-[#F2EDE5] dark:border-[#2D2F3C] mt-3">
                <div className="flex items-center gap-2">
                  {/* 3 Avatars */}
                  <div className="flex items-center -space-x-2">
                    <img
                      src={ratneshAvatar}
                      alt="Ratnesh"
                      className="w-7 h-7 rounded-full ring-2 ring-white dark:ring-[#1E202B] object-cover"
                    />
                    <div className="w-7 h-7 rounded-full bg-[#E5D7FC] text-[#543FE3] font-bold text-[10px] flex items-center justify-center ring-2 ring-white dark:ring-[#1E202B]">
                      AM
                    </div>
                    <div className="w-7 h-7 rounded-full bg-[#D6F5E3] text-[#1E7E45] font-bold text-[10px] flex items-center justify-center ring-2 ring-white dark:ring-[#1E202B]">
                      PS
                    </div>
                  </div>

                  {/* 3 Purple action icon circles: Chat, Video, Screen */}
                  <div className="flex items-center gap-1 ml-1 text-[#6C52EE] dark:text-[#A798FF]">
                    <div className="w-6 h-6 rounded-full bg-[#F3EEFE] dark:bg-[#322A4D] flex items-center justify-center text-[11px]" title="Live Chat">
                      💬
                    </div>
                    <div className="w-6 h-6 rounded-full bg-[#F3EEFE] dark:bg-[#322A4D] flex items-center justify-center text-[11px]" title="Video On">
                      📹
                    </div>
                    <div className="w-6 h-6 rounded-full bg-[#F3EEFE] dark:bg-[#322A4D] flex items-center justify-center text-[11px]" title="Screen Shared">
                      🖥️
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenRoom?.('LR-7719')}
                  className="bg-white dark:bg-[#252833] hover:bg-gray-50 dark:hover:bg-[#2D303D] active:scale-95 text-[#18191F] dark:text-gray-100 border border-[#D5CFCA] dark:border-[#3E4150] font-medium text-xs sm:text-sm px-4 py-1.5 rounded-full transition-all cursor-pointer shadow-2xs"
                >
                  Enter Room
                </button>
              </div>
            </div>

            {/* ----------------------------------------------------- */}
            {/* CARD 3: Web Dev Collaborative (Dark Card)             */}
            {/* ----------------------------------------------------- */}
            <div className="bg-[#181920] dark:bg-[#14151C] text-white border border-[#2D2E38] rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
              <div className="flex gap-3.5">
                {/* Monitor Screen Thumbnail with • Live Badge */}
                <div className="relative w-36 sm:w-40 h-28 sm:h-32 rounded-xl overflow-hidden shrink-0 shadow-2xs bg-[#0F1015]">
                  <img
                    src={roomWebdev}
                    alt="Web Dev Collaborative"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 bg-[#181920]/85 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1.5 border border-white/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Live</span>
                  </div>
                </div>

                {/* Right content of Card 3 */}
                <div className="flex-1 flex flex-col justify-center min-w-0 space-y-1.5">
                  <h3 className="font-heading font-extrabold text-base text-white truncate">
                    Web Dev Collaborative
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>3 active</span>
                  </div>
                  <div className="text-xs text-gray-400 truncate">
                    Web development basics
                  </div>
                </div>
              </div>

              {/* Card 3 Bottom Row */}
              <div className="flex items-center justify-between pt-3 border-t border-[#292A36] mt-2">
                {/* 3 Avatars */}
                <div className="flex items-center -space-x-2">
                  <img
                    src={ratneshAvatar}
                    alt="Ratnesh"
                    className="w-7 h-7 rounded-full ring-2 ring-[#181920] object-cover"
                  />
                  <div className="w-7 h-7 rounded-full bg-[#E5D7FC] text-[#543FE3] font-bold text-[10px] flex items-center justify-center ring-2 ring-[#181920]">
                    DV
                  </div>
                  <div className="w-7 h-7 rounded-full bg-[#FFE6D4] text-[#D46B28] font-bold text-[10px] flex items-center justify-center ring-2 ring-[#181920]">
                    TA
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenRoom?.('LR-3294')}
                  className="inline-flex items-center gap-1.5 bg-[#543FE3] hover:bg-[#4632D0] active:scale-95 text-white font-medium text-xs sm:text-sm px-4 py-1.5 rounded-full transition-all cursor-pointer shadow-2xs"
                >
                  <span>Enter Room</span>
                  <span>→</span>
                </button>
              </div>
            </div>

            {/* ----------------------------------------------------- */}
            {/* CARD 4: Design Theory Circle (Timeline preview)       */}
            {/* ----------------------------------------------------- */}
            <div className="bg-white dark:bg-[#1E202B] border border-[#E9E4DB] dark:border-[#2F3140] rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                {/* Timeline UI Diagram Container with ⏱ Scheduled Badge */}
                <div className="relative w-full h-24 sm:h-28 rounded-xl bg-[#F6F8FB] dark:bg-[#252838] border border-[#E3E7EE] dark:border-[#383A4A] p-2.5 overflow-hidden flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div className="bg-[#FFF4E5] dark:bg-[#3E2D1E] text-[#B86B14] dark:text-[#F3A44C] text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border border-[#FBE5C6] dark:border-[#573F28]">
                      <span>⏱</span>
                      <span>Scheduled</span>
                    </div>

                    {/* Window header wireframe icons */}
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-2.5 border border-gray-300 dark:border-gray-600 rounded-xs" />
                      <div className="w-3 h-2.5 border border-gray-300 dark:border-gray-600 rounded-xs" />
                    </div>
                  </div>

                  {/* Wireframe Timeline connecting line */}
                  <div className="relative my-auto">
                    <div className="w-full h-0.5 bg-[#6C52EE]/40" />
                    <div className="absolute -top-1 left-4 w-2.5 h-2.5 rounded-full bg-[#6C52EE] ring-2 ring-white dark:ring-[#252838]" />
                    <div className="absolute -top-1 left-1/2 w-2.5 h-2.5 rounded-full bg-[#6C52EE] ring-2 ring-white dark:ring-[#252838]" />
                    <div className="absolute -top-1 right-6 w-2.5 h-2.5 rounded-full bg-gray-400 ring-2 ring-white dark:ring-[#252838]" />
                  </div>

                  {/* Bottom wireframe boxes */}
                  <div className="flex items-center justify-between text-[9px] text-gray-400">
                    <div className="w-8 h-2.5 border border-gray-300 dark:border-gray-600 rounded-xs" />
                    <div className="w-12 h-2.5 border border-gray-300 dark:border-gray-600 rounded-xs" />
                  </div>
                </div>

                {/* Card 4 Header info */}
                <div className="mt-2.5 flex items-start justify-between gap-1">
                  <div>
                    <h3 className="font-heading font-extrabold text-base text-[#18191F] dark:text-gray-100">
                      Design Theory Circle
                    </h3>
                    <div className="text-xs text-[#555764] dark:text-gray-300 mt-0.5">
                      Scheduled for Today, 4 PM
                    </div>
                  </div>

                  {/* Avatars + count */}
                  <div className="flex items-center -space-x-1.5 shrink-0">
                    <img
                      src={ratneshAvatar}
                      alt="Ratnesh"
                      className="w-6 h-6 rounded-full ring-2 ring-white dark:ring-[#1E202B] object-cover"
                    />
                    <div className="w-6 h-6 rounded-full bg-[#E5D7FC] text-[#543FE3] font-bold text-[9px] flex items-center justify-center ring-2 ring-white dark:ring-[#1E202B]">
                      PS
                    </div>
                    <div className="w-6 h-6 rounded-full bg-[#F0EDE6] dark:bg-[#343746] text-[#636573] dark:text-gray-300 font-bold text-[9px] flex items-center justify-center ring-2 ring-white dark:ring-[#1E202B]">
                      +4
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 4 Bottom Row */}
              <div className="flex items-center justify-between pt-3 border-t border-[#F2EDE5] dark:border-[#2D2F3C] mt-2">
                <div className="text-xs text-[#6B6E7C] dark:text-gray-400">
                  <div>Scheduled for Today, 4 PM</div>
                  <div className="font-medium text-[#18191F] dark:text-gray-200">4 members</div>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenRoom?.('LR-1082')}
                  className="bg-white dark:bg-[#252833] hover:bg-gray-50 dark:hover:bg-[#2D303D] active:scale-95 text-[#18191F] dark:text-gray-100 border border-[#D5CFCA] dark:border-[#3E4150] font-medium text-xs sm:text-sm px-4 py-1.5 rounded-full transition-all cursor-pointer shadow-2xs flex items-center gap-1"
                >
                  <span>Enter Room</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* --------------------------------------------------------- */}
        {/* RIGHT COLUMN: FAST ACCESS & INVITATIONS                   */}
        {/* --------------------------------------------------------- */}
        <div className="xl:col-span-4">
          <div className="bg-white dark:bg-[#1E202B] border border-[#E9E4DB] dark:border-[#2F3140] rounded-2xl p-5 shadow-2xs space-y-5">
            <h3 className="font-heading font-extrabold text-base text-[#18191F] dark:text-[#F3F4F6]">
              Fast Access & Invitations
            </h3>

            {/* Quick Room Invites Section */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-[#18191F] dark:text-gray-300">
                Quick Room Invites
              </div>

              {!pendingInviteDismissed ? (
                <div className="bg-[#FFF8F0] dark:bg-[#2A241F] border border-[#FBEAD6] dark:border-[#463728] rounded-xl p-3 relative">
                  {/* Dismiss Close button */}
                  <button
                    type="button"
                    onClick={() => setPendingInviteDismissed(true)}
                    className="absolute top-2.5 right-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm w-5 h-5 flex items-center justify-center rounded-full hover:bg-black/5 cursor-pointer"
                    title="Dismiss"
                  >
                    ✕
                  </button>

                  {/* Pending Badge */}
                  <div className="inline-block bg-[#FDEBD2] dark:bg-[#4E381C] text-[#B86B14] dark:text-[#F7B05B] font-semibold text-[10px] px-2 py-0.5 rounded-md">
                    Pending
                  </div>

                  {/* Invite Room Title */}
                  <div className="font-bold text-sm text-[#18191F] dark:text-gray-100 mt-1">
                    Algorithms Room
                  </div>

                  {/* Host info */}
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[#5E606D] dark:text-gray-300">
                    <img
                      src={ratneshAvatar}
                      alt="Rohan K."
                      className="w-4 h-4 rounded-full object-cover"
                    />
                    <span>Rohan K.</span>
                  </div>

                  {/* Accept / Decline Action buttons */}
                  {acceptedInvite ? (
                    <div className="mt-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <span>✓ Invitation accepted!</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        type="button"
                        onClick={() => setAcceptedInvite(true)}
                        className="bg-white dark:bg-[#342D26] hover:bg-gray-50 dark:hover:bg-[#3D352D] active:scale-95 border border-[#E8DCCB] dark:border-[#524434] text-[#18191F] dark:text-gray-200 text-xs font-medium px-4 py-1.5 rounded-full transition-all cursor-pointer shadow-2xs"
                      >
                        Accepts
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingInviteDismissed(true)}
                        className="bg-white dark:bg-[#342D26] hover:bg-red-50 dark:hover:bg-red-950/20 active:scale-95 border border-[#F5D5D5] dark:border-[#5A3333] text-[#D9383A] dark:text-[#F27072] text-xs font-medium px-4 py-1.5 rounded-full transition-all cursor-pointer shadow-2xs"
                      >
                        Declines
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-gray-400 italic py-2 text-center bg-gray-50 dark:bg-[#252836] rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                  No pending invites right now
                </div>
              )}
            </div>

            {/* Pinned Rooms Section */}
            <div className="space-y-3 pt-1">
              <div className="text-xs font-semibold text-[#18191F] dark:text-gray-300">
                Pinned Rooms
              </div>

              <div className="space-y-2.5">
                {/* Pinned Item 1: DSA Study Table */}
                <div
                  onClick={() => onOpenRoom?.('LR-5632')}
                  className="flex items-start gap-2.5 group cursor-pointer hover:bg-[#F9F7F3] dark:hover:bg-[#252836] p-1.5 -mx-1.5 rounded-xl transition-colors"
                >
                  <span className="text-amber-400 text-base leading-none select-none mt-0.5">⭐</span>
                  <div>
                    <div className="font-bold text-sm text-[#18191F] dark:text-gray-100 group-hover:text-[#543FE3] transition-colors">
                      DSA Study Table
                    </div>
                    <div className="text-xs text-[#6F7180] dark:text-gray-400">
                      Fast! sausly return
                    </div>
                  </div>
                </div>

                {/* Pinned Item 2: Literature Society */}
                <div
                  onClick={() => onOpenRoom?.('LR-2291')}
                  className="flex items-start gap-2.5 group cursor-pointer hover:bg-[#F9F7F3] dark:hover:bg-[#252836] p-1.5 -mx-1.5 rounded-xl transition-colors"
                >
                  <span className="text-amber-400 text-base leading-none select-none mt-0.5">⭐</span>
                  <div>
                    <div className="font-bold text-sm text-[#18191F] dark:text-gray-100 group-hover:text-[#543FE3] transition-colors">
                      Literature Society
                    </div>
                    <div className="text-xs text-[#6F7180] dark:text-gray-400">
                      For instant return
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Room History & Durations Drawer Trigger Card */}
            <div className="pt-2 border-t border-[#EFEAE2] dark:border-[#2D2F3C]">
              <button
                type="button"
                onClick={() => setIsHistoryDrawerOpen(true)}
                className="w-full group bg-gradient-to-r from-[#F6F3FE] to-[#F1EEFB] dark:from-[#252238] dark:to-[#2B2742] hover:from-[#EFEAFF] hover:to-[#E6E0F8] border border-[#DFD6FA] dark:border-[#403763] rounded-xl p-3 flex items-center justify-between text-left transition-all cursor-pointer shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#543FE3] text-white flex items-center justify-center shadow-xs">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-bold text-xs text-[#18191F] dark:text-gray-100 group-hover:text-[#543FE3] transition-colors">
                      Room History & Durations
                    </div>
                    <div className="text-[11px] text-[#6E7080] dark:text-gray-400">
                      View session start-to-end times
                    </div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-[#543FE3] dark:text-[#A798FF] group-hover:translate-x-0.5 transition-transform">
                  View →
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* RIGHT-SIDE SLIDE-OVER DRAWER FOR ROOM HISTORY & DURATIONS */}
      {/* ========================================================= */}
      {isHistoryDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop with smooth blur */}
          <div
            className="fixed inset-0 bg-black/45 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsHistoryDrawerOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-[#FFFDF9] dark:bg-[#1A1C24] shadow-2xl border-l border-[#EFEAE1] dark:border-[#2F3140] flex flex-col transform transition-transform duration-300 ease-in-out">
              {/* Drawer Header */}
              <div className="p-5 border-b border-[#EFEAE2] dark:border-[#2B2D3A] flex items-start justify-between bg-white dark:bg-[#1E202B]">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#543FE3] text-white flex items-center justify-center shadow-xs">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    </div>
                    <h3 className="font-heading font-extrabold text-lg text-[#18191F] dark:text-gray-100">
                      Room Session History
                    </h3>
                  </div>
                  <p className="text-xs text-[#6F7180] dark:text-gray-400 mt-1">
                    Track start time, end time, and durations of all created & joined rooms.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsHistoryDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-[#2B2D3A] dark:hover:bg-[#383A4A] flex items-center justify-center text-gray-500 dark:text-gray-300 text-sm transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Study Stats Summary Strip */}
              <div className="p-4 bg-[#F8F5EE] dark:bg-[#21232E] border-b border-[#EFEAE2] dark:border-[#2B2D3A] grid grid-cols-3 gap-2.5 text-center">
                <div className="bg-white dark:bg-[#282B38] p-2.5 rounded-xl border border-[#ECE5D8] dark:border-[#383A4A] shadow-2xs">
                  <div className="text-[11px] text-[#696C7B] dark:text-gray-400 font-medium">Total Duration</div>
                  <div className="font-extrabold text-sm text-[#543FE3] dark:text-[#A798FF] mt-0.5">14h 50m</div>
                </div>
                <div className="bg-white dark:bg-[#282B38] p-2.5 rounded-xl border border-[#ECE5D8] dark:border-[#383A4A] shadow-2xs">
                  <div className="text-[11px] text-[#696C7B] dark:text-gray-400 font-medium">Created by Me</div>
                  <div className="font-extrabold text-sm text-[#18191F] dark:text-gray-100 mt-0.5">3 Rooms</div>
                </div>
                <div className="bg-white dark:bg-[#282B38] p-2.5 rounded-xl border border-[#ECE5D8] dark:border-[#383A4A] shadow-2xs">
                  <div className="text-[11px] text-[#696C7B] dark:text-gray-400 font-medium">Joined Rooms</div>
                  <div className="font-extrabold text-sm text-[#18191F] dark:text-gray-100 mt-0.5">5 Rooms</div>
                </div>
              </div>

              {/* Drawer Filter Pills */}
              <div className="px-5 py-3 border-b border-[#EFEAE2] dark:border-[#2B2D3A] flex items-center gap-2">
                {['All', 'Hosted', 'Joined'].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setHistoryFilter(f)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      historyFilter === f
                        ? 'bg-[#543FE3] text-white shadow-xs'
                        : 'bg-gray-100 dark:bg-[#2B2D3A] text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {f === 'All' ? 'All (8)' : f === 'Hosted' ? 'Created by Me (3)' : 'Joined (5)'}
                  </button>
                ))}
              </div>

              {/* Drawer Scrollable History List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                {filteredHistory.map((session) => (
                  <div
                    key={session.id}
                    className="bg-white dark:bg-[#20222D] border border-[#E9E4DB] dark:border-[#303342] rounded-xl p-3.5 shadow-2xs hover:border-[#543FE3]/40 transition-all space-y-2.5"
                  >
                    {/* Top Row: Title, Code & Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-heading font-extrabold text-sm text-[#18191F] dark:text-gray-100">
                            {session.title}
                          </h4>
                          <span className="text-[10px] bg-gray-100 dark:bg-[#2B2D3A] text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded font-mono">
                            {session.code}
                          </span>
                        </div>
                        <div className="text-xs text-[#6F7180] dark:text-gray-400 mt-0.5">
                          {session.topic}
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                          session.role === 'Hosted'
                            ? 'bg-[#F2EEFE] dark:bg-[#342B55] text-[#543FE3] dark:text-[#B6A8FF]'
                            : 'bg-[#EBF9F1] dark:bg-[#1E3B2C] text-[#1E7E45] dark:text-[#5DE08E]'
                        }`}
                      >
                        {session.role === 'Hosted' ? 'Created by Me' : 'Joined'}
                      </span>
                    </div>

                    {/* Exact Time Interval & Total Duration (Start time to End time) */}
                    <div className="bg-[#FAF7F2] dark:bg-[#272935] rounded-lg p-2.5 border border-[#ECE5D8] dark:border-[#36394A] space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 font-medium text-[#18191F] dark:text-gray-200">
                          <svg className="w-3.5 h-3.5 text-[#543FE3]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          <span>{session.startTime} – {session.endTime}</span>
                        </div>
                        <div className="font-extrabold text-[#543FE3] dark:text-[#A798FF]">
                          {session.duration}
                        </div>
                      </div>

                      {/* Visual Timeline Bar */}
                      <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-[#543FE3] to-[#8C7BFF] h-full rounded-full"
                          style={{ width: `${Math.min(100, (session.durationMinutes / 150) * 100)}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400 pt-0.5">
                        <span>{session.date}</span>
                        <span>Host: {session.host}</span>
                      </div>
                    </div>

                    {/* Bottom Row: Members + Re-Enter Action */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <span>👥 {session.participants} participants</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setIsHistoryDrawerOpen(false);
                          onOpenRoom?.(session.code);
                        }}
                        className="text-xs font-semibold text-[#543FE3] dark:text-[#A798FF] hover:underline cursor-pointer"
                      >
                        Re-open Room →
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-[#EFEAE2] dark:border-[#2B2D3A] bg-white dark:bg-[#1E202B] flex items-center justify-between">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Showing {filteredHistory.length} room logs
                </div>
                <button
                  type="button"
                  onClick={() => setIsHistoryDrawerOpen(false)}
                  className="bg-[#543FE3] hover:bg-[#4632D0] active:scale-95 text-white font-medium text-xs px-4 py-2 rounded-full cursor-pointer shadow-2xs"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
