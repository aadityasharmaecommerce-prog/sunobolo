import type { Audience, Goal, Level, UserLevel } from '@/types';

export const APP = {
  name: 'SunoBolo English',
  shortName: 'SunoBolo',
  tagline: 'Suno. Bolo. Repeat Karo.',
  supporting: 'English Samajhna Nahi, English Bolna Seekho.',
  heroHeading: 'English Bolna Seekho',
  heroSub: 'Roz sirf 10–15 minute practice karke English speaking improve karein.',
  baseUrl: 'https://sunobolo.example.com',
} as const;

/** The core learning method: every sentence is listened to 3x, spoken 3x, then next. */
export const METHOD = {
  listenCount: 3,
  speakCount: 3,
  /** Delay between TTS repetitions (ms). */
  listenGapMs: 900,
  /** Default TTS speaking rate (0.9 = slightly slower = clearer). */
  ttsRate: 0.92,
  /** How long the "listening..." mic state lasts during speak practice (ms). */
  practiceHoldMs: 2200,
} as const;

export const STORAGE_KEYS = {
  db: 'sb_db_v1',
  user: 'sb_user_v1',
  progress: 'sb_progress_v1',
  onboarding: 'sb_onboarded_v1',
  prefs: 'sb_prefs_v1',
} as const;

export const ROUTES = {
  home: '/',
  onboarding: '/onboarding',
  dashboard: '/dashboard',
  courses: '/courses',
  pricing: '/pricing',
  login: '/login',
  signup: '/signup',
  forgotPassword: '/forgot-password',
  profile: '/profile',
  admin: '/admin',
  category: (slug: string) => `/${slug}`,
  course: (id: string) => `/courses/${id}`,
  lesson: (courseId: string, lessonId: string) => `/courses/${courseId}/lessons/${lessonId}`,
} as const;

export const GOALS: { id: Goal; label: string; emoji: string; description: string }[] = [
  { id: 'daily', label: 'Daily Conversation', emoji: '🗣️', description: 'Roz ki baat-cheet ke liye' },
  { id: 'school', label: 'School', emoji: '🎒', description: 'School aur studies ke liye' },
  { id: 'interview', label: 'Interview', emoji: '💼', description: 'Job interview ki taiyari' },
  { id: 'job', label: 'Job', emoji: '🏢', description: 'Naukri aur career ke liye' },
  { id: 'corporate', label: 'Corporate', emoji: '📈', description: 'Office aur team ke liye' },
  { id: 'business', label: 'Business', emoji: '🤝', description: 'Business aur clients ke liye' },
  { id: 'travel', label: 'Travel', emoji: '✈️', description: 'Travel aur trips ke liye' },
  { id: 'confidence', label: 'Confidence', emoji: '💪', description: 'Bolne ka confidence badhane ke liye' },
];

export const LEVEL_OPTIONS: { id: UserLevel; label: string; emoji: string }[] = [
  { id: 'beginner', label: 'Bilkul Beginner', emoji: '🌱' },
  { id: 'basic', label: 'Basic', emoji: '📖' },
  { id: 'intermediate', label: 'Intermediate', emoji: '🚀' },
  { id: 'advanced', label: 'Advanced', emoji: '🎯' },
  { id: 'unknown', label: "I don't know", emoji: '🤷' },
];

export const LEVEL_LABELS: Record<Level, string> = {
  kids: 'Kids English',
  school: 'School English',
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  daily: 'Daily Life English',
  interview: 'Interview English',
  corporate: 'Corporate English',
  business: 'Business English',
  travel: 'Travel English',
};

export const AUDIENCE_LABELS: Record<Audience, string> = {
  kids: 'Kids',
  students: 'School Students',
  adults: 'Adults',
  professionals: 'Professionals',
};

