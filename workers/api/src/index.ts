/**
 * SunoBolo English — API Worker (Cloudflare Workers + D1)
 *
 * Routes (all under /api):
 *   GET  /api/health
 *   GET  /api/courses
 *   GET  /api/courses/:id
 *   GET  /api/courses/:id/lessons
 *   GET  /api/courses/:id/sentences
 *   GET  /api/courses/slug/:slug
 *   GET  /api/lessons/:id
 *   GET  /api/lessons/:id/sentences
 *   GET  /api/sentences/:id
 *   GET  /api/packages
 *   GET  /api/me?userId=
 *   GET  /api/me/progress?userId=
 *   POST /api/progress
 *   POST /api/practice
 *
 * Admin (requires `Authorization: Bearer <ADMIN_TOKEN>`):
 *   POST/PUT/DELETE /api/admin/courses[/:id]
 *   POST/PUT/DELETE /api/admin/lessons[/:id]
 *   POST/PUT/DELETE /api/admin/sentences[/:id]
 *   PUT /api/admin/packages/:id
 */
import { Router } from './router';
import { apiError, corsHeaders, isAdminAuthorized, json, notFound, readJson, type Env } from './helpers';
import {
  deleteCourse,
  deleteLesson,
  deleteSentence,
  getCourse,
  getCourseBySlug,
  getLesson,
  getMe,
  getProgress,
  getSentence,
  insertCourse,
  insertLesson,
  insertSentence,
  lessonsForCourse,
  listAllLessons,
  listAllSentences,
  listCourses,
  listPackages,
  mapCourse,
  mapLesson,
  mapSentence,
  recordProgress,
  sentencesForCourse,
  sentencesForLesson,
  updateCourse,
  updateLesson,
  updatePackage,
  updateSentence,
} from './queries';

const router = new Router();

// ── Health ───────────────────────────────────────────────
router.get('/api/health', () => json({ ok: true, app: 'SunoBolo English API', time: Date.now() }));

// ── Courses ──────────────────────────────────────────────
router.get('/api/courses', async ({ env }) => {
  const courses = await listCourses(env.DB);
  return json({ ok: true, data: courses });
});

router.get('/api/courses/slug/:slug', async ({ env, params }) => {
  const row = await getCourseBySlug(env.DB, params.slug);
  if (!row) return notFound('Course not found');
  return json({ ok: true, data: mapCourse(row) });
});

router.get('/api/courses/:id', async ({ env, params }) => {
  const row = await getCourse(env.DB, params.id);
  if (!row) return notFound('Course not found');
  return json({ ok: true, data: mapCourse(row) });
});

router.get('/api/courses/:id/lessons', async ({ env, params }) => {
  const lessons = await lessonsForCourse(env.DB, params.id);
  return json({ ok: true, data: lessons });
});

router.get('/api/courses/:id/sentences', async ({ env, params }) => {
  const sentences = await sentencesForCourse(env.DB, params.id);
  return json({ ok: true, data: sentences });
});

// ── Lessons ──────────────────────────────────────────────
router.get('/api/lessons/:id', async ({ env, params }) => {
  const row = await getLesson(env.DB, params.id);
  if (!row) return notFound('Lesson not found');
  return json({ ok: true, data: mapLesson(row) });
});

router.get('/api/lessons/:id/sentences', async ({ env, params }) => {
  const sentences = await sentencesForLesson(env.DB, params.id);
  return json({ ok: true, data: sentences });
});

// ── Sentences ────────────────────────────────────────────
router.get('/api/sentences/:id', async ({ env, params }) => {
  const row = await getSentence(env.DB, params.id);
  if (!row) return notFound('Sentence not found');
  return json({ ok: true, data: mapSentence(row) });
});

// ── Packages ─────────────────────────────────────────────
router.get('/api/packages', async ({ env }) => {
  const packages = await listPackages(env.DB);
  return json({ ok: true, data: packages });
});

