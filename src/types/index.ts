/**
 * SunoBolo English — Domain types.
 *
 * These types are designed to map 1:1 onto the future Cloudflare D1 schema
 * (users, user_profiles, courses, lessons, sentences, packages, user_progress,
 * lesson_progress, daily_activity, favorites, ...). Phase 1 keeps everything
 * in memory + localStorage; Phase 2 replaces the service layer, not these types.
 */

export type Level =
  | 'kids'
  | 'school'
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'daily'
  | 'interview'
  | 'corporate'
  | 'business'
  | 'travel';

/** High level audience grouping used on the homepage. */
export type Audience = 'kids' | 'students' | 'adults' | 'professionals';

export type SentenceDifficulty = 'easy' | 'medium' | 'hard';

export type UserLevel = 'beginner' | 'basic' | 'intermediate' | 'advanced' | 'unknown';

export type Goal =
  | 'daily'
  | 'school'
  | 'interview'
  | 'job'
  | 'corporate'
  | 'business'
  | 'travel'
  | 'confidence';

export type CourseColor = 'sky' | 'violet' | 'emerald' | 'amber' | 'rose' | 'indigo' | 'teal' | 'orange' | 'fuchsia' | 'lime';

export interface Course {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  longDescription: string;
  level: Level;
  audience: Audience;
  emoji: string;
  color: CourseColor;
  isFree: boolean;
  order: number;
  lessonCount: number;
  sentenceCount: number;
  featured: boolean;
  seo: {
    title: string;
    description: string;
  };
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  emoji: string;
  description: string;
  order: number;
  isFree: boolean;
  sentenceCount: number;
}

export interface Sentence {
  id: string;
  lessonId: string;
  courseId: string;
  english: string;
  hindi: string;
  difficulty: SentenceDifficulty;
  order: number;
  isFree: boolean;
}

export interface Package {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  currency: string;
  tagline: string;
  features: string[];
  /** Course ids included. '*' means every course. */
  courseIds: string[];
  popular?: boolean;
  color: CourseColor;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  goal?: Goal;
  level?: UserLevel;
  recommendedCourseId?: string;
  hasPackage?: string | null;
  isAdmin?: boolean;
  createdAt: string;
  phone?: string;
}

export interface LastLesson {
  courseId: string;
  lessonId: string;
  sentenceIndex: number;
}

export interface UserProgress {
  /** sentenceId -> true */
  completedSentences: Record<string, true>;
  /** lessonId -> true */
  completedLessons: Record<string, true>;
  /** Array of 'YYYY-MM-DD' dates the user practiced */
  dailyActivity: string[];
  streak: number;
  lastActiveDay: string;
  lastLesson: LastLesson | null;
  totalPracticeRounds: number;
  totalMinutes: number;
}

export interface LessonProgress {
  total: number;
  completed: number;
  percent: number;
  isComplete: boolean;
}

export interface CourseProgress {
  totalLessons: number;
  completedLessons: number;
  totalSentences: number;
  completedSentences: number;
  percent: number;
}

export interface Stats {
  sentencesPracticed: number;
  lessonsCompleted: number;
  currentStreak: number;
  overallPercent: number;
  totalMinutes: number;
  totalRounds: number;
}

/** Compact sentence row used inside seed data files. */
export type SentenceRow = readonly [
  english: string,
  hindi: string,
  difficulty: SentenceDifficulty,
  isFree?: boolean,
];

/** Compact lesson seed. */
export interface LessonSeed {
  title: string;
  emoji: string;
  description: string;
  isFree?: boolean;
  sentenceCount: number;
}

/** Compact course seed (sentenceCount/lessonCount are computed by the builder). */
export interface CourseSeed {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  longDescription: string;
  level: Level;
  audience: Audience;
  emoji: string;
  color: CourseColor;
  isFree?: boolean;
  order: number;
  featured?: boolean;
  seo: { title: string; description: string };
  lessons: LessonSeed[];
}
