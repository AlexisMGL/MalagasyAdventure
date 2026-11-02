import { describe, expect, it } from 'vitest';
import { CONTENT } from '../src/malagasy/content';
import { COURSE_VOCABULARY, lessonUtterances, wordTokens } from '../src/malagasy/course-vocabulary';
import { vocabularyLabels } from '../src/malagasy/vocabulary-cards';
import { getNotionCards } from '../src/malagasy/notion-cards';
import { completeLesson, createProgress, introduceLesson, recordAnswer } from '../src/malagasy/engine';
import { libraryLessons, libraryWords, lexiconGroups, lexiconLabel, referenceLesson, unlockedLessons, readLibraryRoute, libraryHash } from '../src/malagasy/library';
import { renderLibrary } from '../src/malagasy/library-view';
import { libraryCards, referenceCard } from '../src/malagasy/library-cards';
import type { Progress } from '../src/malagasy/types';
import { spokenSelectionsForExercise } from '../src/malagasy/spoken-selections';

function through(lastId: string): Progress {
  let progress = createProgress('2026-11-02T08:00:00.000Z');
  for (const lesson of CONTENT.lessons) {
    progress = introduceLesson(progress, lesson, CONTENT);
    for (const id of lesson.exerciseIds) progress = recordAnswer(progress, CONTENT.exercises.find(exercise => exercise.id === id)!, true, '2026-11-02T08:00:00.000Z');
    progress = completeLesson(progress, lesson, lesson.exerciseIds.length, lesson.exerciseIds.length, '2026-11-02T08:00:00.000Z');
    if (lesson.id === lastId) break;
  }
  return progress;
}

describe('Vocabulary before its first conversation', () => {
  it('gives every registered word and whole form an explicit Vocabulary label at its introduction', () => {
    for (const word of COURSE_VOCABULARY) {
      const labels = getNotionCards(word.lessonId).flatMap(vocabularyLabels).map(label => wordTokens(label).join(' '));
      expect(labels, `${word.lessonId}: ${word.malagasy}`).toContain(wordTokens(word.malagasy).join(' '));
      expect(CONTENT.lessons.some(lesson => lesson.id === word.lessonId && lesson.kind !== 'checkpoint')).toBe(true);
      for (const source of word.sourceIds) expect(CONTENT.sources.some(item => item.id === source), `${word.id}: ${source}`).toBe(true);
    }
    expect(new Set(COURSE_VOCABULARY.map(word => word.id)).size).toBe(COURSE_VOCABULARY.length);
  });

  it('never introduces an unseen word in a dialogue or quiz before its Vocabulary section', () => {
    const seen = new Set(['mia', 'lova']); // The two recurring fictional personal names.
    for (const lesson of CONTENT.lessons) {
      for (const word of getNotionCards(lesson.id).flatMap(vocabularyLabels).flatMap(wordTokens)) seen.add(word);
      const selections = lesson.exerciseIds.flatMap(id => spokenSelectionsForExercise(CONTENT.exercises.find(exercise => exercise.id === id)!));
      const examples = getNotionCards(lesson.id).flatMap(card => card.examples.map(example => example.malagasy));
      const unknown = [...new Set([...lessonUtterances(lesson, CONTENT).map(turn => turn.malagasy), ...selections, ...examples].flatMap(wordTokens))].filter(word => !seen.has(word));
      expect(unknown, lesson.id).toEqual([]);
    }
  });

  it('does not postpone early question words until their later grammar unit', () => {
    expect(COURSE_VOCABULARY.find(word => word.malagasy === 'iza')?.lessonId).toBe('lesson-02-01');
    expect(COURSE_VOCABULARY.find(word => word.malagasy === 'aiza')?.lessonId).toBe('lesson-02-02');
    for (const [id, words] of [['lesson-04-02', ['reniko', 'raiko', 'manana']], ['lesson-05-02', ['ao', 'eo', 'ambony', 'ambany']], ['lesson-08-01', ['asanao']], ['lesson-02-01-01', ['izao']]] as const) {
      const labels = getNotionCards(id).flatMap(vocabularyLabels);
      for (const word of words) expect(labels, id).toContain(word);
    }
  });
});

