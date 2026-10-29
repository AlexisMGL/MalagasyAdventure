import type { Session } from '@supabase/supabase-js';
import type { Progress } from './types';
import { CONTENT } from './content';
import { CloudProgressSync, type CloudSyncState } from './cloud-sync';
import { loadProgress, loadAccountProgress, saveAccountProgress } from './storage';
import { supabase, cloudTransport, authErrorMessage } from './supabase';
import type { AccountMode, AccountViewState } from './account-view';
import { accountIdentifier, loginEmail, normalizeUsername, usernameEmail } from './account-identity';

interface AccountOptions {
  getProgress(): Progress;
  onProgress(progress: Progress): void;
  onChange(): void;
  onOpen(): void;
}
const syncLabels: Record<CloudSyncState['status'], string> = {
  loading: 'Recherche de votre carnet…', saved: 'Progression sauvegardée dans votre compte.',
  saving: 'Sauvegarde en cours…', offline: 'Sauvegarde en attente. Votre carnet reste sur cet appareil.',
  conflict: 'Deux carnets différents : choisissez celui que vous souhaitez poursuivre.',
};

export class MalagasyAccount {
  readonly state: AccountViewState = {
    configured: supabase !== null, email: null, status: 'Mode découverte · sauvegarde locale',
    busy: false, mode: 'login', message: '', error: false,
  };
  userId: string | null = null;
  private sync: CloudProgressSync | null = null;
  private authEpoch = 0;
  private guestProgress: Progress | null = null;
  private options: AccountOptions;

  constructor(options: AccountOptions) { this.options = options; }

  start(): void {
    if (!supabase) return;
    const parameters = new URLSearchParams(location.hash.slice(1));
    const callbackError = parameters.has('error') || parameters.has('error_code');
    if (callbackError) {
      this.state.mode = 'login'; this.state.error = true;
      this.state.message = 'Ce lien est invalide ou a expiré. Connectez-vous avec votre identifiant et votre mot de passe.';
      history.replaceState(null, '', `${location.pathname}#account`);
      this.options.onOpen();
    }
    // Supabase callbacks must return immediately; database work runs outside the auth lock.
    supabase.auth.onAuthStateChange((event, session) => {
      const epoch = ++this.authEpoch;
      if (event === 'SIGNED_OUT') {
        this.state.mode = 'login'; this.changeSession(null); return;
      }
      if (event === 'PASSWORD_RECOVERY') {
        this.state.mode = 'reset'; this.state.message = ''; this.state.error = false;
        this.options.onOpen();
      }
      window.setTimeout(() => {
        if (epoch !== this.authEpoch) return;
        this.changeSession(session);
      }, 0);
    });
    window.addEventListener('online', () => { void this.sync?.retry(); });
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) void this.sync?.retry();
    });
  }

  private changeSession(session: Session | null): void {
    const id = session?.user.id ?? null;
    if (id === this.userId) { this.options.onChange(); return; }
    if (!this.userId) this.guestProgress = this.options.getProgress();
    if (this.userId) saveAccountProgress(this.options.getProgress(), this.userId);
    this.sync?.stop(); this.sync = null;
    this.userId = id; this.state.email = session ? accountIdentifier(session.user.email) : null;
    this.state.conflict = undefined;
    if (!id || !supabase) {
      this.state.mode = 'login'; this.state.status = 'Mode découverte · sauvegarde locale';
      this.options.onProgress(this.guestProgress ?? loadProgress(CONTENT).progress);
      this.options.onChange(); return;
    }
    const local = loadAccountProgress(id, CONTENT) ?? this.guestProgress ?? loadProgress(CONTENT).progress;
    this.options.onProgress(local);
    this.sync = new CloudProgressSync({
      content: CONTENT, transport: cloudTransport(supabase, id),
      onRemote: progress => {
        saveAccountProgress(progress, id); this.options.onProgress(progress);
      },
      onState: state => {
        this.state.status = syncLabels[state.status]; this.state.conflict = state.conflict;
        this.options.onChange();
      },
    });
    void this.sync.connect(local);
  }

  save(progress: Progress): void { this.sync?.save(progress); }
  retry(): void { void this.sync?.retry(); }
  resolve(choice: 'local' | 'cloud'): void { void this.sync?.resolve(choice); }
  setMode(mode: AccountMode): void {
    if (this.state.busy) return;
    this.state.mode = mode; this.state.message = ''; this.state.error = false;
    this.options.onChange();
  }

  async submit(form: HTMLFormElement): Promise<void> {
    if (!supabase || this.state.busy) return;
    const values = new FormData(form), mode = this.state.mode;
    const identifier = String(values.get('identifier') ?? '');
    const password = String(values.get('password') ?? '');
    if ((mode === 'signup' || mode === 'reset') && (password.length < 8 || password.length > 128)) {
      this.state.message = 'Choisissez un mot de passe de 8 à 128 caractères.';
      this.state.error = true; this.options.onChange(); return;
    }
    if (mode === 'reset' && password !== values.get('passwordConfirm')) {
      this.state.message = 'Les deux mots de passe doivent être identiques.';
      this.state.error = true; this.options.onChange(); return;
    }
    let email = '', username = '';
    try {
      if (mode === 'signup') { username = normalizeUsername(identifier); email = usernameEmail(username); }
      else if (mode === 'login') email = loginEmail(identifier);
    } catch (error) {
      this.state.message = (error as Error).message;
      this.state.error = true; this.options.onChange(); return;
    }
    this.state.busy = true; this.state.message = ''; this.state.error = false; this.options.onChange();
    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        this.changeSession(data.session); this.state.message = 'Vous êtes connecté.';
      } else if (mode === 'signup') {
        const { data: result, error: creationError } = await supabase.functions.invoke('username-signup', { body: { username, password } });
        if (creationError) {
          let code: unknown;
          try { code = (await (creationError.context as Response).json()).code; } catch { /* No readable server response. */ }
          if (typeof code === 'string') throw { code };
          throw creationError;
        }
        if (result?.ok !== true) throw { code: 'signup_unavailable' };
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        this.changeSession(data.session);
        this.state.message = data.session ? 'Votre compte est prêt.' : 'Votre compte a été créé. Connectez-vous avec votre identifiant et votre mot de passe.';
        this.state.error = !data.session;
      } else {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        this.state.mode = 'login'; this.state.message = 'Votre mot de passe a été enregistré.';
      }
    } catch (error) {
      this.state.error = true; this.state.message = authErrorMessage(error);
    } finally { this.state.busy = false; this.options.onChange(); }
  }

  async logout(): Promise<void> {
    if (!supabase || this.state.busy) return;
    this.state.busy = true; this.state.error = false; this.state.message = ''; this.options.onChange();
    try {
      await this.sync?.retry();
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) throw error;
      this.changeSession(null); this.state.message = 'Vous êtes déconnecté. Votre carnet de découverte reste disponible.';
    } catch (error) { this.state.error = true; this.state.message = authErrorMessage(error); }
    finally { this.state.busy = false; this.options.onChange(); }
  }
}
