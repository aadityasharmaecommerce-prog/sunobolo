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
 *   GET  /api/progress/stats                    - dashboard progress stats (server-side)
 *
 *   POST /api/auth/signup                      - Phone + email + password signup
 *   POST /api/auth/login                       - Phone + password login
 *   GET  /api/auth/me                          - current user info
 *   POST /api/auth/logout                      - destroy session
 *   POST /api/auth/forgot-password              - send reset link to recovery email
 *   POST /api/auth/reset-password              - reset password with token
 *
 *   POST /api/payment/create-order             - create Razorpay order
 *   POST /api/payment/verify                   - verify Razorpay payment
 *   POST /api/payment/webhook                  - Razorpay webhook
 *
 *   GET  /api/subscription                     - current subscription status
 *   GET  /api/access                           - check if user has full access
 *
 * Secrets required (set via wrangler secret put):
 *   SESSION_SECRET,
 *   RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET
 *   RESEND_API_KEY, EMAIL_FROM, APP_BASE_URL
 *   GOOGLE_SERVICE_ACCOUNT_KEY (JSON string for Play Developer API)
 *   GOOGLE_PLAY_PACKAGE_NAME (e.g. com.sunobolo.english)
 *   GOOGLE_RTDN_SUBSCRIPTION (Pub/Sub subscription path for RTDN verification)
 *   GOOGLE_PUBSUB_VERIFICATION_KEY (optional: manual Pub/Sub verification key)
 *
 *   POST /api/payment/verify-google  — Google Play purchase verification
 *   POST /api/payment/google-rtdn   — Google Play RTDN webhook (Pub/Sub push)
 *   POST /api/auth/delete-account   — Delete user account + all data (GDPR/Play Store)
 *   GET  /delete-account            — Public account deletion page (Play Store URL)
 */

interface Env {
  DB: D1Database;
  ENVIRONMENT?: string;
  SESSION_SECRET?: string;
  PASSWORD_PEPPER?: string;
  RAZORPAY_KEY_ID?: string;
  RAZORPAY_KEY_SECRET?: string;
  RAZORPAY_WEBHOOK_SECRET?: string;
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
  APP_BASE_URL?: string;
  WEB_PUSH_PRIVATE_KEY?: string;
  WEB_PUSH_SUBJECT?: string;
  VAPID_PUBLIC_KEY?: string;
  GOOGLE_SERVICE_ACCOUNT_KEY?: string;
  GOOGLE_PLAY_PACKAGE_NAME?: string;
  GOOGLE_RTDN_SUBSCRIPTION?: string;
  GOOGLE_PUBSUB_VERIFICATION_KEY?: string;
}

// ── Plan Configuration (server-side source of truth) ──

const PLANS = {
  one_month:   { id: 'one_month',   amount: 19900,  durationMonths: 1 },
  three_month: { id: 'three_month', amount: 49900,  durationMonths: 3 },
  six_month:   { id: 'six_month',   amount: 69900,  durationMonths: 6 },
  one_year:    { id: 'one_year',    amount: 99900,  durationMonths: 12 },
} as const;

type PlanId = keyof typeof PLANS;

function getServerPlan(planId: string): { id: string; amount: number; durationMonths: number } | null {
  const plan = PLANS[planId as PlanId];
  return plan ? { ...plan } : null;
}

// ── Helpers ──

const ALLOWED_ORIGINS = ['https://sunobolo.in', 'https://www.sunobolo.in', 'https://admin.sunobolo.in', 'https://sunobolo-admin.aadityasharmaecommerce.workers.dev'];
function getCorsHeaders(origin: string | null): Record<string, string> {
  // SECURITY: Only return specific allowed origins — never wildcard with credentials
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'access-control-allow-origin': allowed,
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'content-type, authorization',
    'access-control-allow-credentials': 'true',
  };
}

/** Security headers applied to all API responses */
function getSecurityHeaders(): Record<string, string> {
  return {
    'strict-transport-security': 'max-age=63072000; includeSubDomains; preload',
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'DENY',
    'referrer-policy': 'strict-origin-when-cross-origin',
    'permissions-policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
    // CSP for API responses (JSON only — no scripts/styles needed)
    'content-security-policy': "default-src 'none'; frame-ancestors 'none';",
  };
}

const json = (data: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...(init.headers || {}),
    },
  });

const err = (msg: string, status = 400) => json({ error: msg }, { status });

/** Normalize phone number to consistent format: +91XXXXXXXXXX */
function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  // Indian 10-digit number
  if (digits.length === 10) return '+91' + digits;
  // Already has country code 91
  if (digits.length === 12 && digits.startsWith('91')) return '+' + digits;
  // Already starts with +
  if (phone.startsWith('+')) return phone;
  // Fallback
  return '+' + digits;
}

/**
 * Require SESSION_SECRET from env. Fail safely if not configured.
 * SECURITY: Never use hardcoded fallback secrets.
 */
function getSessionSecret(env: Env): string {
  if (!env.SESSION_SECRET) {
    console.error('[SECURITY] SESSION_SECRET not configured — authentication will fail. Set via wrangler secret put.');
    throw new Error('Server configuration error. Please contact support.');
  }
  return env.SESSION_SECRET;
}

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
): Promise<{ id: string; name: string; email: string; phone: string | null; avatar_url: string | null } | null> {
  const token = extractSessionToken(request.headers.get('cookie'));
  if (!token || !env.SESSION_SECRET) return null;

  const tokenHash = await hashToken(token, env.SESSION_SECRET);
  const session = await env.DB.prepare(
    `SELECT s.user_id, s.expires_at FROM sessions s WHERE s.token_hash = ?`
  ).bind(tokenHash).first<{ user_id: string; expires_at: string }>();

  if (!session) return null;
  if (new Date(session.expires_at) < new Date()) return null;

  const user = await env.DB.prepare(
    `SELECT id, name, email, phone, avatar_url FROM users WHERE id = ?`
  ).bind(session.user_id).first<{ id: string; name: string; email: string; phone: string | null; avatar_url: string | null }>();

  return user ?? null;
}

/** Invalidate all existing sessions for a user (one-device enforcement) */
async function invalidateUserSessions(userId: string, db: D1Database): Promise<void> {
  await db.prepare('DELETE FROM sessions WHERE user_id = ?').bind(userId).run();
}

/** Check login rate limit: max 5 failed attempts per phone per 15 minutes */
async function checkLoginRateLimit(phone: string, db: D1Database): Promise<boolean> {
  const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const result = await db.prepare(
    `SELECT COUNT(*) as cnt FROM login_attempts WHERE phone = ? AND attempted_at > ? AND success = 0`
  ).bind(phone, fifteenMinAgo).first<{ cnt: number }>();
  return (result?.cnt || 0) >= 5;
}

/** Record a login attempt */
async function recordLoginAttempt(phone: string, success: boolean, db: D1Database): Promise<void> {
  await db.prepare(
    `INSERT INTO login_attempts (phone, success) VALUES (?, ?)`
  ).bind(phone, success ? 1 : 0).run();
}

/** Check signup rate limit: max 3 signups per IP per hour (uses login_attempts table) */
async function checkSignupRateLimit(phone: string, db: D1Database): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const result = await db.prepare(
    `SELECT COUNT(*) as cnt FROM login_attempts WHERE phone = ? AND attempted_at > ?`
  ).bind(phone, oneHourAgo).first<{ cnt: number }>();
  return (result?.cnt || 0) >= 3;
}

/** Check per-user rate limit: max N actions per time window per user */
async function checkUserRateLimit(userId: string, actionType: string, maxCount: number, windowMinutes: number, db: D1Database): Promise<boolean> {
  const windowAgo = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();
  const result = await db.prepare(
    `SELECT COUNT(*) as cnt FROM audit_events WHERE user_id = ? AND event_type = ? AND created_at > ?`
  ).bind(userId, actionType, windowAgo).first<{ cnt: number }>();
  return (result?.cnt || 0) >= maxCount;
}

/**
 * Auto-expire subscriptions whose expires_at has passed, then check if active.
 * This ensures expired subscriptions are always correctly marked.
 */
async function autoExpireAndCheckAccess(userId: string, db: D1Database): Promise<boolean> {
  // Step 1: Mark any expired subscriptions as 'expired'
  await db.prepare(
    `UPDATE subscriptions SET status = 'expired'
     WHERE user_id = ? AND status = 'active' AND expires_at <= datetime('now')`
  ).bind(userId).run();

  // Step 2: Check if there's an active subscription
  const sub = await db.prepare(
    `SELECT expires_at FROM subscriptions
     WHERE user_id = ? AND status = 'active'
     ORDER BY expires_at DESC LIMIT 1`
  ).bind(userId).first<{ expires_at: string }>();
  if (!sub) return false;
  return new Date(sub.expires_at) > new Date();
}

/**
 * Get full subscription details (for /auth/me response).
 * Returns latest subscription info regardless of status, so client can display
 * expiry info even after subscription expires.
 */
async function getSubscriptionDetails(userId: string, db: D1Database): Promise<{
  active: boolean;
  plan_id?: string;
  started_at?: string;
  expires_at?: string;
} | null> {
  // Auto-expire first
  const isActive = await autoExpireAndCheckAccess(userId, db);

  // Get the most recent subscription (whether active or expired)
  const sub = await db.prepare(
    `SELECT package_id, started_at, expires_at, status FROM subscriptions
     WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`
  ).bind(userId).first<{ package_id: string; started_at: string; expires_at: string; status: string }>();

  if (!sub) return null;

  return {
    active: isActive && sub.status === 'active',
    plan_id: sub.package_id,
    started_at: sub.started_at,
    expires_at: sub.expires_at,
  };
}

// ── Email helper ──

/**
 * Send a password-reset email via Resend API.
 * Replace this helper to switch email providers.
 */
async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
  env: Env,
): Promise<boolean> {
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) {
    // Development fallback — log instead of sending
    console.log(`[PASSWORD RESET] To: ${to}, URL: ${resetUrl}`);
    return true;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.EMAIL_FROM,
        to: [to],
        subject: 'Reset your SunoBolo password',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1a1a2e; margin-bottom: 16px;">Password Reset Request</h2>
            <p style="color: #4a4a6a; font-size: 15px; line-height: 1.6;">
              We received a request to reset your SunoBolo account password.
            </p>
            <p style="color: #4a4a6a; font-size: 15px; line-height: 1.6;">
              Click the button below to set a new password. This link expires in 15 minutes.
            </p>
            <div style="text-align: center; margin: 28px 0;">
              <a href="${resetUrl}" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 15px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color: #9a9ab0; font-size: 13px; line-height: 1.5;">
              If you didn't request this, you can safely ignore this email. Your password will not change.
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
            <p style="color: #b0b0c0; font-size: 12px;">
              SunoBolo — Learn English the smart way<br>
              This is a transactional email for your account security.
            </p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      console.error(`[EMAIL] Resend API error ${res.status}: ${errBody}`);
      return false;
    }

    return true;
  } catch (e: any) {
    console.error(`[EMAIL] Failed to send reset email: ${e.message}`);
    return false;
  }
}

// ── Audit logging ──

async function logAuditEvent(
  userId: string | null,
  eventType: string,
  metadata: Record<string, unknown>,
  db: D1Database,
): Promise<void> {
  try {
    await db.prepare(
      `INSERT INTO audit_events (user_id, event_type, metadata, created_at) VALUES (?, ?, ?, datetime('now'))`
    ).bind(userId, eventType, JSON.stringify(metadata)).run();
  } catch (e) {
    // Audit logging should never crash the main flow
    console.error('[AUDIT] Failed to log event:', e);
  }
}

// ── Auth handlers ──

/** Check if mobile number exists — returns exists: true/false */
async function handleCheckMobile(request: Request, env: Env): Promise<Response> {
  const body = await request.json<{ phone?: string }>();
  if (!body?.phone) return err('Mobile number required');

  const normalizedPhone = normalizePhone(body.phone);
  if (!/^\+91\d{10}$/.test(normalizedPhone)) {
    return err('Please enter a valid 10-digit mobile number');
  }

  const user = await env.DB.prepare(
    'SELECT id, name FROM users WHERE phone = ?'
  ).bind(normalizedPhone).first<{ id: string; name: string }>();

  return json({ exists: !!user, name: user?.name || null });
}

/** Update user name (after account creation) */
async function handleUpdateName(request: Request, env: Env): Promise<Response> {
  const user = await authenticateUser(request, env);
  if (!user) return err('Login required', 401);

  const body = await request.json<{ name?: string }>();
  if (!body?.name || !body.name.trim()) return err('Name required');

  const trimmedName = body.name.trim();
  if (trimmedName.length > 100) return err('Name too long');

  await env.DB.prepare(
    `UPDATE users SET name = ?, updated_at = datetime('now') WHERE id = ?`
  ).bind(trimmedName, user.id).run();

  return json({ success: true, name: trimmedName });
}

async function handleAuthMe(request: Request, env: Env): Promise<Response> {
  const user = await authenticateUser(request, env);
  if (!user) return json({ user: null, subscription: { active: false } });

  const sub = await getSubscriptionDetails(user.id, env.DB);

  return json({ user, subscription: sub || { active: false } });
}

async function hashPasswordPw(password: string, pepper: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + pepper);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Require PASSWORD_PEPPER from env. Fail safely if not configured.
 * SECURITY: Never use hardcoded fallback secrets.
 * Migration: Set PASSWORD_PEPPER to the same value as the old hardcoded pepper
 * via `wrangler secret put` BEFORE deploying this code.
 */
function getPasswordPepper(env: Env): string {
  if (!env.PASSWORD_PEPPER) {
    console.error('[SECURITY] PASSWORD_PEPPER not configured — authentication will fail. Set via wrangler secret put.');
    throw new Error('Server configuration error. Please contact support.');
  }
  return env.PASSWORD_PEPPER;
}

