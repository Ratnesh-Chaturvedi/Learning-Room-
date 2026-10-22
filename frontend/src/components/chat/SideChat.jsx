import React, { useState, useRef, useEffect } from 'react';

/**
 * SideChat Component
 * Docked or collapsible real-time room communication panel
 */
export default function SideChat({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'Maya',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&h=96&fit=crop&crop=faces&q=80',
      time: 'now',
      text: 'Did someone leave a message idub-lit 🤝',
      isMe: false,
    },
    {
      id: 2,
      sender: 'Rohan',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=faces&q=80',
      time: 'now',
      text: 'Hey wait for convos you can switch be a care and street.',
      isMe: false,
    },
    {
      id: 3,
      sender: 'Rohan',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=faces&q=80',
      time: 'now',
      text: 'Nobody speak in the chat perish your lives in this message 😆',
      isMe: false,
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

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

    // Trigger simulated teammate response
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const replies = [
          'Got it! Just checked the canvas update.',
          'Awesome! Let me sketch the next connecting node.',
          'Looks great! Should we link Google Meet audio as well?',
          'Super clean diagram! Moving the weekly study note up.',
        ];
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        const replyMsg = {
          id: Date.now() + 1,
          sender: Math.random() > 0.5 ? 'Maya' : 'Rohan',
          avatar:
            Math.random() > 0.5
              ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&h=96&fit=crop&crop=faces&q=80'
              : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=faces&q=80',
          time: 'just now',
          text: randomReply,
          isMe: false,
        };
        setMessages((prev) => [...prev, replyMsg]);
      }, 1500);
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <aside
      className="absolute inset-y-0 right-0 w-full sm:w-72 md:relative md:w-80 flex flex-col border-l border-[var(--color-border)] bg-[var(--color-surface-secondary)] z-30 shrink-0 shadow-2xl md:shadow-none transition-all duration-200"
      aria-label="Side chat panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex items-center gap-2">
          <span className="font-heading font-bold text-sm text-[var(--color-text-primary)]">
            Side chat
          </span>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            3 online
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-colors"
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

      {/* Message List */}
      <div className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-3 text-xs pr-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2 ${msg.isMe ? 'justify-end' : 'justify-start'}`}
          >
            {!msg.isMe && (
              <img
                src={msg.avatar}
                alt={`${msg.sender} avatar`}
                className="w-6 h-6 rounded-full object-cover shrink-0 mt-1"
              />
            )}
            <div className={`flex flex-col max-w-[82%] ${msg.isMe ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-[var(--color-text-muted)]">
                <span className="font-semibold text-[var(--color-text-secondary)]">{msg.sender}</span>
                <span>{msg.time}</span>
              </div>
              <div
                className={`p-2.5 rounded-xl shadow-xs leading-relaxed text-xs break-words ${
                  msg.isMe
                    ? 'bg-[var(--color-brand)] text-white rounded-tr-none'
                    : 'bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--color-border)] rounded-tl-none'
                }`}
              >
                <p>{msg.text}</p>
              </div>
            </div>
          </div>
        ))}

        {/* Live typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] pl-8">
            <div className="flex items-center gap-1 p-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand)] animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand)] animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand)] animate-bounce [animation-delay:0.4s]" />
            </div>
            <span className="text-[11px] italic">Someone is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Composer Input */}
      <form
        onSubmit={handleSendMessage}
        className="p-2 border-t border-[var(--color-border)] bg-[var(--color-surface)] flex items-center gap-2"
      >
        <input
          type="text"
          placeholder="Write a message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-lg px-3 py-1.5 text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-[var(--color-brand)] transition-colors"
          aria-label="Chat message"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-hover)] disabled:opacity-40 transition-all cursor-pointer shrink-0"
          aria-label="Send message"
          title="Send"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </form>
    </aside>
  );
}
