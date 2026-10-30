import { describe, expect, it } from 'vitest';
import { CONTENT } from '../src/malagasy/content';
import { getNotionCards } from '../src/malagasy/notion-cards';
import { isPlayableDialogueAsset, matchesDialogueTranscript } from '../src/malagasy/dialogue-audio';
import { ALL_DIALOGUE_RECORDINGS } from '../src/malagasy/voice-bank';

describe('Short notion lessons before conversations', () => {
  it('covers every delivered learning part and each concept before exercises can test it', () => {
    const parts = CONTENT.lessons.filter(lesson => lesson.kind !== 'checkpoint');
    expect(parts).toHaveLength(48);
    const presented = new Set<string>();
    const cardIds = new Set<string>();
    for (const lesson of CONTENT.lessons) {
      const cards = getNotionCards(lesson.id);
      if (lesson.kind === 'checkpoint') {
        expect(cards, lesson.id).toEqual([]);
      } else {
        expect(cards.length, lesson.id).toBeGreaterThan(0);
        expect(cards.length, lesson.id).toBeLessThanOrEqual(4);
        expect(new Set(cards.map(card => card.section)), lesson.id).toEqual(new Set(['vocabulary', 'notion']));
        expect(cards.slice(0, cards.findIndex(card => card.section === 'notion')).every(card => card.section === 'vocabulary')).toBe(true);
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
    const understand = getNotionCards('lesson-10-02').find(card => card.title === 'Je comprends, tu comprends')!;
    expect(understand.rule).toContain('la personne qui comprend');
    expect(understand.memory).toContain('verbe actif + aho');
  });

  it('separates illustrated words from authored grammar diagrams in all parts', () => {
    for (const lesson of CONTENT.lessons.filter(item => item.kind !== 'checkpoint')) {
      for (const card of getNotionCards(lesson.id)) {
        const visual = card.visual;
        expect(visual, card.id).toBeDefined();
        if (card.section === 'vocabulary') expect(['pictorial', 'quantity', 'directions', 'clock'], card.id).toContain(visual.kind);
        else expect(['sentence', 'possession', 'spatial', 'questions', 'sounds', 'directions', 'clock'], card.id).toContain(visual.kind);
        if (visual.kind === 'sentence') {
          expect(visual.rows.length).toBeGreaterThan(0);
          for (const row of visual.rows) {
            expect(row.parts.length).toBeGreaterThan(0);
            expect(row.parts.every(part => part.text.trim() && part.caption?.trim())).toBe(true);
          }
        } else if (visual.kind === 'possession') {
          expect(visual.pairs.length).toBeGreaterThan(0);
          for (const pair of visual.pairs) {
            expect(pair.mine).not.toBe(pair.yours);
            expect(pair.base.trim()).not.toBe('');
          }
        } else {
          expect(visual.items.length, card.id).toBeGreaterThan(0);
          if (visual.kind === 'quantity') {
            for (const item of visual.items) {
              expect(Number.isInteger(item.value)).toBe(true);
              expect(item.value).toBeGreaterThanOrEqual(0);
              expect(item.value).toBeLessThanOrEqual(20);
            }
          } else if (visual.kind === 'clock') {
            for (const item of visual.items) {
              expect(Number.isInteger(item.hour)).toBe(true);
              expect(item.hour).toBeGreaterThanOrEqual(1);
              expect(item.hour).toBeLessThanOrEqual(12);
              expect(item.label.trim()).not.toBe('');
            }
          }
        }
      }
    }
    const possession = getNotionCards('lesson-04-02').find(card => card.title === 'Mon enfant, ton enfant')!.visual;
    expect(possession.kind).toBe('possession');
    if (possession.kind === 'possession') expect(possession.pairs).toEqual([
      { base: 'enfant', mine: 'zanako', yours: 'zanakao', picture: 'child' },
    ]);
    const house = getNotionCards('lesson-05-02').find(card => card.title === 'Ma maison, ta maison')!.visual;
    if (house.kind === 'possession') expect(house.pairs[0]).toMatchObject({ mine: 'tranoko', yours: 'tranonao' });
    const spatial = getNotionCards('lesson-05-02').find(card => card.title === 'Sur ou sous la table')!.visual;
    if (spatial.kind === 'spatial') expect(spatial.items.map(item => item.location)).toEqual(['above', 'below']);
  });
});
