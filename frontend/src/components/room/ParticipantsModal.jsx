import React, { useState } from 'react';
import { useRoom } from '../../context/RoomContext';

/**
 * ParticipantsModal Component
 * Real-time room participants roster displaying:
 * - Full list of all connected members in the live room
 * - Real-time media indicators (Mic, Camera, Hand Raise, Screen Share)
 * - Clear Host vs Participant badges
 * - Host-only participant moderation: "Kick / Remove from Room"
 */
export default function ParticipantsModal() {
  const {
    isMembersOpen,
    setIsMembersOpen,
    peers = [],
    currentUser,
    isHost,
    handleKickPeer,
    handleCopyInvite,
    copiedLink,
    isMuted,
    isVideoOn,
    isHandRaised,
    isScreenSharing,
  } = useRoom();

  const [searchQuery, setSearchQuery] = useState('');

  if (!isMembersOpen) return null;

  const totalMembers = peers.length + 1;

  // Filter peers by search query
  const filteredPeers = peers.filter((p) =>
    (p.name || 'Collaborator').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 sm:inset-auto sm:top-16 sm:right-4 z-[100002] flex items-center justify-center sm:block p-4 sm:p-0">
      {/* Backdrop for mobile */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs sm:hidden"
        onClick={() => setIsMembersOpen(false)}
      />

      <div className="relative w-full max-w-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col text-[var(--color-text-primary)] animate-in zoom-in-95 sm:fade-in sm:slide-in-from-top-4 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-surface-secondary)]/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#543FE3]/10 dark:bg-[#543FE3]/25 text-[#543FE3] flex items-center justify-center text-sm font-bold">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-sm text-[var(--color-text-primary)] flex items-center gap-2">
                <span>Room Members</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#543FE3] text-white">
                  {totalMembers}
                </span>
              </h3>
              <p className="text-[11px] text-[var(--color-text-secondary)]">
                {isHost ? 'You are the room host' : 'Live collaboration roster'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsMembersOpen(false)}
            className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
            title="Close members"
          >
            ✕
          </button>
        </div>

        {/* Search Input (if more than 2 participants) */}
        {totalMembers > 2 && (
          <div className="p-3 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search member by name..."
                className="w-full bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-xl px-3 py-1.5 text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[#543FE3]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-secondary)]"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}

        {/* Member Roster List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-[var(--color-border)] p-2">
          {/* 1. CURRENT USER (YOU) */}
          <div className="p-2.5 rounded-xl hover:bg-[var(--color-surface-secondary)]/50 transition-colors flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                {currentUser?.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser?.name || 'You'}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-[#543FE3]/40"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[#543FE3] text-white text-xs font-bold flex items-center justify-center">
                    {(currentUser?.name || 'Y').charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-[var(--color-surface)]" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-xs text-[var(--color-text-primary)] truncate max-w-[130px]">
                    {currentUser?.name || 'You'}
                  </span>
                  <span className="px-1.5 py-0.2 rounded-md text-[10px] font-bold bg-[#543FE3]/15 text-[#543FE3]">
                    You
                  </span>
                  {isHost && (
                    <span className="px-1.5 py-0.2 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                      Host
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[var(--color-text-secondary)]">
                  <span>{isMuted ? 'Muted' : 'Mic on'}</span>
                  <span>•</span>
                  <span>{isVideoOn ? 'Camera on' : 'Camera off'}</span>
                  {isScreenSharing && (
                    <>
                      <span>•</span>
                      <span className="text-[#543FE3] font-semibold">Presenting</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Status Icons */}
            <div className="flex items-center gap-1.5 shrink-0 text-xs">
              {isHandRaised && (
                <span title="Hand Raised" className="text-amber-500">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
                    <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
                    <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
                    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
                  </svg>
                </span>
              )}
              {isScreenSharing && (
                <span title="Sharing Screen" className="text-[#543FE3]">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                </span>
              )}
            </div>
          </div>

          {/* 2. REMOTE CONNECTED PEERS */}
          {filteredPeers.map((peer) => (
            <div
              key={peer.socketId}
              className="p-2.5 rounded-xl hover:bg-[var(--color-surface-secondary)]/50 transition-colors flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  {peer.avatar ? (
                    <img
                      src={peer.avatar}
                      alt={peer.name}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-[var(--color-border)]"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#3B82F6] text-white text-xs font-bold flex items-center justify-center">
                      {(peer.name || 'C').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-[var(--color-surface)]" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-xs text-[var(--color-text-primary)] truncate max-w-[130px]">
                      {peer.name || 'Collaborator'}
                    </span>
                    <span className="px-1.5 py-0.2 rounded-md text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                      Participant
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[var(--color-text-secondary)]">
                    <span>{peer.isAudioMuted ? 'Muted' : 'Mic on'}</span>
                    <span>•</span>
                    <span>{peer.isVideoOff ? 'Camera off' : 'Camera on'}</span>
                    {peer.isScreenSharing && (
                      <>
                        <span>•</span>
                        <span className="text-[#543FE3] font-semibold">Presenting</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Status Icons & Host Kick Button */}
              <div className="flex items-center gap-2 shrink-0">
                {peer.isHandRaised && (
                  <span title="Hand Raised" className="text-amber-500">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
                      <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
                      <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
                      <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
                    </svg>
                  </span>
                )}
                {peer.isScreenSharing && (
                  <span title="Presenting Screen" className="text-[#543FE3]">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                      <line x1="8" y1="21" x2="16" y2="21" />
                      <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                  </span>
                )}

                {/* Host Moderation: Kick Participant */}
                {isHost && (
                  <button
                    type="button"
                    onClick={() => handleKickPeer(peer.socketId, peer.name)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 text-[11px] font-bold border border-rose-200 dark:border-rose-900/40 transition-all cursor-pointer shadow-2xs"
                    title={`Remove ${peer.name} from the room`}
                  >
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                    <span>Kick</span>
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Empty State */}
          {filteredPeers.length === 0 && peers.length === 0 && (
            <div className="py-6 px-4 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] flex items-center justify-center mx-auto">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
              </div>
              <p className="text-xs font-semibold text-[var(--color-text-primary)]">
                You're the only one here
              </p>
              <p className="text-[11px] text-[var(--color-text-secondary)] max-w-xs mx-auto">
                Share the invite link with colleagues or friends to collaborate together in real-time.
              </p>
            </div>
          )}
        </div>

        {/* Footer: Quick Invite Link Button */}
        <div className="p-3 border-t border-[var(--color-border)] bg-[var(--color-surface-secondary)]/30 flex items-center justify-between gap-2">
          <span className="text-[11px] text-[var(--color-text-secondary)]">
            Invite colleagues:
          </span>
          <button
            type="button"
            onClick={handleCopyInvite}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#543FE3] hover:bg-[#4330C8] text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
            </svg>
            <span>{copiedLink ? 'Link Copied! ✓' : 'Copy Invite'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

