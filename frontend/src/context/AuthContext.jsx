import { createContext, useContext, useEffect, useState } from 'react';
import { ROLES } from '../utils/constants';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Firebase's own listener resolves the session on page load/refresh.
    const unsubscribe = authService.onAuthStateChanged((account) => {
      setUser(account);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (credentials) => {
    const account = await authService.login(credentials);
    setUser(account);
    return account;
  };

  const loginWithGoogle = async () => {
    const account = await authService.loginWithGoogle();
    setUser(account);
    return account;
  };

  const register = async (payload) => {
    const account = await authService.register(payload);
    setUser(account);
    return account;
  };

  const registerWithGoogle = async () => {
    const account = await authService.registerWithGoogle();
    setUser(account);
    return account;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const updateUser = (partial) => setUser((prev) => (prev ? { ...prev, ...partial } : prev));

  return (
    <AuthContext.Provider
      value={{ user, loading, login, loginWithGoogle, register, registerWithGoogle, logout, updateUser, ROLES, isRealAuth: authService.isRealAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
