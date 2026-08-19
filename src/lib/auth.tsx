/**
 * SunoBolo Auth — Google OAuth + session management
 *
 * Auth flow:
 *   1. User clicks "Continue with Google"
 *   2. Google Identity Services renders popup
 *   3. On success, sends credential JWT to POST /api/auth/google
 *   4. Backend creates/finds user, creates session, sets HttpOnly cookie
 *   5. Frontend stores user + subscription state in React context
 *
 * Session restore:
 *   On mount, GET /api/auth/me checks cookie → restores user if valid
 *
 * Security:
 *   - Session cookie is HttpOnly, Secure, SameSite=Lax
 *   - Frontend NEVER stores auth tokens
 *   - All protected API calls go through cookie auth
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

const API_BASE = ''; // Same origin — Cloudflare Pages Functions

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

  /** Fetch current user from session cookie. */
  const refreshAuth = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        credentials: 'include',
      });
      const data: MeResponse = await res.json();
      setUser(data.user);
      setSubscription(data.subscription);
    } catch {
      setUser(null);
      setSubscription({ active: false });
    }
  }, []);

  /** Restore session on mount. */
  useEffect(() => {
    refreshAuth().finally(() => setLoading(false));
  }, [refreshAuth]);

  /** Google OAuth login — uses Google Identity Services (GIS) script. */
  const login = useCallback(async () => {
    // Load Google Identity Services if not already loaded
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

      if (!clientId) {
        console.error('VITE_GOOGLE_CLIENT_ID not set');
        resolve();
        return;
      }

      window.google!.accounts!.id!.initialize({
        client_id: clientId,
        callback: async (response: { credential?: string }) => {
          if (!response.credential) {
            resolve();
            return;
          }

          try {
            const res = await fetch(`${API_BASE}/api/auth/google`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ credential: response.credential }),
            });

            const data: GoogleLoginResponse = await res.json();

            if (data.user) {
              setUser(data.user);
              setSubscription(data.subscription);
            }
          } catch (e) {
            console.error('Login failed:', e);
          }
          resolve();
        },
      });

      window.google!.accounts!.id!.prompt();
    });
  }, []);

  /** Logout — destroy session on server, clear local state. */
  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Ignore — clear local state anyway
    }
    setUser(null);
    setSubscription({ active: false });
  }, []);

  return (
    <AuthContext.Provider value={{ user, subscription, loading, login, logout, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

// Extend Window for Google Identity Services
declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
          }) => void;
          prompt: () => void;
        };
      };
    };
  }
}
