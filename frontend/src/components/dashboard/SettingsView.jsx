import React, { useState } from 'react';
import { ratneshAvatar, burstLines } from '../../assets';

export default function SettingsView({ theme = 'light', onToggleTheme }) {

  // Profile Form State
  const [fullName, setFullName] = useState('Ratnesh Chaturvedi');
  const [username, setUsername] = useState('@ratnesh_learns');
  const [bio, setBio] = useState('Learner • Dreamer • Builder');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Theme & Appearance State
  const [selectedTheme, setSelectedTheme] = useState(theme === 'dark' ? 'dark' : 'warm-light');
  const [showGridDots, setShowGridDots] = useState(true);
  const [showSoundEffects, setShowSoundEffects] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Audio & Integration State
  const [selectedMic, setSelectedMic] = useState('Default Microphone');
  const [selectedCamera, setSelectedCamera] = useState('Camera 2');
  const [roomInvitesNotif, setRoomInvitesNotif] = useState(true);
  const [liveActivityNotif, setLiveActivityNotif] = useState(true);

  // Avatar list for changing avatar
  const [avatarIndex, setAvatarIndex] = useState(0);


  const handleSave = (e) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSelectTheme = (mode) => {
    setSelectedTheme(mode);
    if (mode === 'dark' && theme !== 'dark') {
      onToggleTheme?.();
    } else if (mode === 'warm-light' && theme === 'dark') {
      onToggleTheme?.();
    } else if (mode === 'system') {
      // follow system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if ((prefersDark && theme !== 'dark') || (!prefersDark && theme === 'dark')) {
        onToggleTheme?.();
      }
    }
  };

  return (
    <div className="w-full max-w-[1560px] mx-auto space-y-6 animate-fade-in relative pb-10">
      {/* ========================================================= */}
      {/* 1. TOP HEADER SECTION                                     */}
      {/* ========================================================= */}
      <div className="pt-3 sm:pt-4 flex flex-wrap items-baseline gap-x-3.5 gap-y-1.5">
        {/* Title with the 3 radiating lines precisely aligned on top of "Settings" */}
        <div className="relative inline-block">
          {/* 3 Radiating burst doodle on top-left corner of Settings */}
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

        {/* Sub-headline: "Customize your studio & preferences" with hand-drawn squiggle */}
        <div className="relative inline-block">
          <h2 className="font-editorial italic font-medium text-2xl sm:text-3xl lg:text-[34px] text-[#18191F] dark:text-[#FFFFFF] tracking-tight">
            Customize your studio & preferences
          </h2>
          {/* Purple hand-drawn ink squiggle underline */}
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


      {/* ========================================================= */}
      {/* 3. MAIN SETTINGS CARDS GRID (RESPONSIVE)                  */}
      {/* ========================================================= */}
      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        {/* Floating handwritten doodle on the left: "Make it yours! ✨" */}
        <div className="hidden xl:block absolute -left-14 2xl:-left-20 top-24 pointer-events-none select-none z-10">
          <div className="font-handwriting font-bold text-base text-[#18191F] dark:text-gray-200 rotate-[-8deg]">
            Make it<br />yours!
          </div>
          <svg className="w-8 h-8 text-[#18191F] dark:text-gray-200 ml-4 mt-0.5" viewBox="0 0 32 32" fill="none">
            <path d="M 2 12 Q 18 10, 24 22 M 18 20 L 25 23 L 26 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* --------------------------------------------------------- */}
        {/* CARD 1: PROFILE INFORMATION                               */}
        {/* --------------------------------------------------------- */}
        <div className="lg:col-span-5 xl:col-span-5 bg-white dark:bg-[#1E202B] border border-[#E9E4DB] dark:border-[#2F3140] rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="font-heading font-extrabold text-base sm:text-lg text-[#18191F] dark:text-[#F3F4F6] mb-5">
              Profile Information
            </h3>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              {/* Left Column: Avatar + Change Button */}
              <div className="flex flex-col items-center shrink-0">
                <div className="relative">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-tr from-[#9E8BFF] to-[#E5D7FC] dark:from-[#543FE3] dark:to-[#8E79FF] shadow-xs">
                    <img
                      src={ratneshAvatar}
                      alt={fullName}
                      className="w-full h-full rounded-full object-cover ring-2 ring-white dark:ring-[#1E202B]"
                    />
                  </div>
                  {/* Online status indicator dot */}
                  <span className="absolute bottom-1 right-2 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#1E202B]" />
                </div>

                <button
                  type="button"
                  onClick={() => setAvatarIndex((prev) => (prev + 1) % 3)}
                  className="mt-3.5 bg-white dark:bg-[#252833] hover:bg-gray-50 dark:hover:bg-[#2D303D] active:scale-95 text-[#18191F] dark:text-gray-100 border border-[#D5CFCA] dark:border-[#3E4150] font-medium text-xs px-3.5 py-1.5 rounded-full transition-all cursor-pointer shadow-2xs"
                >
                  Change Avatar
                </button>
              </div>

              {/* Right Column: Profile Inputs */}
              <div className="w-full flex-1 space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#18191F] dark:text-gray-200 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#FAF7F2] dark:bg-[#252834] border border-[#E5DFD6] dark:border-[#383A4A] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#18191F] dark:text-gray-100 focus:outline-hidden focus:ring-2 focus:ring-[#543FE3] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#18191F] dark:text-gray-200 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[#FAF7F2] dark:bg-[#252834] border border-[#E5DFD6] dark:border-[#383A4A] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#18191F] dark:text-gray-100 focus:outline-hidden focus:ring-2 focus:ring-[#543FE3] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#18191F] dark:text-gray-200 mb-1">
                    Bio
                  </label>
                  <input
                    type="text"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-[#FAF7F2] dark:bg-[#252834] border border-[#E5DFD6] dark:border-[#383A4A] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#18191F] dark:text-gray-100 focus:outline-hidden focus:ring-2 focus:ring-[#543FE3] transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 1 Footer: Save Changes Button */}
          <div className="mt-6 flex items-center justify-between pt-4 border-t border-[#F2EDE5] dark:border-[#2D2F3C]">
            {saveSuccess ? (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                ✓ Changes saved!
              </span>
            ) : (
              <span className="text-[11px] text-[#707280] dark:text-gray-400">
                Updated profile syncs to all rooms
              </span>
            )}

            <button
              type="button"
              onClick={handleSave}
              className="bg-[#543FE3] hover:bg-[#4632D0] active:scale-95 text-white font-medium text-xs sm:text-sm px-6 py-2 rounded-full shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </div>

        {/* --------------------------------------------------------- */}
        {/* CARD 2: APPEARANCE & WORKSPACE                            */}
        {/* --------------------------------------------------------- */}
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
              {/* Option 1: Warm Light */}
              <div
                onClick={() => handleSelectTheme('warm-light')}
                className="group cursor-pointer flex flex-col items-center"
              >
                <div
                  className={`w-full aspect-[4/3] rounded-xl p-2 bg-[#FFF8EE] border transition-all relative overflow-hidden flex flex-col justify-between ${
                    selectedTheme === 'warm-light'
                      ? 'border-[#543FE3] ring-2 ring-[#543FE3]/30 shadow-xs'
                      : 'border-[#EAE1D2] hover:border-[#543FE3]/50'
                  }`}
                >
                  {/* Window dots */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    </div>
                    {selectedTheme === 'warm-light' && (
                      <div className="w-4 h-4 rounded-full bg-[#543FE3] text-white flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </div>
                    )}
                  </div>
                  {/* Miniature UI sketch */}
                  <div className="flex gap-1.5 my-auto">
                    <div className="w-2 h-7 rounded-xs bg-[#E8DDD0]" />
                    <div className="flex-1 space-y-1">
                      <div className="w-8 h-2 rounded-xs bg-[#E8DDD0]" />
                      <div className="w-12 h-2.5 rounded-xs bg-[#DCD1C4]" />
                      <div className="w-6 h-2 rounded-full bg-[#543FE3]/70" />
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-[#18191F] dark:text-gray-200 mt-1.5 text-center">
                  Warm Light
                </span>
              </div>

              {/* Option 2: Deep Ink Dark */}
              <div
                onClick={() => handleSelectTheme('dark')}
                className="group cursor-pointer flex flex-col items-center"
              >
                <div
                  className={`w-full aspect-[4/3] rounded-xl p-2 bg-[#181920] border transition-all relative overflow-hidden flex flex-col justify-between ${
                    selectedTheme === 'dark'
                      ? 'border-[#543FE3] ring-2 ring-[#543FE3]/30 shadow-xs'
                      : 'border-[#303240] hover:border-[#543FE3]/50'
                  }`}
                >
                  {/* Window dots */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    </div>
                    {selectedTheme === 'dark' && (
                      <div className="w-4 h-4 rounded-full bg-[#543FE3] text-white flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </div>
                    )}
                  </div>
                  {/* Miniature UI sketch */}
                  <div className="flex gap-1.5 my-auto">
                    <div className="w-2 h-7 rounded-xs bg-[#2A2B36]" />
                    <div className="flex-1 space-y-1">
                      <div className="w-8 h-2 rounded-xs bg-[#2A2B36]" />
                      <div className="w-12 h-2.5 rounded-xs bg-[#363847]" />
                      <div className="w-6 h-2 rounded-full bg-[#543FE3]" />
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-[#18191F] dark:text-gray-200 mt-1.5 text-center">
                  Deep Ink Dark
                </span>
              </div>

              {/* Option 3: System Adaptive */}
              <div
                onClick={() => handleSelectTheme('system')}
                className="group cursor-pointer flex flex-col items-center"
              >
                <div
                  className={`w-full aspect-[4/3] rounded-xl p-2 bg-gradient-to-r from-[#FFF8EE] to-[#1E202B] border transition-all relative overflow-hidden flex flex-col justify-between ${
                    selectedTheme === 'system'
                      ? 'border-[#543FE3] ring-2 ring-[#543FE3]/30 shadow-xs'
                      : 'border-[#D8D2C6] dark:border-[#383A4A] hover:border-[#543FE3]/50'
                  }`}
                >
                  {/* Window dots */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    </div>
                    {selectedTheme === 'system' && (
                      <div className="w-4 h-4 rounded-full bg-[#543FE3] text-white flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </div>
                    )}
                  </div>
                  {/* Miniature UI sketch */}
                  <div className="flex gap-1.5 my-auto">
                    <div className="w-2 h-7 rounded-xs bg-gray-400/50" />
                    <div className="flex-1 space-y-1">
                      <div className="w-8 h-2 rounded-xs bg-gray-400/50" />
                      <div className="w-12 h-2.5 rounded-xs bg-gray-400/30" />
                      <div className="w-6 h-2 rounded-full bg-[#543FE3]" />
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-[#18191F] dark:text-gray-200 mt-1.5 text-center">
                  System Adaptive
                </span>
              </div>
            </div>

            {/* Toggles list */}
            <div className="mt-5 space-y-3 pt-3 border-t border-[#F2EDE5] dark:border-[#2D2F3C]">
              {/* Toggle 1: Show subtle canvas grid dots */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#18191F] dark:text-gray-200 font-medium">
                  Show subtle canvas grid dots
                </span>
                <button
                  type="button"
                  onClick={() => setShowGridDots(!showGridDots)}
                  className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                    showGridDots ? 'bg-[#543FE3]' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      showGridDots ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Toggle 2: Show subtle canvas grid dots (or sound effects) */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#18191F] dark:text-gray-200 font-medium">
                  Show subtle canvas grid dots
                </span>
                <button
                  type="button"
                  onClick={() => setShowSoundEffects(!showSoundEffects)}
                  className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                    showSoundEffects ? 'bg-[#543FE3]' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      showSoundEffects ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Toggle 3: Reduced motion */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#18191F] dark:text-gray-200 font-medium">
                  Reduced motion
                </span>
                <button
                  type="button"
                  onClick={() => setReducedMotion(!reducedMotion)}
                  className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                    reducedMotion ? 'bg-[#543FE3]' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      reducedMotion ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* --------------------------------------------------------- */}
        {/* CARD 3: CONNECTED INTEGRATIONS & AUDIO                    */}
        {/* --------------------------------------------------------- */}
        <div className="lg:col-span-3 xl:col-span-3 bg-white dark:bg-[#1E202B] border border-[#E9E4DB] dark:border-[#2F3140] rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <h3 className="font-heading font-extrabold text-base sm:text-lg text-[#18191F] dark:text-[#F3F4F6] leading-snug">
              Connected Integrations & Audio
            </h3>

            {/* Google Meet Account Section */}
            <div>
              <div className="text-xs font-semibold text-[#18191F] dark:text-gray-200 mb-1.5">
                Google Meet Account
              </div>
              <div className="inline-flex items-center gap-1.5 bg-[#DCFCE7] dark:bg-[#1B3E29] text-[#15803D] dark:text-[#4ADE80] font-semibold text-xs px-3 py-1 rounded-full border border-[#BBF7D0] dark:border-[#2B5E3C]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Connected</span>
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

            {/* Notification Preferences Section */}
            <div className="space-y-3 pt-3 border-t border-[#F2EDE5] dark:border-[#2D2F3C]">
              <div className="text-xs font-semibold text-[#18191F] dark:text-gray-200">
                Notification Preferences
              </div>

              {/* Toggle: Room invites */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#18191F] dark:text-gray-200 font-medium">
                  Room invites
                </span>
                <button
                  type="button"
                  onClick={() => setRoomInvitesNotif(!roomInvitesNotif)}
                  className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                    roomInvitesNotif ? 'bg-[#543FE3]' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      roomInvitesNotif ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Toggle: Live activity */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#18191F] dark:text-gray-200 font-medium">
                  Live activity
                </span>
                <button
                  type="button"
                  onClick={() => setLiveActivityNotif(!liveActivityNotif)}
                  className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                    liveActivityNotif ? 'bg-[#543FE3]' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      liveActivityNotif ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
