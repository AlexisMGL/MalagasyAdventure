import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FunctionsHttpError, type AuthChangeEvent, type Session } from '@supabase/supabase-js';
import { MalagasyAccount } from '../src/malagasy/account';
import { createProgress } from '../src/malagasy/engine';
import { loadAccountProgress, loadProgress, saveAccountProgress, saveProgress, SAVE_KEY, serializeSave } from '../src/malagasy/storage';
import { supabase, cloudTransport, authErrorMessage } from '../src/malagasy/supabase';
import type { CloudSnapshot, CloudTransport } from '../src/malagasy/cloud-sync';
import type { Progress } from '../src/malagasy/types';
import { usernameEmail } from '../src/malagasy/account-identity';

vi.mock('../src/malagasy/supabase', () => ({
  supabase: { auth: { onAuthStateChange: vi.fn(), signOut: vi.fn(), signInWithPassword: vi.fn(), updateUser: vi.fn() }, functions: { invoke: vi.fn() } },
  cloudTransport: vi.fn(), authErrorMessage: vi.fn(() => 'Erreur de connexion.'),
}));

const ALICE = '11111111-1111-4111-8111-111111111111';
const BOB = '22222222-2222-4222-8222-222222222222';
const NOW = '2026-10-28T12:00:00.000Z';
const progress = (xp: number): Progress => ({ ...createProgress(NOW), xp });
const session = (id: string): Session => ({ user: { id, email: `${id === ALICE ? 'alice' : 'bob'}@example.test` } } as Session);

function setup(initial = progress(3), blockedStorage = false) {
  let current = initial;
  const values = new Map<string, string>([[SAVE_KEY, serializeSave(progress(3))]]);
  const storage = {
    getItem: vi.fn((key: string) => {
      if (blockedStorage) throw new Error('Storage denied');
      return values.get(key) ?? null;
    }),
    setItem: vi.fn((key: string, value: string) => {
      if (blockedStorage) throw new Error('Storage denied');
      values.set(key, value);
    }),
  };
  vi.stubGlobal('localStorage', storage);
  vi.stubGlobal('location', new URL('https://malagasyadventure.netlify.app/malagasy-adventure#account'));
  vi.stubGlobal('history', { replaceState: vi.fn() });
  vi.stubGlobal('window', { setTimeout, addEventListener: vi.fn() });
  vi.stubGlobal('document', { hidden: false, addEventListener: vi.fn() });

  let listener!: (event: AuthChangeEvent, value: Session | null) => void | Promise<void>;
  vi.mocked(supabase!.auth.onAuthStateChange).mockImplementation(callback => {
    listener = callback;
    return { data: { subscription: { id: 'account-test', callback, unsubscribe: vi.fn() } } };
  });
  const rows = new Map<string, CloudSnapshot>();
  const transports = new Map<string, CloudTransport>();
  vi.mocked(cloudTransport).mockImplementation((_client, userId) => {
    const transport: CloudTransport = {
      get: vi.fn(async () => rows.get(userId) ?? null),
      put: vi.fn(async (value, expected) => {
        const previous = rows.get(userId);
        if ((previous?.revision ?? null) !== expected) return null;
        const revision = (previous?.revision ?? 0) + 1;
        rows.set(userId, { progress: structuredClone(value), revision });
        return { revision };
      }),
    };
    transports.set(userId, transport);
    return transport;
  });
  const onProgress = vi.fn((value: Progress) => { current = value; });
  const onChange = vi.fn(), onOpen = vi.fn();
  const account = new MalagasyAccount({ getProgress: () => current, onProgress, onChange, onOpen });
  account.start();
  return {
    account, values, storage, rows, transports, onProgress, onChange, onOpen,
    current: () => current,
    emit: (event: AuthChangeEvent, value: Session | null) => listener(event, value),
    practice(xp: number) {
      current = progress(xp);
      if (account.userId) saveAccountProgress(current, account.userId);
      else saveProgress(current);
      account.save(current);
    },
  };
}

beforeEach(() => { vi.useFakeTimers(); vi.clearAllMocks(); });
afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); vi.unstubAllGlobals(); });

