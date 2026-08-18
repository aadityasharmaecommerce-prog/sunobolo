import type { Env } from './helpers';

type Handler = (ctx: {
  request: Request;
  env: Env;
  params: Record<string, string>;
  url: URL;
}) => Promise<Response> | Response;

interface Route {
  method: string;
  segments: string[];
  handler: Handler;
}

function matchSegments(pattern: string): string[] {
  return pattern.split('/').filter(Boolean);
}

/** Minimal path router supporting `:param` segments. */
export class Router {
  private routes: Route[] = [];

  get(path: string, handler: Handler): void {
    this.add('GET', path, handler);
  }

  post(path: string, handler: Handler): void {
    this.add('POST', path, handler);
  }

  put(path: string, handler: Handler): void {
    this.add('PUT', path, handler);
  }

  delete(path: string, handler: Handler): void {
    this.add('DELETE', path, handler);
  }

  add(method: string, path: string, handler: Handler): void {
    this.routes.push({ method, segments: matchSegments(path), handler });
  }

  async handle(request: Request, env: Env): Promise<Response | null> {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/').filter(Boolean);

    for (const route of this.routes) {
      if (route.method !== request.method) continue;
      if (route.segments.length !== pathSegments.length) continue;

      const params: Record<string, string> = {};
      let matched = true;
      for (let i = 0; i < route.segments.length; i++) {
        const seg = route.segments[i];
        if (seg.startsWith(':')) {
          params[seg.slice(1)] = decodeURIComponent(pathSegments[i]);
        } else if (seg !== pathSegments[i]) {
          matched = false;
          break;
        }
      }
      if (!matched) continue;

      return route.handler({ request, env, params, url });
    }
    return null;
  }
}