async function handleAuthSignup(request: Request, env: Env): Promise<Response> {
  const body = await request.json<{ name?: string; phone?: string; email?: string; password?: string }>();
  if (!body?.phone || !body?.password) {
    return err('Mobile number and password are required');
  }
  if (body.password.length < 6) return err('Password must be at least 6 characters');

  const normalizedPhone = normalizePhone(body.phone);
  const lowerEmail = body.email ? body.email.toLowerCase().trim() : '';

  // Validate phone format (must be +91 followed by 10 digits)
  if (!/^\+91\d{10}$/.test(normalizedPhone)) {
    return err('Please enter a valid 10-digit mobile number');
  }

  // Validate email format only if provided
  if (lowerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lowerEmail)) {
    return err('Please enter a valid email address');
  }

  // Rate limit: max 3 signup attempts per phone per hour
  if (await checkSignupRateLimit(normalizedPhone, env.DB)) {
    return err('Too many attempts. Please try again later.', 429);
  }

  // Check if phone already exists
  const existingPhone = await env.DB.prepare('SELECT id, name FROM users WHERE phone = ?').bind(normalizedPhone).first<{ id: string; name: string }>();
  if (existingPhone) {
    return err('An account with this mobile number already exists. Please login.');
  }

  // Check if email already exists (only if email was provided)
  if (lowerEmail) {
    const existingEmail = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(lowerEmail).first();
    if (existingEmail) {
      return err('An account with this email already exists. Please login.');
    }
  }

  const userName = body.name ? body.name.trim() : 'SunoBolo User';
  const id = 'u_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const passwordHash = await hashPasswordPw(body.password, getPasswordPepper(env));
  const colors = ['sky', 'purple', 'green', 'orange', 'pink'];
  const color = colors[Math.floor(Math.random() * colors.length)];

  await env.DB.prepare(
    `INSERT INTO users (id, name, email, phone, recovery_email, avatar_color, password_hash, last_login_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
  ).bind(id, userName, lowerEmail || null, normalizedPhone, lowerEmail || null, color, passwordHash).run();

  // Audit: account created
  await logAuditEvent(id, 'ACCOUNT_CREATED', { name: userName, phone: normalizedPhone, email: lowerEmail || null }, env.DB);

  // One-device: invalidate any existing sessions for this user (shouldn't be any for new signup, but safe)
  await invalidateUserSessions(id, env.DB);

  const sessionToken = crypto.randomUUID();
  const sessionSecret = getSessionSecret(env);
  const tokenHash = await hashToken(sessionToken, sessionSecret);
  const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
  await env.DB.prepare(
    `INSERT INTO sessions (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)`
  ).bind(crypto.randomUUID(), id, tokenHash, expiresAt).run();

  return new Response(
    JSON.stringify({ user: { id, name: userName, email: lowerEmail || '', phone: normalizedPhone } }),
    {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        ...getCorsHeaders(request.headers.get('origin')),
        'set-cookie': `sb_session=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${90 * 24 * 60 * 60}`,
      },
    }
  );
}

async function handleAuthLogin(request: Request, env: Env): Promise<Response> {
  const body = await request.json<{ phone?: string; password?: string }>();
  if (!body?.phone || !body?.password) return err('Mobile number and password are required');

  const normalizedPhone = normalizePhone(body.phone);

  // Validate phone format
  if (!/^\+91\d{10}$/.test(normalizedPhone)) {
    return err('Please enter a valid 10-digit mobile number');
  }

  // Rate limit check
  if (await checkLoginRateLimit(normalizedPhone, env.DB)) {
    return err('Too many failed attempts. Please try again after 15 minutes.', 429);
  }

  const user = await env.DB.prepare(
    'SELECT id, name, email, phone, avatar_color, password_hash FROM users WHERE phone = ?'
  ).bind(normalizedPhone).first<{ id: string; name: string; email: string; phone: string; avatar_color: string; password_hash: string | null }>();

  if (!user) {
    await recordLoginAttempt(normalizedPhone, false, env.DB);
    await logAuditEvent(null, 'LOGIN_FAILED', { phone: normalizedPhone, reason: 'user_not_found' }, env.DB);
    return err('Incorrect mobile number or PIN.', 401);
  }

  if (!user.password_hash) {
    await recordLoginAttempt(normalizedPhone, false, env.DB);
    await logAuditEvent(user.id, 'LOGIN_FAILED', { phone: normalizedPhone, reason: 'no_password_hash' }, env.DB);
    return err('Incorrect mobile number or PIN.', 401);
  }

  const inputHash = await hashPasswordPw(body.password, getPasswordPepper(env));
  if (inputHash !== user.password_hash) {
    await recordLoginAttempt(normalizedPhone, false, env.DB);
    await logAuditEvent(user.id, 'LOGIN_FAILED', { phone: normalizedPhone, reason: 'wrong_password' }, env.DB);
    return err('Incorrect mobile number or PIN.', 401);
  }

  // Record successful attempt
  await recordLoginAttempt(normalizedPhone, true, env.DB);
  await logAuditEvent(user.id, 'LOGIN_SUCCESS', { phone: normalizedPhone }, env.DB);

  // ONE-DEVICE: Invalidate all previous sessions before creating new one
  await invalidateUserSessions(user.id, env.DB);

  const sessionToken = crypto.randomUUID();
  const sessionSecret = getSessionSecret(env);
  const tokenHash = await hashToken(sessionToken, sessionSecret);
  const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
  await env.DB.prepare(
    `INSERT INTO sessions (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)`
  ).bind(crypto.randomUUID(), user.id, tokenHash, expiresAt).run();

  await env.DB.prepare(`UPDATE users SET last_login_at = datetime('now') WHERE id = ?`).bind(user.id).run();

  // Get subscription details
  const sub = await getSubscriptionDetails(user.id, env.DB);

  return new Response(
    JSON.stringify({ user: { id: user.id, name: user.name, email: user.email, phone: user.phone, avatar_color: user.avatar_color }, subscription: sub || { active: false } }),
    {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        ...getCorsHeaders(request.headers.get('origin')),
        'set-cookie': `sb_session=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${90 * 24 * 60 * 60}`,
      },
    }
  );
}

// ── Password Reset (server-side, secure) ──

/** Rate limit: max 3 forgot-password requests per user per hour */
async function checkForgotPasswordRateLimit(userId: string, db: D1Database): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const result = await db.prepare(
    `SELECT COUNT(*) as cnt FROM reset_tokens WHERE user_id = ? AND created_at > ?`
  ).bind(userId, oneHourAgo).first<{ cnt: number }>();
  return (result?.cnt || 0) >= 3;
}

async function handleForgotPassword(request: Request, env: Env): Promise<Response> {
  const body = await request.json<{ email?: string }>();
  if (!body?.email) return err('Email required');

  const lowerEmail = body.email.toLowerCase().trim();

  // Look up user by recovery_email or email
  const user = await env.DB.prepare(
    `SELECT id, email, recovery_email FROM users WHERE email = ? OR recovery_email = ?`
  ).bind(lowerEmail, lowerEmail).first<{ id: string; email: string; recovery_email: string | null }>();

  // ALWAYS return success — never reveal whether email exists (prevent enumeration)
  const genericResponse = json({ success: true, message: 'If an account exists for this email, a password reset link has been sent.' });

  if (!user) return genericResponse;

  // Rate limit check
  if (await checkForgotPasswordRateLimit(user.id, env.DB)) {
    return genericResponse; // Still return success to prevent enumeration
  }

  // Generate cryptographically secure reset token (32 bytes = 256 bits)
  const rawToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0')).join('');

  // Hash the token before storing (never store raw token)
  const sessionSecret = getSessionSecret(env);
  const tokenHash = await hashToken(rawToken, sessionSecret);

  // Invalidate any existing unused tokens for this user
  await env.DB.prepare(
    `UPDATE reset_tokens SET used_at = datetime('now') WHERE user_id = ? AND used_at IS NULL`
  ).bind(user.id).run();

  // Store hashed token in D1 with 15-minute expiry
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  await env.DB.prepare(
    `INSERT INTO reset_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)`
  ).bind(crypto.randomUUID(), user.id, tokenHash, expiresAt).run();

  // Build reset link using APP_BASE_URL from env (never hardcoded)
  const baseUrl = env.APP_BASE_URL || 'https://sunobolo.in';
  const resetUrl = `${baseUrl}/reset-password?token=${rawToken}`;

  // Send reset email (generic response returned regardless of send result)
  await sendPasswordResetEmail(lowerEmail, resetUrl, env);

  await logAuditEvent(user.id, 'PASSWORD_RESET_REQUESTED', { email: lowerEmail }, env.DB);

  return genericResponse;
}

async function handleResetPassword(request: Request, env: Env): Promise<Response> {
  const body = await request.json<{ token?: string; newPassword?: string }>();
  if (!body?.token || !body?.newPassword) return err('Token and new password required');
  if (body.newPassword.length < 6) return err('Password must be at least 6 characters');

  // Hash the supplied token to match stored hash
  const sessionSecret = getSessionSecret(env);
  const tokenHash = await hashToken(body.token, sessionSecret);

  // Find the reset token record
  const resetRecord = await env.DB.prepare(
    `SELECT id, user_id, expires_at, used_at FROM reset_tokens WHERE token_hash = ?`
  ).bind(tokenHash).first<{ id: string; user_id: string; expires_at: string; used_at: string | null }>();

  if (!resetRecord) return err('Invalid or expired reset token', 400);

  // Check if already used
  if (resetRecord.used_at) return err('Reset token has already been used', 400);

  // Check if expired
  if (new Date(resetRecord.expires_at) < new Date()) return err('Reset token has expired', 400);

  // Get the user
  const user = await env.DB.prepare(
    `SELECT id FROM users WHERE id = ?`
  ).bind(resetRecord.user_id).first<{ id: string }>();

  if (!user) return err('User account not found', 400);

  // Hash new password with pepper
  const newPasswordHash = await hashPasswordPw(body.newPassword, getPasswordPepper(env));

  // Update password in D1
  await env.DB.prepare(
    `UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?`
  ).bind(newPasswordHash, user.id).run();

  // Invalidate the token (one-time use)
  await env.DB.prepare(
    `UPDATE reset_tokens SET used_at = datetime('now') WHERE id = ?`
  ).bind(resetRecord.id).run();

  // Invalidate all sessions for this user (force re-login)
  await invalidateUserSessions(user.id, env.DB);

  await logAuditEvent(user.id, 'PASSWORD_RESET_COMPLETED', {}, env.DB);

  return json({ success: true, message: 'Password reset successful. You can now login with your new password.' });
}

/**
 * POST /api/auth/delete-account
 * Google Play Store requires an account-deletion URL.
 * User submits phone + password; server verifies, then deletes ALL user data.
 */
async function handleDeleteAccount(request: Request, env: Env): Promise<Response> {
  const body = await request.json<{ phone?: string; password?: string }>();
  if (!body?.phone || !body?.password) return err('Mobile number and password are required');

  const normalizedPhone = normalizePhone(body.phone);
  const user = await env.DB.prepare('SELECT id, name, phone FROM users WHERE phone = ?').bind(normalizedPhone).first<{ id: string; name: string; phone: string }>();
  if (!user) return err('No account found with this mobile number');

  // Verify password
  const stored = await env.DB.prepare('SELECT password_hash FROM users WHERE id = ?').bind(user.id).first<{ password_hash: string }>();
  if (!stored?.password_hash) return err('Cannot verify account. Please contact support.');
  const inputHash = await hashPasswordPw(body.password, getPasswordPepper(env));
  if (inputHash !== stored.password_hash) return err('Incorrect password');

  const userId = user.id;

  // Delete ALL user data (order matters for foreign keys)
  await env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(userId).run();
  await env.DB.prepare('DELETE FROM user_progress WHERE user_id = ?').bind(userId).run();
  await env.DB.prepare('DELETE FROM lesson_progress WHERE user_id = ?').bind(userId).run();
  await env.DB.prepare('DELETE FROM daily_activity WHERE user_id = ?').bind(userId).run();
  await env.DB.prepare('DELETE FROM favorites WHERE user_id = ?').bind(userId).run();
  await env.DB.prepare('DELETE FROM journey_progress WHERE user_id = ?').bind(userId).run();
  await env.DB.prepare('DELETE FROM push_subscriptions WHERE user_id = ?').bind(userId).run();
  await env.DB.prepare('DELETE FROM payments WHERE user_id = ?').bind(userId).run();
  await env.DB.prepare('DELETE FROM subscriptions WHERE user_id = ?').bind(userId).run();
  await env.DB.prepare('DELETE FROM user_profiles WHERE user_id = ?').bind(userId).run();
  await env.DB.prepare('DELETE FROM admin_users WHERE user_id = ?').bind(userId).run();
  try { await env.DB.prepare('DELETE FROM coupon_usages WHERE user_id = ?').bind(userId).run(); } catch {}
  await env.DB.prepare('DELETE FROM analytics_events WHERE user_id = ?').bind(userId).run();
  // Keep audit_events for compliance, but anonymize
  await env.DB.prepare("UPDATE audit_events SET user_id = NULL, metadata = '{}' WHERE user_id = ?").bind(userId).run();
  // Finally delete the user record
  await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(userId).run();

  await logAuditEvent(userId, 'ACCOUNT_DELETED', { name: user.name, phone: normalizedPhone }, env.DB);

  return json({ ok: true, message: 'Account and all associated data have been permanently deleted.' }, { status: 200, headers: { ...getCorsHeaders(request.headers.get('origin')) } });
}

async function handleAuthLogout(request: Request, env: Env): Promise<Response> {
  const token = extractSessionToken(request.headers.get('cookie'));
  if (token && env.SESSION_SECRET) {
    const tokenHash = await hashToken(token, env.SESSION_SECRET);
    await env.DB.prepare(`DELETE FROM sessions WHERE token_hash = ?`).bind(tokenHash).run();
  }
  await logAuditEvent(null, 'LOGOUT', {}, env.DB);

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'content-type': 'application/json; charset=utf-8', ...getCorsHeaders(request.headers.get('origin')), 'set-cookie': 'sb_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0' },
  });
}

async function handleSubscription(request: Request, env: Env): Promise<Response> {
  const user = await authenticateUser(request, env);
  if (!user) return json({ active: false });

  const sub = await getSubscriptionDetails(user.id, env.DB);
  return json(sub || { active: false });
}

async function handleAccess(request: Request, env: Env): Promise<Response> {
  const user = await authenticateUser(request, env);
  if (!user) return json({ hasAccess: false, reason: 'not_logged_in' });
  const subscribed = await autoExpireAndCheckAccess(user.id, env.DB);
  return json({ hasAccess: subscribed, reason: subscribed ? 'active' : 'expired' });
}

/** GET /api/offers/active — Return currently active offers for the pricing page */
async function handleActiveOffers(_request: Request, env: Env): Promise<Response> {
  try {
    const now = new Date().toISOString();
    // Find active offers that are within their schedule window
    const { results } = await env.DB.prepare(
      `SELECT id, name, label, plan_id, mrp, discount_percent, sale_price, start_at, end_at, status
       FROM offers
       WHERE status = 'active' AND start_at <= ? AND end_at >= ?
       ORDER BY plan_id`
    ).bind(now, now).all();

    // Group by plan_id, only one active offer per plan
    const offersByPlan: Record<string, any> = {};
    for (const offer of (results || []) as any[]) {
      if (!offersByPlan[offer.plan_id]) {
        offersByPlan[offer.plan_id] = {
          id: offer.id,
          name: offer.name,
          label: offer.label,
          plan_id: offer.plan_id,
          mrp: offer.mrp,
          discountPercent: offer.discount_percent,
          salePrice: offer.sale_price,
          startAt: offer.start_at,
          endAt: offer.end_at,
        };
      }
    }

    return json({ offers: offersByPlan });
  } catch (e) {
    // offers table may not exist yet — return empty
    console.error('[OFFERS] Query failed (table may not exist):', e);
    return json({ offers: {} });
  }
}

async function handleProgressStats(request: Request, env: Env): Promise<Response> {
  const user = await authenticateUser(request, env);
  if (!user) return err('Login required', 401);

  const sentCount = await env.DB.prepare(
    'SELECT COUNT(*) as n FROM user_progress WHERE user_id = ?'
  ).bind(user.id).first<{ n: number }>();

  const lessonCount = await env.DB.prepare(
    'SELECT COUNT(*) as n FROM lesson_progress WHERE user_id = ?'
  ).bind(user.id).first<{ n: number }>();

  const journeyDays = await env.DB.prepare(
    "SELECT completed_at FROM journey_progress WHERE user_id = ? AND status = 'completed' AND completed_at IS NOT NULL"
  ).bind(user.id).all<{ completed_at: string }>();
  const activityDates = [...new Set(
    (journeyDays.results || []).map(r => r.completed_at.split('T')[0])
  )];
  const sentDates = await env.DB.prepare(
    "SELECT DATE(completed_at) as d FROM user_progress WHERE user_id = ? GROUP BY DATE(completed_at)"
  ).bind(user.id).all<{ d: string }>();
  const allDates = new Set(activityDates);
  (sentDates.results || []).forEach(r => allDates.add(r.d));

  const courseIds = ['beginner', 'intermediate', 'advanced'];
  const courseProgress: Record<string, number> = {};
  for (const cid of courseIds) {
    const cnt = await env.DB.prepare(
      "SELECT COUNT(*) as n FROM user_progress WHERE user_id = ? AND sentence_id LIKE ?"
    ).bind(user.id, cid + '-%').first<{ n: number }>();
    courseProgress[cid] = cnt?.n || 0;
  }

  const journeyProgress = await env.DB.prepare(
    "SELECT day_number, status, score FROM journey_progress WHERE user_id = ? ORDER BY day_number"
  ).bind(user.id).all<{ day_number: number; status: string; score: number | null }>();

  return json({
    sentencesDone: sentCount?.n || 0,
    lessonsDone: lessonCount?.n || 0,
    dailyActivity: [...allDates],
    courseProgress,
    journeyProgress: (journeyProgress.results || []).map(r => ({
      day: r.day_number, status: r.status, score: r.score,
    })),
  });
}

// ── Payment handlers (3-plan system) ──

/** Plan duration ranking for upgrade/downgrade detection (higher = longer) */
const PLAN_DURATION_RANK: Record<string, number> = {
  one_month: 1,
  three_month: 3,
  six_month: 6,
  one_year: 12,
};

async function handlePaymentCreateOrder(request: Request, env: Env): Promise<Response> {
  const user = await authenticateUser(request, env);
  if (!user) return err('Login required', 401);

  // Rate limit: max 10 order creation attempts per user per hour
  if (await checkUserRateLimit(user.id, 'PAYMENT_CREATED', 10, 60, env.DB)) {
    return err('Too many payment attempts. Please try again later.', 429);
  }

  const body = await request.json<{ planId?: string; couponCode?: string }>();
  if (!body.planId) return err('planId required');

  // Server-side plan validation — NEVER trust frontend amount
  const plan = getServerPlan(body.planId);
  if (!plan) return err('Invalid plan. Allowed: one_month, three_month, six_month, one_year');

  // ── Duplicate / same-plan purchase prevention ──
  // Auto-expire first, then check for active subscription
  await autoExpireAndCheckAccess(user.id, env.DB);
  const existingSub = await env.DB.prepare(
    `SELECT package_id, expires_at FROM subscriptions
     WHERE user_id = ? AND status = 'active'
     ORDER BY expires_at DESC LIMIT 1`
  ).bind(user.id).first<{ package_id: string; expires_at: string }>();

  if (existingSub) {
    const requestedRank = PLAN_DURATION_RANK[body.planId] || 0;
    const currentRank = PLAN_DURATION_RANK[existingSub.package_id] || 0;

    if (requestedRank <= currentRank) {
      // Same plan or shorter — reject purchase
      return err(
        requestedRank === currentRank
          ? 'Already subscribed to this plan. Your current plan is active until ' + new Date(existingSub.expires_at).toLocaleDateString('en-IN') + '.'
          : 'Your current plan already includes this access. Consider upgrading to a longer plan instead.',
        409
      );
    }
    // Longer plan requested — allow as upgrade (flow continues below)
  }

  // ── Offer validation (server-side) ──
  // Check for active offer on this plan — offer price replaces MRP as base
  let offerId: string | null = null;
  let offerName: string | null = null;
  let offerMrp: number | null = null;
  let offerDiscountPercent: number | null = null;
  let offerSalePrice: number | null = null;
  let baseAmount = plan.amount; // Start with plan MRP

  try {
    const now = new Date().toISOString();
    const activeOffer = await env.DB.prepare(
      `SELECT id, name, mrp, discount_percent, sale_price
       FROM offers
       WHERE plan_id = ? AND status = 'active' AND start_at <= ? AND end_at >= ?
       LIMIT 1`
    ).bind(body.planId!, now, now).first<{
      id: string; name: string; mrp: number; discount_percent: number; sale_price: number;
    }>();

    if (activeOffer) {
      offerId = activeOffer.id;
      offerName = activeOffer.name;
      offerMrp = activeOffer.mrp;
      offerDiscountPercent = activeOffer.discount_percent;
      offerSalePrice = activeOffer.sale_price;
      baseAmount = activeOffer.sale_price; // Offer price is the new base
    }
  } catch (offerErr) {
    // offers table may not exist yet — proceed with normal pricing
    console.error('[CREATE-ORDER] Offer check failed (non-critical):', offerErr);
  }

  // ── Coupon validation (server-side) ──
  // Coupon discount applies on top of the base amount (offer price or MRP)
  let discountAmount = 0;
  let couponId: string | null = null;
  let couponCode: string | null = null;
  let originalAmount = baseAmount;
  let finalAmount = baseAmount;

  if (body.couponCode && body.couponCode.trim()) {
    try {
      const code = body.couponCode.toUpperCase().replace(/[^A-Z0-9]/g, '');
      const coupon = await env.DB.prepare(
        'SELECT * FROM coupons WHERE code = ?'
      ).bind(code).first<{
        id: string; code: string; discount_type: string; discount_value: number;
        applicable_plans: string; start_date: string; expiry_date: string;
        max_total_uses: number; max_uses_per_user: number; min_order_amount: number;
        is_active: number;
      }>();

      if (coupon && coupon.is_active) {
        const now = new Date();
        const isValidDate = new Date(coupon.start_date) <= now && new Date(coupon.expiry_date) >= now;

        if (isValidDate) {
          // Check usage limits
          let usageOk = true;
          if (coupon.max_total_uses > 0) {
            const totalUsed = await env.DB.prepare(
              "SELECT COUNT(*) as n FROM coupon_usages WHERE coupon_id = ? AND status = 'completed'"
            ).bind(coupon.id).first<{ n: number }>();
            if ((totalUsed?.n || 0) >= coupon.max_total_uses) usageOk = false;
          }
          if (usageOk && coupon.max_uses_per_user > 0) {
            const userUsed = await env.DB.prepare(
              "SELECT COUNT(*) as n FROM coupon_usages WHERE coupon_id = ? AND user_id = ? AND status = 'completed'"
            ).bind(coupon.id, user.id).first<{ n: number }>();
            if ((userUsed?.n || 0) >= coupon.max_uses_per_user) usageOk = false;
          }
          // Check plan applicability
          if (usageOk && coupon.applicable_plans !== 'all') {
            const allowed = coupon.applicable_plans.split(',').map(s => s.trim());
            if (!allowed.includes(body.planId!)) usageOk = false;
          }
          // Check minimum order
          if (usageOk && coupon.min_order_amount > 0 && plan.amount < coupon.min_order_amount) {
            usageOk = false;
          }

          if (usageOk) {
            if (coupon.discount_type === 'percentage') {
              discountAmount = Math.floor(plan.amount * coupon.discount_value / 100);
            } else {
              discountAmount = Math.min(coupon.discount_value, plan.amount);
            }
            discountAmount = Math.min(discountAmount, plan.amount - 100);
            discountAmount = Math.max(discountAmount, 0);
            finalAmount = plan.amount - discountAmount;
            couponId = coupon.id;
            couponCode = coupon.code;
          }
        }
      }
    } catch (couponErr) {
      // If coupons table doesn't exist or has errors, proceed without coupon
      console.error('[CREATE-ORDER] Coupon validation failed (non-critical):', couponErr);
    }

  }

  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    // SECURITY: Fail safely — cannot create payment order without Razorpay credentials
    console.error('[CREATE-ORDER] RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET not configured — cannot create order');
    return err('Payment system not configured. Please contact support.', 500);
  }

  try {
    const auth = btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`);
    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Basic ${auth}` },
      body: JSON.stringify({ amount: finalAmount, currency: 'INR', receipt: `sb_${user.id.slice(0, 16)}_${Date.now()}` }),
    });
    const order = await res.json<{ id: string; amount: number; currency: string }>();
    // Try full INSERT with coupon columns; fall back to basic INSERT if columns are missing
    const paymentId = crypto.randomUUID();
    try {
      await env.DB.prepare(
        `INSERT INTO payments (id, user_id, razorpay_order_id, amount, original_amount, discount_amount, final_amount, currency, plan_id, coupon_id, coupon_code, offer_id, offer_name, offer_mrp, offer_discount_percent, offer_sale_price, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'created')`
      ).bind(
        paymentId, user.id, order.id, finalAmount,
        originalAmount, discountAmount, finalAmount,
        order.currency, plan.id, couponId, couponCode,
        offerId, offerName, offerMrp, offerDiscountPercent, offerSalePrice
      ).run();
    } catch (insertErr: any) {
      // If offer/coupon columns don't exist yet, fall back to basic columns
      console.error('[CREATE-ORDER] Full INSERT failed, trying basic INSERT:', insertErr.message);
      try {
        await env.DB.prepare(
          `INSERT INTO payments (id, user_id, razorpay_order_id, amount, original_amount, discount_amount, final_amount, currency, plan_id, coupon_id, coupon_code, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'created')`
        ).bind(
          paymentId, user.id, order.id, finalAmount,
          originalAmount, discountAmount, finalAmount,
          order.currency, plan.id, couponId, couponCode
        ).run();
      } catch (basicErr: any) {
        // If coupon columns also missing, try without them
        console.error('[CREATE-ORDER] Basic INSERT also failed:', basicErr.message);
        try {
          await env.DB.prepare(
            `INSERT INTO payments (id, user_id, razorpay_order_id, amount, currency, plan_id, status)
             VALUES (?, ?, ?, ?, ?, ?, 'created')`
          ).bind(
            paymentId, user.id, order.id, finalAmount,
            order.currency, plan.id
          ).run();
        } catch (finalErr: any) {
          console.error('[CREATE-ORDER] Final INSERT also failed:', finalErr.message);
          await env.DB.prepare(
            `INSERT INTO payments (id, user_id, razorpay_order_id, amount, currency, status)
             VALUES (?, ?, ?, ?, ?, 'created')`
          ).bind(
            paymentId, user.id, order.id, finalAmount,
            order.currency
          ).run();
        }
      }
    }
    // Reserve coupon usage (with race condition protection) — non-critical if table missing
    if (couponId) {
      try {
        const usageId = 'cu_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        await env.DB.prepare(
          'INSERT INTO coupon_usages (id, coupon_id, user_id, order_id, original_amount, discount_amount, final_amount, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        ).bind(
          usageId, couponId, user.id, order.id, originalAmount, discountAmount, finalAmount, 'reserved'
        ).run();
        // Post-reservation check: verify total uses (completed + reserved) hasn't exceeded limit
        const couponRecord = await env.DB.prepare('SELECT max_total_uses FROM coupons WHERE id = ?').bind(couponId).first<{ max_total_uses: number }>();
        if (couponRecord && couponRecord.max_total_uses > 0) {
          const totalActive = await env.DB.prepare(
            "SELECT COUNT(*) as n FROM coupon_usages WHERE coupon_id = ? AND status IN ('completed', 'reserved')"
          ).bind(couponId).first<{ n: number }>();
          if ((totalActive?.n || 0) > couponRecord.max_total_uses) {
            // Race condition: another request reserved the last slot — roll back
            await env.DB.prepare('DELETE FROM coupon_usages WHERE id = ?').bind(usageId).run();
            await env.DB.prepare('DELETE FROM payments WHERE razorpay_order_id = ?').bind(order.id).run();
            return err('This coupon has just been fully redeemed. Please try without a coupon.', 409);
          }
        }
      } catch (usageErr) {
        console.error('[CREATE-ORDER] Failed to reserve coupon usage (non-critical):', usageErr);
      }
    }
    await logAuditEvent(user.id, 'PAYMENT_CREATED', { orderId: order.id, amount: finalAmount, originalAmount, discountAmount, planId: plan.id, couponCode, offerId, offerName }, env.DB);
    return json({
      orderId: order.id, amount: finalAmount, originalAmount, discountAmount, couponCode,
      currency: order.currency, keyId: env.RAZORPAY_KEY_ID, planId: plan.id,
      offerId, offerName, offerMrp, offerDiscountPercent, offerSalePrice,
    });
  } catch (e: any) {
    console.error('[CREATE-ORDER] Error:', e.message, e.stack);
    return err('Payment could not be started. Please try again.', 500);
  }
}

async function handlePaymentVerify(request: Request, env: Env): Promise<Response> {
  const user = await authenticateUser(request, env);
  if (!user) {
    console.error('[VERIFY] Auth failed — session cookie missing or invalid');
    return err('Login required', 401);
  }

  const body = await request.json<{ razorpay_order_id?: string; razorpay_payment_id?: string; razorpay_signature?: string; planId?: string }>();
  if (!body.razorpay_order_id || !body.razorpay_payment_id || !body.razorpay_signature) {
    console.error('[VERIFY] Missing fields:', JSON.stringify({ orderId: !!body.razorpay_order_id, paymentId: !!body.razorpay_payment_id, sig: !!body.razorpay_signature }));
    return err('Missing payment details');
  }

  // Get payment record (server-side, never trust frontend)
  const payment = await env.DB.prepare(
    `SELECT amount, user_id, status, plan_id FROM payments WHERE razorpay_order_id = ?`
  ).bind(body.razorpay_order_id).first<{ amount: number; user_id: string; status: string; plan_id: string | null }>();
  if (!payment) {
    console.error(`[VERIFY] No payment record for order ${body.razorpay_order_id}`);
    return err('Payment not found');
  }    // Verify the payment belongs to the authenticated user
  if (payment.user_id !== user.id) {
    console.error(`[VERIFY] Payment user mismatch: order belongs to ${payment.user_id}, request from ${user.id}`);
    return err('Payment not found', 404);
  }

  // Already processed — return success (idempotent)
  if (payment.status === 'paid') {
    return json({ verified: true, already_verified: true });
  }

  // Determine plan from payment record (server-side, never trust frontend planId)
  let planId: string | null = null;
  // Priority: 1) plan_id from DB, 2) amount matching (for old payments without plan_id)
  if (payment.plan_id) {
    planId = payment.plan_id;
  } else {
    // Fallback: match amount to plan (only works for non-discounted payments)
    for (const [id, p] of Object.entries(PLANS)) {
      if (p.amount === payment.amount) { planId = id; break; }
    }
  }
  if (!planId) {
    console.error(`[VERIFY] Cannot determine plan for order ${body.razorpay_order_id} (amount: ${payment.amount})`);
    return err('Cannot determine plan for this payment');
  }

  if (!env.RAZORPAY_KEY_SECRET) {
    // SECURITY: Fail safely — never activate subscription without Razorpay verification
    console.error('[VERIFY] RAZORPAY_KEY_SECRET not configured — cannot verify payment safely');
    return err('Payment verification unavailable. Please contact support.', 500);
  }

  try {
    // Web Crypto API HMAC verification (Cloudflare Workers compatible)
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(env.RAZORPAY_KEY_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    );
    const sigBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(`${body.razorpay_order_id}|${body.razorpay_payment_id}`)
    );
    const expectedSig = Array.from(new Uint8Array(sigBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    if (expectedSig !== body.razorpay_signature) {
      console.error(`[VERIFY] Signature mismatch for order ${body.razorpay_order_id}`);
      await env.DB.prepare(`UPDATE payments SET status = 'failed' WHERE razorpay_order_id = ?`).bind(body.razorpay_order_id).run();
    await logAuditEvent(user.id, 'PAYMENT_FAILED', { orderId: body.razorpay_order_id, reason: 'signature_mismatch' }, env.DB);
      return err('Payment verification failed', 400);
    }
    await activateSubscription(user.id, body.razorpay_order_id, body.razorpay_payment_id, planId, env.DB);
    console.log(`[VERIFY] Payment ${body.razorpay_order_id} → PAID, subscription activated for user ${user.id}`);
    await logAuditEvent(user.id, 'PAYMENT_SUCCESS', { orderId: body.razorpay_order_id, paymentId: body.razorpay_payment_id, planId }, env.DB);
    return json({ verified: true });
  } catch (e: any) {
    console.error(`[VERIFY] Error for order ${body.razorpay_order_id}:`, e.message);
    return err('Verification error: ' + e.message, 500);
  }
}

// ── Google Play Billing Verification (Production-Secure) ──

/**
 * Server-side allowed product IDs — NEVER trust client.
 * Client may send any productId, but only these are valid.
 */
const GOOGLE_ALLOWED_PRODUCTS: Record<string, { planId: string; amount: number; durationMonths: number }> = {
  'sunobolo_one_month':   { planId: 'one_month',   amount: 19900,  durationMonths: 1 },
  'sunobolo_three_month': { planId: 'three_month', amount: 49900,  durationMonths: 3 },
  'sunobolo_six_month':   { planId: 'six_month',   amount: 69900,  durationMonths: 6 },
  'sunobolo_one_year':    { planId: 'one_year',    amount: 99900,  durationMonths: 12 },
};

/**
 * Google Play purchase states
 */
const GOOGLE_PURCHASE_STATE = {
  PENDING: 0,
  PURCHASED: 1,
  CANCELED: 2,
} as const;

/**
 * Get a Google OAuth2 access token using service account credentials.
 * Uses Ed25519/RS256 JWT signing with Cloudflare Web Crypto API.
 */
async function getGoogleAccessToken(env: Env): Promise<string> {
  const saKeyJson = env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!saKeyJson) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY not configured');
  }

  const saKey = JSON.parse(saKeyJson);
  const now = Math.floor(Date.now() / 1000);

  // JWT header
  const header = { alg: 'RS256', typ: 'JWT' };
  // JWT claim set
  const claimSet = {
    iss: saKey.client_email,
    scope: 'https://www.googleapis.com/auth/androidpublisher',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  const encoder = new TextEncoder();

  // Base64url encode
  const base64url = (data: string) =>
    btoa(data).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  const headerB64 = base64url(JSON.stringify(header));
  const claimB64 = base64url(JSON.stringify(claimSet));
  const signingInput = `${headerB64}.${claimB64}`;

  // Import private key for RS256 signing
  // Service account private key is in PEM format
  const pemBody = saKey.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '');

  const keyData = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0));

  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    keyData,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    encoder.encode(signingInput),
  );

  const signatureB64 = base64url(String.fromCharCode(...new Uint8Array(signature)));
  const jwt = `${signingInput}.${signatureB64}`;

  // Exchange JWT for access token
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });

  if (!tokenRes.ok) {
    const errBody = await tokenRes.text();
    throw new Error(`Google OAuth token failed: ${tokenRes.status} ${errBody}`);
  }

  const tokenData = await tokenRes.json<{ access_token: string }>();
  return tokenData.access_token;
}

/**
 * Verify purchase with Google Play Developer API.
 * Returns authoritative purchase state from Google servers.
 */
async function verifyPurchaseWithGoogle(
  productId: string,
  purchaseToken: string,
  env: Env,
): Promise<{
  purchaseState: number;
  orderId: string;
  acknowledgementState: number;
  consumptionState: number;
  purchaseTimeMillis: string;
} | null> {
  const packageName = env.GOOGLE_PLAY_PACKAGE_NAME || 'com.sunobolo.english';
  const accessToken = await getGoogleAccessToken(env);

  const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${packageName}/purchases/products/${productId}/tokens/${purchaseToken}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const errBody = await res.text();
    console.error(`[GOOGLE-API] Verification failed: ${res.status} ${errBody}`);
    return null;
  }

  return res.json();
}

/**
 * Acknowledge purchase with Google Play Developer API (server-side).
 */
async function acknowledgePurchaseWithGoogle(
  productId: string,
  purchaseToken: string,
  env: Env,
): Promise<boolean> {
  const packageName = env.GOOGLE_PLAY_PACKAGE_NAME || 'com.sunobolo.english';
  const accessToken = await getGoogleAccessToken(env);

  const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${packageName}/purchases/products/${productId}/tokens/${purchaseToken}:acknowledge`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ developmentPayload: 'SunoBolo server-acknowledged' }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    console.error(`[GOOGLE-ACK] Acknowledge failed: ${res.status} ${errBody}`);
    return false;
  }

  return true;
}

