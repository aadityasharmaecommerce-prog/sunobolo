/**
 * SunoBolo — Centralized plan configuration.
 *
 * ONE source of truth for all pricing.
 * All three plans are ONE-TIME payments. NO monthly subscriptions.
 *
 * Backend MUST validate against this — never trust frontend amounts.
 */

export interface Plan {
  id: string;
  name: string;
  amount: number;
  amountRupees: number;
  durationMonths: number;
  durationLabel: string;
  access: 'full';
  features: readonly string[];
}

export const PLANS = {
  three_month: {
    id: 'three_month',
    name: '3 Months',
    amount: 59900,
    amountRupees: 599,
    durationMonths: 3,
    durationLabel: '3 Months',
    access: 'full',
    features: [
      'Full App Access',
      '5,000+ English Sentences',
      '📘 English Grammar / 12 Tenses',
      'Beginner · Daily Life · Interview',
      'Business · Corporate · Travel',
      'School · Kids',
      'Hindi Meaning',
      'Listen & Speak Practice',
      '3× Repetition Practice',
      'Progress Tracking',
    ],
  },
  six_month: {
    id: 'six_month',
    name: '6 Months',
    amount: 99900,
    amountRupees: 999,
    durationMonths: 6,
    durationLabel: '6 Months',
    access: 'full',
    features: [
      'Full App Access',
      '5,000+ English Sentences',
      '📘 English Grammar / 12 Tenses',
      'All Courses',
      'Hindi Meaning',
      'Listen & Speak Practice',
      '3× Repetition Practice',
      'Progress Tracking',
    ],
  },
  one_year: {
    id: 'one_year',
    name: '1 Year',
    amount: 170000,
    amountRupees: 1700,
    durationMonths: 12,
    durationLabel: '1 Year',
    access: 'full',
    features: [
      'Full App Access',
      '5,000+ English Sentences',
      '📘 English Grammar / 12 Tenses',
      'All Courses',
      'Hindi Meaning',
      'Listen & Speak Practice',
      '3× Repetition Practice',
      'Progress Tracking',
    ],
  },
} as const;

export type PlanId = keyof typeof PLANS;

export function getPlan(planId: string): Plan | undefined {
  return PLANS[planId as PlanId] as Plan | undefined;
}

export const PLAN_LIST: Plan[] = Object.values(PLANS) as Plan[];
