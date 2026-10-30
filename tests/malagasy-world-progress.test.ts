import { describe, expect, it } from 'vitest';
import { CONTENT } from '../src/malagasy/content';
import { completeLesson, createProgress, introduceLesson, lessonAvailable, recordAnswer } from '../src/malagasy/engine';
import { historyAccess, unitsOfWorld } from '../src/malagasy/world-progress';
import { historyInterlude } from '../src/malagasy/history-interludes';
import { renderWorldPath } from '../src/malagasy/world-path';
import { parseSave, serializeSave } from '../src/malagasy/storage';
import { renderLearningSession } from '../src/malagasy/lesson-view';
import { emptyDraft } from '../src/malagasy/exercise-view';
import type { LearningSession } from '../src/malagasy/session';

function successSession(lessonId: string): LearningSession {
  const lesson = CONTENT.lessons.find(item => item.id === lessonId)!;
  const exercises = lesson.exerciseIds.map(id => CONTENT.exercises.find(item => item.id === id)!);
  return { lesson, exercises, index: exercises.length - 1, correct: exercises.length, draft: emptyDraft(), answered: true,
    wasCorrect: true, stage: 'done', review: false, xpBefore: 0, sceneIndex: 0, revealedTurns: 1,
    combo: 0, maxCombo: 0, lastReward: 0, results: [] };
}

function finish(ids: string[], initial = createProgress('2026-10-29T08:00:00Z')) {
  let progress = initial;
  for (const id of ids) {
    const lesson = CONTENT.lessons.find(item => item.id === id)!;
    expect(lessonAvailable(lesson, progress, CONTENT), id).toBe(true);
    progress = introduceLesson(progress, lesson, CONTENT);
    for (const exerciseId of lesson.exerciseIds) progress = recordAnswer(progress, CONTENT.exercises.find(item => item.id === exerciseId)!, true, '2026-10-29T08:01:00Z');
    progress = completeLesson(progress, lesson, lesson.exerciseIds.length, lesson.exerciseIds.length, '2026-10-29T08:02:00Z');
  }
  return progress;
}
describe('History opens at the actual midpoint of each world', () => {
  it('offers the newly unlocked interlude on the successful midpoint quiz screen', () => {
    let progress = createProgress();
    for (const world of CONTENT.worlds.filter(item => item.implemented)) {
      const units = unitsOfWorld(world.id, CONTENT), half = Math.ceil(units.length / 2);
      progress = finish(units.slice(0, half).flatMap(unit => unit.lessonIds), progress);
      const session = successSession(units[half - 1].lessonIds.at(-1)!);
      expect(renderLearningSession(session, progress, CONTENT)).toContain('ma-history-completion');
      expect(renderLearningSession({ ...session, correct: 2 }, progress, CONTENT)).not.toContain('ma-history-completion');
      expect(renderLearningSession(successSession(units[half].lessonIds[0]), progress, CONTENT)).not.toContain('ma-history-completion');
      progress = finish(units.slice(half).flatMap(unit => unit.lessonIds), progress);
    }
  });
  it('requires all first-half parts and the midpoint quiz, with existing v1 saves', () => {
    let progress = createProgress('2026-10-29T08:00:00Z');
    for (const world of CONTENT.worlds.filter(item => item.implemented)) {
      const units = unitsOfWorld(world.id, CONTENT);
      const first = units.slice(0, Math.ceil(units.length / 2)).flatMap(unit => unit.lessonIds);
      const after = units.slice(Math.ceil(units.length / 2)).flatMap(unit => unit.lessonIds);
      expect(historyAccess(world.id, progress, CONTENT).unlocked).toBe(false);
      progress = finish(first.slice(0, -1), progress);
      expect(historyAccess(world.id, progress, CONTENT).unlocked).toBe(false);
      progress = finish(first.slice(-1), progress);
      expect(historyAccess(world.id, progress, CONTENT)).toMatchObject({ unlocked: true, midpointUnit: units[Math.ceil(units.length / 2) - 1].number });
      expect(historyAccess(world.id, parseSave(serializeSave(progress), CONTENT), CONTENT).unlocked).toBe(true);
      expect(progress.schemaVersion).toBe(1);
      progress = finish(after, progress);
    }
  });
  it('does not unlock by counting arbitrary late lessons or by bypassing a prior world', () => {
    const progress = createProgress();
    for (const world of CONTENT.worlds.filter(item => item.implemented)) {
      const units = unitsOfWorld(world.id, CONTENT);
      const secondHalf = units.slice(Math.ceil(units.length / 2)).flatMap(unit => unit.lessonIds);
      expect(historyAccess(world.id, { ...progress, completedLessons: secondHalf }, CONTENT).unlocked).toBe(false);
    }
    expect(historyAccess('world-20', progress, CONTENT).unlocked).toBe(false);
  });
  it('places the pause between the first and second halves and keeps sources internal', () => {
    const world = CONTENT.worlds[0], units = unitsOfWorld(world.id, CONTENT), half = Math.ceil(units.length / 2);
    const html = renderWorldPath(CONTENT, createProgress(), world.id);
    const marker = html.indexOf('data-history-milestone=');
    expect(marker).toBeGreaterThan(html.indexOf(`id="ma-route-${units[half - 1].id}"`));
    expect(marker).toBeLessThan(html.indexOf(`id="ma-route-${units[half].id}"`));
    expect(html).toContain('Validez le quiz de l’unité 6');
    for (const published of CONTENT.worlds.filter(item => item.implemented)) for (const sourceId of historyInterlude(published).sourceIds) {
      expect(CONTENT.sources.some(source => source.id === sourceId), sourceId).toBe(true);
    }
  });
});

it('labels the actual next destination when an older lesson is replayed', () => {
  const session = successSession('lesson-01-01');
  const progress = finish(CONTENT.lessons.filter(lesson => lesson.worldId === 'world-01').map(lesson => lesson.id));
  const next = (id: string) => CONTENT.lessons.find(lesson => lesson.id === id)!;
  expect(renderLearningSession(session, progress, CONTENT, next('lesson-02-01-01'))).toContain('Cap sur Antsirabe');
  expect(renderLearningSession(session, progress, CONTENT, next('lesson-02-01'))).toContain('Cap sur l’unité 2');
  expect(renderLearningSession(session, progress, CONTENT, next('lesson-01-03'))).toContain('Passer au quiz final');
  expect(renderLearningSession(session, progress, CONTENT, next('lesson-01-02'))).toContain('Passer à la partie 2');
});