/**
 * Handle Google Play Billing purchase verification.
 * 
 * FLOW:
 * 1. Client sends purchaseToken + productId
 * 2. Backend validates productId against server-side allowed list
 * 3. Backend verifies purchaseToken with Google Play Developer API
 * 4. Backend checks purchaseState === PURCHASED
 * 5. Backend checks for duplicate purchaseToken (unique per user)
 * 6. Backend activates entitlement
 * 7. Backend acknowledges purchase server-side
 */
async function handlePaymentVerifyGoogle(request: Request, env: Env): Promise<Response> {
  const user = await authenticateUser(request, env);
  if (!user) {
    return err('Login required', 401);
  }

  const body = await request.json<{
    productId?: string;
    purchaseToken?: string;
  }>();

  if (!body.productId || !body.purchaseToken) {
    return err('Missing productId or purchaseToken');
  }

  // ── STEP 1: Validate productId server-side (NEVER trust client) ──
  const allowedProduct = GOOGLE_ALLOWED_PRODUCTS[body.productId];
  if (!allowedProduct) {
    console.error(`[GOOGLE-VERIFY] Invalid productId: ${body.productId}`);
    return err('Invalid product', 400);
  }

  const { planId, amount, durationMonths } = allowedProduct;
  const plan = getServerPlan(planId);
  if (!plan) {
    return err('Invalid plan configuration', 500);
  }

  // ── STEP 2: Check duplicate purchaseToken (idempotent + cross-user protection) ──
  try {
    const existingPayment = await env.DB.prepare(
      `SELECT id, user_id, status FROM payments WHERE google_purchase_token = ?`
    ).bind(body.purchaseToken).first<{ id: string; user_id: string; status: string }>();

    if (existingPayment) {
      if (existingPayment.user_id === user.id && existingPayment.status === 'paid') {
        // Same user, already processed — idempotent success
        return json({ verified: true, already_verified: true });
      }
      if (existingPayment.user_id !== user.id) {
        // Different user trying to reuse token — SECURITY EVENT
        await logAuditEvent(user.id, 'SECURITY_PURCHASE_TOKEN_REUSE', {
          purchaseToken: body.purchaseToken.substring(0, 20) + '...',
          originalUserId: existingPayment.user_id,
          attemptedUserId: user.id,
        }, env.DB);
        return err('This purchase has already been used by another account.', 403);
      }
    }
  } catch (e: any) {
    // Column may not exist yet — FAIL SAFELY rather than bypass duplicate protection
    console.error('[GOOGLE-VERIFY] google_purchase_token column may be missing. Run migration 0015. Error:', e.message);
    return err('Billing system not configured. Please contact support.', 500);
  }

  // ── STEP 3: Verify with Google Play Developer API ──
  let googlePurchase: Awaited<ReturnType<typeof verifyPurchaseWithGoogle>>;
  try {
    googlePurchase = await verifyPurchaseWithGoogle(body.productId, body.purchaseToken, env);
  } catch (e: any) {
    console.error('[GOOGLE-VERIFY] Google API call failed:', e.message);
    return err('Failed to verify with Google Play. Please try again.', 502);
  }

  if (!googlePurchase) {
    return err('Could not verify purchase with Google Play', 502);
  }

  // ── STEP 4: Check purchaseState — ONLY PURCHASED is accepted ──
  if (googlePurchase.purchaseState === GOOGLE_PURCHASE_STATE.PENDING) {
    return json({ verified: false, pending: true, message: 'Payment is pending. Access will be granted once payment completes.' });
  }

  if (googlePurchase.purchaseState === GOOGLE_PURCHASE_STATE.CANCELED) {
    return err('Purchase was cancelled', 402);
  }

  if (googlePurchase.purchaseState !== GOOGLE_PURCHASE_STATE.PURCHASED) {
    return err('Purchase is not in a valid state', 402);
  }

  // ── STEP 5: Store payment record ──
  const paymentId = crypto.randomUUID();
  const googleOrderId = googlePurchase.orderId || `google_${Date.now()}`;

  try {
    // Try with google_purchase_token column (new schema)
    await env.DB.prepare(
      `INSERT INTO payments (id, user_id, razorpay_order_id, amount, currency, plan_id, google_purchase_token, google_acknowledgement_state, status, verified_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'paid', datetime('now'))`
    ).bind(
      paymentId,
      user.id,
      googleOrderId,
      amount,
      'INR',
      planId,
      body.purchaseToken,
      googlePurchase.acknowledgementState === 1 ? 'acknowledged' : 'not_acknowledged',
    ).run();
  } catch (insertErr: any) {
    // Column may not exist — FAIL SAFELY rather than storing without purchase token
    console.error('[GOOGLE-VERIFY] Payment INSERT failed (migration 0015 may not be applied):', insertErr.message);
    return err('Billing system not configured. Please contact support.', 500);
  }

  // ── STEP 6: Activate entitlement (server-side calculated) ──
  await activateGoogleEntitlement(user.id, body.purchaseToken, planId, durationMonths, env.DB);

  // ── STEP 7: Server-side acknowledgement (fire-and-forget if fails) ──
  if (googlePurchase.acknowledgementState !== 1) {
    const acked = await acknowledgePurchaseWithGoogle(body.productId, body.purchaseToken, env);
    if (acked) {
      try {
        await env.DB.prepare(
          `UPDATE payments SET google_acknowledgement_state = 'acknowledged' WHERE google_purchase_token = ?`
        ).bind(body.purchaseToken).run();
      } catch (e) {
        // Column may not exist — non-critical (purchase is already recorded)
        console.error('[GOOGLE-ACK] Failed to update acknowledgement state (non-critical):', e);
      }
    }
  }

  await logAuditEvent(user.id, 'GOOGLE_PAYMENT_SUCCESS', {
    productId: body.productId,
    planId,
    amount,
    googleOrderId,
  }, env.DB);

  return json({ verified: true });
}