describe('account controller session boundaries', () => {
  it('ignores a queued SIGNED_IN after a later SIGNED_OUT', async () => {
    const ctx = setup();
    ctx.emit('SIGNED_IN', session(ALICE));
    ctx.emit('SIGNED_OUT', null);
    await vi.advanceTimersByTimeAsync(1);
    expect(ctx.account.userId).toBeNull();
    expect(ctx.account.state.email).toBeNull();
    expect(ctx.current()).toEqual(progress(3));
    expect(cloudTransport).not.toHaveBeenCalled();
  });

  it('only connects the newest account when two sign-ins are queued', async () => {
    const ctx = setup();
    ctx.emit('SIGNED_IN', session(ALICE));
    ctx.emit('SIGNED_IN', session(BOB));
    await vi.advanceTimersByTimeAsync(1);
    expect(ctx.account.userId).toBe(BOB);
    expect(ctx.rows.has(ALICE)).toBe(false);
    expect(ctx.rows.get(BOB)?.progress).toEqual(progress(3));
    expect(cloudTransport).toHaveBeenCalledTimes(1);
  });

  it.each([false, true])('carries the current guest progress into login with blocked storage=%s', async blocked => {
    const ctx = setup(progress(27), blocked);
    ctx.emit('SIGNED_IN', session(ALICE));
    await vi.advanceTimersByTimeAsync(1);
    expect(ctx.current()).toEqual(progress(27));
    expect(ctx.rows.get(ALICE)?.progress).toEqual(progress(27));
    ctx.emit('SIGNED_OUT', null);
    expect(ctx.current()).toEqual(progress(27));
    expect(ctx.values.get(SAVE_KEY)).toBe(serializeSave(progress(3)));
  });

  it('keeps guest, Alice and Bob progress separate through account switches', async () => {
    const ctx = setup();
    saveAccountProgress(progress(17), ALICE);
    saveAccountProgress(progress(29), BOB);
    ctx.emit('SIGNED_IN', session(ALICE));
    await vi.advanceTimersByTimeAsync(1);
    expect(ctx.current()).toEqual(progress(17));
    ctx.practice(21);
    await vi.advanceTimersByTimeAsync(501);
    ctx.emit('SIGNED_IN', session(BOB));
    await vi.advanceTimersByTimeAsync(1);
    expect(ctx.current()).toEqual(progress(29));
    expect(ctx.rows.get(ALICE)?.progress).toEqual(progress(21));
    expect(ctx.rows.get(BOB)?.progress).toEqual(progress(29));
    ctx.practice(31);
    ctx.emit('SIGNED_OUT', null);
    expect(ctx.current()).toEqual(progress(3));
    expect(loadProgress().progress).toEqual(progress(3));
    expect(loadAccountProgress(ALICE)).toEqual(progress(21));
    expect(loadAccountProgress(BOB)).toEqual(progress(31));
    ctx.emit('SIGNED_IN', session(ALICE));
    await vi.advanceTimersByTimeAsync(1);
    expect(ctx.current()).toEqual(progress(21));
  });

  it('opens password recovery and preserves it across the initial session event', async () => {
    const ctx = setup();
    ctx.emit('PASSWORD_RECOVERY', session(ALICE));
    expect(ctx.account.state.mode).toBe('reset');
    expect(ctx.onOpen).toHaveBeenCalledTimes(1);
    ctx.emit('INITIAL_SESSION', session(ALICE));
    await vi.advanceTimersByTimeAsync(1);
    expect(ctx.account.userId).toBe(ALICE);
    expect(ctx.account.state.mode).toBe('reset');
    expect(ctx.account.state.error).toBe(false);
    ctx.emit('SIGNED_OUT', null);
    expect(ctx.account.state.mode).toBe('login');
  });

  it('cancels a pending password recovery when the session is signed out', async () => {
    const ctx = setup();
    ctx.emit('PASSWORD_RECOVERY', session(ALICE));
    ctx.emit('SIGNED_OUT', null);
    await vi.advanceTimersByTimeAsync(1);
    expect(ctx.account.userId).toBeNull();
    expect(ctx.account.state.mode).toBe('login');
    expect(cloudTransport).not.toHaveBeenCalled();
  });
});

function accountForm(identifier: string, password = 'Test!Password123', passwordConfirm?: string): HTMLFormElement {
  const fields = new Map<string, string>([['identifier', identifier], ['password', password]]);
  if (passwordConfirm !== undefined) fields.set('passwordConfirm', passwordConfirm);
  vi.stubGlobal('FormData', class { get(key: string) { return fields.get(key) ?? null; } });
  return {} as HTMLFormElement;
}

