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
 */

interface Env {
  DB: D1Database;
  ENVIRONMENT?: string;
  SESSION_SECRET?: string;
  RAZORPAY_KEY_ID?: string;
  RAZORPAY_KEY_SECRET?: string;
  RAZORPAY_WEBHOOK_SECRET?: string;
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
  APP_BASE_URL?: string;
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

// ── Auth handlers ──

async function handleAuthMe(request: Request, env: Env): Promise<Response> {
  const user = await authenticateUser(request, env);
  if (!user) return json({ user: null, subscription: { active: false } });

  const sub = await getSubscriptionDetails(user.id, env.DB);

  return json({ user, subscription: sub || { active: false } });
}

const PASSWORD_PEPPER = 'sunobolo-2024-pepper';

async function hashPasswordPw(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + PASSWORD_PEPPER);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function handleAuthSignup(request: Request, env: Env): Promise<Response> {
  const body = await request.json<{ name?: string; phone?: string; email?: string; password?: string }>();
  if (!body?.name || !body?.phone || !body?.email || !body?.password) {
    return err('Name, mobile number, email and password are required');
  }
  if (body.password.length < 6) return err('Password must be at least 6 characters');

  const normalizedPhone = normalizePhone(body.phone);
  const lowerEmail = body.email.toLowerCase().trim();

  // Validate phone format (must be +91 followed by 10 digits)
  if (!/^\+91\d{10}$/.test(normalizedPhone)) {
    return err('Please enter a valid 10-digit mobile number');
  }

  // Validate email format
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lowerEmail)) {
    return err('Please enter a valid email address');
  }

  // Check if phone already exists
  const existingPhone = await env.DB.prepare('SELECT id, name FROM users WHERE phone = ?').bind(normalizedPhone).first<{ id: string; name: string }>();
  if (existingPhone) {
    return err('An account with this mobile number already exists. Please login.');
  }

  // Check if email already exists
  const existingEmail = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(lowerEmail).first();
  if (existingEmail) {
    return err('An account with this email already exists. Please login.');
  }

  const id = 'u_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const passwordHash = await hashPasswordPw(body.password);
  const colors = ['sky', 'purple', 'green', 'orange', 'pink'];
  const color = colors[Math.floor(Math.random() * colors.length)];

  await env.DB.prepare(
    `INSERT INTO users (id, name, email, phone, recovery_email, avatar_color, password_hash, last_login_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
  ).bind(id, body.name.trim(), lowerEmail, normalizedPhone, lowerEmail, color, passwordHash).run();

  // One-device: invalidate any existing sessions for this user (shouldn't be any for new signup, but safe)
  await invalidateUserSessions(id, env.DB);

  const sessionToken = crypto.randomUUID();
  const tokenHash = await hashToken(sessionToken, env.SESSION_SECRET || 'default-secret');
  const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
  await env.DB.prepare(
    `INSERT INTO sessions (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)`
  ).bind(crypto.randomUUID(), id, tokenHash, expiresAt).run();

  return new Response(
    JSON.stringify({ user: { id, name: body.name.trim(), email: lowerEmail, phone: normalizedPhone } }),
    {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'access-control-allow-origin': '*',
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
    'SELECT id, name, phone, avatar_color, password_hash FROM users WHERE phone = ?'
  ).bind(normalizedPhone).first<{ id: string; name: string; phone: string; avatar_color: string; password_hash: string | null }>();

  if (!user) {
    await recordLoginAttempt(normalizedPhone, false, env.DB);
    return err('Incorrect mobile number or PIN.', 401);
  }

  if (!user.password_hash) {
    await recordLoginAttempt(normalizedPhone, false, env.DB);
    return err('Incorrect mobile number or PIN.', 401);
  }

  const inputHash = await hashPasswordPw(body.password);
  if (inputHash !== user.password_hash) {
    await recordLoginAttempt(normalizedPhone, false, env.DB);
    return err('Incorrect mobile number or PIN.', 401);
  }

  // Record successful attempt
  await recordLoginAttempt(normalizedPhone, true, env.DB);

  // ONE-DEVICE: Invalidate all previous sessions before creating new one
  await invalidateUserSessions(user.id, env.DB);

  const sessionToken = crypto.randomUUID();
  const tokenHash = await hashToken(sessionToken, env.SESSION_SECRET || 'default-secret');
  const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
  await env.DB.prepare(
    `INSERT INTO sessions (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)`
  ).bind(crypto.randomUUID(), user.id, tokenHash, expiresAt).run();

  await env.DB.prepare(`UPDATE users SET last_login_at = datetime('now') WHERE id = ?`).bind(user.id).run();

  // Get subscription details
  const sub = await getSubscriptionDetails(user.id, env.DB);

  return new Response(
    JSON.stringify({ user: { id: user.id, name: user.name, phone: user.phone, avatar_color: user.avatar_color }, subscription: sub || { active: false } }),
    {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'access-control-allow-origin': '*',
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
  const tokenHash = await hashToken(rawToken, env.SESSION_SECRET || 'reset-secret');

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

  return genericResponse;
}

async function handleResetPassword(request: Request, env: Env): Promise<Response> {
  const body = await request.json<{ token?: string; newPassword?: string }>();
  if (!body?.token || !body?.newPassword) return err('Token and new password required');
  if (body.newPassword.length < 6) return err('Password must be at least 6 characters');

  // Hash the supplied token to match stored hash
  const tokenHash = await hashToken(body.token, env.SESSION_SECRET || 'reset-secret');

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
  const newPasswordHash = await hashPasswordPw(body.newPassword);

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

  return json({ success: true, message: 'Password reset successful. You can now login with your new password.' });
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

  const sub = await getSubscriptionDetails(user.id, env.DB);
  return json(sub || { active: false });
}

async function handleAccess(request: Request, env: Env): Promise<Response> {
  const user = await authenticateUser(request, env);
  if (!user) return json({ hasAccess: false, reason: 'not_logged_in' });
  const subscribed = await autoExpireAndCheckAccess(user.id, env.DB);
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
      await env.DB.prepare(`UPDATE payments SET status = 'failed' WHERE razorpay_order_id = ?`).bind(body.razorpay_order_id).run();
      return err('Payment verification failed', 400);
    }
    await activateSubscription(user.id, body.razorpay_order_id, body.razorpay_payment_id, planId, env.DB);
    return json({ verified: true });
  } catch (e: any) {
    return err('Verification error: ' + e.message, 500);
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
      const subscribed = user ? await autoExpireAndCheckAccess(user.id, env.DB) : false;
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

    if (route === '/auth/signup' && method === 'POST') return handleAuthSignup(request, env);
    if (route === '/auth/login' && method === 'POST') return handleAuthLogin(request, env);
    if (route === '/auth/me' && method === 'GET') return handleAuthMe(request, env);
    if (route === '/auth/logout' && method === 'POST') return handleAuthLogout(request, env);
    if (route === '/auth/forgot-password' && method === 'POST') return handleForgotPassword(request, env);
    if (route === '/auth/reset-password' && method === 'POST') return handleResetPassword(request, env);
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
