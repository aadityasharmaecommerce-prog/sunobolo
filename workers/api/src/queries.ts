/**
 * D1 query layer — all statements are parameterized.
 */

export interface CourseRow {
  id: string;
  category_id: string | null;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  long_description: string;
  level: string;
  audience: string;
  emoji: string;
  color: string;
  is_free: number;
  sort_order: number;
  featured: number;
  seo_title: string;
  seo_description: string;
  lesson_count: number;
  sentence_count: number;
}

export function mapCourse(row: CourseRow) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    tagline: row.tagline,
    description: row.description,
    longDescription: row.long_description,
    level: row.level,
    audience: row.audience,
    emoji: row.emoji,
    color: row.color,
    isFree: row.is_free === 1,
    order: row.sort_order,
    lessonCount: row.lesson_count,
    sentenceCount: row.sentence_count,
    featured: row.featured === 1,
    seo: { title: row.seo_title, description: row.seo_description },
  };
}

export interface LessonRow {
  id: string;
  course_id: string;
  title: string;
  emoji: string;
  description: string;
  sort_order: number;
  is_free: number;
  sentence_count: number;
}

export function mapLesson(row: LessonRow) {
  return {
    id: row.id,
    courseId: row.course_id,
    title: row.title,
    emoji: row.emoji,
    description: row.description,
    order: row.sort_order,
    isFree: row.is_free === 1,
    sentenceCount: row.sentence_count,
  };
}

export interface SentenceRow {
  id: string;
  lesson_id: string;
  course_id: string;
  english: string;
  hindi: string;
  difficulty: string;
  sort_order: number;
  is_free: number;
}

export function mapSentence(row: SentenceRow) {
  return {
    id: row.id,
    lessonId: row.lesson_id,
    courseId: row.course_id,
    english: row.english,
    hindi: row.hindi,
    difficulty: row.difficulty,
    order: row.sort_order,
    isFree: row.is_free === 1,
  };
}

// ── Courses ──────────────────────────────────────────────

export async function listCourses(db: D1Database) {
  const { results } = await db
    .prepare('SELECT * FROM courses ORDER BY sort_order ASC')
    .all<CourseRow>();
  return results.map(mapCourse);
}

export async function getCourse(db: D1Database, id: string) {
  return db.prepare('SELECT * FROM courses WHERE id = ?').bind(id).first<CourseRow>();
}

export async function getCourseBySlug(db: D1Database, slug: string) {
  return db.prepare('SELECT * FROM courses WHERE slug = ?').bind(slug).first<CourseRow>();
}

// ── Lessons ──────────────────────────────────────────────

export async function lessonsForCourse(db: D1Database, courseId: string) {
  const { results } = await db
    .prepare('SELECT * FROM lessons WHERE course_id = ? ORDER BY sort_order ASC')
    .bind(courseId)
    .all<LessonRow>();
  return results.map(mapLesson);
}

export async function getLesson(db: D1Database, id: string) {
  return db.prepare('SELECT * FROM lessons WHERE id = ?').bind(id).first<LessonRow>();
}

// ── Sentences ────────────────────────────────────────────

export async function sentencesForLesson(db: D1Database, lessonId: string) {
  const { results } = await db
    .prepare('SELECT * FROM sentences WHERE lesson_id = ? ORDER BY sort_order ASC')
    .bind(lessonId)
    .all<SentenceRow>();
  return results.map(mapSentence);
}

export async function sentencesForCourse(db: D1Database, courseId: string) {
  const { results } = await db
    .prepare('SELECT * FROM sentences WHERE course_id = ? ORDER BY lesson_id ASC, sort_order ASC')
    .bind(courseId)
    .all<SentenceRow>();
  return results.map(mapSentence);
}

export async function getSentence(db: D1Database, id: string) {
  return db.prepare('SELECT * FROM sentences WHERE id = ?').bind(id).first<SentenceRow>();
}

// ── Packages ─────────────────────────────────────────────

export async function listPackages(db: D1Database) {
  const { results } = await db.prepare('SELECT * FROM packages ORDER BY price ASC').all<{
    id: string;
    name: string;
    price: number;
    original_price: number;
    currency: string;
    tagline: string;
    features: string;
    popular: number;
    color: string;
  }>();
  const packageCourses = await db
    .prepare('SELECT package_id, course_id FROM package_courses')
    .all<{ package_id: string; course_id: string }>();

  return results.map((p) => {
    const ids = packageCourses.results.filter((pc) => pc.package_id === p.id).map((pc) => pc.course_id);
    return {
      id: p.id,
      name: p.name,
      price: p.price,
      originalPrice: p.original_price,
      currency: p.currency,
      tagline: p.tagline,
      features: safeParseArray(p.features),
      courseIds: ids.length > 0 ? ids : ['*'],
      popular: p.popular === 1,
      color: p.color,
    };
  });
}

