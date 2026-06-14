import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);
const authChannel = new BroadcastChannel('auth_channel');

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth: fetch profile from API to check if session is active
  useEffect(() => {
    const initAuth = async () => {
      try {
        const freshUser = await authService.getProfile();
        setUser(freshUser);
        setToken("session-active");
      } catch (err) {
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  // Listen to cross-tab auth messages
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'LOGOUT') {
        setUser(null);
        setToken(null);
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      } else if (event.data && event.data.type === 'LOGIN') {
        // Sync active login state in other tabs
        authService.getProfile()
          .then(freshUser => {
            setUser(freshUser);
            setToken("session-active");
          })
          .catch(() => {
            setUser(null);
            setToken(null);
          });
      }
    };

    authChannel.addEventListener('message', handleMessage);
    return () => {
      authChannel.removeEventListener('message', handleMessage);
    };
  }, []);

  // Periodic silent refresh of the JWT access token
  useEffect(() => {
    if (!user) return;

    // Refresh every 14 minutes (access token expires in 15 minutes)
    const interval = setInterval(async () => {
      try {
        await authService.refresh();
      } catch (err) {
        console.error('Silent token refresh failed:', err);
      }
    }, 14 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authService.login(email, password);
      setUser(res.user);
      setToken("session-active");
      try {
        authChannel.postMessage({ type: 'LOGIN' });
      } catch (e) {
        // ignore
      }
      return res;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setToken(null);
      try {
        authChannel.postMessage({ type: 'LOGOUT' });
      } catch (e) {
        // ignore
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
