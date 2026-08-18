import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { User } from '@/types';
import { authService } from '@/services/authService';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
  updateProfile: (patch: Partial<User>) => User;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => authService.getCurrentUser());

  const login = useCallback(async (email: string, password: string) => {
    const u = await authService.login(email, password);
    setUser(u);
    return u;
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const u = await authService.signup(name, email, password);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const updateProfile = useCallback((patch: Partial<User>) => {
    const u = authService.updateProfile(patch);
    setUser(u);
    return u;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isAdmin: user?.isAdmin === true,
      login,
      signup,
      logout,
      updateProfile,
      setUser,
    }),
    [user, login, signup, logout, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
