import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userApi } from '../../api/user.api';
import GoalsWidget from './GoalsWidget';
import {
  goldMedal,
  burstLines,
} from '../../assets';

export default function ActivityView({ onOpenRoom, onOpenCreateRoom }) {
  const { user } = useAuth();

  const [activeFilter, setActiveFilter] = useState('Full History');
  const [timeFilter, setTimeFilter] = useState('This week');
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const filterButtons = ['Full History', 'Created', 'Joined', 'Completed'];

  // Fetch real rooms and activity data
  useEffect(() => {
    let isMounted = true;

    const fetchActivityData = async () => {
      setIsLoading(true);
      setErrorMessage('');
      try {
        const response = await userApi.getMyRooms();
        if (isMounted) {
          const userRooms = response.data?.rooms || [];
          setRooms(userRooms);
        }
      } catch (err) {
        if (isMounted) {
          console.error('[Activity] Error fetching activity data:', err);
          setErrorMessage(err.message || 'Unable to load real activity data.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchActivityData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filtered rooms based on user selection
  const filteredRooms = useMemo(() => {
    if (activeFilter === 'Created') {
      return rooms.filter((r) => r.creatorId === user?.id);
    }
    if (activeFilter === 'Joined') {
      return rooms.filter((r) => r.creatorId !== user?.id);
    }
    if (activeFilter === 'Completed') {
      return rooms.filter((r) => r.status === 'ENDED');
    }
    return rooms;
  }, [rooms, activeFilter, user?.id]);

  // Upcoming scheduled rooms
  const upcomingRooms = useMemo(() => {
    return rooms
      .filter((r) => r.status === 'SCHEDULED')
      .sort((a, b) => new Date(a.scheduledAt || a.createdAt) - new Date(b.scheduledAt || b.createdAt));
  }, [rooms]);

  // Derived real metrics
  const completedRooms = useMemo(() => {
    return rooms.filter((r) => r.status === 'ENDED');
  }, [rooms]);

  const createdRooms = useMemo(() => {
    return rooms.filter((r) => r.creatorId === user?.id);
  }, [rooms, user?.id]);

  // Total collaboration/study duration in seconds
  const totalDurationSeconds = useMemo(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    return rooms.reduce((acc, r) => {
      // If time filter is 'This week', skip older rooms
      if (timeFilter === 'This week') {
        const roomDate = new Date(r.createdAt);
        if (roomDate < oneWeekAgo) return acc;
      }

      if (r.duration && r.duration > 0) {
        return acc + r.duration;
      }
      if (r.endedAt && r.createdAt) {
        const diff = Math.max(0, Math.floor((new Date(r.endedAt) - new Date(r.createdAt)) / 1000));
        return acc + diff;
      }
      return acc;
    }, 0);
  }, [rooms, timeFilter]);

  // Human readable study duration
  const formattedStudyTime = useMemo(() => {
    const hours = Math.floor(totalDurationSeconds / 3600);
    const minutes = Math.floor((totalDurationSeconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`.trim();
    }
    if (minutes > 0) {
      return `${minutes}m`;
    }
    return totalDurationSeconds > 0 ? `${totalDurationSeconds}s` : '0h';
  }, [totalDurationSeconds]);

  // Calculate unique days with room activity for streak
  const streakDays = useMemo(() => {
    const uniqueDays = new Set();
    rooms.forEach((r) => {
      const dateStr = new Date(r.createdAt).toISOString().split('T')[0];
      uniqueDays.add(dateStr);
    });
    return uniqueDays.size;
  }, [rooms]);

  // Unique peer collaborators
  const uniquePeersCount = useMemo(() => {
    const peerIds = new Set();
    rooms.forEach((r) => {
      if (r.creatorId && r.creatorId !== user?.id) {
        peerIds.add(r.creatorId);
      }
      if (Array.isArray(r.participants)) {
        r.participants.forEach((p) => {
          if (p.id && p.id !== user?.id) {
            peerIds.add(p.id);
          }
        });
      }
    });
    return peerIds.size;
  }, [rooms, user?.id]);

  // Helper for relative time
  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return 'Recently';
    const date = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.max(0, Math.floor((now - date) / 1000));
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay > 30) return date.toLocaleDateString();
    if (diffDay > 0) return `${diffDay}d ago`;
    if (diffHour > 0) return `${diffHour}h ago`;
    if (diffMin > 0) return `${diffMin}m ago`;
    return 'Just now';
  };

  // Helper for scheduled date format
  const formatScheduledDate = (dateStr) => {
    if (!dateStr) return 'Soon';
    const d = new Date(dateStr);
    return d.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Dynamic achievement badges based on real activity
  const achievements = [
    {
      id: 'first-room',
      title: 'First Step',
      desc: 'Joined or created your first study room',
      unlocked: rooms.length >= 1,
      color: '#6C52EE',
      bgColor: '#EAE5FC',
    },
    {
      id: 'room-host',
      title: 'Room Host',
      desc: 'Created and hosted a collaborative room',
      unlocked: createdRooms.length >= 1,
      color: '#2563EB',
      bgColor: '#E5EFFD',
    },
    {
      id: 'active-learner',
      title: 'Active Learner',
      desc: 'Completed at least 2 learning rooms',
      unlocked: completedRooms.length >= 2,
      color: '#EA580C',
      bgColor: '#FFF5ED',
    },
    {
      id: 'collaborator',
      title: 'Collaborator',
      desc: 'Studied with 3+ unique peers',
      unlocked: uniquePeersCount >= 3,
      color: '#10B981',
      bgColor: '#ECFDF5',
    },
  ];

  const userName = user?.name ? user.name.split(' ')[0] : 'Collaborator';

  return (
    <div className="w-full max-w-[1560px] mx-auto flex flex-col gap-6 select-none font-sans pb-4">
      {/* Header row */}
      <div className="flex items-start justify-between relative pt-2 sm:pt-3">
        {/* Left: Radiating rays + Title + Subtitle */}
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
            Activity
          </h1>
          <p className="text-sm sm:text-base text-[#5E606D] dark:text-[#A0A2B0] mt-1">
            Track your real progress & keep moving forward!
          </p>
        </div>

        {/* Right: Floating handwritten quote */}
        <div className="hidden xl:flex items-center gap-2 font-handwriting text-base font-bold text-[#3B3C46] dark:text-[#D4D6E2] pr-6 select-none">
          <div className="text-right leading-tight">
            Learn.<br />Collaborate.<br />Grow.
          </div>
          <svg className="w-7 h-7 text-[#3B3C46] dark:text-[#D4D6E2] -mt-1" viewBox="0 0 32 32" fill="none">
            <path d="M4 10 C 14 6, 22 14, 26 24 M 20 24 L 26 24 L 26 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Main 2-column layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left column: activity banner, feed, and stats */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          {/* WELCOME TO YOUR ACTIVITY HUB BANNER */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#FFF4EB] via-[#FDF7F2] to-[#F5EFFE] dark:from-[#26222C] dark:via-[#23202E] dark:to-[#1E1B2D] border border-[#FDE5D2] dark:border-[#383348] p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-5 shadow-xs">
            {/* Left text with sparkles */}
            <div className="flex items-center gap-2.5">
              <div className="text-sm sm:text-base text-[#18191F] dark:text-[#F3F4F6] font-medium leading-tight">
                <span>Welcome to your Activity hub,</span>
                <span className="font-heading font-extrabold text-[#18191F] dark:text-white block sm:inline sm:ml-1">
                  {userName}!
                </span>
              </div>
              <div className="flex items-center gap-0.5 text-amber-500 flex-shrink-0">
                <span className="text-base">✦</span>
                <span className="text-xs">✧</span>
              </div>
            </div>

            {/* Center: Gold Medal */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 relative">
              <img
                src={goldMedal}
                alt="Achievement Medal"
                className="w-full h-full object-contain filter drop-shadow-sm select-none"
              />
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

          {/* Sub-grid: Activity feed & Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Activity feed list */}
            <div className="flex flex-col gap-3">
              {/* Heading */}
              <div className="flex items-center justify-between">
                <div className="relative inline-block">
                  <h2 className="font-heading font-extrabold text-base sm:text-lg text-[#18191F] dark:text-[#F3F4F6]">
                    Activity Feed
                  </h2>
                  <svg className="absolute -bottom-1 left-0 w-full h-2 text-[#3A3B45] dark:text-gray-400" viewBox="0 0 100 8" fill="none">
                    <path d="M 2 4 Q 30 1, 60 5 T 98 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-[#717382] dark:text-[#9A9CA8]">
                  {filteredRooms.length} {filteredRooms.length === 1 ? 'event' : 'events'}
                </span>
              </div>

              {/* Timeline Container */}
              <div className="bg-white dark:bg-[#1D1F26] border border-[#EAE5DE] dark:border-[#2D303A] rounded-3xl p-4 sm:p-5 shadow-xs flex-1 flex flex-col justify-between">
                {isLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center gap-2">
                    <div className="w-7 h-7 border-2 border-[#543FE3] border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-[#717382] dark:text-[#9A9CA8]">Loading your activity...</span>
                  </div>
                ) : errorMessage ? (
                  <div className="py-8 text-center text-xs text-rose-500 font-medium">
                    {errorMessage}
                  </div>
                ) : filteredRooms.length === 0 ? (
                  <div className="py-10 px-4 text-center flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-950/40 text-[#543FE3] dark:text-[#B6A8FF] flex items-center justify-center text-xl">
                      🚀
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#18191F] dark:text-[#F3F4F6]">
                        No activity recorded yet
                      </h4>
                      <p className="text-xs text-[#717382] dark:text-[#9A9CA8] mt-1 max-w-[260px] mx-auto">
                        {activeFilter === 'Full History'
                          ? 'Start or join a study room to begin tracking your collaborative sessions!'
                          : `No rooms found under "${activeFilter}".`}
                      </p>
                    </div>
                    {onOpenCreateRoom && (
                      <button
                        type="button"
                        onClick={onOpenCreateRoom}
                        className="mt-2 px-4 py-2 rounded-full bg-[#543FE3] hover:bg-[#432ec4] text-white text-xs font-semibold transition-all shadow-xs"
                      >
                        Create a Study Room
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="relative pl-6 space-y-3.5 before:absolute before:left-3 before:top-4 before:bottom-4 before:w-0.5 before:bg-[#EAE5DE] dark:before:bg-[#2E313D]">
                    {filteredRooms.slice(0, 5).map((room, index) => {
                      const isCreator = room.creatorId === user?.id;
                      const participantsList = Array.isArray(room.participants) ? room.participants : [];

                      return (
                        <div
                          key={room.id}
                          className="relative group cursor-pointer"
                          onClick={() => onOpenRoom && onOpenRoom(room.roomCode || room.id)}
                        >
                          {/* Number Badge on Timeline */}
                          <div className="absolute -left-6 top-3.5 w-6 h-6 rounded-full bg-[#EAE5FC] dark:bg-[#342D59] text-[#543FE3] dark:text-[#B6A8FF] flex items-center justify-center text-xs font-extrabold ring-4 ring-[#FAF8F5] dark:ring-[#121316]">
                            {index + 1}
                          </div>

                          <div className="bg-[#FAF9F6] dark:bg-[#242732] border border-[#EAE5DE] dark:border-[#2D303A] rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-2xs hover:border-[#6C52EE]/60 hover:shadow-xs transition-all">
                            <div className="space-y-1 min-w-0 flex-1">
                              <h4 className="font-bold text-xs sm:text-sm text-[#18191F] dark:text-[#F3F4F6] truncate">
                                {isCreator ? `Created ${room.title}` : `Joined ${room.title}`}
                              </h4>
                              <div className="flex items-center gap-2 text-[11px] sm:text-xs flex-wrap">
                                <span className="text-[#717382] dark:text-[#9193A1]">
                                  {formatTimeAgo(room.createdAt)}
                                </span>

                                {room.status === 'ACTIVE' && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Live session
                                  </span>
                                )}

                                {room.status === 'SCHEDULED' && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40">
                                    📅 {formatScheduledDate(room.scheduledAt)}
                                  </span>
                                )}

                                {room.status === 'ENDED' && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/40">
                                    ✓ Completed {room.duration ? `(${Math.floor(room.duration / 60)}m)` : ''}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Participant Avatars */}
                            <div className="flex items-center -space-x-1.5 flex-shrink-0">
                              {participantsList.slice(0, 3).map((p, pIdx) => (
                                <div
                                  key={p.id || pIdx}
                                  className="w-6 h-6 rounded-full bg-[#543FE3] text-white ring-2 ring-white dark:ring-[#242732] flex items-center justify-center text-[10px] font-bold overflow-hidden"
                                  title={p.name || 'Participant'}
                                >
                                  {p.avatar ? (
                                    <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                                  ) : (
                                    (p.name ? p.name.charAt(0).toUpperCase() : 'U')
                                  )}
                                </div>
                              ))}
                              {participantsList.length === 0 && (
                                <div className="w-6 h-6 rounded-full bg-[#543FE3] text-white ring-2 ring-white dark:ring-[#242732] flex items-center justify-center text-[10px] font-bold">
                                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                              )}
                              {participantsList.length > 3 && (
                                <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 ring-2 ring-white dark:ring-[#242732] flex items-center justify-center text-[9px] font-bold text-gray-600 dark:text-gray-300">
                                  +{participantsList.length - 3}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Stats and journey panel */}
            <div className="flex flex-col gap-3">
              {/* Heading */}
              <div className="relative inline-block">
                <h2 className="font-heading font-extrabold text-base sm:text-lg text-[#18191F] dark:text-[#F3F4F6]">
                  My Stats & Journey
                </h2>
                <svg className="absolute -bottom-1 left-0 w-full h-2 text-[#3A3B45] dark:text-gray-400" viewBox="0 0 120 8" fill="none">
                  <path d="M 2 4 Q 35 1, 70 5 T 118 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>

              {/* Stats Card */}
              <div className="bg-white dark:bg-[#1D1F26] border border-[#EAE5DE] dark:border-[#2D303A] rounded-3xl p-5 shadow-xs flex flex-col justify-between gap-4 flex-1">
                {/* Study Time Header with Dropdown */}
                <div className="space-y-0.5 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#717382] dark:text-[#9A9CA8]">
                      Study & Collaboration Time
                    </span>

                    {/* Time Filter Dropdown Toggle */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowTimeDropdown((prev) => !prev)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#F3EEFE] dark:bg-[#2A2445] text-[#543FE3] dark:text-[#C5BAFF] border border-[#E5DBFD] dark:border-[#3D3466] cursor-pointer"
                      >
                        <span>{timeFilter}</span>
                        <span className="text-[10px]">⌵</span>
                      </button>

                      {showTimeDropdown && (
                        <div className="absolute right-0 mt-1 w-28 bg-white dark:bg-[#252833] rounded-xl shadow-lg border border-[#E5E1D8] dark:border-[#383B47] py-1 z-20">
                          {['This week', 'All time'].map((tf) => (
                            <button
                              key={tf}
                              type="button"
                              onClick={() => {
                                setTimeFilter(tf);
                                setShowTimeDropdown(false);
                              }}
                              className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-gray-50 dark:hover:bg-[#2C2F3D] ${
                                timeFilter === tf ? 'text-[#543FE3] font-bold' : 'text-[#33353F] dark:text-[#B5B7C2]'
                              }`}
                            >
                              {tf}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-baseline gap-1.5 pt-1">
                    <span className="font-heading font-extrabold text-3xl text-[#18191F] dark:text-[#F3F4F6]">
                      {formattedStudyTime}
                    </span>
                    <span className="text-xs text-[#717382] dark:text-[#9A9CA8]">
                      {timeFilter.toLowerCase()}
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
                      {completedRooms.length}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[#717382] dark:text-[#9A9CA8]">
                      Active Days Streak
                    </div>
                    <div className="font-heading font-extrabold text-2xl text-[#18191F] dark:text-[#F3F4F6] mt-0.5 flex items-center gap-1">
                      <span>🔥</span>
                      <span>{streakDays} {streakDays === 1 ? 'Day' : 'Days'}</span>
                    </div>
                  </div>
                </div>

                {/* My Achievements Row */}
                <div className="space-y-2 pt-2 border-t border-[#EFEBE4] dark:border-[#2E313D]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#18191F] dark:text-[#F3F4F6]">
                      My Achievements
                    </span>
                    <span className="text-[11px] font-semibold text-[#543FE3] dark:text-[#A798FF]">
                      {achievements.filter((a) => a.unlocked).length} / {achievements.length} Unlocked
                    </span>
                  </div>

                  {/* 4 Ribbon Badges Row */}
                  <div className="grid grid-cols-4 gap-2 text-center items-center">
                    {achievements.map((badge) => (
                      <div
                        key={badge.id}
                        className={`flex flex-col items-center transition-opacity ${badge.unlocked ? 'opacity-100' : 'opacity-40'}`}
                        title={`${badge.title}: ${badge.desc} (${badge.unlocked ? 'Unlocked!' : 'Locked'})`}
                      >
                        <div className="w-10 h-12 relative flex items-center justify-center">
                          <svg viewBox="0 0 40 48" className="w-full h-full drop-shadow-2xs" fill="none">
                            <path
                              d="M 20 4 C 28 4, 34 10, 34 18 C 34 26, 28 32, 20 32 C 12 32, 6 26, 6 18 C 6 10, 12 4, 20 4 Z"
                              fill={badge.unlocked ? badge.bgColor : '#F3F4F6'}
                              stroke={badge.unlocked ? badge.color : '#9CA3AF'}
                              strokeWidth="2"
                            />
                            <polygon points="12,30 8,46 16,40 20,44 20,30" fill={badge.unlocked ? badge.color : '#9CA3AF'} opacity="0.8" />
                            <polygon points="28,30 32,46 24,40 20,44 20,30" fill={badge.unlocked ? badge.color : '#9CA3AF'} opacity="0.8" />
                          </svg>

                          {badge.unlocked ? (
                            <span className="absolute top-2.5 text-xs font-extrabold text-amber-500">
                              ★
                            </span>
                          ) : (
                            <svg className="w-3.5 h-3.5 text-gray-500 absolute top-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-[#18191F] dark:text-[#F3F4F6] truncate max-w-full mt-1">
                          {badge.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: milestones & upcoming sessions */}
        <div className="xl:col-span-4 flex flex-col gap-5">
          {/* USER CUSTOM MILESTONES & GOALS WIDGET */}
          <GoalsWidget variant="milestones" onOpenCreateRoom={onOpenCreateRoom} />

          {/* CARD 2: REAL UPCOMING SESSIONS */}
          <div className="bg-white dark:bg-[#1D1F26] border border-[#EAE5DE] dark:border-[#2D303A] rounded-3xl p-5 sm:p-6 shadow-xs space-y-3.5">
            <h3 className="font-heading font-extrabold text-base sm:text-lg text-[#18191F] dark:text-[#F3F4F6]">
              Upcoming Sessions
            </h3>

            {upcomingRooms.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#717382] dark:text-[#9A9CA8] space-y-2">
                <p>No upcoming scheduled sessions.</p>
                {onOpenCreateRoom && (
                  <button
                    type="button"
                    onClick={onOpenCreateRoom}
                    className="text-xs font-bold text-[#543FE3] dark:text-[#A798FF] hover:underline"
                  >
                    Schedule a room now →
                  </button>
                )}
              </div>
            ) : (
              <div className="relative pl-5 space-y-3.5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#EAE5DE] dark:before:bg-[#2E313D]">
                {upcomingRooms.slice(0, 4).map((room) => (
                  <div
                    key={room.id}
                    className="relative cursor-pointer group"
                    onClick={() => onOpenRoom && onOpenRoom(room.roomCode || room.id)}
                  >
                    <div className="absolute -left-5 top-0.5 w-4 h-4 rounded-full bg-[#543FE3] text-white flex items-center justify-center text-[10px] font-bold">
                      📅
                    </div>
                    <div className="font-bold text-xs text-[#18191F] dark:text-[#F3F4F6] group-hover:text-[#543FE3] transition-colors truncate">
                      {room.title}
                    </div>
                    <div className="text-[11px] text-[#717382] dark:text-[#9A9CA8]">
                      {formatScheduledDate(room.scheduledAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
