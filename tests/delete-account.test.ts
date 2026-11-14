import { describe, expect, it, vi } from 'vitest';
import { deleteAccountHandler, type DeleteDependencies } from '../supabase/functions/delete-account/handler';
function setup() {
  const deps: DeleteDependencies = { session: vi.fn(async () => ({ id: 'verified-user', email: 'user@example.test' })), password: vi.fn(async () => true), remove: vi.fn(async () => {}) };
  const handle = deleteAccountHandler(deps);
  const request = (body: unknown = { password: 'current-password', confirmation: 'SUPPRIMER' }, headers: Record<string, string> = {}) => new Request('https://example.test/delete-account', { method: 'POST', headers: { authorization: 'Bearer session-token', 'content-type': 'application/json', origin: 'https://malagasyadventure.netlify.app', ...headers }, body: JSON.stringify(body) });
  return { deps, handle, request };
}
describe('Account deletion boundary', () => {
  it('deletes only the verified session owner after password confirmation and exposes no credentials', async () => {
    const { deps, handle, request } = setup();
    const response = await handle(request({ password: 'current-password', confirmation: 'SUPPRIMER', user_id: 'someone-else', email: 'another@example.test' }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(deps.password).toHaveBeenCalledWith('user@example.test', 'current-password', 'verified-user');
    expect(deps.remove).toHaveBeenCalledExactlyOnceWith('verified-user', 'session-token');
    expect(response.headers.get('cache-control')).toBe('no-store');
  });
  it('does not delete with a missing token, invalid session, wrong password or unchecked confirmation', async () => {
    for (const kind of ['missing', 'invalid', 'password', 'confirmation']) {
      const { deps, handle, request } = setup();
      if (kind === 'invalid') vi.mocked(deps.session).mockResolvedValue(null);
      if (kind === 'password') vi.mocked(deps.password).mockResolvedValue(false);
      const response = await handle(request({ password: 'current-password', confirmation: kind === 'confirmation' ? '' : 'SUPPRIMER' }, kind === 'missing' ? { authorization: '' } : {}));
      expect(response.status).toBe(kind === 'confirmation' ? 400 : 401);
      expect(deps.remove).not.toHaveBeenCalled();
    }
  });
  it('rejects other origins, methods and oversized bodies without deleting', async () => {
    const { deps, handle, request } = setup();
    expect((await handle(request({}, { origin: 'https://other.example' }))).status).toBe(403);
    expect((await handle(new Request('https://example.test/delete-account'))).status).toBe(405);
    expect((await handle(request({ password: 'x'.repeat(3000) }))).status).toBe(413);
    expect(deps.remove).not.toHaveBeenCalled();
  });
  it('fails closed when revocation or deletion is unavailable without revealing server details', async () => {
    const { deps, handle, request } = setup();
    vi.mocked(deps.remove).mockRejectedValue(Error('private server detail'));
    const response = await handle(request());
    expect(response.status).toBe(503); expect(await response.json()).toEqual({ code: 'deletion_unavailable' });
  });
});
