import { describe, expect, it } from 'vitest';
import { CONTENT } from '../src/malagasy/content';
import { emptyDraft, renderTask } from '../src/malagasy/exercise-view';

const checkpoints = CONTENT.lessons.filter(lesson => lesson.worldId === 'world-01' && lesson.kind === 'checkpoint');
const questions = checkpoints.flatMap(lesson => lesson.exerciseIds.map(id => CONTENT.exercises.find(exercise => exercise.id === id)!));
const exercise = (id: string) => questions.find(item => item.id === id)!;
const words = (value: string): string => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
function visibleStem(id: string): string {
  const html = renderTask(exercise(id), emptyDraft(), false, true);
  // Exclude answer controls and cast labels. Naming who speaks is legitimate
  // comprehension; only the actual utterances and task wording form a copyable model.
  const utterances = [...html.matchAll(/<p class="ma-speech-text"[^>]*>([\s\S]*?)<\/p>/g)].map(match => match[1]);
  const question = html.match(/<h2 id="ma-question">([\s\S]*?)<\/h2>/)?.[1] ?? '';
  const context = html.match(/<div class="ma-exercise-context">([\s\S]*?)<\/div>/)?.[1] ?? '';
  return [...utterances, context, question].join(' ').replace(/<[^>]*>/g, ' ').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');
}

describe('world one quizzes require recall or interpretation', () => {
  it('does not print a complete accepted answer in the visible question, dialogue or context', () => {
    expect(checkpoints).toHaveLength(12);
    expect(questions).toHaveLength(144);
    for (const item of questions) {
      const stem = ` ${words(visibleStem(item.id))} `;
      for (const answer of item.answers) {
        expect(stem.includes(` ${words(answer)} `), `${item.id}: the visible stem contains “${answer}”`).toBe(false);
      }
    }
  });

  it('keeps genuine reading passages while asking for their meaning in French', () => {
    const thanks = exercise('exercise-01-03-e'), status = exercise('exercise-03-03-a');
    expect(visibleStem(thanks.id)).toContain('Misaotra, tompoko.');
    expect(visibleStem(status.id)).toContain('Avy any Frantsa aho. Mpiofana aho.');
    expect(thanks.answers).toEqual(['Elle remercie avec respect']);
    expect(status.answers).toEqual(['Elle est stagiaire']);
    for (const item of [thanks, status]) {
      expect(item.type).toBe('reading');
      expect(item.selectionLanguage).toBeUndefined();
      const before = renderTask(item, emptyDraft(), false, true);
      expect(before).not.toContain('ma-speech-translation');
      expect(renderTask(item, emptyDraft(), true, true)).toContain('ma-speech-translation');
    }
  });

  it('changes an object, person, perspective or number instead of repeating the model', () => {
    expect(exercise('exercise-05-03-k').dialogue?.[0].text).toBe('Eto ny boky.');
    expect(exercise('exercise-05-03-k').answers).toEqual(['Eto ny seza']);
    expect(exercise('exercise-05-03-l').dialogue?.[0].text).toBe('Eto ny tranonao.');
    expect(exercise('exercise-05-03-l').answers).toEqual(['tranoko']);
    expect(exercise('exercise-06-03-d').dialogue?.[0].text).toBe('Tia akondro ve ianao?');
    expect(exercise('exercise-06-03-d').answers).toEqual(['Tia akondro aho']);
    expect(exercise('exercise-07-03-e').dialogue?.[0].text).toBe("« sivy ambin'ny folo »");
    expect(exercise('exercise-07-03-e').answers).toEqual(['roapolo']);
    expect(exercise('exercise-08-03-l').answers).toEqual(['Inona']);
    expect(exercise('exercise-11-03-l').answers).toEqual(['Veloma.']);
  });
});
