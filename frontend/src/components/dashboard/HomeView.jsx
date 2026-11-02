import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  aboutUsCollab,
  footerBooks,
  studySunset,
  bulbIcon,
} from '../../assets';
import QuickActionCard from '../common/QuickActionCard';
import RoomCard from '../room/RoomCard';
import { useAuth } from '../../context/AuthContext';
import { userApi } from '../../api/user.api';
import { roomApi } from '../../api/room.api';
import GoalsWidget from './GoalsWidget';

/**
 * HomeView Component
 * Dynamic dashboard home connected to real user data and backend room APIs.
 */
export default function HomeView({
  onOpenJoin,
  onOpenCreate,
}) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [myRooms, setMyRooms] = useState([]);
  const [recentRooms, setRecentRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadHomeData = async () => {
      try {
        const [myRoomsRes, exploreRes] = await Promise.allSettled([
          userApi.getMyRooms(),
          roomApi.searchRooms({ limit: 4 }),
        ]);

        if (isMounted) {
          if (myRoomsRes.status === 'fulfilled') {
            setMyRooms(myRoomsRes.value.data?.rooms || []);
          }
          if (exploreRes.status === 'fulfilled') {
            setRecentRooms(exploreRes.value.data?.rooms || []);
          }
        }
      } catch {
        // Fallback
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadHomeData();
    return () => {
      isMounted = false;
    };
  }, []);

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

  const firstName = user?.name ? user.name.split(' ')[0] : 'Friend';
  const latestMyRoom = myRooms[0];

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-7 grid grid-cols-1 xl:grid-cols-12 gap-6 max-w-[1560px] mx-auto w-full">
      {/* ========================================================= */}
      {/* 1. MAIN DASHBOARD AREA (8 Cols on XL)                     */}
      {/* ========================================================= */}
      <div className="xl:col-span-8 flex flex-col gap-6">
        {/* HERO / WELCOME BANNER CARD */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#FFF5ED] via-[#F9F4FE] to-[#F1EAFF] dark:from-[#242129] dark:via-[#22212E] dark:to-[#1C1A2B] border border-[#EFE8DF] dark:border-[#353245] p-5 sm:p-6 md:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="absolute top-0 right-1/4 w-72 h-72 rounded-full bg-gradient-to-br from-amber-200/30 to-purple-300/30 dark:from-purple-900/20 dark:to-indigo-900/20 blur-3xl pointer-events-none" />

          {/* Left Text & CTA */}
          <div className="flex-1 z-10 space-y-4">
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#18191F] dark:text-[#F3F4F6] tracking-tight">
                Welcome back,
              </h1>
            </div>

            {/* Dynamic First Name with Hand-drawn Underline */}
            <div className="relative inline-block">
              <span className="font-editorial italic font-bold text-4xl sm:text-5xl text-[#18191F] dark:text-[#FFFFFF] tracking-tight">
                {firstName}!
              </span>
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

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 sm:gap-3 pt-2 flex-wrap sm:flex-nowrap">
              <button
                type="button"
                onClick={() => onOpenJoin?.()}
                className="inline-flex items-center gap-2 whitespace-nowrap shrink-0 bg-[#543FE3] hover:bg-[#4532CD] active:scale-95 text-white font-medium text-sm px-5 py-2.5 rounded-full shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
              >
                <span>Join a Room</span>
                <span>→</span>
              </button>
              <button
                type="button"
                onClick={onOpenCreate}
                className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 bg-white dark:bg-[#252833] hover:bg-gray-50 dark:hover:bg-[#2F3240] active:scale-95 text-[#252730] dark:text-[#EDEBF5] border border-[#E0DCD4] dark:border-[#3E4150] font-medium text-sm px-4 py-2.5 rounded-full transition-all cursor-pointer shadow-2xs"
              >
                <span>Create Room</span>
                <span className="text-base leading-none font-bold">+</span>
              </button>
            </div>
          </div>

          {/* Right Illustration */}
          <div className="relative z-10 w-full max-w-[280px] sm:max-w-[320px] lg:max-w-[340px] shrink min-w-0 flex flex-col items-center mx-auto lg:mx-0 pt-8 sm:pt-10 pb-1">
            <div className="absolute top-1 right-2 sm:right-4 font-handwriting text-xs sm:text-sm md:text-base font-bold text-[#3B3C46] dark:text-[#D4D6E2] leading-tight text-right select-none rotate-[2deg] pointer-events-none whitespace-nowrap">
              <span>Learn.</span><br />
              <span>Collaborate.</span><br />
              <span>Grow.</span>
            </div>

            <div className="absolute top-1 left-2 sm:left-4 select-none animate-bounce pointer-events-none" style={{ animationDuration: '4s' }}>
              <img
                src={bulbIcon}
                alt="Idea bulb"
                className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 object-contain drop-shadow-xs dark:invert-[0.9]"
              />
            </div>

            <img
              src={aboutUsCollab}
              alt="Study group collaborating"
              className="w-full h-auto object-contain filter drop-shadow-md select-none pointer-events-none"
            />
          </div>
        </div>

        {/* QUICK ACTIONS SECTION */}
        <div className="space-y-3.5">
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
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

        {/* BOTTOM SECTION: MY ROOMS & EXPLORE SPLIT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* MY ROOMS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-extrabold text-base text-[#18191F] dark:text-[#F3F4F6]">
                My Recent Room
              </h3>
              <button
                type="button"
                onClick={() => navigate('/dashboard/my-rooms')}
                className="text-xs font-semibold text-[#543FE3] dark:text-[#A798FF] hover:underline flex items-center gap-1 cursor-pointer"
              >
                View all ({myRooms.length}) →
              </button>
            </div>

            {latestMyRoom ? (
              <RoomCard
                variant="horizontal"
                title={latestMyRoom.title}
                subtitle={latestMyRoom.description || 'Active persistent collaboration room.'}
                thumbnail={studySunset}
                status={latestMyRoom.status === 'ACTIVE' ? 'live' : 'scheduled'}
                members={`${latestMyRoom.participants?.length || 1} participant`}
                onJoin={() => onOpenJoin?.(latestMyRoom.roomCode || latestMyRoom.id)}
                buttonText="Enter Room →"
              />
            ) : (
              <div className="rounded-2xl border border-dashed border-[var(--color-border)] p-6 text-center space-y-2 bg-[var(--color-surface)]">
                <p className="text-xs text-[var(--color-text-secondary)]">
                  You haven't launched a room yet.
                </p>
                <button
                  type="button"
                  onClick={onOpenCreate}
                  className="text-xs font-bold text-[#543FE3] hover:underline cursor-pointer"
                >
                  Create your first room →
                </button>
              </div>
            )}
          </div>

          {/* ACTIVE PUBLIC ROOMS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-extrabold text-base text-[#18191F] dark:text-[#F3F4F6]">
                Active Public Rooms
              </h3>
              <button
                type="button"
                onClick={() => navigate('/dashboard/explore')}
                className="text-xs font-semibold text-[#543FE3] dark:text-[#A798FF] hover:underline flex items-center gap-1 cursor-pointer"
              >
                Explore all →
              </button>
            </div>

            <div className="space-y-2">
              {recentRooms.length > 0 ? (
                recentRooms.slice(0, 3).map((r) => (
                  <div
                    key={r.id}
                    onClick={() => onOpenJoin?.(r.roomCode || r.id)}
                    className="p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[#543FE3] transition-all flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-bold text-[var(--color-text-primary)] line-clamp-1">
                        {r.title}
                      </div>
                      <div className="text-[11px] text-[var(--color-text-secondary)] flex items-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>{r.category}</span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-[#543FE3]">
                      Join →
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl border border-[var(--color-border)] text-center text-xs text-[var(--color-text-secondary)]">
                  No public rooms right now. Start one!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. RIGHT SIDEBAR / PROFILE COLUMN (4 Cols on XL)         */}
      {/* ========================================================= */}
      <div className="xl:col-span-4 flex flex-col gap-5">
        <div className="bg-white dark:bg-[#1C1E25] border border-[#EAE5DE] dark:border-[#2D303A] rounded-3xl p-6 text-center relative shadow-xs">
          {/* Avatar with Online Dot */}
          <div className="relative inline-block mx-auto mt-2 mb-3">
            <div className="w-24 h-24 rounded-full ring-4 ring-[#E9E4FC] dark:ring-[#372E5A] overflow-hidden p-0.5 bg-white dark:bg-[#1C1E25]">
              <img
                src={
                  user?.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80'
                }
                alt={user?.name || 'User'}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <span className="absolute bottom-1 right-2 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-[#1C1E25]" />
          </div>

          {/* User Details */}
          <h3 className="font-heading font-extrabold text-lg text-[#18191F] dark:text-[#F3F4F6] tracking-tight">
            {user?.name || 'Anonymous Learner'}
          </h3>
          <p className="text-xs text-[#717382] dark:text-[#9A9CA8] mt-0.5 truncate max-w-[220px] mx-auto">
            {user?.email || 'Authenticated with Google'}
          </p>

          <div className="relative inline-block mt-3 mb-5">
            <span className="bg-[#F3EFFE] dark:bg-[#2A2445] text-[#543FE3] dark:text-[#C5BAFF] px-4 py-1.5 rounded-full text-xs font-semibold font-editorial italic tracking-wide inline-flex items-center">
              “Better together.”
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 divide-x divide-[#EFEBE4] dark:divide-[#2E313D] pt-3 border-t border-[#EFEBE4] dark:border-[#2E313D]">
            <div className="px-1 text-center">
              <div className="font-heading font-extrabold text-lg text-[#18191F] dark:text-[#F3F4F6]">
                {myRooms.length}
              </div>
              <div className="text-[11px] text-[#717382] dark:text-[#9A9CA8]">
                Rooms Created
              </div>
            </div>

            <div className="px-1 text-center">
              <div className="font-heading font-extrabold text-lg text-emerald-600">
                Active
              </div>
              <div className="text-[11px] text-[#717382] dark:text-[#9A9CA8]">
                Account Status
              </div>
            </div>
          </div>
        </div>

        {/* Goals & To-Dos Widget */}
        <GoalsWidget variant="todo" />
      </div>
    </main>
  );
}
