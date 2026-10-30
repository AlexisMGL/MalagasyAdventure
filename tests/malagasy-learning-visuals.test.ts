import { describe, expect, it } from 'vitest';
import { renderLearningVisual } from '../src/malagasy/lesson-visuals';
import { getNotionCards } from '../src/malagasy/notion-cards';
import { CONTENT } from '../src/malagasy/content';

describe('meaningful lesson diagrams', () => {
  it('renders every authored visual with an accessible caption and Malagasy HTML labels', () => {
    const cards = CONTENT.lessons.flatMap(lesson => getNotionCards(lesson.id));
    expect(cards.length).toBeGreaterThan(50);
    for (const card of cards) {
      const html = renderLearningVisual(card.visual);
      expect(html).toContain('<figcaption>');
      expect(html).toContain('lang="mg"');
      expect(html).not.toContain('undefined');
      expect(html).not.toMatch(/<img|https?:\/\//);
    }
  });

  it('shows all twenty objects, split into two explicit tens', () => {
    const html = renderLearningVisual({ kind: 'quantity', items: [{ value: 20, label: 'roapolo', picture: 'book' }] });
    expect(html.match(/class="ma-learning-picture"/g)).toHaveLength(20);
    expect(html.match(/data-count="10"/g)).toHaveLength(2);
    expect(html).toContain('10 + 10 = 20');
    expect(html).toContain('aria-label="Quantité : 20.');
  });

  it('preserves supplied whole possessive words and changes only their visual emphasis', () => {
    const html = renderLearningVisual({ kind: 'possession', pairs: [
      { base: 'enfant', mine: 'zanako', yours: 'zanakao', picture: 'child' },
      { base: 'maison', mine: 'tranoko', yours: 'tranonao', picture: 'house' },
    ] });
    expect(html.replace(/<[^>]*>/g, '')).toContain('zanako');
    expect(html.replace(/<[^>]*>/g, '')).toContain('zanakao');
    expect(html).toContain('trano<b>ko</b>');
    expect(html).toContain('trano<b>nao</b>');
    expect(html).not.toContain(' + ');
    expect(html).not.toContain('zanakanaʻo');
  });

  it('distinguishes above and below in both the drawing and accessible text', () => {
    const html = renderLearningVisual({ kind: 'spatial', items: [
      { location: 'above', subject: 'book', label: 'eo ambony' },
      { location: 'below', subject: 'book', label: 'ao ambany' },
    ] });
    expect(html).toContain('au-dessus de la table');
    expect(html).toContain('sous la table');
    expect(html).toContain('translate(42 0)');
    expect(html).toContain('translate(42 72)');
  });

  it('escapes authored labels and keeps the full supplied dataset in compact mode', () => {
    const html = renderLearningVisual({ kind: 'pictorial', items: [
      { picture: 'book', label: '<boky>', caption: '<script>bad</script>' },
      { picture: 'house', label: 'trano' },
      { picture: 'chair', label: 'seza' },
    ] }, { compact: true });
    expect(html).toContain('is-compact');
    expect(html.match(/class="ma-visual-picture-item"/g)).toHaveLength(3);
    expect(html).toContain('&lt;boky&gt;');
    expect(html).not.toContain('<script>');
  });

  it('places whole-hour hands correctly at the four cardinal points', () => {
    for (const [hour, x, y] of [[3, 67, 48], [6, 48, 67], [9, 29, 48], [12, 48, 29]]) {
      const html = renderLearningVisual({ kind: 'clock', items: [{ hour, label: 'amin’ny ora', period: 'repère du jour' }] });
      expect(html).toContain(`aria-label="Horloge : ${hour} h 00. repère du jour"`);
      expect(html).toContain('class="ma-clock-minute-hand" x1="48" y1="48" x2="48" y2="19"');
      expect(html).toContain(`class="ma-clock-hour-hand" x1="48" y1="48" x2="${x}" y2="${y}"`);
      expect(html).toContain('<strong lang="mg">amin’ny ora</strong>');
    }
    for (const hour of [0, 13, 3.5]) expect(() => renderLearningVisual({ kind: 'clock', items: [{ hour, label: 'test' }] })).toThrow(RangeError);
  });
});
