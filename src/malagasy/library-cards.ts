import { CONTENT } from './content';
import { getNotionCards, type NotionCard, type NotionSection } from './notion-cards';
import { librarySearchKey, unlockedLessons } from './library';
import type { LearningPicture } from './learning-visual-types';
import type { Lesson, Progress } from './types';

/** French index labels only: the reminders, examples and Malagasy forms stay unchanged. */
const topics = {
  greetings: ['Salutations et politesse', 'greeting', 'bonjour merci au revoir respect'],
  people: ['Se présenter et parler des personnes', 'person', 'nom origine pays pronoms je tu il elle sujet'],
  family: ['La famille', 'family', 'parents proches mère père enfant'],
  home: ['La maison et les objets', 'house', 'meubles table chaise livre vaisselle'],
  food: ['Manger et boire', 'rice', 'repas nourriture boissons faim soif'],
  numbers: ['Les nombres', 'number', 'chiffres compter comptage quantité quantités zéro un deux trois dix vingt'],
  questions: ['Les questions et les prix', 'question', 'interrogatif interrogatifs qui quoi où combien prix monnaie'],
  directions: ['Les déplacements', 'place', 'chemin trajet directions gauche droite tout droit marché'],
  needs: ['Les besoins et les envies', 'need', 'avoir vouloir aimer besoin fatigue repos toilettes'],
  time: ['Les moments de la journée', 'morning', 'temps moment matin soir nuit maintenant'],
  actions: ['Les activités du quotidien', 'work', 'verbes travailler apprendre étudier lire écrire laver cuisiner dormir'],
  hours: ['Les heures', 'clock', 'heure horloge horaires cadran'],
  frequency: ['Les habitudes et la fréquence', 'repeat', 'fréquence souvent parfois chaque jour'],
  links: ['Relier et opposer', 'link', 'connecteur connecteurs et mais sy fa'],
  conversations: ['Les conversations à retrouver', 'understand', 'conversation rencontre récapitulatif voyage'],
  sounds: ['Lire et prononcer', 'book', 'prononciation sons lettres orthographe o y'],
  possession: ['La possession', 'name', 'possessif possessifs attribuer mon ma ton ta son sa -ko -nao -ny'],
  sentences: ['Construire une phrase', 'focus', 'ordre des mots sujet prédicat pronom article action objet ny no'],
  negation: ['La négation', 'no', 'nier négatif ne pas tsy'],
  location: ['Les positions et les lieux', 'place', 'position localisation lieu ici là dedans dessus dessous sur sous ao eo ambony ambany'],
  help: ['Se faire comprendre', 'slow', 'aide répéter lentement comprendre'],
} satisfies Record<string, [string, LearningPicture, string]>;
type TopicId = keyof typeof topics;
export interface LibraryCard {
  lesson: Lesson;
  card: NotionCard;
  title: string;
  topic: { id: TopicId; title: string; picture: LearningPicture; keywords: string };
  preview: string;
}

