import React, { useState, useEffect, useCallback } from 'react';
import { userApi } from '../../api/user.api';
import { roomApi } from '../../api/room.api';
import { useAuth } from '../../context/AuthContext';

export default function MyRoomsView({ onOpenRoom, onOpenCreateRoom }) {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState('all');
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedRoomId, setCopiedRoomId] = useState(null);

  const filterTabs = [
    { key: 'all', label: 'All Rooms' },
    { key: 'hosted', label: 'Created by Me' },
    { key: 'joined', label: 'Joined' },
    { key: 'scheduled', label: 'Scheduled' },
    { key: 'archived', label: 'Past / Ended' },
  ];

  const fetchMyRooms = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const response = await userApi.getMyRooms(activeFilter);
      setRooms(response.data?.rooms || []);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load your rooms.');
      setRooms([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      setIsLoading(true);
      setErrorMessage('');
      try {
        const response = await userApi.getMyRooms(activeFilter);
        if (!ignore) {
          setRooms(response.data?.rooms || []);
        }
      } catch (err) {
        if (!ignore) {
          setErrorMessage(err.message || 'Failed to load your rooms.');
          setRooms([]);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [activeFilter]);

  const handleCopyLink = (room) => {
    const origin = window.location.origin;
    const tokenQuery = room.inviteToken ? `?token=${room.inviteToken}` : '';
    const shareUrl = `${origin}/room/${room.roomCode || room.id}${tokenQuery}`;
    navigator.clipboard?.writeText(shareUrl);
    setCopiedRoomId(room.id);
    setTimeout(() => setCopiedRoomId(null), 2000);
  };

  const handleEndRoom = async (roomId) => {
    if (!window.confirm('Are you sure you want to end this room for all participants?')) return;
    try {
      await roomApi.endRoom(roomId);
      fetchMyRooms();
    } catch (err) {
      alert(err.message || 'Failed to end room.');
    }
  };

  return (
    <div className="w-full max-w-[1560px] mx-auto flex flex-col gap-6 select-none font-sans pb-6">
      {/* 1. Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#FBF4FE] via-[#F4EFFE] to-[#FFF6ED] dark:from-[#211E2A] dark:via-[#1E1B28] dark:to-[#262024] border border-[#EBE4F5] dark:border-[#383348] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2 z-10 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-[#18191F] dark:text-[#F3F4F6] tracking-tight">
              My Learning Rooms
            </h1>
            <span className="text-xl">📚</span>
          </div>
          <p className="text-xs sm:text-sm text-[#5D5F6B] dark:text-[#A0A2B0] max-w-md">
            Manage your persistent collaboration tables, schedule future meetings, and access past whiteboard sessions.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenCreateRoom}
          className="bg-[#543FE3] hover:bg-[#4330C8] active:scale-95 text-white font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-full transition-all flex items-center gap-2 shadow-sm cursor-pointer shrink-0 z-10"
        >
          <span>Create New Room</span>
          <span className="text-base font-bold leading-none">+</span>
        </button>
      </div>

      {/* 2. Filter Navigation Chips */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
        {filterTabs.map((tab) => {
          const isActive = activeFilter === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveFilter(tab.key)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[#543FE3] text-white shadow-xs'
                  : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 3. Rooms Listing */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="rounded-2xl border border-[var(--color-border)] p-6 space-y-3 bg-[var(--color-surface)] animate-pulse">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-full w-full mt-4" />
            </div>
          ))}
        </div>
      ) : rooms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => {
            const isHost = room.creatorId === user?.id;
            const isEnded = room.status === 'ENDED';
            const isScheduled = room.status === 'SCHEDULED';
            const tokenQuery = room.inviteToken ? `?token=${room.inviteToken}` : '';

            return (
              <div
                key={room.id}
                className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 flex flex-col justify-between gap-4 shadow-2xs hover:shadow-md transition-all relative overflow-hidden"
              >
                {/* Top tags */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EAE5FC] dark:bg-[#342D59] text-[#543FE3] dark:text-[#B6A8FF] uppercase">
                        {room.category === 'CUSTOM' ? room.customCategory || 'Custom' : room.category}
                      </span>
                      {isHost && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300">
                          👑 Creator (Host)
                        </span>
                      )}
                      <span className="text-[10px] text-[var(--color-text-secondary)]">
                        {room.isPrivate ? '🔒 Private' : '🌐 Public'}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isEnded
                          ? 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                          : isScheduled
                          ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600'
                          : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center gap-1'
                      }`}
                    >
                      {!isEnded && !isScheduled && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                      {room.status}
                    </span>
                  </div>

                  {/* Title & Code */}
                  <div>
                    <h3 className="font-heading font-bold text-base text-[var(--color-text-primary)] line-clamp-1">
                      {room.title}
                    </h3>
                    <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 mt-0.5">
                      {room.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Room Code Badge */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="font-mono text-xs font-bold text-[#543FE3] bg-[var(--color-surface-secondary)] px-2.5 py-1 rounded-lg border border-[var(--color-border)]">
                      #{room.roomCode || room.id.slice(0, 8)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyLink(room)}
                      className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] underline cursor-pointer"
                    >
                      {copiedRoomId === room.id ? 'Copied! ✓' : 'Copy Link'}
                    </button>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between gap-2">
                  <div className="text-[11px] text-[var(--color-text-secondary)]">
                    {room.participants?.length || 0} participant{room.participants?.length === 1 ? '' : 's'}
                  </div>

                  <div className="flex items-center gap-2">
                    {isHost && !isEnded && (
                      <button
                        type="button"
                        onClick={() => handleEndRoom(room.id)}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                        title="End meeting for all participants"
                      >
                        End Room
                      </button>
                    )}

                    {!isEnded ? (
                      <button
                        type="button"
                        onClick={() => onOpenRoom(`${room.roomCode || room.id}${tokenQuery}`)}
                        className="bg-[#543FE3] hover:bg-[#4330C8] active:scale-95 text-white font-semibold text-xs px-4 py-1.5 rounded-full shadow-2xs transition-all cursor-pointer"
                      >
                        Enter Room →
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Terminated</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-[var(--color-border)] p-12 text-center space-y-4 bg-[var(--color-surface)]">
          <div className="w-14 h-14 rounded-full bg-[#F3EEFE] dark:bg-[#252238] flex items-center justify-center text-2xl mx-auto">
            📁
          </div>
          <div className="space-y-1">
            <h3 className="font-heading font-bold text-base text-[var(--color-text-primary)]">
              {errorMessage
                ? 'Unable to load rooms'
                : `No rooms found in "${filterTabs.find((t) => t.key === activeFilter)?.label}"`}
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] max-w-sm mx-auto">
              {errorMessage || 'Start an instant study room or schedule a collaboration session for later.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenCreateRoom}
            className="inline-flex items-center gap-1.5 bg-[#543FE3] hover:bg-[#4330C8] text-white text-xs font-semibold px-5 py-2.5 rounded-full shadow-sm cursor-pointer"
          >
            <span>Create a Room</span>
            <span>+</span>
          </button>
        </div>
      )}
    </div>
  );
}
