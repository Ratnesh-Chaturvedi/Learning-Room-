import React from 'react';
import { ratneshAvatar } from '../../assets';

/**
 * AvatarStack Component
 * Displays an overlapping cluster of user avatars with optional initials and +N badge.
 */
export default function AvatarStack({
  showLeadUser = true,
  leadAvatar = ratneshAvatar,
  leadAlt = 'user',
  avatars = [
    { label: 'A', bg: 'bg-purple-200 text-purple-700' },
    { label: 'R', bg: 'bg-amber-200 text-amber-700' },
    { label: 'S', bg: 'bg-emerald-200 text-emerald-700' },
  ],
  extraCount = '',
  size = 'md', // 'sm' | 'md'
}) {
  const sizeClasses = size === 'sm' ? 'w-5 h-5 text-[9px]' : 'w-6 h-6 text-[10px]';

  const defaultAvatars = [
    { label: 'A', bg: 'bg-purple-200 text-purple-700' },
    { label: 'R', bg: 'bg-amber-200 text-amber-700' },
    { label: 'S', bg: 'bg-emerald-200 text-emerald-700' },
  ];

  const items = Array.isArray(avatars) && avatars.length > 0 ? avatars : defaultAvatars;

  return (
    <div className="flex items-center -space-x-1.5 shrink-0 select-none">
      {showLeadUser && leadAvatar && (
        <img
          src={leadAvatar}
          alt={leadAlt}
          className={`${sizeClasses} rounded-full ring-2 ring-white dark:ring-[#1D1F26] object-cover`}
        />
      )}
      {items.map((av, idx) => (
        <div
          key={idx}
          className={`${sizeClasses} rounded-full ring-2 ring-white dark:ring-[#1D1F26] flex items-center justify-center font-bold ${
            av.bg || 'bg-gray-200 text-gray-700'
          }`}
        >
          {av.label}
        </div>
      ))}
      {extraCount && (
        <div
          className={`${sizeClasses} rounded-full bg-gray-200 dark:bg-gray-700 ring-2 ring-white dark:ring-[#1D1F26] flex items-center justify-center font-bold text-gray-600 dark:text-gray-300`}
        >
          {extraCount}
        </div>
      )}
    </div>
  );
}
