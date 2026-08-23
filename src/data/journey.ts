/**
 * SunoBolo — 30-Day Grammar Journey Curriculum
 *
 * Maps each day to its tense focus, learning type, and content.
 * Uses existing tense data from tenses.ts — no content duplication.
 */

export interface JourneyDay {
  day: number;
  tenseId: string | null;
  title: string;
  subtitle: string;
  type: 'learn' | 'practice' | 'mixed' | 'revision' | 'assessment';
  description: string;
  phase: 'foundation' | 'confidence' | 'mastery';
  isFree: boolean;
}

export const JOURNEY_DAYS: JourneyDay[] = [
  // ══════════════════════════════════════
  // PHASE 1: FOUNDATION (Days 1-8)
  // ══════════════════════════════════════
  { day: 1, tenseId: 'simple-present', title: 'Present Simple', subtitle: 'Concept + Structure + Examples', type: 'learn', description: 'Seekho ki Present Simple kaise banta hai aur kab use hota hai.', phase: 'foundation', isFree: true },
  { day: 2, tenseId: 'simple-present', title: 'Present Simple', subtitle: 'Practice + Speaking + Test', type: 'practice', description: 'Present Simple ko bolkar practice karo aur test do.', phase: 'foundation', isFree: false },
  { day: 3, tenseId: 'present-continuous', title: 'Present Continuous', subtitle: 'Concept + Structure + Examples', type: 'learn', description: 'Seekho ki Present Continuous kaise banta hai — actions happening now.', phase: 'foundation', isFree: false },
  { day: 4, tenseId: 'present-continuous', title: 'Present Continuous', subtitle: 'Practice + Speaking + Test', type: 'practice', description: 'Present Continuous ko bolkar practice karo aur test do.', phase: 'foundation', isFree: false },
  { day: 5, tenseId: 'present-perfect', title: 'Present Perfect', subtitle: 'Concept + Examples', type: 'learn', description: 'Seekho ki Present Perfect kaise banta hai — past actions with present result.', phase: 'foundation', isFree: false },
  { day: 6, tenseId: 'present-perfect', title: 'Present Perfect', subtitle: 'Practice + Speaking + Test', type: 'practice', description: 'Present Perfect ko bolkar practice karo aur test do.', phase: 'foundation', isFree: false },
  { day: 7, tenseId: 'present-perfect-continuous', title: 'Present Perfect Continuous', subtitle: 'Concept + Examples', type: 'learn', description: 'Seekho ki Present Perfect Continuous kaise banta hai.', phase: 'foundation', isFree: false },
  { day: 8, tenseId: 'present-perfect-continuous', title: 'Present Perfect Continuous', subtitle: 'Practice + Speaking + Test', type: 'practice', description: 'Present Perfect Continuous ko bolkar practice karo aur test do.', phase: 'foundation', isFree: false },

  // ══════════════════════════════════════
  // PHASE 2: CONFIDENCE (Days 9-16)
  // ══════════════════════════════════════
  { day: 9, tenseId: 'simple-past', title: 'Past Simple', subtitle: 'Concept + Examples', type: 'learn', description: 'Seekho ki Past Simple kaise banta hai — completed actions.', phase: 'confidence', isFree: false },
  { day: 10, tenseId: 'simple-past', title: 'Past Simple', subtitle: 'Practice + Speaking + Test', type: 'practice', description: 'Past Simple ko bolkar practice karo aur test do.', phase: 'confidence', isFree: false },
  { day: 11, tenseId: 'past-continuous', title: 'Past Continuous', subtitle: 'Concept + Examples', type: 'learn', description: 'Seekho ki Past Continuous kaise banta hai.', phase: 'confidence', isFree: false },
  { day: 12, tenseId: 'past-continuous', title: 'Past Continuous', subtitle: 'Practice + Speaking + Test', type: 'practice', description: 'Past Continuous ko bolkar practice karo aur test do.', phase: 'confidence', isFree: false },
  { day: 13, tenseId: 'past-perfect', title: 'Past Perfect', subtitle: 'Concept + Examples', type: 'learn', description: 'Seekho ki Past Perfect kaise banta hai — action before another past action.', phase: 'confidence', isFree: false },
  { day: 14, tenseId: 'past-perfect', title: 'Past Perfect', subtitle: 'Practice + Speaking + Test', type: 'practice', description: 'Past Perfect ko bolkar practice karo aur test do.', phase: 'confidence', isFree: false },
  { day: 15, tenseId: 'past-perfect-continuous', title: 'Past Perfect Continuous', subtitle: 'Concept + Examples', type: 'learn', description: 'Seekho ki Past Perfect Continuous kaise banta hai.', phase: 'confidence', isFree: false },
  { day: 16, tenseId: 'past-perfect-continuous', title: 'Past Perfect Continuous', subtitle: 'Practice + Speaking + Test', type: 'practice', description: 'Past Perfect Continuous ko bolkar practice karo aur test do.', phase: 'confidence', isFree: false },

  // ══════════════════════════════════════
  // PHASE 3: MASTERY (Days 17-30)
  // ══════════════════════════════════════
  { day: 17, tenseId: 'simple-future', title: 'Future Simple', subtitle: 'Concept + Examples', type: 'learn', description: 'Seekho ki Future Simple kaise banta hai.', phase: 'mastery', isFree: false },
  { day: 18, tenseId: 'simple-future', title: 'Future Simple', subtitle: 'Practice + Speaking + Test', type: 'practice', description: 'Future Simple ko bolkar practice karo aur test do.', phase: 'mastery', isFree: false },
  { day: 19, tenseId: 'future-continuous', title: 'Future Continuous', subtitle: 'Concept + Examples', type: 'learn', description: 'Seekho ki Future Continuous kaise banta hai.', phase: 'mastery', isFree: false },
  { day: 20, tenseId: 'future-continuous', title: 'Future Continuous', subtitle: 'Practice + Speaking + Test', type: 'practice', description: 'Future Continuous ko bolkar practice karo aur test do.', phase: 'mastery', isFree: false },
  { day: 21, tenseId: 'future-perfect', title: 'Future Perfect', subtitle: 'Concept + Examples', type: 'learn', description: 'Seekho ki Future Perfect kaise banta hai.', phase: 'mastery', isFree: false },
  { day: 22, tenseId: 'future-perfect', title: 'Future Perfect', subtitle: 'Practice + Speaking + Test', type: 'practice', description: 'Future Perfect ko bolkar practice karo aur test do.', phase: 'mastery', isFree: false },
  { day: 23, tenseId: 'future-perfect-continuous', title: 'Future Perfect Continuous', subtitle: 'Concept + Examples', type: 'learn', description: 'Seekho ki Future Perfect Continuous kaise banta hai.', phase: 'mastery', isFree: false },
  { day: 24, tenseId: 'future-perfect-continuous', title: 'Future Perfect Continuous', subtitle: 'Practice + Speaking + Test', type: 'practice', description: 'Future Perfect Continuous ko bolkar practice karo aur test do.', phase: 'mastery', isFree: false },
  { day: 25, tenseId: null, title: 'Present Tenses Mixed', subtitle: 'All Present Tenses Practice', type: 'mixed', description: 'Saare Present tenses ko mix karke practice karo.', phase: 'mastery', isFree: false },
  { day: 26, tenseId: null, title: 'Past Tenses Mixed', subtitle: 'All Past Tenses Practice', type: 'mixed', description: 'Saare Past tenses ko mix karke practice karo.', phase: 'mastery', isFree: false },
  { day: 27, tenseId: null, title: 'Future Tenses Mixed', subtitle: 'All Future Tenses Practice', type: 'mixed', description: 'Saare Future tenses ko mix karke practice karo.', phase: 'mastery', isFree: false },
  { day: 28, tenseId: null, title: 'Real-Life Sentences', subtitle: 'All 12 Tenses — Sentence Practice', type: 'mixed', description: 'Real-life sentences mein saare tenses use karo.', phase: 'mastery', isFree: false },
  { day: 29, tenseId: null, title: 'Grammar Revision', subtitle: 'Weak Area Practice', type: 'revision', description: 'Apni weak areas ko identify aur practice karo.', phase: 'mastery', isFree: false },
  { day: 30, tenseId: null, title: 'Final Assessment', subtitle: 'Complete Grammar Test', type: 'assessment', description: 'Apne poore grammar knowledge ka final test do.', phase: 'mastery', isFree: false },
];

export const PHASES = [
  { id: 'foundation', label: 'Foundation', days: '1-8', color: 'emerald', description: 'Present tenses seekho' },
  { id: 'confidence', label: 'Confidence', days: '9-16', color: 'blue', description: 'Past tenses seekho' },
  { id: 'mastery', label: 'Mastery', days: '17-30', color: 'purple', description: 'Future tenses + revision' },
] as const;

export const TOTAL_DAYS = 30;
export const FREE_DAYS = 1;

/** Get the current day config */
export function getJourneyDay(day: number): JourneyDay | undefined {
  return JOURNEY_DAYS.find(d => d.day === day);
}

/** Get days for a specific tense */
export function getDaysForTense(tenseId: string): JourneyDay[] {
  return JOURNEY_DAYS.filter(d => d.tenseId === tenseId);
}
