/**
 * SunoBolo Auth — Google OAuth + session management
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
}

interface Subscription {
  active: boolean;
  started_at?: string;
  expires_at?: string;
  plan_id?: string;
}

interface AuthState {
  user: User | null;
  subscription: Subscription;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  subscription: { active: false },
  loading: true,
  login: async () => {},
  logout: async () => {},
  refreshAuth: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

const API_BASE = '';

interface MeResponse {
  user: User | null;
  subscription: Subscription;
}

interface GoogleLoginResponse {
  user: User;
  subscription: Subscription;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription>({ active: false });
  const [loading, setLoading] = useState(true);

  const refreshAuth = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, { credentials: 'include' });
      const data: MeResponse = await res.json();
      setUser(data.user);
      setSubscription(data.subscription);
    } catch {
      setUser(null);
      setSubscription({ active: false });
    }
  }, []);

  useEffect(() => {
    refreshAuth().finally(() => setLoading(false));
  }, [refreshAuth]);

  const login = useCallback(async () => {
    if (!window.google?.accounts?.id) {
      await new Promise<void>((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.onload = () => resolve();
        document.head.appendChild(script);
      });
    }

    return new Promise<void>((resolve) => {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
      if (!clientId) { console.error('VITE_GOOGLE_CLIENT_ID not set'); resolve(); return; }

      window.google!.accounts!.id!.initialize({
        client_id: clientId,
        callback: async (response: { credential?: string }) => {
          if (!response.credential) { resolve(); return; }
          try {
            const res = await fetch(`${API_BASE}/api/auth/google`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ credential: response.credential }),
            });
            const data: GoogleLoginResponse = await res.json();
            if (data.user) { setUser(data.user); setSubscription(data.subscription); }
          } catch (e) { console.error('Login failed:', e); }
          resolve();
        },
      });
      window.google!.accounts!.id!.prompt();
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch { /* ignore */ }
    setUser(null);
    setSubscription({ active: false });
  }, []);

  return (
    <AuthContext.Provider value={{ user, subscription, loading, login, logout, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: { client_id: string; callback: (response: { credential?: string }) => void }) => void;
          prompt: () => void;
        };
      };
    };
  }
}
