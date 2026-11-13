import React, { useState, useRef, useEffect } from 'react';
import { useRoom } from '../../context/RoomContext';
import ChatMessageList from './ChatMessageList';
import ChatInputForm from './ChatInputForm';

/**
 * SideChat Component
 * Real-time room chat supporting 3 adaptive display modes:
 * 1. Mobile Bottom Sheet Mode (< 640px): Centered, visible bottom modal with backdrop.
 * 2. Desktop Floating Popup Mode (>= 640px, floating=true): 120fps GPU translate3d draggable window.
 * 3. Docked Mode (floating=false): Pinned sidebar inside mockups and panels.
 */
export default function SideChat(props = {}) {
  const room = useRoom() || {};

  const isOpen = props.isOpen ?? room.isChatOpen;
  const onClose = props.onClose ?? (() => room.setIsChatOpen?.(false));
  const floating = props.floating ?? true;
  const externalMessages = props.externalMessages ?? room.chatMessages ?? null;
  const onSendExternalMessage = props.onSendExternalMessage ?? room.handleSendChatMessage ?? null;
  const onlineCount = props.onlineCount ?? ((room.peers?.length || 0) + 1);

  const [internalMessages, setInternalMessages] = useState([
    {
      id: 1,
      sender: 'Sarah',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&h=96&fit=crop&crop=faces&q=80',
      time: 'now',
      text: 'Did someone leave a message on the canvas? 🤝',
      isMe: false,
    },
    {
      id: 2,
      sender: 'Rohan',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=faces&q=80',
      time: 'now',
      text: 'Looking great! Added the auth layer and database node.',
      isMe: false,
    },
    {
      id: 3,
      sender: 'Rohan',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=faces&q=80',
      time: 'now',
      text: 'Double click anywhere on the canvas to write text too! 💡',
      isMe: false,
    },
  ]);

  const messages = externalMessages !== null ? externalMessages : internalMessages;
  const setMessages = setInternalMessages;

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);

  // Responsive mobile screen detection
  const [isMobile, setIsMobile] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth < 640 : false;
  });

  // Draggable Floating Position State for desktop/tablet
  const [pos, setPos] = useState(() => {
    const defaultX = typeof window !== 'undefined' ? Math.max(10, window.innerWidth - 380) : 800;
    return { x: defaultX, y: 76 };
  });

  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const rafId = useRef(null);

  // Synchronize mobile state & window boundary clamping on resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);
      if (!mobile) {
        setPos((prev) => {
          const maxX = Math.max(10, window.innerWidth - 380);
          const maxY = Math.max(60, window.innerHeight - 80);
          return {
            x: Math.min(Math.max(10, prev.x), maxX),
            y: Math.min(Math.max(60, prev.y), maxY),
          };
        });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Smooth window-level drag listeners
  useEffect(() => {
    if (!floating || isMobile) return;

    const onPointerMove = (e) => {
      if (!isDraggingRef.current) return;
      const clientX = e.clientX;
      const clientY = e.clientY;

      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        const maxX = Math.max(10, (window.innerWidth || 1200) - 370);
        const maxY = Math.max(60, (window.innerHeight || 800) - 80);
        const newX = Math.max(10, Math.min(maxX, clientX - dragOffset.current.x));
        const newY = Math.max(60, Math.min(maxY, clientY - dragOffset.current.y));
        setPos({ x: newX, y: newY });
      });
    };

    const onPointerUp = () => {
      isDraggingRef.current = false;
      setIsDragging(false);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };

    if (isDragging) {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      window.addEventListener('pointerup', onPointerUp);
    }

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [isDragging, floating, isMobile]);

  const scrollToBottom = () => {
    if (messagesEndRef.current?.parentElement) {
      messagesEndRef.current.parentElement.scrollTop = messagesEndRef.current.parentElement.scrollHeight;
    }
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen, isMinimized]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (onSendExternalMessage) {
      onSendExternalMessage(inputText.trim());
      setInputText('');
      return;
    }

    const userMsg = {
      id: Date.now(),
      sender: 'You',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=96&h=96&fit=crop&crop=faces&q=80',
      time: 'just now',
      text: inputText.trim(),
      isMe: true,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const replies = [
          'Got it! Just checked the canvas update.',
          'Awesome! Let me sketch the next connecting node.',
          'Looks great! Turning on my camera and mic now.',
          'Super clean diagram! Moving the weekly study note up.',
          'Nice! The new shapes and syncing look slick.',
        ];
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        const replyMsg = {
          id: Date.now() + 1,
          sender: Math.random() > 0.5 ? 'Sarah' : 'Rohan',
          avatar:
            Math.random() > 0.5
              ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&h=96&fit=crop&crop=faces&q=80'
              : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=faces&q=80',
          time: 'just now',
          text: randomReply,
          isMe: false,
        };
        setMessages((prev) => [...prev, replyMsg]);
      }, 1400);
    }, 400);
  };

  // Drag initiation from header
  const handleHeaderPointerDown = (e) => {
    if (!floating || isMobile) return;
    if (e.target.closest('button') || e.target.closest('input')) return;
    e.preventDefault();
    isDraggingRef.current = true;
    setIsDragging(true);

    dragOffset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };
  };

  if (!isOpen && floating) return null;

  const displayOnline = onlineCount || 1;

  const renderChatContent = (heightClass) => (
    <>
      <ChatMessageList
        messages={messages}
        isTyping={isTyping}
        messagesEndRef={messagesEndRef}
        customHeightClass={heightClass}
      />
      <ChatInputForm
        inputText={inputText}
        setInputText={setInputText}
        onSendMessage={handleSendMessage}
      />
    </>
  );

  const OnlineBadge = (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
      {displayOnline} online
    </span>
  );

  // MODE 1: MOBILE BOTTOM SHEET (< 640px)
  if (floating && isMobile) {
    return (
      <div className="fixed inset-0 z-[100000] flex flex-col justify-end pointer-events-none animate-in fade-in duration-200">
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs pointer-events-auto transition-opacity"
          aria-hidden="true"
        />

        <div className="relative w-full max-h-[82vh] flex flex-col bg-[var(--color-surface)] border-t border-[var(--color-border)] rounded-t-3xl shadow-2xl pointer-events-auto z-[100001] animate-in slide-in-from-bottom duration-300 overflow-hidden pb-1">
          <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto my-2.5 shrink-0" />

          <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--color-border)] bg-[var(--color-surface-secondary)]/90 shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-sm text-[var(--color-text-primary)]">
                Live Chat
              </span>
              {OnlineBadge}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
              title="Close chat"
            >
              ✕
            </button>
          </div>

          {renderChatContent("h-[260px] max-h-[45vh] flex-1")}
        </div>
      </div>
    );
  }

  // MODE 2: DESKTOP FLOATING DRAGGABLE OVERLAY
  if (floating) {
    return (
      <>
        {isDragging && <div className="fixed inset-0 z-[99999] cursor-grabbing select-none" />}

        <div
          className={`fixed top-0 left-0 z-[100000] select-none ${
            isDragging ? 'pointer-events-auto' : ''
          }`}
          style={{
            transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
            willChange: isDragging ? 'transform' : 'auto',
            transition: isDragging ? 'none' : 'box-shadow 0.2s ease',
            width: '360px',
            maxWidth: 'calc(100vw - 20px)',
          }}
        >
          <div
            className={`flex flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-xl shadow-2xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10 ${
              isDragging ? 'shadow-2xl ring-2 ring-[var(--color-brand)]/40 scale-[1.01]' : ''
            }`}
            style={{
              transition: isDragging ? 'none' : 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
          >
            <div
              onPointerDown={handleHeaderPointerDown}
              className={`flex items-center justify-between px-3.5 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-surface-secondary)]/90 select-none touch-none ${
                isDragging ? 'cursor-grabbing bg-[var(--color-surface-hover)]' : 'cursor-grab'
              }`}
              title="Click and drag to move chat anywhere"
            >
              <div className="flex items-center gap-2">
                <span className="text-gray-400 dark:text-gray-500 text-xs font-mono tracking-tighter" title="Drag handle">
                  ⠿
                </span>
                <span className="font-heading font-bold text-xs text-[var(--color-text-primary)]">
                  Live Chat
                </span>
                {OnlineBadge}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsMinimized((prev) => !prev)}
                  className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
                  title={isMinimized ? 'Expand Chat' : 'Minimize Chat'}
                >
                  {isMinimized ? '+' : '–'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-6 h-6 rounded-md flex items-center justify-center text-xs text-[var(--color-text-secondary)] hover:bg-rose-50 dark:hover:bg-rose-950 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Close chat"
                >
                  ✕
                </button>
              </div>
            </div>

            {!isMinimized && renderChatContent("h-[340px] max-h-[50vh]")}
          </div>
        </div>
      </>
    );
  }

  // MODE 3: DOCKED SIDE PANE
  return (
    <aside
      className={`absolute inset-y-0 right-0 sm:w-72 md:relative flex flex-col border-l border-[var(--color-border)] bg-[var(--color-surface-secondary)] z-30 shrink-0 shadow-2xl md:shadow-none transition-all duration-300 ease-in-out ${
        isOpen
          ? 'w-full sm:w-72 md:w-80 translate-x-0 opacity-100 pointer-events-auto'
          : 'w-0 translate-x-full md:translate-x-0 md:w-0 opacity-0 pointer-events-none overflow-hidden border-l-0'
      }`}
      aria-label="Side chat panel"
      aria-hidden={!isOpen}
    >
      <div className="w-full sm:w-72 md:w-80 flex flex-col h-full min-w-[280px] md:min-w-[320px]">
        <div className="flex items-center justify-between px-3.5 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-sm text-[var(--color-text-primary)]">
              Side chat
            </span>
            {OnlineBadge}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
            aria-label="Close side chat"
            title="Close chat"
          >
            <span className="md:hidden text-[11px] font-medium">Close</span>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {renderChatContent("flex-1 max-h-none")}
      </div>
    </aside>
  );
}
