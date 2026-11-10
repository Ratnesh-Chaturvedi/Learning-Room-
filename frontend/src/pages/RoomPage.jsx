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
    el.play().catch(() => {});
  }, [stream]);

  return <audio ref={audioRef} autoPlay playsInline />;
}

function RoomView() {
  const navigate = useNavigate();
  const {
    roomId,
    socket,
    currentUser,
    peers,
    remoteStreams,
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
    floatingReactions,
    roomTheme,
    isRoomTerminated,
    terminationInfo,
  } = useRoom();

  // 🛑 INSTANT LIVE ROOM TERMINATION OVERLAY
  if (isRoomTerminated) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[var(--color-background)] text-center relative overflow-hidden select-none">
        <div className="absolute w-96 h-96 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-md w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto text-3xl shadow-inner">
            🛑
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

  // 🔒 WAITING ROOM OVERLAY (When waiting for host admission)
  if (isWaiting) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[var(--color-background)] text-center relative overflow-hidden">
        <div className="absolute w-96 h-96 rounded-full bg-[#543FE3]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-md w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-[#F3EEFE] dark:bg-[#252238] flex items-center justify-center mx-auto text-3xl">
            🚪
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

  return (
    <div
      data-theme={roomTheme}
      className="w-full max-w-full h-screen flex flex-col overflow-hidden bg-[var(--color-background)] select-none text-[var(--color-text-primary)]"
    >
      {/* 🔔 HOST NOTIFICATION MODAL: Knock Requests Queue */}
      {knockRequests.length > 0 && (
        <div className="fixed top-20 right-6 z-[100002] max-w-sm w-full bg-[var(--color-surface)] border-2 border-[#543FE3] rounded-2xl shadow-2xl p-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-start justify-between gap-2 pb-2 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-2">
              <span className="text-base">🔔</span>
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
                      Asking to join call
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

      {/* 0. Permanent Background Audio for Remote Peers (Plays even if VideoGalleryModal is closed) */}
      <div className="fixed -top-[9999px] -left-[9999px] w-px h-px opacity-0 pointer-events-none" aria-hidden="true">
        {Object.entries(remoteStreams || {}).map(([peerSocketId, stream]) => (
          <RemoteAudioTrack key={peerSocketId} stream={stream} />
        ))}
      </div>

      {/* 1. Immersive Top Room Header (Context-connected) */}
      <RoomHeader />

      {/* 2. Floating Live Video Gallery Popup (Context-connected) */}
      <VideoGalleryModal />

      {/* 3. Room Participants Roster & Moderation Modal */}
      <ParticipantsModal />

      {/* 3. Interactive Multiplayer Collaborative Canvas */}
      <main className="flex-1 relative w-full h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] overflow-hidden">
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

          {/* Floating Emoji Reactions */}
          {floatingReactions.map((reaction) => (
            <div
              key={reaction.id}
              className="absolute pointer-events-none z-50 text-3xl animate-bounce"
              style={{
                left: `${reaction.startX}%`,
                bottom: '12%',
                animationDuration: '1.2s',
              }}
            >
              {reaction.emoji}
            </div>
          ))}

          {/* Re-open Chat Floating Pill */}
          {!isChatOpen && (
            <button
              type="button"
              onClick={() => setIsChatOpen(true)}
              className="absolute top-4 right-4 flex items-center gap-2 px-3.5 py-2 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] shadow-lg hover:shadow-xl text-xs font-bold text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] transition-all z-30 cursor-pointer animate-in fade-in slide-in-from-right-4"
              title="Open Live Chat"
            >
              <svg className="w-4 h-4 text-[var(--color-brand)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
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

          {/* Re-open Video Gallery Floating Pill if closed */}
          {!isVideoGalleryOpen && (
            <button
              type="button"
              onClick={() => setIsVideoGalleryOpen(true)}
              className="absolute top-4 left-4 flex items-center gap-2 px-3.5 py-2 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] shadow-lg hover:shadow-xl text-xs font-bold text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] transition-all z-30 cursor-pointer animate-in fade-in slide-in-from-left-4"
              title="Open Video Grid"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Show Video Grid</span>
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">
                {peers.length + 1}
              </span>
            </button>
          )}
        </section>
      </main>

      {/* 4. Real-time Live Chat (Context-connected) */}
      <SideChat floating={true} />
    </div>
  );
}

/**
 * Collaborative Room Page
 * Wraps room lifecycle with RoomProvider for clean Context-driven architecture.
 */
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
