import { afterEach, describe, expect, it, vi } from 'vitest';
import { CloudProgressSync, type CloudSnapshot, type CloudSyncState, type CloudTransport } from '../src/malagasy/cloud-sync';
import { createProgress } from '../src/malagasy/engine';
import type { Content, Progress } from '../src/malagasy/types';

const content: Content = { worlds: [], units: [], lessons: [], exercises: [], concepts: [], vocabulary: [], sources: [], audio: [] };
const progress = (xp = 0): Progress => ({ ...createProgress('2026-10-28T12:00:00.000Z'), xp });
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
function setup(remote: CloudSnapshot | null = null) {
  let row = remote;
  const transport: CloudTransport = {
    get: vi.fn(async () => row),
    put: vi.fn(async (value, expected) => {
      if ((row?.revision ?? null) !== expected) return null;
      row = { progress: structuredClone(value), revision: (row?.revision ?? 0) + 1 };
      return { revision: row.revision };
    }),
  };
  const states: CloudSyncState[] = [], received: Progress[] = [];
  const sync = new CloudProgressSync({ transport, content, debounceMs: 50,
    onState: state => states.push(state), onRemote: value => received.push(value) });
  return { sync, transport, states, received, row: () => row, setRow: (value: CloudSnapshot | null) => { row = value; } };
}
afterEach(() => { vi.useRealTimers(); });

