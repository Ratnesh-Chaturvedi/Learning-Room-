import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRoom } from '../../context/RoomContext';

/**
 * Single Video Tile Component managing stream binding, video/audio playback,
 * screen-sharing indicators, and camera-off avatar fallbacks.
 */
function PeerVideoTile({
  peer,
  stream,
  isLocal = false,
  isAudioMuted = false,
  isVideoOff = false,
  isScreenSharing = false,
  isSpotlight = false,
}) {
  const videoRef = useRef(null);
  const [, setTrackVersion] = useState(0);

  // Re-render immediately when remote or local video track state changes (mute, unmute, addtrack)
  useEffect(() => {
    if (!stream) return;
    const update = () => setTrackVersion((v) => v + 1);

    stream.addEventListener('addtrack', update);
    stream.addEventListener('removetrack', update);
    const tracks = stream.getTracks();
    tracks.forEach((t) => {
      t.addEventListener('mute', update);
      t.addEventListener('unmute', update);
      t.addEventListener('ended', update);
    });

    return () => {
      stream.removeEventListener('addtrack', update);
      stream.removeEventListener('removetrack', update);
      tracks.forEach((t) => {
        t.removeEventListener('mute', update);
        t.removeEventListener('unmute', update);
        t.removeEventListener('ended', update);
      });
    };
  }, [stream]);

  useEffect(() => {
    if (!videoRef.current) return;
    if (stream) {
      if (videoRef.current.srcObject !== stream) {
        videoRef.current.srcObject = stream;
      }
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.srcObject = null;
    }
  }, [stream]);

  // A video track counts as displayable when it exists and is not ended.
  const hasVideoTrack = Boolean(
    stream &&
    stream.getVideoTracks().length > 0 &&
    stream.getVideoTracks().some((t) => t.enabled && t.readyState !== 'ended') &&
    (!isVideoOff || isScreenSharing)
  );

  return (
    <div
      className={`relative rounded-2xl border border-[#2D303D] aspect-video flex items-center justify-center shadow-lg group bg-[#16181F] overflow-hidden ${
        isSpotlight ? 'w-full h-full' : ''
      }`}
    >
      {/* Real MediaStream Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={true} // Dedicated <RemoteAudioTrack> renders audio without echo or browser autoplay blocks
        className={`w-full h-full ${
          isScreenSharing ? 'object-contain bg-black' : 'object-cover'
        } transition-opacity duration-200 ${
          hasVideoTrack ? 'opacity-100' : 'opacity-0 absolute pointer-events-none'
        }`}
      />

      {/* Screen Sharing Active Indicator Badge */}
      {isScreenSharing && (
        <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
          <span className="px-2.5 py-1 rounded-full bg-blue-600/90 backdrop-blur-xs text-[11px] font-bold text-white flex items-center gap-1.5 shadow-md animate-pulse">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            <span>Sharing Screen</span>
          </span>
        </div>
      )}

      {/* Avatar Fallback when camera is off */}
      {!hasVideoTrack && (
        <div className="flex flex-col items-center justify-center p-4 text-center select-none">
          <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full overflow-hidden ring-2 ring-[#543FE3]/50 bg-[#242633] flex items-center justify-center shadow-lg mb-2">
            {peer?.avatar ? (
              <img src={peer.avatar} alt={peer?.name} className="w-full h-full object-cover" />
            ) : (
              <span className="font-heading font-extrabold text-xl sm:text-2xl text-white">
                {(peer?.name || 'U').charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <span className="text-[11px] font-semibold text-gray-400 bg-black/50 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
            Camera Off
          </span>
        </div>
      )}

      {/* Peer Name Tag & Audio Status Indicator */}
      <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1 pointer-events-none z-10">
        <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[11px] sm:text-xs font-semibold truncate max-w-[160px] shadow-sm">
          {isLocal ? 'You' : peer?.name || 'Collaborator'}
        </span>

        <div className="flex items-center gap-1.5">
          {/* Mic Status */}
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] shadow-sm ${
              isAudioMuted
                ? 'bg-red-500/85 text-white'
                : 'bg-emerald-500/90 text-white animate-pulse'
            }`}
            title={isAudioMuted ? 'Muted' : 'Microphone Active'}
          >
            {isAudioMuted ? (
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="2" y1="2" x2="22" y2="22" />
                <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2" />
                <path d="M5 10v2a7 7 0 0 0 12 5" />
                <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33" />
                <path d="M9 9v3a3 3 0 0 0 5.12 2.12" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            ) : (
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
 * Floating or Fullscreen real-time video gallery popup displaying faces, live camera streams,
 * screen shares, and audio status of all participants in the meeting room.
 */
export default function VideoGalleryModal(props = {}) {
  const room = useRoom() || {};

  const isOpen = props.isOpen ?? room.isVideoGalleryOpen;
  const onClose = props.onClose ?? (() => room.setIsVideoGalleryOpen?.(false));
  const currentUser = props.currentUser ?? room.currentUser;
  const peers = props.peers ?? room.peers ?? [];
  const localStream = props.localStream ?? room.localStream;
  const remoteStreams = props.remoteStreams ?? room.remoteStreams ?? {};
  const isMuted = props.isMuted ?? room.isMuted;
  const onToggleMute = props.onToggleMute ?? room.handleToggleMute;
  const isVideoOn = props.isVideoOn ?? room.isVideoOn;
  const onToggleVideo = props.onToggleVideo ?? room.handleToggleVideo;
  const isScreenSharing = props.isScreenSharing ?? room.isScreenSharing ?? false;
  const screenStream = props.screenStream ?? room.screenStream ?? null;
  const onToggleScreenShare = props.onToggleScreenShare ?? room.toggleScreenShare;

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 76 });
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const totalParticipants = peers.length + 1;

  // Detect if anyone is actively sharing screen
  const remoteScreenSharer = peers.find((p) => p.isScreenSharing);
  const activeScreenSharer = isScreenSharing
    ? { isLocal: true, peer: currentUser, stream: screenStream }
    : remoteScreenSharer
    ? {
        isLocal: false,
        peer: remoteScreenSharer,
        stream: remoteStreams[remoteScreenSharer.socketId],
      }
    : null;

  // Toggle Fullscreen mode
  const handleToggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => {
      const next = !prev;
      if (next) {
        setIsMinimized(false);
        try {
          if (!document.fullscreenElement && containerRef.current?.requestFullscreen) {
            containerRef.current.requestFullscreen().catch(() => {});
          }
        } catch {}
      } else {
        try {
          if (document.fullscreenElement && document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
          }
        } catch {}
      }
      return next;
    });
  }, []);

  // Sync fullscreen change with ESC key and browser events
  useEffect(() => {
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      }
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        handleToggleFullscreen();
      }
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isFullscreen, handleToggleFullscreen]);

  // Window drag handlers (disabled in Fullscreen)
  const handleMouseDown = (e) => {
    if (isFullscreen || e.target.closest('button')) return;
    isDragging.current = true;
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current || isFullscreen) return;
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

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      style={
        isFullscreen
          ? undefined
          : {
              transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
            }
      }
      className={`fixed z-[100001] transition-all duration-200 select-none ${
        isFullscreen
          ? 'inset-0 w-screen h-screen max-w-none rounded-none'
          : isMinimized
          ? 'w-72'
          : 'w-full max-w-[560px] sm:max-w-[620px]'
      }`}
    >
      <div
        className={`bg-[#101217]/95 backdrop-blur-xl border border-[#2D303D] shadow-2xl flex flex-col text-white ${
          isFullscreen ? 'w-full h-full rounded-none' : 'rounded-3xl overflow-hidden'
        }`}
      >
        {/* Header Bar / Drag Handle */}
        <div
          onMouseDown={handleMouseDown}
          className={`px-4 py-3 bg-[#171922] border-b border-[#262833] flex items-center justify-between ${
            isFullscreen ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="font-heading font-extrabold text-xs sm:text-sm tracking-tight text-white flex items-center gap-1.5">
              <span>{isFullscreen ? 'Meeting Video Gallery (Fullscreen)' : 'Live Video & Voice'}</span>
              <span className="text-[11px] font-mono text-gray-400 font-normal">
                ({totalParticipants})
              </span>
            </h3>
          </div>

          <div className="flex items-center gap-1">
            {/* Fullscreen / Theater Mode Button */}
            <button
              type="button"
              onClick={handleToggleFullscreen}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isFullscreen
                  ? 'bg-blue-600/30 text-blue-400 hover:bg-blue-600/50'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
              title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Expand to Fullscreen / Big Screen'}
            >
              {isFullscreen ? (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <polyline points="4 14 10 14 10 20" />
                  <polyline points="20 10 14 10 14 4" />
                  <line x1="14" y1="10" x2="21" y2="3" />
                  <line x1="3" y1="21" x2="10" y2="14" />
                </svg>
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <polyline points="15 3 21 3 21 9" />
                  <polyline points="9 21 3 21 3 15" />
                  <line x1="21" y1="3" x2="14" y2="10" />
                  <line x1="3" y1="21" x2="10" y2="14" />
                </svg>
              )}
            </button>

            {/* Minimize / Expand Toggle (Floating mode only) */}
            {!isFullscreen && (
              <button
                type="button"
                onClick={() => setIsMinimized((prev) => !prev)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title={isMinimized ? 'Expand Video Grid' : 'Minimize to Compact Bar'}
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
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                )}
              </button>
            )}

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Close Video Gallery"
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
          <div
            className={`p-3 sm:p-5 overflow-y-auto custom-scrollbar flex-1 flex flex-col justify-center ${
              isFullscreen ? 'max-h-[calc(100vh-130px)] items-center' : 'max-h-[60vh]'
            }`}
          >
            {/* Screen Share Spotlight Layout */}
            {activeScreenSharer ? (
              <div className={`w-full h-full flex flex-col ${isFullscreen ? 'lg:flex-row' : ''} gap-3 sm:gap-4 items-center justify-center`}>
                {/* Large Screen Share Center Stage */}
                <div className={`w-full ${isFullscreen ? 'flex-1 h-full min-h-[50vh]' : 'aspect-video max-h-[42vh]'} flex items-center justify-center`}>
                  <PeerVideoTile
                    isLocal={activeScreenSharer.isLocal}
                    peer={activeScreenSharer.peer}
                    stream={activeScreenSharer.stream}
                    isAudioMuted={false}
                    isVideoOff={false}
                    isScreenSharing={true}
                    isSpotlight={true}
                  />
                </div>

                {/* Participant Cameras Strip */}
                <div className={`w-full ${isFullscreen ? 'lg:w-72 flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto max-h-[80vh]' : 'flex flex-row gap-2 overflow-x-auto py-1'} shrink-0`}>
                  <div className={isFullscreen ? 'w-full' : 'w-32 sm:w-36 shrink-0'}>
                    <PeerVideoTile
                      isLocal={true}
                      peer={{ name: currentUser?.name || 'You', avatar: currentUser?.avatar }}
                      stream={localStream}
                      isAudioMuted={isMuted}
                      isVideoOff={!isVideoOn}
                      isScreenSharing={false}
                    />
                  </div>
                  {peers.map((peer) => (
                    <div key={peer.socketId} className={isFullscreen ? 'w-full' : 'w-32 sm:w-36 shrink-0'}>
                      <PeerVideoTile
                        isLocal={false}
                        peer={peer}
                        stream={remoteStreams[peer.socketId]}
                        isAudioMuted={peer.isAudioMuted}
                        isVideoOff={peer.isVideoOff}
                        isScreenSharing={false}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Standard Grid Layout */
              <div
                className={`grid gap-3 sm:gap-4 w-full ${
                  isFullscreen
                    ? totalParticipants === 1
                      ? 'max-w-4xl w-full h-[70vh] flex items-center justify-center'
                      : totalParticipants === 2
                      ? 'grid-cols-1 md:grid-cols-2 max-w-6xl w-full h-[70vh]'
                      : totalParticipants <= 4
                      ? 'grid-cols-2 max-w-6xl w-full h-[70vh]'
                      : totalParticipants <= 6
                      ? 'grid-cols-2 md:grid-cols-3 max-w-7xl w-full h-[70vh]'
                      : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 max-w-7xl w-full'
                    : totalParticipants === 1
                    ? 'grid-cols-1'
                    : totalParticipants === 2
                    ? 'grid-cols-1 sm:grid-cols-2'
                    : 'grid-cols-2'
                }`}
              >
                {/* 1. Local Video Tile */}
                <PeerVideoTile
                  isLocal={true}
                  peer={{
                    name: currentUser?.name || 'You',
                    avatar: currentUser?.avatar,
                  }}
                  stream={isScreenSharing && screenStream ? screenStream : localStream}
                  isAudioMuted={isMuted}
                  isVideoOff={isScreenSharing ? false : !isVideoOn}
                  isScreenSharing={isScreenSharing}
                />

                {/* 2. Remote Peer Video Tiles */}
                {peers.map((peer) => (
                  <PeerVideoTile
                    key={peer.socketId}
                    isLocal={false}
                    peer={peer}
                    stream={remoteStreams[peer.socketId]}
                    isAudioMuted={peer.isAudioMuted}
                    isVideoOff={peer.isScreenSharing ? false : peer.isVideoOff}
                    isScreenSharing={Boolean(peer.isScreenSharing)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Minimized Compact Bar */}
        {isMinimized && (
          <div className="px-3.5 py-2.5 flex items-center justify-between text-xs text-gray-300">
            <span>Video active ({totalParticipants} connected)</span>
            <span className="text-[10px] text-emerald-400 font-bold">● Streaming</span>
          </div>
        )}

        {/* Bottom Floating Google Meet Style Quick Media Bar */}
        <div
          className={`px-4 py-3 bg-[#151720] border-t border-[#262833] flex items-center justify-center gap-2.5 sm:gap-3 flex-wrap ${
            isFullscreen ? 'py-4 shadow-lg' : ''
          }`}
        >
          {/* Mute Button */}
          <button
            type="button"
            onClick={onToggleMute}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              isMuted
                ? 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
                : 'bg-white/10 text-white border border-white/10 hover:bg-white/20'
            }`}
          >
            {isMuted ? '🔇 Unmute' : '🎙️ Mute'}
          </button>

          {/* Video Button */}
          <button
            type="button"
            onClick={onToggleVideo}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              !isVideoOn
                ? 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
            }`}
          >
            {isVideoOn ? '📹 Stop Video' : '📷 Start Video'}
          </button>

          {/* Screen Share Button */}
          <button
            type="button"
            onClick={onToggleScreenShare}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              isScreenSharing
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 border border-blue-400 hover:bg-blue-700'
                : 'bg-white/10 text-white border border-white/10 hover:bg-white/20'
            }`}
            title={isScreenSharing ? 'Stop sharing your screen' : 'Share your screen (Google Meet style)'}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            <span>{isScreenSharing ? 'Stop Share' : 'Share Screen'}</span>
          </button>

          {/* Fullscreen Button in Bottom Dock */}
          <button
            type="button"
            onClick={handleToggleFullscreen}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              isFullscreen
                ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50 hover:bg-purple-600/40'
                : 'bg-white/10 text-white border border-white/10 hover:bg-white/20'
            }`}
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand to Fullscreen Big Screen'}
          >
            {isFullscreen ? (
              <>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <polyline points="4 14 10 14 10 20" />
                  <polyline points="20 10 14 10 14 4" />
                  <line x1="14" y1="10" x2="21" y2="3" />
                  <line x1="3" y1="21" x2="10" y2="14" />
                </svg>
                <span>Exit Fullscreen</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <polyline points="15 3 21 3 21 9" />
                  <polyline points="9 21 3 21 3 15" />
                  <line x1="21" y1="3" x2="14" y2="10" />
                  <line x1="3" y1="21" x2="10" y2="14" />
                </svg>
                <span>Fullscreen</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
