import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { learningRoomLogo } from '../../assets';

/**
 * Route guard that requires user authentication.
 * If not authenticated, redirects to /login and saves current location in state.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-background)]">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <img
            src={learningRoomLogo}
            alt="Learning Room"
            className="w-12 h-12 object-contain"
          />
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#543FE3] animate-ping" />
            <p className="text-sm font-semibold text-[var(--color-text-secondary)]">
              Verifying your session...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login, but save the current location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

