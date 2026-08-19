// Cloudflare Pages Function - serves all API routes
// Routes:
//   GET  /api/courses                          - all courses
//   GET  /api/courses/:slug                    - one course with lessons
//   GET  /api/lessons/:id                     - one lesson with sentences
//   GET  /api/sentences/:id                    - one sentence
//   GET  /api/stats                            - aggregate stats
//   GET  /api/health                           - liveness
//   POST /api/progress                         - mark sentence complete (body: {userId, sentenceId})
//   POST /api/auth/guest                       - create guest user

interface Env {
  DB: D1Database;
  ENVIRONMENT?: string;
}

const json = (data: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=300',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, POST, OPTIONS',
      'access-control-allow-headers': 'content-type',
      ...(init.headers || {}),
    },
  });

const err = (msg: string, status = 400) =>
  json({ error: msg }, { status });

function escape(s: string) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export const onRequest: PagesFunction<Env> = async ({ request, env, params }) => {
  const path = (params.path as string[]) || [];
  const route = '/' + path.join('/');
  const url = new URL(request.url);
  const method = request.method.toUpperCase();

  // CORS preflight
  if (method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'GET, POST, OPTIONS',
        'access-control-allow-headers': 'content-type',
      },
    });
  }

  try {
    // Health check
    if (route === '/health' || route === '/') {
      return json({ ok: true, time: new Date().toISOString() });
    }

    // Stats
    if (route === '/stats') {
      const [c, l, s, u] = await Promise.all([
        env.DB.prepare('SELECT COUNT(*) AS n FROM courses').first<{ n: number }>(),
        env.DB.prepare('SELECT COUNT(*) AS n FROM lessons').first<{ n: number }>(),
        env.DB.prepare('SELECT COUNT(*) AS n FROM sentences').first<{ n: number }>(),
        env.DB.prepare('SELECT COUNT(*) AS n FROM users').first<{ n: number }>(),
      ]);
      return json({
        courses: c?.n || 0,
        lessons: l?.n || 0,
        sentences: s?.n || 0,
        users: u?.n || 0,
      });
    }

    // All courses
    if (route === '/courses' && method === 'GET') {
      const { results } = await env.DB.prepare(
        'SELECT * FROM courses ORDER BY sort_order ASC'
      ).all();
      return json(results || []);
    }

    // Course by slug
    const courseMatch = route.match(/^\/courses\/([\w-]+)$/);
    if (courseMatch && method === 'GET') {
      const slug = courseMatch[1];
      const course = await env.DB.prepare(
        'SELECT * FROM courses WHERE slug = ? OR id = ?'
      ).bind(slug, slug).first();
      if (!course) return err('Course not found', 404);
      const { results: lessons } = await env.DB.prepare(
        'SELECT * FROM lessons WHERE course_id = ? ORDER BY sort_order ASC'
      ).bind(course.id).all();
      return json({ ...course, lessons: lessons || [] });
    }

    // Lesson by id
    const lessonMatch = route.match(/^\/lessons\/([\w-]+)$/);
    if (lessonMatch && method === 'GET') {
      const id = lessonMatch[1];
      const lesson = await env.DB.prepare(
        'SELECT * FROM lessons WHERE id = ?'
      ).bind(id).first();
      if (!lesson) return err('Lesson not found', 404);
      const { results: sentences } = await env.DB.prepare(
        'SELECT * FROM sentences WHERE lesson_id = ? ORDER BY sort_order ASC'
      ).bind(id).all();
      return json({ ...lesson, sentences: sentences || [] });
    }

    // Sentence by id
    const sentMatch = route.match(/^\/sentences\/([\w-]+)$/);
    if (sentMatch && method === 'GET') {
      const id = sentMatch[1];
      const sentence = await env.DB.prepare(
        'SELECT * FROM sentences WHERE id = ?'
      ).bind(id).first();
      if (!sentence) return err('Sentence not found', 404);
      return json(sentence);
    }

    // POST /progress - mark sentence complete
    if (route === '/progress' && method === 'POST') {
      const body = await request.json<{ userId: string; sentenceId: string }>();
      if (!body?.userId || !body?.sentenceId) {
        return err('userId and sentenceId required');
      }
      await env.DB.prepare(
        'INSERT OR IGNORE INTO user_progress (user_id, sentence_id) VALUES (?, ?)'
      ).bind(body.userId, body.sentenceId).run();
      return json({ ok: true });
    }

    // POST /auth/guest - create guest user
    if (route === '/auth/guest' && method === 'POST') {
      const id = 'guest_' + crypto.randomUUID().slice(0, 12);
      const colors = ['sky', 'purple', 'green', 'orange', 'pink'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      await env.DB.prepare(
        'INSERT INTO users (id, name, avatar_color) VALUES (?, ?, ?)'
      ).bind(id, 'Guest', color).run();
      return json({ id, name: 'Guest', avatar_color: color });
    }

    return err('Not found', 404);
  } catch (e: any) {
    return json({ error: e.message || 'Server error' }, { status: 500 });
  }
};
