import type { Exercise, Lesson } from './types';
import type { AnswerDraft } from './exercise-view';

/** Transient session UI. Persistent progress continues to use stable lesson/concept IDs. */
export interface LearningSession {
  lesson: Lesson; exercises: Exercise[]; index: number; correct: number;
  draft: AnswerDraft; answered: boolean; wasCorrect: boolean;
  stage: 'notion' | 'notes' | 'exercise' | 'done'; review: boolean; xpBefore: number;
  /** A temporary bookmark for the short lesson and its dialogue-side reminder. */
  notionIndex?: number;
  notionExamplesOpen?: boolean;
  audioReady?: boolean; sceneIndex: number; revealedTurns: number;
  combo: number; maxCombo: number; lastReward: number;
  results: { exerciseId: string; correct: boolean }[];
}
