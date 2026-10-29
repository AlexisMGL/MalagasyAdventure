import { normalizeUsername } from '../_shared/username.ts';

export interface SignupDependencies {
  publishableKey: string;
  fingerprint(request: Request): Promise<string>;
  consumeLimit(fingerprint: string): Promise<boolean>;
  createUser(username: string, password: string): Promise<'ok' | 'username_taken' | 'weak_password' | 'signup_unavailable'>;
}

const origins = new Set([
  'https://malagasyadventure.netlify.app',
  ...[5174, 4174, 4184].map(port => `http://127.0.0.1:${port}`),
]);

/** Anonymous signup only. This endpoint cannot list, modify or recover another account. */
export function signupHandler(deps: SignupDependencies): (request: Request) => Promise<Response> {
  return async request => {
    const origin = request.headers.get('origin');
    const headers = {
      'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Vary': 'Origin',
      ...(origin && origins.has(origin) ? { 'Access-Control-Allow-Origin': origin } : {}),
      'Access-Control-Allow-Headers': 'apikey, authorization, content-type, x-client-info',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };
    const reply = (status: number, code?: string) => new Response(JSON.stringify(code ? { code } : { ok: true }), { status, headers });
    if (origin && !origins.has(origin)) return reply(403, 'signup_unavailable');
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (request.method !== 'POST') return reply(405, 'signup_unavailable');
    if (request.headers.get('apikey') !== deps.publishableKey) return reply(401, 'signup_unavailable');
    if (!request.headers.get('content-type')?.startsWith('application/json')) return reply(415, 'signup_unavailable');
    try {
      // Read at most 2 KiB, including streamed bodies without Content-Length.
      const reader = request.body?.getReader();
      if (!reader) return reply(400, 'invalid_username');
      const chunks: Uint8Array[] = [];
      let size = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 2048) { await reader.cancel(); return reply(413, 'signup_unavailable'); }
        chunks.push(value);
      }
      const bytes = new Uint8Array(size);
      let offset = 0;
      for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
      let body: unknown;
      try { body = JSON.parse(new TextDecoder().decode(bytes)); }
      catch { return reply(400, 'invalid_username'); }
      if (!body || typeof body !== 'object') return reply(400, 'invalid_username');
      const input = body as Record<string, unknown>;
      let username: string;
      try { username = normalizeUsername(typeof input.username === 'string' ? input.username : ''); }
      catch { return reply(400, 'invalid_username'); }
      if (typeof input.password !== 'string' || input.password.length < 8 || input.password.length > 128) return reply(400, 'weak_password');
      if (!await deps.consumeLimit(await deps.fingerprint(request))) return reply(429, 'rate_limited');
      const result = await deps.createUser(username, input.password);
      return result === 'ok' ? reply(200) : reply(result === 'username_taken' ? 409 : result === 'weak_password' ? 400 : 503, result);
    } catch {
      // Do not log request bodies, credentials, provider errors or tokens.
      return reply(503, 'signup_unavailable');
    }
  };
}
