/**
 * SunoBolo — Centralized plan configuration.
 *
 * ONE source of truth for all pricing.
 * All four plans are ONE-TIME payments. NO monthly subscriptions.
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
  badge?: string;
  features: readonly string[];
}

export const PLANS = {
  one_month: {
    id: 'one_month',
    name: '1 Month',
    amount: 19900,
    amountRupees: 199,
    durationMonths: 1,
    durationLabel: '1 Month',
    access: 'full',
    badge: 'Entry Plan',
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
  three_month: {
    id: 'three_month',
    name: '3 Months',
    amount: 49900,
    amountRupees: 499,
    durationMonths: 3,
    durationLabel: '3 Months',
    access: 'full',
    badge: '⭐ Best Value',
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
    amount: 69900,
    amountRupees: 699,
    durationMonths: 6,
    durationLabel: '6 Months',
    access: 'full',
    badge: '🔥 Most Popular',
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
  one_year: {
    id: 'one_year',
    name: '1 Year',
    amount: 99900,
    amountRupees: 999,
    durationMonths: 12,
    durationLabel: '1 Year',
    access: 'full',
    badge: '🏆 Best Saving',
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
} as const;

export type PlanId = keyof typeof PLANS;

export function getPlan(planId: string): Plan | undefined {
  return PLANS[planId as PlanId] as Plan | undefined;
}

export const PLAN_LIST: Plan[] = Object.values(PLANS) as Plan[];
