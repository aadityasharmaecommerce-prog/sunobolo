import { API } from '@/constants';

/**
 * Phase 2 bridge.
 *
 * Phase 1: services return mock data from localStorage and this module is
 * never invoked. Phase 2: set VITE_USE_REMOTE_API=true and VITE_API_URL to
 * the Cloudflare Worker URL — services switch to `apiFetch` automatically.
 */
export function isRemoteEnabled(): boolean {
  return API.useRemote;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API.baseUrl) {
    throw new Error(
      'API not configured. Set VITE_USE_REMOTE_API=true and VITE_API_URL to your Cloudflare Worker URL.',
    );
  }
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (API.adminToken) {
    headers['Authorization'] = `Bearer ${API.adminToken}`;
  }
  const res = await fetch(`${API.baseUrl}${path}`, { ...init, headers });
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${res.statusText}`);
  }
  const body = (await res.json()) as { ok?: boolean; data?: T; error?: string };
  if (body && typeof body === 'object' && 'data' in body) {
    return body.data as T;
  }
  return body as T;
}

/** Simulates network latency for mock services so loading states are visible. */
export function mockDelay(ms = 350): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