const vocabularyTopics: Record<string, TopicId[]> = {
  'world-01': ['greetings', 'people', 'people', 'family', 'home', 'food', 'numbers', 'questions', 'directions', 'needs', 'conversations', 'conversations'],
  'world-02': ['time', 'actions', 'hours', 'food', 'actions', 'home', 'family', 'actions', 'actions', 'frequency', 'links', 'conversations'],
};
const wordCardTitles: Record<string, string[]> = {
  'lesson-02-01': ['Le nom et la question « qui ? »', 'Le mot no'],
  'lesson-02-02': ['Dire et demander son origine', 'Là-bas : any'],
  'lesson-03-01': ['L’article ny'],
  'lesson-03-02': ['Tsy et ve'],
  'lesson-04-02': ['Ma mère, ton père…', 'Mon enfant et le verbe avoir'],
  'lesson-05-02': ['Ma maison et les lieux', 'Dans, sur et sous', 'Les petits mots de position'],
  'lesson-06-01': ['Avoir faim et soif'],
  'lesson-07-02': ['Prix et monnaie'],
  'lesson-08-01': ['Ton travail'],
  'lesson-08-02': ['Combien : firy'],
  'lesson-09-02': ['Aller et tourner', 'Tout droit et tourner'],
  'lesson-10-01': ['Fatigue, envie et repos', 'Dormir et boire'],
  'lesson-10-02': ['Comprendre et faire répéter'],
  'lesson-02-01-01': ['Maintenant : izao'],
  'lesson-02-02-01': ['Le matin, la nuit et à'],
  'lesson-02-03-01': ['Les heures du matin et du soir', 'Demander l’heure'],
  'lesson-02-04-01': ['Je mange, je bois'],
  'lesson-02-05-01': ['La langue malgache'],
  'lesson-02-08-01': ['Lire : mamaky'],
  'lesson-02-09-01': ['Laver et cuisiner'],
  'lesson-02-11-01': ['Et : sy'],
  'lesson-02-11-02': ['Mais et mais pas'],
};
const vocabularyTopicOverrides: Record<string, TopicId> = {
  'vocabulary-lesson-02-01-2': 'sentences',
  'vocabulary-lesson-03-01-1': 'sentences',
  'vocabulary-lesson-05-02-2': 'location',
  'vocabulary-lesson-05-02-3': 'location',
  'vocabulary-lesson-07-02-1': 'questions',
  'vocabulary-lesson-08-01-1': 'actions',
  'notion-10-02-1': 'help',
  'vocabulary-lesson-10-02-1': 'help',
};
function topicId(card: NotionCard, lesson: Lesson): TopicId {
  const visual = card.visual;
  if (visual.kind === 'quantity') return 'numbers';
  if (visual.kind === 'clock') return card.conceptIds.includes('w2.frequency') ? 'frequency' : 'hours';
  if (visual.kind === 'possession') return 'possession';
  if (visual.kind === 'sounds') return 'sounds';
  if (visual.kind === 'spatial') return 'location';
  if (visual.kind === 'directions') return 'directions';
  if (card.section === 'vocabulary') {
    const unit = CONTENT.units.find(unit => unit.id === lesson.unitId)!;
    return vocabularyTopicOverrides[card.id] ?? vocabularyTopics[lesson.worldId]?.[unit.number - 1] ?? 'conversations';
  }
  const has = (...ids: string[]): boolean => ids.some(id => card.conceptIds.includes(id));
  if (has('w2.and-sy', 'w2.contrast-fa')) return 'links';
  if (has('w2.frequency')) return 'frequency';
  if (has('grammar.negation-tsy')) return 'negation';
  if (has('w2.possession-ny')) return 'possession';
  if (has('grammar.question-ve') || visual.kind === 'questions') return 'questions';
  if (has('w1.location', 'w1.left-right')) return 'location';
  if (has('w2.clock-hours', 'w2.ask-time')) return 'hours';
  if (has('w1.numbers-ten', 'w1.numbers-twenty')) return 'numbers';
  if (has('w2.present-time', 'w2.day-parts')) return 'time';
  if (has('w1.understand', 'w1.repeat', 'w1.slow')) return 'help';
  if (has('w1.price', 'w1.question-quantity')) return 'questions';
  if (has('skill.name', 'skill.origin')) return 'people';
  if (has('w1.have', 'w1.hunger-thirst', 'w1.need', 'w1.like', 'w1.want')) return 'needs';
  if (has('vocab.respect')) return 'greetings';
  return 'sentences';
}
function indexCard(lesson: Lesson, card: NotionCard): LibraryCard {
  const id = topicId(card, lesson), [title, picture, keywords] = topics[id];
  const extraNumber = card.id.startsWith(`vocabulary-${lesson.id}-`) ? Number(card.id.split('-').at(-1)) - 1 : -1;
  const displayTitle = wordCardTitles[lesson.id]?.[extraNumber] ?? card.title;
  const visual = card.visual;
  const preview = visual.kind === 'pictorial' ? visual.items.map(item => `${item.label}${item.caption ? ` : ${item.caption}` : ''}`).join(' · ')
    : card.examples.map(example => example.malagasy).join(' · ');
  return { lesson, card, title: displayTitle, topic: { id, title, picture, keywords }, preview };
}
const cards = CONTENT.lessons.flatMap(lesson => getNotionCards(lesson.id).map(card => indexCard(lesson, card)));
function visualTerms(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (value && typeof value === 'object') return Object.values(value).map(visualTerms).join(' ');
  return '';
}

export function referenceCard(lessonId: string | undefined, cardId: string | undefined, progress: Progress): LibraryCard | undefined {
  if (!cardId || !unlockedLessons(progress).some(lesson => lesson.id === lessonId)) return undefined;
  return cards.find(entry => entry.lesson.id === lessonId && entry.card.id === cardId);
}
export function libraryCards(progress: Progress, section: NotionSection, query = ''): LibraryCard[] {
  const available = new Set(unlockedLessons(progress).map(lesson => lesson.id));
  const terms = librarySearchKey(query).split(/\s+/u).filter(Boolean);
  return cards.filter(entry => {
    if (entry.card.section !== section || !available.has(entry.lesson.id)) return false;
    const unit = CONTENT.units.find(unit => unit.id === entry.lesson.unitId)!;
    const world = CONTENT.worlds.find(world => world.id === entry.lesson.worldId)!;
    const text = librarySearchKey(`${entry.title} ${entry.topic.title} ${entry.topic.keywords} ${entry.preview} ${visualTerms(entry.card.visual)} ${entry.card.rule} ${entry.card.memory ?? ''} ${entry.card.examples.map(example => `${example.malagasy} ${example.french}`).join(' ')} ${world.name} ${unit.title}`);
    return terms.every(term => text.includes(term));
  }).sort((a, b) => a.topic.title.localeCompare(b.topic.title, 'fr') || CONTENT.lessons.indexOf(a.lesson) - CONTENT.lessons.indexOf(b.lesson));
}
