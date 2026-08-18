import type { User } from '@/types';
import { STORAGE_KEYS } from '@/constants';
import { readStorage, removeStorage, writeStorage } from '@/utils/storage';
import { mockDelay } from './apiClient';

const AVATAR_COLORS = ['sky', 'rose', 'emerald', 'violet', 'amber', 'teal', 'indigo'] as const;

function randomColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

/** Demo admin account for the mock admin panel. */
const ADMIN_EMAIL = 'admin@sunobolo.com';

/**
 * Mock authentication for Phase 1.
 * Any email/password works. Phase 2 replaces these bodies with
 * Cloudflare Worker auth endpoints — the component layer stays untouched.
 */
export const authService = {
  async login(email: string, password: string): Promise<User> {
    await mockDelay(500);
    if (!email.includes('@') || password.length < 4) {
      throw new Error('Invalid credentials. (Mock auth: koi bhi email + 4+ character password chalega.)');
    }
    const normalized = email.trim().toLowerCase();
    const existing: User | null = readStorage<User | null>(STORAGE_KEYS.user, null);
    const user: User = existing ?? {
      id: `u-${Date.now()}`,
      name: normalized.split('@')[0].replace(/[._-]/g, ' '),
      email: normalized,
      avatarColor: randomColor(),
      createdAt: new Date().toISOString(),
      isAdmin: normalized === ADMIN_EMAIL,
    };
    // Promote if the demo admin email is used.
    if (normalized === ADMIN_EMAIL && !user.isAdmin) user.isAdmin = true;
    writeStorage(STORAGE_KEYS.user, user);
    return user;
  },

  async signup(name: string, email: string, password: string): Promise<User> {
    await mockDelay(600);
    if (!email.includes('@') || password.length < 4) {
      throw new Error('Please use a valid email and a password with 4+ characters.');
    }
    const normalized = email.trim().toLowerCase();
    const user: User = {
      id: `u-${Date.now()}`,
      name: name.trim() || normalized.split('@')[0],
      email: normalized,
      avatarColor: randomColor(),
      createdAt: new Date().toISOString(),
      isAdmin: normalized === ADMIN_EMAIL,
    };
    writeStorage(STORAGE_KEYS.user, user);
    return user;
  },

  async forgotPassword(email: string): Promise<void> {
    await mockDelay(700);
    if (!email.includes('@')) throw new Error('Please enter a valid email.');
    // Phase 1: mock only. Phase 2: Worker sends a reset link.
  },

  logout(): void {
    removeStorage(STORAGE_KEYS.user);
  },

  getCurrentUser(): User | null {
    return readStorage<User | null>(STORAGE_KEYS.user, null);
  },

  updateProfile(patch: Partial<User>): User {
    const current = this.getCurrentUser() ?? {
      id: `u-${Date.now()}`,
      name: 'Guest',
      email: '',
      avatarColor: randomColor(),
      createdAt: new Date().toISOString(),
    };
    const next = { ...current, ...patch };
    writeStorage(STORAGE_KEYS.user, next);
    return next;
  },

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  },

  isAdmin(): boolean {
    return this.getCurrentUser()?.isAdmin === true;
  },
};
