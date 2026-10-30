import { WORLD_TWO_FIRST_NOTIONS } from './world-two-notions-01-06';
import { WORLD_TWO_SECOND_NOTIONS } from './world-two-notions-07-12';
import type { NotionCard } from './notion-cards';

/** Authored vocabulary and construction cards for every non-quiz Antsirabe part. */
export const WORLD_TWO_NOTIONS: Record<string, NotionCard[]> = {
  ...WORLD_TWO_FIRST_NOTIONS,
  ...WORLD_TWO_SECOND_NOTIONS,
};
