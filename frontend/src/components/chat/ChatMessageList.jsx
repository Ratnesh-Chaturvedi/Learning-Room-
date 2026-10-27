import React, { useRef, useEffect } from 'react';

/**
 * ChatMessageList Component
 * Renders scrollable conversation message bubbles, sender avatars,
 * timestamps, and dynamic typing indicator.
 */
export default function ChatMessageList({
  messages,
  isTyping,
  messagesEndRef,
  customHeightClass = 'h-[340px] max-h-[50vh]',
}) {
  const containerRef = useRef(null);

  // Safely scroll internal chat messages container without touching window scroll
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div
      ref={containerRef}
      data-lenis-prevent
      className={`${customHeightClass} p-3 overflow-y-auto custom-scrollbar space-y-2.5 text-xs bg-[var(--color-surface)]`}
    >
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex items-start gap-2 ${msg.isMe ? 'justify-end' : 'justify-start'}`}
        >
          {!msg.isMe && (
            <img
              src={msg.avatar}
              alt={`${msg.sender} avatar`}
              className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5 shadow-2xs"
            />
          )}
          <div className={`flex flex-col max-w-[82%] ${msg.isMe ? 'items-end' : 'items-start'}`}>
            <div className="flex items-center gap-1.5 mb-0.5 px-1 text-[10px] text-[var(--color-text-muted)]">
              <span className="font-semibold text-[var(--color-text-secondary)]">{msg.sender}</span>
              <span>•</span>
              <span>{msg.time}</span>
            </div>
            <div
              className={`rounded-2xl px-3 py-1.5 leading-relaxed shadow-2xs ${
                msg.isMe
                  ? 'bg-[var(--color-brand)] text-white rounded-tr-xs'
                  : 'bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)] border border-[var(--color-border)] rounded-tl-xs'
              }`}
            >
              {msg.text}
            </div>
          </div>
        </div>
      ))}

      {isTyping && (
        <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] italic py-1 px-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand)] animate-bounce" />
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand)] animate-bounce [animation-delay:0.2s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand)] animate-bounce [animation-delay:0.4s]" />
          <span>Teammate is typing...</span>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