describe('account progress synchronization', () => {
  it('creates the first cloud snapshot and coalesces consecutive answers', async () => {
    vi.useFakeTimers();
    const ctx = setup();
    await ctx.sync.connect(progress(4));
    expect(ctx.row()).toEqual({ progress: progress(4), revision: 1 });
    ctx.sync.save(progress(5)); ctx.sync.save(progress(6));
    await vi.advanceTimersByTimeAsync(50);
    expect(ctx.row()).toEqual({ progress: progress(6), revision: 2 });
    expect(ctx.transport.put).toHaveBeenCalledTimes(2);
    expect(ctx.states.at(-1)?.status).toBe('saved');
    ctx.sync.stop();
  });

  it('restores the account on a fresh device and validates it before accepting it', async () => {
    const ctx = setup({ progress: progress(8), revision: 3 });
    await ctx.sync.connect(progress());
    expect(ctx.received).toEqual([progress(8)]);
    expect(ctx.transport.put).not.toHaveBeenCalled();
    expect(ctx.states.at(-1)?.status).toBe('saved');
    ctx.sync.stop();
    const invalid = setup({ progress: { schemaVersion: 1, xp: 999 }, revision: 1 });
    await invalid.sync.connect(progress());
    expect(invalid.received).toEqual([]);
    expect(invalid.transport.put).not.toHaveBeenCalled();
    expect(invalid.states.at(-1)?.status).toBe('offline');
    invalid.sync.stop();
  });

  it('compares JSONB values independently of object property order', async () => {
    const reordered = Object.fromEntries(Object.entries(progress(8)).reverse());
    const ctx = setup({ progress: reordered, revision: 3 });
    await ctx.sync.connect(progress(8));
    expect(ctx.states.at(-1)?.status).toBe('saved');
    expect(ctx.transport.put).not.toHaveBeenCalled();
    ctx.sync.stop();
  });

  it('asks which divergent snapshot to retain and preserves the latest local choice', async () => {
    const ctx = setup({ progress: progress(8), revision: 3 });
    await ctx.sync.connect(progress(4));
    expect(ctx.states.at(-1)).toEqual({ status: 'conflict', conflict: { local: progress(4), remote: progress(8) } });
    expect(ctx.transport.put).not.toHaveBeenCalled();
    ctx.sync.save(progress(5));
    expect(ctx.states.at(-1)?.conflict?.local.xp).toBe(5);
    await ctx.sync.resolve('local');
    expect(ctx.transport.put).toHaveBeenCalledWith(progress(5), 3);
    expect(ctx.row()?.progress).toEqual(progress(5));
    expect(ctx.received).toEqual([]);
    ctx.sync.stop();
  });

  it('loads the cloud snapshot only after an explicit cloud choice', async () => {
    const ctx = setup({ progress: progress(8), revision: 3 });
    await ctx.sync.connect(progress(4));
    await ctx.sync.resolve('cloud');
    expect(ctx.received).toEqual([progress(8)]);
    expect(ctx.transport.put).not.toHaveBeenCalled();
    expect(ctx.states.at(-1)?.status).toBe('saved');
    ctx.sync.stop();
  });

  it('does not replace answers made while the initial cloud read was pending', async () => {
    const request = deferred<CloudSnapshot | null>(), ctx = setup();
    vi.mocked(ctx.transport.get).mockReturnValueOnce(request.promise);
    const connecting = ctx.sync.connect(progress());
    ctx.sync.save(progress(7));
    request.resolve({ progress: progress(9), revision: 1 });
    await connecting;
    expect(ctx.received).toEqual([]);
    expect(ctx.states.at(-1)?.conflict).toEqual({ local: progress(7), remote: progress(9) });
    ctx.sync.stop();
  });

  it('serializes writes and sends the latest answer after an in-flight save', async () => {
    vi.useFakeTimers();
    const ctx = setup();
    await ctx.sync.connect(progress(1));
    const writing = deferred<{ revision: number } | null>();
    vi.mocked(ctx.transport.put).mockReturnValueOnce(writing.promise);
    ctx.sync.save(progress(2));
    await vi.advanceTimersByTimeAsync(50);
    ctx.sync.save(progress(3));
    await vi.advanceTimersByTimeAsync(50);
    expect(ctx.transport.put).toHaveBeenCalledTimes(2);
    ctx.setRow({ progress: progress(2), revision: 2 });
    writing.resolve({ revision: 2 });
    await Promise.resolve(); await Promise.resolve(); await Promise.resolve();
    await vi.advanceTimersByTimeAsync(50);
    expect(ctx.transport.put).toHaveBeenLastCalledWith(progress(3), 2);
    expect(ctx.row()).toEqual({ progress: progress(3), revision: 3 });
    ctx.sync.stop();
  });

  it('re-reads a concurrent cloud write and never overwrites it silently', async () => {
    vi.useFakeTimers();
    const ctx = setup();
    await ctx.sync.connect(progress(1));
    ctx.setRow({ progress: progress(8), revision: 2 });
    ctx.sync.save(progress(2));
    await vi.advanceTimersByTimeAsync(50);
    expect(ctx.states.at(-1)?.conflict).toEqual({ local: progress(2), remote: progress(8) });
    expect(ctx.row()?.progress).toEqual(progress(8));
    // Even a conflict choice must not overwrite an intervening update.
    ctx.setRow({ progress: progress(9), revision: 3 });
    await ctx.sync.resolve('local');
    expect(ctx.row()?.progress).toEqual(progress(9));
    expect(ctx.states.at(-1)?.conflict?.remote.xp).toBe(9);
    ctx.sync.stop();
  });

  it('retains unsent progress offline and retries against the last acknowledged revision', async () => {
    vi.useFakeTimers();
    const ctx = setup();
    await ctx.sync.connect(progress(1));
    vi.mocked(ctx.transport.put).mockRejectedValueOnce(new Error('offline'));
    ctx.sync.save(progress(2));
    await vi.advanceTimersByTimeAsync(50);
    expect(ctx.states.at(-1)?.status).toBe('offline');
    ctx.sync.save(progress(3));
    await ctx.sync.retry();
    expect(ctx.row()).toEqual({ progress: progress(3), revision: 2 });
    expect(ctx.states.at(-1)?.status).toBe('saved');
    ctx.sync.stop();
  });

  it('recognizes an acknowledged remote write after its response was lost', async () => {
    vi.useFakeTimers();
    const ctx = setup();
    await ctx.sync.connect(progress(1));
    vi.mocked(ctx.transport.put).mockImplementationOnce(async value => {
      ctx.setRow({ progress: value, revision: 2 });
      throw new Error('response lost');
    });
    ctx.sync.save(progress(2));
    await vi.advanceTimersByTimeAsync(50);
    await ctx.sync.retry();
    expect(ctx.states.at(-1)?.status).toBe('saved');
    expect(ctx.transport.put).toHaveBeenCalledTimes(2);
    ctx.sync.stop();
  });

  it('recreates a missing cloud row instead of reporting a false successful save', async () => {
    const ctx = setup();
    await ctx.sync.connect(progress(4));
    ctx.setRow(null);
    await ctx.sync.retry();
    expect(ctx.row()).toEqual({ progress: progress(4), revision: 1 });
    expect(ctx.transport.put).toHaveBeenCalledTimes(2);
    ctx.sync.stop();
  });

  it('ignores pending reads and cancels delayed saves after account logout', async () => {
    vi.useFakeTimers();
    const request = deferred<CloudSnapshot | null>(), ctx = setup();
    vi.mocked(ctx.transport.get).mockReturnValueOnce(request.promise);
    const connecting = ctx.sync.connect(progress());
    const previousStates = ctx.states.length;
    ctx.sync.stop();
    request.resolve({ progress: progress(9), revision: 1 });
    await connecting;
    ctx.sync.save(progress(2)); await ctx.sync.retry();
    await vi.advanceTimersByTimeAsync(1000);
    expect(ctx.received).toEqual([]);
    expect(ctx.states).toHaveLength(previousStates);
    expect(ctx.transport.put).not.toHaveBeenCalled();
    const delayed = setup();
    await delayed.sync.connect(progress(1));
    delayed.sync.save(progress(2)); delayed.sync.stop();
    await vi.advanceTimersByTimeAsync(1000);
    expect(delayed.transport.put).toHaveBeenCalledTimes(1);
  });

  it('keeps cloud and local state isolated from caller mutation', async () => {
    const local = progress(4), ctx = setup({ progress: progress(8), revision: 1 });
    await ctx.sync.connect(local);
    local.xp = 777;
    ctx.states.at(-1)!.conflict!.local.xp = 555;
    await ctx.sync.resolve('local');
    expect(ctx.row()?.progress).toEqual(progress(4));
    ctx.sync.stop();
  });
});
