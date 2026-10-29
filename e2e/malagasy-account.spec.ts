import { expect, test, type Page, type Route } from '@playwright/test';
import { CONTENT } from '../src/malagasy/content';
import { completeLesson, createProgress, introduceLesson, recordAnswer } from '../src/malagasy/engine';
import { parseSave, SAVE_KEY } from '../src/malagasy/storage';
import type { Progress } from '../src/malagasy/types';
import { usernameEmail } from '../src/malagasy/account-identity';

const API = 'https://unpvrisziuttjmzhwyid.supabase.co';
const ALICE = '11111111-1111-4111-8111-111111111111';
const BOB = '22222222-2222-4222-8222-222222222222';
const NOW = '2026-10-28T12:00:00.000Z';
const EMAIL = 'voyageur@example.test';
const PASSWORD = 'MotDePasse!2026';
const accountKey = (id: string) => `${SAVE_KEY}.account.${id}`;
test.use({ reducedMotion: 'reduce' });

for (const width of [340, 390, 1440]) test(`login is directly visible in the header at ${width}px while discovery remains available`, async ({ page }) => {
  await provider(page);
  await page.setViewportSize({ width, height: 844 });
  await page.goto('/malagasy-adventure');
  const access = page.locator('.ma-topbar').getByRole('button', { name: 'Se connecter', exact: true });
  await expect(access).toBeVisible();
  const bounds = await access.boundingBox();
  expect(bounds && bounds.y >= 0 && bounds.y + bounds.height <= 844).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await access.click();
  await expect(page.locator('#ma-account-form')).toBeVisible();
  await page.getByRole('button', { name: /Continuer sans compte/ }).click();
  await expect(page.getByRole('button', { name: /Commencer l’aventure/ })).toBeVisible();
});

