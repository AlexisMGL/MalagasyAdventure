import { describe, expect, it } from 'vitest';
import { CONTENT } from '../src/malagasy/content';
import { getNotionCards } from '../src/malagasy/notion-cards';
import { isPlayableDialogueAsset, matchesDialogueTranscript } from '../src/malagasy/dialogue-audio';
import { ALL_DIALOGUE_RECORDINGS } from '../src/malagasy/voice-bank';

describe('Short notion lessons before conversations', () => {
  it('covers every delivered learning part and each concept before exercises can test it', () => {
    const parts = CONTENT.lessons.filter(lesson => lesson.kind !== 'checkpoint');
    expect(parts).toHaveLength(24);
    const presented = new Set<string>();
    const cardIds = new Set<string>();
    for (const lesson of CONTENT.lessons) {
      const cards = getNotionCards(lesson.id);
      if (lesson.kind === 'checkpoint') {
        expect(cards, lesson.id).toEqual([]);
      } else {
        expect(cards.length, lesson.id).toBeGreaterThan(0);
        expect(cards.length, lesson.id).toBeLessThanOrEqual(3);
        const covered = new Set(cards.flatMap(card => card.conceptIds));
        for (const concept of lesson.introduces) expect(covered.has(concept), `${lesson.id}: ${concept}`).toBe(true);
      }
      for (const card of cards) {
        expect(cardIds.has(card.id), card.id).toBe(false);
        cardIds.add(card.id);
        expect(card.title.length).toBeLessThanOrEqual(65);
        expect(card.rule.length, card.id).toBeLessThanOrEqual(260);
        expect(card.memory?.length ?? 0, card.id).toBeLessThanOrEqual(140);
        expect(card.examples.length, card.id).toBeGreaterThan(0);
        expect(card.examples.length, card.id).toBeLessThanOrEqual(4);
        expect(card.sourceIds.length, card.id).toBeGreaterThan(0);
        for (const sourceId of card.sourceIds) expect(CONTENT.sources.some(source => source.id === sourceId), sourceId).toBe(true);
        for (const conceptId of card.conceptIds) {
          const concept = CONTENT.concepts.find(item => item.id === conceptId);
          expect(concept, conceptId).toBeDefined();
          expect(CONTENT.lessons.findIndex(item => item.id === concept!.introducedIn), conceptId)
            .toBeLessThanOrEqual(CONTENT.lessons.indexOf(lesson));
          presented.add(conceptId);
        }
      }
      for (const exerciseId of lesson.exerciseIds) {
        const exercise = CONTENT.exercises.find(item => item.id === exerciseId)!;
        for (const conceptId of exercise.concepts) expect(presented.has(conceptId), `${exerciseId}: ${conceptId}`).toBe(true);
      }
    }
    expect(getNotionCards('lesson-not-delivered')).toEqual([]);
  });

  it('offers a real, whole existing pronunciation for every example without creating or relabelling audio', () => {
    for (const lesson of CONTENT.lessons) for (const card of getNotionCards(lesson.id)) {
      for (const example of card.examples) {
        const audio = ALL_DIALOGUE_RECORDINGS.find(item => item.id === example.audioId);
        expect(audio, `${card.id}: ${example.malagasy}`).toBeDefined();
        expect(isPlayableDialogueAsset(audio!)).toBe(true);
        expect(matchesDialogueTranscript(audio!, example.malagasy), example.malagasy).toBe(true);
        expect(example.french.trim()).not.toBe('');
        expect(example.malagasy).not.toMatch(/[…_]|\.{3}/u);
      }
    }
  });

  it('unpacks the requested suffixes, subjects and spatial oppositions before their first conversations', () => {
    const name = getNotionCards('lesson-02-01');
    expect(name.some(card => card.rule.includes('Anarako') && card.rule.includes('anaranao'))).toBe(true);
    expect(name.some(card => card.rule.includes('Aho = je') && card.rule.includes('ianao') && card.rule.includes('izy'))).toBe(true);
    const subject = getNotionCards('lesson-03-01');
    expect(subject.some(card => card.rule.includes('le sujet vient ensuite'))).toBe(true);
    expect(subject.some(card => card.rule.includes('ny mpiofana'))).toBe(true);
    const location = getNotionCards('lesson-05-02');
    expect(location.some(card => card.rule.includes('ao') && card.rule.includes('non visible'))).toBe(true);
    const aboveBelow = location.find(card => card.title === 'Sur ou sous la table')!;
    expect(aboveBelow.rule).toContain('Ambony');
    expect(aboveBelow.rule).toContain('ambany');
    expect(aboveBelow.rule).toContain('eo');
    expect(aboveBelow.examples.map(example => example.malagasy)).toEqual([
      'Eo ambony latabatra ny boky.', 'Eo ambany latabatra ny boky.',
    ]);
    const understand = getNotionCards('lesson-10-02');
    expect(understand[0].rule).toContain('la personne qui comprend');
    expect(understand[0].memory).toContain('verbe actif + aho');
  });
});
