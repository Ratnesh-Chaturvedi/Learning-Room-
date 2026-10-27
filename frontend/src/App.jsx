import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import RoomPage from './pages/RoomPage';
import SmoothScrollProvider from './components/common/SmoothScrollProvider';

// Resolve and apply saved user theme immediately when App module loads
const getInitialTheme = () => {
  try {
    const saved = localStorage.getItem('learningroom_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
};

// Immediate document bootstrap before React renders
try {
  const initialTheme = getInitialTheme();
  document.documentElement.setAttribute('data-theme', initialTheme);
  document.documentElement.classList.toggle('dark', initialTheme === 'dark');
} catch (e) {}

/**
 * Root Application Component
 * Configures React Router routes for landing page (/), dashboard (/dashboard/*),
 * and live collaborative meeting room (/room/:roomId)
 */
export default function App() {
  const [theme, setTheme] = useState(getInitialTheme);

  // Synchronize data-theme, dark class, and localStorage on root HTML document
  useEffect(() => {
    try {
      localStorage.setItem('learningroom_theme', theme);
    } catch (e) {}
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem('learningroom_theme', next);
      } catch (e) {}
      return next;
    });
  };

  return (
    <BrowserRouter>
      <SmoothScrollProvider>
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
      </SmoothScrollProvider>
    </BrowserRouter>
  );
}
