/** Returns a local 'YYYY-MM-DD' key for a date. */
export function dateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Parses 'YYYY-MM-DD' to a local Date (midnight). */
export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function daysBetween(a: string, b: string): number {
  const diff = parseDateKey(b).getTime() - parseDateKey(a).getTime();
  return Math.round(diff / 86_400_000);
}

/**
 * Computes the current streak from a list of activity dates.
 * Streak breaks if the user skipped a day.
 */
export function computeStreak(activity: string[]): number {
  if (activity.length === 0) return 0;
  const unique = Array.from(new Set(activity)).sort();
  let streak = 0;
  let cursor = dateKey();
  // If the user hasn't practiced today, start from yesterday.
  if (!unique.includes(cursor)) {
    cursor = dateKey(addDays(new Date(), -1));
  }
  for (let i = unique.length - 1; i >= 0; i--) {
    if (unique[i] === cursor) {
      streak++;
      cursor = dateKey(addDays(parseDateKey(cursor), -1));
    } else {
      break;
    }
  }
  return streak;
}

export function formatMinutes(totalMinutes: number): string {
  if (totalMinutes < 60) return `${Math.round(totalMinutes)} min`;
  const h = Math.floor(totalMinutes / 60);
  const m = Math.round(totalMinutes % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
