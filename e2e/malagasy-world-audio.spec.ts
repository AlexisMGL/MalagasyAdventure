import { expect, test, type Page } from '@playwright/test';
import { CONTENT } from '../src/malagasy/content';
import { completeLesson, createProgress, introduceLesson, lessonAvailable, recordAnswer } from '../src/malagasy/engine';
import { parseSave, serializeSave } from '../src/malagasy/storage';
import type { CharacterId, Lesson, Progress } from '../src/malagasy/types';

interface VoiceRecord {
  source: string;
  events: string[];
  duration: number;
  endedAtSeconds: number;
  errors: (number | null)[];
}
interface VoiceAudit { records: VoiceRecord[]; active: number; maxConcurrent: number; synthCalls: number }
interface VisibleVoice { character: CharacterId; turnIndex: number; audioId: string; duration: number }
const FINISH_TIMEOUT = 45_000;

test.use({ reducedMotion: 'reduce' });

/** The fixture follows public engine rules and enters the app through its real JSON import. */
function saveBefore(lessonId: string): Progress {
  const targetIndex = CONTENT.lessons.findIndex(lesson => lesson.id === lessonId);
  expect(targetIndex).toBeGreaterThan(0);
  const start = Date.parse('2026-10-28T08:00:00.000Z');
  let tick = 0;
  const now = (): string => new Date(start + tick++ * 1000).toISOString();
  let progress = createProgress(now());
  for (const lesson of CONTENT.lessons.slice(0, targetIndex)) {
    expect(lessonAvailable(lesson, progress, CONTENT), lesson.id).toBe(true);
    progress = introduceLesson(progress, lesson, CONTENT);
    for (const exerciseId of lesson.exerciseIds) {
      const exercise = CONTENT.exercises.find(candidate => candidate.id === exerciseId)!;
      progress = recordAnswer(progress, exercise, true, now());
    }
    progress = completeLesson(progress, lesson, lesson.exerciseIds.length, lesson.exerciseIds.length, now());
    expect(progress.completedLessons).toContain(lesson.id);
  }
  expect(lessonAvailable(CONTENT.lessons[targetIndex], progress, CONTENT)).toBe(true);
  expect(progress.completedLessons).not.toContain(lessonId);
  expect(parseSave(serializeSave(progress), CONTENT)).toEqual(progress);
  return progress;
}

/** Observe native media events without replacing playback, file bytes or app state. */
async function observeVoices(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const NativeAudio = window.Audio;
    const elements: HTMLAudioElement[] = [];
    const records: VoiceRecord[] = [];
    let maxConcurrent = 0, synthCalls = 0;
    const audit = { snapshot: (): VoiceAudit => ({
      records: records.map(record => ({ ...record, events: [...record.events], errors: [...record.errors] })),
      active: elements.filter(element => !element.paused && !element.ended).length,
      maxConcurrent, synthCalls,
    }) };
    (window as unknown as { __WORLD_VOICE_AUDIT__: typeof audit }).__WORLD_VOICE_AUDIT__ = audit;
    const ObservedAudio = function (source?: string): HTMLAudioElement {
      const audio = new NativeAudio(source);
      if (source?.includes('/malagasy/voices/')) {
        const record: VoiceRecord = { source, events: [], duration: 0, endedAtSeconds: 0, errors: [] };
        elements.push(audio); records.push(record);
        for (const event of ['loadedmetadata', 'playing', 'ended', 'pause', 'error']) {
          audio.addEventListener(event, () => {
            record.events.push(event);
            if (Number.isFinite(audio.duration)) record.duration = audio.duration;
            if (event === 'ended') record.endedAtSeconds = audio.currentTime;
            if (event === 'error') record.errors.push(audio.error?.code ?? null);
            if (event === 'playing') maxConcurrent = Math.max(maxConcurrent, elements.filter(element => !element.paused && !element.ended).length);
          });
        }
      }
      return audio;
    };
    ObservedAudio.prototype = NativeAudio.prototype;
    Object.setPrototypeOf(ObservedAudio, NativeAudio);
    window.Audio = ObservedAudio as unknown as typeof Audio;
    const nativeSpeak = window.speechSynthesis.speak.bind(window.speechSynthesis);
    window.speechSynthesis.speak = utterance => { synthCalls++; nativeSpeak(utterance); };
  });
}
const audit = (page: Page): Promise<VoiceAudit> => page.evaluate(() => (window as unknown as {
  __WORLD_VOICE_AUDIT__: { snapshot(): VoiceAudit };
}).__WORLD_VOICE_AUDIT__.snapshot());

async function importAndOpenLesson(page: Page, lesson: Lesson): Promise<number> {
  const progress = saveBefore(lesson.id);
  await page.goto('/malagasy-adventure');
  await expect(page.locator('.ma-world-path')).toBeVisible();
  await expect(page.locator(`.ma-world-path [data-lesson="${lesson.id}"]`)).toBeDisabled();
  await page.locator('[data-view="backup"]').first().click();
  await page.locator('#ma-import-file').setInputFiles({
    name: `monde-1-avant-${lesson.id}.json`, mimeType: 'application/json', buffer: Buffer.from(serializeSave(progress)),
  });
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('Reprendre ce voyage ?');
  await expect(dialog).toContainText(`${progress.xp}`);
  await dialog.getByRole('button', { name: 'Remplacer mon carnet' }).click();
  await expect(dialog).not.toBeVisible();
  await page.locator('[data-view="path"]').first().click();
  const lessonButton = page.locator(`.ma-world-path [data-lesson="${lesson.id}"]`);
  await expect(lessonButton).toBeEnabled();
  await expect(lessonButton).toHaveAttribute('aria-current', 'step');
  await page.locator('[data-action="find-current-step"]').click();
  const before = (await audit(page)).records.length;
  await lessonButton.click();
  await expect(page.locator('.ma-dialogue-discovery')).toBeVisible();
  return before;
}

