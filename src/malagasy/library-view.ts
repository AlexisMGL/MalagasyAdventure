import { CONTENT } from './content';
import { escapeHtml as e } from './exercise-view';
import { icon } from './art';
import { getNotionCards } from './notion-cards';
import { renderNotionCard } from './lesson-view';
import { libraryLessons, libraryWords, lexiconGroups, referenceLesson, unlockedLessons, type LibraryMode, type LibraryState } from './library';
import type { Lesson, Progress } from './types';

const labels: Record<LibraryMode, string> = { lessons: 'Leçons', 'mg-fr': 'Malgache → Français', 'fr-mg': 'Français → Malgache' };
export function renderLibrary(progress: Progress, state: LibraryState): string {
  const lesson = referenceLesson(state.lessonId, progress);
  if (lesson) return renderReference(lesson);
  return `<div class="ma-page-heading"><span class="ma-eyebrow">LE CARNET DE VOS DÉCOUVERTES</span><h1 tabindex="-1">Ma bibliothèque.</h1><p>Relisez vos leçons débloquées et retrouvez leurs mots dans les deux sens.</p></div>
    ${state.lessonId ? '<p class="ma-info-banner" role="status">Cette leçon n’est pas encore débloquée. Retrouvez ci-dessous vos leçons disponibles.</p>' : ''}
    <div class="ma-library-tabs" role="tablist" aria-label="Contenu de la bibliothèque">${(Object.keys(labels) as LibraryMode[]).map(mode => `<button type="button" id="ma-library-tab-${mode}" role="tab" aria-selected="${state.mode === mode}" aria-controls="ma-library-results" tabindex="${state.mode === mode ? '0' : '-1'}" data-library-mode="${mode}">${labels[mode]}</button>`).join('')}</div>
    <div class="ma-library-search"><label for="ma-search">${icon('book', 18)}<span class="ma-library-sr-only">Rechercher dans la bibliothèque</span><input id="ma-search" type="search" placeholder="${state.mode === 'lessons' ? 'Chercher une leçon, un thème…' : 'Chercher en malgache ou en français…'}" value="${e(state.query)}"></label><span>Votre répertoire grandit au fil du voyage.</span></div>
    <div id="ma-library-results" role="tabpanel" aria-labelledby="ma-library-tab-${state.mode}">${renderLibraryResults(progress, state)}</div>`;
}

export function renderLibraryResults(progress: Progress, state: LibraryState): string {
  if (state.mode !== 'lessons') return renderLexicon(progress, state);
  const lessons = libraryLessons(progress, state.query);
  const total = unlockedLessons(progress).length;
  return `<p class="ma-library-count" role="status">${lessons.length} leçon${lessons.length > 1 ? 's' : ''} affichée${lessons.length > 1 ? 's' : ''} · ${total} débloquée${total > 1 ? 's' : ''}</p>${CONTENT.worlds.filter(world => lessons.some(lesson => lesson.worldId === world.id)).map(world => `<section class="ma-library-world"><div class="ma-section-heading"><div><span class="ma-eyebrow">MONDE ${world.number}</span><h2>${e(world.name)}</h2></div></div>${CONTENT.units.filter(unit => unit.worldId === world.id && lessons.some(lesson => lesson.unitId === unit.id)).map(unit => `<section class="ma-library-unit"><h3>Unité ${unit.number} · ${e(unit.title)}</h3><div>${lessons.filter(lesson => lesson.unitId === unit.id).map(lesson => `<button type="button" class="ma-library-lesson" data-library-lesson="${e(lesson.id)}"><span class="ma-library-lesson-icon">${icon(lesson.kind === 'checkpoint' ? 'star' : 'book', 23)}</span><span><small>${lesson.kind === 'checkpoint' ? 'QUIZ FINAL' : `PARTIE ${unit.lessonIds.indexOf(lesson.id) + 1}`}</small><strong>${e(lesson.title)}</strong><em>${progress.completedLessons.includes(lesson.id) ? 'Terminée · relire' : 'Débloquée · découvrir'}</em></span>${icon('arrow', 18)}</button>`).join('')}</div></section>`).join('')}</section>`).join('')}${lessons.length ? '' : '<p class="ma-empty-state">Aucune leçon débloquée ne correspond à votre recherche.</p>'}`;
}

