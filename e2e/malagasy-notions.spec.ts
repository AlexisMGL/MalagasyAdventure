import { expect, test, type Page } from '@playwright/test';
import { CONTENT } from '../src/malagasy/content';
import { getNotionCards } from '../src/malagasy/notion-cards';
import { SAVE_KEY } from '../src/malagasy/storage';
import { readMiniLesson } from './lesson-flow';

test.use({ reducedMotion: 'reduce' });
const cards = getNotionCards(CONTENT.lessons[0].id);
async function openMiniLesson(page: Page): Promise<void> {
  await page.goto('/malagasy-adventure');
  await page.locator('[data-action="continue"]').click();
  await expect(page.locator('.ma-notion-intro')).toBeVisible();
}
async function introducedIds(page: Page): Promise<string[]> {
  return page.evaluate(key => {
    const raw = localStorage.getItem(key);
    return raw ? Object.keys(JSON.parse(raw).concepts) : [];
  }, SAVE_KEY);
}

test('short lessons introduce the notions before speech and remain available beside the dialogue', async ({ page }) => {
  await openMiniLesson(page);
  for (const [index, card] of cards.entries()) {
    await expect(page.locator('.ma-notion-intro h1')).toHaveText(card.title);
    await expect(page.locator('.ma-notion-heading')).toContainText(`${index + 1} / ${cards.length}`);
    await expect(page.locator('.ma-notion-rule')).toHaveText(card.rule);
    await expect(page.locator('.ma-notion-example')).toHaveCount(card.examples.length);
    await expect(page.locator('[data-dialogue-turn], #ma-exercise-form')).toHaveCount(0);
    await expect(page.locator('.ma-notion-card a')).toHaveCount(0);
    expect(await introducedIds(page)).toEqual([]);
    await page.locator('[data-action="advance-notion"]').click();
  }
  await expect(page.locator('.ma-dialogue-discovery')).toBeVisible();
  await expect(page.getByRole('complementary', { name: 'Pense-bête de la leçon' })).toBeVisible();
  await expect(page.locator('.ma-notion-aside h2')).toHaveText(cards[0].title);
  await page.locator('#ma-notion-select').selectOption('1');
  await expect(page.locator('.ma-notion-aside h2')).toHaveText(cards[1].title);
  await expect(page.locator('[data-dialogue-turn]')).toHaveCount(1);
  await page.locator('[data-action="advance-dialogue"]').click();
  await expect(page.locator('[data-dialogue-turn]')).toHaveCount(2);
  await expect(page.locator('.ma-notion-aside h2')).toHaveText(cards[1].title);
  expect(await introducedIds(page)).toEqual([]);
});

for (const width of [340, 390, 1440]) test(`the lesson and reminder fit a ${width}px screen`, async ({ page }) => {
  await page.setViewportSize({ width, height: 920 });
  await openMiniLesson(page);
  const fits = () => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
  expect(await fits()).toBe(true);
  await readMiniLesson(page);
  const reminder = page.locator('.ma-notion-aside'), dialogue = page.locator('.ma-dialogue-discovery');
  await expect(reminder).toBeVisible();
  expect(await fits()).toBe(true);
  const reminderBox = await reminder.boundingBox(), dialogueBox = await dialogue.boundingBox();
  expect(reminderBox).not.toBeNull(); expect(dialogueBox).not.toBeNull();
  if (width > 1180) expect(reminderBox!.x).toBeGreaterThan(dialogueBox!.x + dialogueBox!.width);
  else expect(reminderBox!.y + reminderBox!.height).toBeLessThan(dialogueBox!.y);
  await expect(reminder.locator('.ma-notion-mute')).toBeVisible();
  if (width <= 760) {
    const examples = reminder.locator('.ma-notion-example-disclosure');
    await expect(examples).not.toHaveAttribute('open');
    expect(dialogueBox!.y).toBeLessThan(700);
    await examples.locator('summary').click();
    await expect(examples.locator('.ma-notion-example').first()).toBeVisible();
    await page.locator('[data-action="advance-dialogue"]').click();
    await expect(reminder.locator('.ma-notion-example-disclosure')).toHaveAttribute('open');
  }
});

interface VoiceAudit { records: { source: string; rate: number; starts: number }[]; active: number; maxActive: number }
test('pronunciation uses whole existing recordings, stops on mute and never overlaps the dialogue', async ({ page }) => {
  await page.addInitScript(() => {
    const NativeAudio = window.Audio, players: HTMLAudioElement[] = [];
    const records: VoiceAudit['records'] = [];
    let maxActive = 0;
    const snapshot = (): VoiceAudit => ({ records: records.map(record => ({ ...record })),
      active: players.filter(player => !player.paused && !player.ended).length, maxActive });
    (window as unknown as { __NOTION_AUDIO__: typeof snapshot }).__NOTION_AUDIO__ = snapshot;
    const ObservedAudio = function (source?: string): HTMLAudioElement {
      const player = new NativeAudio(source);
      if (source) {
        players.push(player);
        const record = { source, rate: 1, starts: 0 }; records.push(record);
        player.addEventListener('playing', () => {
          record.rate = player.playbackRate; record.starts++;
          maxActive = Math.max(maxActive, players.filter(item => !item.paused && !item.ended).length);
        });
      }
      return player;
    };
    ObservedAudio.prototype = NativeAudio.prototype; Object.setPrototypeOf(ObservedAudio, NativeAudio);
    window.Audio = ObservedAudio as unknown as typeof Audio;
  });
  const audit = (): Promise<VoiceAudit> => page.evaluate(() => (window as unknown as { __NOTION_AUDIO__(): VoiceAudit }).__NOTION_AUDIO__());
  await openMiniLesson(page);
  expect((await audit()).records).toHaveLength(0);
  const example = cards[0].examples[0], asset = CONTENT.audio.find(item => item.id === example.audioId)!;
  await page.locator('.ma-notion-example').first().locator('.ma-notion-listen').first().click();
  await expect.poll(async () => (await audit()).records[0]?.starts).toBe(1);
  expect((await audit()).records[0]).toMatchObject({ source: asset.url, rate: 1 });
  await page.locator('.ma-notion-example').first().locator('.ma-notion-slow').click();
  await expect.poll(async () => (await audit()).records[1]?.starts).toBe(1);
  expect((await audit()).records[1].rate).toBe(.75);
  await page.locator('.ma-notion-mute').click();
  await expect.poll(async () => (await audit()).active).toBe(0);
  await page.locator('.ma-notion-example').first().locator('.ma-notion-listen').first().click();
  await expect(page.locator('#ma-toast')).toContainText('Le son est coupé');
  expect((await audit()).records).toHaveLength(2);
  await page.locator('.ma-notion-mute').click();
  expect((await audit()).records).toHaveLength(2);
  await readMiniLesson(page);
  await expect.poll(async () => (await audit()).records.length).toBe(3);
  await page.locator('#ma-notion-select').selectOption('1');
  expect((await audit()).records).toHaveLength(3);
  expect((await audit()).maxActive).toBeLessThanOrEqual(1);
  await page.locator('[data-action="exit-lesson"]').click();
  await expect.poll(async () => (await audit()).active).toBe(0);
});
