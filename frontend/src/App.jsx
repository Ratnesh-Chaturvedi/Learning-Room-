import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RoomPage from './pages/RoomPage';
import SmoothScrollProvider from './components/common/SmoothScrollProvider';

/**
 * Root Application Component
 * Configures React Router routes with authentication guards:
 * - Public: Landing page (/) & Login page (/login)
 * - Protected: Dashboard (/dashboard/*) & Live Room (/room/:roomId)
 * 
 * Cleanly wraps the application tree with ThemeProvider and AuthProvider,
 * eliminating prop-drilling across routes.
 */
export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <SmoothScrollProvider>
            <Routes>
              {/* Public Landing / Home Page */}
              <Route path="/" element={<Home />} />

              {/* Public Login Page */}
              <Route path="/login" element={<Login />} />

              {/* Protected Learning Room Dashboard */}
              <Route
                path="/dashboard/*"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* Live Collaborative Room (Accessible to logged-in users and guest collaborators) */}
              <Route path="/room/:roomId" element={<RoomPage />} />
              <Route path="/r/:roomId" element={<RoomPage />} />
              <Route path="/room" element={<Navigate to="/dashboard" replace />} />

              {/* Fallback route redirects to landing page */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </SmoothScrollProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
