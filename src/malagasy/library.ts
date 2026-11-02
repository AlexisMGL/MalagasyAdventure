import { CONTENT } from './content';
import { lessonAvailable } from './engine';
import { COURSE_VOCABULARY, type CourseWord } from './course-vocabulary';
import type { Content, Lesson, Progress } from './types';

export type LibraryMode = 'lessons' | 'notions' | 'mg-fr' | 'fr-mg';
export interface LibraryState { mode: LibraryMode; query: string; lessonId?: string; cardId?: string }
export function readLibraryRoute(hash: string): Omit<LibraryState, 'query'> {
  const [view, detail, cardId] = hash.replace(/^#/u, '').split('/');
  if (view !== 'vocabulary') return { mode: 'lessons' };
  if (detail === 'mg-fr' || detail === 'fr-mg' || detail === 'notions') return { mode: detail };
  return { mode: 'lessons', ...(detail?.startsWith('lesson-') ? { lessonId: detail, ...(cardId ? { cardId } : {}) } : {}) };
}
export function libraryHash(state: LibraryState): string {
  return `#vocabulary${state.lessonId ? `/${state.lessonId}${state.cardId ? `/${state.cardId}` : ''}` : state.mode === 'lessons' ? '' : `/${state.mode}`}`;
}
export const librarySearchKey = (value: string): string => value.normalize('NFD').replace(/\p{M}/gu, '')
  .toLocaleLowerCase('fr').replace(/[’‘]/gu, "'").trim();
export function unlockedLessons(progress: Progress, content: Content = CONTENT): Lesson[] {
  return content.lessons.filter(lesson => lessonAvailable(lesson, progress, content));
}
export function referenceLesson(id: string | undefined, progress: Progress): Lesson | undefined {
  return id ? unlockedLessons(progress).find(lesson => lesson.id === id) : undefined;
}
export function libraryLessons(progress: Progress, query: string): Lesson[] {
  const key = librarySearchKey(query);
  return unlockedLessons(progress).filter(lesson => {
    const unit = CONTENT.units.find(unit => unit.id === lesson.unitId)!;
    const world = CONTENT.worlds.find(world => world.id === lesson.worldId)!;
    return librarySearchKey(`${world.name} ${unit.number} ${unit.title} ${lesson.title} ${lesson.objectives.join(' ')}`).includes(key);
  });
}
const collators = { 'mg-fr': new Intl.Collator('mg', { sensitivity: 'base', ignorePunctuation: true }), 'fr-mg': new Intl.Collator('fr', { sensitivity: 'base', ignorePunctuation: true }) };
export function lexiconLabel(word: CourseWord, mode: 'mg-fr' | 'fr-mg'): string { return mode === 'mg-fr' ? word.malagasy : word.french; }
export function libraryWords(progress: Progress, mode: 'mg-fr' | 'fr-mg', query = ''): CourseWord[] {
  const available = new Set(unlockedLessons(progress).map(lesson => lesson.id));
  const key = librarySearchKey(query);
  return COURSE_VOCABULARY.filter(word => available.has(word.lessonId) && librarySearchKey(`${word.malagasy} ${word.french} ${word.note}`).includes(key))
    .sort((a, b) => collators[mode].compare(lexiconLabel(a, mode), lexiconLabel(b, mode)) || collators[mode].compare(mode === 'mg-fr' ? a.french : a.malagasy, mode === 'mg-fr' ? b.french : b.malagasy) || a.id.localeCompare(b.id));
}
export function lexiconGroups(words: CourseWord[], mode: 'mg-fr' | 'fr-mg'): { letter: string; words: CourseWord[] }[] {
  const groups = new Map<string, CourseWord[]>();
  for (const word of words) {
    const letter = librarySearchKey(lexiconLabel(word, mode)).match(/\p{L}/u)?.[0].toLocaleUpperCase('fr') ?? '#';
    groups.set(letter, [...(groups.get(letter) ?? []), word]);
  }
  return [...groups].map(([letter, words]) => ({ letter, words }));
}
