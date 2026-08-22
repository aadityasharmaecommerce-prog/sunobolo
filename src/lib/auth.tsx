/**
 * SunoBolo Auth — Server-first mobile + PIN authentication
 *
 * Strategy:
 * 1. Backend (D1) is the SOLE source of truth for subscription/premium status
 * 2. localStorage is ONLY an offline cache for user identity (name, email, phone)
 * 3. Subscription ALWAYS comes from backend — never from localStorage timer
 * 4. Login uses mobile number + 6-digit PIN/password
 * 5. One-device enforcement: server invalidates previous sessions on new login
 * 6. Logout only destroys the session cookie — never deletes account/progress
 * 7. "User not found" is NEVER shown for network failures or expired sessions
 * 8. Password reset is 100% server-side via D1 reset_tokens table
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

export interface Subscription {
  active: boolean;
  plan_id?: string;
  started_at?: string;
  expires_at?: string;
}

interface AuthState {
  user: User | null;
  subscription: Subscription;
  loading: boolean;
  checkMobile: (phone: string) => Promise<{ exists: boolean; name?: string; error?: string }>;
  signup: (name: string, phone: string, email: string, password: string) => Promise<{ error?: string }>;
  login: (phone: string, password: string) => Promise<{ error?: string }>;
  forgotPassword: (email: string) => Promise<{ error?: string; success?: boolean }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ error?: string; success?: boolean }>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
  activateSubscription: (planId: string) => void;
}

const AuthContext = createContext<AuthState>({
  user: null,
  subscription: { active: false },
  loading: true,
  checkMobile: async () => ({ exists: false }),
  signup: async () => ({}),
  login: async () => ({}),
  forgotPassword: async () => ({}),
  resetPassword: async () => ({}),
  logout: () => {},
  refreshAuth: async () => {},
  activateSubscription: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

// ── localStorage helpers (offline cache only) ──
const SESSION_KEY = 'sb_session';

function saveSession(phone: string | null) {
  if (phone) localStorage.setItem(SESSION_KEY, JSON.stringify({ phone }));
  else localStorage.removeItem(SESSION_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription>({ active: false });
  const [loading, setLoading] = useState(true);

  // ── Refresh auth: ALWAYS fetch from backend ──
  const refreshAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          const backendUser: User = {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            phone: data.user.phone || undefined,
            avatar: data.user.avatar_url || undefined,
          };
          setUser(backendUser);

          // Cache user identity in localStorage (for offline display only)
          saveSession(backendUser.phone || null);

          // Subscription ALWAYS from backend — NEVER from localStorage
          setSubscription(data.subscription || { active: false });
          return;
        }
      }
      // Backend says no session — clear user state
      setUser(null);
      setSubscription({ active: false });
    } catch {
      // Network failure — keep current state, do NOT show "User not found"
    }
  }, []);

  useEffect(() => {
    refreshAuth().finally(() => setLoading(false));
  }, [refreshAuth]);

  // ── Check if mobile number exists ──
  const checkMobile = useCallback(async (phone: string) => {
    try {
      const res = await fetch('/api/auth/check-mobile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        return { exists: data.exists, name: data.name || undefined };
      }
      return { exists: false, error: data.error || 'Failed to check mobile number' };
    } catch {
      return { exists: false, error: 'Network error. Please try again.' };
    }
  }, []);

  // ── Phone + Password Signup ──
  const signup = useCallback(async (name: string, phone: string, email: string, password: string) => {
    if (password.length < 6) {
      return { error: 'Password must be at least 6 characters.' };
    }

    // Try backend signup (creates server account + session cookie)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, phone, email: email || undefined, password }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.user) {
        saveSession(data.user.phone || null);
        setUser({
          id: data.user.id,
          name: data.user.name || name.trim(),
          email: data.user.email || email,
          phone: data.user.phone || phone,
        });
        setSubscription({ active: false });
        return {};
      }

      if (data.error) {
        return { error: data.error };
      }
    } catch {
      return { error: 'Network error. Please try again.' };
    }

    return { error: 'Signup failed. Please try again.' };
  }, []);

  // ── Phone + Password Login ──
  const login = useCallback(async (phone: string, password: string) => {
    // Try backend login (creates sb_session cookie for Razorpay)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.user) {
        saveSession(data.user.phone || null);
        setUser({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone,
        });
        setSubscription(data.subscription || { active: false });
        return {};
      }

      if (data.error) {
        return { error: data.error };
      }
    } catch {
      return { error: 'Network error. Please try again.' };
    }

    return { error: 'Login failed. Please try again.' };
  }, []);

  // ── Forgot Password (server-side via D1) ──
  const forgotPassword = useCallback(async (email: string) => {
    const lowerEmail = email.toLowerCase().trim();

    // Call backend — never reveal whether email exists
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: lowerEmail }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        return { success: true };
      }
      if (data.error) {
        return { error: data.error };
      }
    } catch {
      return { error: 'Network error. Please try again.' };
    }

    return { success: true }; // Always show success to prevent email enumeration
  }, []);

  // ── Reset Password (server-side via D1) ──
  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    if (newPassword.length < 6) {
      return { error: 'Password must be at least 6 characters.' };
    }

    // Call backend — token verification happens server-side
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        return { success: true };
      }
      if (data.error) {
        return { error: data.error };
      }
    } catch {
      return { error: 'Network error. Please try again.' };
    }

    return { error: 'Password reset failed. Please try again.' };
  }, []);

  // ── Logout: destroy session ONLY. Never delete account/subscription/progress ──
  const logout = useCallback(() => {
    // Clear session state immediately
    saveSession(null);
    setUser(null);
    setSubscription({ active: false });

    // Destroy server session (fire-and-forget)
    fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    }).catch(() => {});
  }, []);

  // ── Activate Subscription (client-side only for immediate UI update) ──
  const activateSubscription = useCallback((_planId: string) => {
    refreshAuth();
  }, [refreshAuth]);

  return (
    <AuthContext.Provider value={{
      user, subscription, loading,
      checkMobile, signup, login,
      forgotPassword, resetPassword,
      logout, refreshAuth, activateSubscription,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
