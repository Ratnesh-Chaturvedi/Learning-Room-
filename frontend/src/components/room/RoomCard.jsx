import React from 'react';
import AvatarStack from '../common/AvatarStack';

/**
 * RoomCard Component
 * Versatile room card with 3 variants:
 * - 'grid' (standard vertical card with thumbnail, status, and members)
 * - 'horizontal' (featured/active room banner with side thumbnail and join button)
 * - 'compact' (minimal list row for recently joined / quick access rooms)
 */
export default function RoomCard({
  variant = 'grid',
  title,
  subtitle,
  thumbnail,
  status = 'live', // 'live' | 'scheduled' | null
  members = '',
  time = '',
  avatarCount = '',
  avatars = undefined,
  onJoin,
  buttonText = 'Join Room →',
  className = '',
}) {
  // 1. Compact / Minimal List Variant
  if (variant === 'compact') {
    return (
      <div
        onClick={onJoin}
        className={`group bg-white dark:bg-[#1D1F26] border border-[#EAE5DE] dark:border-[#2D303A] rounded-2xl p-3 flex items-center justify-between cursor-pointer hover:shadow-xs hover:border-[#6C52EE]/40 transition-all select-none ${className}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <AvatarStack
            showLeadUser={false}
            avatars={
              avatars || [
                { label: 'D', bg: 'bg-blue-100 text-blue-700' },
                { label: 'K', bg: 'bg-indigo-100 text-indigo-700' },
              ]
            }
            size="sm"
          />
          <div className="min-w-0">
            <div className="font-bold text-xs text-[#18191F] dark:text-[#F3F4F6] truncate">
              {title}
            </div>
            {time && (
              <div className="text-[11px] text-[#717382] dark:text-[#9193A1] truncate">
                {time}
              </div>
            )}
          </div>
        </div>

        <div className="w-6 h-6 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:text-[#543FE3] group-hover:translate-x-0.5 transition-all shrink-0">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </div>
    );
  }

  // 2. Horizontal Variant (e.g., My Rooms preview on dashboard)
  if (variant === 'horizontal') {
    return (
      <div
        className={`bg-white dark:bg-[#1D1F26] border border-[#EAE5DE] dark:border-[#2D303A] rounded-2xl p-3.5 flex flex-col sm:flex-row gap-3.5 items-start sm:items-center shadow-xs hover:shadow-md transition-shadow select-none ${className}`}
      >
        {/* Thumbnail */}
        {thumbnail && (
          <div className="relative w-full sm:w-28 h-24 rounded-xl overflow-hidden shrink-0">
            <img
              src={thumbnail}
              alt={title}
              className="w-full h-full object-cover"
            />
            {status === 'live' && (
              <span className="absolute top-1.5 left-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-xs text-white">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            )}
          </div>
        )}

        {/* Room Info */}
        <div className="flex-1 min-w-0 space-y-1 w-full">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-[#18191F] dark:text-[#F3F4F6] truncate">
              {title}
            </h4>
            {members && (
              <span className="text-[11px] text-gray-400 flex items-center gap-1 shrink-0">
                👥 {members}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-[#5D5F6B] dark:text-[#A0A2B0] truncate">
              {subtitle}
            </p>
          )}

          {/* Avatars Stack & Join Button */}
          <div className="flex items-center justify-between pt-1">
            <AvatarStack
              size="sm"
              avatars={avatars}
              extraCount={avatarCount || '+2'}
            />

            <button
              type="button"
              onClick={onJoin}
              className="bg-[#543FE3] hover:bg-[#4330C8] active:scale-95 text-white font-medium text-xs px-3 py-1.5 rounded-full transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Grid / Card Variant (e.g. Trending rooms, Explore cards)
  return (
    <div
      onClick={onJoin}
      className={`group bg-white dark:bg-[#1D1F26] border border-[#EAE5DE] dark:border-[#2D303A] rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-[#6C52EE]/40 transition-all cursor-pointer flex flex-col justify-between select-none ${className}`}
    >
      <div>
        {/* Thumbnail */}
        {thumbnail && (
          <div className="relative w-full h-36 overflow-hidden">
            <img
              src={thumbnail}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {status === 'live' ? (
              <span className="absolute top-2 left-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-xs text-white">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            ) : status === 'scheduled' ? (
              <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-xs text-white">
                <span>⏱</span>
                Scheduled
              </span>
            ) : null}
          </div>
        )}

        {/* Card Body */}
        <div className="p-3.5 space-y-1">
          <h4 className="font-heading font-bold text-sm text-[#18191F] dark:text-[#F3F4F6] truncate">
            {title}
          </h4>
          {subtitle && (
            <p className="text-xs text-[#5D5F6B] dark:text-[#A0A2B0] truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Card Footer: Avatars + Members count + Chevron button */}
      <div className="px-3.5 pb-3.5 pt-1 flex items-center justify-between border-t border-[#F2EEE9] dark:border-[#262833]">
        <div className="flex items-center gap-2">
          <AvatarStack
            size="sm"
            avatars={avatars}
            extraCount={avatarCount || '+6'}
          />
          {members && (
            <span className="text-[11px] text-gray-400">
              {members}
            </span>
          )}
        </div>

        <div className="w-6 h-6 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:text-[#543FE3] group-hover:translate-x-0.5 transition-all shadow-2xs">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </div>
    </div>
  );
}
