import React, { useEffect, useRef, useState } from 'react';

/**
 * Single Video Tile Component managing stream binding and video/audio playback
 */
function PeerVideoTile({ peer, stream, isLocal = false, isAudioMuted = false, isVideoOff = false }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const hasVideoTrack = stream && stream.getVideoTracks().some((t) => t.enabled && t.readyState === 'live') && !isVideoOff;

  return (
    <div className="relative rounded-2xl overflow-hidden bg-[#1E1F26] border border-[#2D303D] aspect-video flex items-center justify-center shadow-lg group">
      {/* Real MediaStream Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal} // Always mute local video to avoid audio feedback/echo
        className={`w-full h-full object-cover transition-opacity duration-200 ${
          hasVideoTrack ? 'opacity-100' : 'opacity-0 absolute pointer-events-none'
        }`}
      />

      {/* Avatar Fallback when camera is off */}
      {!hasVideoTrack && (
        <div className="flex flex-col items-center justify-center p-4 text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden ring-2 ring-[#543FE3]/50 bg-[#282B38] flex items-center justify-center shadow-md mb-2">
            {peer?.avatar ? (
              <img src={peer.avatar} alt={peer?.name} className="w-full h-full object-cover" />
            ) : (
              <span className="font-heading font-extrabold text-xl text-white">
                {(peer?.name || 'U').charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <span className="text-[11px] font-semibold text-gray-400 bg-black/40 px-2 py-0.5 rounded-full">
            Camera Off
          </span>
        </div>
      )}

      {/* Peer Name Tag & Audio Status Indicator */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-1 pointer-events-none z-10">
        <span className="px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold truncate max-w-[140px] shadow-xs">
          {isLocal ? 'You' : peer?.name || 'Collaborator'}
        </span>

        <div className="flex items-center gap-1">
          {/* Mic Status */}
          <span
            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              isAudioMuted
                ? 'bg-red-500/80 text-white'
                : 'bg-emerald-500/90 text-white animate-pulse'
            }`}
            title={isAudioMuted ? 'Muted' : 'Speaking / Active Mic'}
          >
            {isAudioMuted ? (
              <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="2" y1="2" x2="22" y2="22" />
                <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2" />
                <path d="M5 10v2a7 7 0 0 0 12 5" />
                <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33" />
                <path d="M9 9v3a3 3 0 0 0 5.12 2.12" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            ) : (
              <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="22" />
              </svg>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * VideoGalleryModal
 * Floating real-time video gallery popup displaying faces, live camera streams,
 * and audio status of all participants in the room.
 */
export default function VideoGalleryModal({
  isOpen,
  onClose,
  currentUser,
  peers = [],
  localStream,
  remoteStreams = {},
  isMuted,
  onToggleMute,
  isVideoOn,
  onToggleVideo,
}) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 76 });
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const totalParticipants = peers.length + 1;

  if (!isOpen) return null;

  const handleMouseDown = (e) => {
    // Only drag from header handle
    if (e.target.closest('button')) return;
    isDragging.current = true;
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    const maxX = Math.max(10, window.innerWidth - (isMinimized ? 280 : 540));
    const maxY = Math.max(50, window.innerHeight - (isMinimized ? 80 : 380));
    const nextX = Math.min(Math.max(10, e.clientX - dragOffset.current.x), maxX);
    const nextY = Math.min(Math.max(50, e.clientY - dragOffset.current.y), maxY);
    setPosition({ x: nextX, y: nextY });
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
      }}
      className={`fixed z-[100001] transition-shadow duration-200 select-none ${
        isMinimized ? 'w-72' : 'w-full max-w-[560px] sm:max-w-[620px]'
      }`}
    >
      <div className="bg-[#121318]/95 backdrop-blur-xl border border-[#2D303D] rounded-3xl shadow-2xl overflow-hidden flex flex-col text-white">
        {/* Header Bar / Drag Handle */}
        <div
          onMouseDown={handleMouseDown}
          className="px-4 py-3 bg-[#1A1C24] border-b border-[#2A2D3A] flex items-center justify-between cursor-grab active:cursor-grabbing"
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="font-heading font-extrabold text-xs sm:text-sm tracking-tight text-white flex items-center gap-1.5">
              <span>Live Video & Voice</span>
              <span className="text-[11px] font-mono text-gray-400 font-normal">
                ({totalParticipants})
              </span>
            </h3>
          </div>

          <div className="flex items-center gap-1">
            {/* Minimize / Expand Toggle */}
            <button
              type="button"
              onClick={() => setIsMinimized((prev) => !prev)}
              className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title={isMinimized ? 'Expand Video Grid' : 'Minimize to Picture-in-Picture'}
            >
              {isMinimized ? (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 3 21 3 21 9" />
                  <polyline points="9 21 3 21 3 15" />
                  <line x1="21" y1="3" x2="14" y2="10" />
                  <line x1="3" y1="21" x2="10" y2="14" />
                </svg>
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="4 14 10 14 10 20" />
                  <polyline points="20 10 14 10 14 4" />
                  <line x1="14" y1="10" x2="21" y2="3" />
                  <line x1="3" y1="21" x2="10" y2="14" />
                </svg>
              )}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Close Video Popup"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Video Grid Content */}
        {!isMinimized && (
          <div className="p-3 sm:p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
            <div
              className={`grid gap-3 ${
                totalParticipants === 1
                  ? 'grid-cols-1'
                  : totalParticipants === 2
                  ? 'grid-cols-1 sm:grid-cols-2'
                  : 'grid-cols-2'
              }`}
            >
              {/* 1. Local Video Tile (Your Camera / Stream) */}
              <PeerVideoTile
                isLocal={true}
                peer={{
                  name: currentUser?.name || 'You',
                  avatar: currentUser?.avatar,
                }}
                stream={localStream}
                isAudioMuted={isMuted}
                isVideoOff={!isVideoOn}
              />

              {/* 2. Remote Peer Video Tiles */}
              {peers.map((peer) => (
                <PeerVideoTile
                  key={peer.socketId}
                  isLocal={false}
                  peer={peer}
                  stream={remoteStreams[peer.socketId]}
                  isAudioMuted={peer.isAudioMuted}
                  isVideoOff={peer.isVideoOff}
                />
              ))}
            </div>
          </div>
        )}

        {/* Minimized Compact Bar */}
        {isMinimized && (
          <div className="px-3 py-2 flex items-center justify-between text-xs text-gray-300">
            <span>Video active ({totalParticipants} connected)</span>
            <span className="text-[10px] text-emerald-400 font-bold">● Streaming</span>
          </div>
        )}

        {/* Bottom Quick Media Bar inside Popup */}
        <div className="px-4 py-2.5 bg-[#171920] border-t border-[#262833] flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onToggleMute}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              isMuted
                ? 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
                : 'bg-white/10 text-white border border-white/10 hover:bg-white/20'
            }`}
          >
            {isMuted ? '🔇 Unmute' : '🎙️ Mute'}
          </button>

          <button
            type="button"
            onClick={onToggleVideo}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              !isVideoOn
                ? 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
            }`}
          >
            {isVideoOn ? '📹 Stop Video' : '📷 Start Video'}
          </button>
        </div>
      </div>
    </div>
  );
}

