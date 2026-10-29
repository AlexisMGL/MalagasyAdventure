import { describe, expect, it, vi } from 'vitest';
import { signupHandler, type SignupDependencies } from '../supabase/functions/username-signup/handler';

function setup() {
  const deps: SignupDependencies = {
    publishableKey: 'public-key', fingerprint: vi.fn(async () => 'abc'),
    consumeLimit: vi.fn(async () => true), createUser: vi.fn(async () => 'ok' as const),
  };
  const handle = signupHandler(deps);
  const request = (body: unknown = { username: '  Mia_12 ', password: 'a-secure-password' }, headers: Record<string, string> = {}) => new Request('https://example.test/username-signup', {
    method: 'POST', headers: { apikey: 'public-key', 'Content-Type': 'application/json', Origin: 'https://malagasyadventure.netlify.app', ...headers }, body: JSON.stringify(body),
  });
  return { deps, handle, request };
}
describe('username signup server boundary', () => {
  it('normalizes username and forwards only identity/password, returning no credentials', async () => {
    const { deps, handle, request } = setup();
    const result = await handle(request({ username: '  Mia_12 ', password: 'a-secure-password', email: 'attacker@example.org', admin: true }));
    expect(result.status).toBe(200);
    expect(await result.json()).toEqual({ ok: true });
    expect(deps.createUser).toHaveBeenCalledExactlyOnceWith('mia_12', 'a-secure-password');
    expect(result.headers.get('Cache-Control')).toBe('no-store');
  });
  it.each(['new@example.org', 'étoile', 'ab', 'x'.repeat(25), 'admin/name'])('rejects invalid username %s before quota or Auth', async username => {
    const { deps, handle, request } = setup();
    const result = await handle(request({ username, password: 'a-secure-password' }));
    expect(result.status).toBe(400);
    expect(await result.json()).toEqual({ code: 'invalid_username' });
    expect(deps.consumeLimit).not.toHaveBeenCalled();
    expect(deps.createUser).not.toHaveBeenCalled();
  });
  it.each(['short', 'x'.repeat(129), null])('rejects invalid password without creating an account', async password => {
    const { deps, handle, request } = setup();
    expect((await handle(request({ username: 'mia_12', password }))).status).toBe(400);
    expect(deps.createUser).not.toHaveBeenCalled();
  });
  it('fails closed when quota is denied or unavailable', async () => {
    const { deps, handle, request } = setup();
    vi.mocked(deps.consumeLimit).mockResolvedValueOnce(false).mockRejectedValueOnce(new Error('private details'));
    const limited = await handle(request());
    expect(limited.status).toBe(429);
    expect(await limited.json()).toEqual({ code: 'rate_limited' });
    const unavailable = await handle(request());
    expect(unavailable.status).toBe(503);
    expect(await unavailable.text()).not.toContain('private');
    expect(deps.createUser).not.toHaveBeenCalled();
  });
  it('rejects unexpected origin/key and oversized or malformed input', async () => {
    const { deps, handle, request } = setup();
    expect((await handle(request(undefined, { Origin: 'https://other.test' }))).status).toBe(403);
    expect((await handle(request(undefined, { apikey: 'other-key' }))).status).toBe(401);
    expect((await handle(request({ username: 'mia', password: 'x'.repeat(3000) }))).status).toBe(413);
    expect((await handle(new Request('https://example.test', { method: 'POST', headers: { apikey: 'public-key', 'Content-Type': 'application/json' }, body: '{broken' }))).status).toBe(400);
    expect(deps.createUser).not.toHaveBeenCalled();
  });
  it('gives a stable conflict without returning provider details', async () => {
    const { deps, handle, request } = setup();
    vi.mocked(deps.createUser).mockResolvedValue('username_taken');
    const result = await handle(request());
    expect(result.status).toBe(409);
    expect(await result.json()).toEqual({ code: 'username_taken' });
  });
  it('answers browser preflight without calling Auth', async () => {
    const { deps, handle } = setup();
    const result = await handle(new Request('https://example.test', { method: 'OPTIONS', headers: { origin: 'https://malagasyadventure.netlify.app' } }));
    expect(result.status).toBe(204);
    expect(result.headers.get('Access-Control-Allow-Origin')).toBe('https://malagasyadventure.netlify.app');
    expect(deps.createUser).not.toHaveBeenCalled();
  });
});
