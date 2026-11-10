import React, { useState, useEffect } from 'react';
import { roomApi } from '../../api/room.api';
import {
  aboutUsCollab,
  exploreRocket,
  burstLines,
} from '../../assets';

export default function ExploreView({ onOpenRoom, onOpenCreateRoom }) {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const categories = [
    { key: 'ALL', name: 'All Rooms', icon: '✦', isSparkle: true },
    { key: 'CODING', name: 'Coding', icon: '</>' },
    { key: 'STUDY', name: 'Study Sessions', icon: '🎓' },
    { key: 'MEETING', name: 'Meetings', icon: '🤝' },
    { key: 'DESIGN', name: 'Design', icon: '🎨' },
    { key: 'SCIENCE', name: 'Science', icon: '⚗️' },
    { key: 'LANGUAGES', name: 'Languages', icon: '🌐' },
    { key: 'CUSTOM', name: 'Custom Topics', icon: '⚡' },
  ];

  // Fetch real rooms from backend API
  useEffect(() => {
    let isMounted = true;
    const fetchRooms = async () => {
      setIsLoading(true);
      setErrorMessage('');
      try {
        const params = {
          limit: 12,
        };
        if (activeCategory !== 'ALL') {
          params.category = activeCategory;
        }
        if (searchQuery.trim()) {
          params.query = searchQuery.trim();
        }

        const response = await roomApi.searchRooms(params);
        if (isMounted) {
          setRooms(response.data?.rooms || []);
        }
      } catch (_err) {
        if (isMounted) {
          setErrorMessage('Failed to load active rooms. Please check your connection.');
          setRooms([]);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchRooms, 300);
    return () => {
      isMounted = false;
      clearTimeout(debounceTimer);
    };
  }, [activeCategory, searchQuery]);

  return (
    <div className="w-full max-w-[1560px] mx-auto flex flex-col gap-6 select-none font-sans pb-4">
      {/* ========================================================= */}
      {/* 1. HERO BANNER: DISCOVER ROOMS, EXPLORE IDEAS             */}
      {/* ========================================================= */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#FFF5ED] via-[#FBF4FC] to-[#F1EAFF] dark:from-[#242129] dark:via-[#22212E] dark:to-[#1C1A2B] border border-[#EFE8DF] dark:border-[#353245] p-5 sm:p-6 md:p-8 flex flex-col gap-6 shadow-xs">
        {/* Soft Ambient Glow */}
        <div className="absolute top-0 right-1/4 w-80 h-80 rounded-full bg-gradient-to-br from-amber-200/30 to-purple-300/30 dark:from-purple-900/20 dark:to-indigo-900/20 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
          {/* Left Headline & Search Input */}
          <div className="flex-1 space-y-4 relative">
            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-[42px] text-[#18191F] dark:text-[#F3F4F6] tracking-tight leading-tight">
              <span className="relative inline-block">
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
                Discover rooms,
              </span>
              <br />
              <span className="text-[#543FE3] dark:text-[#A798FF]">explore ideas</span>
            </h1>

            <p className="text-sm sm:text-base text-[#5A5C66] dark:text-[#A6A8B4] max-w-md leading-relaxed">
              Find live study rooms, code review sessions, and collaborative whiteboards happening right now.
            </p>

            {/* Live Search Bar */}
            <div className="relative max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rooms by title, topic, or code..."
                className="w-full rounded-full border border-[var(--color-border)] bg-white dark:bg-[#1E2028] py-2.5 pl-10 pr-4 text-xs sm:text-sm text-[var(--color-text-primary)] outline-none focus:border-[#543FE3] focus:ring-2 focus:ring-[#543FE3]/20 shadow-xs transition-all"
              />
              <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
          </div>

          {/* Right Illustration */}
          <div className="relative w-full max-w-[280px] sm:max-w-[320px] lg:max-w-[340px] shrink-0">
            <img
              src={aboutUsCollab}
              alt="Study group collaborating"
              className="w-full h-auto object-contain filter drop-shadow-md select-none pointer-events-none"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pt-2 relative z-10 flex-wrap">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setActiveCategory(cat.key)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer whitespace-nowrap ${
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
      {/* 2. CREATE YOUR OWN ROOM CARD                              */}
      {/* ========================================================= */}
      <div className="bg-[#F3EEFE] dark:bg-[#252238] border border-[#E7DDFD] dark:border-[#3A3358] rounded-3xl p-5 sm:p-6 shadow-xs flex items-center justify-between gap-4 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <h3 className="font-heading font-extrabold text-xl text-[#18191F] dark:text-white leading-tight">
            Can't find what you're looking for?
          </h3>
          <p className="text-xs sm:text-sm text-[#6F7180] dark:text-[#B5B7C2] max-w-md leading-relaxed">
            Create your own public or private room in seconds. Invite classmates or let the community join.
          </p>
          <button
            type="button"
            onClick={onOpenCreateRoom}
            className="bg-[#543FE3] hover:bg-[#4330C8] text-white active:scale-95 text-xs font-semibold px-5 py-2.5 rounded-full transition-all flex items-center gap-1.5 shadow-sm cursor-pointer mt-2"
          >
            <span>Create New Room</span>
            <span>+</span>
          </button>
        </div>

        <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 relative hidden sm:flex items-center justify-center">
          <img
            src={exploreRocket}
            alt="Rocket"
            className="w-full h-full object-contain filter drop-shadow-xs select-none"
          />
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. LIVE EXPLORE ROOMS LISTING                             */}
      {/* ========================================================= */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔥</span>
            <h2 className="font-heading font-extrabold text-lg sm:text-xl text-[#18191F] dark:text-[#F3F4F6] tracking-tight">
              Active Community Rooms
            </h2>
          </div>
          <span className="text-xs text-[var(--color-text-secondary)] font-medium">
            {rooms.length} room{rooms.length === 1 ? '' : 's'} available
          </span>
        </div>

        {/* Loading Skeletons */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="rounded-2xl border border-[var(--color-border)] p-5 space-y-3 animate-pulse bg-[var(--color-surface)]">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-1/3 mt-4" />
              </div>
            ))}
          </div>
        ) : rooms.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {rooms.map((room) => {
              const participantCount = room.participants?.length || 0;
              return (
                <div
                  key={room.id}
                  className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 flex flex-col justify-between gap-4 shadow-2xs hover:shadow-md hover:border-[#543FE3]/50 transition-all"
                >
                  <div className="space-y-2">
                    {/* Header tags: Category & Privacy */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EAE5FC] dark:bg-[#342D59] text-[#543FE3] dark:text-[#B6A8FF] uppercase">
                        {room.category === 'CUSTOM' ? room.customCategory || 'Custom' : room.category}
                      </span>
                      <span className="text-[11px] text-[var(--color-text-secondary)] font-mono">
                        {room.isPrivate ? '🔒 Private' : '🌐 Public'}
                      </span>
                    </div>

                    {/* Room Title */}
                    <h3 className="font-heading font-bold text-base text-[var(--color-text-primary)] line-clamp-1">
                      {room.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2">
                      {room.description || 'No description provided for this session.'}
                    </p>
                  </div>

                  {/* Footer Info & Join Button */}
                  <div className="pt-2 border-t border-[var(--color-border)]/60 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{participantCount} joined</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onOpenRoom(room.roomCode || room.id)}
                      className="bg-[#543FE3] hover:bg-[#4330C8] active:scale-95 text-white font-medium text-xs px-4 py-1.5 rounded-full transition-all cursor-pointer shadow-2xs"
                    >
                      Join Room →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="rounded-3xl border border-dashed border-[var(--color-border)] p-12 text-center space-y-4 bg-[var(--color-surface)]">
            <div className="w-16 h-16 rounded-full bg-[#F3EEFE] dark:bg-[#252238] flex items-center justify-center text-2xl mx-auto">
              🔭
            </div>
            <div className="space-y-1">
              <h3 className="font-heading font-bold text-base text-[var(--color-text-primary)]">
                {errorMessage ? 'Unable to load rooms' : 'No active rooms found in this category'}
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] max-w-sm mx-auto">
                {errorMessage || (searchQuery
                  ? `No rooms matched "${searchQuery}". Try a different keyword.`
                  : 'Be the pioneer! Start the first collaborative study room for this topic.')}
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenCreateRoom}
              className="inline-flex items-center gap-1.5 bg-[#543FE3] hover:bg-[#4330C8] text-white text-xs font-semibold px-5 py-2.5 rounded-full shadow-sm cursor-pointer"
            >
              <span>Create Room Now</span>
              <span>+</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
