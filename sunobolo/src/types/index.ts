export interface Sentence {
  id: string;
  courseId: string;
  lessonId: string;
  order: number;
  english: string;
  hindi: string;
  topic: string;
  difficulty: string;
  isFree: boolean;
}

export interface Lesson {
  id: string;
  courseId: string;
  moduleId: string;
  order: number;
  title: string;
  description: string;
  difficulty: string;
  topic: string;
  sentenceCount: number;
  estimatedMinutes: number;
  sentences: Sentence[];
}

export interface Module {
  id: string;
  courseId: string;
  order: number;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  icon: string;
  color: string;
  difficulty: string;
  targetAudience: string[];
  totalSentences: number;
  totalLessons: number;
  estimatedHours: number;
  isFree: boolean;
  price?: string;
  lessons: Lesson[];
  modules: Module[];
}

export interface UserGoal {
  id: string;
  label: string;
  emoji: string;
}

export interface UserLevel {
  id: string;
  label: string;
  description: string;
}