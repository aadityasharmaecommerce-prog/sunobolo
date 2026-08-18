import type { Course, Lesson, Package, Sentence } from '@/types';
import { updateDB, getDB } from './store';
import { apiFetch, isRemoteEnabled } from './apiClient';

/**
 * Admin CRUD.
 * Phase 1: localStorage-backed store.
 * Remote mode: POST/PUT/DELETE against the protected Worker admin API
 * (Authorization: Bearer <VITE_ADMIN_TOKEN>), enforced server-side.
 */

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export const adminService = {
  // Courses
  async addCourse(data: Partial<Course>): Promise<Course> {
    if (isRemoteEnabled()) {
      await apiFetch('/api/admin/courses', { method: 'POST', body: JSON.stringify(data) });
      return data as Course;
    }
    const course: Course = {
      id: uid('course'),
      slug: data.slug ?? uid('c'),
      title: data.title ?? 'New Course',
      tagline: data.tagline ?? '',
      description: data.description ?? '',
      longDescription: data.longDescription ?? '',
      level: data.level ?? 'beginner',
      audience: data.audience ?? 'adults',
      emoji: data.emoji ?? '📘',
      color: data.color ?? 'sky',
      isFree: data.isFree ?? false,
      order: data.order ?? getDB().courses.length + 1,
      lessonCount: data.lessonCount ?? 0,
      sentenceCount: data.sentenceCount ?? 0,
      featured: data.featured ?? false,
      seo: data.seo ?? { title: data.title ?? 'New Course', description: '' },
    };
    updateDB((db) => db.courses.push(course));
    return course;
  },

  async updateCourse(id: string, patch: Partial<Course>): Promise<void> {
    if (isRemoteEnabled()) {
      await apiFetch(`/api/admin/courses/${id}`, { method: 'PUT', body: JSON.stringify(patch) });
      return;
    }
    updateDB((db) => {
      const i = db.courses.findIndex((c) => c.id === id);
      if (i >= 0) db.courses[i] = { ...db.courses[i], ...patch, id };
    });
  },

  async deleteCourse(id: string): Promise<void> {
    if (isRemoteEnabled()) {
      await apiFetch(`/api/admin/courses/${id}`, { method: 'DELETE' });
      return;
    }
    updateDB((db) => {
      db.courses = db.courses.filter((c) => c.id !== id);
      const lessonIds = db.lessons.filter((l) => l.courseId === id).map((l) => l.id);
      db.lessons = db.lessons.filter((l) => l.courseId !== id);
      db.sentences = db.sentences.filter((s) => !lessonIds.includes(s.lessonId));
    });
  },

  // Lessons
  async addLesson(data: Partial<Lesson>): Promise<Lesson> {
    if (isRemoteEnabled()) {
      await apiFetch('/api/admin/lessons', { method: 'POST', body: JSON.stringify(data) });
      return data as Lesson;
    }
    const lesson: Lesson = {
      id: uid('lesson'),
      courseId: data.courseId ?? 'beginner',
      title: data.title ?? 'New Lesson',
      emoji: data.emoji ?? '📄',
      description: data.description ?? '',
      order: data.order ?? getDB().lessons.filter((l) => l.courseId === data.courseId).length + 1,
      isFree: data.isFree ?? false,
      sentenceCount: data.sentenceCount ?? 0,
    };
    updateDB((db) => db.lessons.push(lesson));
    return lesson;
  },

  async updateLesson(id: string, patch: Partial<Lesson>): Promise<void> {
    if (isRemoteEnabled()) {
      await apiFetch(`/api/admin/lessons/${id}`, { method: 'PUT', body: JSON.stringify(patch) });
      return;
    }
    updateDB((db) => {
      const i = db.lessons.findIndex((l) => l.id === id);
      if (i >= 0) db.lessons[i] = { ...db.lessons[i], ...patch, id };
    });
  },

  async deleteLesson(id: string): Promise<void> {
    if (isRemoteEnabled()) {
      await apiFetch(`/api/admin/lessons/${id}`, { method: 'DELETE' });
      return;
    }
    updateDB((db) => {
      db.lessons = db.lessons.filter((l) => l.id !== id);
      db.sentences = db.sentences.filter((s) => s.lessonId !== id);
    });
  },

  // Sentences
  async addSentence(data: Partial<Sentence>): Promise<Sentence> {
    if (isRemoteEnabled()) {
      await apiFetch('/api/admin/sentences', { method: 'POST', body: JSON.stringify(data) });
      return data as Sentence;
    }
    const db = getDB();
    const lessonId = data.lessonId ?? db.lessons[0]?.id ?? 'beginner-l1';
    const lesson = db.lessons.find((l) => l.id === lessonId);
    const courseId = lesson?.courseId ?? 'beginner';
    const sentence: Sentence = {
      id: uid('sent'),
      lessonId,
      courseId,
      english: data.english ?? '',
      hindi: data.hindi ?? '',
      difficulty: data.difficulty ?? 'easy',
      order: data.order ?? db.sentences.filter((s) => s.lessonId === lessonId).length + 1,
      isFree: data.isFree ?? lesson?.isFree ?? false,
    };
    updateDB((db2) => {
      db2.sentences.push(sentence);
      const li = db2.lessons.findIndex((l) => l.id === lessonId);
      if (li >= 0) db2.lessons[li].sentenceCount = db2.sentences.filter((s) => s.lessonId === lessonId).length;
    });
    return sentence;
  },

  async updateSentence(id: string, patch: Partial<Sentence>): Promise<void> {
    if (isRemoteEnabled()) {
      await apiFetch(`/api/admin/sentences/${id}`, { method: 'PUT', body: JSON.stringify(patch) });
      return;
    }
    updateDB((db) => {
      const i = db.sentences.findIndex((s) => s.id === id);
      if (i >= 0) db.sentences[i] = { ...db.sentences[i], ...patch, id };
    });
  },

  async deleteSentence(id: string): Promise<void> {
    if (isRemoteEnabled()) {
      await apiFetch(`/api/admin/sentences/${id}`, { method: 'DELETE' });
      return;
    }
    updateDB((db) => {
      const target = db.sentences.find((s) => s.id === id);
      db.sentences = db.sentences.filter((s) => s.id !== id);
      if (target) {
        const li = db.lessons.findIndex((l) => l.id === target.lessonId);
        if (li >= 0) {
          db.lessons[li].sentenceCount = db.sentences.filter((s) => s.lessonId === target.lessonId).length;
        }
      }
    });
  },

  // Packages
  async updatePackage(id: string, patch: Partial<Package>): Promise<void> {
    if (isRemoteEnabled()) {
      await apiFetch(`/api/admin/packages/${id}`, { method: 'PUT', body: JSON.stringify(patch) });
      return;
    }
    updateDB((db) => {
      const i = db.packages.findIndex((p) => p.id === id);
      if (i >= 0) db.packages[i] = { ...db.packages[i], ...patch, id };
    });
  },

  // Admin list helpers (all rows, for the admin tables)
  async getAllLessons(): Promise<Lesson[]> {
    if (isRemoteEnabled()) {
      return apiFetch<Lesson[]>('/api/lessons');
    }
    return [...getDB().lessons].sort((a, b) => a.courseId.localeCompare(b.courseId) || a.order - b.order);
  },

  async getAllSentences(): Promise<Sentence[]> {
    if (isRemoteEnabled()) {
      return apiFetch<Sentence[]>('/api/sentences');
    }
    return [...getDB().sentences];
  },
};
