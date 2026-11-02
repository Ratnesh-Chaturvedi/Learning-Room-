import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { learningRoomLogo } from '../assets';
import ThemeToggle from '../components/common/ThemeToggle';

export default function Login() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const errorParam = urlParams.get('error');
      if (errorParam) {
        window.history.replaceState({}, document.title, window.location.pathname);
        return decodeURIComponent(errorParam);
      }
    } catch {
      // Ignore URL parsing errors
    }
    return '';
  });

  // Target destination after successful login
  const from = location.state?.from?.pathname || '/dashboard';

  // If already authenticated, redirect immediately
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Handle Google OAuth via Backend OAuth 2.0 Flow
  const handleGoogleSignIn = () => {
    setIsLoading(true);
    setErrorMessage('');
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
    window.location.href = `${backendUrl}/auth/google`;
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-[var(--color-background)] transition-colors duration-200">
      {/* Top Bar with Logo & Theme Toggle */}
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-[var(--color-border)]/60">
        <Link
          to="/"
          className="flex items-center gap-2 font-heading font-extrabold text-lg text-[var(--color-text-primary)] hover:opacity-90"
        >
          <img
            src={learningRoomLogo}
            alt="Learning Room Logo"
            className="w-8 h-8 object-contain"
          />
          <div className="flex items-baseline">
            <span>Learning</span>
            <span className="ml-1 text-[var(--color-brand)]">Room.</span>
          </div>
        </Link>
        <ThemeToggle />
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative">
        {/* Soft Ambient Background Glow */}
        <div className="absolute w-96 h-96 rounded-full bg-indigo-500/10 dark:bg-purple-900/20 blur-3xl pointer-events-none" />

        <div className="relative w-full max-w-md rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl p-7 sm:p-9 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-[#F4EFFE] dark:bg-[#2C2344] mb-1">
              <img
                src={learningRoomLogo}
                alt="Logo"
                className="w-10 h-10 object-contain drop-shadow-xs"
              />
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[var(--color-text-primary)] tracking-tight">
              Sign in to Learning Room
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] max-w-xs mx-auto leading-relaxed">
              Sign in with your Google account to access your personal study dashboard, rooms, and whiteboard sessions.
            </p>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-medium flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Single Google Sign In Button */}
          <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1E2028] hover:bg-gray-50 dark:hover:bg-[#282B36] text-gray-800 dark:text-gray-100 font-semibold text-sm shadow-xs hover:shadow transition-all duration-150 active:scale-[0.99] cursor-pointer disabled:opacity-50"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
            </button>
          </div>

          {/* Footer Notice */}
          <div className="pt-2 text-center space-y-3">
            <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
              By continuing, you agree to LearningRoom's{' '}
              <a href="#terms" className="underline hover:text-[var(--color-brand)]">Terms</a> and{' '}
              <a href="#privacy" className="underline hover:text-[var(--color-brand)]">Privacy Policy</a>.
            </p>
            <div>
              <Link
                to="/"
                className="text-xs font-semibold text-[var(--color-brand)] hover:underline inline-flex items-center gap-1"
              >
                <span>← Back to Landing Page</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-[var(--color-text-secondary)]">
        &copy; {new Date().getFullYear()} Learning Room Inc. All rights reserved.
      </footer>
    </div>
  );
}
