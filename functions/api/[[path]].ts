/**
 * SunoBolo English — Cloudflare Pages Function (API)
 *
 * Routes:
 *   GET  /api/health                           - liveness
 *   GET  /api/stats                            - aggregate stats
 *   GET  /api/courses                          - all courses (with access info)
 *   GET  /api/courses/:slug                    - one course with lessons
 *   GET  /api/lessons/:id                     - one lesson with sentences
 *   GET  /api/sentences/:id                    - one sentence
 *   POST /api/progress                         - mark sentence complete
 *
 *   POST /api/auth/google                      - Google OAuth login
 *   GET  /api/auth/me                          - current user info
 *   POST /api/auth/logout                      - destroy session
 *
 *   POST /api/payment/create-order             - create Razorpay order
 *   POST /api/payment/verify                   - verify Razorpay payment
 *   POST /api/payment/webhook                  - Razorpay webhook
 *
 *   GET  /api/subscription                     - current subscription status
 *   GET  /api/access                           - check if user has full access
 *
 * Secrets required (set via wrangler secret put):
 *   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SESSION_SECRET,
 *   RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET
 */

interface Env {
  DB: D1Database;
  ENVIRONMENT?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  SESSION_SECRET?: string;
  RAZORPAY_KEY_ID?: string;
  RAZORPAY_KEY_SECRET?: string;
  RAZORPAY_WEBHOOK_SECRET?: string;
}

// ── Plan Configuration (server-side source of truth) ──

const PLANS = {
  three_month: { id: 'three_month', amount: 59900, durationMonths: 3 },
  six_month:   { id: 'six_month',   amount: 99900, durationMonths: 6 },
  one_year:    { id: 'one_year',    amount: 170000, durationMonths: 12 },
} as const;

type PlanId = keyof typeof PLANS;

function getServerPlan(planId: string): { id: string; amount: number; durationMonths: number } | null {
  const plan = PLANS[planId as PlanId];
  return plan ? { ...plan } : null;
}

// ── Helpers ──

const json = (data: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, POST, OPTIONS',
      'access-control-allow-headers': 'content-type, authorization',
      ...(init.headers || {}),
    },
  });

const err = (msg: string, status = 400) => json({ error: msg }, { status });

async function hashToken(token: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token + secret);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function extractSessionToken(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/sb_session=([^;]+)/);
  return match ? match[1] : null;
}

async function authenticateUser(
  request: Request,
  env: Env,
): Promise<{ id: string; name: string; email: string; avatar_url: string | null } | null> {
  const token = extractSessionToken(request.headers.get('cookie'));
  if (!token || !env.SESSION_SECRET) return null;

  const tokenHash = await hashToken(token, env.SESSION_SECRET);
  const session = await env.DB.prepare(
    `SELECT s.user_id, s.expires_at FROM sessions s WHERE s.token_hash = ?`
  ).bind(tokenHash).first<{ user_id: string; expires_at: string }>();

  if (!session) return null;
  if (new Date(session.expires_at) < new Date()) return null;

  const user = await env.DB.prepare(
    `SELECT id, name, email, avatar_url FROM users WHERE id = ?`
  ).bind(session.user_id).first<{ id: string; name: string; email: string; avatar_url: string | null }>();

  return user ?? null;
}

async function hasActiveAccess(userId: string, db: D1Database): Promise<boolean> {
  const sub = await db.prepare(
    `SELECT expires_at FROM subscriptions
     WHERE user_id = ? AND status = 'active'
     ORDER BY expires_at DESC LIMIT 1`
  ).bind(userId).first<{ expires_at: string }>();
  if (!sub) return false;
  return new Date(sub.expires_at) > new Date();
}

// ── Auth handlers ──

