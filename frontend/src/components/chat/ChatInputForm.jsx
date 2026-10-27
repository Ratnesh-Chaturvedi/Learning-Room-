import React from 'react';

/**
 * ChatInputForm Component
 * Text message input field with send icon button.
 */
export default function ChatInputForm({ inputText, setInputText, onSendMessage }) {
  return (
    <form
      onSubmit={onSendMessage}
      className="p-2.5 pb-3 sm:pb-2.5 border-t border-[var(--color-border)] bg-[var(--color-surface)] flex items-center gap-1.5 shrink-0"
    >
      <input
        type="text"
        placeholder="Type a message to collaborators..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-3 py-1.5 text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-[var(--color-brand)] transition-colors shadow-2xs"
        aria-label="Chat message"
      />
      <button
        type="submit"
        disabled={!inputText.trim()}
        className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-hover)] disabled:opacity-40 transition-all cursor-pointer shrink-0 shadow-2xs"
        aria-label="Send message"
        title="Send message"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>
    </form>
  );
}