async function startedRecording(page: Page, before: number, audioId: string): Promise<number> {
  const indexOfStart = async (): Promise<number> => (await audit(page)).records.findIndex((record, index) =>
    index >= before && record.source.endsWith(`/${audioId}.wav`) && record.events.includes('playing'));
  await expect.poll(indexOfStart, { timeout: FINISH_TIMEOUT }).toBeGreaterThanOrEqual(before);
  return indexOfStart();
}

async function completedRecording(page: Page, before: number, audioId: string, character: CharacterId): Promise<VoiceRecord> {
  const index = await startedRecording(page, before, audioId);
  await expect.poll(async () => (await audit(page)).records[index]?.events.includes('ended'), { timeout: FINISH_TIMEOUT }).toBe(true);
  const record = (await audit(page)).records[index];
  expect(record.source).toMatch(new RegExp(`/malagasy/voices/omnivoice/masters/audio-neural-${character}-[a-f0-9]{16}\\.wav$`));
  expect(record.events).toContain('loadedmetadata');
  expect(record.duration).toBeGreaterThan(.2);
  expect(record.duration).toBeLessThan(40);
  expect(record.endedAtSeconds).toBeGreaterThanOrEqual(record.duration - .05);
  expect(record.errors).toEqual([]);
  expect((await audit(page)).maxConcurrent).toBeLessThanOrEqual(1);
  return record;
}

const cases = [
  { unit: 4, lessonId: 'lesson-04-02', sceneIndex: 0 },
  { unit: 8, lessonId: 'lesson-08-01', sceneIndex: 1 },
  // The third scene includes a new whole utterance combining incomprehension and a slow-repeat request.
  { unit: 12, lessonId: 'lesson-12-02', sceneIndex: 2 },
] as const;

for (const scenario of cases) test(`unit ${scenario.unit} plays both real OmniVoice characters after a v1 save import`, async ({ page }) => {
  test.setTimeout(150_000);
  const pageErrors: string[] = [], httpErrors: string[] = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('response', response => {
    if (response.url().includes('/malagasy/voices/') && response.status() >= 400) httpErrors.push(`${response.status()} ${response.url()}`);
  });
  await observeVoices(page);
  const lesson = CONTENT.lessons.find(candidate => candidate.id === scenario.lessonId)!;
  expect(lesson).toBeDefined();
  let before = await importAndOpenLesson(page, lesson);
  const targetVoices: VisibleVoice[] = [];
  for (let sceneIndex = 0; sceneIndex <= scenario.sceneIndex; sceneIndex++) {
    const scene = lesson.scenes![sceneIndex];
    const renderedScene = page.locator(`.ma-dialogue-discovery[data-scene-id="${scene.id}"]`);
    await expect(renderedScene).toBeVisible();
    for (let turnIndex = 0; turnIndex < scene.turns.length; turnIndex++) {
      if (turnIndex > 0) {
        before = (await audit(page)).records.length;
        await page.locator('[data-action="advance-dialogue"]').click();
      }
      const turn = scene.turns[turnIndex];
      const speech = renderedScene.locator(`.ma-speech[data-dialogue-turn="${turnIndex}"]`);
      await expect(speech.locator('.ma-speech-text')).toHaveText(turn.text);
      const replay = speech.locator('[data-action="replay-dialogue"]');
      await expect(replay).toBeEnabled();
      const audioId = await replay.getAttribute('data-audio-id');
      expect(audioId).toMatch(new RegExp(`^audio-neural-${turn.speaker}-[a-f0-9]{16}$`));
      const record = await completedRecording(page, before, audioId!, turn.speaker);
      if (sceneIndex === scenario.sceneIndex) targetVoices.push({ character: turn.speaker, turnIndex, audioId: audioId!, duration: record.duration });
    }
    if (sceneIndex < scenario.sceneIndex) {
      before = (await audit(page)).records.length;
      await page.locator('[data-action="advance-dialogue"]').click();
    }
  }
  expect(new Set(targetVoices.map(voice => voice.character))).toEqual(new Set(['lova', 'mia']));
  const targetScene = page.locator(`.ma-dialogue-discovery[data-scene-id="${lesson.scenes![scenario.sceneIndex].id}"]`);
  for (const character of ['lova', 'mia'] as const) {
    const voice = targetVoices.find(candidate => candidate.character === character)!;
    before = (await audit(page)).records.length;
    await targetScene.locator(`.ma-speech[data-dialogue-turn="${voice.turnIndex}"] [data-action="replay-dialogue"]`).click();
    await completedRecording(page, before, voice.audioId, character);
  }
  // Replacing an active replay must release its media element before the replacement starts.
  const longest = targetVoices.reduce((a, b) => a.duration >= b.duration ? a : b);
  const replay = targetScene.locator(`.ma-speech[data-dialogue-turn="${longest.turnIndex}"] [data-action="replay-dialogue"]`);
  before = (await audit(page)).records.length;
  await replay.click();
  await startedRecording(page, before, longest.audioId);
  before = (await audit(page)).records.length;
  await replay.click();
  await startedRecording(page, before, longest.audioId);
  await expect.poll(async () => (await audit(page)).active).toBe(1);
  expect((await audit(page)).maxConcurrent).toBe(1);
  await page.locator('[data-view="worlds"]').first().click();
  await expect(page.locator('.ma-journey-map')).toBeVisible();
  await expect.poll(async () => (await audit(page)).active).toBe(0);
  const final = await audit(page);
  expect(final.records.flatMap(record => record.errors)).toEqual([]);
  expect(final.synthCalls).toBe(0);
  expect(httpErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});