/**
 * Activate entitlement from verified Google Play purchase.
 * Idempotent — same purchaseToken never grants access twice.
 */
async function activateGoogleEntitlement(
  userId: string,
  purchaseToken: string,
  planId: string,
  durationMonths: number,
  db: D1Database,
): Promise<void> {
  // Idempotency check
  const existing = await db.prepare(
    `SELECT id FROM subscriptions WHERE payment_id = ? AND status = 'active'`
  ).bind(purchaseToken).first();
  if (existing) return; // Already activated

  // Check existing active subscription for extension
  const existingSub = await db.prepare(
    `SELECT expires_at FROM subscriptions WHERE user_id = ? AND status = 'active' ORDER BY expires_at DESC LIMIT 1`
  ).bind(userId).first<{ expires_at: string }>();

  const now = new Date();
  let startedAt: string;
  let expiresAt: string;

  if (existingSub && new Date(existingSub.expires_at) > now) {
    // Extend from current expiry
    startedAt = existingSub.expires_at;
    const newExpiry = new Date(existingSub.expires_at);
    newExpiry.setMonth(newExpiry.getMonth() + durationMonths);
    expiresAt = newExpiry.toISOString();
  } else {
    // New entitlement
    startedAt = now.toISOString();
    const newExpiry = new Date(now);
    newExpiry.setMonth(newExpiry.getMonth() + durationMonths);
    expiresAt = newExpiry.toISOString();
  }

  // Deactivate old subscriptions
  await db.prepare(
    `UPDATE subscriptions SET status = 'expired' WHERE user_id = ? AND status = 'active'`
  ).bind(userId).run();

  // Create new subscription
  const subId = 'sub_gplay_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  await db.prepare(
    `INSERT INTO subscriptions (id, user_id, package_id, status, started_at, expires_at, payment_id)
     VALUES (?, ?, ?, 'active', ?, ?, ?)`
  ).bind(subId, userId, planId, startedAt, expiresAt, purchaseToken).run();

  console.log(`[GOOGLE-ENTITLEMENT] user=${userId}, plan=${planId}, expires=${expiresAt}`);
}

