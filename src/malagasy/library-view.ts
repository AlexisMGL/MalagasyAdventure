import { CONTENT } from './content';
import { escapeHtml as e } from './exercise-view';
import { icon } from './art';
import { getNotionCards } from './notion-cards';
import { renderNotionCard } from './lesson-view';
import { renderLearningThumbnail } from './lesson-visuals';
import { libraryCards, referenceCard, type LibraryCard } from './library-cards';
import { vocabularyLabels } from './vocabulary-cards';
import { wordTokens } from './course-vocabulary';
import { libraryWords, lexiconGroups, referenceLesson, type LibraryMode, type LibraryState } from './library';
import type { Lesson, Progress } from './types';

const labels: Record<LibraryMode, string> = { lessons: 'Vocabulaire', notions: 'Notions', 'mg-fr': 'Malgache → Français', 'fr-mg': 'Français → Malgache' };
export function renderLibrary(progress: Progress, state: LibraryState): string {
  const lesson = referenceLesson(state.lessonId, progress);
  const entry = referenceCard(state.lessonId, state.cardId, progress);
  if (entry) return renderCardReference(entry, progress);
  if (lesson && !state.cardId) return renderReference(lesson);
  return `<div class="ma-page-heading"><span class="ma-eyebrow">VOS PENSE-BÊTES À PORTÉE DE MAIN</span><h1 tabindex="-1">Mon carnet.</h1><p>Un rappel sur les chiffres, la famille ou les possessifs ? Retrouvez ici chaque fiche, son dessin et ses prononciations.</p></div>
    ${state.lessonId ? `<p class="ma-info-banner" role="status">${state.cardId ? 'Cette fiche n’est pas disponible.' : 'Cette leçon n’est pas encore débloquée.'} Retrouvez ci-dessous vos fiches disponibles.</p>` : ''}
    <div class="ma-library-tabs" role="tablist" aria-label="Contenu de la bibliothèque">${(Object.keys(labels) as LibraryMode[]).map(mode => `<button type="button" id="ma-library-tab-${mode}" role="tab" aria-selected="${state.mode === mode}" aria-controls="ma-library-results" tabindex="${state.mode === mode ? '0' : '-1'}" data-library-mode="${mode}">${labels[mode]}</button>`).join('')}</div>
    <div class="ma-library-search"><label for="ma-search">${icon('book', 18)}<span class="ma-library-sr-only">Rechercher dans la bibliothèque</span><input id="ma-search" type="search" placeholder="${state.mode === 'lessons' || state.mode === 'notions' ? 'Ex. chiffres, famille, possession…' : 'Chercher en malgache ou en français…'}" value="${e(state.query)}"></label><span>Votre carnet grandit au fil du voyage.</span></div>
    <div id="ma-library-results" role="tabpanel" aria-labelledby="ma-library-tab-${state.mode}">${renderLibraryResults(progress, state)}</div>`;
}

export function renderLibraryResults(progress: Progress, state: LibraryState): string {
  if (state.mode === 'mg-fr' || state.mode === 'fr-mg') return renderLexicon(progress, state);
  const section = state.mode === 'notions' ? 'notion' : 'vocabulary';
  const cards = libraryCards(progress, section, state.query), total = libraryCards(progress, section).length;
  const topics = [...new Map(cards.map(entry => [entry.topic.id, entry.topic])).values()];
  return `<p class="ma-library-count" role="status">${cards.length} fiche${cards.length > 1 ? 's' : ''} ${section === 'vocabulary' ? 'de vocabulaire' : 'de notions'} · ${total} débloquée${total > 1 ? 's' : ''}</p>
    ${topics.length > 1 ? `<details class="ma-carnet-index"><summary>Parcourir les thèmes <span>${topics.length}</span></summary><nav aria-label="Thèmes du carnet">${topics.map(topic => `<button type="button" data-library-topic="${topic.id}">${e(topic.title)}</button>`).join('')}</nav></details>` : ''}
    <div class="ma-carnet">${topics.map(topic => `<section class="ma-carnet-topic" id="ma-topic-${topic.id}"><h2>${e(topic.title)} <span>${cards.filter(entry => entry.topic.id === topic.id).length}</span></h2><div class="ma-carnet-cards">${cards.filter(entry => entry.topic.id === topic.id).map(renderCardLink).join('')}</div></section>`).join('')}</div>
    ${cards.length ? '' : '<p class="ma-empty-state">Aucune fiche débloquée ne correspond à votre recherche. Essayez aussi l’autre section du carnet.</p>'}`;
}

