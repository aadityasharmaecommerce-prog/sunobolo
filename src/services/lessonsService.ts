import type { Lesson } from '@/types';
import { apiFetch, isRemoteEnabled, mockDelay } from './apiClient';
import { getDB } from './store';

export const lessonsService = {
  async getLessons(courseId: string): Promise<Lesson[]> {
    if (isRemoteEnabled()) return apiFetch<Lesson[]>(`/api/courses/${courseId}/lessons`);
    await mockDelay();
    return getDB()
      .lessons.filter((l) => l.courseId === courseId)
      .sort((a, b) => a.order - b.order);
  },

  async getLesson(id: string): Promise<Lesson | null> {
    if (isRemoteEnabled()) return apiFetch<Lesson>(`/api/lessons/${id}`);
    await mockDelay(150);
    return getDB().lessons.find((l) => l.id === id) ?? null;
  },
};
