import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import ExcalidrawCanvas from '../components/canvas/ExcalidrawCanvas';
import RoomHeader from '../components/room/RoomHeader';
import VideoGalleryModal from '../components/room/VideoGalleryModal';
import SideChat from '../components/chat/SideChat';
import { useWebRtc } from '../hooks/useWebRtc';
import { useAuth } from '../context/AuthContext';
import { roomApi } from '../api/room.api';

export default function RoomPage({ theme, onToggleTheme }) {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('token') || '';
  const navigate = useNavigate();
  const { user } = useAuth();

  // Socket instance created once on mount
  const socket = useMemo(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    return io(socketUrl, {
      transports: ['websocket'],
    });
  }, []);
  const socketRef = useRef(socket);
  socketRef.current = socket;

  // Room state
  const [roomTitle, setRoomTitle] = useState('Learning Room');
  const [roomDetails, setRoomDetails] = useState(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  // Private Waiting Room & Knock states
  const [isWaiting, setIsWaiting] = useState(false);
  const [waitingMessage, setWaitingMessage] = useState('Waiting for the host to let you in...');
  const [knockRequests, setKnockRequests] = useState([]);

  // Connected WebRTC Peers
  const [peers, setPeers] = useState([]);

  // Real-time Chat
  const [chatMessages, setChatMessages] = useState([]);

  // Media states
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isVideoGalleryOpen, setIsVideoGalleryOpen] = useState(true);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [activeCallTime, setActiveCallTime] = useState(0);

  // Floating Reactions
  const [floatingReactions, setFloatingReactions] = useState([]);

  // Room Theme
  const [roomTheme, setRoomTheme] = useState(() => {
    try {
      const saved = localStorage.getItem(`room_theme_${roomId}`);
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {}
    return theme || 'light';
  });

  const handleToggleRoomTheme = () => {
    setRoomTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem(`room_theme_${roomId}`, next);
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', roomTheme);
    document.documentElement.classList.toggle('dark', roomTheme === 'dark');
    return () => {
      const globalTheme = localStorage.getItem('learningroom_theme') || theme || 'light';
      document.documentElement.setAttribute('data-theme', globalTheme);
      document.documentElement.classList.toggle('dark', globalTheme === 'dark');
    };
  }, [roomTheme, theme]);

  // Load Room Details from Backend
  useEffect(() => {
    let isMounted = true;
    const fetchRoom = async () => {
      try {
        const res = await roomApi.getRoomDetails(roomId);
        if (isMounted && res.data?.room) {
          setRoomDetails(res.data.room);
          setRoomTitle(res.data.room.title || 'Learning Room');
        }
      } catch {
        // May be indexed by custom code
      }
    };
    fetchRoom();
    return () => {
      isMounted = false;
    };
  }, [roomId]);

  // Call timer increment
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCallTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCallTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentUser = useMemo(
    () => ({
      id: user?.id || `user-${Date.now()}`,
      name: user?.name || 'Collaborator',
      avatar: user?.avatar,
      color: '#635bdb',
    }),
    [user?.id, user?.name, user?.avatar]
  );

  // WebRTC Mesh Hook for live camera & microphone streams
  const { localStream, remoteStreams } = useWebRtc({
    roomId,
    socket,
    user: currentUser,
    isMuted,
    isVideoOn,
  });

  // Floating reactions trigger
  const triggerReaction = useCallback((emoji, broadcast = true) => {
    const id = Date.now() + Math.random();
    const startX = 40 + Math.random() * 20;
    setFloatingReactions((prev) => [...prev, { id, emoji, startX }]);
    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== id));
    }, 2400);

    if (broadcast && socket) {
      socket.emit('chat:reaction', { roomId, emoji });
    }
  }, [roomId, socket]);

  // Socket.io initialization & WebRTC Signaling
  useEffect(() => {
    if (!socket) return;

    socket.on('connect', () => {
      socket.emit('webrtc:join-room', {
        roomId,
        inviteToken,
        user: {
          id: user?.id,
          name: user?.name || 'Collaborator',
          avatar: user?.avatar,
        },
        initialMediaState: {
          isAudioMuted: isMuted,
          isVideoOff: !isVideoOn,
        },
      });
    });

    // 🔒 WAITING ROOM: Intercepted because room is private
    socket.on('room:waiting', (data) => {
      setIsWaiting(true);
      setWaitingMessage(data.message || 'Waiting for the host to let you in...');
    });

    // 🚪 KNOCK APPROVED: Host admitted user
    socket.on('room:knock-approved', (data) => {
      setIsWaiting(false);
      setPeers(data.peers || []);
    });

    // 🚫 KNOCK DENIED: Host rejected admission
    socket.on('room:knock-denied', (data) => {
      alert(data.message || 'The host has denied your request to join this meeting.');
      navigate('/dashboard');
    });

    // 🔔 HOST ALERT: Incoming knock request from a waiting guest
    socket.on('room:knock-request', (knockPeer) => {
      setKnockRequests((prev) => {
        if (prev.some((p) => p.socketId === knockPeer.socketId)) return prev;
        return [...prev, knockPeer];
      });
    });

    // 👥 PEER DISCOVERY & SYNCHRONIZATION
    socket.on('webrtc:room-peers', (data) => {
      setIsWaiting(false);
      setPeers(data.peers || []);
    });

    socket.on('webrtc:peer-joined', (newPeer) => {
      setPeers((prev) => {
        if (prev.some((p) => p.socketId === newPeer.socketId)) return prev;
        return [...prev, newPeer];
      });
    });

    socket.on('webrtc:peer-left', (data) => {
      setPeers((prev) => prev.filter((p) => p.socketId !== data.socketId));
    });

    // 🎙️ PEER MEDIA STATUS CHANGED
    socket.on('media:audio-status-changed', ({ socketId, isAudioMuted }) => {
      setPeers((prev) =>
        prev.map((p) => (p.socketId === socketId ? { ...p, isAudioMuted } : p))
      );
    });

    socket.on('media:video-status-changed', ({ socketId, isVideoOff }) => {
      setPeers((prev) =>
        prev.map((p) => (p.socketId === socketId ? { ...p, isVideoOff } : p))
      );
    });

    socket.on('media:hand-raise-changed', ({ socketId, isHandRaised }) => {
      setPeers((prev) =>
        prev.map((p) => (p.socketId === socketId ? { ...p, isHandRaised } : p))
      );
    });

    // 💬 REAL-TIME CHAT: Map real sender names and dynamic avatars
    socket.on('chat:history', (history) => {
      if (!Array.isArray(history)) return;
      const formatted = history.map((msg) => ({
        id: msg.id,
        sender: msg.sender?.name || msg.senderName || 'Collaborator',
        avatar: msg.sender?.avatar || msg.avatar,
        time: new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: msg.text,
        isMe: (msg.sender?.id || msg.userId) === user?.id,
      }));
      setChatMessages(formatted);
    });

    socket.on('chat:new-message', (msg) => {
      setChatMessages((prev) => [
        ...prev,
        {
          id: msg.id,
          sender: msg.sender?.name || msg.senderName || 'Collaborator',
          avatar: msg.sender?.avatar || msg.avatar,
          time: new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: msg.text,
          isMe: (msg.sender?.id || msg.userId) === user?.id,
        },
      ]);
    });

    // 🎉 FLOATING EMOJI REACTIONS
    socket.on('chat:emoji-reaction', (data) => {
      triggerReaction(data.emoji, false);
    });
    socket.on('chat:reaction', (data) => {
      triggerReaction(data.emoji, false);
    });

    // 🛑 ROOM TERMINATED
    socket.on('room:terminated', (data) => {
      alert(`Meeting Ended: ${data.reason || 'The host has ended this meeting.'}`);
      navigate('/dashboard');
    });

    return () => {
      socket.disconnect();
    };
  }, [socket, roomId, inviteToken, user?.id, user?.name, user?.avatar, isMuted, isVideoOn, navigate, triggerReaction]);

  // Host Knock Decisions
  const handleApproveKnock = (targetSocketId) => {
    socket?.emit('room:approve-knock', {
      roomId,
      targetSocketId,
    });
    setKnockRequests((prev) => prev.filter((p) => p.socketId !== targetSocketId));
  };

  const handleDenyKnock = (targetSocketId) => {
    socket?.emit('room:deny-knock', {
      roomId,
      targetSocketId,
    });
    setKnockRequests((prev) => prev.filter((p) => p.socketId !== targetSocketId));
  };

  // Media Toggles
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    socket?.emit('media:toggle-audio', {
      roomId,
      isMuted: nextMuted,
    });
  };

  const handleToggleVideo = () => {
    const nextVideo = !isVideoOn;
    setIsVideoOn(nextVideo);
    socket?.emit('media:toggle-video', {
      roomId,
      isVideoOff: !nextVideo,
    });
  };

  const handleToggleHand = () => {
    const nextHand = !isHandRaised;
    setIsHandRaised(nextHand);
    socket?.emit('media:raise-hand', {
      roomId,
      isHandRaised: nextHand,
    });
  };

  // Chat message sending
  const handleSendChatMessage = (text) => {
    if (!text.trim() || !socket) return;
    socket.emit('chat:send-message', {
      roomId,
      text: text.trim(),
    });
  };

  const handleCopyInvite = () => {
    const origin = window.location.origin;
    const tokenQuery = roomDetails?.inviteToken ? `?token=${roomDetails.inviteToken}` : '';
    const inviteUrl = `${origin}/room/${roomId}${tokenQuery}`;
    navigator.clipboard?.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

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
                    src={peer.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&auto=format&fit=crop&q=80'}
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

      {/* 1. Immersive Top Room Header */}
      <RoomHeader
        roomId={roomId}
        roomTitle={roomTitle}
        setRoomTitle={setRoomTitle}
        isEditingTitle={isEditingTitle}
        setIsEditingTitle={setIsEditingTitle}
        copiedLink={copiedLink}
        handleCopyInvite={handleCopyInvite}
        isMuted={isMuted}
        setIsMuted={handleToggleMute}
        isVideoOn={isVideoOn}
        setIsVideoOn={handleToggleVideo}
        isHandRaised={isHandRaised}
        setIsHandRaised={handleToggleHand}
        activeCallTime={activeCallTime}
        formatCallTime={formatCallTime}
        triggerReaction={triggerReaction}
        isChatOpen={isChatOpen}
        setIsChatOpen={setIsChatOpen}
        unreadChatCount={chatMessages.length}
        peers={peers}
        currentUser={currentUser}
        isVideoGalleryOpen={isVideoGalleryOpen}
        onToggleVideoGallery={() => setIsVideoGalleryOpen((prev) => !prev)}
        theme={roomTheme}
        onToggleTheme={handleToggleRoomTheme}
        onLeaveRoom={() => navigate('/dashboard')}
      />

      {/* 2. Floating Live Video Gallery Popup (Faces, Cameras & Microphones) */}
      <VideoGalleryModal
        isOpen={isVideoGalleryOpen}
        onClose={() => setIsVideoGalleryOpen(false)}
        currentUser={currentUser}
        peers={peers}
        localStream={localStream}
        remoteStreams={remoteStreams}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        isVideoOn={isVideoOn}
        onToggleVideo={handleToggleVideo}
      />

      {/* 3. Interactive Multiplayer Collaborative Canvas */}
      <main className="flex-1 relative w-full h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] overflow-hidden">
        <section className="w-full h-full relative overflow-hidden">
          <div className="absolute inset-0">
            <ExcalidrawCanvas
              roomId={roomId}
              theme={roomTheme}
              user={currentUser}
              socket={socket}
              autoFocus
            />
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

      {/* 4. Real-time Live Chat */}
      <SideChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        floating={true}
        externalMessages={chatMessages}
        onSendExternalMessage={handleSendChatMessage}
        onlineCount={peers.length + 1}
      />
    </div>
  );
}
