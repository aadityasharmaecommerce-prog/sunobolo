/**
 * SunoBolo — Badge persistence & new-badge detection.
 *
 * Stores earned badge IDs in localStorage.
 * On each check, compares current earned set vs previously saved set
 * and returns only the NEWLY earned badges (for toast notifications).
 */

import { checkBadges, BADGES, type Badge } from '../config/badges';
import type { NestedProgress } from './progress';

const BADGES_KEY = 'sb_earned_badges_v1';

function loadEarned(): string[] {
  try {
    const raw = localStorage.getItem(BADGES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEarned(ids: string[]): void {
  try {
    localStorage.setItem(BADGES_KEY, JSON.stringify(ids));
  } catch {
    /* ignore */
  }
}

/**
 * Check badges against current progress, persist new ones,
 * and return only the badges that were JUST earned (not previously saved).
 */
export function checkAndPersistBadges(
  progress: NestedProgress,
  courseLessonCounts: Record<string, number> = {},
): Badge[] {
  const previouslyEarned = new Set(loadEarned());
  const allChecks = checkBadges(progress, courseLessonCounts);
  const nowEarned = allChecks.filter((c) => c.earned);

  // Save full set
  saveEarned(nowEarned.map((c) => c.badge.id));

  // Return only newly earned (not in previous set)
  return nowEarned
    .filter((c) => !previouslyEarned.has(c.badge.id))
    .map((c) => c.badge);
}

/** Get all currently earned badge IDs (without triggering persistence). */
export function getCurrentlyEarned(): Set<string> {
  return new Set(loadEarned());
}

/** Get a badge by ID. */
export function getBadgeById(id: string): Badge | undefined {
  return BADGES.find((b) => b.id === id);
}
