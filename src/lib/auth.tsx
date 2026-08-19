/**
 * SunoBolo Auth — Email/Password + localStorage
 * No backend needed. All data stored in browser localStorage.
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { PLANS, type PlanId } from '../config/plans';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
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
  signup: (name: string, email: string, password: string, phone?: string) => Promise<{ error?: string }>;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => void;
  refreshAuth: () => void;
  activateSubscription: (planId: string) => void;
}

const AuthContext = createContext<AuthState>({
  user: null,
  subscription: { active: false },
  loading: true,
  signup: async () => ({}),
  login: async () => ({}),
  logout: () => {},
  refreshAuth: () => {},
  activateSubscription: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

// --- localStorage helpers ---
const USERS_KEY = 'sb_users';
const SESSION_KEY = 'sb_session';
const SUB_KEY = 'sb_subscription';

function getUsers(): Record<string, { id: string; name: string; email: string; phone?: string; password: string }> {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '{}'); } catch { return {}; }
}

function saveUsers(users: Record<string, { id: string; name: string; email: string; phone?: string; password: string }>) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getSession(): { email: string } | null {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; }
}

function saveSession(email: string | null) {
  if (email) localStorage.setItem(SESSION_KEY, JSON.stringify({ email }));
  else localStorage.removeItem(SESSION_KEY);
}

function getSubscriptions(): Record<string, Subscription> {
  try { return JSON.parse(localStorage.getItem(SUB_KEY) || '{}'); } catch { return {}; }
}

function saveSubscriptions(subs: Record<string, Subscription>) {
  localStorage.setItem(SUB_KEY, JSON.stringify(subs));
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return 'h_' + Math.abs(hash).toString(36);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription>({ active: false });
  const [loading, setLoading] = useState(true);

  const refreshAuth = useCallback(() => {
    const session = getSession();
    if (!session) {
      setUser(null);
      setSubscription({ active: false });
      return;
    }
    const users = getUsers();
    const userData = users[session.email];
    if (!userData) {
      setUser(null);
      setSubscription({ active: false });
      saveSession(null);
      return;
    }
    const { password: _, ...safeUser } = userData;
    setUser(safeUser);

    // Check subscription expiry
    const subs = getSubscriptions();
    const sub = subs[session.email];
    if (sub && sub.active && sub.expires_at) {
      const expiry = new Date(sub.expires_at);
      if (expiry > new Date()) {
        setSubscription(sub);
      } else {
        sub.active = false;
        subs[session.email] = sub;
        saveSubscriptions(subs);
        setSubscription({ active: false });
      }
    } else {
      setSubscription(sub || { active: false });
    }
  }, []);

  useEffect(() => {
    refreshAuth();
    setLoading(false);
  }, [refreshAuth]);

  const signup = useCallback(async (name: string, email: string, password: string, phone?: string) => {
    const users = getUsers();
    const lowerEmail = email.toLowerCase().trim();

    if (users[lowerEmail]) {
      return { error: 'Email already registered. Please login.' };
    }
    if (password.length < 6) {
      return { error: 'Password must be at least 6 characters.' };
    }

    const id = 'u_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    users[lowerEmail] = { id, name: name.trim(), email: lowerEmail, phone, password: simpleHash(password) };
    saveUsers(users);

    saveSession(lowerEmail);
    const { password: _, ...safeUser } = users[lowerEmail];
    setUser(safeUser);
    setSubscription({ active: false });
    return {};
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const users = getUsers();
    const lowerEmail = email.toLowerCase().trim();
    const userData = users[lowerEmail];

    if (!userData) {
      return { error: 'Account not found. Please sign up first.' };
    }
    if (userData.password !== simpleHash(password)) {
      return { error: 'Incorrect password. Try again.' };
    }

    saveSession(lowerEmail);
    const { password: _, ...safeUser } = userData;
    setUser(safeUser);

    // Load subscription
    const subs = getSubscriptions();
    const sub = subs[lowerEmail];
    if (sub && sub.active && sub.expires_at && new Date(sub.expires_at) > new Date()) {
      setSubscription(sub);
    } else {
      setSubscription({ active: false });
    }
    return {};
  }, []);

  const logout = useCallback(() => {
    saveSession(null);
    setUser(null);
    setSubscription({ active: false });
  }, []);

  const activateSubscription = useCallback((planId: string) => {
    if (!user) return;

    const plan = PLANS[planId as PlanId];
    if (!plan) return;

    const now = new Date();
    const expires = new Date(now.getTime() + plan.durationMonths * 30 * 24 * 60 * 60 * 1000);

    const newSub: Subscription = {
      active: true,
      plan_id: planId,
      started_at: now.toISOString(),
      expires_at: expires.toISOString(),
    };

    const subs = getSubscriptions();
    subs[user.email] = newSub;
    saveSubscriptions(subs);
    setSubscription(newSub);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, subscription, loading, signup, login, logout, refreshAuth, activateSubscription }}>
      {children}
    </AuthContext.Provider>
  );
}
