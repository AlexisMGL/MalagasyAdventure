import { describe, expect, it, vi } from 'vitest';
import { createProgress } from '../src/malagasy/engine';
import { loadAccountProgress, loadProgress, RECOVERY_KEY, SAVE_KEY, saveAccountProgress, saveProgress,
  serializeSave, type SaveStorage } from '../src/malagasy/storage';
import type { Content } from '../src/malagasy/types';

const ALICE = '11111111-1111-4111-8111-111111111111';
const BOB = '22222222-2222-4222-8222-222222222222';
const NOW = '2026-10-28T12:00:00.000Z';
const key = (userId: string) => `${SAVE_KEY}.account.${userId}`;
function store() {
  const values = new Map<string, string>();
  const storage: SaveStorage = { getItem: vi.fn(item => values.get(item) ?? null),
    setItem: vi.fn((item, value) => { values.set(item, value); }) };
  return { values, storage };
}

describe('separate local account caches', () => {
  it('preserves the guest save and isolates two accounts', () => {
    const ctx = store(), guest = { ...createProgress(NOW), xp: 3 }, alice = { ...guest, xp: 7 }, bob = { ...guest, xp: 11 };
    expect(saveProgress(guest, ctx.storage)).toBe(true);
    expect(loadAccountProgress(ALICE, undefined, ctx.storage)).toBeNull();
    expect(saveAccountProgress(alice, ALICE, ctx.storage)).toBe(true);
    expect(saveAccountProgress(bob, BOB, ctx.storage)).toBe(true);
    expect(loadProgress(undefined, ctx.storage).progress).toEqual(guest);
    expect(loadAccountProgress(ALICE, undefined, ctx.storage)).toEqual(alice);
    expect(loadAccountProgress(BOB, undefined, ctx.storage)).toEqual(bob);
    expect(ctx.values.get(SAVE_KEY)).toBe(serializeSave(guest));
    expect(ctx.values.size).toBe(3);
  });

  it('normalizes UUID case and rejects malformed account IDs before accessing storage', () => {
    const ctx = store(), uuid = 'abcdef01-2345-4678-9abc-def012345678', progress = createProgress(NOW);
    saveAccountProgress(progress, uuid.toUpperCase(), ctx.storage);
    expect(loadAccountProgress(uuid, undefined, ctx.storage)).toEqual(progress);
    expect(ctx.values.has(key(uuid))).toBe(true);
    vi.mocked(ctx.storage.getItem).mockClear();
    vi.mocked(ctx.storage.setItem).mockClear();
    for (const malformed of ['', 'guest', ALICE + '.recovery', '../../' + ALICE, ' ' + ALICE, '__proto__']) {
      expect(loadAccountProgress(malformed, undefined, ctx.storage)).toBeNull();
      expect(saveAccountProgress(progress, malformed, ctx.storage)).toBe(false);
    }
    expect(ctx.storage.getItem).not.toHaveBeenCalled();
    expect(ctx.storage.setItem).not.toHaveBeenCalled();
  });

  it('preserves the first corrupt account cache in its own recovery key', () => {
    const ctx = store();
    ctx.values.set(SAVE_KEY, serializeSave(createProgress(NOW)));
    ctx.values.set(RECOVERY_KEY, 'guest recovery');
    ctx.values.set(key(ALICE), '{ account interrupted');
    ctx.values.set(key(BOB), '{ another account interrupted');
    expect(loadAccountProgress(ALICE, undefined, ctx.storage)).toBeNull();
    expect(loadAccountProgress(BOB, undefined, ctx.storage)).toBeNull();
    expect(ctx.values.get(`${key(ALICE)}.recovery`)).toBe('{ account interrupted');
    expect(ctx.values.get(`${key(BOB)}.recovery`)).toBe('{ another account interrupted');
    ctx.values.set(key(ALICE), 'different broken save');
    expect(loadAccountProgress(ALICE, undefined, ctx.storage)).toBeNull();
    expect(ctx.values.get(`${key(ALICE)}.recovery`)).toBe('{ account interrupted');
    expect(ctx.values.get(RECOVERY_KEY)).toBe('guest recovery');
    expect(loadProgress(undefined, ctx.storage).progress).toEqual(createProgress(NOW));
    expect(saveAccountProgress(createProgress(NOW), ALICE, ctx.storage)).toBe(true);
    expect(loadAccountProgress(ALICE, undefined, ctx.storage)).toEqual(createProgress(NOW));
    expect(ctx.values.get(`${key(ALICE)}.recovery`)).toBe('{ account interrupted');
  });

  it('validates cache content and returns null for unavailable or oversized stores', () => {
    const ctx = store();
    const content: Content = { worlds: [], units: [], lessons: [], exercises: [], concepts: [], vocabulary: [], sources: [], audio: [] };
    ctx.values.set(key(ALICE), serializeSave({ ...createProgress(NOW), completedLessons: ['unknown'] }));
    expect(loadAccountProgress(ALICE, content, ctx.storage)).toBeNull();
    expect(ctx.values.has(`${key(ALICE)}.recovery`)).toBe(true);
    ctx.values.set(key(BOB), 'x'.repeat(2_000_001));
    expect(loadAccountProgress(BOB, content, ctx.storage)).toBeNull();
    expect(ctx.values.has(`${key(BOB)}.recovery`)).toBe(false);
    const unavailable: SaveStorage = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } };
    expect(loadAccountProgress(ALICE, content, unavailable)).toBeNull();
    expect(saveAccountProgress(createProgress(NOW), ALICE, unavailable)).toBe(false);
  });
});
