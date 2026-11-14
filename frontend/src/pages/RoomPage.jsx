import React from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import ExcalidrawCanvas from '../components/canvas/ExcalidrawCanvas';
import RoomHeader from '../components/room/RoomHeader';
import VideoGalleryModal from '../components/room/VideoGalleryModal';
import ParticipantsModal from '../components/room/ParticipantsModal';
import SideChat from '../components/chat/SideChat';
import { RoomProvider, useRoom } from '../context/RoomContext';

/**
 * Inner RoomView component that consumes RoomContext cleanly.
 * Decouples state & signaling orchestration from UI presentation.
 */
class RoomErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[Room Error Boundary] Caught runtime error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[var(--color-background)] text-center select-none">
          <div className="max-w-md w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-8 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto text-xl">
              ⚠️
            </div>
            <h3 className="font-heading font-extrabold text-lg text-[var(--color-text-primary)]">
              Room Session Error
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              {this.state.error?.message || 'An unexpected rendering error occurred inside this room session.'}
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-full border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] transition-all cursor-pointer"
              >
                Reload Room
              </button>
              <button
                type="button"
                onClick={() => (window.location.href = '/dashboard')}
                className="px-4 py-2 rounded-full bg-[var(--color-brand)] text-white text-xs font-semibold shadow-xs hover:bg-[var(--color-brand-hover)] transition-all cursor-pointer"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function RemoteAudioTrack({ stream }) {
  const audioRef = React.useRef(null);

  React.useEffect(() => {
    const el = audioRef.current;
    if (!el || !stream) return;

    if (el.srcObject !== stream) {
      el.srcObject = stream;
    }
    el.muted = false;
    el.volume = 1.0;

    const playAudio = () => {
      if (el) {
        el.muted = false;
        el.volume = 1.0;
        const playPromise = el.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            // Autoplay blocked: will be unlocked on user interaction
            console.warn('[Audio] Autoplay waiting for user interaction:', err?.name);
          });
        }
      }
    };

    playAudio();

    // Browser Autoplay Policy unlocker: as soon as user taps or clicks anywhere, resume playback
    const unlockAutoplay = () => {
      if (el && el.paused) {
        el.play().catch(() => {});
      }
    };

    window.addEventListener('click', unlockAutoplay);
    window.addEventListener('pointerdown', unlockAutoplay);
    window.addEventListener('keydown', unlockAutoplay);
    window.addEventListener('touchstart', unlockAutoplay);

    // When tracks are added or unmuted, trigger playback
    const handleTrackActive = () => {
      playAudio();
    };

    stream.addEventListener('addtrack', handleTrackActive);
    stream.getAudioTracks().forEach((track) => {
      track.addEventListener('unmute', handleTrackActive);
    });

    return () => {
      window.removeEventListener('click', unlockAutoplay);
      window.removeEventListener('pointerdown', unlockAutoplay);
      window.removeEventListener('keydown', unlockAutoplay);
      window.removeEventListener('touchstart', unlockAutoplay);
      stream.removeEventListener('addtrack', handleTrackActive);
      stream.getAudioTracks().forEach((track) => {
        track.removeEventListener('unmute', handleTrackActive);
      });
    };
  }, [stream]);

  return <audio ref={audioRef} autoPlay playsInline />;
}

