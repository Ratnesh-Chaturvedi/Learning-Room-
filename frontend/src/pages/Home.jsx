import React from 'react';
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
export default function Home({
  theme,
  onToggleTheme,
  isModalOpen,
  setIsModalOpen,
  modalMode,
  activeRoomCode,
  onStartRoom,
  onJoinRoom,
}) {
  return (
    <div className="flex flex-col min-h-screen w-full max-w-full overflow-x-clip bg-[var(--color-background)] transition-colors duration-200">
      {/* Top Application Navigation */}
      <Navbar
        onOpenCreateRoom={onStartRoom}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />

      {/* Main Landing Hero */}
      <main className="flex-1 flex flex-col">
        <HeroSection
          onStartRoom={onStartRoom}
          onJoinRoom={onJoinRoom}
        />

        {/* Floating Tactile Window Showcase with Interactive Canvas & Live Chat */}
        <section className="w-full px-2 sm:px-6 pb-12 sm:pb-16" aria-label="Interactive room showcase">
          <FloatingMockup />
        </section>

        {/* Features Showcase Section */}
        <FeaturesSection />

        {/* Explore Rooms Showcase Section */}
        <ExploreSection
          onJoinRoom={onJoinRoom}
          onStartRoom={onStartRoom}
        />

        {/* About Learning Room Section */}
        <AboutSection onStartRoom={onStartRoom} />
      </main>

      {/* Footer Section */}
      <Footer onStartRoom={onStartRoom} />

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
