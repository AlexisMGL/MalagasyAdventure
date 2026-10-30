import type { World } from './types';
import { HISTORY_BOOKS } from './history-books';

export interface HistoryInterlude {
  title: string; introduction: string; stops: { marker: string; title: string; body: string }[];
  remember: string; sourceIds: string[];
}
export function historyInterlude(world: World): HistoryInterlude {
  const book = HISTORY_BOOKS[world.id];
  if (book) return { ...book, stops: book.pages.map(page => ({ marker: page.marker, title: page.title, body: page.paragraphs.join(' ') })), sourceIds: [...new Set(book.pages.flatMap(page => page.sourceIds))] };
  return { title: `Une escale dans l’histoire · ${world.name}`, introduction: world.culture,
    stops: (world.cultureTopics ?? []).map((body, index) => ({ marker: `Repère ${index + 1}`, title: 'Un fil à poursuivre', body })),
    remember: 'Relier les périodes, les lieux et les acteurs aide à comprendre cette histoire.', sourceIds: world.cultureSourceIds ?? [] };
}
