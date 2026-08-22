// ============================================
// SUNOBOLO ENGLISH - CONTENT DATABASE (AUTO-GENERATED)
// 3000+ practical English sentences with Hindi meanings
// ============================================

export interface SentenceData {
  id: string;
  courseId: string;
  lessonId: string;
  english: string;
  hindi: string;
  topic: string;
  difficulty: string;
  order: number;
  isFree: boolean;
}

export interface LessonData {
  id: string; courseId: string; moduleId: string; order: number;
  title: string; description: string; difficulty: string; topic: string;
  sentenceCount: number; estimatedMinutes: number; sentences: SentenceData[];
}

export interface CourseData {
  id: string; title: string; description: string; shortDescription: string;
  icon: string; color: string; difficulty: string; targetAudience: string[];
  totalSentences: number; totalLessons: number; estimatedHours: number;
  isFree: boolean; price?: string; lessons: LessonData[];
  modules: Record<string, any>[];
}

