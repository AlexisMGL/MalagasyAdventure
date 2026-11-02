import { CONTENT } from './content';
import { COURSE_VOCABULARY, containsWord, lessonUtterances, wordTokens } from './course-vocabulary';
import { recordingForTurn } from './voice-bank';
import type { NotionCard } from './notion-cards';

/** Explicit labels in Vocabulaire, not words hidden inside a grammar example. */
export function vocabularyLabels(card: NotionCard): string[] {
  if (card.section !== 'vocabulary') return [];
  const visual = card.visual;
  if (!('items' in visual)) return [];
  return visual.items.flatMap(item => 'label' in item ? [item.label, ...item.label.split(/[,·]/u).map(text => text.trim())] : []);
}
const key = (text: string) => wordTokens(text).join(' ');

/** Add concise illustrated word cards while keeping every existing grammar reminder. */
export function completeVocabularyCards(lessonId: string, cards: NotionCard[]): NotionCard[] {
  const lesson = CONTENT.lessons.find(item => item.id === lessonId);
  if (!lesson || lesson.kind === 'checkpoint') return cards;
  const labels = new Set(cards.flatMap(vocabularyLabels).map(key));
  const missing = COURSE_VOCABULARY.filter(word => word.lessonId === lessonId && !labels.has(key(word.malagasy)));
  const candidates = [...cards.flatMap(card => card.examples), ...lessonUtterances(lesson, CONTENT)];
  const additions: NotionCard[] = [];
  for (let offset = 0; offset < missing.length; offset += 4) {
    const words = missing.slice(offset, offset + 4);
    const examples: NotionCard['examples'] = [];
    for (const word of words) {
      const possibilities = [{ malagasy: word.malagasy, french: word.french }, ...candidates]
        .filter(example => containsWord(example.malagasy, word.malagasy));
      for (const example of possibilities) {
        const audio = recordingForTurn({ speaker: 'mia', text: example.malagasy, translation: example.french })
          ?? recordingForTurn({ speaker: 'lova', text: example.malagasy, translation: example.french });
        if (!audio) continue;
        if (!examples.some(existing => existing.malagasy === example.malagasy)) examples.push({ ...example, audioId: audio.id });
        break;
      }
    }
    additions.push({
      id: `vocabulary-${lessonId}-${offset / 4 + 1}`, section: 'vocabulary',
      title: missing.length <= 4 ? 'Les mots à reconnaître' : `Les mots à reconnaître · ${offset / 4 + 1}`,
      rule: 'Retenez le sens des mots et des expressions. Les fiches Notions expliquent ensuite comment les utiliser ensemble.',
      visual: { kind: 'pictorial', items: words.map(word => ({ picture: word.picture, label: word.malagasy, caption: word.french })) },
      examples,
      memory: 'Une image et un sens ; écoutez les mots dans les exemples entiers.',
      conceptIds: [...new Set(words.flatMap(word => {
        const concept = CONTENT.concepts.find(concept => concept.id === word.conceptId);
        return concept && CONTENT.lessons.findIndex(item => item.id === concept.introducedIn) <= CONTENT.lessons.indexOf(lesson)
          ? [concept.id] : lesson.introduces;
      }))],
      sourceIds: [...new Set(words.flatMap(word => word.sourceIds))],
    });
  }
  return [...cards.filter(card => card.section === 'vocabulary'), ...additions, ...cards.filter(card => card.section === 'notion')];
}
