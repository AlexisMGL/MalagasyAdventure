declare const __MA_BUILD_ID__: string;

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface PwaState {
  runningStandalone: boolean;
  installationRequested: boolean;
  canInstall: boolean;
  prompting: boolean;
  message: string;
  updateAvailable: boolean;
  updateDeferred: boolean;
}

/** Online PWA: installation and update awareness, without a service worker or content cache. */
export class MalagasyPwa {
  readonly state: PwaState = {
    runningStandalone: false, installationRequested: false, canInstall: false, prompting: false, message: '',
    updateAvailable: false, updateDeferred: false,
  };
  private promptEvent: InstallPromptEvent | null = null;
  private checkedAt = 0;
  private checking = false;
  constructor(private readonly onChange: () => void) {}

  start(): void {
    const displayMode = window.matchMedia('(display-mode: standalone)');
    const updateDisplayMode = () => {
      // Display mode describes this window, not the device's installed applications.
      this.state.runningStandalone = displayMode.matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
      this.onChange();
    };
    updateDisplayMode();
    displayMode.addEventListener('change', updateDisplayMode);
    window.addEventListener('beforeinstallprompt', event => {
      event.preventDefault();
      this.promptEvent = event as InstallPromptEvent;
      this.state.canInstall = true;
      this.state.installationRequested = false;
      this.state.message = '';
      this.onChange();
    });
    window.addEventListener('appinstalled', () => {
      this.promptEvent = null;
      this.state.canInstall = false;
      // Android can emit this before the WebAPK has actually been created/installed.
      this.state.installationRequested = true;
      this.state.message = 'Le navigateur a accepté l’installation. L’ajout de l’icône peut prendre quelques instants.';
      this.onChange();
    });
    // No reload on focus, reconnection or deploy: a lesson/form must remain intact.
    const check = () => { if (!document.hidden) void this.checkForUpdate(); };
    window.addEventListener('focus', check);
    window.addEventListener('online', check);
    document.addEventListener('visibilitychange', check);
    if (import.meta.env.PROD) { check(); window.setInterval(check, 5 * 60_000); }
  }

  async install(): Promise<void> {
    const event = this.promptEvent;
    if (!event || this.state.prompting) return;
    this.promptEvent = null;
    this.state.canInstall = false;
    this.state.prompting = true;
    this.onChange();
    try {
      await event.prompt();
      const { outcome } = await event.userChoice;
      this.state.installationRequested = outcome === 'accepted' || this.state.installationRequested;
      this.state.message = outcome === 'accepted'
        ? 'Installation demandée. Vérifiez l’ajout de l’icône sur votre appareil ; cela peut prendre quelques instants.'
        : 'Vous pourrez installer l’application plus tard depuis le menu du navigateur.';
    } catch {
      this.state.message = 'Utilisez le menu de votre navigateur pour installer l’application.';
    } finally {
      this.state.prompting = false;
      this.onChange();
    }
  }

  async checkForUpdate(): Promise<void> {
    if (!import.meta.env.PROD || this.checking || navigator.onLine === false
      || this.state.updateAvailable || Date.now() - this.checkedAt < 60_000) return;
    this.checkedAt = Date.now();
    this.checking = true;
    try {
      const response = await fetch('/version.json', { cache: 'no-store', signal: AbortSignal.timeout(8000) });
      if (!response.ok) return;
      const data: unknown = await response.json();
      const version = data && typeof data === 'object' && 'version' in data ? data.version : undefined;
      if (typeof version === 'string' && version.length > 0 && version.length < 100 && version !== __MA_BUILD_ID__) {
        this.state.updateAvailable = true;
        this.onChange();
      }
    } catch { /* A failed check never interferes with learning or account forms. */ }
    finally { this.checking = false; }
  }

  deferUpdate(): void { this.state.updateDeferred = true; this.onChange(); }
}