describe('Unlocked lessons and two alphabetic lexicons', () => {
  it('indexes every unlocked visual reminder once in its section, with topical search and meaningful titles', () => {
    const fresh = createProgress();
    expect(libraryCards(fresh, 'vocabulary')).toHaveLength(2);
    expect(libraryCards(fresh, 'notion')).toHaveLength(1);
    expect(libraryCards(fresh, 'vocabulary', 'chiffres')).toEqual([]);
    const progress = through(CONTENT.lessons.at(-1)!.id);
    const entries = [...libraryCards(progress, 'vocabulary'), ...libraryCards(progress, 'notion')];
    expect(entries.map(entry => entry.card.id).sort()).toEqual(CONTENT.lessons.flatMap(lesson => getNotionCards(lesson.id).map(card => card.id)).sort());
    expect(entries).toHaveLength(172);
    expect(new Set(entries.map(entry => entry.card.id)).size).toBe(entries.length);
    expect(entries.every(entry => entry.topic.picture && !entry.title.startsWith('Les mots à reconnaître'))).toBe(true);
    const numbers = libraryCards(progress, 'vocabulary', 'chiffres');
    expect(numbers.map(entry => entry.title)).toEqual(expect.arrayContaining(['De zéro à cinq', 'De six à dix', 'De onze à quinze', 'De seize à vingt']));
    expect(libraryCards(progress, 'notion', 'possession').some(entry => entry.title === 'Mon nom, ton nom')).toBe(true);
    expect(libraryCards(progress, 'vocabulary', 'ecrire').some(entry => entry.title === 'Lire ou écrire')).toBe(true);
    expect(libraryCards(progress, 'vocabulary', 'reniko').some(entry => entry.title === 'Ma mère, ton père…')).toBe(true);
    expect(libraryCards(progress, 'vocabulary', 'dimy').some(entry => entry.title === 'De zéro à cinq')).toBe(true);
    expect(libraryCards(progress, 'notion', '-ko').some(entry => entry.title === 'Mon nom, ton nom')).toBe(true);
  });

  it('opens one unlocked card read-only, rejects locked or mismatched card links and preserves legacy lesson links', () => {
    const progress = through('lesson-07-01');
    const saved = JSON.stringify(progress);
    const state = { mode: 'lessons' as const, query: '', lessonId: 'lesson-07-01', cardId: 'notion-07-01-1' };
    expect(referenceCard(state.lessonId, state.cardId, progress)?.title).toBe('De zéro à cinq');
    const html = renderLibrary(progress, state);
    expect(html).toContain('data-reference-card="notion-07-01-1"');
    expect(html.match(/data-notion-id=/gu)).toHaveLength(1);
    expect(html).toContain('replay-notion');
    expect(html).not.toContain('https://');
    expect(JSON.stringify(progress)).toBe(saved);
    expect(referenceCard('lesson-01-01', 'notion-07-01-1', progress)).toBeUndefined();
    expect(referenceCard('lesson-02-01-01', 'notion-w2-01-01-1', progress)).toBeUndefined();
    expect(renderLibrary(progress, { ...state, cardId: 'invalid' })).not.toContain('data-reference-card=');
  });

  it('only exposes the first available lesson to a fresh visitor and rejects locked deep links', () => {
    const progress = createProgress();
    expect(unlockedLessons(progress).map(lesson => lesson.id)).toEqual(['lesson-01-01']);
    expect(libraryWords(progress, 'mg-fr').map(word => word.malagasy).sort()).toEqual(['Azafady', 'Misaotra', 'Salama', 'Veloma'].sort());
    expect(referenceLesson('lesson-02-01-01', progress)).toBeUndefined();
    expect(renderLibrary(progress, { mode: 'lessons', query: '', lessonId: 'lesson-02-01-01' })).not.toContain('data-reference-lesson=');
    expect(libraryLessons(progress, 'antsirabe')).toEqual([]);
  });

  it('derives access from an old v1 carnet and includes the newly unlocked part', () => {
    const progress = through('lesson-04-01');
    expect(referenceLesson('lesson-04-02', progress)).toBeDefined();
    expect(referenceLesson('lesson-05-01', progress)).toBeUndefined();
    expect(libraryWords(progress, 'mg-fr', 'reniko').map(word => word.malagasy)).toContain('reniko');
    expect(libraryWords(progress, 'mg-fr', 'tranoko')).toEqual([]);
    const saved = JSON.stringify(progress);
    const html = renderLibrary(progress, { mode: 'lessons', query: '', lessonId: 'lesson-04-02' });
    expect(html).toContain('Vocabulaire'); expect(html).toContain('Notions');
    expect(html).toContain('replay-notion'); expect(html).not.toContain('https://');
    expect(JSON.stringify(progress)).toBe(saved);
  });

  it('sorts all available entries by the displayed source language and groups accent-folded initials', () => {
    const progress = through(CONTENT.lessons.at(-1)!.id);
    for (const mode of ['mg-fr', 'fr-mg'] as const) {
      const words = libraryWords(progress, mode);
      expect(words).toHaveLength(COURSE_VOCABULARY.length);
      const collator = new Intl.Collator(mode === 'mg-fr' ? 'mg' : 'fr', { sensitivity: 'base', ignorePunctuation: true });
      for (let i = 1; i < words.length; i++) expect(collator.compare(lexiconLabel(words[i - 1], mode), lexiconLabel(words[i], mode))).toBeLessThanOrEqual(0);
      const groups = lexiconGroups(words, mode);
      expect(groups.flatMap(group => group.words)).toEqual(words);
      expect(new Set(groups.map(group => group.letter)).size).toBe(groups.length);
    }
    expect(libraryWords(progress, 'fr-mg', 'ecrire').some(word => word.malagasy === 'manoratra')).toBe(true);
    expect(libraryWords(progress, 'mg-fr', 'isan\'andro').some(word => word.malagasy === 'isan’andro')).toBe(true);
  });

  it('keeps library links separate from world-path links and handles invalid details safely', () => {
    expect(readLibraryRoute('#vocabulary/fr-mg')).toEqual({ mode: 'fr-mg' });
    expect(readLibraryRoute('#vocabulary/lesson-04-02')).toEqual({ mode: 'lessons', lessonId: 'lesson-04-02' });
    expect(readLibraryRoute('#vocabulary/notions')).toEqual({ mode: 'notions' });
    const cardState = { mode: 'lessons' as const, query: '', lessonId: 'lesson-07-01', cardId: 'notion-07-01-1' };
    expect(readLibraryRoute(libraryHash(cardState))).toEqual({ mode: 'lessons', lessonId: cardState.lessonId, cardId: cardState.cardId });
    expect(readLibraryRoute('#vocabulary/<script>')).toEqual({ mode: 'lessons' });
    expect(readLibraryRoute('#path/world-02')).toEqual({ mode: 'lessons' });
    expect(libraryHash({ mode: 'mg-fr', query: '' })).toBe('#vocabulary/mg-fr');
  });
});
