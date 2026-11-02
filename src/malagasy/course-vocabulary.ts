import { CONTENT } from './content';
import type { Content, Lesson, Vocabulary } from './types';
import type { LearningPicture } from './learning-visual-types';
import { VOCABULARY_SUPPLEMENTS } from './vocabulary-supplements';

export interface CourseWord extends Vocabulary { lessonId: string; picture: LearningPicture }
export const wordTokens = (text: string): string[] => text.normalize('NFC').toLocaleLowerCase('fr')
  .replace(/[’‘]/gu, "'").match(/[\p{L}]+(?:['-][\p{L}]+)*/gu) ?? [];
export function containsWord(text: string, word: string): boolean {
  const haystack = wordTokens(text), needle = wordTokens(word);
  return needle.length > 0 && haystack.some((_, index) => needle.every((part, offset) => haystack[index + offset] === part));
}
/** Authored Malagasy dialogue turns, never bilingual takeaway labels or French distractors. */
export function lessonUtterances(lesson: Lesson, content: Content): { malagasy: string; french: string }[] {
  const turns = [...(lesson.scenes ?? []).flatMap(scene => scene.turns.map(turn => ({ malagasy: turn.text, french: turn.translation }))),
    ...lesson.exerciseIds.flatMap(id => (content.exercises.find(exercise => exercise.id === id)?.dialogue ?? [])
    .map(turn => ({ malagasy: turn.text, french: turn.translation })))];
  return [...new Map(turns.map(turn => [turn.malagasy, turn])).values()];
}

const pictures: [RegExp, LearningPicture][] = [
  [/^salama$/iu, 'greeting'], [/^veloma$/iu, 'goodbye'], [/misaotra/iu, 'thanks'], [/azafady/iu, 'please'], [/tonga soa/iu, 'welcome'], [/tompoko/iu, 'respect'], [/^eny$/iu, 'yes'], [/^tsia$|^tsy$/iu, 'no'],
  [/^aho$/iu, 'me'], [/^ianao$/iu, 'you'], [/^izy$/iu, 'person'], [/anar/iu, 'name'], [/^iza$|\bve\b|^inona$/iu, 'question'], [/^aiza$/iu, 'place'], [/frantsa/iu, 'france'], [/^avy/iu, 'origin'], [/mpiofana/iu, 'study'], [/^ny$/iu, 'focus'],
  [/^ren/iu, 'mother'], [/^rai|^ray/iu, 'father'], [/^zan/iu, 'child'], [/fianakaviana/iu, 'family'], [/trano/iu, 'house'], [/latabatra/iu, 'table'], [/seza/iu, 'chair'], [/bok/iu, 'book'],
  [/ambony/iu, 'above'], [/ambany/iu, 'below'], [/^eto$/iu, 'place'], [/manana/iu, 'need'], [/^vary$/iu, 'rice'], [/^rano$/iu, 'water'], [/^mofo$/iu, 'bread'], [/akondro/iu, 'banana'], [/kafe/iu, 'coffee'], [/noana/iu, 'hungry'], [/mangetaheta/iu, 'thirsty'], [/^mila$/iu, 'need'], [/^tia$/iu, 'like'],
  [/vidiny|ariary|ohatrinona/iu, 'coin'], [/^firy$/iu, 'number'], [/tsena/iu, 'market'], [/reraka/iu, 'tired'], [/hatory|matory/iu, 'sleep'], [/hisotro|misotro/iu, 'drink'], [/kabone/iu, 'toilet'], [/azoko|azonao/iu, 'understand'], [/avereno/iu, 'repeat'], [/moramora/iu, 'slow'],
  [/maraina/iu, 'morning'], [/antoandro/iu, 'daytime'], [/hariva/iu, 'evening'], [/alina/iu, 'night'], [/^izao$/iu, 'now'], [/^mifoha$/iu, 'wake'], [/amin/iu, 'clock'], [/^mihinana/iu, 'eat'], [/^miasa/iu, 'work'], [/mianatra/iu, 'study'],
  [/^vilia$/iu, 'plate'], [/^sotro$/iu, 'spoon'], [/^vera$/iu, 'glass'], [/^antsy$/iu, 'knife'], [/^mamaky/iu, 'read'], [/manoratra/iu, 'write'], [/manasa/iu, 'wash'], [/mahandro/iu, 'cook'], [/isan|matetika|indraindray/iu, 'clock'], [/^sy$|^fa/iu, 'link'],
];
function pictureFor(word: Vocabulary): LearningPicture {
  return word.conceptId.includes('numbers-') ? 'number' : pictures.find(([pattern]) => pattern.test(word.malagasy))?.[1] ?? 'book';
}

const utterances = CONTENT.lessons.map(lesson => lessonUtterances(lesson, CONTENT));
const definitions = [
  ...CONTENT.vocabulary.map(word => ({ ...word, lessonId: CONTENT.concepts.find(concept => concept.id === word.conceptId)!.introducedIn, picture: pictureFor(word) })),
  ...VOCABULARY_SUPPLEMENTS.map(word => {
    const lesson = CONTENT.lessons.find(lesson => lesson.id === word.lessonId)!;
    const extra = word.malagasy === 'asanao' ? ['vocabulary-dict-asa'] : word.malagasy === 'any' ? ['vocabulary-dict-any'] : word.malagasy === 'eo' ? ['vocabulary-dict-eo'] : [];
    return { ...word, id: `word-reference-${wordTokens(word.malagasy).join('-')}`, conceptId: lesson.introduces[0], unitId: lesson.unitId, sourceIds: [...new Set([...lesson.sourceIds, ...extra])] };
  }),
];

/** A broad grammar concept must not postpone the first vocabulary presentation. */
export const COURSE_VOCABULARY: CourseWord[] = definitions.map(word => {
  let index = CONTENT.lessons.findIndex(lesson => lesson.id === word.lessonId);
  for (let candidate = 0; !word.id.startsWith('word-reference-') && candidate < index; candidate++) {
    if (utterances[candidate].some(turn => containsWord(turn.malagasy, word.malagasy))) { index = candidate; break; }
  }
  if (CONTENT.lessons[index].kind === 'checkpoint') index--;
  const lesson = CONTENT.lessons[index];
  return { ...word, lessonId: lesson.id, unitId: lesson.unitId };
});
