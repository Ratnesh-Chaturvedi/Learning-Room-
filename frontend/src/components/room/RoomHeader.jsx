import React, { useState } from 'react';
import { useRoom } from '../../context/RoomContext';
import { useTheme } from '../../context/ThemeContext';
import { learningRoomLogo } from '../../assets';

// Room top header with meeting controls and navigation
export default function RoomHeader(props = {}) {
  const room = useRoom() || {};
  const themeContext = useTheme() || {};

  const roomId = props.roomId ?? room.roomId;
  const roomTitle = props.roomTitle ?? room.roomTitle;
  const setRoomTitle = props.setRoomTitle ?? room.setRoomTitle;
  const isSocketConnected = props.isSocketConnected ?? room.isSocketConnected ?? true;
  const isEditingTitle = props.isEditingTitle ?? room.isEditingTitle;
  const setIsEditingTitle = props.setIsEditingTitle ?? room.setIsEditingTitle;
  const copiedLink = props.copiedLink ?? room.copiedLink;
  const handleCopyInvite = props.handleCopyInvite ?? room.handleCopyInvite;
  const isMuted = props.isMuted ?? room.isMuted;
  const handleToggleMute = props.setIsMuted ?? room.handleToggleMute;
  const isVideoOn = props.isVideoOn ?? room.isVideoOn;
  const handleToggleVideo = props.setIsVideoOn ?? room.handleToggleVideo;
  const isHandRaised = props.isHandRaised ?? room.isHandRaised;
  const handleToggleHand = props.setIsHandRaised ?? room.handleToggleHand;
  const isChatOpen = props.isChatOpen ?? room.isChatOpen;
  const setIsChatOpen = props.setIsChatOpen ?? room.setIsChatOpen;
  const unreadChatCount = props.unreadChatCount ?? room.chatMessages?.length ?? 0;
  const peers = props.peers ?? room.peers ?? [];
  const currentUser = props.currentUser ?? room.currentUser;
  const isVideoGalleryOpen = props.isVideoGalleryOpen ?? room.isVideoGalleryOpen;
  const onToggleVideoGallery = props.onToggleVideoGallery ?? (() => room.setIsVideoGalleryOpen?.((prev) => !prev));
  const isScreenSharing = props.isScreenSharing ?? room.isScreenSharing ?? false;
  const onToggleScreenShare = props.onToggleScreenShare ?? room.toggleScreenShare;
  const isMembersOpen = props.isMembersOpen ?? room.isMembersOpen ?? false;
  const setIsMembersOpen = props.setIsMembersOpen ?? room.setIsMembersOpen;
  const theme = props.theme ?? room.roomTheme ?? themeContext.theme;
  const onToggleTheme = props.onToggleTheme ?? room.handleToggleRoomTheme ?? themeContext.toggleTheme;
  const onLeaveRoom = props.onLeaveRoom ?? room.handleLeaveRoom;
  const isHost = props.isHost ?? room.isHost ?? false;
  const onEndRoomForAll = props.onEndRoomForAll ?? room.handleEndRoomForAll;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const totalConnected = (peers?.length || 0) + 1;

  return (
    <>
      {/* 1. TOP ROOM NAVIGATION HEADER */}
      <header className="h-14 sm:h-16 px-2.5 sm:px-4 md:px-5 border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-md flex items-center justify-between gap-1.5 sm:gap-3 shrink-0 z-40 shadow-xs max-w-full overflow-hidden">
        {/* Left: Back button + Brand logo + Room Name + Code pill */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 shrink">
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
            <span className="hidden lg:inline">Dashboard</span>
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
          <div className="flex items-center gap-1.5 min-w-0">
            {isEditingTitle ? (
              <input
                type="text"
                value={roomTitle}
                autoFocus
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                onChange={(e) => setRoomTitle(e.target.value)}
                className="font-heading font-extrabold text-xs sm:text-base bg-[var(--color-surface-secondary)] border border-[var(--color-brand)] rounded px-1.5 py-0.5 outline-none max-w-[90px] xs:max-w-[130px] sm:max-w-[240px]"
              />
            ) : (
              <h1
                onClick={() => setIsEditingTitle(true)}
                className="font-heading font-extrabold text-xs sm:text-sm md:text-base text-[var(--color-text-primary)] truncate max-w-[70px] xs:max-w-[110px] sm:max-w-[180px] md:max-w-none cursor-pointer hover:underline decoration-dotted"
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

        {/* Center: Connected Collaborators (Desktop & Laptop) */}
        <div className="hidden lg:flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-xs font-semibold shadow-2xs">
            <span className={`w-2 h-2 rounded-full ${isSocketConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="text-[11px] font-medium text-[var(--color-text-secondary)]">
              {isSocketConnected ? 'Live' : 'Connecting'}
            </span>
          </div>

          {/* Real Dynamic Collaborator Avatars (Click to open Members roster) */}
          <div
            onClick={() => setIsMembersOpen?.((prev) => !prev)}
            className="flex items-center -space-x-1.5 cursor-pointer hover:opacity-85 transition-opacity"
            title={`Click to view all ${totalConnected} room members and moderation controls`}
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

        {/* Right Section: Mobile pills + Desktop full controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 shrink-0">
          {/* MOBILE ONLY: Live Status / Members Quick Pill */}
          <button
            type="button"
            onClick={() => setIsMembersOpen?.((prev) => !prev)}
            className="sm:hidden flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all cursor-pointer"
            title="View members"
          >
            <span className={`w-2 h-2 rounded-full ${isSocketConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span>{totalConnected}</span>
            <svg className="w-3 h-3 text-[var(--color-text-secondary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
          </button>

          {/* MOBILE ONLY: Header End / Leave button */}
          {isHost ? (
            <button
              type="button"
              onClick={onEndRoomForAll}
              className="sm:hidden flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold transition-all shadow-xs cursor-pointer"
              title="End meeting for all participants"
            >
              <span>End</span>
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <rect width="14" height="14" x="5" y="5" rx="2" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={onLeaveRoom}
              className="sm:hidden flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold transition-all shadow-xs cursor-pointer"
              title="Leave room"
            >
              <span>Leave</span>
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          )}

          {/* DESKTOP & TABLET CONTROLS (Hidden on mobile < 640px) */}
          {/* Microphone Mute Toggle */}
          <button
            type="button"
            onClick={() => handleToggleMute()}
            className={`hidden sm:flex p-1.5 sm:p-2 rounded-full transition-all cursor-pointer ${
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
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
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
              handleToggleVideo();
              if (onToggleVideoGallery && !isVideoGalleryOpen) {
                onToggleVideoGallery();
              }
            }}
            className={`hidden sm:flex p-1.5 sm:p-2 rounded-full transition-all cursor-pointer ${
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

          {/* Screen Sharing Toggle (Tablet & Desktop: inline) */}
          {onToggleScreenShare && (
            <button
              type="button"
              onClick={onToggleScreenShare}
              className={`hidden sm:flex p-1.5 sm:p-2 rounded-full transition-all cursor-pointer ${
                isScreenSharing
                  ? 'bg-[#543FE3] text-white shadow-md shadow-indigo-500/30 ring-2 ring-[#543FE3]/50 animate-pulse'
                  : 'bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]'
              }`}
              title={isScreenSharing ? 'Stop Screen Sharing' : 'Share Screen (Google Meet style)'}
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="14" x="2" y="3" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
                <path d="m16 9-4-4-4 4" />
                <path d="M12 5v8" />
              </svg>
            </button>
          )}

          {/* Dedicated Video Grid Popup Toggle (Tablet & Desktop: inline) */}
          {onToggleVideoGallery && (
            <button
              type="button"
              onClick={onToggleVideoGallery}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
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

          {/* Members Roster Toggle (Tablet & Desktop: inline) */}
          <button
            type="button"
            onClick={() => setIsMembersOpen?.((prev) => !prev)}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              isMembersOpen
                ? 'bg-[#543FE3] text-white shadow-xs'
                : 'bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]'
            }`}
            title="View all room members and moderation controls"
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span className="hidden lg:inline">Members</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              isMembersOpen ? 'bg-white/20 text-white' : 'bg-[#543FE3]/15 text-[#543FE3]'
            }`}>
              {totalConnected}
            </span>
          </button>

          {/* Hand Raise (Desktop & Tablet) */}
          <button
            type="button"
            onClick={handleToggleHand}
            className={`hidden sm:flex p-1.5 sm:p-2 rounded-full transition-all cursor-pointer ${
              isHandRaised
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 ring-2 ring-amber-400'
                : 'bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]'
            }`}
            title={isHandRaised ? 'Lower Hand' : 'Raise Hand'}
            aria-label={isHandRaised ? 'Lower Hand' : 'Raise Hand'}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
              <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
              <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
              <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
            </svg>
          </button>

          {/* Side Chat Toggle Button (Desktop & Tablet) */}
          <button
            type="button"
            onClick={() => setIsChatOpen((prev) => !prev)}
            className={`hidden sm:flex items-center gap-1 p-1.5 sm:px-3 sm:py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              isChatOpen
                ? 'bg-[var(--color-brand)] text-white shadow-xs'
                : 'bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]'
            }`}
            title="Toggle Live Chat"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span className="hidden lg:inline">Chat</span>
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

          {/* Action Button (Desktop): End Meeting (Host) or Leave (Participant) */}
          {isHost ? (
            <button
              type="button"
              onClick={onEndRoomForAll}
              className="hidden sm:flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
              title="End meeting for all participants"
            >
              <span className="hidden lg:inline">End Meeting</span>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <rect width="14" height="14" x="5" y="5" rx="2" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={onLeaveRoom}
              className="hidden sm:flex items-center gap-1 p-1.5 sm:px-3 sm:py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
              title="Leave room"
            >
              <span className="hidden lg:inline">Leave</span>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          )}
        </div>
      </header>

      {/* 2. DEDICATED MOBILE BOTTOM MEETING CONTROLS DOCK (< 640px) */}
      <nav
        aria-label="Mobile Meeting Controls"
        className="sm:hidden fixed bottom-3 inset-x-3 z-40 bg-[var(--color-surface)]/95 backdrop-blur-xl rounded-2xl border border-[var(--color-border)] shadow-2xl p-1.5 flex items-center justify-around gap-1 max-w-md mx-auto"
      >
        {/* 1. Mic Mute / Unmute */}
        <button
          type="button"
          onClick={() => handleToggleMute()}
          className={`flex-1 py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer min-h-[46px] ${
            isMuted
              ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/80 dark:text-rose-400'
              : 'text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]'
          }`}
          title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
        >
          {isMuted ? (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="2" y1="2" x2="22" y2="22" />
              <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2" />
              <path d="M5 10v2a7 7 0 0 0 12 5" />
              <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33" />
              <path d="M9 9v3a3 3 0 0 0 5.12 2.12" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="22" />
            </svg>
          )}
          <span className="text-[10px] font-semibold leading-tight">{isMuted ? 'Muted' : 'Mic On'}</span>
        </button>

        {/* 2. Camera On / Off */}
        <button
          type="button"
          onClick={() => {
            handleToggleVideo();
            if (onToggleVideoGallery && !isVideoGalleryOpen) {
              onToggleVideoGallery();
            }
          }}
          className={`flex-1 py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer min-h-[46px] ${
            !isVideoOn
              ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/80 dark:text-rose-400'
              : 'text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]'
          }`}
          title={isVideoOn ? 'Turn Camera Off' : 'Turn Camera On'}
        >
          {isVideoOn ? (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m22 8-6 4 6 4V8Z" />
              <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
            </svg>
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="2" y1="2" x2="22" y2="22" />
              <path d="M10.66 6H14a2 2 0 0 1 2 2v2.34l1 1L22 8v8" />
              <path d="M16 16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2" />
            </svg>
          )}
          <span className="text-[10px] font-semibold leading-tight">{isVideoOn ? 'Camera' : 'Cam Off'}</span>
        </button>

        {/* 3. Video Grid Toggle (Faces & Screens) */}
        {onToggleVideoGallery && (
          <button
            type="button"
            onClick={onToggleVideoGallery}
            className={`flex-1 py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 relative transition-all cursor-pointer min-h-[46px] ${
              isVideoGalleryOpen
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]'
            }`}
            title="Toggle Video Grid"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            <span className="text-[10px] font-semibold leading-tight">Video</span>
            {totalConnected > 0 && (
              <span className={`absolute top-1 right-1.5 px-1 py-0.2 rounded-full text-[9px] font-bold ${isVideoGalleryOpen ? 'bg-white text-emerald-700' : 'bg-emerald-600 text-white'}`}>
                {totalConnected}
              </span>
            )}
          </button>
        )}

        {/* 4. Live Chat Toggle */}
        <button
          type="button"
          onClick={() => setIsChatOpen((prev) => !prev)}
          className={`flex-1 py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 relative transition-all cursor-pointer min-h-[46px] ${
            isChatOpen
              ? 'bg-[var(--color-brand)] text-white shadow-xs'
              : 'text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]'
          }`}
          title="Toggle Live Chat"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span className="text-[10px] font-semibold leading-tight">Chat</span>
          {unreadChatCount > 0 && (
            <span className={`absolute top-1 right-1.5 px-1 py-0.2 rounded-full text-[9px] font-bold ${isChatOpen ? 'bg-white text-[var(--color-brand)]' : 'bg-[var(--color-brand)] text-white'}`}>
              {unreadChatCount}
            </span>
          )}
        </button>

        {/* 5. More Options (...) */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          className={`flex-1 py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer min-h-[46px] ${
            isMobileMenuOpen
              ? 'bg-[var(--color-surface-hover)] text-[var(--color-text-primary)]'
              : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]'
          }`}
          title="More Options"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="6" cy="12" r="1.5" />
            <circle cx="18" cy="12" r="1.5" />
          </svg>
          <span className="text-[10px] font-semibold leading-tight">More</span>
        </button>
      </nav>

      {/* 3. MOBILE MORE OPTIONS BOTTOM SHEET DRAWER */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100003] flex items-end justify-center pointer-events-auto sm:hidden animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Bottom Sheet Card */}
          <div className="relative w-full max-w-md bg-[var(--color-surface)] border-t border-[var(--color-border)] rounded-t-3xl shadow-2xl p-4 z-10 animate-in slide-in-from-bottom duration-300 pb-6 flex flex-col gap-2">
            <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-2 shrink-0" />

            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isSocketConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span className="font-heading font-extrabold text-sm text-[var(--color-text-primary)]">
                  Meeting Options
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
              >
                ✕
              </button>
            </div>

            {/* Hand Raise */}
            <button
              type="button"
              onClick={() => {
                handleToggleHand();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-[var(--color-surface-hover)] text-xs font-semibold text-[var(--color-text-primary)] cursor-pointer"
            >
              <span className="flex items-center gap-3">
                <svg className="w-5 h-5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
                  <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
                  <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
                  <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
                </svg>
                <span>{isHandRaised ? 'Lower Hand' : 'Raise Hand'}</span>
              </span>
              {isHandRaised && <span className="text-[11px] text-amber-600 font-bold">Raised</span>}
            </button>

            {/* Screen Share */}
            {onToggleScreenShare && (
              <button
                type="button"
                onClick={() => {
                  onToggleScreenShare();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-[var(--color-surface-hover)] text-xs font-semibold text-[var(--color-text-primary)] cursor-pointer"
              >
                <span className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-[var(--color-brand)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                  <span>{isScreenSharing ? 'Stop Screen Sharing' : 'Share Screen'}</span>
                </span>
                {isScreenSharing && <span className="text-[11px] text-blue-600 font-bold">Sharing</span>}
              </button>
            )}

            {/* Room Members Roster */}
            <button
              type="button"
              onClick={() => {
                setIsMembersOpen?.((prev) => !prev);
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-[var(--color-surface-hover)] text-xs font-semibold text-[var(--color-text-primary)] cursor-pointer"
            >
              <span className="flex items-center gap-3">
                <svg className="w-5 h-5 text-[var(--color-brand)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span>Room Members</span>
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-[#543FE3]/15 text-[#543FE3]">
                {totalConnected}
              </span>
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={() => {
                onToggleTheme();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-[var(--color-surface-hover)] text-xs font-semibold text-[var(--color-text-primary)] cursor-pointer"
            >
              <span className="flex items-center gap-3">
                {theme === 'dark' ? (
                  <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
                <span>Switch to {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </span>
            </button>

            {/* Copy Invite Link */}
            <button
              type="button"
              onClick={() => {
                handleCopyInvite();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-[var(--color-surface-hover)] text-xs font-semibold text-[var(--color-text-primary)] cursor-pointer"
            >
              <span className="flex items-center gap-3">
                <svg className="w-5 h-5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
                <span>Copy Invite Link</span>
              </span>
              {copiedLink && <span className="text-xs text-emerald-600 font-bold">Copied!</span>}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
