import { expect, test, type Page } from '@playwright/test';
import { CONTENT } from '../src/malagasy/content';
import { HISTORY_BOOKS } from '../src/malagasy/history-books';
import { completeLesson, createProgress, introduceLesson, normalizeAnswer, recordAnswer } from '../src/malagasy/engine';
import { tokensFor } from '../src/malagasy/exercise-view';
import { RECOVERY_KEY, SAVE_KEY } from '../src/malagasy/storage';
import type { Exercise, Progress } from '../src/malagasy/types';
import { readMiniLesson } from './lesson-flow';

test.use({ reducedMotion: 'reduce' });

/** Inspect the genuine browser save; never inject answers, progress or a testing API. */
async function savedProgress(page: Page): Promise<Progress> {
  const saved = await page.evaluate(key => localStorage.getItem(key), SAVE_KEY);
  expect(saved).not.toBeNull();
  return JSON.parse(saved!) as Progress;
}
async function openAdventure(page: Page): Promise<void> {
  await page.goto('/malagasy-adventure');
  await expect(page.locator('h1')).toContainText('Un nouveau monde');
}
async function clickData(page: Page, attribute: string, value: string): Promise<void> {
  const candidates = page.locator(`[data-${attribute}]`);
  const values = await candidates.evaluateAll((nodes, key) => nodes.map(node => node.getAttribute(`data-${key}`)), attribute);
  const index = values.indexOf(value);
  expect(index, `A real button for data-${attribute}=${value} must exist`).toBeGreaterThanOrEqual(0);
  await candidates.nth(index).click();
}
async function answerCorrectly(page: Page, exercise: Exercise): Promise<void> {
  if (exercise.type === 'match') {
    for (const pair of exercise.pairs ?? []) {
      await clickData(page, 'left', pair.left);
      await clickData(page, 'right', pair.right);
    }
  } else if (exercise.type === 'order') {
    const tokens = tokensFor(exercise), used = new Set<number>();
    for (const word of exercise.answers[0].split(' ')) {
      const index = tokens.findIndex((token, candidate) => !used.has(candidate) && normalizeAnswer(token) === normalizeAnswer(word));
      expect(index, `The word bank must contain ${word}`).toBeGreaterThanOrEqual(0);
      used.add(index);
      await page.locator(`[data-token="${index}"]`).click();
    }
  } else if (exercise.type === 'translate' || exercise.type === 'cloze') {
    await page.locator('#ma-answer').fill(exercise.answers[0]);
  } else {
    await clickData(page, 'choice', exercise.answers[0]);
  }
}
async function answerIncorrectly(page: Page, exercise: Exercise): Promise<void> {
  if (exercise.type === 'match') {
    const pairs = exercise.pairs!;
    for (const [index, pair] of pairs.entries()) {
      await clickData(page, 'left', pair.left);
      await clickData(page, 'right', pairs[(index + 1) % pairs.length].right);
    }
  } else if (exercise.type === 'order') {
    await page.locator('[data-token]').first().click();
  } else if (exercise.type === 'translate' || exercise.type === 'cloze') {
    await page.locator('#ma-answer').fill('réponse volontairement incorrecte');
  } else {
    const wrong = exercise.choices!.find(choice => !exercise.answers.some(answer => normalizeAnswer(choice) === normalizeAnswer(answer)));
    expect(wrong).toBeDefined();
    await clickData(page, 'choice', wrong!);
  }
}
async function finishSession(page: Page, seenTypes = new Set<string>(), correct = true): Promise<number> {
  await beginPractice(page);
  let answered = 0;
  for (; answered < 100; answered++) {
    if (await page.locator('.ma-completion').count()) break;
    const task = page.locator('[data-exercise-id]');
    // The type label is decorative and intentionally hidden in mobile focus mode.
    await expect(page.locator('#ma-question')).toBeVisible();
    await expect(task).toHaveCount(1);
    const exerciseId = await task.getAttribute('data-exercise-id');
    const exercise = CONTENT.exercises.find(candidate => candidate.id === exerciseId);
    expect(exercise, `The displayed task ${exerciseId} belongs to the authored content`).toBeDefined();
    seenTypes.add(exercise!.type);
    const unitQuiz = (await page.locator('.ma-exercise-location > span').textContent())?.startsWith('QUIZ FINAL');
    if (unitQuiz) await expect(page.locator('.ma-speech-translation')).toHaveCount(0);
    await expect(page.locator('#ma-submit')).toBeDisabled();
    if (correct) await answerCorrectly(page, exercise!);
    else await answerIncorrectly(page, exercise!);
    await page.locator('#ma-submit').click();
    await expect(page.locator(`.ma-feedback.${correct ? 'correct' : 'incorrect'}`)).toBeVisible();
    if (unitQuiz && exercise!.dialogue?.length) expect(await page.locator('.ma-speech-translation').count()).toBeGreaterThan(0);
    await page.locator('[data-action="next-exercise"]').click();
  }
  expect(answered).toBeLessThan(100);
  await expect(page.locator('.ma-completion')).toBeVisible();
  await expect(page.locator('.ma-completion-stats')).toContainText(correct ? '100 %' : '0 %');
  return answered;
}
async function startLesson(page: Page, id: string): Promise<void> {
  const lesson = CONTENT.lessons.find(item => item.id === id)!;
  const world = CONTENT.worlds.find(item => item.id === lesson.worldId)!;
  await page.locator('[data-view="path"]').first().click();
  await page.locator(`[data-path-world="${lesson.worldId}"]`).first().click();
  await page.locator(`[data-lesson="${id}"]`).click();
  await readMiniLesson(page);
  await expect(page.locator('.ma-session h1')).toBeVisible();
  await expect(page.locator('.ma-position-rail')).toContainText(`MONDE ${world.number}`);
}

