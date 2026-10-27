import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ExcalidrawCanvas from '../components/canvas/ExcalidrawCanvas';
import RoomHeader from '../components/room/RoomHeader';
import SideChat from '../components/chat/SideChat';

/**
 * RoomPage Component
 * Full-screen collaborative whiteboard room with:
 * - Real-time Excalidraw multiplayer synchronization
 * - Immersive RoomHeader with meet audio, camera, and controls
 * - Adaptive SideChat (floating draggable on desktop, bottom-sheet drawer on mobile)
 * - Reactive dark / light mode synchronization
 */
export default function RoomPage({ theme, onToggleTheme }) {
  const { roomId = '1234' } = useParams();
  const navigate = useNavigate();

  // Room state
  const [roomTitle, setRoomTitle] = useState('System Design & Algorithms');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  // Audio / Video / Meet controls
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [activeCallTime, setActiveCallTime] = useState(842); // seconds

  // Isolated theme state for THIS specific room - changing theme here only alters this room and this canvas!
  const [roomTheme, setRoomTheme] = useState(() => {
    try {
      const saved = localStorage.getItem(`room_theme_${roomId}`);
      if (saved === 'dark' || saved === 'light') return saved;
    } catch (e) {}
    return theme || 'light';
  });

  const handleToggleRoomTheme = () => {
    setRoomTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem(`room_theme_${roomId}`, next);
      } catch (e) {}
      return next;
    });
  };

  // Synchronize document data-theme while active in this room, and restore global site theme when leaving
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', roomTheme);
    document.documentElement.classList.toggle('dark', roomTheme === 'dark');
    return () => {
      const globalTheme = localStorage.getItem('learningroom_theme') || theme || 'light';
      document.documentElement.setAttribute('data-theme', globalTheme);
      document.documentElement.classList.toggle('dark', globalTheme === 'dark');
    };
  }, [roomTheme, theme]);

  // Current participant profile
  const currentUser = useMemo(
    () => ({
      id: `user-${Date.now()}`,
      name: 'Ratnesh Chaturvedi',
      color: '#635bdb',
    }),
    []
  );

  // Floating reaction animations
  const [floatingReactions, setFloatingReactions] = useState([]);

  // Increment call timer every second
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

  const handleCopyInvite = () => {
    const inviteUrl = window.location.href;
    navigator.clipboard?.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const triggerReaction = (emoji) => {
    const id = Date.now() + Math.random();
    const startX = 40 + Math.random() * 20; // % across screen
    setFloatingReactions((prev) => [...prev, { id, emoji, startX }]);
    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== id));
    }, 2400);
  };

  return (
    <div
      data-theme={roomTheme}
      className="w-full max-w-full h-screen flex flex-col overflow-hidden bg-[var(--color-background)] select-none text-[var(--color-text-primary)]"
    >
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
        setIsMuted={setIsMuted}
        isVideoOn={isVideoOn}
        setIsVideoOn={setIsVideoOn}
        isHandRaised={isHandRaised}
        setIsHandRaised={setIsHandRaised}
        activeCallTime={activeCallTime}
        formatCallTime={formatCallTime}
        triggerReaction={triggerReaction}
        isChatOpen={isChatOpen}
        setIsChatOpen={setIsChatOpen}
        theme={roomTheme}
        onToggleTheme={handleToggleRoomTheme}
        onLeaveRoom={() => navigate('/dashboard')}
      />

      {/* 2. Whole-Screen Interactive Canvas Area */}
      <main className="flex-1 relative w-full h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] overflow-hidden">
        <section className="w-full h-full relative overflow-hidden">
          <div className="absolute inset-0">
            <ExcalidrawCanvas
              roomId={roomId}
              theme={roomTheme}
              user={currentUser}
              autoFocus
            />
          </div>

          {/* Floating Emoji Reactions Stream */}
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

          {/* Re-open Chat Floating Capsule when collapsed (Desktop) */}
          {!isChatOpen && (
            <button
              type="button"
              onClick={() => setIsChatOpen(true)}
              className="absolute top-4 right-4 flex items-center gap-2 px-3.5 py-2 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] shadow-lg hover:shadow-xl text-xs font-bold text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] transition-all z-30 cursor-pointer animate-in fade-in slide-in-from-right-4"
              title="Open Live Chat"
            >
              <svg className="w-4 h-4 text-[var(--color-brand)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>Live Chat</span>
              <span className="w-4 h-4 rounded-full bg-[var(--color-brand)] text-white text-[10px] flex items-center justify-center font-bold">
                3
              </span>
            </button>
          )}
        </section>
      </main>

      {/* 3. Adaptive Live Chat (Bottom Sheet on Mobile, Floating Draggable on Desktop) */}
      <SideChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        floating={true}
      />
    </div>
  );
}