async function handleAuthGoogle(request: Request, env: Env): Promise<Response> {
  const body = await request.json<{ credential?: string; code?: string }>();

  if (body.credential) {
    const parts = body.credential.split('.');
    if (parts.length !== 3) return err('Invalid credential');
    try {
      const payload = JSON.parse(atob(parts[1]));
      const googleId = payload.sub;
      const email = payload.email;
      const name = payload.name || 'User';
      const avatarUrl = payload.picture || null;
      if (!googleId || !email) return err('Invalid Google token');

      await env.DB.prepare(
        `INSERT INTO users (id, google_id, email, name, avatar_url, last_login_at, updated_at)
         VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
         ON CONFLICT(google_id) DO UPDATE SET
           email = excluded.email, name = excluded.name, avatar_url = excluded.avatar_url,
           last_login_at = datetime('now'), updated_at = datetime('now')`
      ).bind('google_' + googleId, googleId, email, name, avatarUrl).run();

      const user = await env.DB.prepare(
        `SELECT id, name, email, avatar_url FROM users WHERE google_id = ?`
      ).bind(googleId).first<{ id: string; name: string; email: string; avatar_url: string | null }>();
      if (!user) return err('User creation failed', 500);

      const sessionToken = crypto.randomUUID();
      const tokenHash = await hashToken(sessionToken, env.SESSION_SECRET || '');
      const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
      await env.DB.prepare(
        `INSERT INTO sessions (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)`
      ).bind(crypto.randomUUID(), user.id, tokenHash, expiresAt).run();

      const subscribed = await hasActiveAccess(user.id, env.DB);
      let subscriptionDetails = null;
      if (subscribed) {
        subscriptionDetails = await env.DB.prepare(
          `SELECT started_at, expires_at, plan_id FROM subscriptions
           WHERE user_id = ? AND status = 'active' ORDER BY expires_at DESC LIMIT 1`
        ).bind(user.id).first<{ started_at: string; expires_at: string; plan_id: string }>();
      }

      return new Response(
        JSON.stringify({
          user: { id: user.id, name: user.name, email: user.email, avatar_url: user.avatar_url },
          subscription: { active: subscribed, ...(subscriptionDetails || {}) },
        }),
        {
          status: 200,
          headers: {
            'content-type': 'application/json; charset=utf-8',
            'access-control-allow-origin': '*',
            'set-cookie': `sb_session=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${90 * 24 * 60 * 60}`,
          },
        }
      );
    } catch {
      return err('Invalid Google token', 401);
    }
  }

  if (body.code && env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    try {
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code: body.code, client_id: env.GOOGLE_CLIENT_ID,
          client_secret: env.GOOGLE_CLIENT_SECRET, grant_type: 'authorization_code',
        }).toString(),
      });
      const tokenData = await tokenRes.json<{ id_token?: string }>();
      if (!tokenData.id_token) return err('Google token exchange failed');
      const payload = JSON.parse(atob(tokenData.id_token.split('.')[1]));
      const googleId = payload.sub; const email = payload.email;
      const name = payload.name || 'User'; const avatarUrl = payload.picture || null;

      await env.DB.prepare(
        `INSERT INTO users (id, google_id, email, name, avatar_url, last_login_at, updated_at)
         VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
         ON CONFLICT(google_id) DO UPDATE SET
           email = excluded.email, name = excluded.name, avatar_url = excluded.avatar_url,
           last_login_at = datetime('now'), updated_at = datetime('now')`
      ).bind('google_' + googleId, googleId, email, name, avatarUrl).run();

      const user = await env.DB.prepare(
        `SELECT id, name, email, avatar_url FROM users WHERE google_id = ?`
      ).bind(googleId).first<{ id: string; name: string; email: string; avatar_url: string | null }>();
      if (!user) return err('User creation failed', 500);

      const sessionToken = crypto.randomUUID();
      const tokenHash = await hashToken(sessionToken, env.SESSION_SECRET || '');
      const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
      await env.DB.prepare(
        `INSERT INTO sessions (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)`
      ).bind(crypto.randomUUID(), user.id, tokenHash, expiresAt).run();

      const subscribed = await hasActiveAccess(user.id, env.DB);
      return new Response(
        JSON.stringify({ user: { id: user.id, name: user.name, email: user.email, avatar_url: user.avatar_url }, subscription: { active: subscribed } }),
        { status: 200, headers: { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': '*', 'set-cookie': `sb_session=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${90 * 24 * 60 * 60}` } }
      );
    } catch { return err('Google auth failed', 500); }
  }
  return err('Missing credential or code');
}

