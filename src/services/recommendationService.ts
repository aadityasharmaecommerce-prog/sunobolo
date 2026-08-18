import type { Goal, UserLevel } from '@/types';

export interface Recommendation {
  courseId: string;
  label: string;
  reason: string;
}

const GOAL_TO_COURSE: Record<Goal, string> = {
  daily: 'daily',
  school: 'school',
  interview: 'interview',
  job: 'interview',
  corporate: 'corporate',
  business: 'business',
  travel: 'travel',
  confidence: 'beginner',
};

const LEVEL_FALLBACK: Record<UserLevel, string> = {
  beginner: 'beginner',
  basic: 'beginner',
  intermediate: 'intermediate',
  advanced: 'advanced',
  unknown: 'beginner',
};

/** Rule-based path recommendation used by onboarding (Phase 1 mock logic). */
export function recommendCourse(goal: Goal, level: UserLevel): Recommendation {
  const goalCourse = GOAL_TO_COURSE[goal];
  const levelCourse = LEVEL_FALLBACK[level];

  // Beginners always start at Beginner English unless they picked a specialized goal.
  if (level === 'beginner' || level === 'unknown') {
    if (goal === 'school') {
      return { courseId: 'school', label: 'School English', reason: 'School ke liye perfect shuruaat.' };
    }
    if (goal === 'interview' || goal === 'job') {
      return { courseId: 'interview', label: 'Interview English', reason: 'Interview ka confidence pehle banao, phir advanced.' };
    }
    return {
      courseId: levelCourse,
      label: levelCourse === 'beginner' ? 'Beginner English' : 'Beginner English',
      reason: 'Pehle basics strong karo — Beginner se shuru karein.',
    };
  }

  // Intermediate/Advanced + specialized goal -> specialized course.
  const course = goalCourse || levelCourse;
  const labels: Record<string, string> = {
    daily: 'Daily Life English',
    school: 'School English',
    interview: 'Interview English',
    corporate: 'Corporate English',
    business: 'Business English',
    travel: 'Travel English',
    beginner: 'Beginner English',
    intermediate: 'Intermediate English',
    advanced: 'Advanced English',
  };
  return {
    courseId: course,
    label: labels[course] ?? 'Beginner English',
    reason: `${labels[course] ?? 'Recommended course'} aapke goal ke liye best hai.`,
  };
}

export function pathLabel(goal: Goal, level: UserLevel, courseId: string): string {
  const levelLabel: Record<UserLevel, string> = {
    beginner: 'Beginner',
    basic: 'Basic',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    unknown: 'Beginner',
  };
  const goalLabel: Record<Goal, string> = {
    daily: 'Daily English',
    school: 'School English',
    interview: 'Interview',
    job: 'Interview',
    corporate: 'Corporate',
    business: 'Business',
    travel: 'Travel',
    confidence: 'Conversation',
  };
  return `${levelLabel[level]} → ${goalLabel[goal]} → ${courseId === 'daily' ? 'Conversation' : courseId}`;
}
