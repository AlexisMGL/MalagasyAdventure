import { expect, test, type Page } from '@playwright/test';
import { CONTENT } from '../src/malagasy/content';
import { completeLesson, createProgress, introduceLesson, recordAnswer } from '../src/malagasy/engine';
import { COURSE_VOCABULARY } from '../src/malagasy/course-vocabulary';
import { getNotionCards } from '../src/malagasy/notion-cards';
import { SAVE_KEY, parseSave } from '../src/malagasy/storage';
import type { Progress } from '../src/malagasy/types';

test.use({ reducedMotion: 'reduce' });
function through(last: string): Progress {
  const now = '2026-11-02T08:00:00.000Z';
  let progress = createProgress(now);
  for (const lesson of CONTENT.lessons) {
    progress = introduceLesson(progress, lesson, CONTENT);
    for (const id of lesson.exerciseIds) progress = recordAnswer(progress, CONTENT.exercises.find(exercise => exercise.id === id)!, true, now);
    progress = completeLesson(progress, lesson, lesson.exerciseIds.length, lesson.exerciseIds.length, now);
    if (lesson.id === last) break;
  }
  expect(parseSave(JSON.stringify(progress), CONTENT)).toEqual(progress);
  return progress;
}
async function importProgress(page: Page, progress: Progress): Promise<void> {
  await page.goto('/malagasy-adventure#backup');
  await page.locator('#ma-import-file').setInputFiles({ name: 'carnet-v1.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(progress)) });
  await page.getByRole('dialog').getByRole('button', { name: 'Remplacer mon carnet' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
}
async function saved(page: Page): Promise<string | null> { return page.evaluate(key => localStorage.getItem(key), SAVE_KEY); }
async function fits(page: Page): Promise<void> { expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); }

test('a fresh carnet separates its two vocabulary cards and one notion, with four words and keyboard tabs', async ({ page }) => {
  await page.goto('/#vocabulary');
  await expect(page.getByRole('heading', { name: 'Mon carnet.' })).toBeVisible();
  await expect(page.locator('.ma-carnet-card')).toHaveCount(2);
  await page.getByRole('tab', { name: 'Vocabulaire', exact: true }).press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Notions', exact: true })).toBeFocused();
  await expect(page.locator('.ma-carnet-card')).toHaveCount(1);
  await page.getByRole('tab', { name: 'Notions', exact: true }).press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Malgache → Français', exact: true })).toBeFocused();
  await expect(page.locator('.ma-library-word')).toHaveCount(4);
  expect(await page.locator('.ma-library-word dt').allTextContents()).toEqual(['Azafady', 'Misaotra', 'Salama', 'Veloma']);
  await page.getByRole('tab', { name: 'Français → Malgache', exact: true }).click();
  expect(await page.locator('.ma-library-word dt').allTextContents()).toEqual(['Au revoir', 'Bonjour / salut', 'Merci', 'S’il vous plaît / excusez-moi']);
  await page.locator('#ma-search').fill('salama');
  await expect(page.locator('.ma-library-word')).toHaveCount(1);
  await expect(page.locator('.ma-library-word dd>strong')).toHaveText('Salama');
  await page.locator('#ma-search').fill('manoratra');
  await expect(page.locator('.ma-library-word')).toHaveCount(0);
  await expect(page.getByText('Aucun mot de vos leçons débloquées', { exact: false })).toBeVisible();
});

test('an old save opens a reference with new vocabulary and notions without changing progress', async ({ page }) => {
  await importProgress(page, through('lesson-04-01'));
  const before = await saved(page);
  await page.goto('/#vocabulary');
  await page.getByRole('tab', { name: 'Notions', exact: true }).click();
  await page.locator('#ma-search').fill('possession');
  await page.locator('[data-library-card="notion-04-02-2"]').click();
  await expect(page.locator('[data-reference-lesson]')).toHaveAttribute('data-reference-lesson', 'lesson-04-02');
  await expect(page.locator('[data-reference-card]')).toHaveAttribute('data-reference-card', 'notion-04-02-2');
  await expect(page.locator('.ma-notion-card')).toHaveCount(1);
  await expect(page.locator('.ma-notion-card')).toContainText('Ma mère, ta mère');
  expect(await saved(page)).toBe(before);
  await page.reload();
  await expect(page.locator('[data-reference-lesson]')).toHaveAttribute('data-reference-lesson', 'lesson-04-02');
  expect(await saved(page)).toBe(before);
  await page.getByRole('button', { name: '← Toutes les fiches de notions', exact: true }).click();
  await expect(page.getByRole('tab', { name: 'Notions', exact: true })).toHaveAttribute('aria-selected', 'true');
  await page.getByRole('tab', { name: 'Français → Malgache', exact: true }).click();
  await page.locator('#ma-search').fill('ma mère');
  const mother = page.locator('.ma-library-word').filter({ has: page.getByText('reniko', { exact: true }) });
  await expect(mother).toBeVisible();
  await mother.locator('[data-library-lesson]').click();
  await expect(page.locator('[data-reference-lesson]')).toHaveAttribute('data-reference-lesson', 'lesson-04-02');
  await expect(page.locator('.ma-notion-card')).toHaveCount(1);
  await expect(page.locator('.ma-notion-card')).toContainText('reniko');
  expect(await saved(page)).toBe(before);
});

test('a locked reference URL does not reveal a lesson, cards or audio controls', async ({ page }) => {
  await page.goto('/#vocabulary/lesson-02-01-01');
  await expect(page.getByText('Cette leçon n’est pas encore débloquée.', { exact: false })).toBeVisible();
  await expect(page.locator('[data-reference-lesson], [data-action="replay-notion"]')).toHaveCount(0);
  await expect(page.locator('.ma-carnet-card')).toHaveCount(2);
  await page.goto('/#vocabulary/lesson-07-01/notion-07-01-1');
  await expect(page.getByText('Cette fiche n’est pas disponible.', { exact: false })).toBeVisible();
  await expect(page.locator('[data-reference-card], [data-action="replay-notion"]')).toHaveCount(0);
  await page.goto('/#vocabulary/lesson-01-01/notion-07-01-1');
  await expect(page.locator('[data-reference-card], [data-action="replay-notion"]')).toHaveCount(0);
});

test('all v1-unlocked words appear in both alphabetic lexicons and links preserve the world path', async ({ page }) => {
  await importProgress(page, through(CONTENT.lessons.at(-1)!.id));
  const before = await saved(page);
  await page.goto('/#path/world-02');
  await page.getByRole('button', { name: 'Bibliothèque', exact: true }).click();
  await expect(page.locator('.ma-carnet-card')).toHaveCount(86);
  await page.getByRole('tab', { name: 'Notions', exact: true }).click();
  await expect(page.locator('.ma-carnet-card')).toHaveCount(86);
  for (const [label, locale] of [['Malgache → Français', 'mg'], ['Français → Malgache', 'fr']]) {
    await page.getByRole('tab', { name: label, exact: true }).click();
    await expect(page.locator('.ma-library-word')).toHaveCount(COURSE_VOCABULARY.length);
    const values = await page.locator('.ma-library-word dt').allTextContents();
    const collator = new Intl.Collator(locale, { sensitivity: 'base', ignorePunctuation: true });
    expect(values).toEqual([...values].sort(collator.compare));
  }
  await page.locator('#ma-search').fill('ecrire');
  await expect(page.locator('.ma-library-word dd>strong')).toContainText(['manoratra']);
  expect(await saved(page)).toBe(before);
  await page.locator('[data-view="path"]').first().click();
  await expect(page.locator('.ma-world-hero h2')).toHaveText('Antsirabe');
});

for (const width of [340, 390, 1440]) test(`library search, reference and alphabet fit ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 920 });
  await importProgress(page, through('lesson-07-03'));
  await page.goto('/#vocabulary');
  await fits(page);
  await page.screenshot({ path: `.tools/screens/library-lessons-${width}.png` });
  await page.locator('#ma-search').fill('chiffres');
  await expect(page.locator('.ma-carnet-card')).toHaveCount(4);
  await expect(page.locator('.ma-carnet-icon svg')).toHaveCount(4);
  await page.screenshot({ path: `.tools/screens/carnet-chiffres-${width}.png` });
  await page.locator('[data-library-card="notion-07-01-1"]').click();
  await expect(page.locator('.ma-notion-card')).toHaveCount(1);
  await expect(page.locator('.ma-notion-card h2')).toHaveText('De zéro à cinq');
  await fits(page);
  await page.screenshot({ path: `.tools/screens/carnet-fiche-${width}.png` });
  await page.getByRole('button', { name: '← Toutes les fiches de vocabulaire', exact: true }).click();
  await expect(page.locator('#ma-search')).toHaveValue('chiffres');
  await page.locator('#ma-search').fill('');
  await page.locator('.ma-carnet-index summary').click();
  await page.locator('[data-library-topic="numbers"]').click();
  await expect(page.locator('#ma-topic-numbers>h2')).toBeFocused();
  await page.getByRole('tab', { name: 'Malgache → Français', exact: true }).click();
  await fits(page);
  await page.getByRole('button', { name: 'Aller à la lettre A', exact: true }).click();
  await expect(page.locator('#ma-letter-A>h2')).toBeFocused();
  await page.screenshot({ path: `.tools/screens/library-lexicon-${width}.png` });
  await page.goto('/#vocabulary/lesson-05-02');
  await expect(page.locator('#ma-reference-vocabulary')).toContainText('ambany');
  await page.getByRole('button', { name: /Notions/ }).click();
  await expect(page.locator('#ma-reference-notion>h2')).toBeFocused();
  await fits(page);
  await page.screenshot({ path: `.tools/screens/library-reference-${width}.png` });
  await page.getByRole('button', { name: 'Pratiquer cette leçon', exact: true }).click();
  await expect(page.locator('.ma-notion-intro')).toBeVisible();
  await page.getByRole('tab', { name: /Vocabulaire/ }).click();
  await expect(page.locator('.ma-notion-choices button')).toHaveCount(getNotionCards('lesson-05-02').filter(card => card.section === 'vocabulary').length);
  await fits(page);
});

test('reference audio reuses a real whole recording and stops when leaving the library', async ({ page }) => {
  await page.addInitScript(() => {
    const Native = window.Audio;
    const events: string[] = [];
    const players: HTMLAudioElement[] = [];
    (window as unknown as { libraryAudioEvents: string[] }).libraryAudioEvents = events;
    (window as unknown as { libraryAudioActive: () => number }).libraryAudioActive = () => players.filter(audio => !audio.paused && !audio.ended).length;
    const Observed = function(source?: string): HTMLAudioElement {
      const audio = new Native(source);
      players.push(audio);
      audio.addEventListener('playing', () => events.push('playing'));
      audio.addEventListener('pause', () => events.push('pause'));
      return audio;
    };
    Observed.prototype = Native.prototype; Object.setPrototypeOf(Observed, Native); window.Audio = Observed as unknown as typeof Audio;
  });
  await page.goto('/#vocabulary/lesson-01-01/notion-01-01-1');
  const before = await saved(page);
  const audioResponse = page.waitForResponse(response => response.url().includes('/malagasy/voices/') && response.status() < 300);
  await page.locator('[data-action="replay-notion"]').first().click();
  expect((await (await audioResponse).body()).length).toBeGreaterThan(500);
  const events = () => page.evaluate(() => (window as unknown as { libraryAudioEvents: string[] }).libraryAudioEvents);
  await expect.poll(events).toContain('playing');
  await page.getByRole('button', { name: '← Toutes les fiches de vocabulaire', exact: true }).click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { libraryAudioActive: () => number }).libraryAudioActive())).toBe(0);
  expect(await saved(page)).toBe(before);
});

test('all individual cards and legacy learning references fit a narrow screen', async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 340, height: 920 });
  await importProgress(page, through(CONTENT.lessons.at(-1)!.id));
  for (const lesson of CONTENT.lessons.filter(lesson => lesson.kind !== 'checkpoint')) {
    await page.goto(`/#vocabulary/${lesson.id}`);
    await expect(page.locator('[data-reference-lesson]')).toHaveAttribute('data-reference-lesson', lesson.id);
    await fits(page);
    for (const card of getNotionCards(lesson.id)) {
      await page.goto(`/#vocabulary/${lesson.id}/${card.id}`);
      await expect(page.locator('[data-reference-card]')).toHaveAttribute('data-reference-card', card.id);
      await expect(page.locator('.ma-notion-card')).toHaveCount(1);
      await fits(page);
    }
  }
});
