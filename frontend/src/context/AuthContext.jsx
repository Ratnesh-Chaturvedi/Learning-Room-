import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { authApi } from '../api/auth.api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const urlUser = urlParams?.get('user');
      if (urlUser) {
        const parsed = JSON.parse(decodeURIComponent(urlUser));
        try {
          localStorage.setItem('learningroom_user', JSON.stringify(parsed));
        } catch (_e) {}
        return parsed;
      }
      const saved = localStorage.getItem('learningroom_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    try {
      const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const urlToken = urlParams?.get('token');
      if (urlToken) {
        try {
          localStorage.setItem('learningroom_token', urlToken);
        } catch (_e) {}
        return urlToken;
      }
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
    } catch (_e) {
      // Ignore storage errors
    }

    setToken(newToken);
    setUser(newUser);
  }, []);

  // Verify session on mount (and clean OAuth URL tokens)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('token=')) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }

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
      const fallbackUser = {
        id: `dev-user-${userNum}`,
        name: `Dev User ${userNum}`,
        email: `dev${userNum}@learningroom.app`,
      };
      const fallbackToken = `dev_jwt_user_${userNum}`;
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