function ScheduledRoomHoldingScreen({
  scheduledInfo,
  isHost,
  onStartEarly,
  onCopyInvite,
  copiedLink,
  onLeave,
}) {
  const [timeLeft, setTimeLeft] = React.useState('');

  React.useEffect(() => {
    if (!scheduledInfo?.scheduledAt) return;
    const start = new Date(scheduledInfo.scheduledAt).getTime();

    const updateTimer = () => {
      const diff = start - Date.now();
      if (diff <= 0) {
        setTimeLeft('Starting now...');
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(
        `${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [scheduledInfo?.scheduledAt]);

  const formattedStart = scheduledInfo?.scheduledAt
    ? new Date(scheduledInfo.scheduledAt).toLocaleString([], {
        dateStyle: 'full',
        timeStyle: 'short',
      })
    : '';

  const formattedEnd = scheduledInfo?.scheduledEndTime
    ? new Date(scheduledInfo.scheduledEndTime).toLocaleTimeString([], {
        timeStyle: 'short',
      })
    : '';

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[var(--color-background)] text-center relative overflow-hidden select-none">
      <div className="absolute w-96 h-96 rounded-full bg-[#543FE3]/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-lg w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-full bg-[#543FE3]/15 text-[#543FE3] flex items-center justify-center mx-auto shadow-inner">
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
          </svg>
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#543FE3]/15 text-[#543FE3] border border-[#543FE3]/30">
            Scheduled Meeting
          </span>
          <h2 className="font-heading font-extrabold text-2xl text-[var(--color-text-primary)] pt-1">
            {scheduledInfo?.title || 'Scheduled Room'}
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
            {isHost
              ? 'You scheduled this meeting. It will unlock for all participants at the scheduled start time, or you can start it now.'
              : 'This meeting is scheduled for a future time. It will open automatically when the host starts the meeting.'}
          </p>
        </div>

        {/* Schedule Timing Box */}
        <div className="bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-2xl p-4 text-left space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--color-text-secondary)]">Planned Start:</span>
            <span className="font-bold text-[var(--color-text-primary)]">{formattedStart}</span>
          </div>
          {formattedEnd && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--color-text-secondary)]">Auto-Ends At:</span>
              <span className="font-semibold text-[var(--color-text-primary)]">{formattedEnd}</span>
            </div>
          )}
          <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between text-xs">
            <span className="text-[var(--color-text-secondary)]">Countdown:</span>
            <span className="font-mono font-extrabold text-[#543FE3] text-sm animate-pulse">
              {timeLeft || 'Calculating...'}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-2.5 pt-1">
          {isHost && (
            <button
              type="button"
              onClick={onStartEarly}
              className="w-full py-3 px-4 rounded-xl bg-[#543FE3] hover:bg-[#4330C8] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>▶</span>
              <span>Start Meeting Now</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCopyInvite}
              className="flex-1 py-2.5 px-4 rounded-xl border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] transition-all cursor-pointer"
            >
              {copiedLink ? '✓ Copied Link' : 'Copy Invite Link'}
            </button>
            <button
              type="button"
              onClick={onLeave}
              className="flex-1 py-2.5 px-4 rounded-xl border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-all cursor-pointer"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RoomView() {
  const navigate = useNavigate();
  const {
    roomId,
    socket,
    currentUser,
    isHost,
    peers,
    remoteStreams,
    isJoinedRoom,
    isKicked,
    kickedReason,
    handleRequestRejoin,
    isWaiting,
    waitingMessage,
    knockRequests,
    handleApproveKnock,
    handleDenyKnock,
    isChatOpen,
    setIsChatOpen,
    chatMessages,
    isVideoGalleryOpen,
    setIsVideoGalleryOpen,
    roomTheme,
    isRoomNotFound,
    notFoundMessage,
    isRoomTerminated,
    terminationInfo,
    isRoomScheduled,
    scheduledInfo,
    handleStartScheduledRoomEarly,
    handleCopyInvite,
    copiedLink,
  } = useRoom();

  // ROOM NOT FOUND OVERLAY (When room code does not exist)
  if (isRoomNotFound) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[var(--color-background)] text-center relative overflow-hidden select-none">
        <div className="absolute w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-md w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>

          <div className="space-y-2">
            <h2 className="font-heading font-extrabold text-xl text-[var(--color-text-primary)]">
              Room Not Found
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              {notFoundMessage || `The room '${roomId}' does not exist or has already been removed.`}
            </p>
            <p className="text-[11px] text-[var(--color-text-secondary)]/70">
              Please verify the room code or ask the host for an updated invite link.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="w-full py-2.5 px-4 rounded-xl bg-[#543FE3] hover:bg-[#4330C8] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // SCHEDULED HOLDING ROOM OVERLAY (When room is scheduled for a future time)
  if (isRoomScheduled) {
    return (
      <ScheduledRoomHoldingScreen
        scheduledInfo={scheduledInfo}
        isHost={isHost}
        onStartEarly={handleStartScheduledRoomEarly}
        onCopyInvite={handleCopyInvite}
        copiedLink={copiedLink}
        onLeave={() => navigate('/dashboard')}
      />
    );
  }

  // LIVE ROOM TERMINATION OVERLAY
  if (isRoomTerminated) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[var(--color-background)] text-center relative overflow-hidden select-none">
        <div className="absolute w-96 h-96 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-md w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-inner">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
          </div>

          <div className="space-y-2">
            <h2 className="font-heading font-extrabold text-xl text-[var(--color-text-primary)]">
              Meeting Ended
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              {terminationInfo?.reason || 'The host has ended this meeting for all participants.'}
            </p>
            <p className="text-[11px] text-[var(--color-text-secondary)]/70">
              All members have been disconnected from the live room.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="w-full py-2.5 px-4 rounded-xl bg-[#543FE3] hover:bg-[#4330C8] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // WAITING ROOM OVERLAY (When waiting for host admission)
  if (isWaiting) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[var(--color-background)] text-center relative overflow-hidden">
        <div className="absolute w-96 h-96 rounded-full bg-[#543FE3]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-md w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-[#F3EEFE] dark:bg-[#252238] text-[#543FE3] flex items-center justify-center mx-auto shadow-inner">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" x2="3" y1="12" y2="12" />
            </svg>
          </div>

          <div className="space-y-2">
            <h2 className="font-heading font-extrabold text-2xl text-[var(--color-text-primary)]">
              Asking to join...
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              {waitingMessage}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#543FE3]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#543FE3] animate-ping" />
            <span>The meeting host will let you in soon</span>
          </div>

          <div className="pt-2 border-t border-[var(--color-border)]">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2 rounded-full border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] text-xs font-semibold text-[var(--color-text-secondary)] transition-all cursor-pointer"
            >
              Cancel and Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // KICKED PARTICIPANT OVERLAY
  if (isKicked) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[var(--color-background)] text-center relative overflow-hidden select-none">
        <div className="absolute w-96 h-96 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-md w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-inner">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40">
              Removed from Meeting
            </span>
            <h2 className="font-heading font-extrabold text-xl text-[var(--color-text-primary)] pt-1">
              You were removed
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              {kickedReason || 'You were removed from this meeting by the host.'}
            </p>
            <p className="text-[11px] text-[var(--color-text-secondary)]/70">
              You can ask the host to allow you back in, or return to your dashboard.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={handleRequestRejoin}
              className="w-full py-2.5 px-4 rounded-xl bg-[#543FE3] hover:bg-[#4330C8] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Ask Host to Rejoin</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="w-full py-2.5 px-4 rounded-xl border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-all cursor-pointer"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // CONNECTING / PREPARING ROOM LOADER (Eliminates the premature room glimpse!)
  if (!isJoinedRoom) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[var(--color-background)] text-center relative overflow-hidden select-none">
        <div className="absolute w-96 h-96 rounded-full bg-[#543FE3]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-sm w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
          <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border-3 border-[#543FE3]/20 border-t-[#543FE3] animate-spin" />
            <div className="w-3 h-3 rounded-full bg-[#543FE3] absolute" />
          </div>

          <div className="space-y-1.5">
            <h3 className="font-heading font-extrabold text-base text-[var(--color-text-primary)]">
              Joining Room #{roomId}
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Connecting to room and preparing workspace...
            </p>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-[#543FE3]">
            <span className="w-2 h-2 rounded-full bg-[#543FE3] animate-ping" />
            <span>Establishing live session</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      data-theme={roomTheme}
      className="w-full max-w-full h-screen flex flex-col overflow-hidden bg-[var(--color-background)] select-none text-[var(--color-text-primary)]"
    >
      {/* HOST NOTIFICATION MODAL: Knock Requests Queue */}
      {knockRequests.length > 0 && (
        <div className="fixed top-16 left-3 right-3 sm:left-auto sm:right-6 sm:top-20 z-[100002] sm:max-w-sm w-auto bg-[var(--color-surface)] border-2 border-[#543FE3] rounded-2xl shadow-2xl p-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-start justify-between gap-2 pb-2 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#543FE3]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <h4 className="font-heading font-bold text-xs text-[var(--color-text-primary)]">
                Knock Request ({knockRequests.length})
              </h4>
            </div>
            <span className="text-[10px] text-[var(--color-text-secondary)]">Private Room</span>
          </div>

          <div className="divide-y divide-[var(--color-border)] max-h-48 overflow-y-auto custom-scrollbar my-2">
            {knockRequests.map((peer) => (
              <div key={peer.socketId} className="py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={
                      peer.avatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&auto=format&fit=crop&q=80'
                    }
                    alt={peer.name}
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                  />
                  <div className="truncate">
                    <p className="text-xs font-bold text-[var(--color-text-primary)] truncate">
                      {peer.name}
                    </p>
                    <p className="text-[10px] text-[var(--color-text-secondary)]">
                      {peer.isRejoin ? (
                        <span className="text-amber-600 dark:text-amber-400 font-bold">
                          Rejoin Request (Removed)
                        </span>
                      ) : (
                        'Asking to join call'
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleDenyKnock(peer.socketId)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                  >
                    Deny
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApproveKnock(peer.socketId)}
                    className="px-3 py-1 rounded-lg bg-[#543FE3] hover:bg-[#4330C8] text-white text-[11px] font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    Admit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Background audio */}
      <div className="fixed top-0 left-0 w-px h-px overflow-hidden pointer-events-none opacity-5" aria-hidden="true">
        {Object.entries(remoteStreams || {}).map(([peerSocketId, stream]) => (
          <RemoteAudioTrack key={peerSocketId} stream={stream} />
        ))}
      </div>

      {/* Room header */}
      <RoomHeader />

      {/* Video gallery modal */}
      <VideoGalleryModal />

      {/* Participants modal */}
      <ParticipantsModal />

      {/* Collaborative canvas */}
      <main className="flex-1 relative w-full h-[calc(100dvh-3.5rem)] sm:h-[calc(100dvh-4rem)] pb-18 sm:pb-0 overflow-hidden">
        <section className="w-full h-full relative overflow-hidden">
          <div className="absolute inset-0">
            <RoomErrorBoundary
              fallback={
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <p className="text-xs text-[var(--color-text-secondary)]">Canvas encountered an issue loading.</p>
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="mt-2 px-3 py-1 bg-[var(--color-brand)] text-white text-[11px] font-semibold rounded-lg"
                  >
                    Refresh
                  </button>
                </div>
              }
            >
              <ExcalidrawCanvas
                roomId={roomId}
                theme={roomTheme}
                user={currentUser}
                socket={socket}
                autoFocus
              />
            </RoomErrorBoundary>
          </div>

          {/* Open chat button */}
          {!isChatOpen && (
            <button
              type="button"
              onClick={() => setIsChatOpen(true)}
              className="hidden sm:flex absolute sm:top-4 sm:right-4 items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] shadow-lg hover:shadow-xl text-xs font-bold text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] transition-all z-30 cursor-pointer animate-in fade-in"
              title="Open Live Chat"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--color-brand)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>Live Chat</span>
              {chatMessages.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-[var(--color-brand)] text-white text-[10px] flex items-center justify-center font-bold">
                  {chatMessages.length}
                </span>
              )}
            </button>
          )}

          {/* Open video gallery button */}
          {!isVideoGalleryOpen && (
            <button
              type="button"
              onClick={() => setIsVideoGalleryOpen(true)}
              className="hidden sm:flex absolute sm:top-4 sm:left-4 items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] shadow-lg hover:shadow-xl text-xs font-bold text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] transition-all z-30 cursor-pointer animate-in fade-in"
              title="Open Video Grid"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden xs:inline">Show Video Grid</span>
              <span className="xs:hidden">Video</span>
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">
                {peers.length + 1}
              </span>
            </button>
          )}
        </section>
      </main>

      {/* Live chat sidebar */}
      <SideChat floating={true} />
    </div>
  );
}

// Main room page wrapped in RoomProvider
export default function RoomPage() {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('token') || '';

  return (
    <RoomErrorBoundary>
      <RoomProvider roomId={roomId} inviteToken={inviteToken}>
        <RoomView />
      </RoomProvider>
    </RoomErrorBoundary>
  );
}