/**
 * Verify Google Cloud Pub/Sub push message authenticity.
 * Google signs push messages with a JWT in the Authorization header.
 * We verify against Google's public keys (fetched from Google's signing key endpoint).
 */
async function verifyPubSubAuth(request: Request, env: Env): Promise<boolean> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('[RTDN-AUTH] Missing Authorization header');
    return false;
  }

  const token = authHeader.slice(7);

  try {
    // Parse JWT header to get key ID
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('[RTDN-AUTH] Invalid JWT format');
      return false;
    }

    const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

    // Verify audience matches our endpoint URL
    const expectedUrl = env.APP_BASE_URL || 'https://sunobolo.in';
    if (payload.aud !== `${expectedUrl}/api/payment/google-rtdn`) {
      console.error('[RTDN-AUTH] Invalid audience:', payload.aud);
      return false;
    }

    // Verify issuer is Google
    if (!payload.iss || !payload.iss.startsWith('https://accounts.google.com')) {
      console.error('[RTDN-AUTH] Invalid issuer:', payload.iss);
      return false;
    }

    // Verify token hasn't expired
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      console.error('[RTDN-AUTH] Token expired');
      return false;
    }

    // Verify against Google's public signing keys
    const keyId = header.kid;
    if (!keyId) {
      console.error('[RTDN-AUTH] Missing kid in JWT header');
      return false;
    }

    // Fetch Google's public keys (cached by browser/CF)
    const googleKeysRes = await fetch('https://www.googleapis.com/oauth2/v3/certs');
    if (!googleKeysRes.ok) {
      console.error('[RTDN-AUTH] Failed to fetch Google signing keys');
      return false;
    }

    const googleKeys = await googleKeysRes.json<{ keys: Array<{ kid: string; n: string; e: string; kty: string; alg: string }> }>();
    const signingKey = googleKeys.keys.find(k => k.kid === keyId);
    if (!signingKey) {
      console.error('[RTDN-AUTH] No matching key found for kid:', keyId);
      return false;
    }

    // Import Google's public key and verify JWT signature
    const encoder = new TextEncoder();
    const keyData = {
      kty: signingKey.kty,
      n: signingKey.n,
      e: signingKey.e,
      alg: 'RS256',
      use: 'sig',
    };

    const publicKey = await crypto.subtle.importKey(
      'jwk',
      keyData,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify'],
    );

    // Reconstruct signing input and signature
    const signingInput = parts[0] + '.' + parts[1];
    const signatureB64 = parts[2].replace(/-/g, '+').replace(/_/g, '/');
    const signatureBytes = Uint8Array.from(atob(signatureB64), c => c.charCodeAt(0));

    const valid = await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      publicKey,
      signatureBytes,
      encoder.encode(signingInput),
    );

    if (!valid) {
      console.error('[RTDN-AUTH] JWT signature verification failed');
      return false;
    }

    return true;
  } catch (e: any) {
    console.error('[RTDN-AUTH] Verification error:', e.message);
    return false;
  }
}

/**
 * Voided/refunded product types
 */
const GOOGLE_VOIDED_PRODUCT_TYPE = {
  SUBSCRIPTION: 1,
  ONE_TIME: 2,
} as const;

/**
 * Handle Google Play RTDN (Real-time Developer Notifications).
 * 
 * IMPORTANT: Google's RTDN structure is:
 * {
 *   version: string,
 *   packageName: string,
 *   eventTimeMillis: long,
 *   oneTimeProductNotification: { notificationType, purchaseToken, sku },
 *   voidedPurchaseNotification: { purchaseToken, orderId, productType, refundType },
 *   subscriptionNotification: { ... },
 *   testNotification: { ... }
 * }
 * 
 * These fields are MUTUALLY EXCLUSIVE — only one is present per message.
 */
async function handleGoogleRtdn(request: Request, env: Env): Promise<Response> {
  // ── STEP 0: Authenticate Pub/Sub push message ──
  const isAuthentic = await verifyPubSubAuth(request, env);
  if (!isAuthentic) {
    console.error('[RTDN] Unauthenticated Pub/Sub message rejected');
    // Return 200 to prevent Pub/Sub from retrying unauthenticated messages
    return json({ ok: false, error: 'unauthenticated' }, { status: 200 });
  }

  try {
    const body = await request.json<{ message?: { data?: string; messageId?: string }; subscription?: string }>();

    if (!body.message?.data) {
      return json({ ok: true, skipped: 'no data' }, { status: 200 });
    }

    // Verify subscription path (defense in depth)
    if (body.subscription) {
      // Subscription format: projects/<project-id>/subscriptions/<subscription-name>
      const expectedSub = env.GOOGLE_RTDN_SUBSCRIPTION || '';
      if (expectedSub && body.subscription !== expectedSub) {
        console.error('[RTDN] Unexpected subscription:', body.subscription);
        return json({ ok: false, error: 'unexpected subscription' }, { status: 200 });
      }
    }

    // Decode Pub/Sub message data
    const decoded = JSON.parse(atob(body.message.data));
    const { packageName } = decoded;

    // Verify package name
    const expectedPackage = env.GOOGLE_PLAY_PACKAGE_NAME || 'com.sunobolo.english';
    if (packageName !== expectedPackage) {
      console.error('[RTDN] Wrong package:', packageName);
      return json({ ok: false, error: 'wrong package' }, { status: 200 });
    }

    // ── Deduplication check ──
    const messageId = body.message.messageId;
    if (messageId) {
      try {
        const existing = await env.DB.prepare(
          `SELECT id FROM google_webhook_log WHERE message_id = ?`
        ).bind(messageId).first();
        if (existing) {
          return json({ ok: true, duplicate: true }, { status: 200 });
        }
      } catch {
        // Table may not exist yet — continue processing
      }
    }

    // ── Handle OneTimeProductNotification ──
    if (decoded.oneTimeProductNotification) {
      const notif = decoded.oneTimeProductNotification;
      const { notificationType, purchaseToken, sku } = notif;

      // Log the message
      if (messageId) {
        try {
          await env.DB.prepare(
            `INSERT INTO google_webhook_log (id, message_id, message_type, package_name, product_id, purchase_token)
             VALUES (?, ?, ?, ?, ?, ?)`
          ).bind(
            crypto.randomUUID(), messageId, `otp_${notificationType}`,
            packageName, sku, purchaseToken,
          ).run();
        } catch {
          // Table may not exist — continue
        }
      }

      // notificationType 1 = ONE_TIME_PRODUCT_PURCHASED
      // Already handled by handlePaymentVerifyGoogle (client-initiated flow)
      // No action needed here — the client flow already verified + activated
      if (notificationType === 1) {
        console.log(`[RTDN] ONE_TIME_PRODUCT_PURCHASED: sku=${sku}, token=${purchaseToken.substring(0, 20)}...`);
      }

      // notificationType 2 = ONE_TIME_PRODUCT_CANCELED
      // This means a PENDING purchase was cancelled by the user.
      // It does NOT mean an already-completed purchase was refunded.
      // We do NOT revoke any entitlement because the purchase was never completed.
      if (notificationType === 2) {
        console.log(`[RTDN] ONE_TIME_PRODUCT_CANCELED (pending cancelled): sku=${sku}, token=${purchaseToken.substring(0, 20)}...`);
        // Log only — no entitlement to revoke
        await logAuditEvent('system', 'GOOGLE_OTP_PENDING_CANCELLED', {
          sku,
          purchaseToken: purchaseToken.substring(0, 20) + '...',
        }, env.DB).catch(() => {});
      }
    }

    // ── Handle VoidedPurchaseNotification (REFUND / VOID) ──
    if (decoded.voidedPurchaseNotification) {
      const notif = decoded.voidedPurchaseNotification;
      const { purchaseToken, orderId, productType, refundType } = notif;

      console.log(`[RTDN] VOIDED_PURCHASE: orderId=${orderId}, productType=${productType}, refundType=${refundType}, token=${purchaseToken.substring(0, 20)}...`);

      // Log the message
      if (messageId) {
        try {
          await env.DB.prepare(
            `INSERT INTO google_webhook_log (id, message_id, message_type, package_name, product_id, purchase_token)
             VALUES (?, ?, ?, ?, ?, ?)`
          ).bind(
            crypto.randomUUID(), messageId, `voided_pt${productType}_rt${refundType}`,
            packageName, orderId || 'unknown', purchaseToken,
          ).run();
        } catch {
          // Table may not exist — continue
        }
      }

      // ── IMPORTANT: Do NOT trust the RTDN alone for revocation. ──
      // Call Google Play Developer API to get the authoritative purchase state.
      // Find the payment by purchaseToken and determine productId from our allowed list.
      if (productType === GOOGLE_VOIDED_PRODUCT_TYPE.ONE_TIME) {
        const payment = await env.DB.prepare(
          `SELECT id, user_id, plan_id, google_purchase_token FROM payments WHERE google_purchase_token = ?`
        ).bind(purchaseToken).first<{ id: string; user_id: string; plan_id: string; google_purchase_token: string }>();

        if (!payment) {
          console.error(`[RTDN] Voided purchase token not found in payments: ${purchaseToken.substring(0, 20)}...`);
          // Still return OK — we can't process what we don't have
          return json({ ok: true, skipped: 'payment not found' }, { status: 200 });
        }

        // Determine productId from planId using server-side map
        const planToProduct: Record<string, string> = {
          'one_month': 'sunobolo_one_month',
          'three_month': 'sunobolo_three_month',
          'six_month': 'sunobolo_six_month',
          'one_year': 'sunobolo_one_year',
        };
        const productId = planToProduct[payment.plan_id];
        if (!productId) {
          console.error(`[RTDN] Unknown plan_id for voided purchase: ${payment.plan_id}`);
          return json({ ok: true, skipped: 'unknown plan' }, { status: 200 });
        }

        // ── VERIFY with Google Play Developer API (authoritative state) ──
        try {
          const googlePurchase = await verifyPurchaseWithGoogle(productId, purchaseToken, env);

          if (!googlePurchase) {
            console.error('[RTDN] Google API verification failed for voided purchase — NOT revoking');
            return json({ ok: true, skipped: 'google api failed' }, { status: 200 });
          }

          // Only revoke if Google confirms the purchase was actually voided
          // Check if the purchase is in a non-purchased state (canceled/voided)
          if (googlePurchase.purchaseState === GOOGLE_PURCHASE_STATE.CANCELED || googlePurchase.consumptionState !== 0) {
            // Google confirms the purchase is voided — revoke entitlement
            await env.DB.prepare(
              `UPDATE payments SET status = 'refunded' WHERE id = ?`
            ).bind(payment.id).run();

            // Only revoke if subscription is currently active
            await env.DB.prepare(
              `UPDATE subscriptions SET status = 'revoked' WHERE user_id = ? AND payment_id = ? AND status = 'active'`
            ).bind(payment.user_id, purchaseToken).run();

            await logAuditEvent(payment.user_id, 'GOOGLE_PURCHASE_VOIDED', {
              orderId,
              productId,
              refundType,
              googlePurchaseState: googlePurchase.purchaseState,
            }, env.DB);

            console.log(`[RTDN] Purchase VOIDED and entitlement revoked: user=${payment.user_id}, orderId=${orderId}`);
          } else {
            // Google says purchase is still valid — do NOT revoke
            console.log(`[RTDN] Google API says purchase still valid (state=${googlePurchase.purchaseState}) — NOT revoking: orderId=${orderId}`);
            await logAuditEvent(payment.user_id, 'GOOGLE_VOIDED_BUT_API_SAYS_VALID', {
              orderId,
              productId,
              refundType,
              googlePurchaseState: googlePurchase.purchaseState,
            }, env.DB);
          }
        } catch (e: any) {
          console.error('[RTDN] Google API call failed during voided purchase processing:', e.message);
          // Do NOT revoke — we can't verify
          return json({ ok: true, skipped: 'verification failed' }, { status: 200 });
        }
      }

      // productType === 1 (subscription) — not applicable to our app
      if (productType === GOOGLE_VOIDED_PRODUCT_TYPE.SUBSCRIPTION) {
        console.log(`[RTDN] Subscription voided (not applicable to our one-time model): orderId=${orderId}`);
      }
    }

    // ── Handle SubscriptionNotification (not expected, but log for safety) ──
    if (decoded.subscriptionNotification) {
      console.log(`[RTDN] Unexpected SubscriptionNotification:`, JSON.stringify(decoded.subscriptionNotification));
    }

    // ── Handle TestNotification ──
    if (decoded.testNotification) {
      console.log('[RTDN] Test notification received — configuration is working!');
    }

    return json({ ok: true }, { status: 200 });
  } catch (e: any) {
    console.error('[RTDN] Error:', e.message);
    // Return 200 to prevent infinite Pub/Sub retries
    // Log the error for debugging
    return json({ ok: true, error: e.message }, { status: 200 });
  }
}