export const AUDIENCE_DETAILS: Record<Audience, { heading: string; sub: string; emoji: string }> = {
  kids: {
    heading: 'Bachon ke liye',
    sub: 'Khel-khel mein English seekhein — alphabet, animals, colors aur chhoti sentences.',
    emoji: '🧸',
  },
  students: {
    heading: 'School students ke liye',
    sub: 'Classroom English, teacher se baat, aur school mein bolne ki practice.',
    emoji: '🎒',
  },
  adults: {
    heading: 'Adults ke liye',
    sub: 'Beginner se Advanced tak — roz ki zindagi, kaam aur travel ke liye.',
    emoji: '👨‍💼',
  },
  professionals: {
    heading: 'Professionals ke liye',
    sub: 'Interview, corporate, business aur client communication ke liye.',
    emoji: '💼',
  },
};

/** SEO landing pages (category pages). */
export interface CategoryPageDef {
  slug: string;
  level: Level;
  title: string;
  heading: string;
  description: string;
}

export const CATEGORY_PAGES: CategoryPageDef[] = [
  {
    slug: 'english-for-kids',
    level: 'kids',
    title: 'English for Kids — SunoBolo English',
    heading: 'Kids ke liye English',
    description: 'Bachon ke liye easy English speaking practice — alphabet, numbers, animals, colors aur family ke sentences, suno bolo repeat karo.',
  },
  {
    slug: 'english-for-beginners',
    level: 'beginner',
    title: 'English for Beginners — SunoBolo English',
    heading: 'Shuruaat se English Seekho',
    description: 'Bilkul zero se English bolna seekho — introduction, greetings, family, food aur daily routine ke 100+ easy sentences.',
  },
  {
    slug: 'daily-use-english',
    level: 'daily',
    title: 'Daily Use English Sentences — SunoBolo English',
    heading: 'Daily Use English',
    description: 'Roz ki zindagi mein bole jaane wale English sentences — ghar, shopping, bank, hospital, phone aur WhatsApp ke liye.',
  },
  {
    slug: 'interview-english',
    level: 'interview',
    title: 'Interview English — SunoBolo English',
    heading: 'Interview ki Taiyari',
    description: 'Job interview mein confidence ke saath bolo — tell me about yourself, HR questions aur situational answers ki practice.',
  },
  {
    slug: 'corporate-english',
    level: 'corporate',
    title: 'Corporate English — SunoBolo English',
    heading: 'Corporate English',
    description: 'Office, meetings, team aur client communication ke liye professional English speaking practice.',
  },
  {
    slug: 'business-english',
    level: 'business',
    title: 'Business English — SunoBolo English',
    heading: 'Business English',
    description: 'Business calls, negotiation, pricing aur partnerships ke liye English — apne business ko aage badhao.',
  },
  {
    slug: 'travel-english',
    level: 'travel',
    title: 'Travel English — SunoBolo English',
    heading: 'Travel English',
    description: 'Airport, hotel, taxi, restaurant aur directions — travel ke har situation ke liye English sentences.',
  },
  {
    slug: 'spoken-english',
    level: 'beginner',
    title: 'Spoken English Course — SunoBolo English',
    heading: 'Spoken English Course',
    description: 'Spoken English sikhne ka asaan tarika — Suno. Bolo. Repeat Karo. Har sentence ko 3 baar suno, 3 baar bolo.',
  },
  {
    slug: 'english-speaking-practice',
    level: 'daily',
    title: 'English Speaking Practice — SunoBolo English',
    heading: 'English Speaking Practice',
    description: 'Daily English speaking practice — 10–15 minute roz, sentence by sentence, sirf suno bolo repeat karo.',
  },
];

/** Where the audio is spoken from (Phase 2 config, unused in Phase 1). */
export const API = {
  useRemote: import.meta.env.VITE_USE_REMOTE_API === 'true',
  baseUrl: (import.meta.env.VITE_API_URL as string | undefined) ?? '',
  adminToken: (import.meta.env.VITE_ADMIN_TOKEN as string | undefined) ?? '',
} as const;
