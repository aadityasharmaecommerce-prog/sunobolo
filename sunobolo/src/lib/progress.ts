const PROGRESS_KEY = 'sb_nested_progress_v1';
const PREFS_KEY = 'sb_nested_prefs_v1';
const USER_KEY = 'sb_nested_user_v1';

export interface NestedProgress {
  completedSentences: Record<string, true>;
  completedLessons: Record<string, true>;
  dailyActivity: string[];
  lastLesson: { courseId: string; lessonId: string; sentenceIndex: number } | null;
}

export interface NestedPrefs {
  goal?: string;
  level?: string;
  recommendedCourseId?: string;
  autoPlay?: boolean;
}

export interface NestedUser {
  name: string;
  createdAt: string;
}

function todayKey(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function emptyProgress(): NestedProgress {
  return {
    completedSentences: {},
    completedLessons: {},
    dailyActivity: [],
    lastLesson: null,
  };
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota */
  }
}

export function getProgress(): NestedProgress {
  const p = readJson<NestedProgress>(PROGRESS_KEY, emptyProgress());
  return { ...emptyProgress(), ...p, completedSentences: p.completedSentences ?? {}, completedLessons: p.completedLessons ?? {} };
}

export function saveProgress(next: NestedProgress): NestedProgress {
  writeJson(PROGRESS_KEY, next);
  return next;
}

export function markSentenceComplete(
  sentenceId: string,
  courseId: string,
  lessonId: string,
  sentenceIndex: number,
): NestedProgress {
  const p = getProgress();
  p.completedSentences[sentenceId] = true;
  const day = todayKey();
  if (!p.dailyActivity.includes(day)) p.dailyActivity.push(day);
  p.lastLesson = { courseId, lessonId, sentenceIndex };
  return saveProgress(p);
}

export function markLessonComplete(lessonId: string): NestedProgress {
  const p = getProgress();
  p.completedLessons[lessonId] = true;
  const day = todayKey();
  if (!p.dailyActivity.includes(day)) p.dailyActivity.push(day);
  return saveProgress(p);
}

export function computeStreak(activity: string[]): number {
  if (activity.length === 0) return 0;
  const unique = Array.from(new Set(activity)).sort();
  const pad = (n: number) => String(n).padStart(2, '0');
  const keyOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  let cursor = todayKey();
  if (!unique.includes(cursor)) {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    cursor = keyOf(y);
  }
  let streak = 0;
  for (let i = unique.length - 1; i >= 0; i--) {
    if (unique[i] === cursor) {
      streak += 1;
      const [yy, mm, dd] = cursor.split('-').map(Number);
      const prev = new Date(yy, mm - 1, dd - 1);
      cursor = keyOf(prev);
    } else {
      break;
    }
  }
  return streak;
}

export function getPrefs(): NestedPrefs {
  return readJson<NestedPrefs>(PREFS_KEY, { autoPlay: true });
}

export function savePrefs(patch: NestedPrefs): NestedPrefs {
  const next = { ...getPrefs(), ...patch };
  writeJson(PREFS_KEY, next);
  return next;
}

export function getUser(): NestedUser | null {
  return readJson<NestedUser | null>(USER_KEY, null);
}

export function saveUser(user: NestedUser): NestedUser {
  writeJson(USER_KEY, user);
  return user;
}