/** Activate or extend subscription after verified payment. Idempotent. */
async function activateSubscription(userId: string, orderId: string, paymentId: string, planId: string, db: D1Database): Promise<void> {
  // Idempotency check — same payment cannot create multiple entitlements
  const existing = await db.prepare(`SELECT id FROM payments WHERE razorpay_payment_id = ? AND status = 'paid'`).bind(paymentId).first();
  if (existing) return;

  const plan = getServerPlan(planId);
  if (!plan) return;

  // Mark payment as paid
  await db.prepare(`UPDATE payments SET status = 'paid', verified_at = datetime('now') WHERE razorpay_order_id = ?`).bind(orderId).run();

  // Complete coupon usage (mark reserved → completed) — fire-and-forget if table/columns missing
  try {
    await db.prepare(
      `UPDATE coupon_usages SET status = 'completed', payment_id = (SELECT id FROM payments WHERE razorpay_order_id = ?), completed_at = datetime('now') WHERE order_id = ? AND status = 'reserved'`
    ).bind(orderId, orderId).run();
  } catch (e) {
    console.error('[ACTIVATE] Failed to update coupon_usages (non-critical):', e);
  }

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

  // Fetch offer snapshot from payment record (if any)
  let offerId: string | null = null;
  let offerName: string | null = null;
  try {
    const paymentRecord = await db.prepare(
      'SELECT offer_id, offer_name FROM payments WHERE razorpay_order_id = ?'
    ).bind(orderId).first<{ offer_id: string | null; offer_name: string | null }>();
    offerId = paymentRecord?.offer_id || null;
    offerName = paymentRecord?.offer_name || null;
  } catch { /* offer columns may not exist yet */ }

  // Create new subscription (with offer snapshot)
  try {
    await db.prepare(
      `INSERT INTO subscriptions (id, user_id, package_id, status, payment_ref, started_at, expires_at, offer_id, offer_name)
       VALUES (?, ?, ?, 'active', ?, ?, ?, ?, ?)`
    ).bind(crypto.randomUUID(), userId, planId, paymentId, startedAt, expiresAt, offerId, offerName).run();
  } catch {
    // Fallback if offer columns don't exist yet in subscriptions table
    await db.prepare(
      `INSERT INTO subscriptions (id, user_id, package_id, status, payment_ref, started_at, expires_at)
       VALUES (?, ?, ?, 'active', ?, ?, ?)`
    ).bind(crypto.randomUUID(), userId, planId, paymentId, startedAt, expiresAt).run();
  }
}

async function handlePaymentWebhook(request: Request, env: Env): Promise<Response> {
  // Read raw body for signature verification
  const rawBody = await request.text();
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return err('Invalid JSON', 400);
  }

  const event = body.event as string | undefined;
  const payload = body.payload as Record<string, any> | undefined;

  if (!event || !payload) {
    return json({ ok: true }); // Not a recognised event — ack silently
  }

  // ── Verify webhook signature (required) ──
  if (!env.RAZORPAY_WEBHOOK_SECRET) {
    // SECURITY: Fail safely — never process webhooks without signature verification
    console.error('[WEBHOOK] RAZORPAY_WEBHOOK_SECRET not configured — rejecting webhook');
    return err('Webhook verification unavailable. Please configure RAZORPAY_WEBHOOK_SECRET.', 500);
  }
  {
    const signature = request.headers.get('x-razorpay-signature');
    if (!signature) {
      console.error('[WEBHOOK] Missing x-razorpay-signature header');
      return err('Missing signature', 401);
    }
    try {
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(env.RAZORPAY_WEBHOOK_SECRET),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign', 'verify']
      );
      const sigBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody));
      const expectedSig = Array.from(new Uint8Array(sigBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      if (expectedSig !== signature) {
        console.error('[WEBHOOK] Signature mismatch');
        return err('Invalid signature', 401);
      }
    } catch (e: any) {
      console.error('[WEBHOOK] Signature verification error:', e.message);
      return err('Signature verification failed', 500);
    }
  }

  // ── Handle successful payment events ──
  if (event === 'payment.captured' || event === 'payment.authorized') {
    const paymentEntity = payload.payment?.entity as {
      id?: string;
      order_id?: string;
      amount?: number;
      status?: string;
    } | undefined;

    if (!paymentEntity?.order_id || !paymentEntity?.id) {
      console.error('[WEBHOOK] Missing payment entity data');
      return json({ ok: true });
    }

    const orderId = paymentEntity.order_id;
    const paymentId = paymentEntity.id;

    // Find the payment record in D1
    const payment = await env.DB.prepare(
      `SELECT id, user_id, amount, status, plan_id FROM payments WHERE razorpay_order_id = ?`
    ).bind(orderId).first<{ id: string; user_id: string; amount: number; status: string; plan_id: string | null }>();

    if (!payment) {
      console.error(`[WEBHOOK] No payment record for order ${orderId}`);
      return json({ ok: true });
    }

    // Already processed — idempotent
    if (payment.status === 'paid') {
      return json({ ok: true, already_processed: true });
    }

    // Determine plan: prefer plan_id from DB, fallback to amount matching
    let planId: string | null = null;
    if (payment.plan_id) {
      planId = payment.plan_id;
    } else {
      for (const [id, p] of Object.entries(PLANS)) {
        if (p.amount === payment.amount) { planId = id; break; }
      }
    }
    if (!planId) {
      console.error(`[WEBHOOK] Cannot determine plan for order ${orderId} (amount: ${payment.amount}, plan_id: ${payment.plan_id})`);
      return json({ ok: true });
    }

    // Activate subscription
    await activateSubscription(payment.user_id, orderId, paymentId, planId, env.DB);
    await logAuditEvent(payment.user_id, 'PAYMENT_SUCCESS', { orderId, paymentId, planId, source: 'webhook' }, env.DB);
    console.log(`[WEBHOOK] Payment ${orderId} → PAID, subscription activated for user ${payment.user_id}`);
  }

  return json({ ok: true });
}

// ── Push Notification Handlers ──

/** Subscribe to push notifications */
async function handlePushSubscribe(request: Request, env: Env): Promise<Response> {
  const user = await authenticateUser(request, env);
  if (!user) return err('Login required', 401);

  const body = await request.json<{ endpoint?: string; p256dh?: string; auth?: string }>();
  if (!body?.endpoint || !body?.p256dh || !body?.auth) {
    return err('Missing push subscription data');
  }

  // Upsert: delete existing subscription for this endpoint, then insert new one
  await env.DB.prepare('DELETE FROM push_subscriptions WHERE endpoint = ?').bind(body.endpoint).run();
  await env.DB.prepare(
    'INSERT INTO push_subscriptions (id, user_id, endpoint, p256dh, auth_key, user_agent) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(
    crypto.randomUUID(), user.id, body.endpoint, body.p256dh, body.auth,
    request.headers.get('user-agent') || ''
  ).run();

  return json({ ok: true });
}

/** Unsubscribe from push notifications */
async function handlePushUnsubscribe(request: Request, env: Env): Promise<Response> {
  const user = await authenticateUser(request, env);
  if (!user) return err('Login required', 401);

  const body = await request.json<{ endpoint?: string }>();
  if (!body?.endpoint) return err('Missing endpoint');

  // SECURITY: Only allow deleting own push subscription
  const sub = await env.DB.prepare('SELECT id FROM push_subscriptions WHERE endpoint = ? AND user_id = ?').bind(body.endpoint, user.id).first();
  if (!sub) return err('Push subscription not found or not yours', 404);

  await env.DB.prepare('DELETE FROM push_subscriptions WHERE endpoint = ? AND user_id = ?').bind(body.endpoint, user.id).run();
  return json({ ok: true });
}

/** Track notification click */
async function handlePushTrackClick(request: Request, env: Env): Promise<Response> {
  const body = await request.json<{ notificationId?: string }>();
  if (!body?.notificationId) return json({ ok: true });

  const user = await authenticateUser(request, env);
  await env.DB.prepare(
    'UPDATE notification_log SET clicked_at = datetime(\'now\') WHERE notification_id = ? AND user_id = ? AND clicked_at IS NULL'
  ).bind(body.notificationId, user?.id || 'anonymous').run();

  await env.DB.prepare(
    'UPDATE notifications SET total_clicked = total_clicked + 1 WHERE id = ?'
  ).bind(body.notificationId).run().catch(() => {});

  return json({ ok: true });
}

/** Track notification close */
async function handlePushTrackClose(request: Request, env: Env): Promise<Response> {
  return json({ ok: true });
}

/** Admin: Send push notification */
async function handleSendNotification(request: Request, env: Env): Promise<Response> {
  const adminUser = await authenticateAdmin(request, env);
  if (!adminUser) return err('Admin required', 403);

  const body = await request.json<{
    title?: string; message?: string; image_url?: string;
    cta_text?: string; cta_url?: string; type?: string;
    audience?: string; audience_filter?: string;
  }>();

  if (!body?.title || !body?.message) return err('Title and message required');

  // ── Anti-spam: Frequency protection ──
  const notifType = body.type || 'marketing';
  if (notifType === 'marketing') {
    // Max 3 marketing notifications per 24 hours
    const last24h = await env.DB.prepare(
      "SELECT COUNT(*) as cnt FROM notifications WHERE type = 'marketing' AND status = 'sent' AND sent_at > datetime('now', '-1 day')"
    ).first<{ cnt: number }>();
    if ((last24h?.cnt || 0) >= 3) {
      return err('Anti-spam limit: Maximum 3 marketing notifications per 24 hours. Please try again later.', 429);
    }

    // Max 10 marketing notifications per 7 days
    const last7d = await env.DB.prepare(
      "SELECT COUNT(*) as cnt FROM notifications WHERE type = 'marketing' AND status = 'sent' AND sent_at > datetime('now', '-7 days')"
    ).first<{ cnt: number }>();
    if ((last7d?.cnt || 0) >= 10) {
      return err('Anti-spam limit: Maximum 10 marketing notifications per week. Please try again later.', 429);
    }

    // Prevent duplicate: check for similar title+message sent in last 1 hour
    const duplicateCheck = await env.DB.prepare(
      "SELECT id FROM notifications WHERE title = ? AND message = ? AND status = 'sent' AND sent_at > datetime('now', '-1 hour')"
    ).bind(body.title, body.message).first();
    if (duplicateCheck) {
      return err('Duplicate notification: A notification with the same title and message was sent in the last hour.', 409);
    }
  }

  const notificationId = 'n_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const audience = body.audience || 'all';

  // Build audience query
  let audienceQuery = 'SELECT DISTINCT ps.* FROM push_subscriptions ps JOIN users u ON ps.user_id = u.id';
  const conditions: string[] = [];

  if (audience === 'free') {
    conditions.push("u.id NOT IN (SELECT user_id FROM subscriptions WHERE status = 'active')");
  } else if (audience === 'paid') {
    conditions.push("u.id IN (SELECT user_id FROM subscriptions WHERE status = 'active')");
  } else if (audience === 'inactive_7d') {
    conditions.push("u.last_login_at < datetime('now', '-7 days')");
  } else if (audience === 'inactive_30d') {
    conditions.push("u.last_login_at < datetime('now', '-30 days')");
  }

  if (conditions.length > 0) {
    audienceQuery += ' WHERE ' + conditions.join(' AND ');
  }

  const { results: subscriptions } = await env.DB.prepare(audienceQuery).all();

  // Store notification record
  await env.DB.prepare(
    'INSERT INTO notifications (id, title, message, image_url, cta_text, cta_url, type, audience, audience_filter, status, total_sent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(
    notificationId, body.title, body.message, body.image_url || null,
    body.cta_text || 'Open', body.cta_url || '/', body.type || 'marketing',
    audience, body.audience_filter || null, 'sent', subscriptions?.length || 0
  ).run();

  // Send to all subscriptions via Web Push API
  let sent = 0;
  let failed = 0;

  for (const sub of (subscriptions || []) as any[]) {
    try {
      const pushPayload = JSON.stringify({
        title: body.title,
        body: body.message,
        icon: '/images/logo.png',
        image: body.image_url || undefined,
        url: body.cta_url || '/',
        tag: 'sunobolo-' + notificationId,
        ctaText: body.cta_text || 'Open',
        notificationId,
      });

      // Web Push Protocol: send HTTP POST to browser push service
      const subscription = {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth_key },
      };

      await sendWebPush(subscription, pushPayload, env);

      // Log successful send
      await env.DB.prepare(
        'INSERT INTO notification_log (notification_id, user_id, subscription_id, status, sent_at) VALUES (?, ?, ?, ?, datetime(\'now\'))'
      ).bind(notificationId, sub.user_id, sub.id, 'sent').run();

      sent++;
    } catch (e: any) {
      failed++;
      // Log failed send
      await env.DB.prepare(
        'INSERT INTO notification_log (notification_id, user_id, subscription_id, status, error) VALUES (?, ?, ?, ?, ?)'
      ).bind(notificationId, sub.user_id, sub.id, 'failed', e.message).run();

      // If subscription is invalid (404 Gone), remove it
      if (e.message?.includes('404') || e.message?.includes('gone')) {
        await env.DB.prepare('DELETE FROM push_subscriptions WHERE id = ?').bind(sub.id).run();
      }
    }
  }

  await logAuditEvent(adminUser.id, 'NOTIFICATION_SENT', { notificationId, audience, sent, failed }, env.DB);

  return json({ ok: true, notificationId, sent, failed, total: subscriptions?.length || 0 });
}