async function handleAuthMe(request: Request, env: Env): Promise<Response> {
  const user = await authenticateUser(request, env);
  if (!user) return json({ user: null, subscription: { active: false } });
  const subscribed = await hasActiveAccess(user.id, env.DB);
  let details = null;
  if (subscribed) {
    details = await env.DB.prepare(
      `SELECT started_at, expires_at, plan_id FROM subscriptions
       WHERE user_id = ? AND status = 'active' ORDER BY expires_at DESC LIMIT 1`
    ).bind(user.id).first<{ started_at: string; expires_at: string; plan_id: string }>();
  }
  return json({ user, subscription: { active: subscribed, ...(details || {}) } });
}

async function handleAuthLogout(request: Request, env: Env): Promise<Response> {
  const token = extractSessionToken(request.headers.get('cookie'));
  if (token && env.SESSION_SECRET) {
    const tokenHash = await hashToken(token, env.SESSION_SECRET);
    await env.DB.prepare(`DELETE FROM sessions WHERE token_hash = ?`).bind(tokenHash).run();
  }
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': '*', 'set-cookie': 'sb_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0' },
  });
}

async function handleSubscription(request: Request, env: Env): Promise<Response> {
  const user = await authenticateUser(request, env);
  if (!user) return json({ active: false });
  const subscribed = await hasActiveAccess(user.id, env.DB);
  let details = null;
  if (subscribed) {
    details = await env.DB.prepare(
      `SELECT started_at, expires_at, plan_id FROM subscriptions
       WHERE user_id = ? AND status = 'active' ORDER BY expires_at DESC LIMIT 1`
    ).bind(user.id).first<{ started_at: string; expires_at: string; plan_id: string }>();
  }
  return json({ active: subscribed, ...(details || {}) });
}

async function handleAccess(request: Request, env: Env): Promise<Response> {
  const user = await authenticateUser(request, env);
  if (!user) return json({ hasAccess: false, reason: 'not_logged_in' });
  const subscribed = await hasActiveAccess(user.id, env.DB);
  return json({ hasAccess: subscribed, reason: subscribed ? 'active' : 'expired' });
}

// ── Payment handlers (3-plan system) ──

async function handlePaymentCreateOrder(request: Request, env: Env): Promise<Response> {
  const user = await authenticateUser(request, env);
  if (!user) return err('Login required', 401);

  const body = await request.json<{ planId?: string }>();
  if (!body.planId) return err('planId required');

  // Server-side plan validation — NEVER trust frontend amount
  const plan = getServerPlan(body.planId);
  if (!plan) return err('Invalid plan. Allowed: three_month, six_month, one_year');

  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    // Demo mode
    const orderId = 'order_demo_' + crypto.randomUUID().slice(0, 12);
    await env.DB.prepare(
      `INSERT INTO payments (id, user_id, razorpay_order_id, amount, currency, status)
       VALUES (?, ?, ?, ?, 'INR', 'created')`
    ).bind(crypto.randomUUID(), user.id, orderId, plan.amount).run();
    return json({ orderId, amount: plan.amount, currency: 'INR', keyId: 'rzp_test_demo', planId: plan.id, demo: true });
  }

  try {
    const auth = btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`);
    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Basic ${auth}` },
      body: JSON.stringify({ amount: plan.amount, currency: 'INR', receipt: `sb_${user.id.slice(0, 16)}_${Date.now()}` }),
    });
    const order = await res.json<{ id: string; amount: number; currency: string }>();
    await env.DB.prepare(
      `INSERT INTO payments (id, user_id, razorpay_order_id, amount, currency, status)
       VALUES (?, ?, ?, ?, ?, 'created')`
    ).bind(crypto.randomUUID(), user.id, order.id, order.amount, order.currency).run();
    return json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId: env.RAZORPAY_KEY_ID, planId: plan.id });
  } catch (e: any) {
    return err('Failed to create order: ' + e.message, 500);
  }
}

