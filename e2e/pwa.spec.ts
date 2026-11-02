import { expect, test, type Page, type Route } from '@playwright/test';
import { readMiniLesson } from './lesson-flow';
import { SAVE_KEY } from '../src/malagasy/storage';

test.use({ reducedMotion: 'reduce' });

async function overflow(page: Page): Promise<void> {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}
async function firstExercise(page: Page): Promise<void> {
  await page.getByRole('button', { name: /Commencer l’aventure/ }).click();
  await readMiniLesson(page);
  for (let step = 0; step < 30 && !await page.locator('#ma-exercise-form').count(); step++) {
    const begin = page.locator('[data-action="begin-exercises"]');
    if (await begin.count()) await begin.click();
    else await page.locator('[data-action="advance-dialogue"]').click();
  }
  await expect(page.locator('#ma-exercise-form')).toBeVisible();
}

test('both entries expose an installable manifest, valid icons and a matching release identity', async ({ page, context, request }) => {
  for (const url of ['/', '/malagasy-adventure']) {
    await page.goto(url);
    await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', '/manifest.webmanifest');
    const cdp = await context.newCDPSession(page);
    const appManifest = await cdp.send('Page.getAppManifest');
    expect(appManifest.errors).toEqual([]);
    const manifest = JSON.parse(appManifest.data!);
    expect(manifest).toMatchObject({ id: '/', scope: '/', start_url: '/', display: 'standalone', lang: 'fr' });
    const appleIcon = await page.locator('link[rel="apple-touch-icon"]').getAttribute('href');
    for (const item of [...manifest.icons, { src: appleIcon, sizes: '180x180' }]) {
      expect(await page.evaluate(async icon => {
        const image = new Image(); image.src = icon.src; await image.decode();
        return `${image.naturalWidth}x${image.naturalHeight}`;
      }, item)).toBe(item.sizes);
    }
    expect((await cdp.send('Page.getInstallabilityErrors')).installabilityErrors).toEqual([]);
    await cdp.detach();
  }
  const version = await (await request.get('/version.json')).json();
  expect(version.version).toMatch(/^[\da-f-]{36}$/);
  expect(await page.locator('#ma-pwa-update').textContent()).toBe('');
  expect(await page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length)).toBe(0);
  expect(await page.evaluate(() => caches.keys())).toEqual([]);
});

