import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { authApi } from '../api/auth.api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('learningroom_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('learningroom_token') || null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(true);

  // Sync state to localStorage
  const saveSession = useCallback((newToken, newUser) => {
    try {
      if (newToken) {
        localStorage.setItem('learningroom_token', newToken);
      } else {
        localStorage.removeItem('learningroom_token');
      }

      if (newUser) {
        localStorage.setItem('learningroom_user', JSON.stringify(newUser));
      } else {
        localStorage.removeItem('learningroom_user');
      }
    } catch {}

    setToken(newToken);
    setUser(newUser);
  }, []);

  // Verify session on mount (or capture from Google OAuth redirect)
  useEffect(() => {
    // 1. Check if returning from Google OAuth redirect with ?token=...&user=...
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('token');
      const urlUser = urlParams.get('user');

      if (urlToken && urlUser) {
        const parsedUser = JSON.parse(decodeURIComponent(urlUser));
        saveSession(urlToken, parsedUser);
        setIsLoading(false);
        // Clean URL parameters from browser address bar
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }
    } catch {}

    const verifySession = async () => {
      const savedToken = localStorage.getItem('learningroom_token');
      if (!savedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await authApi.getMe();
        if (response?.data?.user) {
          saveSession(savedToken, response.data.user);
        }
      } catch (err) {
        // Only wipe session if token is genuinely invalid or expired
        const isAuthError =
          err.message?.includes('401') ||
          err.message?.includes('Invalid or expired') ||
          err.message?.includes('token required');

        if (isAuthError) {
          saveSession(null, null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();

    // Listen for auth expiration events from Axios interceptor
    const handleAuthExpired = () => {
      saveSession(null, null);
    };

    window.addEventListener('learningroom:auth-expired', handleAuthExpired);
    return () => window.removeEventListener('learningroom:auth-expired', handleAuthExpired);
  }, [saveSession]);

  // Google One-Tap / ID Token login
  const loginWithGoogle = useCallback(async (idToken) => {
    setIsLoading(true);
    try {
      const response = await authApi.googleLogin(idToken);
      const { user: loggedInUser, accessToken } = response.data;
      saveSession(accessToken, loggedInUser);
      return loggedInUser;
    } finally {
      setIsLoading(false);
    }
  }, [saveSession]);

  // Local / Developer login (authenticates dev user with real signed JWT from backend)
  const loginDevUser = useCallback(async (userNum = 1) => {
    setIsLoading(true);
    try {
      const response = await authApi.devLogin(userNum);
      const { user: devUser, accessToken } = response.data;
      saveSession(accessToken, devUser);
      return devUser;
    } catch (err) {
      console.warn('[DevLogin] Backend dev login fallback:', err);
      const isMaya = userNum === 2;
      const fallbackUser = {
        id: isMaya ? 'dev-user-maya' : 'dev-user-ratnesh',
        name: isMaya ? 'Maya Sharma' : 'Ratnesh Tiwari',
        email: isMaya ? 'maya@learningroom.app' : 'ratnesh@learningroom.app',
        avatar: isMaya
          ? 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      };
      const fallbackToken = `dev_jwt_${isMaya ? 'maya' : 'ratnesh'}`;
      saveSession(fallbackToken, fallbackUser);
      return fallbackUser;
    } finally {
      setIsLoading(false);
    }
  }, [saveSession]);

  const updateUser = useCallback((updatedFields) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedFields };
      try {
        localStorage.setItem('learningroom_user', JSON.stringify(merged));
      } catch {}
      return merged;
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore network failures on logout
    } finally {
      saveSession(null, null);
    }
  }, [saveSession]);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isLoading,
      loginWithGoogle,
      loginDevUser,
      logout,
      updateUser,
    }),
    [user, token, isLoading, loginWithGoogle, loginDevUser, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