function learned(lessonCount = 1): Progress {
  let value = createProgress(NOW);
  for (const lesson of CONTENT.lessons.slice(0, lessonCount)) {
    value = introduceLesson(value, lesson, CONTENT);
    for (const id of lesson.exerciseIds) value = recordAnswer(value, CONTENT.exercises.find(item => item.id === id)!, true, NOW);
    value = completeLesson(value, lesson, lesson.exerciseIds.length, lesson.exerciseIds.length, NOW);
  }
  return parseSave(JSON.stringify(value), CONTENT);
}
function authUser(id = ALICE, email = EMAIL) {
  return { id, aud: 'authenticated', role: 'authenticated', email, email_confirmed_at: NOW,
    phone: '', confirmed_at: NOW, last_sign_in_at: NOW, app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: {}, identities: [], created_at: NOW, updated_at: NOW, is_anonymous: false };
}
function token(id = ALICE, email = EMAIL): string {
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ iss: `${API}/auth/v1`, sub: id, aud: 'authenticated',
    exp: now + 3600, iat: now, role: 'authenticated', email, session_id: '33333333-3333-4333-8333-333333333333' })}.test-signature`;
}
function authSession(id = ALICE, email = EMAIL) {
  return { access_token: token(id, email), refresh_token: `test-refresh-${id}`, expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600, token_type: 'bearer', user: authUser(id, email) };
}
interface CloudRow { progress: Progress; revision: number }
interface RequestRecord { path: string; method: string; body: Record<string, unknown> | null; url: string }

/** Every Supabase request is intercepted: this suite sends no mails and creates no real account. */
async function provider(page: Page, initial?: CloudRow) {
  const rows = new Map<string, CloudRow>(initial ? [[ALICE, initial]] : []);
  const calls: RequestRecord[] = [];
  let invalidLogin = false;
  let failWrite = false;
  const reply = (route: Route, body: unknown, status = 200) => route.fulfill({ status,
    contentType: 'application/json', body: JSON.stringify(body),
    headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' } });
  await page.route(`${API}/**`, async route => {
    const request = route.request(), url = new URL(request.url());
    const body = request.postData() ? request.postDataJSON() as Record<string, unknown> : null;
    if (request.method() === 'OPTIONS') { await route.fulfill({ status: 204, headers: {
      'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS' } }); return; }
    calls.push({ path: url.pathname, method: request.method(), body, url: url.href });
    if (url.pathname === '/functions/v1/username-signup') { await reply(route, { ok: true }); return; }
    if (url.pathname === '/auth/v1/recover') { await reply(route, {}); return; }
    if (url.pathname === '/auth/v1/token') {
      if (invalidLogin) { await reply(route, { error_code: 'invalid_credentials', code: 'invalid_credentials', msg: 'Invalid login credentials' }, 400); return; }
      const email = String(body?.email ?? EMAIL), id = email === 'second@example.test' ? BOB : ALICE;
      await reply(route, authSession(id, email)); return;
    }
    if (url.pathname === '/auth/v1/user') {
      const bearer = request.headers().authorization?.replace(/^Bearer /, '') ?? token();
      const payload = JSON.parse(Buffer.from(bearer.split('.')[1], 'base64url').toString()) as { sub: string; email: string };
      await reply(route, authUser(payload.sub, payload.email)); return;
    }
    if (url.pathname === '/auth/v1/logout') { await reply(route, {}); return; }
    if (url.pathname === '/rest/v1/learning_progress') {
      const id = url.searchParams.get('user_id')?.replace(/^eq\./, '') ?? '';
      const row = rows.get(id);
      await reply(route, row ? [row] : []); return;
    }
    if (url.pathname === '/rest/v1/rpc/save_learning_progress') {
      if (failWrite) { failWrite = false; await route.abort('internetdisconnected'); return; }
      const id = String(body?.p_user_id), previous = rows.get(id);
      if ((previous?.revision ?? null) !== body?.p_expected_revision) { await reply(route, null); return; }
      const value = parseSave(JSON.stringify(body?.p_progress), CONTENT), revision = (previous?.revision ?? 0) + 1;
      rows.set(id, { progress: value, revision });
      await reply(route, revision); return;
    }
    // Unexpected API paths should fail the test visibly instead of reaching the real provider.
    await reply(route, { code: 'unexpected_test_request', message: url.pathname }, 501);
  });
  return { rows, calls, rejectLogin: () => { invalidLogin = true; }, failNextWrite: () => { failWrite = true; } };
}
async function openAccount(page: Page): Promise<void> {
  await page.locator('[data-view="account"]').click();
  await expect(page.locator('#ma-account-form')).toBeVisible();
}
async function login(page: Page, email = EMAIL): Promise<void> {
  await page.locator('#ma-account-identifier').fill(email);
  await page.locator('#ma-account-password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
  await expect(page.locator('.ma-account-email')).toHaveText(email);
}
async function localSave(page: Page, key: string): Promise<Progress | null> {
  return page.evaluate(item => {
    const raw = localStorage.getItem(item); return raw ? JSON.parse(raw) : null;
  }, key);
}
async function captureLayouts(page: Page, name: string): Promise<void> {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: `.tools/screens/${name}-desktop.png`, fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: `.tools/screens/${name}-mobile.png`, fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.setViewportSize({ width: 1440, height: 1000 });
}

test('discovery starts a real lesson without an account and keeps portable backups available', async ({ page }) => {
  const backend = await provider(page);
  await page.goto('/malagasy-adventure');
  await expect(page.locator('#ma-account-reminder')).toContainText('Mode découverte');
  await expect(page.getByRole('button', { name: /Sauvegarder avec un compte/ })).toBeVisible();
  await captureLayouts(page, 'guest');
  await page.getByRole('button', { name: /Commencer l’aventure/ }).click();
  while (await page.locator('[data-action="advance-notion"]').count()) await page.locator('[data-action="advance-notion"]').click();
  await expect(page.locator('.ma-dialogue-discovery')).toBeVisible();
  await expect(page.locator('.ma-speech-text').first()).toHaveText('Salama!');
  expect(backend.calls.filter(call => call.path.startsWith('/auth/'))).toEqual([]);
  await page.getByRole('button', { name: 'Ma sauvegarde', exact: true }).click();
  await expect(page.getByRole('button', { name: /Exporter ma sauvegarde/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Importer une sauvegarde/ })).toBeVisible();
  await openAccount(page);
  await page.getByRole('button', { name: /Continuer sans compte/ }).click();
  await expect(page.locator('h1')).toContainText('Un nouveau monde');
});

test('signup uses only a username and password and immediately saves the guest progress', async ({ page }) => {
  const backend = await provider(page);
  await page.goto('/malagasy-adventure#account');
  await page.getByRole('button', { name: 'Créer un compte', exact: true }).click();
  await captureLayouts(page, 'signup');
  await expect(page.locator('#ma-account-form input')).toHaveCount(2);
  await expect(page.locator('input[type="email"]')).toHaveCount(0);
  await expect(page.locator('#ma-account-password')).toHaveAttribute('maxlength', '128');
  await expect(page.locator('#ma-account-password-help')).toHaveText('8 à 128 caractères.');
  await expect(page.getByText(/sans adresse mail, ils ne peuvent pas être récupérés/)).toBeVisible();
  await page.locator('#ma-account-identifier').fill('Mia_42');
  await page.locator('#ma-account-password').fill(PASSWORD);
  await page.getByRole('button', { name: /Créer mon compte/ }).click();
  await expect(page.locator('#ma-account-message')).toHaveText('Votre compte est prêt.');
  await expect(page.locator('.ma-account-email')).toHaveText('mia_42');
  await expect(page.locator('.ma-account-sync')).toContainText('Progression sauvegardée');
  const request = backend.calls.find(call => call.path === '/functions/v1/username-signup');
  expect(request?.body).toEqual({ username: 'mia_42', password: PASSWORD });
  expect(backend.calls.some(call => call.path === '/auth/v1/signup')).toBe(false);
  expect(backend.calls.find(call => call.path === '/auth/v1/token')?.body?.email).toBe(usernameEmail('mia_42'));
  await page.reload();
  await expect(page.locator('.ma-account-email')).toHaveText('mia_42');
  await page.getByRole('button', { name: 'Se déconnecter', exact: true }).click();
  await page.locator('#ma-account-identifier').fill('MIA_42');
  await page.locator('#ma-account-password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
  await expect(page.locator('.ma-account-email')).toHaveText('mia_42');
  expect(backend.calls.filter(call => call.path === '/auth/v1/token').at(-1)?.body?.email).toBe(usernameEmail('mia_42'));
  expect(await page.locator('body').textContent()).not.toContain('users.malagasyadventure.invalid');
});

test('wrong credentials retain the guest save and do not request mail', async ({ page }) => {
  const backend = await provider(page);
  backend.rejectLogin();
  await page.goto('/malagasy-adventure#backup');
  await page.locator('#ma-daily-goal').selectOption('5');
  const guest = await localSave(page, SAVE_KEY);
  await openAccount(page);
  await page.locator('#ma-account-identifier').fill('mia_42');
  await page.locator('#ma-account-password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
  await expect(page.locator('#ma-account-message')).toHaveText('Identifiant ou mot de passe incorrect.');
  expect(await localSave(page, SAVE_KEY)).toEqual(guest);
  await expect(page.locator('#ma-account-identifier')).toHaveValue('mia_42');
  await expect(page.getByRole('button', { name: 'Mot de passe oublié ?' })).toHaveCount(0);
  expect(backend.calls.some(call => call.path === '/auth/v1/recover')).toBe(false);
  expect(backend.calls.some(call => call.path.startsWith('/rest/'))).toBe(false);
});

test('a recovery callback removes the token and saves the new password through Supabase', async ({ page }) => {
  const backend = await provider(page, { progress: createProgress(NOW), revision: 1 });
  const parameters = new URLSearchParams({ access_token: token(), refresh_token: 'test-recovery-refresh',
    token_type: 'bearer', expires_in: '3600', type: 'recovery' });
  await page.goto(`/malagasy-adventure#${parameters}`);
  await expect(page.locator('h1')).toHaveText('Un nouveau mot de passe.');
  await expect(page).toHaveURL(/#account$/);
  expect(page.url()).not.toContain('access_token');
  await page.locator('#ma-account-password').fill('Nouveau!Pass2026');
  await page.locator('#ma-account-password-confirm').fill('Nouveau!Pass2026');
  await page.getByRole('button', { name: /Enregistrer le mot de passe/ }).click();
  await expect(page.locator('#ma-account-message')).toHaveText('Votre mot de passe a été enregistré.');
  expect(backend.calls.find(call => call.path === '/auth/v1/user' && call.method === 'PUT')?.body)
    .toMatchObject({ password: 'Nouveau!Pass2026' });
  await expect(page.locator('.ma-account-email')).toHaveText(EMAIL);
});

test('login restores real progress, saves with server revisions and exposes concurrent changes', async ({ page }) => {
  const cloud = learned(), backend = await provider(page, { progress: cloud, revision: 7 });
  await page.goto('/malagasy-adventure#account');
  await login(page);
  await expect(page.locator('.ma-account-sync')).toContainText('Progression sauvegardée');
  await expect(page.locator('.ma-xp')).toContainText(String(cloud.xp));
  expect(await localSave(page, accountKey(ALICE))).toEqual(cloud);
  await page.getByRole('button', { name: 'Ma sauvegarde', exact: true }).click();
  await page.locator('#ma-daily-goal').selectOption('20');
  await expect.poll(() => backend.rows.get(ALICE)?.revision).toBe(8);
  expect(backend.calls.find(call => call.path.endsWith('/save_learning_progress'))?.body)
    .toMatchObject({ p_user_id: ALICE, p_expected_revision: 7 });
  expect(backend.rows.get(ALICE)?.progress.settings.dailyGoal).toBe(20);
  await page.reload();
  await expect(page.locator('#ma-account-reminder')).toContainText('Progression sauvegardée');
  await expect(page.locator('#ma-daily-goal')).toHaveValue('20');
  const changedElsewhere = { ...cloud, settings: { ...cloud.settings, dailyGoal: 15 } };
  backend.rows.set(ALICE, { progress: changedElsewhere, revision: 9 });
  await page.locator('#ma-daily-goal').selectOption('5');
  await expect(page.locator('#ma-account-reminder')).toContainText('Deux carnets');
  await page.getByRole('button', { name: /Choisir mon carnet/ }).click();
  await expect(page.locator('.ma-account-conflict')).toBeVisible();
  expect(backend.rows.get(ALICE)?.progress.settings.dailyGoal).toBe(15);
  await page.locator('[data-action="account-use-local"]').click();
  await expect(page.locator('.ma-account-sync')).toContainText('Progression sauvegardée');
  expect(backend.rows.get(ALICE)).toMatchObject({ revision: 10, progress: { settings: { dailyGoal: 5 } } });
});

test('logout restores discovery and a second account never receives the first account cache', async ({ page }) => {
  const alice = learned(), bob = { ...createProgress(NOW), settings: { muted: false, dailyGoal: 15 } };
  const backend = await provider(page, { progress: alice, revision: 4 });
  backend.rows.set(BOB, { progress: bob, revision: 2 });
  await page.goto('/malagasy-adventure#backup');
  await page.locator('#ma-daily-goal').selectOption('5');
  const guest = await localSave(page, SAVE_KEY);
  await openAccount(page); await login(page);
  await expect(page.locator('.ma-account-sync')).toContainText('Progression sauvegardée');
  await page.getByRole('button', { name: 'Ma sauvegarde', exact: true }).click();
  await page.locator('#ma-daily-goal').selectOption('20');
  await expect.poll(() => backend.rows.get(ALICE)?.progress.settings.dailyGoal).toBe(20);
  await page.locator('[data-view="account"]').click();
  await page.getByRole('button', { name: 'Se déconnecter', exact: true }).click();
  await expect(page.locator('#ma-account-form')).toBeVisible();
  await expect(page.locator('.ma-xp')).toContainText('0 XP');
  expect(await localSave(page, SAVE_KEY)).toEqual(guest);
  await login(page, 'second@example.test');
  await expect(page.locator('.ma-account-sync')).toContainText('Progression sauvegardée');
  expect(await localSave(page, accountKey(BOB))).toEqual(bob);
  expect((await localSave(page, accountKey(ALICE)))?.settings.dailyGoal).toBe(20);
  await page.getByRole('button', { name: 'Ma sauvegarde', exact: true }).click();
  await expect(page.locator('#ma-daily-goal')).toHaveValue('15');
  await expect(page.locator('.ma-xp')).toContainText('0 XP');
  await page.locator('[data-view="account"]').click();
  await page.getByRole('button', { name: 'Se déconnecter', exact: true }).click();
  await expect(page.locator('#ma-account-form')).toBeVisible();
  await page.getByRole('button', { name: 'Ma sauvegarde', exact: true }).click();
  await expect(page.locator('#ma-daily-goal')).toHaveValue('5');
  expect(await localSave(page, SAVE_KEY)).toEqual(guest);
  const writesForBob = backend.calls.filter(call => call.path.endsWith('/save_learning_progress') && call.body?.p_user_id === BOB);
  expect(writesForBob).toEqual([]);
});

test('an expired old confirmation link offers login while discovery remains usable', async ({ page }) => {
  await provider(page);
  await page.goto('/malagasy-adventure#error=access_denied&error_code=otp_expired&error_description=expired');
  await expect(page.locator('#ma-account-message')).toContainText('invalide ou a expiré');
  await expect(page.locator('#ma-account-identifier')).toBeVisible();
  await page.getByRole('button', { name: /Continuer sans compte/ }).click();
  await expect(page.getByRole('button', { name: /Commencer l’aventure/ })).toBeVisible();
});

test('a network interruption retains account progress locally and a retry uploads the pending snapshot', async ({ page }) => {
  const backend = await provider(page, { progress: learned(), revision: 3 });
  await page.goto('/malagasy-adventure#account');
  await login(page);
  await expect(page.locator('.ma-account-sync')).toContainText('Progression sauvegardée');
  await page.getByRole('button', { name: 'Ma sauvegarde', exact: true }).click();
  backend.failNextWrite();
  await page.locator('#ma-daily-goal').selectOption('20');
  await expect(page.locator('#ma-account-reminder')).toContainText('Sauvegarde en attente');
  expect((await localSave(page, accountKey(ALICE)))?.settings.dailyGoal).toBe(20);
  expect(backend.rows.get(ALICE)?.revision).toBe(3);
  await page.locator('[data-view="account"]').click();
  await page.getByRole('button', { name: 'Synchroniser maintenant' }).click();
  await expect(page.locator('.ma-account-sync')).toContainText('Progression sauvegardée');
  expect(backend.rows.get(ALICE)).toMatchObject({ revision: 4, progress: { settings: { dailyGoal: 20 } } });
});
