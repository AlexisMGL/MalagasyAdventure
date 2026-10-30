import { describe, expect, it } from 'vitest';
import { CONTENT } from '../src/malagasy/content';
import { WORLD_TWO } from '../src/malagasy/world-two';
import { WORLD_TWO_NOTIONS } from '../src/malagasy/world-two-notions';
import { normalizeAnswer, validateAnswer } from '../src/malagasy/engine';

describe('Antsirabe — complete second world', () => {
  it('contains twelve coherent units with discovery parts and twelve-question checkpoints', () => {
    expect(WORLD_TWO.units).toHaveLength(12);
    expect(WORLD_TWO.lessons).toHaveLength(36);
    expect(WORLD_TWO.concepts).toHaveLength(14);
    expect(WORLD_TWO.exercises).toHaveLength(288);
    expect(WORLD_TWO.lessons.flatMap(lesson => lesson.scenes ?? [])).toHaveLength(96);
    expect(WORLD_TWO.sources).toHaveLength(30);
    const ids = [...WORLD_TWO.units, ...WORLD_TWO.lessons, ...WORLD_TWO.concepts, ...WORLD_TWO.exercises, ...WORLD_TWO.vocabulary, ...WORLD_TWO.sources].map(item => item.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const unit of WORLD_TWO.units) {
      expect(unit.worldId).toBe('world-02');
      expect(unit.implemented).toBe(true);
      expect(unit.lessonIds).toHaveLength(3);
      const lessons = unit.lessonIds.map(id => WORLD_TWO.lessons.find(lesson => lesson.id === id)!);
      expect(lessons.map(lesson => lesson.kind)).toEqual(['learn', 'story', 'checkpoint']);
      expect(lessons.map(lesson => lesson.exerciseIds.length)).toEqual([6, 6, 12]);
      expect(lessons[2].scenes).toBeUndefined();
    }
    expect(WORLD_TWO.lessons[0].prerequisites).toEqual(['lesson-12-03']);
    for (let index = 1; index < WORLD_TWO.lessons.length; index++) {
      expect(WORLD_TWO.lessons[index].prerequisites).toEqual([WORLD_TWO.lessons[index - 1].id]);
    }
  });

  it('presents all new concepts before tests and keeps traceable sources for cards and activities', () => {
    const presented = new Set(CONTENT.concepts.filter(concept => !concept.id.startsWith('w2.')).map(concept => concept.id));
    const knownSources = new Set([...CONTENT.sources, ...WORLD_TWO.sources].map(source => source.id));
    expect(Object.keys(WORLD_TWO_NOTIONS)).toHaveLength(24);
    for (const lesson of WORLD_TWO.lessons) {
      const cards = WORLD_TWO_NOTIONS[lesson.id] ?? [];
      if (lesson.kind === 'checkpoint') expect(cards).toEqual([]);
      else {
        expect(cards.length, lesson.id).toBeGreaterThanOrEqual(2);
        expect(new Set(cards.map(card => card.section)), lesson.id).toEqual(new Set(['vocabulary', 'notion']));
        const described = new Set(cards.flatMap(card => card.conceptIds));
        for (const conceptId of lesson.introduces) expect(described.has(conceptId), `${lesson.id}: ${conceptId}`).toBe(true);
      }
      for (const card of cards) {
        expect(card.rule.length, card.id).toBeLessThanOrEqual(260);
        expect(card.memory?.length ?? 0, card.id).toBeLessThanOrEqual(140);
        expect(card.visual, card.id).toBeDefined();
        expect(card.examples.length, card.id).toBeGreaterThan(0);
        expect(card.sourceIds.length, card.id).toBeGreaterThan(0);
        for (const sourceId of card.sourceIds) expect(knownSources.has(sourceId), `${card.id}: ${sourceId}`).toBe(true);
      }
      for (const conceptId of lesson.introduces) presented.add(conceptId);
      for (const id of lesson.exerciseIds) {
        const exercise = WORLD_TWO.exercises.find(item => item.id === id)!;
        expect(exercise).toBeDefined();
        for (const conceptId of exercise.concepts) expect(presented.has(conceptId), `${id}: ${conceptId}`).toBe(true);
        for (const sourceId of exercise.sourceIds) expect(knownSources.has(sourceId), `${id}: ${sourceId}`).toBe(true);
        if (exercise.type === 'match') {
          expect(validateAnswer(exercise, Object.fromEntries(exercise.pairs!.map(pair => [pair.left, pair.right]))), id).toBe(true);
        } else {
          for (const answer of exercise.answers) expect(validateAnswer(exercise, answer), id).toBe(true);
        }
      }
    }
  });

  it('never asks the learner to copy a complete checkpoint answer shown in its prompt or dialogue', () => {
    for (const lesson of WORLD_TWO.lessons.filter(item => item.kind === 'checkpoint')) {
      for (const id of lesson.exerciseIds) {
        const exercise = WORLD_TWO.exercises.find(item => item.id === id)!;
        const beforeAnswer = normalizeAnswer([exercise.question, exercise.context ?? '', ...(exercise.dialogue ?? []).map(turn => turn.text)].join(' '));
        for (const answer of exercise.answers) {
          const key = normalizeAnswer(answer);
          // Single words are also checked with boundaries so French fragments are not mistaken for Malagasy words.
          const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          expect(new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}($|[^\\p{L}\\p{N}])`, 'u').test(beforeAnswer), `${id}: ${answer}`).toBe(false);
        }
      }
    }
  });
});
