import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import HeroSection from '../components/hero/HeroSection';
import FloatingMockup from '../components/showcase/FloatingMockup';
import FeaturesSection from '../components/features/FeaturesSection';
import ExploreSection from '../components/explore/ExploreSection';
import AboutSection from '../components/about/AboutSection';
import Footer from '../components/common/Footer';
import RoomModal from '../components/room/RoomModal';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

/**
 * HomePage Component
 * Main landing page, live interactive room showcase, features, and explore rooms section.
 * Visible to everyone. When unauthenticated visitors click to create/join rooms,
 * they are prompted to sign in with Google first.
 */
export default function Home({ theme: propTheme, onToggleTheme: propToggle } = {}) {
  const { theme: contextTheme, toggleTheme: contextToggle } = useTheme();
  const theme = propTheme || contextTheme;
  const onToggleTheme = propToggle || contextToggle;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'join'
  const [activeRoomCode, setActiveRoomCode] = useState('');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Ensure landing page stays at the top on refresh instead of jumping downwards
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
  }, []);

  const handleStartRoom = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/dashboard' } } });
      return;
    }
    setModalMode('create');
    setActiveRoomCode('');
    setIsModalOpen(true);
  };

  const handleJoinRoom = (code) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: code ? `/room/${code}` : '/dashboard' } } });
      return;
    }
    setModalMode('join');
    setActiveRoomCode(code || '');
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen w-full max-w-full overflow-x-clip bg-[var(--color-background)] transition-colors duration-200">
      {/* Top Application Navigation */}
      <Navbar
        onOpenCreateRoom={handleStartRoom}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />

      {/* Main Landing Hero */}
      <main className="flex-1 flex flex-col">
        <HeroSection
          onStartRoom={handleStartRoom}
          onJoinRoom={handleJoinRoom}
        />

        {/* Floating Tactile Window Showcase with Interactive Canvas & Live Chat */}
        <section className="w-full px-2 sm:px-6 pb-12 sm:pb-16" aria-label="Interactive room showcase">
          <FloatingMockup theme={theme} />
        </section>

        {/* Features Showcase Section */}
        <FeaturesSection />

        {/* Explore Rooms Showcase Section */}
        <ExploreSection
          onJoinRoom={handleJoinRoom}
          onStartRoom={handleStartRoom}
        />

        {/* About Learning Room Section */}
        <AboutSection onStartRoom={handleStartRoom} />
      </main>

      {/* Footer Section */}
      <Footer onStartRoom={handleStartRoom} />

      {/* Persistent Room Creation & Joining Modal */}
      <RoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        initialCode={activeRoomCode}
      />
    </div>
  );
}