router.get('/api/packages/:id', async ({ env, params }) => {
  const packages = await listPackages(env.DB);
  const pkg = packages.find((p) => p.id === params.id);
  if (!pkg) return notFound('Package not found');
  return json({ ok: true, data: pkg });
});

// ── Me / Progress (mock auth — real auth Phase 2.5) ──────
router.get('/api/me', async ({ env, url }) => {
  const userId = url.searchParams.get('userId');
  if (!userId) return apiError(400, 'userId query param required');
  return json({ ok: true, data: await getMe(env.DB, userId) });
});

router.get('/api/me/progress', async ({ env, url }) => {
  const userId = url.searchParams.get('userId');
  if (!userId) return apiError(400, 'userId query param required');
  return json({ ok: true, data: await getProgress(env.DB, userId) });
});

router.post('/api/progress', async ({ env, request }) => {
  const body = await readJson<{
    userId?: string;
    sentenceId?: string;
    lessonId?: string;
    courseId?: string;
    rounds?: number;
    minutes?: number;
  }>(request);
  if (!body?.userId) return apiError(400, 'userId is required');
  if (!body.sentenceId && !body.lessonId) return apiError(400, 'sentenceId or lessonId is required');

  const result = await recordProgress(env.DB, {
    userId: body.userId,
    sentenceId: body.sentenceId,
    lessonId: body.lessonId,
    courseId: body.courseId,
    rounds: body.rounds,
    minutes: body.minutes,
  });
  return json({ ok: true, data: result.progress }, 201);
});

router.post('/api/practice', async ({ env, request }) => {
  const body = await readJson<{ userId?: string; rounds?: number; minutes?: number }>(request);
  if (!body?.userId) return apiError(400, 'userId is required');
  const result = await recordProgress(env.DB, { userId: body.userId, rounds: body.rounds ?? 0, minutes: body.minutes ?? 0 });
  return json({ ok: true, data: result.progress }, 201);
});

// ── Admin ────────────────────────────────────────────────
function adminGuard(request: Request, env: Env): Response | null {
  if (!isAdminAuthorized(request, env)) {
    return apiError(401, 'Unauthorized — valid admin token required');
  }
  return null;
}

router.post('/api/admin/courses', async ({ env, request }) => {
  const denied = adminGuard(request, env);
  if (denied) return denied;
  const body = await readJson<Record<string, unknown>>(request);
  if (!body) return apiError(400, 'Invalid JSON body');
  await insertCourse(env.DB, body);
  return json({ ok: true }, 201);
});

router.put('/api/admin/courses/:id', async ({ env, request, params }) => {
  const denied = adminGuard(request, env);
  if (denied) return denied;
  const body = await readJson<Record<string, unknown>>(request);
  if (!body) return apiError(400, 'Invalid JSON body');
  await updateCourse(env.DB, params.id, body);
  return json({ ok: true });
});

router.delete('/api/admin/courses/:id', async ({ env, request, params }) => {
  const denied = adminGuard(request, env);
  if (denied) return denied;
  await deleteCourse(env.DB, params.id);
  return json({ ok: true });
});

router.post('/api/admin/lessons', async ({ env, request }) => {
  const denied = adminGuard(request, env);
  if (denied) return denied;
  const body = await readJson<Record<string, unknown>>(request);
  if (!body) return apiError(400, 'Invalid JSON body');
  await insertLesson(env.DB, body);
  return json({ ok: true }, 201);
});

router.put('/api/admin/lessons/:id', async ({ env, request, params }) => {
  const denied = adminGuard(request, env);
  if (denied) return denied;
  const body = await readJson<Record<string, unknown>>(request);
  if (!body) return apiError(400, 'Invalid JSON body');
  await updateLesson(env.DB, params.id, body);
  return json({ ok: true });
});

router.delete('/api/admin/lessons/:id', async ({ env, request, params }) => {
  const denied = adminGuard(request, env);
  if (denied) return denied;
  await deleteLesson(env.DB, params.id);
  return json({ ok: true });
});

