import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * RoomModal Component
 * Accessible dialog for creating new collaborative rooms or joining via code.
 * Directly navigates to live room /room/:roomId on launch.
 */
export default function RoomModal({ isOpen, onClose, mode = 'create', initialCode = '' }) {
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState('System Design & Algorithms');
  const [roomCode, setRoomCode] = useState(initialCode || 'LR-8492');
  const [includeMeet, setIncludeMeet] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchSuccess, setLaunchSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(`https://learningroom.app/r/${roomCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLaunch = (e) => {
    e?.preventDefault();
    setIsLaunching(true);

    // Extract clean room identifier (e.g. 'LR-8492' -> '8492' or fallback '1234')
    const rawCode = roomCode ? roomCode.trim().replace(/^LR-?/i, '') : '1234';
    const targetRoomId = rawCode || '1234';

    setTimeout(() => {
      setIsLaunching(false);
      setLaunchSuccess(true);
      setTimeout(() => {
        setLaunchSuccess(false);
        onClose();
        navigate(`/room/${targetRoomId}`);
      }, 500);
    }, 400);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      data-lenis-prevent
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xl p-6 overflow-hidden transition-all duration-200"
        onClick={(e) => e.stopPropagation()}
        data-lenis-prevent
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[var(--color-border)]">
          <div>
            <h2 className="font-heading text-lg font-bold text-[var(--color-text-primary)]">
              {mode === 'create' ? 'Create a Learning Room' : 'Join Learning Room'}
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              {mode === 'create'
                ? 'Your persistent collaborative room with shared whiteboard and chat.'
                : 'Enter your invite code to pull up a chair with your study group.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-colors"
            aria-label="Close dialog"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleLaunch} className="pt-4 space-y-4">
          {mode === 'create' ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">
                  Room Topic / Name
                </label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="e.g. Distributed Systems Study"
                  required
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-secondary)] px-3.5 py-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">
                  Room Code & Shareable Link
                </label>
                <div className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-secondary)] p-1.5">
                  <span className="font-mono text-xs font-bold text-[var(--color-brand)] bg-[var(--color-surface)] px-2 py-1 rounded shadow-xs">
                    {roomCode}
                  </span>
                  <input
                    type="text"
                    readOnly
                    value={`https://learningroom.app/r/${roomCode}`}
                    className="flex-1 bg-transparent text-xs text-[var(--color-text-muted)] font-mono outline-none px-1"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="rounded-md bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white px-2.5 py-1 text-xs font-semibold transition-all shadow-xs"
                  >
                    {copied ? 'Copied! ✓' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-[var(--color-text-primary)]">
                  <input
                    type="checkbox"
                    checked={includeMeet}
                    onChange={(e) => setIncludeMeet(e.target.checked)}
                    className="w-4 h-4 rounded text-[var(--color-brand)] focus:ring-[var(--color-brand)] border-[var(--color-border)]"
                  />
                  <span>Connect Google Meet for video & audio</span>
                </label>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">
                Enter 6-digit Room Code
              </label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="LR-8492"
                maxLength={8}
                autoFocus
                required
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-secondary)] px-3.5 py-2 text-base font-mono font-bold tracking-widest text-[var(--color-text-primary)] outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20 transition-all uppercase"
              />
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-between gap-2.5 pt-3 border-t border-[var(--color-border)]">
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/room/1234');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold text-[var(--color-brand)] bg-[var(--color-brand-soft)] hover:opacity-90 transition-all cursor-pointer shadow-2xs"
              title="Jump directly to demo room 1234"
            >
              <span>⚡</span>
              <span>Test Demo Room (#1234)</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full px-3.5 py-1.5 text-xs font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLaunching || (mode === 'join' && !roomCode.trim())}
                className="rounded-full bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white px-5 py-2 text-xs font-semibold shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {isLaunching
                  ? 'Connecting Room...'
                  : launchSuccess
                  ? 'Ready! Launching...'
                  : mode === 'create'
                  ? 'Launch Room →'
                  : 'Enter Room →'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
