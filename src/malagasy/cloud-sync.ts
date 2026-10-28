import { parseSave } from './storage';
import type { Content, Progress } from './types';

export interface CloudSnapshot { progress: unknown; revision: number }
export interface CloudTransport {
  get(): Promise<CloudSnapshot | null>;
  /** null means that another device changed the revision. */
  put(progress: Progress, expectedRevision: number | null): Promise<{ revision: number } | null>;
}
export interface CloudSyncState {
  status: 'loading' | 'saved' | 'saving' | 'offline' | 'conflict';
  conflict?: { local: Progress; remote: Progress };
  message?: string;
}
interface Options {
  transport: CloudTransport;
  content: Content;
  onRemote(progress: Progress): void;
  onState(state: CloudSyncState): void;
  debounceMs?: number;
}

/** JSONB may reorder object keys. Compare values rather than transport formatting. */
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value !== null && typeof value === 'object') {
    return `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => `${JSON.stringify(key)}:${canonical(item)}`).join(',')}}`;
  }
  return JSON.stringify(value);
}
function pristine(progress: Progress): boolean {
  return progress.xp === 0 && progress.completedLessons.length === 0 && progress.rewardedExercises.length === 0
    && Object.keys(progress.concepts).length === 0 && progress.history.length === 0
    && progress.activityDates.length === 0 && progress.achievements.length === 0;
}

/** One instance belongs to one authenticated user. Every write uses a server revision. */
export class CloudProgressSync {
  private readonly options: Options;
  private active = true;
  private started = false;
  private latest: Progress | null = null;
  private revision: number | null = null;
  private acknowledged: string | null = null;
  private conflictRemote: Progress | null = null;
  private status: CloudSyncState['status'] = 'loading';
  private operation: Promise<void> | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(options: Options) { this.options = options; }

  async connect(local: Progress): Promise<void> {
    if (!this.active) return;
    this.latest = this.snapshot(local);
    this.started = true;
    await this.retry();
  }

  save(local: Progress): void {
    if (!this.active) return;
    this.latest = this.snapshot(local);
    if (this.conflictRemote) {
      this.emit('conflict', this.conflictRemote);
      return;
    }
    if (this.started && this.status !== 'loading' && this.status !== 'offline') this.schedule();
  }

  async retry(): Promise<void> {
    if (!this.active || !this.started || !this.latest) return;
    this.clearTimer();
    if (this.operation) { await this.operation; return; }
    await this.run(async () => {
      this.emit('loading');
      const remote = await this.options.transport.get();
      if (!this.active) return;
      await this.reconcile(remote);
    });
  }

  async resolve(choice: 'local' | 'cloud'): Promise<void> {
    if (!this.active || !this.conflictRemote || !this.latest || this.operation) return;
    const remote = this.conflictRemote;
    this.conflictRemote = null;
    if (choice === 'cloud') {
      this.latest = this.snapshot(remote);
      this.acknowledged = canonical(remote);
      this.options.onRemote(this.snapshot(remote));
      this.emit('saved');
      return;
    }
    // The revision was read with the conflict. A subsequent race is checked again by put().
    await this.flush();
  }

  stop(): void {
    this.active = false;
    this.clearTimer();
    this.latest = null;
    this.conflictRemote = null;
  }

  private snapshot(value: unknown): Progress {
    return parseSave(JSON.stringify(value), this.options.content);
  }

  private emit(status: CloudSyncState['status'], remote?: Progress, message?: string): void {
    if (!this.active) return;
    this.status = status;
    this.conflictRemote = remote ? this.snapshot(remote) : null;
    this.options.onState({ status, ...(message ? { message } : {}),
      ...(remote && this.latest ? { conflict: { local: this.snapshot(this.latest), remote: this.snapshot(remote) } } : {}) });
  }

  private async reconcile(row: CloudSnapshot | null, afterRace = false): Promise<void> {
    if (!this.active || !this.latest) return;
    if (!row) {
      this.revision = null;
      this.acknowledged = null;
      await this.upload();
      return;
    }
    if (!Number.isSafeInteger(row.revision) || row.revision < 1) throw new Error('Révision de sauvegarde invalide.');
    const remote = this.snapshot(row.progress);
    this.revision = row.revision;
    const remoteValue = canonical(remote), localValue = canonical(this.latest);
    if (remoteValue === localValue) {
      this.acknowledged = remoteValue;
      this.emit('saved');
    } else if (!afterRace && this.acknowledged === remoteValue) {
      // A retry after losing the network can safely resume changes based on this same revision.
      await this.upload();
    } else if (!afterRace && this.acknowledged === null && pristine(this.latest)) {
      this.latest = remote;
      this.acknowledged = remoteValue;
      this.options.onRemote(this.snapshot(remote));
      this.emit('saved');
    } else {
      this.emit('conflict', remote);
    }
  }

  private schedule(): void {
    this.clearTimer();
    this.timer = setTimeout(() => { this.timer = null; void this.flush(); }, this.options.debounceMs ?? 500);
  }

  private clearTimer(): void {
    if (this.timer !== null) clearTimeout(this.timer);
    this.timer = null;
  }

  private async flush(): Promise<void> {
    if (!this.active || !this.latest || this.conflictRemote || this.operation) return;
    this.clearTimer();
    await this.run(() => this.upload());
  }

  private async upload(): Promise<void> {
    if (!this.active || !this.latest) return;
    const local = this.snapshot(this.latest), serialized = canonical(local);
    if (serialized === this.acknowledged) { this.emit('saved'); return; }
    this.emit('saving');
    const result = await this.options.transport.put(local, this.revision);
    if (!this.active) return;
    if (!result) {
      const remote = await this.options.transport.get();
      if (this.active) {
        // Do not retry a perpetually racing write in a tight loop.
        if (!remote) { this.emit('offline', undefined, 'La sauvegarde distante a changé. Réessayez.'); return; }
        await this.reconcile(remote, true);
      }
      return;
    }
    if (!Number.isSafeInteger(result.revision) || result.revision < 1) throw new Error('Révision de sauvegarde invalide.');
    this.revision = result.revision;
    this.acknowledged = serialized;
    if (this.latest && canonical(this.latest) !== serialized) {
      // A newer answer arrived while this request was in flight. Preserve it and send it next.
      this.emit('saving');
      this.schedule();
    } else this.emit('saved');
  }

  private async run(work: () => Promise<void>): Promise<void> {
    const operation = (async () => {
      try { await work(); }
      catch {
        this.emit('offline', undefined, 'Synchronisation indisponible. Votre progression reste sur cet appareil ; réessayez ou exportez votre carnet.');
      }
    })();
    this.operation = operation;
    await operation;
    if (this.operation === operation) {
      this.operation = null;
      // A debounce can expire while a request is running. Re-arm from the actual
      // latest snapshot after serialization, even when no timer remains.
      if (this.active && this.latest && !this.conflictRemote && this.status !== 'offline'
        && canonical(this.latest) !== this.acknowledged && this.timer === null) this.schedule();
    }
  }
}