router.post('/api/admin/sentences', async ({ env, request }) => {
  const denied = adminGuard(request, env);
  if (denied) return denied;
  const body = await readJson<Record<string, unknown>>(request);
  if (!body) return apiError(400, 'Invalid JSON body');
  await insertSentence(env.DB, body);
  return json({ ok: true }, 201);
});

router.put('/api/admin/sentences/:id', async ({ env, request, params }) => {
  const denied = adminGuard(request, env);
  if (denied) return denied;
  const body = await readJson<Record<string, unknown>>(request);
  if (!body) return apiError(400, 'Invalid JSON body');
  await updateSentence(env.DB, params.id, body);
  return json({ ok: true });
});

router.delete('/api/admin/sentences/:id', async ({ env, request, params }) => {
  const denied = adminGuard(request, env);
  if (denied) return denied;
  await deleteSentence(env.DB, params.id);
  return json({ ok: true });
});


// ── Admin list helpers (used by the admin UI) ─────────────
router.get('/api/lessons', async ({ env }) => {
  const lessons = await listAllLessons(env.DB);
  return json({ ok: true, data: lessons });
});

router.get('/api/sentences', async ({ env }) => {
  const sentences = await listAllSentences(env.DB);
  return json({ ok: true, data: sentences });
});


router.post('/api/progress/sync', async ({ env, request }) => {
  const body = await readJson<{
    userId?: string;
    sentences?: string[];
    lessons?: string[];
    activity?: string[];
    rounds?: number;
    minutes?: number;
  }>(request);
  if (!body?.userId) return apiError(400, 'userId is required');

  // Upsert the user (mock auth) so FK constraints hold
  await env.DB.prepare("INSERT OR IGNORE INTO users (id, name, created_at) VALUES (?, ?, datetime('now'))").bind(body.userId, body.userId).run();

  // Bulk upsert completed sentences
  for (const sid of body.sentences ?? []) {
    await env.DB.prepare('INSERT OR IGNORE INTO user_progress (user_id, sentence_id) VALUES (?, ?)').bind(body.userId, sid).run();
  }
  // Bulk upsert completed lessons
  for (const lid of body.lessons ?? []) {
    await env.DB.prepare('INSERT OR IGNORE INTO lesson_progress (user_id, lesson_id) VALUES (?, ?)').bind(body.userId, lid).run();
  }
  // Daily activity dates
  const activityDays = body.activity ?? [];
  const roundsPerDay = activityDays.length > 0 ? Math.max(1, Math.ceil((body.rounds ?? 0) / activityDays.length)) : 0;
  const minsPerDay = activityDays.length > 0 ? Math.max(1, Math.ceil((body.minutes ?? 0) / activityDays.length)) : 0;
  for (const day of activityDays) {
    await env.DB.prepare(
      "INSERT INTO daily_activity (user_id, activity_date, sentences_practiced, rounds, minutes) VALUES (?, ?, 1, ?, ?) ON CONFLICT(user_id, activity_date) DO UPDATE SET sentences_practiced = MAX(sentences_practiced, excluded.sentences_practiced), rounds = MAX(rounds, excluded.rounds), minutes = MAX(minutes, excluded.minutes)",
    ).bind(body.userId, day, roundsPerDay, minsPerDay).run();
  }

  return json({ ok: true, data: await getProgress(env.DB, body.userId) });
});


router.put('/api/admin/packages/:id', async ({ env, request, params }) => {
  const denied = adminGuard(request, env);
  if (denied) return denied;
  const body = await readJson<Record<string, unknown>>(request);
  if (!body) return apiError(400, 'Invalid JSON body');
  await updatePackage(env.DB, params.id, body);
  return json({ ok: true });
});

// ── Entry point ──────────────────────────────────────────
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) {
      return notFound('API routes only — use /api/*');
    }

    try {
      const response = await router.handle(request, env);
      if (response) return response;
      return notFound(`No route for ${request.method} ${url.pathname}`);
    } catch (err) {
      console.error('API error:', err);
      return apiError(500, 'Internal server error');
    }
  },
};
