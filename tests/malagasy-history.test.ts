import { describe, expect, it } from 'vitest';
import { CONTENT } from '../src/malagasy/content';
import { createProgress, validateContent, worldAvailable } from '../src/malagasy/engine';
import { CULTURE_CURRICULUM } from '../src/malagasy/history-curriculum';

describe('documented cultural curriculum', () => {
  it('keeps historical authoring plans separate from playable course progress', () => {
    const progress = createProgress('2026-10-28T10:00:00.000Z');
    for (const worldId of Object.keys(CULTURE_CURRICULUM)) {
      const world = CONTENT.worlds.find(candidate => candidate.id === worldId)!;
      expect(worldAvailable(world, progress, CONTENT)).toBe(false);
      expect(CONTENT.lessons.some(lesson => lesson.worldId === worldId)).toBe(false);
    }
    expect(validateContent(CONTENT)).toEqual([]);
  });

  it('rejects missing cultural source references instead of silently losing provenance', () => {
    const worlds = CONTENT.worlds.map(world => world.id === 'world-15'
      ? { ...world, cultureSourceIds: ['unknown-historical-source'] } : world);
    expect(validateContent({ ...CONTENT, worlds })).toContain('world-15: référence sources absente unknown-historical-source');
    const unsourced = CONTENT.worlds.map(world => world.id === 'world-15'
      ? { ...world, cultureSourceIds: [] } : world);
    expect(validateContent({ ...CONTENT, worlds: unsourced })).toContain('world-15: sources absentes');
  });
});