/**
 * Generate a VAPID JWT token for Web Push Protocol authentication.
 * The token is signed with the VAPID private key and includes the
 * subscription endpoint as the audience claim.
 */
async function generateVapidJwt(privateKeyPem: string, endpoint: string, subject: string): Promise<string> {
  // Parse the ECDSA P-256 private key from PEM format
  const pemBody = privateKeyPem
    .replace(/-----BEGIN EC PRIVATE KEY-----/, '')
    .replace(/-----END EC PRIVATE KEY-----/, '')
    .replace(/\s/g, '');

  const keyData = Uint8Array.from(atob(pemBody), c => c.charCodeAt(0));

  // Import as ECDSA P-256 private key
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    keyData,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign'],
  );

  // JWT header
  const header = { alg: 'ES256', typ: 'JWT' };
  // JWT payload — 12 hour expiry, audience is the push service origin
  const url = new URL(endpoint);
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: `${url.protocol}//${url.host}`,
    exp: now + 43200,
    sub: subject,
  };

  const encoder = new TextEncoder();
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  const signatureInput = encoder.encode(`${headerB64}.${payloadB64}`);
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    privateKey,
    signatureInput,
  );

  // Convert DER-encoded signature to raw R||S format
  const sigArray = new Uint8Array(signature);
  // DER SEQUENCE: 30 + len + 02 + len(R) + R + 02 + len(S) + S
  const rLen = sigArray[3];
  const r = sigArray.slice(4, 4 + rLen);
  const s = sigArray.slice(4 + rLen + 2);

  const sigB64 = btoa(String.fromCharCode(...r, ...s))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  return `${headerB64}.${payloadB64}.${sigB64}`;
}

/** Send web push notification via HTTP to browser push service */
async function sendWebPush(subscription: { endpoint: string; keys: { p256dh: string; auth: string } }, payload: string, env: Env): Promise<void> {
  const webPushSecret = (env as any).WEB_PUSH_PRIVATE_KEY || '';
  const webPushSubject = (env as any).WEB_PUSH_SUBJECT || 'https://sunobolo.in';

  if (!webPushSecret) {
    console.log('[PUSH] No WEB_PUSH_PRIVATE_KEY configured — skipping send');
    return;
  }

  // Generate proper VAPID JWT for authorization
  const vapidToken = await generateVapidJwt(webPushSecret, subscription.endpoint, webPushSubject);

  const vapidHeaders: Record<string, string> = {
    'Content-Type': 'application/octet-stream',
    'TTL': '86400',
    'Urgency': 'normal',
    'Authorization': `vapid t=${vapidToken}, k=${(env as any).VAPID_PUBLIC_KEY || ''}`,
  };

  const response = await fetch(subscription.endpoint, {
    method: 'POST',
    headers: vapidHeaders,
    body: payload,
  });

  if (!response.ok) {
    throw new Error(`Push service responded with ${response.status}: ${response.statusText}`);
  }
}

/** Admin: List notifications */
async function handleListNotifications(request: Request, env: Env): Promise<Response> {
  const adminUser = await authenticateAdmin(request, env);
  if (!adminUser) return err('Admin required', 403);

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = 20;
  const offset = (page - 1) * limit;

  const { results } = await env.DB.prepare(
    'SELECT * FROM notifications ORDER BY created_at DESC LIMIT ? OFFSET ?'
  ).bind(limit, offset).all();

  const count = await env.DB.prepare('SELECT COUNT(*) as n FROM notifications').first<{ n: number }>();

  return json({ notifications: results || [], total: count?.n || 0, page, limit });
}

/** Admin: Get notification analytics */
async function handleNotificationStats(request: Request, env: Env): Promise<Response> {
  const adminUser = await authenticateAdmin(request, env);
  if (!adminUser) return err('Admin required', 403);

  const url = new URL(request.url);
  const notificationId = url.pathname.match(/\/notifications\/([^/]+)\/stats/)?.[1];

  if (!notificationId) return err('Notification ID required');

  const notification = await env.DB.prepare('SELECT * FROM notifications WHERE id = ?').bind(notificationId).first();
  if (!notification) return err('Notification not found', 404);

  const logs = await env.DB.prepare(
    'SELECT status, COUNT(*) as count FROM notification_log WHERE notification_id = ? GROUP BY status'
  ).bind(notificationId).all();

  const clicks = await env.DB.prepare(
    'SELECT COUNT(*) as n FROM notification_log WHERE notification_id = ? AND clicked_at IS NOT NULL'
  ).bind(notificationId).first<{ n: number }>();

  return json({ notification, logs: logs?.results || [], clicks: clicks?.n || 0 });
}

/** Admin: Get push subscription stats */
async function handlePushStats(request: Request, env: Env): Promise<Response> {
  const adminUser = await authenticateAdmin(request, env);
  if (!adminUser) return err('Admin required', 403);

  const totalSubs = await env.DB.prepare('SELECT COUNT(*) as n FROM push_subscriptions').first<{ n: number }>();
  const totalUsers = await env.DB.prepare('SELECT COUNT(*) as n FROM users').first<{ n: number }>();
  const totalNotifications = await env.DB.prepare('SELECT COUNT(*) as n FROM notifications').first<{ n: number }>();
  const totalSent = await env.DB.prepare('SELECT COALESCE(SUM(total_sent), 0) as n FROM notifications').first<{ n: number }>();

  return json({
    subscriptions: totalSubs?.n || 0,
    totalUsers: totalUsers?.n || 0,
    notificationsSent: totalNotifications?.n || 0,
    totalPushesSent: totalSent?.n || 0,
  });
}

// ── Coupon Validation Handler ──

/**
 * Server-side coupon validation + discount calculation.
 * NEVER trusts frontend amounts — all calculation happens here.
 */
async function handleCouponValidate(request: Request, env: Env): Promise<Response> {
  const user = await authenticateUser(request, env);
  if (!user) return err('Login required', 401);

  // Rate limit: max 20 coupon validations per user per hour
  if (await checkUserRateLimit(user.id, 'COUPON_VALIDATED', 20, 60, env.DB)) {
    return err('Too many coupon attempts. Please try again later.', 429);
  }

  const body = await request.json<{ code?: string; planId?: string }>();
  if (!body?.code || !body?.planId) return err('coupon code and planId required');

  // Log for rate limiting (fire-and-forget)
  logAuditEvent(user.id, 'COUPON_VALIDATED', { code: body.code }, env.DB).catch(() => {});

  const code = body.code.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const plan = getServerPlan(body.planId);
  if (!plan) return err('Invalid plan');

  // 1. Find coupon (gracefully handle if coupons table doesn't exist yet)
  let coupon: {
    id: string; code: string; discount_type: string; discount_value: number;
    applicable_plans: string; start_date: string; expiry_date: string;
    max_total_uses: number; max_uses_per_user: number; min_order_amount: number;
    is_active: number;
  } | null = null;
  try {
    coupon = await env.DB.prepare(
      'SELECT * FROM coupons WHERE code = ?'
    ).bind(code).first();
  } catch (e) {
    // coupons table may not exist yet if migration 0010 hasn't been applied
    console.error('[COUPON] coupons table may not exist:', e);
    return err('Coupon system is not available yet. Please try again later.', 503);
  }

  if (!coupon) return err('Invalid coupon code');

  // 2. Check active
  if (!coupon.is_active) return err('This coupon is no longer active');

  // 3. Check date validity
  const now = new Date();
  if (new Date(coupon.start_date) > now) return err('This coupon is not yet valid');
  if (new Date(coupon.expiry_date) < now) return err('This coupon has expired');

  // 4. Check total usage limit
  if (coupon.max_total_uses > 0) {
    const totalUsed = await env.DB.prepare(
      "SELECT COUNT(*) as n FROM coupon_usages WHERE coupon_id = ? AND status = 'completed'"
    ).bind(coupon.id).first<{ n: number }>();
    if ((totalUsed?.n || 0) >= coupon.max_total_uses) {
      return err('This coupon is no longer available');
    }
  }

  // 5. Check per-user usage limit
  if (coupon.max_uses_per_user > 0) {
    const userUsed = await env.DB.prepare(
      "SELECT COUNT(*) as n FROM coupon_usages WHERE coupon_id = ? AND user_id = ? AND status = 'completed'"
    ).bind(coupon.id, user.id).first<{ n: number }>();
    if ((userUsed?.n || 0) >= coupon.max_uses_per_user) {
      return err('You have already used this coupon');
    }
  }

  // 6. Check applicable plans
  if (coupon.applicable_plans !== 'all') {
    const allowed = coupon.applicable_plans.split(',').map(s => s.trim());
    if (!allowed.includes(body.planId)) {
      return err('This coupon is not valid for the selected plan');
    }
  }

  // 7. Check minimum order amount (in paise)
  if (coupon.min_order_amount > 0 && plan.amount < coupon.min_order_amount) {
    return err(`Minimum order amount is ₹${coupon.min_order_amount / 100}`);
  }

  // 8. Calculate discount
  let discountAmount = 0;
  if (coupon.discount_type === 'percentage') {
    discountAmount = Math.floor(plan.amount * coupon.discount_value / 100);
  } else {
    discountAmount = Math.min(coupon.discount_value, plan.amount);
  }

  // 9. Ensure discount doesn't exceed price (minimum ₹1)
  discountAmount = Math.min(discountAmount, plan.amount - 100);
  discountAmount = Math.max(discountAmount, 0);

  const finalAmount = plan.amount - discountAmount;

  return json({
    valid: true,
    couponId: coupon.id,
    couponCode: coupon.code,
    discountType: coupon.discount_type,
    discountValue: coupon.discount_value,
    applicablePlans: coupon.applicable_plans,
    originalAmount: plan.amount,
    discountAmount,
    finalAmount,
  });
}

// ── 30-Day Grammar Journey Handlers ──

/** Get user's journey progress */
async function handleJourneyProgress(request: Request, env: Env): Promise<Response> {
  const user = await authenticateUser(request, env);
  if (!user) return err('Login required', 401);

  const { results } = await env.DB.prepare(
    'SELECT day_number, status, score, attempts, started_at, completed_at FROM journey_progress WHERE user_id = ? ORDER BY day_number'
  ).bind(user.id).all();

  const progress = (results || []).map((r: any) => ({
    day: r.day_number,
    status: r.status,
    score: r.score,
    attempts: r.attempts,
    startedAt: r.started_at,
    completedAt: r.completed_at,
  }));

  return json({ progress });
}

/** Start a journey day (mark as in_progress) */
async function handleJourneyStart(request: Request, env: Env): Promise<Response> {
  const user = await authenticateUser(request, env);
  if (!user) return err('Login required', 401);

  const body = await request.json<{ day?: number }>();
  if (!body?.day || body.day < 1 || body.day > 30) return err('Invalid day number');

  // Access control: Day 1 free, Day 2-30 requires subscription
  const FREE_DAYS = 1;
  if (body.day > FREE_DAYS) {
    const sub = await env.DB.prepare(
      "SELECT id FROM subscriptions WHERE user_id = ? AND status = 'active' AND expires_at > datetime('now')"
    ).bind(user.id).first();
    if (!sub) return err('Full Access required to unlock this day');
  }

  // Check if previous day is completed (or this is day 1)
  if (body.day > 1) {
    const prevDay = await env.DB.prepare(
      'SELECT status FROM journey_progress WHERE user_id = ? AND day_number = ?'
    ).bind(user.id, body.day - 1).first<{ status: string }>();
    if (!prevDay || prevDay.status !== 'completed') {
      return err('Previous day not completed');
    }
  }

  // Upsert: mark as in_progress
  await env.DB.prepare(
    `INSERT INTO journey_progress (user_id, day_number, status, started_at, updated_at)
     VALUES (?, ?, 'in_progress', datetime('now'), datetime('now'))
     ON CONFLICT(user_id, day_number) DO UPDATE SET status = 'in_progress', updated_at = datetime('now')`
  ).bind(user.id, body.day).run();

  return json({ ok: true, day: body.day });
}

/** Complete a journey day */
async function handleJourneyCompleteDay(request: Request, env: Env): Promise<Response> {
  const user = await authenticateUser(request, env);
  if (!user) return err('Login required', 401);

  const body = await request.json<{ day?: number; score?: number }>();
  if (!body?.day || body.day < 1 || body.day > 30) return err('Invalid day number');

  // Access control: Day 1 free, Day 2-30 requires subscription
  const FREE_DAYS = 1;
  if (body.day > FREE_DAYS) {
    const sub = await env.DB.prepare(
      "SELECT id FROM subscriptions WHERE user_id = ? AND status = 'active' AND expires_at > datetime('now')"
    ).bind(user.id).first();
    if (!sub) return err('Full Access required to complete this day');
  }

  // Get current status
  const current = await env.DB.prepare(
    'SELECT status, attempts FROM journey_progress WHERE user_id = ? AND day_number = ?'
  ).bind(user.id, body.day).first<{ status: string; attempts: number }>();

  if (!current || current.status === 'locked') {
    return err('Day is locked');
  }

  // Update to completed
  await env.DB.prepare(
    `UPDATE journey_progress
     SET status = 'completed', score = ?, attempts = ?, completed_at = datetime('now'), updated_at = datetime('now')
     WHERE user_id = ? AND day_number = ?`
  ).bind(body.score ?? 100, (current.attempts || 0) + 1, user.id, body.day).run();

  // Unlock next day if it exists
  if (body.day < 30) {
    await env.DB.prepare(
      `INSERT INTO journey_progress (user_id, day_number, status, created_at, updated_at)
       VALUES (?, ?, 'unlocked', datetime('now'), datetime('now'))
       ON CONFLICT(user_id, day_number) DO NOTHING`
    ).bind(user.id, body.day + 1).run();
  }

  return json({ ok: true, day: body.day, score: body.score ?? 100 });
}

