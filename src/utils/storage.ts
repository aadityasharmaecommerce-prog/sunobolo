/**
 * Safe localStorage wrapper. All persistence in the app goes through this
 * module so Phase 2 can swap it for the Cloudflare Worker API without
 * touching components.
 */

function canUseStorage(): boolean {
  try {
    return typeof window !== 'undefined' && !!window.localStorage;
  } catch {
    return false;
  }
}

export function readStorage<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full / private mode — fail silently
  }
}

export function removeStorage(key: string): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}