describe('username account submission', () => {
  it.each(['signup', 'reset'] as const)('rejects an out-of-range new password in %s before calling the server', async mode => {
    const ctx = setup();
    ctx.account.setMode(mode);
    for (const password of ['1234567', 'x'.repeat(129)]) {
      await ctx.account.submit(accountForm('mia_42', password, password));
      expect(ctx.account.state.message).toBe('Choisissez un mot de passe de 8 à 128 caractères.');
      expect(ctx.account.state.error).toBe(true);
    }
    expect(supabase!.functions.invoke).not.toHaveBeenCalled();
    expect(supabase!.auth.updateUser).not.toHaveBeenCalled();
  });

  it('creates a session with only an identifier and password, without mail redirects', async () => {
    const ctx = setup();
    ctx.account.setMode('signup');
    const email = usernameEmail('mia_42');
    vi.mocked(supabase!.functions.invoke).mockResolvedValue({ data: { ok: true }, error: null });
    vi.mocked(supabase!.auth.signInWithPassword).mockResolvedValue({ data: { user: session(ALICE).user, session: { ...session(ALICE), user: { ...session(ALICE).user, email } } }, error: null });
    await ctx.account.submit(accountForm(' Mia_42 '));
    expect(supabase!.functions.invoke).toHaveBeenCalledWith('username-signup', { body: { username: 'mia_42', password: 'Test!Password123' } });
    expect(supabase!.auth.signInWithPassword).toHaveBeenCalledWith({ email, password: 'Test!Password123' });
    expect(ctx.account.userId).toBe(ALICE);
    expect(ctx.account.state.email).toBe('mia_42');
    expect(ctx.account.state.message).toBe('Votre compte est prêt.');
    expect(ctx.account.state.error).toBe(false);
  });

  it('uses the same alias for mixed-case username login and keeps old email login', async () => {
    const ctx = setup();
    vi.mocked(supabase!.auth.signInWithPassword).mockResolvedValue({ data: { user: session(ALICE).user, session: session(ALICE) }, error: null });
    await ctx.account.submit(accountForm('MiA_42'));
    expect(supabase!.auth.signInWithPassword).toHaveBeenLastCalledWith({ email: usernameEmail('mia_42'), password: 'Test!Password123' });
    await ctx.account.submit(accountForm('Alice@Example.test'));
    expect(supabase!.auth.signInWithPassword).toHaveBeenLastCalledWith({ email: 'alice@example.test', password: 'Test!Password123' });
  });

  it('rejects real email signup and malformed names before calling Auth', async () => {
    const ctx = setup();
    ctx.account.setMode('signup');
    await ctx.account.submit(accountForm('alice@example.test'));
    expect(supabase!.functions.invoke).not.toHaveBeenCalled();
    expect(ctx.account.state.error).toBe(true);
    expect(ctx.account.userId).toBeNull();
  });

  it('does not promise an email or lose the guest save if account creation fails', async () => {
    const ctx = setup(progress(27));
    ctx.account.setMode('signup');
    vi.mocked(supabase!.functions.invoke).mockResolvedValue({ data: null, error: null });
    await ctx.account.submit(accountForm('mia_42'));
    expect(ctx.account.state.error).toBe(true);
    expect(ctx.account.state.message).not.toMatch(/mail|confirm/);
    expect(ctx.account.userId).toBeNull();
    expect(ctx.current()).toEqual(progress(27));
  });

  it('reads the endpoint error code and never logs in after a rejected signup', async () => {
    const ctx = setup();
    ctx.account.setMode('signup');
    const response = new Response(JSON.stringify({ code: 'username_taken', message: 'ignored' }), { status: 409 });
    vi.mocked(supabase!.functions.invoke).mockResolvedValue({ data: null, error: new FunctionsHttpError(response) });
    await ctx.account.submit(accountForm('mia_42'));
    expect(ctx.account.state.error).toBe(true);
    expect(authErrorMessage).toHaveBeenLastCalledWith({ code: 'username_taken' });
    expect(supabase!.auth.signInWithPassword).not.toHaveBeenCalled();
    expect(ctx.account.userId).toBeNull();
  });
});
