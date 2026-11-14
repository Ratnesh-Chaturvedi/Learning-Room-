import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userApi } from '../../api/user.api';
import { ratneshAvatar, burstLines } from '../../assets';

function ToggleSwitch({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between">
      {label && <span className="text-xs text-[#18191F] dark:text-gray-200 font-medium">{label}</span>}
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
          checked ? 'bg-[#543FE3]' : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <div
          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

function ThemeOption({ id, label, isSelected, onSelect, bgClass, barClass, cardClass }) {
  return (
    <div onClick={() => onSelect(id)} className="group cursor-pointer flex flex-col items-center">
      <div
        className={`w-full aspect-[4/3] rounded-xl p-2 border transition-all relative overflow-hidden flex flex-col justify-between ${bgClass} ${
          isSelected
            ? 'border-[#543FE3] ring-2 ring-[#543FE3]/30 shadow-xs'
            : 'border-[#EAE1D2] dark:border-[#303240] hover:border-[#543FE3]/50'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
          {isSelected && (
            <div className="w-4 h-4 rounded-full bg-[#543FE3] text-white flex items-center justify-center text-[10px] font-bold">
              ✓
            </div>
          )}
        </div>
        <div className="flex gap-1.5 my-auto">
          <div className={`w-2 h-7 rounded-xs ${barClass}`} />
          <div className="flex-1 space-y-1">
            <div className={`w-8 h-2 rounded-xs ${barClass}`} />
            <div className={`w-12 h-2.5 rounded-xs ${cardClass}`} />
            <div className="w-6 h-2 rounded-full bg-[#543FE3]" />
          </div>
        </div>
      </div>
      <span className="text-[11px] font-semibold text-[#18191F] dark:text-gray-200 mt-1.5 text-center">
        {label}
      </span>
    </div>
  );
}

export default function SettingsView({ theme = 'light', onToggleTheme }) {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();

  // Profile Form State initialized from authenticated user
  const [fullName, setFullName] = useState(user?.name || '');
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Sync state during render if user changes in context (React 19 recommended pattern)
  const [prevUser, setPrevUser] = useState(user);
  if (user !== prevUser) {
    setPrevUser(user);
    if (user?.name) setFullName(user.name);
    if (user?.avatar) setAvatarPreview(user.avatar);
  }

  // File Input Ref for image upload
  const fileInputRef = useRef(null);

  // Theme & Appearance State
  const [selectedTheme, setSelectedTheme] = useState(theme === 'dark' ? 'dark' : 'warm-light');
  const [showGridDots, setShowGridDots] = useState(true);
  const [showSoundEffects, setShowSoundEffects] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Audio & Hardware State
  const [selectedMic, setSelectedMic] = useState('Default Microphone');
  const [selectedCamera, setSelectedCamera] = useState('Camera 2');
  const [roomInvitesNotif, setRoomInvitesNotif] = useState(true);
  const [liveActivityNotif, setLiveActivityNotif] = useState(true);

  // Handle local image file selection
  const handleImageFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, or WEBP).');
      return;
    }

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert('Image file is too large. Please select an image under 5MB.');
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    const trimmedName = fullName.trim();
    if (!trimmedName) {
      setErrorMessage('Full name cannot be empty.');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');
    try {
      let response;

      if (selectedFile) {
        // Send as multipart form data with the image file
        const formData = new FormData();
        formData.append('name', trimmedName);
        formData.append('avatar', selectedFile);
        response = await userApi.updateProfile(formData);
      } else {
        // Send JSON payload
        response = await userApi.updateProfile({
          name: trimmedName,
          avatar: avatarPreview,
        });
      }

      // apiClient interceptor unwraps response to response.data directly
      const updatedUser = response?.data || response?.user || response;
      const savedAvatar = updatedUser?.avatar ?? avatarPreview;
      const savedName = updatedUser?.name || trimmedName;

      // Immediately sync with global AuthContext
      updateUser({
        name: savedName,
        avatar: savedAvatar,
      });

      setAvatarPreview(savedAvatar);
      setSelectedFile(null);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('[Settings] Error updating profile:', err);
      setErrorMessage(err.message || 'Failed to save profile changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out of LearningRoom?')) {
      try {
        await logout();
      } finally {
        navigate('/login');
      }
    }
  };

  const handleSelectTheme = (mode) => {
    setSelectedTheme(mode);
    if (mode === 'dark' && theme !== 'dark') {
      onToggleTheme?.();
    } else if (mode === 'warm-light' && theme === 'dark') {
      onToggleTheme?.();
    } else if (mode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if ((prefersDark && theme !== 'dark') || (!prefersDark && theme === 'dark')) {
        onToggleTheme?.();
      }
    }
  };

  return (
    <div className="w-full max-w-[1560px] mx-auto space-y-6 animate-fade-in relative pb-10 font-sans select-none">
      {/* Header section */}
      <div className="pt-3 sm:pt-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-baseline gap-x-3.5 gap-y-1.5">
          {/* Title with radiating burst doodle */}
          <div className="relative inline-block">
            <span
              className="absolute -top-[18px] sm:-top-5 -left-[19px] sm:-left-[22px] -rotate-45 pointer-events-none select-none animate-float-slow"
              aria-hidden="true"
            >
              <img
                src={burstLines}
                alt=""
                className="w-7 h-5 sm:w-8 sm:h-6 object-contain dark:invert"
              />
            </span>

            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#18191F] dark:text-[#F3F4F6] tracking-tight">
              Settings
            </h1>
          </div>

          {/* Sub-headline */}
          <div className="relative inline-block">
            <h2 className="font-editorial italic font-medium text-2xl sm:text-3xl lg:text-[34px] text-[#18191F] dark:text-[#FFFFFF] tracking-tight">
              Customize your studio & preferences
            </h2>
            <svg
              className="absolute -bottom-2 left-0 w-full h-3 text-[#543FE3] overflow-visible"
              viewBox="0 0 340 12"
              fill="none"
            >
              <path
                d="M 2 7 Q 60 1, 130 7 T 250 6 T 338 6"
                stroke="currentColor"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Top Header Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 text-xs font-bold transition-all cursor-pointer shadow-2xs"
          title="Sign out of your account"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>Log Out</span>
        </button>
      </div>

      {/* Settings grid */}
      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        {/* Floating handwritten doodle on the left */}
        <div className="hidden xl:block absolute -left-14 2xl:-left-20 top-24 pointer-events-none select-none z-10">
          <div className="font-handwriting font-bold text-base text-[#18191F] dark:text-gray-200 rotate-[-8deg]">
            Make it<br />yours!
          </div>
          <svg className="w-8 h-8 text-[#18191F] dark:text-gray-200 ml-4 mt-0.5" viewBox="0 0 32 32" fill="none">
            <path d="M 2 12 Q 18 10, 24 22 M 18 20 L 25 23 L 26 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Profile information card */}
        <div className="lg:col-span-5 xl:col-span-5 bg-white dark:bg-[#1E202B] border border-[#E9E4DB] dark:border-[#2F3140] rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="font-heading font-extrabold text-base sm:text-lg text-[#18191F] dark:text-[#F3F4F6] mb-5">
              Profile Information
            </h3>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              {/* Left Column: Avatar + Image Upload Button */}
              <div className="flex flex-col items-center shrink-0">
                <div className="relative">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-tr from-[#9E8BFF] to-[#E5D7FC] dark:from-[#543FE3] dark:to-[#8E79FF] shadow-xs overflow-hidden">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt={fullName}
                        className="w-full h-full rounded-full object-cover ring-2 ring-white dark:ring-[#1E202B]"
                      />
                    ) : (
                      <img
                        src={ratneshAvatar}
                        alt={fullName}
                        className="w-full h-full rounded-full object-cover ring-2 ring-white dark:ring-[#1E202B]"
                      />
                    )}
                  </div>
                  {/* Status indicator dot */}
                  <span className="absolute bottom-1 right-2 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#1E202B]" />
                </div>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageFileSelect}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                />

                {/* Action Buttons for Avatar */}
                <div className="flex flex-col items-center gap-1.5 mt-3.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white dark:bg-[#252833] hover:bg-gray-50 dark:hover:bg-[#2D303D] active:scale-95 text-[#18191F] dark:text-gray-100 border border-[#D5CFCA] dark:border-[#3E4150] font-medium text-xs px-3.5 py-1.5 rounded-full transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5 text-[#543FE3]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span>Upload Image</span>
                  </button>

                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setAvatarPreview(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="text-[11px] text-gray-400 hover:text-rose-500 transition-colors"
                    >
                      Reset Photo
                    </button>
                  )}
                </div>
              </div>

              {/* Right Column: Profile Inputs */}
              <div className="w-full flex-1 space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#18191F] dark:text-gray-200 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-[#FAF7F2] dark:bg-[#252834] border border-[#E5DFD6] dark:border-[#383A4A] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#18191F] dark:text-gray-100 focus:outline-hidden focus:ring-2 focus:ring-[#543FE3] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#18191F] dark:text-gray-200 mb-1">
                    Google Account Email
                  </label>
                  <input
                    type="text"
                    value={user?.email || 'Authenticated via Google'}
                    disabled
                    className="w-full bg-[#F3F0EB] dark:bg-[#1C1E26] border border-[#E5DFD6] dark:border-[#383A4A] rounded-xl px-3.5 py-2 text-xs text-[#707280] dark:text-gray-400 cursor-not-allowed opacity-80"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#18191F] dark:text-gray-200 mb-1">
                    Learning Bio
                  </label>
                  <input
                    type="text"
                    defaultValue="Learner • Dreamer • Collaborative Builder"
                    className="w-full bg-[#FAF7F2] dark:bg-[#252834] border border-[#E5DFD6] dark:border-[#383A4A] rounded-xl px-3.5 py-2 text-xs text-[#18191F] dark:text-gray-100 focus:outline-hidden focus:ring-2 focus:ring-[#543FE3] transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-4 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* Card 1 Footer: Save Changes Button */}
          <div className="mt-6 flex items-center justify-between pt-4 border-t border-[#F2EDE5] dark:border-[#2D2F3C]">
            {saveSuccess ? (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                ✓ Changes saved successfully!
              </span>
            ) : (
              <span className="text-[11px] text-[#707280] dark:text-gray-400">
                Syncs across all active studio rooms
              </span>
            )}

            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="bg-[#543FE3] hover:bg-[#4632D0] disabled:opacity-50 active:scale-95 text-white font-medium text-xs sm:text-sm px-6 py-2 rounded-full shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Appearance & workspace card */}
        <div className="lg:col-span-4 xl:col-span-4 bg-white dark:bg-[#1E202B] border border-[#E9E4DB] dark:border-[#2F3140] rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="font-heading font-extrabold text-base sm:text-lg text-[#18191F] dark:text-[#F3F4F6] mb-1">
              Appearance & Workspace
            </h3>
            <div className="text-xs font-semibold text-[#18191F] dark:text-gray-200 mt-3 mb-2.5">
              Visual Theme
            </div>

            {/* 3 Theme Mockup Cards */}
            <div className="grid grid-cols-3 gap-2.5">
              <ThemeOption
                id="warm-light"
                label="Warm Light"
                isSelected={selectedTheme === 'warm-light'}
                onSelect={handleSelectTheme}
                bgClass="bg-[#FFF8EE]"
                barClass="bg-[#E8DDD0]"
                cardClass="bg-[#DCD1C4]"
              />
              <ThemeOption
                id="dark"
                label="Deep Ink Dark"
                isSelected={selectedTheme === 'dark'}
                onSelect={handleSelectTheme}
                bgClass="bg-[#181920]"
                barClass="bg-[#2A2B36]"
                cardClass="bg-[#363847]"
              />
              <ThemeOption
                id="system"
                label="System Adaptive"
                isSelected={selectedTheme === 'system'}
                onSelect={handleSelectTheme}
                bgClass="bg-gradient-to-r from-[#FFF8EE] to-[#1E202B]"
                barClass="bg-gray-400/50"
                cardClass="bg-gray-400/30"
              />
            </div>

            {/* Toggles list */}
            <div className="mt-5 space-y-3 pt-3 border-t border-[#F2EDE5] dark:border-[#2D2F3C]">
              <ToggleSwitch
                label="Show subtle canvas grid dots"
                checked={showGridDots}
                onChange={setShowGridDots}
              />
              <ToggleSwitch
                label="Sound effects on room interactions"
                checked={showSoundEffects}
                onChange={setShowSoundEffects}
              />
              <ToggleSwitch
                label="Reduced motion"
                checked={reducedMotion}
                onChange={setReducedMotion}
              />
            </div>
          </div>
        </div>

        {/* Studio video & audio settings card */}
        <div className="lg:col-span-3 xl:col-span-3 bg-white dark:bg-[#1E202B] border border-[#E9E4DB] dark:border-[#2F3140] rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <h3 className="font-heading font-extrabold text-base sm:text-lg text-[#18191F] dark:text-[#F3F4F6] leading-snug">
              Studio Video & Audio
            </h3>

            {/* Built-in Personal WebRTC Video & Audio Engine */}
            <div>
              <div className="text-xs font-semibold text-[#18191F] dark:text-gray-200 mb-1.5">
                Real-Time Video Engine
              </div>
              <div className="inline-flex items-center gap-1.5 bg-[#DCFCE7] dark:bg-[#1B3E29] text-[#15803D] dark:text-[#4ADE80] font-semibold text-xs px-3 py-1 rounded-full border border-[#BBF7D0] dark:border-[#2B5E3C]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Built-in WebRTC Studio</span>
              </div>
            </div>

            {/* Default Microphone & Camera Dropdowns */}
            <div className="space-y-2.5 pt-2">
              <div className="text-xs font-semibold text-[#18191F] dark:text-gray-200">
                Default Microphone & Camera
              </div>

              {/* Microphone select */}
              <div className="relative">
                <select
                  value={selectedMic}
                  onChange={(e) => setSelectedMic(e.target.value)}
                  className="w-full appearance-none bg-[#FAF7F2] dark:bg-[#252834] border border-[#E5DFD6] dark:border-[#383A4A] rounded-xl px-3 py-2 text-xs text-[#18191F] dark:text-gray-100 pr-8 focus:outline-hidden focus:ring-2 focus:ring-[#543FE3] cursor-pointer"
                >
                  <option value="Default Microphone">Default Microphone</option>
                  <option value="Headset Microphone (Realtek)">Headset Microphone (Realtek)</option>
                  <option value="Built-in Studio Mic">Built-in Studio Mic</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-500">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>

              {/* Camera select */}
              <div className="relative">
                <select
                  value={selectedCamera}
                  onChange={(e) => setSelectedCamera(e.target.value)}
                  className="w-full appearance-none bg-[#FAF7F2] dark:bg-[#252834] border border-[#E5DFD6] dark:border-[#383A4A] rounded-xl px-3 py-2 text-xs text-[#18191F] dark:text-gray-100 pr-8 focus:outline-hidden focus:ring-2 focus:ring-[#543FE3] cursor-pointer"
                >
                  <option value="Camera 2">Camera 2</option>
                  <option value="FHD Web Camera (Default)">FHD Web Camera (Default)</option>
                  <option value="Virtual Cam OBS">Virtual Cam OBS</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-500">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="space-y-3 pt-3 border-t border-[#F2EDE5] dark:border-[#2D2F3C]">
              <div className="text-xs font-semibold text-[#18191F] dark:text-gray-200">
                Studio Notifications
              </div>

              <ToggleSwitch
                label="Room invites"
                checked={roomInvitesNotif}
                onChange={setRoomInvitesNotif}
              />
              <ToggleSwitch
                label="Live activity alerts"
                checked={liveActivityNotif}
                onChange={setLiveActivityNotif}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
