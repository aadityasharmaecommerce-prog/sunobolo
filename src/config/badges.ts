/**
 * SunoBolo — Achievement Badge Definitions
 *
 * ONE source of truth for all badges.
 * Each badge has an id, display info, and a check function
 * that receives progress data and returns whether the badge is earned.
 */

import type { NestedProgress } from '../lib/progress';
import { computeStreak } from '../lib/progress';

export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  /** Gradient classes for earned state */
  gradient: string;
  /** Category for grouping */
  category: 'milestone' | 'streak' | 'volume' | 'course' | 'special';
}

export interface BadgeCheck {
  badge: Badge;
  earned: boolean;
}

// ── Badge catalog ──

export const BADGES: Badge[] = [
  // ── Milestones ──
  {
    id: 'first_sentence',
    name: 'First Word',
    description: 'Complete your first sentence',
    emoji: '🌟',
    gradient: 'from-amber-400 to-orange-500',
    category: 'milestone',
  },
  {
    id: 'first_lesson',
    name: 'Lesson Done!',
    description: 'Complete your first full lesson',
    emoji: '🎓',
    gradient: 'from-blue-500 to-cyan-500',
    category: 'milestone',
  },
  {
    id: 'free_trial_done',
    name: 'Trial Champion',
    description: 'Complete the 25-sentence free trial',
    emoji: '🏆',
    gradient: 'from-violet-500 to-purple-600',
    category: 'milestone',
  },

  // ── Streaks ──
  {
    id: 'streak_3',
    name: 'On Fire',
    description: '3-day practice streak',
    emoji: '🔥',
    gradient: 'from-orange-400 to-red-500',
    category: 'streak',
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: '7-day practice streak',
    emoji: '⚡',
    gradient: 'from-yellow-400 to-amber-500',
    category: 'streak',
  },
  {
    id: 'streak_14',
    name: 'Unstoppable',
    description: '14-day practice streak',
    emoji: '💫',
    gradient: 'from-pink-400 to-rose-500',
    category: 'streak',
  },
  {
    id: 'streak_30',
    name: 'Monthly Master',
    description: '30-day practice streak',
    emoji: '👑',
    gradient: 'from-yellow-500 to-orange-500',
    category: 'streak',
  },

  // ── Volume ──
  {
    id: 'sentences_10',
    name: 'Getting Started',
    description: 'Complete 10 sentences',
    emoji: '📝',
    gradient: 'from-gray-400 to-gray-500',
    category: 'volume',
  },
  {
    id: 'sentences_50',
    name: 'Half Century',
    description: 'Complete 50 sentences',
    emoji: '🎯',
    gradient: 'from-green-400 to-emerald-500',
    category: 'volume',
  },
  {
    id: 'sentences_100',
    name: 'Century',
    description: 'Complete 100 sentences',
    emoji: '💯',
    gradient: 'from-blue-400 to-indigo-500',
    category: 'volume',
  },
  {
    id: 'sentences_250',
    name: 'Quarter Hero',
    description: 'Complete 250 sentences',
    emoji: '🦸',
    gradient: 'from-purple-400 to-violet-500',
    category: 'volume',
  },
  {
    id: 'sentences_500',
    name: 'Superstar',
    description: 'Complete 500 sentences',
    emoji: '⭐',
    gradient: 'from-amber-400 to-yellow-500',
    category: 'volume',
  },
  {
    id: 'sentences_1000',
    name: 'Legend',
    description: 'Complete 1,000 sentences',
    emoji: '🏅',
    gradient: 'from-yellow-400 to-amber-500',
    category: 'volume',
  },

  // ── Courses ──
  {
    id: 'course_1',
    name: 'Course Conqueror',
    description: 'Complete your first course',
    emoji: '📚',
    gradient: 'from-indigo-400 to-blue-500',
    category: 'course',
  },
  {
    id: 'course_3',
    name: 'Polyglot',
    description: 'Complete 3 courses',
    emoji: '🌍',
    gradient: 'from-teal-400 to-cyan-500',
    category: 'course',
  },
  {
    id: 'course_all',
    name: 'Master',
    description: 'Complete all courses',
    emoji: '🎖️',
    gradient: 'from-red-400 to-pink-500',
    category: 'course',
  },

  // ── Special ──
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Practice after 10 PM',
    emoji: '🦉',
    gradient: 'from-indigo-500 to-purple-600',
    category: 'special',
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Practice before 7 AM',
    emoji: '🐦',
    gradient: 'from-orange-400 to-pink-400',
    category: 'special',
  },
];

// ── Check functions ──

const BADGE_CHECKS: Record<string, (p: NestedProgress, courseLessonCounts: Record<string, number>) => boolean> = {
  first_sentence: (p) => Object.keys(p.completedSentences).length >= 1,
  first_lesson: (p) => Object.keys(p.completedLessons).length >= 1,
  free_trial_done: (p) => {
    // Check if any free-trial sentence is completed
    return Object.keys(p.completedSentences).some((id) => id.startsWith('free-trial-'));
  },

  streak_3: (p) => computeStreak(p.dailyActivity) >= 3,
  streak_7: (p) => computeStreak(p.dailyActivity) >= 7,
  streak_14: (p) => computeStreak(p.dailyActivity) >= 14,
  streak_30: (p) => computeStreak(p.dailyActivity) >= 30,

  sentences_10: (p) => Object.keys(p.completedSentences).length >= 10,
  sentences_50: (p) => Object.keys(p.completedSentences).length >= 50,
  sentences_100: (p) => Object.keys(p.completedSentences).length >= 100,
  sentences_250: (p) => Object.keys(p.completedSentences).length >= 250,
  sentences_500: (p) => Object.keys(p.completedSentences).length >= 500,
  sentences_1000: (p) => Object.keys(p.completedSentences).length >= 1000,

  course_1: (_p, counts) => Object.values(counts).filter((c) => c > 0).length >= 1,
  course_3: (_p, counts) => Object.values(counts).filter((c) => c > 0).length >= 3,
  course_all: (_p, counts) => {
    const total = Object.keys(counts).length;
    const completed = Object.values(counts).filter((c) => c > 0).length;
    return total > 0 && completed === total;
  },

  night_owl: () => {
    const hour = new Date().getHours();
    return hour >= 22 || hour < 5;
  },
  early_bird: () => {
    const hour = new Date().getHours();
    return hour >= 5 && hour < 7;
  },
};

/**
 * Check which badges are earned given current progress.
 * `courseLessonCounts` maps courseId → number of completed lessons in that course.
 */
export function checkBadges(
  progress: NestedProgress,
  courseLessonCounts: Record<string, number> = {},
): BadgeCheck[] {
  return BADGES.map((badge) => ({
    badge,
    earned: BADGE_CHECKS[badge.id]?.(progress, courseLessonCounts) ?? false,
  }));
}

/** Get only the earned badge IDs. */
export function getEarnedBadgeIds(
  progress: NestedProgress,
  courseLessonCounts: Record<string, number> = {},
): string[] {
  return checkBadges(progress, courseLessonCounts)
    .filter((b) => b.earned)
    .map((b) => b.badge.id);
}
