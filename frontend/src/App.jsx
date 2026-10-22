import React, { useState, useEffect } from 'react';
import Home from './pages/Home';

/**
 * Root Application Component
 * Manages global theme, room modal state, and renders top-level pages
 */
export default function App() {
  const [theme, setTheme] = useState('light');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'join'
  const [activeRoomCode, setActiveRoomCode] = useState('');

  // Synchronize data-theme on root HTML document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

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
    <Home
      theme={theme}
      onToggleTheme={toggleTheme}
      isModalOpen={isModalOpen}
      setIsModalOpen={setIsModalOpen}
      modalMode={modalMode}
      activeRoomCode={activeRoomCode}
      onStartRoom={handleStartRoom}
      onJoinRoom={handleJoinRoom}
    />
  );
}