async function handlePaymentVerify(request: Request, env: Env): Promise<Response> {
  const user = await authenticateUser(request, env);
  if (!user) return err('Login required', 401);

  const body = await request.json<{ razorpay_order_id?: string; razorpay_payment_id?: string; razorpay_signature?: string; planId?: string }>();
  if (!body.razorpay_order_id || !body.razorpay_payment_id || !body.razorpay_signature) return err('Missing payment details');

  // Get plan from payment record (server-side, never trust frontend)
  const payment = await env.DB.prepare(
    `SELECT amount FROM payments WHERE razorpay_order_id = ?`
  ).bind(body.razorpay_order_id).first<{ amount: number }>();
  if (!payment) return err('Payment not found');

  // Determine plan from amount
  let planId: string | null = null;
  for (const [id, p] of Object.entries(PLANS)) {
    if (p.amount === payment.amount) { planId = id; break; }
  }
  if (!planId) return err('Unknown payment amount');

  if (!env.RAZORPAY_KEY_SECRET) {
    // Demo mode
    await activateSubscription(user.id, body.razorpay_order_id, body.razorpay_payment_id, planId, env.DB);
    return json({ verified: true, demo: true });
  }

  try {
    const crypto_ = await import('crypto');
    const expectedSig = crypto_.createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(`${body.razorpay_order_id}|${body.razorpay_payment_id}`).digest('hex');
    if (expectedSig !== body.razorpay_signature) {
      await env.DB.prepare(`UPDATE payments SET status = 'failed' WHERE razorpay_order_id = ?`).bind(body.razorpay_order_id).run();
      return err('Payment verification failed', 400);
    }
    await activateSubscription(user.id, body.razorpay_order_id, body.razorpay_payment_id, planId, env.DB);
    return json({ verified: true });
  } catch (e: any) {
    return err('Verification error: ' + e.message, 500);
  }
}

/** Activate or extend subscription after verified payment. */
async function activateSubscription(userId: string, orderId: string, paymentId: string, planId: string, db: D1Database): Promise<void> {
  // Idempotency check
  const existing = await db.prepare(`SELECT id FROM payments WHERE razorpay_payment_id = ? AND status = 'paid'`).bind(paymentId).first();
  if (existing) return;

  const plan = getServerPlan(planId);
  if (!plan) return;

  // Mark payment as paid
  await db.prepare(`UPDATE payments SET status = 'paid', verified_at = datetime('now') WHERE razorpay_order_id = ?`).bind(orderId).run();

  // Check existing active subscription
  const existingSub = await db.prepare(
    `SELECT expires_at FROM subscriptions WHERE user_id = ? AND status = 'active' ORDER BY expires_at DESC LIMIT 1`
  ).bind(userId).first<{ expires_at: string }>();

  const now = new Date();
  let startedAt: string;
  let expiresAt: string;

  if (existingSub && new Date(existingSub.expires_at) > now) {
    // Extend from current expiry (calendar months)
    startedAt = existingSub.expires_at;
    const newExpiry = new Date(existingSub.expires_at);
    newExpiry.setMonth(newExpiry.getMonth() + plan.durationMonths);
    expiresAt = newExpiry.toISOString();
  } else {
    // New subscription (calendar months)
    startedAt = now.toISOString();
    const newExpiry = new Date(now);
    newExpiry.setMonth(newExpiry.getMonth() + plan.durationMonths);
    expiresAt = newExpiry.toISOString();
  }

  // Deactivate old subscriptions
  await db.prepare(`UPDATE subscriptions SET status = 'expired' WHERE user_id = ? AND status = 'active'`).bind(userId).run();

  // Create new subscription
  await db.prepare(
    `INSERT INTO subscriptions (id, user_id, package_id, status, payment_ref, started_at, expires_at)
     VALUES (?, ?, ?, 'active', ?, ?, ?)`
  ).bind(crypto.randomUUID(), userId, planId, paymentId, startedAt, expiresAt).run();
}

async function handlePaymentWebhook(request: Request, env: Env): Promise<Response> {
  const body = await request.json<Record<string, unknown>>().catch(() => ({}));
  const event = body.event as string | undefined;
  if (event === 'payment.captured' || event === 'payment.authorized') {
    // Handle payment success — verify webhook signature first in production
  }
  return json({ ok: true });
}

// ── Main router ──

