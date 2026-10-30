import { describe, expect, it } from 'vitest';
import { CONTENT } from '../src/malagasy/content';
import { createProgress, validateContent, worldAvailable } from '../src/malagasy/engine';
import { CULTURE_CURRICULUM } from '../src/malagasy/history-curriculum';

describe('documented cultural curriculum', () => {
  it('adds a cultural thread without unlocking any future world or lesson', () => {
    const progress = createProgress('2026-10-28T10:00:00.000Z');
    for (const worldId of Object.keys(CULTURE_CURRICULUM)) {
      const world = CONTENT.worlds.find(candidate => candidate.id === worldId)!;
      expect(worldAvailable(world, progress, CONTENT)).toBe(world.id === 'world-01');
      if (!world.implemented) expect(CONTENT.lessons.some(lesson => lesson.worldId === worldId)).toBe(false);
    }
    expect(validateContent(CONTENT)).toEqual([]);
  });

  it('introduces the main historical threads throughout the journey rather than at its end', () => {
    expect(CONTENT.worlds.every(world => world.cultureTopics && world.cultureTopics.length >= 2 && world.cultureTopics.length <= 4)).toBe(true);
    const early = CONTENT.worlds.slice(0, 8).flatMap(world => world.cultureTopics ?? []).join(' ');
    for (const sovereign of ['Andrianampoinimerina', 'Radama Ier', 'Ranavalona Ire', 'Radama II', 'Rasoherina', 'Ranavalona II', 'Ranavalona III']) {
      expect(early).toContain(sovereign);
    }
    expect(early).toContain('1817');
    expect(early).toContain('1896');
    expect(early).toContain('travail forcé');
    expect(CULTURE_CURRICULUM['world-13'].cultureTopics?.join(' ')).toContain('MDRM');
    expect(CULTURE_CURRICULUM['world-14'].cultureTopics?.join(' ')).toContain('1947');
    expect(CULTURE_CURRICULUM['world-16'].cultureTopics?.join(' ')).toContain('26 juin 1960');
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
