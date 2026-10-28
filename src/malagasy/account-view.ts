import { icon } from './art';
import { escapeHtml as e } from './exercise-view';
import type { Progress } from './types';

export type AccountMode = 'login' | 'signup' | 'forgot' | 'reset';
export interface AccountViewState {
  configured: boolean;
  email: string | null;
  status: string;
  busy: boolean;
  mode: AccountMode;
  message: string;
  error: boolean;
  conflict?: { local: Progress; remote: Progress };
}

const titles: Record<AccountMode, string> = {
  login: 'Retrouvez votre voyage.', signup: 'Un compte pour votre carnet.',
  forgot: 'Retrouver votre accès.', reset: 'Un nouveau mot de passe.',
};
const descriptions: Record<AccountMode, string> = {
  login: 'Connectez-vous pour sauvegarder votre progression et la retrouver sur un autre appareil.',
  signup: 'Créez votre compte avec votre adresse e-mail. Votre aventure reste à votre rythme.',
  forgot: 'Recevez un lien par e-mail pour choisir un nouveau mot de passe.',
  reset: 'Choisissez un nouveau mot de passe pour votre compte.',
};
const submits: Record<AccountMode, string> = {
  login: 'Se connecter', signup: 'Créer mon compte', forgot: 'Recevoir le lien', reset: 'Enregistrer le mot de passe',
};

function notice(state: AccountViewState): string {
  return state.message ? `<p id="ma-account-message" class="ma-account-message ${state.error ? 'is-error' : ''}" role="${state.error ? 'alert' : 'status'}">${e(state.message)}</p>` : '';
}

function progressSummary(progress: Progress, label: string, action: string, busy: boolean): string {
  const updated = new Date(progress.updatedAt);
  const date = Number.isNaN(updated.getTime()) ? 'Date indisponible' : updated.toLocaleString('fr-FR');
  return `<article class="ma-account-carnet"><h3>${e(label)}</h3><dl><div><dt>Leçons terminées</dt><dd>${progress.completedLessons.length}</dd></div><div><dt>Expérience</dt><dd>${progress.xp} XP</dd></div><div><dt>Dernière activité</dt><dd>${e(date)}</dd></div></dl><button type="button" class="ma-secondary" data-action="${action}" ${busy ? 'disabled' : ''}>Utiliser ce carnet</button></article>`;
}

function conflictPanel(state: AccountViewState): string {
  const conflict = state.conflict;
  if (!conflict) return '';
  return `<section class="ma-account-conflict" aria-labelledby="ma-account-conflict-title"><span class="ma-eyebrow">DEUX CARNETS À COMPARER</span><h2 id="ma-account-conflict-title">Quel voyage souhaitez-vous poursuivre ?</h2><p>La progression de cet appareil et celle de votre compte sont différentes. Choisissez le carnet à conserver pour la suite ; il remplacera l’autre.</p><div class="ma-account-carnets">${progressSummary(conflict.local, 'Sur cet appareil', 'account-use-local', state.busy)}${progressSummary(conflict.remote, 'Dans votre compte', 'account-use-cloud', state.busy)}</div><p class="ma-account-detail">Vous pouvez exporter le carnet de cet appareil avant de faire votre choix.</p><button type="button" class="ma-text-link" data-action="export">Exporter le carnet de cet appareil</button></section>`;
}

function accountForm(state: AccountViewState): string {
  const mode = state.mode;
  const newPassword = mode === 'signup' || mode === 'reset';
  const disabled = state.busy || !state.configured;
  return `<form id="ma-account-form" class="ma-account-form" aria-busy="${state.busy}" ${state.message ? 'aria-describedby="ma-account-message"' : ''}><fieldset ${disabled ? 'disabled' : ''}><legend class="ma-account-sr-only">${e(titles[mode])}</legend>${mode !== 'reset' ? `<label for="ma-account-email">Adresse e-mail<input id="ma-account-email" name="email" type="email" autocomplete="email" inputmode="email" autocapitalize="none" spellcheck="false" maxlength="254" placeholder="vous@exemple.fr" required></label>` : ''}${mode !== 'forgot' ? `<label for="ma-account-password">${newPassword ? 'Nouveau mot de passe' : 'Mot de passe'}<input id="ma-account-password" name="password" type="password" autocomplete="${newPassword ? 'new-password' : 'current-password'}" ${newPassword ? 'minlength="8" aria-describedby="ma-account-password-help"' : ''} required></label>${newPassword ? '<p id="ma-account-password-help" class="ma-account-field-help">Au moins 8 caractères.</p><label for="ma-account-password-confirm">Confirmer le mot de passe<input id="ma-account-password-confirm" name="passwordConfirm" type="password" autocomplete="new-password" minlength="8" required></label>' : ''}` : ''}<button class="ma-primary" type="submit">${state.busy ? 'Un instant…' : submits[mode]} ${icon('arrow', 17)}</button></fieldset></form>${mode === 'login' ? `<div class="ma-account-form-links"><button type="button" class="ma-text-link" data-action="account-mode" data-mode="forgot" ${state.busy ? 'disabled' : ''}>Mot de passe oublié ?</button><button type="button" class="ma-text-link" data-action="account-mode" data-mode="signup" ${state.busy ? 'disabled' : ''}>Créer un compte</button></div>` : mode !== 'reset' ? `<button type="button" class="ma-text-link" data-action="account-mode" data-mode="login" ${state.busy ? 'disabled' : ''}>J’ai déjà un compte : me connecter</button>` : ''}`;
}

