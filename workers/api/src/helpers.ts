/**
 * Shared helpers for the SunoBolo API Worker.
 */

export interface Env {
  DB: D1Database;
  ADMIN_TOKEN: string;
  APP_NAME: string;
  ENVIRONMENT: string;
}

export function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Id',
    'Access-Control-Max-Age': '86400',
    'Cache-Control': 'no-store',
  };
}

export function json(data: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders(),
      ...extraHeaders,
    },
  });
}

export function apiError(status: number, message: string): Response {
  return json({ ok: false, error: message }, status);
}

/** Validates the Bearer token for admin endpoints (server-side protection). */
export function isAdminAuthorized(request: Request, env: Env): boolean {
  if (!env.ADMIN_TOKEN) return false;
  const auth = request.headers.get('Authorization') ?? '';
  return auth === `Bearer ${env.ADMIN_TOKEN}`;
}

export function notFound(message = 'Not found'): Response {
  return apiError(404, message);
}

/** Reads a JSON body safely, returning null on malformed input. */
export async function readJson<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}
