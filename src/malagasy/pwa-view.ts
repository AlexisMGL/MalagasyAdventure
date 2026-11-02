import { icon } from './art';
import { escapeHtml as e } from './exercise-view';
import type { PwaState } from './pwa';

export function renderInstallPage(state: PwaState): string {
  return `<div class="ma-page-heading"><span class="ma-eyebrow">VOTRE VOYAGE À PORTÉE DE MAIN</span><h1 tabindex="-1">Emportez l’aventure.</h1><p>Une icône sur votre écran d’accueil. Votre carnet s’ouvre dans sa propre fenêtre.</p></div>
    <section class="ma-install-hero"><div class="ma-install-phone" aria-hidden="true"><div><img src="/icons/maki-192.png" width="64" height="64" alt=""><span>malagasy</span><small>ADVENTURE</small><i></i>${icon('path', 44)}<b>Un mot à la fois.</b></div></div><div><span class="ma-eyebrow">MALAGASY ADVENTURE · L’APP</span><h2>Le même voyage.<br>Un accès tout simple.</h2><p>Retrouvez vos leçons, vos voix et vos révisions dans une application dédiée, directement depuis votre écran d’accueil.</p><p class="ma-install-connection">${icon('source', 17)} Une connexion Internet est nécessaire.</p>
    <div id="ma-install-status" aria-live="polite">${renderInstallStatus(state)}</div></div></section>
    <div class="ma-install-guides"><section class="ma-panel"><span class="ma-eyebrow">SUR IPHONE OU IPAD</span><h2>Depuis Safari</h2><ol><li>Ouvrez ce site dans <strong>Safari</strong>.</li><li>Ouvrez le menu <strong>Partager</strong>.</li><li>Choisissez <strong>Sur l’écran d’accueil</strong> ou <strong>Ajouter à l’écran d’accueil</strong>, puis <strong>Ajouter</strong>. Si proposé, activez <strong>Ouvrir comme app web</strong>.</li></ol></section><section class="ma-panel"><span class="ma-eyebrow">SUR ANDROID OU ORDINATEUR</span><h2>Depuis votre navigateur</h2><ol><li>Ouvrez ce site dans <strong>Chrome ou Edge</strong>.</li><li>Utilisez le bouton d’installation ci-dessus lorsqu’il est proposé, ou ouvrez le <strong>menu du navigateur</strong>.</li><li>Choisissez <strong>Installer l’application</strong> ou <strong>Ajouter à l’écran d’accueil</strong>, puis confirmez.</li></ol></section></div>
    <section class="ma-panel ma-install-details"><h2>Votre carnet vous suit.</h2><p>Connectez-vous avec le même compte pour retrouver votre progression. En mode découverte, le carnet reste sur cet appareil ; l’export et l’import restent disponibles.</p><p>Sur certains appareils, l’app et le navigateur ont des espaces de sauvegarde distincts. Connectez-vous ou exportez votre carnet avant de passer de l’un à l’autre.</p><div><button class="ma-secondary" data-view="account">Mon compte ${icon('arrow', 17)}</button><button class="ma-text-link" data-view="backup">Ma sauvegarde</button></div><h3>Toujours le même contenu</h3><p>Les nouveautés du site arrivent aussi dans l’app. À la prochaine ouverture avec Internet, vous retrouvez la version publiée. Si une mise à jour est détectée pendant une leçon, elle vous sera proposée à la fin.</p></section>`;
}

export function renderInstallStatus(state: PwaState): string {
  return `${state.runningStandalone ? '<p class="ma-installed">Vous utilisez la version app.</p>' : state.canInstall || state.prompting
    ? `<button class="ma-primary" data-action="pwa-install" ${state.prompting ? 'disabled' : ''}>${state.prompting ? 'Installation en cours…' : 'Installer l’application'} ${icon('save', 18)}</button>`
    : state.installationRequested ? '<p class="ma-install-hint">Installation transmise au navigateur.</p>'
    : '<p class="ma-install-hint">Suivez les étapes ci-dessous pour ajouter l’application.</p>'}
    ${state.message ? `<p>${e(state.message)}</p>` : ''}
    <details class="ma-install-help"><summary>Je ne trouve pas l’application</summary><p>Sur Android, cherchez <strong>Malagasy</strong> dans la liste des apps : c’est le nom de l’icône. Vérifiez aussi <strong>Paramètres → Applications → Voir toutes les applications</strong>.</p><p>Si elle n’y apparaît pas après quelques instants, ouvrez ce site dans <strong>Chrome</strong>, puis son menu <strong>⋮ → Installer et créer un raccourci → Installer</strong>, ou <strong>Ajouter à l’écran d’accueil</strong> selon la version, et confirmez.</p><p>Si vous avez créé un raccourci, regardez aussi sur les différentes pages de l’écran d’accueil. Sur iPhone ou iPad, suivez le guide Safari ci-dessous.</p></details>
    ${state.updateAvailable ? '<button class="ma-secondary" data-action="pwa-update">Ouvrir la nouvelle version</button>' : ''}`;
}

export function renderUpdateNotice(state: PwaState, safeToUpdate: boolean): string {
  return state.updateAvailable && !state.updateDeferred && safeToUpdate
    ? '<div class="ma-update-notice" role="status"><div><strong>La suite du voyage est arrivée.</strong><span>Une nouvelle version est disponible.</span></div><button class="ma-secondary" data-action="pwa-update">Actualiser</button><button class="ma-text-link" data-action="pwa-later">Plus tard</button></div>' : '';
}
