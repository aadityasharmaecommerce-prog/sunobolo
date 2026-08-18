import type { Audience, Course, Level } from '@/types';
import { apiFetch, isRemoteEnabled, mockDelay } from './apiClient';
import { getDB } from './store';

/**
 * coursesService
 * Phase 1: mock/local data. Phase 2: `GET /api/courses`, `GET /api/courses/:id`.
 * The UI never talks to this module's internals directly — only through these methods.
 */
export const coursesService = {
  async getCourses(): Promise<Course[]> {
    if (isRemoteEnabled()) return apiFetch<Course[]>('/api/courses');
    await mockDelay();
    return [...getDB().courses].sort((a, b) => a.order - b.order);
  },

  async getCourse(id: string): Promise<Course | null> {
    if (isRemoteEnabled()) return apiFetch<Course>(`/api/courses/${id}`);
    await mockDelay(150);
    return getDB().courses.find((c) => c.id === id) ?? null;
  },

  async getCourseBySlug(slug: string): Promise<Course | null> {
    if (isRemoteEnabled()) return apiFetch<Course>(`/api/courses/slug/${slug}`);
    await mockDelay(150);
    return getDB().courses.find((c) => c.slug === slug) ?? null;
  },

  async getCoursesByAudience(audience: Audience): Promise<Course[]> {
    const all = await this.getCourses();
    return all.filter((c) => c.audience === audience);
  },

  async getCoursesByLevel(level: Level): Promise<Course[]> {
    const all = await this.getCourses();
    return all.filter((c) => c.level === level);
  },

  async getFeatured(): Promise<Course[]> {
    const all = await this.getCourses();
    return all.filter((c) => c.featured);
  },
};