// ── Admin Payment Reconciliation Handler ──
// Verifies a stuck payment via Razorpay API and activates subscription if genuine
async function handlePaymentReconcile(request: Request, env: Env): Promise<Response> {
  const adminUser = await authenticateAdmin(request, env);
  if (!adminUser) return err('Admin required', 403);

  const body = await request.json<{ orderId?: string; paymentId?: string }>();
  if (!body.orderId && !body.paymentId) return err('orderId or paymentId required');

  // Find the payment record
  let payment;
  if (body.orderId) {
    payment = await env.DB.prepare(
      'SELECT id, user_id, razorpay_order_id, razorpay_payment_id, amount, status, plan_id FROM payments WHERE razorpay_order_id = ?'
    ).bind(body.orderId).first<{ id: string; user_id: string; razorpay_order_id: string; razorpay_payment_id: string | null; amount: number; status: string; plan_id: string | null }>();
  } else {
    payment = await env.DB.prepare(
      'SELECT id, user_id, razorpay_order_id, razorpay_payment_id, amount, status, plan_id FROM payments WHERE razorpay_payment_id = ?'
    ).bind(body.paymentId).first<{ id: string; user_id: string; razorpay_order_id: string; razorpay_payment_id: string | null; amount: number; status: string; plan_id: string | null }>();
  }

  if (!payment) return err('Payment record not found', 404);

  // Already paid — just return success
  if (payment.status === 'paid') {
    return json({ ok: true, message: 'Payment already marked as paid', payment: { orderId: payment.razorpay_order_id, status: 'paid' } });
  }

  // If no Razorpay keys configured, can't verify
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    return err('Razorpay credentials not configured — cannot verify payment server-side', 500);
  }

  try {
    // Fetch order from Razorpay API to verify it exists and get payment info
    const auth = btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`);
    const orderRes = await fetch(`https://api.razorpay.com/v1/orders/${payment.razorpay_order_id}`, {
      headers: { Authorization: `Basic ${auth}` },
    });

    if (!orderRes.ok) {
      const errText = await orderRes.text().catch(() => '');
      console.error(`[RECONCILE] Razorpay API error ${orderRes.status}: ${errText}`);
      return err(`Razorpay API error: ${orderRes.status}`);
    }

    const order = await orderRes.json<{ id: string; status: string; amount: number; receipts?: string }>();

    if (order.status !== 'paid' && order.status !== 'captured') {
      return json({
        ok: false,
        message: `Order status is '${order.status}' on Razorpay — payment not yet captured`,
        razorpayStatus: order.status,
      });
    }

    // Order is paid/captured on Razorpay — now get the payment ID from the order
    const paymentsRes = await fetch(`https://api.razorpay.com/v1/orders/${payment.razorpay_order_id}/payments`, {
      headers: { Authorization: `Basic ${auth}` },
    });

    if (!paymentsRes.ok) {
      return err('Failed to fetch payments from Razorpay');
    }

    const paymentsData = await paymentsRes.json<{ items: Array<{ id: string; status: string; amount: number }> }>();
    const capturedPayment = paymentsData.items?.find(p => p.status === 'captured' || p.status === 'authorized');

    if (!capturedPayment) {
      return json({ ok: false, message: 'No captured payment found on Razorpay for this order' });
    }

    // Determine plan from amount
    let planId: string | null = null;
    for (const [id, p] of Object.entries(PLANS)) {
      if (p.amount === payment.amount) { planId = id; break; }
    }
    if (!planId) {
      return err(`Unknown payment amount ${payment.amount}`);
    }

    // Update payment record with Razorpay payment ID
    await env.DB.prepare(
      'UPDATE payments SET razorpay_payment_id = ? WHERE razorpay_order_id = ?'
    ).bind(capturedPayment.id, payment.razorpay_order_id).run();

    // Activate subscription
    await activateSubscription(payment.user_id, payment.razorpay_order_id, capturedPayment.id, planId, env.DB);

    await logAuditEvent(adminUser.id, 'PAYMENT_RECONCILED', {
      orderId: payment.razorpay_order_id,
      paymentId: capturedPayment.id,
      planId,
      reconciledBy: adminUser.id,
    }, env.DB);

    console.log(`[RECONCILE] Payment ${payment.razorpay_order_id} → PAID, subscription activated for user ${payment.user_id}`);

    return json({
      ok: true,
      message: 'Payment verified and subscription activated',
      payment: {
        orderId: payment.razorpay_order_id,
        paymentId: capturedPayment.id,
        status: 'paid',
        planId,
      },
    });
  } catch (e: any) {
    console.error(`[RECONCILE] Error reconciling order ${payment.razorpay_order_id}:`, e.message);
    return err('Reconciliation failed: ' + e.message, 500);
  }
}

// ── Admin authentication helper (mirrors main auth) ──
async function authenticateAdmin(request: Request, env: Env): Promise<{ id: string; name: string; email: string } | null> {
  const user = await authenticateUser(request, env);
  if (!user) return null;
  const adminCheck = await env.DB.prepare('SELECT is_admin FROM users WHERE id = ?').bind(user.id).first<{ is_admin: number }>();
  if (!adminCheck?.is_admin) return null;
  return user;
}

// Translation is handled client-side (browser calls Google Translate directly)
// No server-side endpoint needed — works from any device

// ── Main router ──

export const onRequest: PagesFunction<Env> = async ({ request, env, params }) => {
  const path = (params.path as string[]) || [];
  const route = '/' + path.join('/');
  const method = request.method.toUpperCase();

  if (method === 'OPTIONS') {
    const origin = request.headers.get('origin');
    return new Response(null, {
      headers: { ...getCorsHeaders(origin), ...getSecurityHeaders(), 'max-age': '86400' },
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
      const subscribed = user ? await autoExpireAndCheckAccess(user.id, env.DB) : false;
      return json((results || []).map((c: any) => ({ ...c, locked: !c.is_free && !subscribed })));
    }

    const courseMatch = route.match(/^\/courses\/([\w-]+)$/);
    if (courseMatch && method === 'GET') {
      const slug = courseMatch[1];
      const course = await env.DB.prepare('SELECT * FROM courses WHERE slug = ? OR id = ?').bind(slug, slug).first();
      if (!course) return err('Course not found', 404);
      // SECURITY: Premium courses require authentication + active subscription
      if (!course.is_free) {
        const user = await authenticateUser(request, env);
        if (!user) return err('Login required to access premium courses', 401);
        const hasAccess = await autoExpireAndCheckAccess(user.id, env.DB);
        if (!hasAccess) return err('Active subscription required to access premium courses', 403);
      }
      const { results: lessons } = await env.DB.prepare('SELECT * FROM lessons WHERE course_id = ? ORDER BY sort_order ASC').bind(course.id).all();
      return json({ ...course, lessons: lessons || [] });
    }

    const lessonMatch = route.match(/^\/lessons\/([\w-]+)$/);
    if (lessonMatch && method === 'GET') {
      const id = lessonMatch[1];
      const lesson = await env.DB.prepare('SELECT * FROM lessons WHERE id = ?').bind(id).first();
      if (!lesson) return err('Lesson not found', 404);
      // SECURITY: Premium lessons require authentication + active subscription
      if (!lesson.is_free) {
        const user = await authenticateUser(request, env);
        if (!user) return err('Login required to access premium lessons', 401);
        const hasAccess = await autoExpireAndCheckAccess(user.id, env.DB);
        if (!hasAccess) return err('Active subscription required to access premium lessons', 403);
      }
      const { results: sentences } = await env.DB.prepare('SELECT * FROM sentences WHERE lesson_id = ? ORDER BY sort_order ASC').bind(id).all();
      return json({ ...lesson, sentences: sentences || [] });
    }

    const sentMatch = route.match(/^\/sentences\/([\w-]+)$/);
    if (sentMatch && method === 'GET') {
      const id = sentMatch[1];
      const sentence = await env.DB.prepare('SELECT * FROM sentences WHERE id = ?').bind(id).first();
      if (!sentence) return err('Sentence not found', 404);
      // SECURITY: Premium sentences require authentication + active subscription
      if (!sentence.is_free) {
        const user = await authenticateUser(request, env);
        if (!user) return err('Login required to access premium sentences', 401);
        const hasAccess = await autoExpireAndCheckAccess(user.id, env.DB);
        if (!hasAccess) return err('Active subscription required to access premium sentences', 403);
      }
      return json(sentence);
    }

    if (route === '/progress' && method === 'POST') {
      const user = await authenticateUser(request, env);
      if (!user) return err('Login required', 401);
      const body = await request.json<{ sentenceId?: string }>();
      if (!body?.sentenceId) return err('sentenceId required');
      // SECURITY: Always use authenticated user's ID — never trust body.userId
      await env.DB.prepare('INSERT OR IGNORE INTO user_progress (user_id, sentence_id) VALUES (?, ?)').bind(user.id, body.sentenceId).run();
      return json({ ok: true });
    }

    if (route === '/auth/guest' && method === 'POST') {
    if (route === '/progress/stats' && method === 'GET') return handleProgressStats(request, env);
      // Rate limit: max 50 guest accounts per hour (global)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const guestCount = await env.DB.prepare(
        "SELECT COUNT(*) as n FROM users WHERE id LIKE 'guest_%' AND created_at > ?"
      ).bind(oneHourAgo).first<{ n: number }>();
      if ((guestCount?.n || 0) >= 50) {
        return err('Too many guest accounts. Please try again later.', 429);
      }
      const id = 'guest_' + crypto.randomUUID().slice(0, 12);
      const colors = ['sky', 'purple', 'green', 'orange', 'pink'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      await env.DB.prepare('INSERT INTO users (id, name, avatar_color) VALUES (?, ?, ?)').bind(id, 'Guest', color).run();
      return json({ id, name: 'Guest', avatar_color: color });
    }

    if (route === '/auth/check-mobile' && method === 'POST') return handleCheckMobile(request, env);
    if (route === '/auth/update-name' && method === 'POST') return handleUpdateName(request, env);
    if (route === '/auth/signup' && method === 'POST') return handleAuthSignup(request, env);
    if (route === '/auth/login' && method === 'POST') return handleAuthLogin(request, env);
    if (route === '/auth/me' && method === 'GET') return handleAuthMe(request, env);
    if (route === '/auth/delete-account' && method === 'POST') return handleDeleteAccount(request, env);
    if (route === '/auth/logout' && method === 'POST') return handleAuthLogout(request, env);
    if (route === '/auth/forgot-password' && method === 'POST') return handleForgotPassword(request, env);
    if (route === '/auth/reset-password' && method === 'POST') return handleResetPassword(request, env);
    if (route === '/subscription' && method === 'GET') return handleSubscription(request, env);
    if (route === '/access' && method === 'GET') return handleAccess(request, env);
    if (route === '/offers/active' && method === 'GET') return handleActiveOffers(request, env);
    if (route === '/coupon/validate' && method === 'POST') return handleCouponValidate(request, env);
    if (route === '/payment/create-order' && method === 'POST') return handlePaymentCreateOrder(request, env);
    if (route === '/payment/verify' && method === 'POST') return handlePaymentVerify(request, env);
    if (route === '/payment/verify-google' && method === 'POST') return handlePaymentVerifyGoogle(request, env);
    if (route === '/payment/google-rtdn' && method === 'POST') return handleGoogleRtdn(request, env);
    if (route === '/payment/webhook' && method === 'POST') return handlePaymentWebhook(request, env);

    // ── Push Notification routes ──
    if (route === '/push/vapid-key' && method === 'GET') return json({ publicKey: env.VAPID_PUBLIC_KEY || '' });
    if (route === '/push/subscribe' && method === 'POST') return handlePushSubscribe(request, env);
    if (route === '/push/unsubscribe' && method === 'POST') return handlePushUnsubscribe(request, env);
    if (route === '/push/track-click' && method === 'POST') return handlePushTrackClick(request, env);
    if (route === '/push/track-close' && method === 'POST') return handlePushTrackClose(request, env);
    if (route === '/push/stats' && method === 'GET') return handlePushStats(request, env);

    // ── 30-Day Grammar Journey routes ──
    if (route === '/journey/progress' && method === 'GET') return handleJourneyProgress(request, env);
    if (route === '/journey/start' && method === 'POST') return handleJourneyStart(request, env);
    if (route === '/journey/complete-day' && method === 'POST') return handleJourneyCompleteDay(request, env);

    // ── Admin Notification routes ──
    if (route === '/notifications/send' && method === 'POST') return handleSendNotification(request, env);
    if (route === '/notifications' && method === 'GET') return handleListNotifications(request, env);
    const notifStatsMatch = route.match(/^\/notifications\/([\w-]+)\/stats$/);
    if (notifStatsMatch && method === 'GET') return handleNotificationStats(request, env);

    // ── Admin Payment Reconciliation routes ──
    if (route === '/payment/reconcile' && method === 'POST') return handlePaymentReconcile(request, env);



    // Non-API routes — let Cloudflare Pages serve static files / SPA fallback
    return undefined as unknown as Response;
  } catch (e: any) {
    return json({ error: e.message || 'Server error' }, { status: 500, headers: getSecurityHeaders() });
  }
};
