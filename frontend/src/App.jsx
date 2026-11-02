import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
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
 * Configures React Router routes with authentication guards:
 * - Public: Landing page (/) & Login page (/login)
 * - Protected: Dashboard (/dashboard/*) & Live Room (/room/:roomId)
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
      <AuthProvider>
        <SmoothScrollProvider>
          <Routes>
            {/* Public Landing / Home Page */}
            <Route
              path="/"
              element={<Home theme={theme} onToggleTheme={toggleTheme} />}
            />

            {/* Public Login Page */}
            <Route
              path="/login"
              element={<Login theme={theme} onToggleTheme={toggleTheme} />}
            />

            {/* Protected Learning Room Dashboard */}
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute>
                  <Dashboard theme={theme} onToggleTheme={toggleTheme} />
                </ProtectedRoute>
              }
            />

            {/* Protected Live Collaborative Room */}
            <Route
              path="/room/:roomId"
              element={
                <ProtectedRoute>
                  <RoomPage theme={theme} onToggleTheme={toggleTheme} />
                </ProtectedRoute>
              }
            />
            <Route path="/room" element={<Navigate to="/dashboard" replace />} />

            {/* Fallback route redirects to landing page */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SmoothScrollProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
