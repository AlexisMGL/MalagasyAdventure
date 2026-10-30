import type { Content, Progress, Unit } from './types';
import { worldAvailable } from './engine';

export const unitsOfWorld = (worldId: string, content: Content): Unit[] => content.units
  .filter(unit => unit.worldId === worldId && unit.implemented).sort((a, b) => a.number - b.number);

/** Derived from stable lesson IDs: existing v1 saves unlock the interlude automatically. */
export function historyAccess(worldId: string, progress: Progress, content: Content): { unlocked: boolean; midpointUnit: number; completed: number; required: number } {
  const world = content.worlds.find(item => item.id === worldId);
  const units = unitsOfWorld(worldId, content);
  const firstHalf = units.slice(0, Math.ceil(units.length / 2));
  const lessons = firstHalf.flatMap(unit => unit.lessonIds);
  const completed = lessons.filter(id => progress.completedLessons.includes(id)).length;
  return {
    unlocked: !!world && worldAvailable(world, progress, content) && lessons.length > 0 && completed === lessons.length,
    midpointUnit: firstHalf.at(-1)?.number ?? 0,
    completed, required: lessons.length,
  };
}
