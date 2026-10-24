import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  footerPencil,
  ratneshAvatar,
  learningRoomLogo,
} from '../assets';
import RoomModal from '../components/room/RoomModal';
import HomeView from '../components/dashboard/HomeView';
import ActivityView from '../components/dashboard/ActivityView';
import ExploreView from '../components/dashboard/ExploreView';
import MyRoomsView from '../components/dashboard/MyRoomsView';
import SettingsView from '../components/dashboard/SettingsView';

/**
 * Dashboard Component
 * Clean and maintainable layout with:
 * - Sub-routes for Home, Explore, My Rooms, Activity, and Settings
 * - Smooth slide-over drawer from the left on mobile devices
 * - Brand logo click showing the dashboard home
 */
export default function Dashboard({ theme = 'light', onToggleTheme }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('join'); // 'join' | 'create'
  const [activeRoomCode, setActiveRoomCode] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchInputRef = useRef(null);
  const location = useLocation();

  // Determine active tab cleanly from location.pathname
  const getActiveTab = () => {
    const path = (location.pathname || '').toLowerCase();
    if (path.includes('/explore')) return 'Explore';
    if (path.includes('/my-rooms')) return 'My Rooms';
    if (path.includes('/activity')) return 'Activity';
    if (path.includes('/settings')) return 'Settings';
    return 'Home';
  };

  const activeTab = getActiveTab();

  // Keyboard shortcut Ctrl+K / Cmd+K to focus search bar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close mobile drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleOpenJoin = (code = '') => {
    setModalMode('join');
    setActiveRoomCode(code);
    setIsModalOpen(true);
  };

  const handleOpenCreate = () => {
    setModalMode('create');
    setActiveRoomCode(`LR-${Math.floor(1000 + Math.random() * 9000)}`);
    setIsModalOpen(true);
  };

  const handleOpenMeet = () => {
    window.open('https://meet.google.com/new', '_blank', 'noopener,noreferrer');
  };

  const navItems = [
    {
      name: 'Home',
      path: '/dashboard',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      name: 'Explore',
      path: '/dashboard/explore',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      ),
    },
    {
      name: 'My Rooms',
      path: '/dashboard/my-rooms',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      name: 'Activity',
      path: '/dashboard/activity',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
    },
    {
      name: 'Settings',
      path: '/dashboard/settings',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    },
  ];

  const isItemActive = (item) => {
    if (item.path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/dashboard/';
    }
    return location.pathname.startsWith(item.path);
  };

  const renderNavList = () => (
    <nav className="space-y-1.5">
      {navItems.map((item) => {
        const active = isItemActive(item);
        return (
          <Link
            key={item.name}
            to={item.path}
            onClick={() => setMobileMenuOpen(false)}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-150 ${
              active
                ? 'bg-[#EAE5FC] dark:bg-[#342D59] text-[#543FE3] dark:text-[#B6A8FF] shadow-xs'
                : 'text-[#4A4B53] dark:text-[#9B9DA8] hover:bg-[#F2EFE9] dark:hover:bg-[#1E2026] hover:text-[#18191E] dark:hover:text-[#FFFFFF]'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={active ? 'text-[#543FE3] dark:text-[#B6A8FF]' : 'text-[#676872] dark:text-[#888A96]'}>
                {item.icon}
              </span>
              <span>{item.name}</span>
            </div>
            {active && (
              <span className="w-2 h-2 rounded-full bg-[#543FE3] dark:bg-[#B6A8FF]" />
            )}
          </Link>
        );
      })}
    </nav>
  );

  const renderPencilDoodle = () => {
    const isExplore = location.pathname.includes('/explore');
    return (
      <div className="pt-2 relative select-none mt-auto overflow-hidden">
        {/* Soft Ambient Purple Glow in Bottom-Left Corner */}
        <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-purple-300/35 dark:bg-purple-900/30 blur-xl pointer-events-none -z-10" />

        <div className="font-handwriting text-2xl lg:text-[25px] font-bold text-[#1E1F24] dark:text-[#E8EAEE] leading-tight rotate-[-4deg] ml-2 mb-1">
          {isExplore ? (
            <>
              Find your<br />community!
            </>
          ) : (
            <>
              Keep<br />Learning!
            </>
          )}
          <div className="text-lg ml-3 -mt-0.5 select-none">◡̈</div>
        </div>

        {/* Pencil using footerPencil asset angled downward into bottom-left corner */}
        <div className="w-32 lg:w-36 h-24 lg:h-26 relative -ml-3 -mb-1 pointer-events-none flex items-center justify-start">
          <img
            src={footerPencil}
            alt="Hand-drawn purple pencil"
            className="w-full h-auto object-contain rotate-[215deg] drop-shadow-xs select-none"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen w-full bg-[#FAF8F5] dark:bg-[#121316] text-[#1E1F24] dark:text-[#EBEBF0] flex font-sans transition-colors duration-200 selection:bg-purple-200 overflow-hidden">
      {/* ========================================================= */}
      {/* MOBILE SIDEBAR DRAWER (SMOOTH SLIDE FROM LEFT)            */}
      {/* ========================================================= */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-visibility duration-300 ${
          mobileMenuOpen ? 'pointer-events-auto visible' : 'pointer-events-none invisible'
        }`}
      >
        {/* Backdrop with smooth fade */}
        <div
          className={`fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300 ease-in-out ${
            mobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Sidebar panel smoothly sliding from the left */}
        <aside
          className={`fixed top-0 bottom-0 left-0 w-72 max-w-[85vw] bg-[#FAF8F5] dark:bg-[#121316] h-full p-5 flex flex-col justify-between z-10 shadow-2xl border-r border-[#EDE8E1] dark:border-[#26282E] overflow-y-auto overflow-x-hidden select-none transform transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-8">
              {/* Brand Logo - Navigates to Dashboard Home Page */}
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 cursor-pointer group"
                title="Dashboard Home"
              >
                <img
                  src={learningRoomLogo}
                  alt="Learning Room Logo"
                  className="w-8 h-8 sm:w-9 sm:h-9 object-contain shrink-0 drop-shadow-2xs"
                />
                <div className="font-heading font-extrabold text-[17px] leading-[1.08] text-[#17181C] dark:text-[#F3F4F6]">
                  Learning<br />Room<span className="text-[#543FE3]">.</span>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            {renderNavList()}
          </div>

          {renderPencilDoodle()}
        </aside>
      </div>

      {/* ========================================================= */}
      {/* 1. LEFT SIDEBAR (STICKY & IMMOVABLE IN DESKTOP VIEWPORT)  */}
      {/* ========================================================= */}
      <aside className="w-56 lg:w-64 flex-shrink-0 border-r border-[#EDE8E1] dark:border-[#26282E] p-5 lg:p-6 flex flex-col justify-between hidden md:flex h-screen sticky top-0 overflow-y-auto overflow-x-hidden select-none z-30 custom-scrollbar">
        <div className="space-y-6">
          {/* Brand Logo - Navigates to Dashboard Home Page */}
          <Link
            to="/dashboard"
            className="flex items-center gap-2.5 cursor-pointer group"
            title="Dashboard Home"
          >
            <img
              src={learningRoomLogo}
              alt="Learning Room Logo"
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain shrink-0 group-hover:scale-105 transition-transform drop-shadow-2xs"
            />
            <div className="font-heading font-extrabold text-[17px] leading-[1.08] tracking-tight text-[#17181C] dark:text-[#F3F4F6]">
              Learning<br />Room<span className="text-[#543FE3]">.</span>
            </div>
          </Link>

          {/* Navigation Items List */}
          {renderNavList()}
        </div>

        {/* Bottom Left Doodle Decor with footerPencil */}
        {renderPencilDoodle()}
      </aside>

      {/* ========================================================= */}
      {/* 2. MAIN SCROLLABLE CONTENT AREA (INDEPENDENT SCROLL)     */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto overflow-x-hidden min-w-0 relative custom-scrollbar">
        {/* STICKY TOP NAVBAR */}
        <header className="px-5 sm:px-6 py-3.5 flex items-center justify-between gap-3 sm:gap-4 border-b border-[#EDE8E1] dark:border-[#26282E]/50 sticky top-0 bg-[#FAF8F5]/90 dark:bg-[#121316]/90 backdrop-blur-md z-30 flex-shrink-0">
          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-[#EFECE6] dark:hover:bg-[#23252E] transition-colors flex-shrink-0 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          {/* Search Input Bar with Ctrl+K shortcut */}
          <div className="flex-1 max-w-md relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search rooms, topics, or members..."
              className="w-full pl-10 pr-12 py-2 rounded-full bg-[#EAE6DF] dark:bg-[#1E2026] text-xs sm:text-sm text-[#18191E] dark:text-[#FFFFFF] placeholder-gray-500 dark:placeholder-gray-400 border border-transparent focus:border-[#543FE3] focus:bg-white dark:focus:bg-[#18191E] focus:outline-none transition-all"
            />
            <span className="hidden sm:inline-block absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-gray-400 bg-white/70 dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-300 dark:border-gray-700">
              ⌘K
            </span>
          </div>

          {/* Right Header Controls: Notification, Theme Toggle, User Avatar */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Notification Bell */}
            <button
              type="button"
              className="relative p-2 rounded-full hover:bg-[#EFECE6] dark:hover:bg-[#23252E] text-gray-600 dark:text-gray-300 transition-colors cursor-pointer"
              title="Notifications"
              aria-label="Notifications"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
              {/* Red notification dot */}
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E5484D] ring-2 ring-white dark:ring-[#121316]" />
            </button>

            {/* Theme Toggle Pill Capsule */}
            <button
              type="button"
              onClick={onToggleTheme}
              className="flex items-center bg-[#EAE6DF] dark:bg-[#282A33] rounded-full p-0.5 border border-[#DFDAD0] dark:border-[#383A46] transition-colors cursor-pointer"
              title="Switch Theme"
              aria-label="Switch Theme"
            >
              <div
                className={`flex items-center justify-center w-6 h-6 rounded-full transition-all ${
                  theme === 'dark'
                    ? 'bg-[#543FE3] text-amber-200 shadow-xs'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
              </div>
              <div
                className={`flex items-center justify-center w-6 h-6 rounded-full transition-all ${
                  theme === 'light'
                    ? 'bg-white text-amber-500 shadow-xs'
                    : 'text-gray-400'
                }`}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </svg>
              </div>
            </button>

            {/* User Avatar Circle */}
            <div className="relative">
              <img
                src={ratneshAvatar}
                alt="Ratnesh Chaturvedi"
                className="w-9 h-9 rounded-full object-cover ring-2 ring-purple-300 dark:ring-purple-700 shadow-2xs"
              />
            </div>
          </div>
        </header>

        {/* Dynamic Dashboard Views based on current path */}
        {activeTab === 'Explore' ? (
          <div className="flex-1 p-5 sm:p-6 lg:p-7">
            <ExploreView
              onOpenRoom={handleOpenJoin}
              onOpenCreateRoom={handleOpenCreate}
            />
          </div>
        ) : activeTab === 'My Rooms' ? (
          <div className="flex-1 p-5 sm:p-6 lg:p-7">
            <MyRoomsView
              onOpenRoom={handleOpenJoin}
              onOpenCreateRoom={handleOpenCreate}
            />
          </div>
        ) : activeTab === 'Activity' ? (
          <div className="flex-1 p-5 sm:p-6 lg:p-7">
            <ActivityView onOpenRoom={handleOpenJoin} />
          </div>
        ) : activeTab === 'Settings' ? (
          <div className="flex-1 p-5 sm:p-6 lg:p-7">
            <SettingsView theme={theme} onToggleTheme={onToggleTheme} />
          </div>
        ) : (
          <HomeView
            onOpenJoin={handleOpenJoin}
            onOpenCreate={handleOpenCreate}
            onOpenMeet={handleOpenMeet}
          />
        )}
      </div>

      {/* Persistent Room Creation/Joining Modal */}
      <RoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        initialCode={activeRoomCode}
      />
    </div>
  );
}
