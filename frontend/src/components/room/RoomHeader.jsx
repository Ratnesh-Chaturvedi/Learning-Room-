import React, { useState } from 'react';
import { useRoom } from '../../context/RoomContext';
import { useTheme } from '../../context/ThemeContext';
import { learningRoomLogo } from '../../assets';

/**
 * RoomHeader Component
 * Immersive room top navigation bar with:
 * - Dashboard exit navigation
 * - Editable Room Title
 * - 1-click #roomId invite link copy
 * - Live meet audio indicator & call timer
 * - Dynamic connected collaborators presence (real peers & avatars)
 * - Mic, Camera, and Floating Video Gallery toggles
 * - Quick emoji reactions & hand raise
 * - Live chat toggle button with dynamic message count
 * - Dark / Light theme toggle
 * - Responsive mobile drawer menu for compact screens
 */
export default function RoomHeader(props = {}) {
  const room = useRoom() || {};
  const themeContext = useTheme() || {};

  const roomId = props.roomId ?? room.roomId;
  const roomTitle = props.roomTitle ?? room.roomTitle;
  const setRoomTitle = props.setRoomTitle ?? room.setRoomTitle;
  const isEditingTitle = props.isEditingTitle ?? room.isEditingTitle;
  const setIsEditingTitle = props.setIsEditingTitle ?? room.setIsEditingTitle;
  const copiedLink = props.copiedLink ?? room.copiedLink;
  const handleCopyInvite = props.handleCopyInvite ?? room.handleCopyInvite;
  const isMuted = props.isMuted ?? room.isMuted;
  const setIsMuted = props.setIsMuted ?? room.handleToggleMute;
  const isVideoOn = props.isVideoOn ?? room.isVideoOn;
  const setIsVideoOn = props.setIsVideoOn ?? room.handleToggleVideo;
  const isHandRaised = props.isHandRaised ?? room.isHandRaised;
  const setIsHandRaised = props.setIsHandRaised ?? room.handleToggleHand;
  const activeCallTime = props.activeCallTime ?? room.activeCallTime ?? 0;
  const formatCallTime = props.formatCallTime ?? room.formatCallTime;
  const triggerReaction = props.triggerReaction ?? room.triggerReaction;
  const isChatOpen = props.isChatOpen ?? room.isChatOpen;
  const setIsChatOpen = props.setIsChatOpen ?? room.setIsChatOpen;
  const unreadChatCount = props.unreadChatCount ?? room.chatMessages?.length ?? 0;
  const peers = props.peers ?? room.peers ?? [];
  const currentUser = props.currentUser ?? room.currentUser;
  const isVideoGalleryOpen = props.isVideoGalleryOpen ?? room.isVideoGalleryOpen;
  const onToggleVideoGallery = props.onToggleVideoGallery ?? (() => room.setIsVideoGalleryOpen?.((prev) => !prev));
  const theme = props.theme ?? room.roomTheme ?? themeContext.theme;
  const onToggleTheme = props.onToggleTheme ?? room.handleToggleRoomTheme ?? themeContext.toggleTheme;
  const onLeaveRoom = props.onLeaveRoom ?? room.handleLeaveRoom;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const totalConnected = (peers?.length || 0) + 1;

  return (
    <header className="h-14 sm:h-16 px-2 sm:px-4 md:px-5 border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-md flex items-center justify-between gap-1.5 sm:gap-3 shrink-0 z-40 shadow-xs max-w-full overflow-visible">
      {/* Left: Back button + Brand logo + Room Name + Code pill */}
      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 shrink">
        {/* Back to Dashboard */}
        <button
          type="button"
          onClick={onLeaveRoom}
          className="flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] transition-all cursor-pointer shrink-0"
          title="Return to Dashboard"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          <span className="hidden md:inline">Dashboard</span>
        </button>

        <div className="h-4 w-px bg-[var(--color-border)] hidden sm:block shrink-0" />

        {/* Logo icon */}
        <img
          src={learningRoomLogo}
          alt="Learning Room"
          className="w-6 h-6 object-contain hidden md:block shrink-0 drop-shadow-2xs cursor-pointer"
          onClick={onLeaveRoom}
        />

        {/* Room Title & Room ID Badge */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          {isEditingTitle ? (
            <input
              type="text"
              value={roomTitle}
              autoFocus
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
              onChange={(e) => setRoomTitle(e.target.value)}
              className="font-heading font-extrabold text-xs sm:text-base bg-[var(--color-surface-secondary)] border border-[var(--color-brand)] rounded px-1.5 py-0.5 outline-none max-w-[110px] sm:max-w-[280px]"
            />
          ) : (
            <h1
              onClick={() => setIsEditingTitle(true)}
              className="font-heading font-extrabold text-xs sm:text-sm md:text-base text-[var(--color-text-primary)] truncate max-w-[85px] xs:max-w-[120px] sm:max-w-[200px] md:max-w-none cursor-pointer hover:underline decoration-dotted"
              title={`${roomTitle} (Click to rename)`}
            >
              {roomTitle}
            </h1>
          )}

          {/* Room ID Badge with 1-click Copy */}
          <button
            type="button"
            onClick={handleCopyInvite}
            className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-mono font-bold bg-[var(--color-surface-secondary)] border border-[var(--color-border)] hover:border-[var(--color-brand)] text-[var(--color-brand)] transition-all shrink-0 cursor-pointer"
            title="Copy link to invite friends"
          >
            <span>#{roomId}</span>
            <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
            </svg>
            {copiedLink && (
              <span className="text-[9px] sm:text-[10px] text-emerald-600 dark:text-emerald-400 font-sans font-bold">
                ✓
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Center: Live Call Badge + Real Connected Collaborators (Large screens only) */}
      <div className="hidden lg:flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 text-xs font-semibold shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Audio & Video</span>
          <span className="font-mono text-[11px] opacity-75">• {formatCallTime(activeCallTime)}</span>
        </div>

        {/* Real Dynamic Collaborator Avatars */}
        <div
          className="flex items-center -space-x-1.5"
          title={`${totalConnected} participant${totalConnected > 1 ? 's' : ''} in room`}
        >
          {/* Current User */}
          {currentUser?.avatar ? (
            <img
              src={currentUser.avatar}
              alt={currentUser?.name || 'You'}
              className="w-6 h-6 rounded-full object-cover ring-2 ring-[var(--color-surface)] shadow-xs"
              title={`${currentUser?.name || 'You'} (You)`}
            />
          ) : (
            <div
              className="w-6 h-6 rounded-full bg-[#543FE3] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-[var(--color-surface)] shadow-xs"
              title={`${currentUser?.name || 'You'} (You)`}
            >
              {(currentUser?.name || 'Y').charAt(0).toUpperCase()}
            </div>
          )}

          {/* Remote Connected Peers */}
          {peers.slice(0, 3).map((peer) =>
            peer.avatar ? (
              <img
                key={peer.socketId}
                src={peer.avatar}
                alt={peer.name}
                className="w-6 h-6 rounded-full object-cover ring-2 ring-[var(--color-surface)] shadow-xs"
                title={`${peer.name}${peer.isAudioMuted ? ' (Muted)' : ' (Active)'}`}
              />
            ) : (
              <div
                key={peer.socketId}
                className="w-6 h-6 rounded-full bg-[#3B82F6] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-[var(--color-surface)] shadow-xs"
                title={`${peer.name}${peer.isAudioMuted ? ' (Muted)' : ' (Active)'}`}
              >
                {(peer.name || 'C').charAt(0).toUpperCase()}
              </div>
            )
          )}

          {peers.length > 3 && (
            <span className="w-6 h-6 rounded-full bg-[var(--color-brand)] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-[var(--color-surface)]">
              +{peers.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Right: Controls, Video Gallery, Chat & Leave Room */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Microphone Mute Toggle */}
        <button
          type="button"
          onClick={() => setIsMuted((prev) => !prev)}
          className={`p-1.5 sm:p-2 rounded-full transition-all cursor-pointer ${
            isMuted
              ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/80 dark:text-rose-400'
              : 'bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]'
          }`}
          title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
        >
          {isMuted ? (
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="2" y1="2" x2="22" y2="22" />
              <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2" />
              <path d="M5 10v2a7 7 0 0 0 12 5" />
              <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33" />
              <path d="M9 9v3a3 3 0 0 0 5.12 2.12" />
              <line x1="12" y1="19" x2="12" y2="22" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="22" />
            </svg>
          )}
        </button>

        {/* Camera Video Toggle */}
        <button
          type="button"
          onClick={() => {
            setIsVideoOn((prev) => !prev);
            if (onToggleVideoGallery && !isVideoGalleryOpen) {
              onToggleVideoGallery();
            }
          }}
          className={`p-1.5 sm:p-2 rounded-full transition-all cursor-pointer ${
            !isVideoOn
              ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/80 dark:text-rose-400'
              : 'bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]'
          }`}
          title={isVideoOn ? 'Turn Camera Off' : 'Turn Camera On'}
        >
          {isVideoOn ? (
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m22 8-6 4 6 4V8Z" />
              <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="2" y1="2" x2="22" y2="22" />
              <path d="M10.66 6H14a2 2 0 0 1 2 2v2.34l1 1L22 8v8" />
              <path d="M16 16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2" />
            </svg>
          )}
        </button>

        {/* Dedicated Video Grid Popup Toggle */}
        {onToggleVideoGallery && (
          <button
            type="button"
            onClick={onToggleVideoGallery}
            className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              isVideoGalleryOpen
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]'
            }`}
            title={isVideoGalleryOpen ? 'Hide Video Popup' : 'Show Video Popup (Faces & Webcams)'}
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            <span className="hidden xl:inline">Video Grid</span>
          </button>
        )}

        {/* Hand Raise Reaction (Desktop & Tablet) */}
        <button
          type="button"
          onClick={() => {
            setIsHandRaised((prev) => !prev);
            triggerReaction('✋');
          }}
          className={`hidden sm:flex p-2 rounded-full transition-all cursor-pointer ${
            isHandRaised
              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 ring-2 ring-amber-400'
              : 'bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]'
          }`}
          title="Raise Hand"
        >
          <span className="text-sm">✋</span>
        </button>

        {/* Quick Reaction Emojis Dropdown (Desktop & Tablet) */}
        <div className="hidden md:flex items-center gap-0.5 bg-[var(--color-surface-secondary)] rounded-full px-1.5 py-0.5 border border-[var(--color-border)]">
          {['❤️', '👏', '💡', '🔥', '🚀'].map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => triggerReaction(emoji)}
              className="hover:scale-125 transition-transform text-xs p-1 cursor-pointer"
              title={`Send ${emoji} reaction`}
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Side Chat Toggle Button */}
        <button
          type="button"
          onClick={() => setIsChatOpen((prev) => !prev)}
          className={`flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            isChatOpen
              ? 'bg-[var(--color-brand)] text-white shadow-xs'
              : 'bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]'
          }`}
          title="Toggle Live Chat"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span className="hidden md:inline">Chat</span>
          {unreadChatCount > 0 && (
            <span className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center ${isChatOpen ? 'bg-white text-[var(--color-brand)]' : 'bg-[var(--color-brand)] text-white'}`}>
              {unreadChatCount}
            </span>
          )}
        </button>

        {/* Theme Toggle (Desktop & Tablet) */}
        <button
          type="button"
          onClick={onToggleTheme}
          className="hidden sm:flex p-2 rounded-full bg-[var(--color-surface-secondary)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
          title="Switch Theme"
        >
          {theme === 'dark' ? (
            <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-gray-700" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            </svg>
          )}
        </button>

        {/* Mobile "More" Menu Toggle (Only on mobile <sm) */}
        <div className="relative sm:hidden">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              isMobileMenuOpen
                ? 'bg-[var(--color-brand)] text-white'
                : 'bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'
            }`}
            title="More options"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1" />
              <circle cx="12" cy="5" r="1" />
              <circle cx="12" cy="19" r="1" />
            </svg>
          </button>

          {/* Mobile Dropdown Popup */}
          {isMobileMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl p-2 z-50 flex flex-col gap-1.5 animate-in fade-in zoom-in-95">
              {/* Video Grid Toggle on Mobile */}
              {onToggleVideoGallery && (
                <button
                  type="button"
                  onClick={() => {
                    onToggleVideoGallery();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-[var(--color-surface-hover)] text-[var(--color-text-primary)]"
                >
                  <span className="flex items-center gap-2">
                    <span>📹</span>
                    <span>Video Gallery</span>
                  </span>
                  {isVideoGalleryOpen && <span className="text-[10px] text-emerald-600 font-bold">Open</span>}
                </button>
              )}

              {/* Hand Raise */}
              <button
                type="button"
                onClick={() => {
                  setIsHandRaised((prev) => !prev);
                  triggerReaction('✋');
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-[var(--color-surface-hover)] text-[var(--color-text-primary)]"
              >
                <span className="flex items-center gap-2">
                  <span>✋</span>
                  <span>Raise Hand</span>
                </span>
                {isHandRaised && <span className="text-[10px] text-amber-600 font-bold">Active</span>}
              </button>

              {/* Theme Toggle */}
              <button
                type="button"
                onClick={() => {
                  onToggleTheme();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-[var(--color-surface-hover)] text-[var(--color-text-primary)]"
              >
                <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>

              {/* Reactions */}
              <div className="pt-1.5 border-t border-[var(--color-border)]">
                <span className="text-[10px] text-[var(--color-text-secondary)] px-1 font-semibold">Reactions</span>
                <div className="flex items-center justify-between pt-1">
                  {['❤️', '👏', '💡', '🔥', '🚀'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        triggerReaction(emoji);
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-sm p-1 hover:scale-125 transition-transform"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Leave Room Button */}
        <button
          type="button"
          onClick={onLeaveRoom}
          className="flex items-center gap-1 p-1.5 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
          title="Leave room"
        >
          <span className="hidden sm:inline">Leave</span>
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </header>
  );
}
