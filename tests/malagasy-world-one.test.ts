import { describe, expect, it } from 'vitest';
import { CONTENT } from '../src/malagasy/content';
import { completeLesson, createProgress, introduceLesson, lessonAvailable, recordAnswer, worldCompleted } from '../src/malagasy/engine';
import { parseSave, serializeSave } from '../src/malagasy/storage';
import { renderWorldPath } from '../src/malagasy/world-path';
import { renderLearningSession } from '../src/malagasy/lesson-view';
import { emptyDraft } from '../src/malagasy/exercise-view';
import type { Progress } from '../src/malagasy/types';
import type { LearningSession } from '../src/malagasy/session';

const NOW = '2026-10-27T10:00:00.000Z';
function finishLessons(count: number): Progress {
  let progress = createProgress(NOW);
  for (const lesson of CONTENT.lessons.slice(0, count)) {
    expect(lessonAvailable(lesson, progress, CONTENT), lesson.id).toBe(true);
    progress = introduceLesson(progress, lesson, CONTENT);
    for (const id of lesson.exerciseIds) progress = recordAnswer(progress, CONTENT.exercises.find(item => item.id === id)!, true, NOW);
    progress = completeLesson(progress, lesson, lesson.exerciseIds.length, lesson.exerciseIds.length, NOW);
  }
  return progress;
}

describe('Complete world one and its visual trail', () => {
  it('continues an existing three-unit v1 save at unit four without resetting its rewards', () => {
    const oldProgress = finishLessons(9);
    const restored = parseSave(serializeSave(oldProgress), CONTENT);
    expect(restored).toEqual(oldProgress);
    expect(restored.schemaVersion).toBe(1);
    expect(worldCompleted('world-01', restored, CONTENT)).toBe(false);
    const next = CONTENT.lessons.find(lesson => !restored.completedLessons.includes(lesson.id) && lessonAvailable(lesson, restored, CONTENT));
    expect(next?.id).toBe('lesson-04-01');
    const trail = renderWorldPath(CONTENT, restored);
    expect(trail.match(/data-lesson=/gu)).toHaveLength(36);
    expect(trail.match(/data-path-state="done"/gu)).toHaveLength(9);
    expect(trail.match(/data-path-current/gu)).toHaveLength(1);
    expect(trail).toMatch(/data-lesson="lesson-04-01"[^>]*aria-current="step"/u);
    expect(trail).not.toContain('Le monde 1 est terminé !');
  });

  it('completes the world only after the final quiz and keeps a failed replay visually unsuccessful', () => {
    const beforeFinal = finishLessons(35);
    expect(worldCompleted('world-01', beforeFinal, CONTENT)).toBe(false);
    const progress = finishLessons(36);
    expect(worldCompleted('world-01', progress, CONTENT)).toBe(true);
    expect(CONTENT.worlds[1].implemented).toBe(true);
    expect(CONTENT.worlds.slice(2).every(world => !world.implemented)).toBe(true);
    const lesson = CONTENT.lessons.find(item => item.id === 'lesson-12-03')!;
    const exercises = lesson.exerciseIds.map(id => CONTENT.exercises.find(item => item.id === id)!);
    const session: LearningSession = { lesson, exercises, index: 11, correct: 12, draft: emptyDraft(), answered: true,
      wasCorrect: true, stage: 'done', review: false, xpBefore: progress.xp, sceneIndex: 0, revealedTurns: 1,
      combo: 12, maxCombo: 12, lastReward: 0, results: [] };
    const success = renderLearningSession(session, progress, CONTENT);
    expect(success).toContain('Monde 1 terminé !');
    expect(success).toContain('12 unités · 36 étapes validées');
    const failure = renderLearningSession({ ...session, correct: 3, wasCorrect: false }, progress, CONTENT);
    expect(failure).toContain('Un nouvel essai ?');
    expect(failure).not.toContain('Monde 1 terminé !');
    expect(failure).not.toContain('ma-world-passport');
    const trail = renderWorldPath(CONTENT, progress);
    expect(trail.match(/data-path-state="done"/gu)).toHaveLength(36);
    expect(trail).toContain('Le monde 1 est terminé !');
  });
});