function lessonOrigin(lesson: Lesson): string {
  const unit = CONTENT.units.find(unit => unit.id === lesson.unitId)!, world = CONTENT.worlds.find(world => world.id === lesson.worldId)!;
  return `${world.name} · unité ${unit.number} · partie ${unit.lessonIds.indexOf(lesson.id) + 1}`;
}
function renderCardLink(entry: LibraryCard): string {
  return `<button type="button" class="ma-carnet-card" data-library-lesson="${e(entry.lesson.id)}" data-library-card="${e(entry.card.id)}"><span class="ma-carnet-icon" aria-hidden="true">${renderLearningThumbnail(entry.card.visual, entry.topic.picture)}</span><span class="ma-carnet-card-text"><strong>${e(entry.title)}</strong><span>${e(entry.preview)}</span><small>${e(lessonOrigin(entry.lesson))}</small></span>${icon('arrow', 16)}</button>`;
}
function renderCardReference(entry: LibraryCard, progress: Progress): string {
  const mode = entry.card.section === 'vocabulary' ? 'lessons' : 'notions';
  const related = libraryCards(progress, entry.card.section).filter(other => other.topic.id === entry.topic.id && other.card.id !== entry.card.id);
  return `<article class="ma-library-reference ma-carnet-reference" data-reference-lesson="${e(entry.lesson.id)}" data-reference-card="${e(entry.card.id)}"><button type="button" class="ma-text-link" data-library-mode="${mode}">← ${entry.card.section === 'vocabulary' ? 'Toutes les fiches de vocabulaire' : 'Toutes les fiches de notions'}</button><div class="ma-page-heading"><span class="ma-eyebrow">${labels[mode].toLocaleUpperCase('fr')} · ${e(lessonOrigin(entry.lesson))}</span><h1 tabindex="-1">${e(entry.topic.title)}</h1></div>
    ${renderNotionCard({ ...entry.card, title: entry.title })}
    <div class="ma-reference-toolbar"><span>Lecture libre · votre progression est conservée.</span><button class="ma-secondary" type="button" data-lesson="${e(entry.lesson.id)}">Pratiquer cette leçon ${icon('arrow', 17)}</button><button type="button" class="ma-text-link" data-library-lesson="${e(entry.lesson.id)}">Voir les autres fiches de cette leçon</button></div>
    ${related.length ? `<section class="ma-carnet-related"><h2>Dans le même thème</h2><div class="ma-carnet-cards">${related.map(renderCardLink).join('')}</div></section>` : ''}</article>`;
}

function renderLexicon(progress: Progress, state: LibraryState): string {
  const mode = state.mode as 'mg-fr' | 'fr-mg', words = libraryWords(progress, mode, state.query), groups = lexiconGroups(words, mode);
  return `<p class="ma-library-count" role="status">${words.length} mot${words.length > 1 ? 's' : ''} et expression${words.length > 1 ? 's' : ''} · ${labels[mode]} · ordre alphabétique</p><nav class="ma-library-alphabet" aria-label="Lettres du lexique">${groups.map(group => `<button type="button" data-library-letter="${e(group.letter)}" aria-label="Aller à la lettre ${e(group.letter)}">${e(group.letter)}</button>`).join('')}</nav>${groups.map(group => `<section class="ma-library-letter" id="ma-letter-${e(group.letter)}"><h2>${e(group.letter)}</h2><dl>${group.words.map(word => {
    const lesson = CONTENT.lessons.find(lesson => lesson.id === word.lessonId)!;
    const world = CONTENT.worlds.find(world => world.id === lesson.worldId)!;
    const unit = CONTENT.units.find(unit => unit.id === lesson.unitId)!;
    const card = getNotionCards(lesson.id).find(card => vocabularyLabels(card).some(label => wordTokens(label).join(' ') === wordTokens(word.malagasy).join(' ')));
    return `<div class="ma-library-word" data-word-id="${e(word.id)}"><dt lang="${mode === 'mg-fr' ? 'mg' : 'fr'}">${e(mode === 'mg-fr' ? word.malagasy : word.french)}</dt><dd><strong lang="${mode === 'mg-fr' ? 'fr' : 'mg'}">${e(mode === 'mg-fr' ? word.french : word.malagasy)}</strong><p>${e(word.note)}</p><button type="button" class="ma-text-link" data-library-lesson="${e(lesson.id)}"${card ? ` data-library-card="${e(card.id)}"` : ''}>${e(world.name)} · unité ${unit.number} · partie ${unit.lessonIds.indexOf(lesson.id) + 1} ${icon('arrow', 13)}</button></dd></div>`;
  }).join('')}</dl></section>`).join('')}${words.length ? '' : '<p class="ma-empty-state">Aucun mot de vos leçons débloquées ne correspond à votre recherche.</p>'}`;
}

function renderReference(lesson: Lesson): string {
  const unit = CONTENT.units.find(unit => unit.id === lesson.unitId)!, world = CONTENT.worlds.find(world => world.id === lesson.worldId)!;
  const cards = getNotionCards(lesson.id);
  return `<article class="ma-library-reference" data-reference-lesson="${e(lesson.id)}"><button type="button" class="ma-text-link" data-library-mode="lessons">← Toutes mes leçons</button><div class="ma-page-heading"><span class="ma-eyebrow">MONDE ${world.number} · ${e(world.name.toLocaleUpperCase('fr'))} · UNITÉ ${unit.number}</span><h1 tabindex="-1">${e(lesson.title)}</h1><p>${e(lesson.description)}</p></div><div class="ma-reference-toolbar"><span>Lecture libre · votre progression est conservée.</span><button class="ma-secondary" type="button" data-lesson="${e(lesson.id)}">${lesson.kind === 'checkpoint' ? 'Faire le quiz' : 'Pratiquer cette leçon'} ${icon('arrow', 17)}</button></div>${cards.length ? `<nav class="ma-reference-sections" aria-label="Sections de la leçon"><button data-library-section="vocabulary">${icon('book', 17)} Vocabulaire <b>${cards.filter(card => card.section === 'vocabulary').length}</b></button><button data-library-section="notion">${icon('compass', 17)} Notions <b>${cards.filter(card => card.section === 'notion').length}</b></button></nav>${(['vocabulary', 'notion'] as const).map(section => `<section id="ma-reference-${section}" class="ma-reference-section"><h2>${section === 'vocabulary' ? 'Vocabulaire' : 'Notions'}</h2><div>${cards.filter(card => card.section === section).map(card => renderNotionCard(card)).join('')}</div></section>`).join('')}` : `<section class="ma-panel"><h2>Les acquis à retrouver</h2><ul>${lesson.objectives.map(objective => `<li>${e(objective)}</li>`).join('')}</ul><p>Le quiz se déroule sans pense-bête. Retrouvez les fiches dans les deux parties précédentes de cette unité.</p></section>`}</article>`;
}
