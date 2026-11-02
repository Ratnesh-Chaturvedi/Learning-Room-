import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { roomApi } from '../../api/room.api';

const CATEGORIES = [
  { value: 'MEETING', label: 'General Meeting' },
  { value: 'STUDY', label: 'Study & Homework' },
  { value: 'CODING', label: 'Coding & Development' },
  { value: 'DESIGN', label: 'UI/UX & Design' },
  { value: 'SCIENCE', label: 'Science & Math' },
  { value: 'LANGUAGES', label: 'Language Practice' },
  { value: 'CUSTOM', label: 'Custom Topic' },
];

/**
 * RoomModal Component
 * Production-ready dialog connected to backend APIs for:
 * 1. Creating instant or scheduled rooms with category, privacy, and compiler tools.
 * 2. Joining rooms via room code or private invite URL.
 */
export default function RoomModal({ isOpen, onClose, mode = 'create', initialCode = '' }) {
  const navigate = useNavigate();

  // Create Mode state
  const [generatedCode] = useState(() => `LR-${Math.floor(1000 + Math.random() * 9000)}`);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('STUDY');
  const [customCategory, setCustomCategory] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');
  const [scheduledEndTime, setScheduledEndTime] = useState('');

  // Join Mode state
  const [roomCodeInput, setRoomCodeInput] = useState(initialCode || '');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Please enter a room title.');
      return;
    }

    if (category === 'CUSTOM' && !customCategory.trim()) {
      setErrorMessage('Please specify your custom category name.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const payload = {
        roomCode: generatedCode,
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        customCategory: category === 'CUSTOM' ? customCategory.trim() : undefined,
        isPrivate,
      };

      let response;
      if (isScheduled) {
        if (!scheduledAt || !scheduledEndTime) {
          setErrorMessage('Please select both start and end times for scheduled rooms.');
          setIsLoading(false);
          return;
        }
        payload.scheduledAt = new Date(scheduledAt).toISOString();
        payload.scheduledEndTime = new Date(scheduledEndTime).toISOString();
        response = await roomApi.scheduleRoom(payload);
      } else {
        response = await roomApi.createInstantRoom(payload);
      }

      const created = response.data?.room || response.data?.data || response.data;
      const inviteToken = response.data?.inviteToken || created?.inviteToken;
      const targetCode = created?.roomCode || generatedCode || created?.id;

      onClose();
      const tokenQuery = inviteToken ? `?token=${encodeURIComponent(inviteToken)}` : '';
      navigate(`/room/${targetCode}${tokenQuery}`);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to create room. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    if (!roomCodeInput.trim()) {
      setErrorMessage('Please enter a room code or invite link.');
      return;
    }

    let code = roomCodeInput.trim();
    let token = '';

    // If a full URL is pasted (e.g. http://localhost:5173/room/LR-1234?token=abc)
    if (code.includes('/room/')) {
      try {
        const url = new URL(code);
        const pathSegments = url.pathname.split('/');
        code = pathSegments[pathSegments.length - 1];
        token = url.searchParams.get('token') || '';
      } catch {
        const match = code.match(/\/room\/([a-zA-Z0-9_-]+)/);
        if (match) code = match[1];
      }
    }

    onClose();
    const tokenQuery = token ? `?token=${encodeURIComponent(token)}` : '';
    navigate(`/room/${code}${tokenQuery}`);
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
        className="relative w-full max-w-lg rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xl p-6 sm:p-7 overflow-hidden transition-all duration-200 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        data-lenis-prevent
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[var(--color-border)] shrink-0">
          <div>
            <h2 className="font-heading text-xl font-bold text-[var(--color-text-primary)]">
              {mode === 'create' ? 'Create a Learning Room' : 'Join a Learning Room'}
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              {mode === 'create'
                ? 'Launch your collaborative whiteboard room with live video, audio, and chat.'
                : 'Enter your room code or invite link to join your study group.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs font-medium shrink-0">
            {errorMessage}
          </div>
        )}

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto pr-1 py-4 space-y-4 custom-scrollbar">
          {mode === 'create' ? (
            <form id="room-form" onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Generated Room Code Badge */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)]">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[var(--color-text-secondary)] tracking-wider">
                    Room Code
                  </span>
                  <p className="font-mono font-extrabold text-sm text-[var(--color-brand)]">
                    #{generatedCode}
                  </p>
                </div>
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                  ⚡ Auto-Generated
                </span>
              </div>

              {/* Room Title */}
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                  Room Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Distributed Systems & Algorithms"
                  required
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20 transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                  Description <span className="text-[10px] text-gray-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this session about?"
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] px-3.5 py-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20 transition-all resize-none"
                />
              </div>

              {/* Category Dropdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-brand)] cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {category === 'CUSTOM' && (
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                      Custom Category <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="e.g. Robotics"
                      required
                      className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-brand)]"
                    />
                  </div>
                )}
              </div>

              {/* Privacy Toggle (Public vs Private with Host Knock Approval) */}
              <div className="rounded-2xl border border-[var(--color-border)] p-3.5 bg-[var(--color-surface-secondary)] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-[var(--color-text-primary)] flex items-center gap-1.5">
                      <span>{isPrivate ? '🔒 Private Room' : '🌐 Public Room'}</span>
                    </div>
                    <p className="text-[11px] text-[var(--color-text-secondary)]">
                      {isPrivate
                        ? 'Requires your host approval ("Knock") or a secret invite link.'
                        : 'Anyone with the room code can join directly.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPrivate(!isPrivate)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                      isPrivate ? 'bg-[#543FE3]' : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isPrivate ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Instant vs Scheduled Toggle */}
              <div className="rounded-2xl border border-[var(--color-border)] p-3.5 bg-[var(--color-surface-secondary)] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-[var(--color-text-primary)]">
                      {isScheduled ? '📅 Scheduled Meeting' : '⚡ Instant Meeting'}
                    </div>
                    <p className="text-[11px] text-[var(--color-text-secondary)]">
                      {isScheduled
                        ? 'Set start time and auto-expiration deadline.'
                        : 'Starts immediately and stays active while you collaborate.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsScheduled(!isScheduled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                      isScheduled ? 'bg-[#543FE3]' : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isScheduled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {isScheduled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 border-t border-[var(--color-border)]/60">
                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                        Starts At
                      </label>
                      <input
                        type="datetime-local"
                        value={scheduledAt}
                        onChange={(e) => setScheduledAt(e.target.value)}
                        className="w-full text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-2 text-[var(--color-text-primary)] outline-none focus:border-[var(--color-brand)]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                        Ends At (Auto-Termination)
                      </label>
                      <input
                        type="datetime-local"
                        value={scheduledEndTime}
                        onChange={(e) => setScheduledEndTime(e.target.value)}
                        className="w-full text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-2 text-[var(--color-text-primary)] outline-none focus:border-[var(--color-brand)]"
                        required
                      />
                    </div>
                  </div>
                )}
              </div>
            </form>
          ) : (
            <form id="room-form" onSubmit={handleJoinSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">
                  Room Code or Invite Link
                </label>
                <input
                  type="text"
                  value={roomCodeInput}
                  onChange={(e) => setRoomCodeInput(e.target.value)}
                  placeholder="e.g. LR-3921 or paste invite link"
                  autoFocus
                  required
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] px-3.5 py-3 text-sm font-mono text-[var(--color-text-primary)] outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20 transition-all"
                />
                <p className="text-[11px] text-[var(--color-text-secondary)] mt-1.5">
                  Tip: You can paste the full URL (including invite tokens) to join private rooms directly.
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[var(--color-border)] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-xs font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="room-form"
            disabled={isLoading}
            className="rounded-full bg-[#543FE3] hover:bg-[#4532CD] text-white px-6 py-2.5 text-xs font-semibold shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                <span>Processing...</span>
              </>
            ) : mode === 'create' ? (
              'Launch Room →'
            ) : (
              'Join Room →'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
