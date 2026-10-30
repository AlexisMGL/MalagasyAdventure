import { WORLD_TWO_FIRST_HALF } from './world-two-units-01-06';
import { WORLD_TWO_SECOND_HALF } from './world-two-units-07-12';
import { WORLD_TWO_COMMON_SOURCES, type WorldTwoBundle } from './world-two-authoring';

/** The complete authored Antsirabe world; integration preserves world-one save IDs. */
export const WORLD_TWO: WorldTwoBundle = {
  units: [...WORLD_TWO_FIRST_HALF.units, ...WORLD_TWO_SECOND_HALF.units],
  lessons: [...WORLD_TWO_FIRST_HALF.lessons, ...WORLD_TWO_SECOND_HALF.lessons],
  concepts: [...WORLD_TWO_FIRST_HALF.concepts, ...WORLD_TWO_SECOND_HALF.concepts],
  exercises: [...WORLD_TWO_FIRST_HALF.exercises, ...WORLD_TWO_SECOND_HALF.exercises],
  vocabulary: [...WORLD_TWO_FIRST_HALF.vocabulary, ...WORLD_TWO_SECOND_HALF.vocabulary],
  sources: [...new Map([...WORLD_TWO_COMMON_SOURCES, ...WORLD_TWO_FIRST_HALF.sources, ...WORLD_TWO_SECOND_HALF.sources]
    .map(source => [source.id, source])).values()],
};