function safeParseArray(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// ── Progress ─────────────────────────────────────────────

export interface ProgressPayload {
  userId: string;
  sentenceId?: string;
  lessonId?: string;
  courseId?: string;
  rounds?: number;
  minutes?: number;
}

function dateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function computeStreak(activityDates: string[]): number {
  if (activityDates.length === 0) return 0;
  const unique = Array.from(new Set(activityDates)).sort();
  const today = dateKey();
  const yesterday = dateKey(new Date(Date.now() - 86_400_000));
  let cursor = unique.includes(today) ? today : yesterday;
  if (!unique.includes(cursor)) return 0;
  let streak = 0;
  let idx = unique.length - 1;
  while (idx >= 0) {
    if (unique[idx] === cursor) {
      streak++;
      const [y, m, d] = cursor.split('-').map(Number);
      cursor = dateKey(new Date(y, m - 1, d - 1));
      idx--;
    } else {
      break;
    }
  }
  return streak;
}

/** Records one practiced sentence + daily activity for a user. */
export async function recordProgress(db: D1Database, p: ProgressPayload): Promise<{
  ok: boolean;
  progress: {
    sentencesPracticed: number;
    lessonsCompleted: number;
    currentStreak: number;
    dailyActivity: string[];
  };
}> {
  const today = dateKey();

  // Upsert the user so progress can be keyed even without full auth (Phase 2 mock auth).
  await db
    .prepare(
      `INSERT OR IGNORE INTO users (id, name, created_at) VALUES (?, ?, datetime('now'))`,
    )
    .bind(p.userId, p.userId)
    .run();

  if (p.sentenceId) {
    await db
      .prepare('INSERT OR IGNORE INTO user_progress (user_id, sentence_id) VALUES (?, ?)')
      .bind(p.userId, p.sentenceId)
      .run();
  }

  // Mark lesson complete when all its sentences are done.
  if (p.lessonId && p.courseId) {
    const lesson = await getLesson(db, p.lessonId);
    if (lesson) {
      const { results: total } = await db
        .prepare('SELECT COUNT(*) AS c FROM sentences WHERE lesson_id = ?')
        .bind(p.lessonId)
        .all<{ c: number }>();
      const { results: done } = await db
        .prepare(
          `SELECT COUNT(*) AS c FROM user_progress up
           JOIN sentences s ON s.id = up.sentence_id
           WHERE s.lesson_id = ? AND up.user_id = ?`,
        )
        .bind(p.lessonId, p.userId)
        .all<{ c: number }>();
      const totalC = total[0]?.c ?? 0;
      const doneC = done[0]?.c ?? 0;
      if (totalC > 0 && doneC >= totalC) {
        await db
          .prepare('INSERT OR IGNORE INTO lesson_progress (user_id, lesson_id) VALUES (?, ?)')
          .bind(p.userId, p.lessonId)
          .run();
      }
    }
  }

  // Daily activity upsert.
  await db
    .prepare(
      `INSERT INTO daily_activity (user_id, activity_date, sentences_practiced, rounds, minutes)
       VALUES (?, ?, 1, ?, ?)
       ON CONFLICT(user_id, activity_date) DO UPDATE SET
         sentences_practiced = sentences_practiced + 1,
         rounds = rounds + excluded.rounds,
         minutes = minutes + excluded.minutes`,
    )
    .bind(p.userId, today, p.rounds ?? 0, p.minutes ?? 0)
    .run();

  return { ok: true, progress: await getProgress(db, p.userId) };
}

export async function getProgress(db: D1Database, userId: string) {
  const { results: sentences } = await db
    .prepare('SELECT sentence_id FROM user_progress WHERE user_id = ?')
    .bind(userId)
    .all<{ sentence_id: string }>();
  const { results: lessons } = await db
    .prepare('SELECT lesson_id FROM lesson_progress WHERE user_id = ?')
    .bind(userId)
    .all<{ lesson_id: string }>();
  const { results: activity } = await db
    .prepare('SELECT activity_date FROM daily_activity WHERE user_id = ?')
    .bind(userId)
    .all<{ activity_date: string }>();

  const dailyActivity = activity.map((a) => a.activity_date);
  const completedSentences: Record<string, true> = {};
  for (const s of sentences) completedSentences[s.sentence_id] = true;
  const completedLessons: Record<string, true> = {};
  for (const l of lessons) completedLessons[l.lesson_id] = true;
  return {
    completedSentences,
    completedLessons,
    sentencesPracticed: sentences.length,
    lessonsCompleted: lessons.length,
    currentStreak: computeStreak(dailyActivity),
    dailyActivity,
    streak: computeStreak(dailyActivity),
  };
}

/** GET /api/me — mock user lookup (real auth arrives later). */
export async function getMe(db: D1Database, userId: string) {
  const user = await db
    .prepare('SELECT id, name, email, phone, avatar_color, is_admin, created_at FROM users WHERE id = ?')
    .bind(userId)
    .first<{ id: string; name: string; email: string | null; phone: string | null; avatar_color: string; is_admin: number; created_at: string }>();
  if (!user) {
    return { id: userId, name: 'Guest', mockAuth: true, exists: false };
  }
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    avatarColor: user.avatar_color,
    isAdmin: user.is_admin === 1,
    createdAt: user.created_at,
    mockAuth: true,
  };
}