function renderLexicon(progress: Progress, state: LibraryState): string {
  const mode = state.mode as 'mg-fr' | 'fr-mg', words = libraryWords(progress, mode, state.query), groups = lexiconGroups(words, mode);
  return `<p class="ma-library-count" role="status">${words.length} mot${words.length > 1 ? 's' : ''} et expression${words.length > 1 ? 's' : ''} · ${labels[mode]} · ordre alphabétique</p><nav class="ma-library-alphabet" aria-label="Lettres du lexique">${groups.map(group => `<button type="button" data-library-letter="${e(group.letter)}" aria-label="Aller à la lettre ${e(group.letter)}">${e(group.letter)}</button>`).join('')}</nav>${groups.map(group => `<section class="ma-library-letter" id="ma-letter-${e(group.letter)}"><h2>${e(group.letter)}</h2><dl>${group.words.map(word => {
    const lesson = CONTENT.lessons.find(lesson => lesson.id === word.lessonId)!;
    const world = CONTENT.worlds.find(world => world.id === lesson.worldId)!;
    const unit = CONTENT.units.find(unit => unit.id === lesson.unitId)!;
    return `<div class="ma-library-word" data-word-id="${e(word.id)}"><dt lang="${mode === 'mg-fr' ? 'mg' : 'fr'}">${e(mode === 'mg-fr' ? word.malagasy : word.french)}</dt><dd><strong lang="${mode === 'mg-fr' ? 'fr' : 'mg'}">${e(mode === 'mg-fr' ? word.french : word.malagasy)}</strong><p>${e(word.note)}</p><button type="button" class="ma-text-link" data-library-lesson="${e(lesson.id)}">${e(world.name)} · unité ${unit.number} · partie ${unit.lessonIds.indexOf(lesson.id) + 1} ${icon('arrow', 13)}</button></dd></div>`;
  }).join('')}</dl></section>`).join('')}${words.length ? '' : '<p class="ma-empty-state">Aucun mot de vos leçons débloquées ne correspond à votre recherche.</p>'}`;
}

function renderReference(lesson: Lesson): string {
  const unit = CONTENT.units.find(unit => unit.id === lesson.unitId)!, world = CONTENT.worlds.find(world => world.id === lesson.worldId)!;
  const cards = getNotionCards(lesson.id);
  return `<article class="ma-library-reference" data-reference-lesson="${e(lesson.id)}"><button type="button" class="ma-text-link" data-library-mode="lessons">← Toutes mes leçons</button><div class="ma-page-heading"><span class="ma-eyebrow">MONDE ${world.number} · ${e(world.name.toLocaleUpperCase('fr'))} · UNITÉ ${unit.number}</span><h1 tabindex="-1">${e(lesson.title)}</h1><p>${e(lesson.description)}</p></div><div class="ma-reference-toolbar"><span>Lecture libre · votre progression est conservée.</span><button class="ma-secondary" type="button" data-lesson="${e(lesson.id)}">${lesson.kind === 'checkpoint' ? 'Faire le quiz' : 'Pratiquer cette leçon'} ${icon('arrow', 17)}</button></div>${cards.length ? `<nav class="ma-reference-sections" aria-label="Sections de la leçon"><button data-library-section="vocabulary">${icon('book', 17)} Vocabulaire <b>${cards.filter(card => card.section === 'vocabulary').length}</b></button><button data-library-section="notion">${icon('compass', 17)} Notions <b>${cards.filter(card => card.section === 'notion').length}</b></button></nav>${(['vocabulary', 'notion'] as const).map(section => `<section id="ma-reference-${section}" class="ma-reference-section"><h2>${section === 'vocabulary' ? 'Vocabulaire' : 'Notions'}</h2><div>${cards.filter(card => card.section === section).map(card => renderNotionCard(card)).join('')}</div></section>`).join('')}` : `<section class="ma-panel"><h2>Les acquis à retrouver</h2><ul>${lesson.objectives.map(objective => `<li>${e(objective)}</li>`).join('')}</ul><p>Le quiz se déroule sans pense-bête. Retrouvez les fiches dans les deux parties précédentes de cette unité.</p></section>`}</article>`;
}