export function renderAccountPage(state: AccountViewState): string {
  const connected = state.email !== null && state.mode !== 'reset';
  const heading = connected ? 'Votre carnet vous accompagne.' : titles[state.mode];
  const description = connected ? 'Votre compte vous permet de reprendre votre progression sur vos appareils.' : descriptions[state.mode];
  return `<div class="ma-page-heading"><span class="ma-eyebrow">MON COMPTE</span><h1 tabindex="-1">${heading}</h1><p>${description}</p></div><div class="ma-account-layout"><section class="ma-panel ma-account-panel" aria-label="${connected ? 'Votre compte' : 'Accès au compte'}"><span class="ma-account-symbol">${icon(connected ? 'book' : 'leaf', 32)}</span>${!state.configured ? '<p class="ma-account-message" role="status">La connexion au compte est indisponible pour le moment. Vous pouvez continuer à apprendre et exporter votre carnet.</p>' : ''}${connected ? `<h2>Bonjour, voyageur.</h2><p class="ma-account-email">${e(state.email!)}</p><p class="ma-account-sync" role="status">${e(state.status)}</p>${notice(state)}${conflictPanel(state)}<div class="ma-account-connected-actions"><button type="button" class="ma-secondary" data-action="account-retry" ${state.busy ? 'disabled' : ''}>${state.busy ? 'Synchronisation…' : 'Synchroniser maintenant'}</button><button type="button" class="ma-text-link" data-action="account-logout" ${state.busy ? 'disabled' : ''}>Se déconnecter</button></div>` : `${notice(state)}${accountForm(state)}`}</section><aside class="ma-account-discovery"><span class="ma-eyebrow">LE VOYAGE RESTE OUVERT</span><h2>${connected ? 'La suite vous attend.' : 'Commencez par un salama.'}</h2><p>${connected ? 'Retrouvez vos leçons et poursuivez votre voyage. Les exports et imports restent disponibles avec votre compte.' : 'Le mode découverte vous donne accès aux leçons sans créer de compte. Votre progression est conservée dans ce navigateur.'}</p><button type="button" class="ma-secondary" data-action="discovery-continue">${connected ? 'Revenir à mon parcours' : 'Continuer sans compte — mode découverte'} ${icon('arrow', 16)}</button><p class="ma-account-detail">${connected ? 'Un export vous permet aussi de garder une copie personnelle de votre carnet.' : 'Sans compte, pensez à exporter votre carnet avant de changer d’appareil ou d’effacer les données du site.'}</p><button type="button" class="ma-text-link" data-view="backup">Exporter ou importer ma progression</button></aside></div>`;
}

/** A compact, non-blocking reminder; learning is always available to guests. */
export function renderAccountReminder(state: AccountViewState): string {
  return `<aside id="ma-account-reminder" class="ma-account-reminder ${state.email ? 'is-connected' : ''}" aria-label="${state.email ? 'Sauvegarde du compte' : 'Mode découverte'}"><span class="ma-account-reminder-icon">${icon(state.email ? 'book' : 'leaf', 20)}</span><div><strong>${state.email ? state.conflict ? 'Deux carnets à comparer' : 'Votre carnet de voyage' : 'Mode découverte'}</strong><span>${e(state.email ? state.status : 'Votre progression reste dans ce navigateur. Connectez-vous pour la retrouver sur vos appareils.')}</span></div><button type="button" class="ma-text-link" data-action="account-open">${state.email ? state.conflict ? 'Choisir mon carnet' : 'Mon compte' : 'Sauvegarder avec un compte'} ${icon('arrow', 15)}</button></aside>`;
}
