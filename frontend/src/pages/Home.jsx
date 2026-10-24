import React, { useState } from 'react';
import Navbar from '../components/common/Navbar';
import HeroSection from '../components/hero/HeroSection';
import FloatingMockup from '../components/showcase/FloatingMockup';
import FeaturesSection from '../components/features/FeaturesSection';
import ExploreSection from '../components/explore/ExploreSection';
import AboutSection from '../components/about/AboutSection';
import Footer from '../components/common/Footer';
import RoomModal from '../components/room/RoomModal';

/**
 * HomePage Component
 * Main landing page, live interactive room showcase, features, and explore rooms section
 */
export default function Home({ theme, onToggleTheme }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'join'
  const [activeRoomCode, setActiveRoomCode] = useState('');

  const handleStartRoom = () => {
    setModalMode('create');
    setActiveRoomCode(`LR-${Math.floor(1000 + Math.random() * 9000)}`);
    setIsModalOpen(true);
  };

  const handleJoinRoom = (code) => {
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
          <FloatingMockup />
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