/** Build a valid old-format carnet through the real engine, then use the user's import flow. */
function carnetThrough(lastLessonId: string): Progress {
  const at = '2026-10-29T08:00:00.000Z';
  let progress = createProgress(at);
  for (const lesson of CONTENT.lessons) {
    progress = introduceLesson(progress, lesson, CONTENT);
    for (const exerciseId of lesson.exerciseIds) progress = recordAnswer(progress, CONTENT.exercises.find(exercise => exercise.id === exerciseId)!, true, at);
    progress = completeLesson(progress, lesson, lesson.exerciseIds.length, lesson.exerciseIds.length, at);
    if (lesson.id === lastLessonId) return progress;
  }
  throw new Error(`Unknown lesson ${lastLessonId}`);
}
async function importCarnet(page: Page, progress: Progress): Promise<void> {
  await page.locator('[data-view="backup"]').first().click();
  await page.locator('#ma-import-file').setInputFiles({ name: 'carnet-v1.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(progress)) });
  await page.getByRole('dialog').getByRole('button', { name: 'Remplacer mon carnet' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
}
async function beginPractice(page: Page): Promise<void> {
  await readMiniLesson(page);
  // Dialogue turns and scenes are genuinely traversed before the practice button appears.
  for (let step = 0; step < 40; step++) {
    if (await page.locator('[data-action="begin-exercises"]').count()) {
      await page.locator('[data-action="begin-exercises"]').click();
      return;
    }
    if (await page.locator('#ma-exercise-form').count()) return;
    await expect(page.locator('[data-action="advance-dialogue"]')).toBeVisible();
    await page.locator('[data-action="advance-dialogue"]').click();
  }
  throw new Error('The short dialogue should reach practice within forty advances');
}
async function noHorizontalOverflow(page: Page): Promise<void> {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'The view fits the device width').toBe(true);
}

for (const width of [340, 1440]) for (const worldId of ['world-01', 'world-02']) {
  test(`illustrated history booklet ${worldId} reads and quizzes at ${width}px without changing the carnet`, async ({ page }) => {
    await page.setViewportSize({ width, height: 960 });
    await openAdventure(page);
    await importCarnet(page, carnetThrough(worldId === 'world-01' ? 'lesson-06-03' : 'lesson-02-06-03'));
    await page.locator('[data-view="path"]').first().click();
    await page.locator(`.ma-world-switcher [data-path-world="${worldId}"]`).click();
    const before = await savedProgress(page);
    await page.locator(`[data-history-world="${worldId}"]`).click();
    const dialog = page.getByRole('dialog'), book = HISTORY_BOOKS[worldId];
    await expect(dialog.locator('.ma-history-chapters button')).toHaveCount(6);
    for (let index = 0; index < book.pages.length; index++) {
      await dialog.locator(`.ma-history-chapters [data-history-page="${index}"]`).click();
      await expect(dialog.locator('.ma-history-page-title')).toHaveText(book.pages[index].title);
      await expect(dialog.locator('.ma-history-drawing')).toBeVisible();
      await noHorizontalOverflow(page);
      if (index === 0 || index === 2) await dialog.screenshot({ path: `.tools/screens/history-book-${worldId}-${width}-${index}.png` });
    }
    await dialog.getByRole('button', { name: 'Passer aux questions' }).click();
    await expect(dialog.locator('[data-action="history-check"]')).toBeDisabled();
    for (let index = 0; index < book.questions.length; index++) await dialog.locator(`[data-question="${index}"][data-option="${(book.questions[index].answer + 1) % 3}"]`).click();
    await dialog.locator('[data-action="history-check"]').click();
    await expect(dialog.locator('.ma-history-score strong')).toHaveText('0 / 6');
    await expect(dialog.locator('.ma-history-explanation')).toHaveCount(6);
    await dialog.locator('[data-action="history-retry"]').click();
    for (let index = 0; index < book.questions.length; index++) await dialog.locator(`[data-question="${index}"][data-option="${book.questions[index].answer}"]`).click();
    await dialog.locator('[data-action="history-check"]').click();
    await expect(dialog.locator('.ma-history-score strong')).toHaveText('6 / 6');
    await expect(dialog.locator('a[href]')).toHaveCount(0);
    await noHorizontalOverflow(page);
    await dialog.screenshot({ path: `.tools/screens/history-book-${worldId}-${width}-quiz.png` });
    await dialog.getByRole('button', { name: 'Reprendre mon voyage' }).click();
    expect(await savedProgress(page)).toEqual(before);
  });
}

test('new words appear in a gradual illustrated dialogue before the first exercise', async ({ page }) => {
  await openAdventure(page);
  await startLesson(page, CONTENT.lessons[0].id);
  await expect(page.locator('.ma-dialogue-discovery .ma-character')).toHaveCount(2);
  await expect(page.locator('[data-dialogue-turn]')).toHaveCount(1);
  await expect(page.locator('.ma-speech-text')).toHaveText('Salama!');
  const translation = page.locator('.ma-speech-translation').first();
  await expect(translation).not.toHaveAttribute('open');
  await expect(translation.locator('p')).toBeHidden();
  await translation.locator('summary').click();
  await expect(translation.locator('p')).toHaveText('Bonjour !');
  await expect(translation.locator('p')).toBeVisible();
  await expect(page.locator('#ma-exercise-form')).toHaveCount(0);
  await expect(page.locator('.ma-optional-help')).not.toHaveAttribute('open');
  await page.locator('[data-action="advance-dialogue"]').click();
  await expect(page.locator('[data-dialogue-turn]')).toHaveCount(2);
  await expect(page.locator('.ma-position-rail')).toContainText('Unité 1');
  await expect(page.locator('.ma-part-trail')).toHaveAttribute('aria-label', 'Partie 1 sur 3');
  await beginPractice(page);
  await expect(page.locator('.ma-dialogue-practice .ma-character')).toHaveCount(2);
  await expect(page.locator('.ma-position-rail')).toContainText('Unité 1');
  await expect(page.locator('.ma-exercise-location')).toContainText('PARTIE 1');
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
});

test('leaving an unfinished discovery never exposes its unseen words in review', async ({ page }) => {
  await openAdventure(page);
  const first = CONTENT.lessons[0];
  await startLesson(page, first.id);
  await expect(page.locator('[data-dialogue-turn]')).toHaveCount(1);
  const introducedBeforePractice = () => page.evaluate(key => {
    const raw = localStorage.getItem(key);
    return raw ? Object.keys(JSON.parse(raw).concepts) : [];
  }, SAVE_KEY);
  expect(await introducedBeforePractice()).toEqual([]);
  await page.locator('[data-view="reviews"]').click();
  await expect(page.locator('.ma-concept-card')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Lancer une révision' })).toHaveCount(0);
  await startLesson(page, first.id);
  await beginPractice(page);
  const progress = await savedProgress(page);
  expect(Object.keys(progress.concepts).sort()).toEqual([...first.introduces].sort());
  expect(progress.history).toEqual([]);
  expect(progress.completedLessons).toEqual([]);
  expect(progress.xp).toBe(0);
});

test.describe('expressive answer feedback', () => {
  test.use({ reducedMotion: 'no-preference' });
  test('success has a short celebration while mistakes receive a quiet correction', async ({ page }) => {
    await openAdventure(page);
    await startLesson(page, CONTENT.lessons[0].id);
    await beginPractice(page);
    const firstId = await page.locator('[data-exercise-id]').getAttribute('data-exercise-id');
    const first = CONTENT.exercises.find(exercise => exercise.id === firstId)!;
    const translation = page.locator('.ma-speech-translation').first();
    await translation.locator('summary').click();
    await expect(translation).toHaveAttribute('open');
    await answerCorrectly(page, first);
    // Choosing a reply updates its controls without closing an optional translation.
    await expect(translation).toHaveAttribute('open');
    await page.locator('#ma-submit').click();
    await expect(page.locator('.ma-answer-success')).toBeVisible();
    await expect(page.locator('.ma-reward-stars span')).toHaveCount(8);
    await expect(page.locator('.ma-reward-success .ma-character-happy')).toBeVisible();
    const animation = await page.locator('.ma-reward-stars span').first().evaluate(node => {
      const style = getComputedStyle(node);
      return { name: style.animationName, durations: style.animationDuration.split(',').map(duration => parseFloat(duration)) };
    });
    expect(animation.name).not.toBe('none');
    expect(Math.max(...animation.durations)).toBeLessThanOrEqual(1.2);
    const afterSuccess = await savedProgress(page);
    expect(afterSuccess.xp).toBe(10);
    await page.locator('[data-action="next-exercise"]').click();
    await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
    const secondId = await page.locator('[data-exercise-id]').getAttribute('data-exercise-id');
    await answerIncorrectly(page, CONTENT.exercises.find(exercise => exercise.id === secondId)!);
    await page.locator('#ma-submit').click();
    await expect(page.locator('.ma-answer-encouragement')).toBeVisible();
    await expect(page.locator('.ma-reward-encouragement')).toBeVisible();
    await expect(page.locator('.ma-correction')).toContainText('On dit');
    await expect(page.locator('.ma-reward-stars')).toHaveCount(0);
    expect((await savedProgress(page)).xp).toBe(afterSuccess.xp);
  });
});

test('muting persists and reduced motion disables the character and reward animations', async ({ page }) => {
  await openAdventure(page);
  await page.locator('.ma-sound').click();
  expect((await savedProgress(page)).settings.muted).toBe(true);
  await page.reload();
  await expect(page.locator('.ma-sound')).toHaveAttribute('aria-label', 'Activer les sons');
  await startLesson(page, CONTENT.lessons[0].id);
  const characterAnimations = await page.locator('.ma-character-body, .ma-character-eyes, .ma-character-wave')
    .evaluateAll(nodes => nodes.map(node => getComputedStyle(node).animationName));
  expect(characterAnimations.length).toBeGreaterThan(0);
  expect(characterAnimations.every(name => name === 'none')).toBe(true);
  await beginPractice(page);
  const exerciseId = await page.locator('[data-exercise-id]').getAttribute('data-exercise-id');
  await answerCorrectly(page, CONTENT.exercises.find(exercise => exercise.id === exerciseId)!);
  await page.locator('#ma-submit').click();
  await expect(page.locator('.ma-reward-success')).toBeVisible();
  expect(await page.locator('.ma-reward-stars span').first().evaluate(node => getComputedStyle(node).animationName)).toBe('none');
  expect((await savedProgress(page)).settings.muted).toBe(true);
});

test('standalone root and historical entry open the same lightweight app with twenty destinations', async ({ page }) => {
  const errors: string[] = [], requests: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => requests.push(request.url()));
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('Un nouveau monde');
  await expect(page.locator('.arcade-game')).toHaveCount(0);
  await page.goto('/malagasy-adventure');
  await expect(page).toHaveURL(/\/malagasy-adventure$/);
  await expect(page.locator('h1')).toContainText('Un nouveau monde');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(page.locator('canvas')).toHaveCount(0);
  expect(requests.some(url => /phaser|ArenaRenderer|ShooterRenderer/.test(url))).toBe(false);
  await expect(page.locator('[data-lesson]').first()).toBeEnabled();
  await expect(page.locator('[data-lesson]').nth(1)).toBeDisabled();
  await expect(page.locator('[data-lesson]')).toHaveCount(CONTENT.lessons.filter(lesson => lesson.worldId === 'world-01').length);
  await expect(page.locator('[data-path-world="world-02"]')).toBeDisabled();
  await page.locator('[data-view="worlds"]').click();
  await expect(page.locator('.ma-destination[data-world]')).toHaveCount(20);
  await expect(page.locator('.ma-journey-map [data-world]')).toHaveCount(20);
  await expect(page.locator('.ma-destination.open')).toHaveCount(CONTENT.worlds.filter(world => world.implemented).length);
  await page.locator('.ma-destination[data-world="world-20"]').click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('DESTINATION EN PRÉPARATION');
  await expect(dialog).toContainText('Les constructions à découvrir');
  await expect(dialog.locator('[data-view="path"]')).toHaveCount(0);
  await dialog.getByRole('button', { name: 'Fermer', exact: true }).click();
  const firstMapStop = page.locator('.ma-journey-map [data-world="world-01"]');
  await firstMapStop.focus();
  await firstMapStop.press('Enter');
  await expect(dialog).toContainText('12 UNITÉS');
  await dialog.getByRole('button', { name: 'Retrouver ce parcours' }).click();
  await page.reload();
  await expect(page.locator('h1')).toContainText('Un nouveau monde');
  expect(errors).toEqual([]);
});

test('each historical interlude unlocks only after its midpoint quiz and survives a v1 import', async ({ page }) => {
  await openAdventure(page);
  const milestone = page.locator('[data-history-milestone="world-01"]');
  await expect(milestone).toContainText('Validez le quiz de l’unité 6');
  await expect(milestone.locator('button')).toBeDisabled();
  const order = await page.locator('.ma-world-path').evaluate(node => [...node.children].map(child => child.getAttribute('data-history-milestone') ?? child.querySelector('h3')?.id ?? ''));
  expect(order.indexOf('world-01')).toBeGreaterThan(order.indexOf('ma-route-unit-06'));
  expect(order.indexOf('world-01')).toBeLessThan(order.indexOf('ma-route-unit-07'));
  const dialog = page.getByRole('dialog');
  await importCarnet(page, carnetThrough('lesson-06-02'));
  await page.locator('[data-view="path"]').first().click();
  await expect(milestone.locator('button')).toBeDisabled();
  await importCarnet(page, carnetThrough('lesson-06-03'));
  await page.locator('[data-view="path"]').first().click();
  await milestone.locator('button').click();
  await expect(dialog).toContainText('Andrianampoinimerina');
  await expect(dialog).toContainText('Radama Ier');
  await expect(dialog.locator('.ma-history-chapters button')).toHaveCount(6);
  await expect(dialog.locator('.ma-history-drawing')).toBeVisible();
  await expect(dialog.locator('a[href^="https://"]')).toHaveCount(0);
  await dialog.getByRole('button', { name: 'Reprendre mon voyage' }).click();
  await importCarnet(page, carnetThrough('lesson-02-06-02'));
  await page.locator('[data-view="path"]').first().click();
  await page.locator('[data-path-world="world-02"]').first().click();
  const second = page.locator('[data-history-milestone="world-02"]');
  await expect(second.locator('button')).toBeDisabled();
  await importCarnet(page, carnetThrough('lesson-02-06-03'));
  await page.locator('[data-view="path"]').first().click();
  await second.locator('button').click();
  await dialog.locator('.ma-history-chapters [data-history-page="1"]').click();
  await expect(dialog).toContainText('1817');
  await dialog.locator('.ma-history-chapters [data-history-page="3"]').click();
  await expect(dialog).toContainText('London Missionary Society');
  await dialog.locator('.ma-history-chapters [data-history-page="4"]').click();
  await expect(dialog).toContainText('colonie anglaise');
  await expect(dialog.locator('a[href^="https://"]')).toHaveCount(0);
  await dialog.getByRole('button', { name: 'Reprendre mon voyage' }).click();
  await page.reload();
  await expect(second.locator('button')).toBeEnabled();
  await page.locator('[data-view="worlds"]').click();
  await page.locator('.ma-destination[data-world="world-07"]').click();
  await expect(dialog).toContainText('DESTINATION EN PRÉPARATION');
  await expect(dialog.locator('[data-action="open-history"]')).toHaveCount(0);
});

test('the real midpoint quiz offers its historical pause and then continues to unit seven in both worlds', async ({ page }) => {
  await openAdventure(page);
  for (const sample of [
    { before: 'lesson-06-02', quiz: 'lesson-06-03', next: 'lesson-07-01', world: 'world-01', title: 'Des royaumes et des souverains' },
    { before: 'lesson-02-06-02', quiz: 'lesson-02-06-03', next: 'lesson-02-07-01', world: 'world-02', title: 'Radama Ier : alliances et école' },
  ]) {
    const carnet = carnetThrough(sample.before);
    carnet.settings.muted = true;
    await importCarnet(page, carnet);
    await startLesson(page, sample.quiz);
    await expect(page.locator('.ma-history-completion')).toHaveCount(0);
    await finishSession(page);
    const pause = page.locator('.ma-history-completion');
    await expect(pause).toContainText('L’intermède historique est débloqué.');
    await pause.locator(`[data-history-world="${sample.world}"]`).click();
    await expect(page.getByRole('dialog')).toContainText(sample.title);
    await page.getByRole('dialog').getByRole('button', { name: 'Reprendre mon voyage' }).click();
    await expect(page.locator('.ma-completion')).toBeVisible();
    await page.getByRole('button', { name: 'Cap sur l’unité 7' }).click();
    await expect(page.locator('.ma-notion-intro h1')).toHaveText(CONTENT.lessons.find(lesson => lesson.id === sample.next)!.title);
    expect((await savedProgress(page)).completedLessons).toContain(sample.quiz);
  }
});

test('the completed first world offers Antsirabe directly from its main card', async ({ page }) => {
  await openAdventure(page);
  await importCarnet(page, carnetThrough('lesson-12-03'));
  await page.locator('[data-view="path"]').first().click();
  const nextWorld = page.locator('.ma-world-hero [data-action="open-world-path"][data-path-world="world-02"]');
  await expect(nextWorld).toHaveText('Cap sur Antsirabe');
  await nextWorld.click();
  await expect(page.locator('.ma-world-hero h2')).toHaveText('Antsirabe');
  await expect(page.locator('[data-lesson="lesson-02-01-01"]')).toBeEnabled();
});

for (const width of [340, 390, 768, 1024, 1440]) test(`Antsirabe opens from an existing carnet and its clock lesson fits ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 920 });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await openAdventure(page);
  await importCarnet(page, carnetThrough('lesson-02-02-03'));
  await page.locator('[data-view="path"]').first().click();
  await page.locator('[data-path-world="world-02"]').first().click();
  await expect(page.locator('.ma-world-hero h2')).toHaveText('Antsirabe');
  await expect(page.locator('[data-lesson]')).toHaveCount(36);
  await expect(page.locator('[data-history-milestone="world-02"] button')).toBeDisabled();
  await noHorizontalOverflow(page);
  await page.locator('[data-lesson="lesson-02-03-01"]').click();
  await expect(page.locator('.ma-notion-intro')).toBeVisible();
  await expect(page.locator('.ma-position-rail')).toContainText('MONDE 2');
  await expect(page.locator('.ma-position-rail')).toContainText('ANTSIRABE');
  await expect(page.getByRole('tab', { name: /Vocabulaire/ })).toBeVisible();
  await expect(page.getByRole('tab', { name: /Notions/ })).toBeVisible();
  await expect(page.locator('.ma-learning-clock')).toHaveCount(3);
  for (const hour of [6, 8, 9]) {
    await expect(page.locator(`.ma-learning-clock[data-hour="${hour}"]`)).toHaveAttribute('aria-label', new RegExp(`${hour} h 00`));
  }
  await noHorizontalOverflow(page);
  await page.getByRole('tab', { name: /Notions/ }).click();
  await expect(page.locator('.ma-notion-card h2')).toHaveText('Demander l’heure');
  await noHorizontalOverflow(page);
  await readMiniLesson(page);
  await expect(page.locator('.ma-scene-location')).toContainText('Antsirabe');
  await expect(page.locator('.ma-notion-aside')).toBeVisible();
  await expect(page.locator('.ma-notion-aside h2')).toHaveText('Demander l’heure');
  await noHorizontalOverflow(page);
  await page.locator('[data-action="exit-lesson"]').click();
  await page.reload();
  await expect(page.locator('.ma-world-hero h2')).toHaveText('Antsirabe');
  await expect(page.locator('[data-lesson="lesson-02-03-01"]')).toBeEnabled();
  await page.locator('[data-view="worlds"]').first().click();
  await page.locator('.ma-destination[data-world="world-03"]').click();
  await expect(page.getByRole('dialog')).toContainText('DESTINATION EN PRÉPARATION');
  await noHorizontalOverflow(page);
  expect(errors).toEqual([]);
});

test('all seventy-two lessons are reachable through real exercises and progress survives reload', async ({ page }) => {
  test.setTimeout(900_000);
  const errors: string[] = [], seenTypes = new Set<string>();
  page.on('pageerror', error => errors.push(error.message));
  await openAdventure(page);
  await page.locator('[data-action="mute"]').click();
  let answered = 0;
  for (const lesson of CONTENT.lessons) {
    await startLesson(page, lesson.id);
    if (lesson.kind === 'checkpoint') {
      await expect(page.locator('.ma-quiz-intro')).toBeVisible();
      await expect(page.locator('.ma-quiz-facts')).toContainText('12 questions');
      await expect(page.locator('.ma-quiz-ribbon')).toContainText(`UNITÉ ${CONTENT.units.find(unit => unit.id === lesson.unitId)!.number}`);
    }
    answered += await finishSession(page, seenTypes);
    if (lesson.kind === 'checkpoint') {
      const unit = CONTENT.units.find(unit => unit.id === lesson.unitId)!;
      const world = CONTENT.worlds.find(item => item.id === lesson.worldId)!;
      await expect(page.locator('.ma-unit-finale h1')).toHaveText(unit.number === 12 ? `Monde ${world.number} terminé !` : `Unité ${unit.number} terminée !`);
      await expect(page.locator('.ma-unit-passport:not(.ma-history-completion)')).toContainText('Vous savez maintenant');
      for (const objective of unit.objectives) await expect(page.locator('.ma-unit-passport:not(.ma-history-completion)')).toContainText(objective);
      if (unit.number < 12) await expect(page.getByRole('button', { name: `Cap sur l’unité ${unit.number + 1}` })).toBeVisible();
      else if (world.number === 1) await expect(page.getByRole('button', { name: 'Cap sur Antsirabe' })).toBeVisible();
    } else {
      await expect(page.locator('.ma-unit-finale')).toHaveCount(0);
      await expect(page.locator('.ma-completion h1')).toContainText('Partie');
    }
    const saved = await savedProgress(page);
    expect(saved.completedLessons).toContain(lesson.id);
    expect(saved.history).toHaveLength(answered);
    await page.reload();
    await expect(page.locator(`[data-lesson="${lesson.id}"]`)).toHaveClass(/done/);
    const unit = CONTENT.units.find(item => item.id === lesson.unitId)!;
    if (lesson.kind === 'checkpoint' && unit.number === 6) {
      await expect(page.locator(`[data-history-milestone="${lesson.worldId}"] button`)).toBeEnabled();
    }
    if (lesson.id === 'lesson-12-03') {
      await expect(page.locator('.ma-world-hero [data-action="open-world-path"][data-path-world="world-02"]')).toHaveText('Cap sur Antsirabe');
    }
  }
  const finished = await savedProgress(page);
  expect(finished.completedLessons).toEqual(CONTENT.lessons.map(lesson => lesson.id));
  expect(finished.achievements).toEqual(expect.arrayContaining(['first-lesson', 'three-lessons', 'first-unit']));
  expect(Object.keys(finished.concepts)).toHaveLength(CONTENT.concepts.length);
  expect(finished.xp).toBe(25 * CONTENT.lessons.length + 10 * finished.rewardedExercises.length);
  expect(seenTypes).toEqual(new Set(CONTENT.exercises.map(exercise => exercise.type)));
  await page.locator('[data-view="stats"]').click();
  await expect(page.locator('.ma-main')).toContainText('24 / 24 unités validées');
  await page.locator('[data-view="reviews"]').click();
  await page.getByRole('button', { name: 'Lancer une révision' }).click();
  await finishSession(page);
  const reviewed = await savedProgress(page);
  expect(reviewed.completedLessons).toHaveLength(CONTENT.lessons.length);
  expect(reviewed.history.length).toBeGreaterThan(finished.history.length);
  expect(errors).toEqual([]);
});

test('replaying a lesson rewards only new exercise IDs and keeps prior completion', async ({ page }) => {
  await openAdventure(page);
  const first = CONTENT.lessons[0];
  await startLesson(page, first.id);
  await finishSession(page);
  for (let repeat = 0; repeat < 2; repeat++) {
    const before = await savedProgress(page);
    await startLesson(page, first.id);
    await finishSession(page);
    const after = await savedProgress(page);
    const newRewards = after.rewardedExercises.filter(id => !before.rewardedExercises.includes(id));
    expect(after.xp - before.xp).toBe(newRewards.length * 10);
    expect(after.completedLessons).toEqual([first.id]);
    expect(new Set(after.rewardedExercises).size).toBe(after.rewardedExercises.length);
  }
});

test('a failed replay offers practice while retaining the previously validated lesson', async ({ page }) => {
  await openAdventure(page);
  const first = CONTENT.lessons[0];
  await startLesson(page, first.id);
  await finishSession(page);
  const before = await savedProgress(page);
  await startLesson(page, first.id);
  await finishSession(page, new Set(), false);
  await expect(page.locator('.ma-completion h1')).toHaveText('On reprend ensemble ?');
  await expect(page.getByRole('button', { name: 'Réessayer cette partie' })).toBeVisible();
  const after = await savedProgress(page);
  expect(after.completedLessons).toEqual(before.completedLessons);
  expect(after.xp).toBe(before.xp);
  await page.locator('[data-view="path"]').first().click();
  await expect(page.locator(`[data-lesson="${first.id}"]`)).toHaveClass(/done/);
  await expect(page.locator(`[data-lesson="${CONTENT.lessons[1].id}"]`)).toBeEnabled();
});

test('unreadable local progress is preserved verbatim and can be downloaded before a fresh lesson', async ({ page }) => {
  await openAdventure(page);
  const damaged = '{"schemaVersion":1,"xp":42,"unfinished":';
  // Deliberately corrupt the persisted primary document to exercise recovery, never to bypass learning.
  await page.evaluate(({ key, raw }) => localStorage.setItem(key, raw), { key: SAVE_KEY, raw: damaged });
  await page.reload();
  await expect(page.locator('.ma-storage-warning')).toContainText('Une copie de récupération a été conservée');
  expect(await page.evaluate(key => localStorage.getItem(key), SAVE_KEY)).toBe(damaged);
  expect(await page.evaluate(key => localStorage.getItem(key), RECOVERY_KEY)).toBe(damaged);
  await page.locator('[data-view="backup"]').first().click();
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Télécharger la copie conservée' }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe('malagasy-copie-a-examiner.json');
  const stream = await download.createReadStream(), chunks: Buffer[] = [];
  expect(stream).not.toBeNull();
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  expect(Buffer.concat(chunks).toString()).toBe(damaged);
  await startLesson(page, CONTENT.lessons[0].id);
  await finishSession(page);
  expect((await savedProgress(page)).completedLessons).toEqual([CONTENT.lessons[0].id]);
  expect(await page.evaluate(key => localStorage.getItem(key), RECOVERY_KEY)).toBe(damaged);
  await page.reload();
  await page.locator('[data-view="backup"]').first().click();
  await expect(page.getByRole('button', { name: 'Télécharger la copie conservée' })).toBeVisible();
});

test('downloaded saves preview before replacement, restore progress and reject corrupted input', async ({ page }) => {
  await openAdventure(page);
  await startLesson(page, CONTENT.lessons[0].id);
  await finishSession(page);
  const original = await savedProgress(page);
  await page.locator('[data-view="backup"]').click();
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exporter ma sauvegarde' }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toMatch(/^malagasy-adventure-.*\.json$/);
  const stream = await download.createReadStream();
  expect(stream).not.toBeNull();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  const exported = Buffer.concat(chunks);
  expect(JSON.parse(exported.toString())).toEqual(original);
  await startLesson(page, CONTENT.lessons[1].id);
  await finishSession(page);
  const newer = await savedProgress(page);
  expect(newer.completedLessons).toHaveLength(2);
  await page.locator('[data-view="backup"]').click();
  await page.locator('#ma-import-file').setInputFiles({ name: 'voyage.json', mimeType: 'application/json', buffer: exported });
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('Reprendre ce voyage ?');
  expect(await savedProgress(page)).toEqual(newer);
  await dialog.getByRole('button', { name: 'Annuler', exact: true }).click();
  expect(await savedProgress(page)).toEqual(newer);
  await page.locator('#ma-import-file').setInputFiles({ name: 'voyage-copie.json', mimeType: 'application/json', buffer: exported });
  await dialog.getByRole('button', { name: 'Remplacer mon carnet' }).click();
  expect(await savedProgress(page)).toEqual(original);
  await page.reload();
  await expect(page.locator('.ma-backup-panel').first()).toContainText(`${original.xp} XP`);
  await page.locator('#ma-import-file').setInputFiles({ name: 'corrompu.json', mimeType: 'application/json', buffer: Buffer.from('{"schemaVersion":1,"__proto__":{"polluted":true}}') });
  await expect(dialog).toContainText('Ce carnet ne peut pas être ouvert');
  await expect(dialog.getByRole('alert')).toContainText('invalide');
  expect(await savedProgress(page)).toEqual(original);
});

test('citations stay in Sources and Credits while lessons and lexicon remain immersive', async ({ page }) => {
  await page.goto('/malagasy-adventure#sources');
  await expect(page.locator('.ma-source-list article')).toHaveCount(CONTENT.sources.filter(source => source.consulted).length);
  for (const source of CONTENT.sources.filter(source => source.consulted)) {
    const link = page.locator(`#source-${source.id} a`);
    await expect(link).toHaveAttribute('href', source.url);
    await expect(link).toHaveAttribute('rel', /noopener/);
  }
  await expect(page.locator('.ma-main')).toContainText('relecture');
  await page.locator('[data-view="vocabulary"]').click();
  await expect(page.locator('audio')).toHaveCount(0);
  await expect(page.locator('.ma-word-card')).toHaveCount(CONTENT.vocabulary.length);
  await page.locator('#ma-search').fill('salama');
  expect(await page.locator('.ma-word-card').count()).toBeGreaterThan(0);
  await expect(page.locator('.ma-main a[href^="https://"]')).toHaveCount(0);
  await expect(page.locator('[data-vocab-source]')).toHaveCount(0);
  await startLesson(page, CONTENT.lessons[0].id);
  await expect(page.locator('.ma-main a[href^="https://"]')).toHaveCount(0);
  await expect(page.locator('.ma-lesson-sources')).toHaveCount(0);
  await beginPractice(page);
  const exercise = CONTENT.exercises.find(item => item.id === 'exercise-01-01-a')!;
  await answerCorrectly(page, exercise);
  await page.locator('#ma-submit').click();
  await expect(page.locator('.ma-feedback.correct')).toBeVisible();
  await expect(page.locator('[data-exercise-source], [data-vocab-source]')).toHaveCount(0);
  await expect(page.locator('.ma-main a[href^="https://"]')).toHaveCount(0);
});

for (const width of [340, 390]) test(`all app views and a real lesson fit a ${width}px mobile screen`, async ({ page }) => {
  await page.setViewportSize({ width, height: 844 });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const view of ['path', 'worlds', 'reviews', 'vocabulary', 'stats', 'sources', 'backup']) {
    await page.goto(`/malagasy-adventure#${view}`);
    await expect(page.locator('h1')).toBeVisible();
    await noHorizontalOverflow(page);
  }
  await page.locator('[data-view="worlds"]').click();
  await page.locator('.ma-destination[data-world="world-20"]').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await noHorizontalOverflow(page);
  await page.getByRole('dialog').getByRole('button', { name: 'Fermer', exact: true }).click();
  await startLesson(page, CONTENT.lessons[0].id);
  await noHorizontalOverflow(page);
  await finishSession(page);
  await noHorizontalOverflow(page);
  expect(errors).toEqual([]);
});