for (const width of [340, 390]) test(`mobile navigation and installation guide work at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 844 });
  await page.goto('/');
  const navigation = page.getByRole('navigation', { name: 'Navigation principale' });
  const bounds = await navigation.boundingBox();
  expect(bounds!.y + bounds!.height).toBe(844);
  await navigation.getByRole('button', { name: 'Révisions', exact: true }).click();
  await expect(navigation.getByRole('button', { name: 'Révisions', exact: true })).toHaveAttribute('aria-current', 'page');
  await page.getByRole('button', { name: 'Plus d’options' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Installer l’application' }).click();
  await expect(page.getByRole('heading', { name: 'Emportez l’aventure.' })).toBeVisible();
  await expect(page.getByText('Une connexion Internet est nécessaire.', { exact: false })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Depuis Safari' })).toBeVisible();
  await overflow(page);
  await page.screenshot({ path: `.tools/screens/pwa-install-${width}.png`, fullPage: true });
  await page.getByRole('button', { name: 'Plus d’options' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Ma sauvegarde', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Gardez une trace.' })).toBeVisible();
  await navigation.getByRole('button', { name: 'Mon parcours' }).click();
  await firstExercise(page);
  await expect(navigation).toBeHidden();
  await overflow(page);
  await page.getByRole('button', { name: 'Quitter la leçon' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Retour au parcours' }).click();
  await expect(navigation).toBeVisible();
  await page.screenshot({ path: `.tools/screens/pwa-path-${width}.png`, fullPage: true });
});

test('native install prompt is consumed once and Android appinstalled does not claim installation is finished', async ({ page }) => {
  await page.goto('/#install');
  const saved = await page.evaluate(key => localStorage.getItem(key), SAVE_KEY);
  await page.evaluate(() => {
    const event = new Event('beforeinstallprompt', { cancelable: true });
    let prompted = false;
    Object.assign(event, { prompt: async () => { if (prompted) throw new Error('Already consumed'); prompted = true; }, userChoice: Promise.resolve({ outcome: 'dismissed' }) });
    window.dispatchEvent(event);
  });
  await page.locator('[data-action="pwa-install"]').click();
  await expect(page.locator('#ma-install-status')).toContainText('Vous pourrez installer l’application plus tard');
  await expect(page.locator('[data-action="pwa-install"]')).toHaveCount(0);
  await page.evaluate(() => {
    const event = new Event('beforeinstallprompt', { cancelable: true });
    Object.assign(event, { prompt: async () => {}, userChoice: Promise.resolve({ outcome: 'accepted' }) });
    window.dispatchEvent(event);
  });
  await page.locator('[data-action="pwa-install"]').click();
  await expect(page.locator('#ma-install-status')).toContainText('Installation demandée');
  await page.evaluate(() => window.dispatchEvent(new Event('appinstalled')));
  await expect(page.locator('#ma-install-status')).toContainText('Installation transmise au navigateur');
  await expect(page.locator('#ma-install-status')).not.toContainText('L’application est installée');
  await expect(page.locator('[data-action="pwa-install"]')).toHaveCount(0);
  await page.getByText('Je ne trouve pas l’application', { exact: true }).click();
  await expect(page.locator('.ma-install-help')).toContainText('Paramètres → Applications → Voir toutes les applications');
  await expect(page.locator('.ma-install-help')).toContainText('Malagasy');
  expect(await page.evaluate(key => localStorage.getItem(key), SAVE_KEY)).toBe(saved);
  await page.reload();
  await expect(page.locator('#ma-install-status')).not.toContainText('Installation transmise au navigateur');
});

test('an installed iOS app does not ask to install again', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'standalone', { value: true }));
  await page.goto('/#install');
  await expect(page.locator('#ma-install-status')).toContainText('Vous utilisez la version app');
  await expect(page.locator('[data-action="pwa-install"]')).toHaveCount(0);
});

test('standalone display only describes this window and never proves the presence of an Android app', async ({ page }) => {
  await page.addInitScript(() => {
    const matchMedia = window.matchMedia.bind(window);
    window.matchMedia = query => {
      const media = matchMedia(query);
      if (query === '(display-mode: standalone)') Object.defineProperty(media, 'matches', { value: true });
      return media;
    };
  });
  await page.goto('/#install');
  await expect(page.locator('#ma-install-status')).toContainText('Vous utilisez la version app');
  await expect(page.locator('#ma-install-status')).not.toContainText('L’application est installée');
  await page.getByText('Je ne trouve pas l’application', { exact: true }).click();
  await expect(page.locator('.ma-install-help p').first()).toBeVisible();
});

test('a new deployment preserves the current answer and is offered after leaving the lesson', async ({ page }) => {
  let pending: Route | undefined;
  await page.route('**/version.json', route => { pending = route; });
  await page.goto('/');
  await expect.poll(() => !!pending).toBe(true);
  await firstExercise(page);
  const question = await page.locator('#ma-question').textContent();
  const choice = page.locator('[data-choice]').first();
  await choice.click();
  const controls = await page.locator('.ma-answer-controls').innerHTML();
  const saved = await page.evaluate(key => localStorage.getItem(key), SAVE_KEY);
  await pending!.fulfill({ json: { version: 'a-new-published-version' } });
  await page.waitForLoadState('networkidle');
  await expect(page.locator('#ma-pwa-update')).toBeEmpty();
  expect(await page.locator('#ma-question').textContent()).toBe(question);
  expect(await page.locator('.ma-answer-controls').innerHTML()).toBe(controls);
  await page.getByRole('button', { name: 'Quitter la leçon' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Retour au parcours' }).click();
  await expect(page.getByText('Une nouvelle version est disponible.')).toBeVisible();
  await page.locator('[data-action="pwa-later"]').click();
  await expect(page.locator('#ma-pwa-update')).toBeEmpty();
  // Deferring the banner keeps an intentional update available in the installation guide.
  await page.locator('.ma-sidebar [data-view="install"]').click();
  await expect(page.locator('#ma-install-status [data-action="pwa-update"]')).toBeVisible();
  await page.unroute('**/version.json');
  await Promise.all([page.waitForNavigation(), page.locator('#ma-install-status [data-action="pwa-update"]').click()]);
  await expect(page.getByRole('heading', { name: 'Emportez l’aventure.' })).toBeVisible();
  const latest = await page.evaluate(key => localStorage.getItem(key), SAVE_KEY);
  expect(JSON.parse(latest!).completedLessons).toEqual(JSON.parse(saved!).completedLessons);
  expect(JSON.parse(latest!).xp).toBe(JSON.parse(saved!).xp);
});

test('update discovery and failures never replace a password being entered', async ({ page }) => {
  let pending: Route | undefined;
  await page.route('**/version.json', route => { pending = route; });
  await page.goto('/#account');
  await expect.poll(() => !!pending).toBe(true);
  const password = page.locator('input[type="password"]');
  await password.fill('Une-saisie-en-cours');
  await pending!.fulfill({ json: { version: 'a-new-published-version' } });
  await page.waitForLoadState('networkidle');
  await expect(password).toHaveValue('Une-saisie-en-cours');
  await expect(page.locator('#ma-pwa-update')).toBeEmpty();
  await page.route('**/version.json', route => route.fulfill({ status: 503, body: 'Unavailable' }));
  await page.reload();
  await expect(password).toBeVisible();
  await expect(page.locator('#ma-pwa-update')).toBeEmpty();
});
