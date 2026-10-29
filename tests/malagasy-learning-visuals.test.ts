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
});
