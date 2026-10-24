import React from 'react';

/**
 * QuickActionCard Component
 * Reusable actionable card with icon, title, description, and hover chevron.
 */
export default function QuickActionCard({
  title,
  description,
  icon,
  onClick,
  bgClass = 'bg-[#F3EEFE] dark:bg-[#252238]',
  borderClass = 'border-[#E8DFFD] dark:border-[#3A3358]',
  iconBgClass = 'bg-white dark:bg-[#322B4D]',
  iconColorClass = 'text-[#6C52EE]',
  className = '',
}) {
  return (
    <div
      onClick={onClick}
      className={`group ${bgClass} border ${borderClass} rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all select-none ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-10 h-10 rounded-xl ${iconBgClass} ${iconColorClass} flex items-center justify-center shrink-0 shadow-2xs`}>
          {icon}
        </div>
        <div className="min-w-0">
          <div className="font-bold text-sm text-[#18191F] dark:text-[#F3F4F6] truncate">
            {title}
          </div>
          <div className="text-xs text-[#6F7180] dark:text-[#9B9DAA] truncate">
            {description}
          </div>
        </div>
      </div>
      <div className={`w-7 h-7 rounded-full ${iconBgClass} flex items-center justify-center text-gray-500 shrink-0 group-hover:translate-x-1 transition-transform shadow-2xs`}>
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
    </div>
  );
}
