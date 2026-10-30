import type { CharacterId, Concept, Content, DialogueScene, DialogueTurn, Exercise, Lesson, LessonNote, Source, Vocabulary } from './types';

export type WorldTwoBundle = Pick<Content, 'units' | 'lessons' | 'concepts' | 'vocabulary' | 'exercises' | 'sources'>;
export type WorldTwoTask = Omit<Exercise, 'id' | 'sourceIds'>;
export type WorldTwoConcept = Pick<Concept, 'id' | 'label' | 'category' | 'objective'> & Partial<Pick<Concept, 'malagasy' | 'french' | 'prerequisites'>>;
export type WorldTwoScene = Omit<DialogueScene, 'id'>;
export interface WorldTwoPart {
  title: string; description: string; concepts: WorldTwoConcept[]; reviews: string[];
  scenes: WorldTwoScene[]; notes: LessonNote[]; tasks: WorldTwoTask[];
}
export function worldTwoBundle(): WorldTwoBundle {
  return { units: [], lessons: [], concepts: [], vocabulary: [], exercises: [], sources: [] };
}
export const W2_PC = 'w2-peacecorps-daily';
export const WORLD_TWO_COMMON_SOURCES: Source[] = [{
  id: W2_PC, title: 'An Introduction to the Malagasy Language — questions, present and daily activities', author: 'Peace Corps / Madagascar',
  url: 'https://fsi-languages.yojik.eu/languages/PeaceCorps/Malagasy-Sakalava/Malagasy-peace-corps/MG_Malagasy_Language_Lessons.pdf',
  category: 'language', consulted: true, supports: 'PDF consulté : présentation p. 5, pronoms et prédicats p. 7–9, questions p. 11–13, dont la question de l’heure. Scènes et exercices originaux ; les emplois du temps sont fictifs.',
  license: 'Document institutionnel consulté ; aucune page, illustration ou voix copiée. Formulations courtes recombinées dans des dialogues originaux.',
}];
export function w2Dictionary(word: string, supports: string): Source {
  return { id: `w2-dict-${word.replace(/[^a-z]/gi, '-')}`, title: `Dictionnaire malgache : ${word}`, author: 'Dictionnaire malgache et Encyclopédie de Madagascar — auteurs cités dans chaque entrée',
    url: `https://malagasyword.org/bins/teny2/${encodeURIComponent(word)}`, category: 'dictionary', consulted: true, supports,
    license: 'Consultation lexicographique ; sens et formes reformulés. Dialogues originaux ; aucune définition longue ni voix reproduite.' };
}
export const w2Turn = (speaker: CharacterId, text: string, translation: string, highlight?: string): DialogueTurn => ({ speaker, text, translation, ...(highlight ? { highlight } : {}) });
export const l = (text: string, translation: string, highlight?: string): DialogueTurn => w2Turn('lova', text, translation, highlight);
export const m = (text: string, translation: string, highlight?: string): DialogueTurn => w2Turn('mia', text, translation, highlight);
export const sc = (setting: string, turns: DialogueTurn[], malagasy: string, french: string): WorldTwoScene => ({ setting, turns, takeaway: { malagasy, french } });
export function task(type: Exercise['type'], question: string, answers: string[], concepts: string[], explanation: string, extra: Partial<WorldTwoTask> = {}): WorldTwoTask {
  return { type, prompt: 'À vous de répondre', question, answers, concepts, explanation, difficulty: 2, ...extra };
}
export const choose = (question: string, answer: string, other: string[], concepts: string[], explanation: string, extra: Partial<WorldTwoTask> = {}): WorldTwoTask =>
  task('choice', question, [answer], concepts, explanation, { choices: [answer, ...other], ...extra });
export const reply = (question: string, answer: string, other: string[], concepts: string[], explanation: string, dialogue: DialogueTurn[]): WorldTwoTask =>
  task('dialogue', question, [answer], concepts, explanation, { choices: [answer, ...other], selectionLanguage: 'mg', dialogue });