export const onRequest: PagesFunction<Env> = async ({ request, env, params }) => {
  const path = (params.path as string[]) || [];
  const route = '/' + path.join('/');
  const method = request.method.toUpperCase();

  if (method === 'OPTIONS') {
    return new Response(null, {
      headers: { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET, POST, OPTIONS', 'access-control-allow-headers': 'content-type, authorization' },
    });
  }

  try {
    if (route === '/health' || route === '/') return json({ ok: true, time: new Date().toISOString() });

    if (route === '/stats') {
      const [c, l, s, u] = await Promise.all([
        env.DB.prepare('SELECT COUNT(*) AS n FROM courses').first<{ n: number }>(),
        env.DB.prepare('SELECT COUNT(*) AS n FROM lessons').first<{ n: number }>(),
        env.DB.prepare('SELECT COUNT(*) AS n FROM sentences').first<{ n: number }>(),
        env.DB.prepare('SELECT COUNT(*) AS n FROM users').first<{ n: number }>(),
      ]);
      return json({ courses: c?.n || 0, lessons: l?.n || 0, sentences: s?.n || 0, users: u?.n || 0 });
    }

    if (route === '/courses' && method === 'GET') {
      const { results } = await env.DB.prepare('SELECT * FROM courses ORDER BY sort_order ASC').all();
      const user = await authenticateUser(request, env);
      const subscribed = user ? await hasActiveAccess(user.id, env.DB) : false;
      return json((results || []).map((c: any) => ({ ...c, locked: !c.is_free && !subscribed })));
    }

    const courseMatch = route.match(/^\/courses\/([\w-]+)$/);
    if (courseMatch && method === 'GET') {
      const slug = courseMatch[1];
      const course = await env.DB.prepare('SELECT * FROM courses WHERE slug = ? OR id = ?').bind(slug, slug).first();
      if (!course) return err('Course not found', 404);
      const { results: lessons } = await env.DB.prepare('SELECT * FROM lessons WHERE course_id = ? ORDER BY sort_order ASC').bind(course.id).all();
      return json({ ...course, lessons: lessons || [] });
    }

    const lessonMatch = route.match(/^\/lessons\/([\w-]+)$/);
    if (lessonMatch && method === 'GET') {
      const id = lessonMatch[1];
      const lesson = await env.DB.prepare('SELECT * FROM lessons WHERE id = ?').bind(id).first();
      if (!lesson) return err('Lesson not found', 404);
      const { results: sentences } = await env.DB.prepare('SELECT * FROM sentences WHERE lesson_id = ? ORDER BY sort_order ASC').bind(id).all();
      return json({ ...lesson, sentences: sentences || [] });
    }

    const sentMatch = route.match(/^\/sentences\/([\w-]+)$/);
    if (sentMatch && method === 'GET') {
      const id = sentMatch[1];
      const sentence = await env.DB.prepare('SELECT * FROM sentences WHERE id = ?').bind(id).first();
      if (!sentence) return err('Sentence not found', 404);
      return json(sentence);
    }

    if (route === '/progress' && method === 'POST') {
      const body = await request.json<{ userId: string; sentenceId: string }>();
      if (!body?.userId || !body?.sentenceId) return err('userId and sentenceId required');
      await env.DB.prepare('INSERT OR IGNORE INTO user_progress (user_id, sentence_id) VALUES (?, ?)').bind(body.userId, body.sentenceId).run();
      return json({ ok: true });
    }

    if (route === '/auth/guest' && method === 'POST') {
      const id = 'guest_' + crypto.randomUUID().slice(0, 12);
      const colors = ['sky', 'purple', 'green', 'orange', 'pink'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      await env.DB.prepare('INSERT INTO users (id, name, avatar_color) VALUES (?, ?, ?)').bind(id, 'Guest', color).run();
      return json({ id, name: 'Guest', avatar_color: color });
    }

    if (route === '/auth/google' && method === 'POST') return handleAuthGoogle(request, env);
    if (route === '/auth/me' && method === 'GET') return handleAuthMe(request, env);
    if (route === '/auth/logout' && method === 'POST') return handleAuthLogout(request, env);
    if (route === '/subscription' && method === 'GET') return handleSubscription(request, env);
    if (route === '/access' && method === 'GET') return handleAccess(request, env);
    if (route === '/payment/create-order' && method === 'POST') return handlePaymentCreateOrder(request, env);
    if (route === '/payment/verify' && method === 'POST') return handlePaymentVerify(request, env);
    if (route === '/payment/webhook' && method === 'POST') return handlePaymentWebhook(request, env);

    // Non-API routes — let Cloudflare Pages serve static files / SPA fallback
    return undefined as unknown as Response;
  } catch (e: any) {
    return json({ error: e.message || 'Server error' }, { status: 500 });
  }
};
