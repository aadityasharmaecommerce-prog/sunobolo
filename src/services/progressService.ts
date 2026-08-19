import type { CourseProgress, LastLesson, LessonProgress, Stats, UserProgress } from '@/types';
import { METHOD, STORAGE_KEYS } from '@/constants';
import { computeStreak, dateKey, daysBetween } from '@/utils/dates';
import { readStorage, writeStorage } from '@/utils/storage';
import { apiFetch, isRemoteEnabled } from './apiClient';
import { authService } from './authService';
import { getDB } from './store';

function emptyProgress(): UserProgress {
  return {
    completedSentences: {},
    completedLessons: {},
    dailyActivity: [],
    streak: 0,
    lastActiveDay: '',
    lastLesson: null,
    totalPracticeRounds: 0,
    totalMinutes: 0,
  };
}

function progressKey(): string {
  const user = authService.getCurrentUser();
  return user ? `${STORAGE_KEYS.progress}:${user.id}` : STORAGE_KEYS.progress;
}

function mergeProgress(local: UserProgress, server: Partial<UserProgress> | null): UserProgress {
  if (!server) return local;
  const merged: UserProgress = {
    ...local,
    completedSentences: { ...server.completedSentences, ...local.completedSentences },
    completedLessons: { ...(server.completedLessons ?? {}), ...local.completedLessons },
    dailyActivity: Array.from(new Set([...(server.dailyActivity ?? []), ...local.dailyActivity])).sort(),
    totalPracticeRounds: Math.max(local.totalPracticeRounds, server.totalPracticeRounds ?? 0),
    totalMinutes: Math.max(local.totalMinutes, server.totalMinutes ?? 0),
  };
  merged.streak = computeStreak(merged.dailyActivity);
  return merged;
}

export const progressService = {
  getProgress(): UserProgress {
    const p = readStorage<UserProgress>(progressKey(), emptyProgress());
    return { ...emptyProgress(), ...p };
  },

  saveProgress(progress: UserProgress): UserProgress {
    writeStorage(progressKey(), progress);
    return progress;
  },

  /**
   * Fire-and-forget sync of the full local progress to the Cloudflare Worker
   * (POST /api/progress/sync). Only runs in remote mode with a mock user.
   */
  syncToServer(progress: UserProgress): void {
    if (!isRemoteEnabled()) return;
    const user = authService.getCurrentUser();
    if (!user) return;
    apiFetch('/api/progress/sync', {
      method: 'POST',
      body: JSON.stringify({
        userId: user.id,
        sentences: Object.keys(progress.completedSentences),
        lessons: Object.keys(progress.completedLessons),
        activity: progress.dailyActivity,
        rounds: progress.totalPracticeRounds,
        minutes: progress.totalMinutes,
      }),
    }).catch(() => {
      // Offline / transient failure — local progress stays, next mutation re-syncs.
    });
  },

  /** Fetches server progress (remote mode) and merges it into local storage. */
  async syncFromServer(): Promise<UserProgress> {
    if (!isRemoteEnabled()) return this.getProgress();
    const user = authService.getCurrentUser();
    if (!user) return this.getProgress();
    try {
      const data = await apiFetch<Partial<UserProgress>>(`/api/me/progress?userId=${encodeURIComponent(user.id)}`);
      const merged = mergeProgress(this.getProgress(), data);
      this.saveProgress(merged);
      return merged;
    } catch {
      return this.getProgress();
    }
  },

  /** Marks a sentence practiced (listened + spoken) and records daily activity. */
  completeSentence(sentenceId: string, lessonId: string, minutes = 0): UserProgress {
    const p = this.getProgress();
    const today = dateKey();
    if (!p.dailyActivity.includes(today)) {
      p.dailyActivity.push(today);
    }
    p.completedSentences[sentenceId] = true;
    p.totalPracticeRounds += METHOD.listenCount + METHOD.speakCount;
    p.totalMinutes += minutes;
    p.lastActiveDay = today;
    p.streak = computeStreak(p.dailyActivity);
    p.lastLesson = { courseId: getDB().sentences.find((s) => s.id === sentenceId)?.courseId ?? '', lessonId, sentenceIndex: 0 };
    this.saveProgress(p);
    this.syncToServer(p);
    return p;
  },

  completeLesson(lessonId: string): UserProgress {
    const p = this.getProgress();
    p.completedLessons[lessonId] = true;
    const today = dateKey();
    if (!p.dailyActivity.includes(today)) {
      p.dailyActivity.push(today);
    }
    p.lastActiveDay = today;
    p.streak = computeStreak(p.dailyActivity);
    this.saveProgress(p);
    this.syncToServer(p);
    return p;
  },

  setLastLesson(lastLesson: LastLesson): UserProgress {
    const p = this.getProgress();
    p.lastLesson = lastLesson;
    return this.saveProgress(p);
  },

  getLessonProgress(lessonId: string): LessonProgress {
    const db = getDB();
    const sentences = db.sentences.filter((s) => s.lessonId === lessonId);
    const p = this.getProgress();
    const completed = sentences.filter((s) => p.completedSentences[s.id]).length;
    const total = sentences.length;
    return {
      total,
      completed,
      percent: total === 0 ? 0 : Math.round((completed / total) * 100),
      isComplete: total > 0 && completed === total,
    };
  },

  getCourseProgress(courseId: string): CourseProgress {
    const db = getDB();
    const lessons = db.lessons.filter((l) => l.courseId === courseId);
    const sentences = db.sentences.filter((s) => s.courseId === courseId);
    const p = this.getProgress();
    const completedLessons = lessons.filter((l) => p.completedLessons[l.id]).length;
    const completedSentences = sentences.filter((s) => p.completedSentences[s.id]).length;
    return {
      totalLessons: lessons.length,
      completedLessons,
      totalSentences: sentences.length,
      completedSentences,
      percent: sentences.length === 0 ? 0 : Math.round((completedSentences / sentences.length) * 100),
    };
  },

  getStats(): Stats {
    const db = getDB();
    const p = this.getProgress();
    const totalSentences = db.sentences.length;
    const completed = Object.keys(p.completedSentences).length;
    return {
      sentencesPracticed: completed,
      lessonsCompleted: Object.keys(p.completedLessons).length,
      currentStreak: p.streak,
      overallPercent: totalSentences === 0 ? 0 : Math.round((completed / totalSentences) * 100),
      totalMinutes: p.totalMinutes,
      totalRounds: p.totalPracticeRounds,
    };
  },

  resetProgress(): UserProgress {
    const empty = emptyProgress();
    this.saveProgress(empty);
    this.syncToServer(empty);
    return empty;
  },

  /** Days since the user started practicing (min 1). */
  getActiveDays(): number {
    const p = this.getProgress();
    if (p.dailyActivity.length === 0) return 0;
    const first = [...p.dailyActivity].sort()[0];
    return Math.max(1, daysBetween(first, dateKey()) + 1);
  },
};
