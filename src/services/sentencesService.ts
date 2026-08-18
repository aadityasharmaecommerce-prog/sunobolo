import type { Sentence } from '@/types';
import { apiFetch, isRemoteEnabled, mockDelay } from './apiClient';
import { getDB } from './store';

export const sentencesService = {
  async getSentences(lessonId: string): Promise<Sentence[]> {
    if (isRemoteEnabled()) return apiFetch<Sentence[]>(`/api/lessons/${lessonId}/sentences`);
    await mockDelay(200);
    return getDB()
      .sentences.filter((s) => s.lessonId === lessonId)
      .sort((a, b) => a.order - b.order);
  },

  async getSentence(id: string): Promise<Sentence | null> {
    if (isRemoteEnabled()) return apiFetch<Sentence>(`/api/sentences/${id}`);
    await mockDelay(120);
    return getDB().sentences.find((s) => s.id === id) ?? null;
  },

  async getSentencesByCourse(courseId: string): Promise<Sentence[]> {
    if (isRemoteEnabled()) return apiFetch<Sentence[]>(`/api/courses/${courseId}/sentences`);
    await mockDelay(250);
    return getDB()
      .sentences.filter((s) => s.courseId === courseId)
      .sort((a, b) => a.order - b.order);
  },
};