// ── Admin CRUD ───────────────────────────────────────────

export async function insertCourse(db: D1Database, body: Record<string, unknown>): Promise<void> {
  await db
    .prepare(
      `INSERT INTO courses (id, slug, title, tagline, description, long_description, level, audience, emoji, color, is_free, sort_order, featured, seo_title, seo_description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      String(body.id ?? `course-${Date.now()}`),
      String(body.slug ?? `course-${Date.now()}`),
      String(body.title ?? 'New Course'),
      String(body.tagline ?? ''),
      String(body.description ?? ''),
      String(body.longDescription ?? ''),
      String(body.level ?? 'beginner'),
      String(body.audience ?? 'adults'),
      String(body.emoji ?? '📘'),
      String(body.color ?? 'sky'),
      body.isFree ? 1 : 0,
      Number(body.order ?? 0),
      body.featured ? 1 : 0,
      String((body.seo as Record<string, unknown> | undefined)?.title ?? body.title ?? ''),
      String((body.seo as Record<string, unknown> | undefined)?.description ?? body.description ?? ''),
    )
    .run();
}

export async function updateCourse(db: D1Database, id: string, body: Record<string, unknown>): Promise<void> {
  await db
    .prepare(
      `UPDATE courses SET title = ?, tagline = ?, description = ?, long_description = ?, level = ?, audience = ?, emoji = ?, color = ?, is_free = ?, sort_order = ?, featured = ?, slug = ?, updated_at = datetime("now") WHERE id = ?`,
    )
    .bind(
      String(body.title ?? ''),
      String(body.tagline ?? ''),
      String(body.description ?? ''),
      String(body.longDescription ?? ''),
      String(body.level ?? 'beginner'),
      String(body.audience ?? 'adults'),
      String(body.emoji ?? '📘'),
      String(body.color ?? 'sky'),
      body.isFree ? 1 : 0,
      Number(body.order ?? 0),
      body.featured ? 1 : 0,
      String(body.slug ?? ''),
      id,
    )
    .run();
}

export async function deleteCourse(db: D1Database, id: string): Promise<void> {
  // FK cascade removes lessons + sentences.
  await db.prepare('DELETE FROM courses WHERE id = ?').bind(id).run();
}

export async function insertLesson(db: D1Database, body: Record<string, unknown>): Promise<void> {
  await db
    .prepare(
      `INSERT INTO lessons (id, course_id, title, emoji, description, sort_order, is_free, sentence_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
    )
    .bind(
      String(body.id ?? `lesson-${Date.now()}`),
      String(body.courseId ?? 'beginner'),
      String(body.title ?? 'New Lesson'),
      String(body.emoji ?? '📄'),
      String(body.description ?? ''),
      Number(body.order ?? 0),
      body.isFree ? 1 : 0,
    )
    .run();
  await refreshLessonCounts(db, String(body.courseId ?? 'beginner'));
}

export async function updateLesson(db: D1Database, id: string, body: Record<string, unknown>): Promise<void> {
  await db
    .prepare(
      `UPDATE lessons SET title = ?, emoji = ?, description = ?, sort_order = ?, is_free = ?, updated_at = datetime('now') WHERE id = ?`,
    )
    .bind(
      String(body.title ?? ''),
      String(body.emoji ?? '📄'),
      String(body.description ?? ''),
      Number(body.order ?? 0),
      body.isFree ? 1 : 0,
      id,
    )
    .run();
}

export async function deleteLesson(db: D1Database, id: string): Promise<void> {
  const lesson = await getLesson(db, id);
  await db.prepare('DELETE FROM lessons WHERE id = ?').bind(id).run();
  if (lesson) await refreshLessonCounts(db, lesson.course_id);
}

export async function insertSentence(db: D1Database, body: Record<string, unknown>): Promise<void> {
  const lessonId = String(body.lessonId ?? 'beginner-l1');
  const lesson = await getLesson(db, lessonId);
  await db
    .prepare(
      `INSERT INTO sentences (id, lesson_id, course_id, english, hindi, difficulty, sort_order, is_free)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      String(body.id ?? `sent-${Date.now()}`),
      lessonId,
      String(body.courseId ?? lesson?.course_id ?? 'beginner'),
      String(body.english ?? ''),
      String(body.hindi ?? ''),
      String(body.difficulty ?? 'easy'),
      Number(body.order ?? 0),
      body.isFree ? 1 : 0,
    )
    .run();
  await refreshLessonCounts(db, lessonId);
}

export async function updateSentence(db: D1Database, id: string, body: Record<string, unknown>): Promise<void> {
  await db
    .prepare(
      `UPDATE sentences SET english = ?, hindi = ?, difficulty = ?, sort_order = ?, is_free = ?, updated_at = datetime('now') WHERE id = ?`,
    )
    .bind(
      String(body.english ?? ''),
      String(body.hindi ?? ''),
      String(body.difficulty ?? 'easy'),
      Number(body.order ?? 0),
      body.isFree ? 1 : 0,
      id,
    )
    .run();
}

export async function deleteSentence(db: D1Database, id: string): Promise<void> {
  const sentence = await getSentence(db, id);
  await db.prepare('DELETE FROM sentences WHERE id = ?').bind(id).run();
  if (sentence) await refreshLessonCounts(db, sentence.lesson_id);
}

/** Keeps lesson.sentence_count and course.sentence_count in sync. */
async function refreshLessonCounts(db: D1Database, lessonId: string): Promise<void> {
  const { results: counts } = await db
    .prepare('SELECT COUNT(*) AS c FROM sentences WHERE lesson_id = ?')
    .bind(lessonId)
    .all<{ c: number }>();
  const count = counts[0]?.c ?? 0;
  const lesson = await getLesson(db, lessonId);
  if (!lesson) return;
  await db.prepare('UPDATE lessons SET sentence_count = ? WHERE id = ?').bind(count, lessonId).run();
  const { results: total } = await db
    .prepare('SELECT COUNT(*) AS c FROM sentences WHERE course_id = ?')
    .bind(lesson.course_id)
    .all<{ c: number }>();
  await db
    .prepare('UPDATE courses SET sentence_count = ?, lesson_count = (SELECT COUNT(*) FROM lessons WHERE course_id = ?) WHERE id = ?')
    .bind(total[0]?.c ?? 0, lesson.course_id, lesson.course_id)
    .run();
}

// ── Admin list helpers ──────────────────────────────────

export async function listAllLessons(db: D1Database) {
  const { results } = await db
    .prepare('SELECT * FROM lessons ORDER BY course_id ASC, sort_order ASC')
    .all<LessonRow>();
  return results.map(mapLesson);
}

export async function listAllSentences(db: D1Database) {
  const { results } = await db
    .prepare('SELECT * FROM sentences ORDER BY course_id ASC, lesson_id ASC, sort_order ASC LIMIT 1000')
    .all<SentenceRow>();
  return results.map(mapSentence);
}

export async function updatePackage(db: D1Database, id: string, body: Record<string, unknown>): Promise<void> {
  await db
    .prepare(
      "UPDATE packages SET name = ?, price = ?, original_price = ?, tagline = ?, updated_at = datetime('now') WHERE id = ?",
    )
    .bind(
      String(body.name ?? ''),
      Number(body.price ?? 0),
      Number(body.originalPrice ?? 0),
      String(body.tagline ?? ''),
      id,
    )
    .run();
}
