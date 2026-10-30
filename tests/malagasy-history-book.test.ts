import { describe, expect, it } from 'vitest';
import { HISTORY_BOOKS, historyReadingMinutes } from '../src/malagasy/history-books';
import { CONTENT } from '../src/malagasy/content';
import { createHistoryBookState, historyBookScore, renderHistoryBook } from '../src/malagasy/history-book-view';
import { historyDrawing } from '../src/malagasy/history-drawings';

describe('Illustrated historical booklets', () => {
  for (const [id, book] of Object.entries(HISTORY_BOOKS)) {
    it(`${id} offers five substantive sourced chapters and an end quiz`, () => {
      expect(book.pages).toHaveLength(5);
      const words = book.pages.flatMap(page => page.paragraphs).join(' ').split(/\s+/u).length;
      expect(words).toBeGreaterThanOrEqual(900);
      expect(historyReadingMinutes(book)).toBeGreaterThanOrEqual(4);
      expect(historyReadingMinutes(book)).toBeLessThanOrEqual(6);
      expect(new Set(book.pages.map(page => page.visual)).size).toBe(5);
      for (const page of book.pages) {
        expect(page.paragraphs.length).toBeGreaterThanOrEqual(3);
        expect(page.sourceIds.length).toBeGreaterThan(0);
        for (const source of page.sourceIds) expect(CONTENT.sources.some(item => item.id === source), source).toBe(true);
        expect(historyDrawing(page.visual)).toContain('role="img"');
        expect(historyDrawing(page.visual)).toContain('<title>');
      }
      expect(book.questions).toHaveLength(6);
      for (const question of book.questions) {
        expect(question.choices.length).toBe(3);
        expect(question.answer).toBeGreaterThanOrEqual(0);
        expect(question.answer).toBeLessThan(question.choices.length);
        expect(question.explanation.length).toBeGreaterThan(40);
      }
    });
    it(`${id} hides corrections until submission and allows cultural recall without persistence`, () => {
      const state = createHistoryBookState(id);
      state.page = book.pages.length;
      const before = renderHistoryBook(state);
      expect(before).not.toContain('ma-history-explanation');
      expect(before).toMatch(/data-action="history-check" disabled/);
      state.answers = book.questions.map(q => (q.answer + 1) % q.choices.length);
      expect(historyBookScore(state)).toBe(0);
      state.checked = true;
      expect(renderHistoryBook(state)).toContain('ma-history-explanation');
      state.answers = book.questions.map(q => q.answer);
      expect(historyBookScore(state)).toBe(6);
      expect(renderHistoryBook(state)).not.toContain('href=');
    });
  }
});
