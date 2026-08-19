import type { Package } from '@/types';
import { apiFetch, isRemoteEnabled, mockDelay } from './apiClient';
import { getDB } from './store';
import { authService } from './authService';

export const packagesService = {
  async getPackages(): Promise<Package[]> {
    if (isRemoteEnabled()) return apiFetch<Package[]>('/api/packages');
    await mockDelay(150);
    return [...getDB().packages];
  },

  async getPackage(id: string): Promise<Package | null> {
    if (isRemoteEnabled()) return apiFetch<Package>(`/api/packages/${id}`);
    await mockDelay(100);
    return getDB().packages.find((p) => p.id === id) ?? null;
  },

  /**
   * Whether a course is unlocked for the current user.
   * Free courses are always unlocked; paid courses need a package.
   */
  async isCourseUnlocked(courseId: string): Promise<boolean> {
    const user = authService.getCurrentUser();
    if (isRemoteEnabled()) {
      try {
        const [courses, packages] = await Promise.all([
          apiFetch<Array<{ id: string; isFree?: boolean }>>('/api/courses'),
          apiFetch<Package[]>('/api/packages'),
        ]);
        const course = courses.find((c) => c.id === courseId);
        if (!course || course.isFree) return true;
        if (!user?.hasPackage) return false;
        const pkg = packages.find((p) => p.id === user.hasPackage);
        if (!pkg) return false;
        return pkg.courseIds.includes('*') || pkg.courseIds.includes(courseId);
      } catch {
        const db = getDB();
        const local = db.courses.find((c) => c.id === courseId);
        return !local || local.isFree === true;
      }
    }
    const db = getDB();
    const course = db.courses.find((c) => c.id === courseId);
    if (!course || course.isFree) return true;
    if (!user?.hasPackage) return false;
    const pkg = db.packages.find((p) => p.id === user.hasPackage);
    if (!pkg) return false;
    return pkg.courseIds.includes('*') || pkg.courseIds.includes(courseId);
  },

  /** Phase 1 mock purchase: marks the package as owned on the local user. */
  async purchase(packageId: string): Promise<{ ok: boolean; message: string }> {
    await mockDelay(600);
    const pkg = getDB().packages.find((p) => p.id === packageId);
    if (!pkg) return { ok: false, message: 'Package not found.' };
    if (packageId === 'free') return { ok: true, message: 'Free plan is already active.' };
    authService.updateProfile({ hasPackage: packageId });
    return { ok: true, message: `"${pkg.name}" unlocked! Ab saare courses khol gaye. (Mock purchase — Phase 2 mein real payment ayega.)` };
  },
};
