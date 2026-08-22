import type { CourseData } from './types';
import { freeTrialLesson } from './free-trial';

// ============================================
// COURSE METADATA INDEX — Lightweight
// Actual sentence data is lazy-loaded per course
// ============================================

// Map courseId -> module export name
const COURSE_EXPORT_NAMES: Record<string, string> = {
  'beginner': 'beginnerCourse',
  'intermediate': 'intermediateCourse',
  'advanced': 'advancedCourse',
  'daily-life': 'daily_lifeCourse',
  'interview': 'interviewCourse',
  'corporate': 'corporateCourse',
  'business': 'businessCourse',
  'travel': 'travelCourse',
  'school': 'schoolCourse',
  'kids': 'kidsCourse',
};

const courseLoaders: Record<string, () => Promise<Record<string, CourseData>>> = {
  'beginner': () => import('./beginner'),
  'intermediate': () => import('./intermediate'),
  'advanced': () => import('./advanced'),
  'daily-life': () => import('./daily-life'),
  'interview': () => import('./interview'),
  'corporate': () => import('./corporate'),
  'business': () => import('./business'),
  'travel': () => import('./travel'),
  'school': () => import('./school'),
  'kids': () => import('./kids'),
};

// Cache loaded courses
const loadedCourses = new Map<string, CourseData>();

export async function loadCourse(courseId: string): Promise<CourseData | null> {
  if (loadedCourses.has(courseId)) {
    return loadedCourses.get(courseId)!;
  }
  const loader = courseLoaders[courseId];
  if (!loader) return null;
  try {
    const mod = await loader();
    const exportName = COURSE_EXPORT_NAMES[courseId];
    const course = exportName ? (mod as Record<string, CourseData>)[exportName] : (mod as Record<string, CourseData>)[Object.keys(mod)[0]];
    if (course) {
      loadedCourses.set(courseId, course);
    }
    return course || null;
  } catch (e) {
    console.error('Failed to load course:', courseId, e);
    return null;
  }
}

// Lightweight course metadata (no sentence data)
export const courseMetadata = [
  {
    id: 'beginner',
    title: 'Beginner English',
    description: 'Start from zero and build a strong foundation in spoken English. Real-life sentences for daily conversations.',
    shortDescription: 'Start from zero and build confidence',
    icon: '🟢',
    color: 'brand',
    difficulty: 'Beginner',
    targetAudience: [],
    totalSentences: 725,
    totalLessons: 29,
    estimatedHours: 29,
    isFree: false,
    price: '₹199',
  },
  {
    id: 'intermediate',
    title: 'Intermediate English',
    description: 'Take your English to the next level - opinions, experiences, and natural conversations.',
    shortDescription: 'Speak with more confidence',
    icon: '📈',
    color: 'accent',
    difficulty: 'Intermediate',
    targetAudience: [],
    totalSentences: 350,
    totalLessons: 14,
    estimatedHours: 14,
    isFree: false,
    price: '₹299',
  },
  {
    id: 'advanced',
    title: 'Advanced English',
    description: 'Master professional communication, complex discussions, and advanced speaking skills.',
    shortDescription: 'Speak with sophistication',
    icon: '🎯',
    color: 'brand',
    difficulty: 'Advanced',
    targetAudience: [],
    totalSentences: 300,
    totalLessons: 12,
    estimatedHours: 12,
    isFree: false,
    price: '₹399',
  },
  {
    id: 'daily-life',
    title: 'Daily Life English',
    description: 'Sentences you use every day - at home, market, bank, hospital, and with friends.',
    shortDescription: 'Speak English in daily situations',
    icon: '🏠',
    color: 'brand',
    difficulty: 'Beginner',
    targetAudience: [],
    totalSentences: 475,
    totalLessons: 18,
    estimatedHours: 19,
    isFree: false,
    price: '₹199',
  },
  {
    id: 'interview',
    title: 'Interview English',
    description: 'English for job interviews - self introduction, common questions, and confident answers.',
    shortDescription: 'Clear your interview with confidence',
    icon: '💼',
    color: 'accent',
    difficulty: 'Intermediate',
    targetAudience: [],
    totalSentences: 100,
    totalLessons: 4,
    estimatedHours: 2,
    isFree: false,
    price: '₹299',
  },
  {
    id: 'corporate',
    title: 'Corporate English',
    description: 'Professional English for the office - meetings, emails, deadlines, and team communication.',
    shortDescription: 'Excel at workplace communication',
    icon: '🏢',
    color: 'brand',
    difficulty: 'Intermediate',
    targetAudience: [],
    totalSentences: 100,
    totalLessons: 4,
    estimatedHours: 2,
    isFree: false,
    price: '₹299',
  },
  {
    id: 'business',
    title: 'Business English',
    description: 'English for business owners and entrepreneurs - sales, customers, suppliers, and deals.',
    shortDescription: 'Grow your business with English',
    icon: '💰',
    color: 'accent',
    difficulty: 'Intermediate',
    targetAudience: [],
    totalSentences: 100,
    totalLessons: 4,
    estimatedHours: 2,
    isFree: false,
    price: '₹299',
  },
  {
    id: 'travel',
    title: 'Travel English',
    description: 'Essential English for travelling - airport, hotel, taxi, and tourist situations.',
    shortDescription: 'Travel confidently in English',
    icon: '✈️',
    color: 'accent',
    difficulty: 'Beginner',
    targetAudience: [],
    totalSentences: 100,
    totalLessons: 4,
    estimatedHours: 2,
    isFree: false,
    price: '₹149',
  },
  {
    id: 'school',
    title: 'School English',
    description: 'English for school students - classroom, homework, exams, and friends.',
    shortDescription: 'Ace your school English',
    icon: '🎒',
    color: 'brand',
    difficulty: 'Beginner',
    targetAudience: [],
    totalSentences: 100,
    totalLessons: 4,
    estimatedHours: 2,
    isFree: false,
    price: '₹149',
  },
  {
    id: 'kids',
    title: 'Kids English',
    description: 'Fun and simple English for children - colours, animals, games, and everyday things.',
    shortDescription: 'Learn English the fun way',
    icon: '👶',
    color: 'accent',
    difficulty: 'Beginner',
    targetAudience: [],
    totalSentences: 100,
    totalLessons: 4,
    estimatedHours: 2,
    isFree: false,
    price: '₹149',
  }
];

// Backward compatibility: allCourses (empty — use loadCourse() instead)
export const allCourses: CourseData[] = [];

export { freeTrialLesson };
export type { CourseData };
export { courseLoaders };
