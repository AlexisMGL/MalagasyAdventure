export interface DeleteDependencies {
  session(token: string): Promise<{ id: string; email: string } | null>;
  password(email: string, password: string, id: string): Promise<boolean>;
  remove(id: string, token: string): Promise<void>;
}
const origins = new Set(['https://malagasyadventure.netlify.app', ...[5174, 4174, 4184].map(port => `http://127.0.0.1:${port}`)]);

/** The target comes only from a verified session, never a body-supplied user ID. */
export function deleteAccountHandler(deps: DeleteDependencies): (request: Request) => Promise<Response> {
  return async request => {
    const origin = request.headers.get('origin');
    const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', Vary: 'Origin',
      ...(origin && origins.has(origin) ? { 'Access-Control-Allow-Origin': origin } : {}),
      'Access-Control-Allow-Headers': 'apikey, authorization, content-type, x-client-info',
      'Access-Control-Allow-Methods': 'POST, OPTIONS' };
    const reply = (status: number, code?: string) => new Response(JSON.stringify(code ? { code } : { ok: true }), { status, headers });
    if (origin && !origins.has(origin)) return reply(403, 'deletion_unavailable');
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (request.method !== 'POST') return reply(405, 'deletion_unavailable');
    const token = request.headers.get('authorization')?.match(/^Bearer (\S+)$/iu)?.[1];
    if (!token) return reply(401, 'login_required');
    if (!request.headers.get('content-type')?.startsWith('application/json')) return reply(415, 'deletion_unavailable');
    try {
      const user = await deps.session(token);
      if (!user) return reply(401, 'login_required');
      const reader = request.body?.getReader();
      if (!reader) return reply(400, 'confirmation_required');
      const chunks: Uint8Array[] = []; let size = 0;
      while (true) {
        const { done, value } = await reader.read(); if (done) break;
        size += value.byteLength;
        if (size > 2048) { await reader.cancel(); return reply(413, 'deletion_unavailable'); }
        chunks.push(value);
      }
      const bytes = new Uint8Array(size); let offset = 0;
      for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
      let body: { password?: unknown; confirmation?: unknown };
      try { body = JSON.parse(new TextDecoder().decode(bytes)); } catch { return reply(400, 'confirmation_required'); }
      if (!body || body.confirmation !== 'SUPPRIMER' || typeof body.password !== 'string' || !body.password.length || body.password.length > 128) return reply(400, 'confirmation_required');
      if (!await deps.password(user.email, body.password, user.id)) return reply(401, 'incorrect_password');
      await deps.remove(user.id, token);
      return reply(200);
    } catch { return reply(503, 'deletion_unavailable'); }
  };
}