export const order = (question: string, answer: string, concepts: string[], explanation: string, dialogue?: DialogueTurn[]): WorldTwoTask =>
  task('order', question, [answer], concepts, explanation, { tokens: answer.split(' '), selectionLanguage: 'mg', ...(dialogue ? { dialogue } : {}) });
export const cloze = (question: string, answer: string, concepts: string[], explanation: string, dialogue?: DialogueTurn[]): WorldTwoTask =>
  task('cloze', question, [answer], concepts, explanation, dialogue ? { dialogue } : {});
export const translate = (question: string, answer: string, concepts: string[], explanation: string, dialogue?: DialogueTurn[]): WorldTwoTask =>
  task('translate', question, [answer], concepts, explanation, dialogue ? { dialogue } : {});
export const match = (question: string, pairs: [string, string][], concepts: string[], explanation: string): WorldTwoTask =>
  task('match', question, [], concepts, explanation, { pairs: pairs.map(([left, right]) => ({ left, right })), selectionLanguage: 'mg' });

export function addWorldTwoUnit(bundle: WorldTwoBundle, number: number, title: string, malagasyTitle: string, description: string,
  objectives: string[], sourceIds: string[], parts: [WorldTwoPart, WorldTwoPart], quiz: WorldTwoTask[]): void {
  if (parts.some(part => part.tasks.length !== 6) || quiz.length !== 12) throw new Error(`World 2 unit ${number}: expected 6 + 6 + 12 activities`);
  const unit = String(number).padStart(2, '0'), unitId = `unit-02-${unit}`;
  const lessonIds = [1, 2, 3].map(part => `lesson-02-${unit}-0${part}`);
  bundle.units.push({ id: unitId, worldId: 'world-02', number, title, malagasyTitle, description, lessonIds, implemented: true, objectives });
  const allConcepts = [...new Set(parts.flatMap(part => [...part.concepts.map(concept => concept.id), ...part.reviews]))];
  const entries = [...parts, { title: `Quiz final · ${title}`, description: 'Douze questions de rappel, de compréhension et de transfert.', concepts: [], reviews: allConcepts, scenes: [], notes: [], tasks: quiz }];
  entries.forEach((part, index) => {
    const id = lessonIds[index];
    bundle.concepts.push(...part.concepts.map(concept => ({ ...concept, introducedIn: id, sourceIds, prerequisites: concept.prerequisites ?? [] })));
    const tasks = part.tasks.map((activity, position) => ({ ...activity, id: `exercise-w2-${unit}-0${index + 1}-${String.fromCharCode(97 + position)}`, sourceIds }));
    bundle.exercises.push(...tasks);
    const previous = index ? lessonIds[index - 1] : number === 1 ? 'lesson-12-03' : `lesson-02-${String(number - 1).padStart(2, '0')}-03`;
    bundle.lessons.push({ id, worldId: 'world-02', unitId, title: part.title, description: part.description, kind: index === 2 ? 'checkpoint' : index === 0 ? 'learn' : 'story',
      objectives: index === 2 ? objectives : part.concepts.length ? part.concepts.map(concept => concept.objective) : objectives,
      introduces: part.concepts.map(concept => concept.id), reviews: part.reviews, prerequisites: [previous], exerciseIds: tasks.map(activity => activity.id),
      estimatedMinutes: index === 2 ? 10 : 7, sourceIds, notes: part.notes,
      ...(index === 2 ? {} : { scenes: part.scenes.map((scene, position) => ({ ...scene, id: `scene-w2-${unit}-0${index + 1}-${String.fromCharCode(97 + position)}` })) }),
    });
  });
}
export function addWorldTwoWords(bundle: WorldTwoBundle, unit: number, conceptId: string, entries: [string, string, string][], sourceIds: string[]): void {
  const prefix = `word-w2-${String(unit).padStart(2, '0')}-${conceptId.replace(/^w2\./, '').replaceAll('.', '-')}`;
  bundle.vocabulary.push(...entries.map(([malagasy, french, note], index): Vocabulary => ({ id: `${prefix}-${index + 1}`, malagasy, french, note, unitId: `unit-02-${String(unit).padStart(2, '0')}`, conceptId, sourceIds })));
}
