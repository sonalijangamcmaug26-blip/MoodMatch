import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { TOKEN_KEY } from '../services/api';
import { fetchProfile, loginUser, registerUser } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // true while we check a saved token when the app first opens
  const [initialising, setInitialising] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));

  // Restore the session from a saved token
  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    fetchProfile()
      .then(setUser)
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setInitialising(false));
  }, []);

  // The axios interceptor fires this when the token expires
  useEffect(() => {
    const handleExpired = () => setUser(null);
    window.addEventListener('moodmatch:session-expired', handleExpired);
    return () => window.removeEventListener('moodmatch:session-expired', handleExpired);
  }, []);

  const login = useCallback(async (credentials) => {
    const { token, user: loggedInUser } = await loginUser(credentials);
    localStorage.setItem(TOKEN_KEY, token);
    setUser(loggedInUser);
  }, []);

  const register = useCallback((details) => registerUser(details), []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), initialising, login, register, logout }),
    [user, initialising, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
