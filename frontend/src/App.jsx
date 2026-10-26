import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import RoomPage from './pages/RoomPage';

/**
 * Root Application Component
 * Configures React Router routes for landing page (/), dashboard (/dashboard/*),
 * and live collaborative meeting room (/room/:roomId)
 */
export default function App() {
  const [theme, setTheme] = useState('light');

  // Synchronize data-theme on root HTML document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Landing / Home Page */}
        <Route
          path="/"
          element={<Home theme={theme} onToggleTheme={toggleTheme} />}
        />

        {/* Learning Room Dashboard */}
        <Route
          path="/dashboard/*"
          element={<Dashboard theme={theme} onToggleTheme={toggleTheme} />}
        />

        {/* Live Collaborative Meeting Room (Demo ID e.g. /room/1234) */}
        <Route
          path="/room/:roomId"
          element={<RoomPage theme={theme} onToggleTheme={toggleTheme} />}
        />
        <Route path="/room" element={<Navigate to="/room/1234" replace />} />

        {/* Fallback route redirects to landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
