import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CourseProgress, LessonProgress, Stats, UserProgress } from '@/types';
import { progressService } from '@/services/progressService';
import { isRemoteEnabled } from '@/services/apiClient';
import { useAuth } from '@/context/AuthContext';

interface ProgressContextValue {
  progress: UserProgress;
  stats: Stats;
  completeSentence: (sentenceId: string, lessonId: string, minutes?: number) => void;
  completeLesson: (lessonId: string) => void;
  setLastLesson: (courseId: string, lessonId: string, sentenceIndex: number) => void;
  getLessonProgress: (lessonId: string) => LessonProgress;
  getCourseProgress: (courseId: string) => CourseProgress;
  resetProgress: () => void;
  /** Re-reads progress from local storage (and from the server in remote mode). */
  refresh: () => Promise<void>;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress>(() => progressService.getProgress());

  // Reload (and optionally merge remote) whenever the signed-in user changes.
  useEffect(() => {
    let cancelled = false;
    setProgress(progressService.getProgress());
    if (!isRemoteEnabled()) return;
    progressService.syncFromServer().then((merged) => {
      if (!cancelled) setProgress(merged);
    });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const refresh = useCallback(async () => {
    const p = await progressService.syncFromServer();
    setProgress(p);
  }, []);

  const completeSentence = useCallback((sentenceId: string, lessonId: string, minutes = 0) => {
    setProgress(progressService.completeSentence(sentenceId, lessonId, minutes));
  }, []);

  const completeLesson = useCallback((lessonId: string) => {
    setProgress(progressService.completeLesson(lessonId));
  }, []);

  const setLastLesson = useCallback((courseId: string, lessonId: string, sentenceIndex: number) => {
    setProgress(progressService.setLastLesson({ courseId, lessonId, sentenceIndex }));
  }, []);

  const resetProgress = useCallback(() => {
    setProgress(progressService.resetProgress());
  }, []);

  const getLessonProgress = useCallback((lessonId: string) => progressService.getLessonProgress(lessonId), []);

  const getCourseProgress = useCallback((courseId: string) => progressService.getCourseProgress(courseId), []);

  const stats = useMemo(() => progressService.getStats(), [progress]);

  const value = useMemo<ProgressContextValue>(
    () => ({
      progress,
      stats,
      completeSentence,
      completeLesson,
      setLastLesson,
      getLessonProgress,
      getCourseProgress,
      resetProgress,
      refresh,
    }),
    [progress, stats, completeSentence, completeLesson, setLastLesson, getLessonProgress, getCourseProgress, resetProgress, refresh],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
}
