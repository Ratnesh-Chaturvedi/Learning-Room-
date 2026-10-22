import React, { useState } from 'react';

/**
 * HeroSection Component
 * Visual headline, tactile call-to-actions, room code form, and social proof
 */
export default function HeroSection({ onStartRoom, onJoinRoom }) {
  const [roomCode, setRoomCode] = useState('');

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    if (roomCode.trim()) {
      onJoinRoom(roomCode.trim());
    }
  };

  return (
    <section className="relative z-10 px-5 pt-8 sm:pt-12 pb-3 sm:pb-5 text-center scroll-mt-20" id="home">
      <div className="mx-auto flex max-w-[880px] flex-col items-center">
        {/* Main Editorial Headline */}
        <h1 className="font-editorial text-3xl sm:text-5xl md:text-[54px] font-normal leading-[1.18] tracking-[-0.02em] text-[var(--color-text-primary)] mb-4">
          <span className="opacity-80">‘</span>
          <span className="font-bold">Learn together, </span>
          <span className="italic font-medium">like sitting </span>
          <span>at the same </span>
          <span className="relative inline-block whitespace-nowrap">
            <span className="font-bold">table.</span>
            <span className="opacity-80">’</span>
            {/* Hand-drawn sketch underline */}
            <svg
              className="absolute -bottom-2.5 -left-1 w-[105%] h-3.5 pointer-events-none text-[var(--color-text-primary)]"
              viewBox="0 0 160 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M3 10C35 4 95 3 157 7"
                stroke="currentColor"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
              <path
                d="M12 13C45 9 105 8 148 11"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                opacity="0.85"
              />
              <path
                d="M25 15C55 12 90 12 130 14"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                opacity="0.6"
              />
            </svg>
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-[15.5px] sm:text-base leading-[1.65] text-[var(--color-text-secondary)] max-w-[560px] mb-7">
          Pull up a chair at a persistent shared table. Combine live sketching,
          instant chat, and video in one calm, tactile space.
        </p>

        {/* Action Controls & Hand-drawn "It's free!" Doodle */}
        <div className="relative inline-flex items-center mb-6">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {/* Start a Room CTA */}
            <button
              type="button"
              onClick={onStartRoom}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white px-6 py-2.5 text-[15px] font-semibold shadow-md hover:shadow-lg transition-all duration-150 active:scale-[0.98]"
            >
              <span>Start a Room</span>
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>

            {/* Room Code Input with embedded Join Button */}
            <form
              onSubmit={handleJoinSubmit}
              className="flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] py-1 pl-4 pr-1.5 shadow-sm focus-within:border-[var(--color-brand)] focus-within:ring-2 focus-within:ring-[var(--color-brand)]/20 transition-all"
            >
              <input
                type="text"
                placeholder="Enter room code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                maxLength={12}
                className="w-36 bg-transparent text-sm outline-none text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] font-mono"
                aria-label="Room code"
              />
              <button
                type="submit"
                disabled={!roomCode.trim()}
                className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-secondary)] hover:bg-[var(--color-surface-hover)] px-4 py-1.5 text-xs font-semibold text-[var(--color-text-primary)] disabled:opacity-50 transition-all cursor-pointer"
              >
                Join
              </button>
            </form>
          </div>

          {/* Whimsical "It's free!" Doodle Arrow & Stars (enlarged & floating) */}
          <div
            className="hidden sm:flex absolute left-[calc(100%+12px)] -top-4 items-center gap-2 select-none pointer-events-none text-[var(--color-text-primary)] animate-float-slow"
            aria-hidden="true"
          >
            <svg
              className="opacity-90 text-[var(--color-text-primary)]"
              width="54"
              height="42"
              viewBox="0 0 50 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M44 4C35 12 20 22 6 30"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <path
                d="M14 26L4 31L7 20"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="flex items-center gap-1.5 font-handwriting text-2xl sm:text-3xl xl:text-[34px] font-bold -rotate-3 text-[var(--color-text-primary)] drop-shadow-2xs">
              <span className="text-amber-400 text-xl">★</span>
              <span className="tracking-wide">It's free!</span>
              <span className="text-amber-400 text-xl">☆</span>
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="flex items-center gap-3 mt-1.5">
          <div className="flex items-center">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&h=96&fit=crop&crop=faces&q=80"
              alt="Maya avatar"
              className="h-6 w-6 rounded-full border-2 border-[var(--color-surface)] object-cover shadow-sm -ml-1.5 first:ml-0"
            />
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=faces&q=80"
              alt="Rohan avatar"
              className="h-6 w-6 rounded-full border-2 border-[var(--color-surface)] object-cover shadow-sm -ml-1.5"
            />
            <img
              src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=96&h=96&fit=crop&crop=faces&q=80"
              alt="Elena avatar"
              className="h-6 w-6 rounded-full border-2 border-[var(--color-surface)] object-cover shadow-sm -ml-1.5"
            />
          </div>
          <span className="text-xs sm:text-[13px] text-[var(--color-text-secondary)]">
            Over <strong className="font-semibold text-[var(--color-text-primary)]">10,000+</strong> teams and study groups collaborate live.
          </span>
        </div>
      </div>
    </section>
  );
}
