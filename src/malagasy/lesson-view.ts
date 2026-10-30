import type { Content, Progress, Lesson } from './types';
import type { LearningSession } from './session';
import { escapeHtml as e, renderTask, hasAnswer } from './exercise-view';
import { icon } from './art';
import { characterArt } from './characters';
import { renderDialogue, renderReward } from './dialogue-view';
import { worldCompleted } from './engine';
import { historyAccess } from './world-progress';
import { getNotionCards, type NotionCard } from './notion-cards';
import { renderLearningVisual } from './lesson-visuals';
import type { LearningVisual } from './learning-visual-types';
import './learning.css';

const pct = (value: number): number => Math.max(0, Math.min(100, Math.round(value)));
const unitFor = (session: LearningSession, content: Content) => content.units.find(unit => unit.id === session.lesson.unitId);
const worldFor = (session: LearningSession, content: Content) => content.worlds.find(world => world.id === session.lesson.worldId);
const isQuiz = (session: LearningSession): boolean => !session.review && session.lesson.kind === 'checkpoint';
export function sessionPassed(session: LearningSession): boolean {
  return session.correct / session.exercises.length >= (session.lesson.kind === 'checkpoint' ? .8 : .6);
}
function partNumber(session: LearningSession, content: Content): number {
  const unit = unitFor(session, content);
  return Math.max(1, (unit?.lessonIds.indexOf(session.lesson.id) ?? 0) + 1);
}
function nextLessonLabel(session: LearningSession, next: Lesson, content: Content): string {
  if (next.worldId !== session.lesson.worldId) return `Cap sur ${content.worlds.find(world => world.id === next.worldId)?.name ?? 'le prochain monde'}`;
  if (next.unitId !== session.lesson.unitId) return `Cap sur l’unité ${content.units.find(unit => unit.id === next.unitId)?.number ?? ''}`;
  if (next.kind === 'checkpoint') return 'Passer au quiz final';
  return `Passer à la partie ${(content.units.find(unit => unit.id === next.unitId)?.lessonIds.indexOf(next.id) ?? 0) + 1}`;
}
function positionRail(session: LearningSession, content: Content): string {
  const unit = unitFor(session, content), part = partNumber(session, content);
  if (session.review) return '<div class="ma-position-rail"><span class="ma-position-world">↻ RÉVISION</span><strong>Les rencontres déjà faites</strong></div>';
  return `<div class="ma-position-rail"><div><span class="ma-position-world">MONDE ${worldFor(session, content)?.number ?? '—'} · ${e(worldFor(session, content)?.name.toLocaleUpperCase('fr') ?? '')}</span><strong>Unité ${unit?.number ?? '—'} <span>·</span> ${e(unit?.title ?? '')}</strong></div><div class="ma-part-trail" aria-label="Partie ${part} sur ${unit?.lessonIds.length ?? 3}">${unit?.lessonIds.map((id, i) => `<span class="${i + 1 === part ? 'current' : i + 1 < part ? 'finished' : ''}" ${i + 1 === part ? 'aria-current="step"' : ''}>${i + 1 < part ? icon('check', 12) : i === unit.lessonIds.length - 1 ? icon('star', 13) : i + 1}<small>${i === unit.lessonIds.length - 1 ? 'Quiz final' : `Partie ${i + 1}`}</small></span>`).join('') ?? ''}</div></div>`;
}
function optionalHelp(lesson: Lesson): string {
  return `<details class="ma-optional-help"><summary>${icon('book', 16)} Un coup de pouce ?</summary><div>${lesson.notes.map(note => `<article><strong>${e(note.title)}</strong><p>${e(note.body)}</p>${note.example ? `<p class="ma-help-example" lang="mg">${e(note.example)}</p>` : ''}</article>`).join('')}</div></details>`;
}
function previewVisual(visual: LearningVisual): LearningVisual {
  if (visual.kind === 'sentence') return visual.rows.length > 1 ? { ...visual, rows: visual.rows.slice(0, 1) } : visual;
  if (visual.kind === 'possession') return visual.pairs.length > 1 ? { ...visual, pairs: visual.pairs.slice(0, 1) } : visual;
  if (visual.kind === 'directions') return visual;
  return visual.items.length > 2 ? { ...visual, items: visual.items.slice(0, 2) } as LearningVisual : visual;
}
function notionCard(card: NotionCard, disclosure?: { open: boolean }, compact = false): string {
  const visual = disclosure ? previewVisual(card.visual) : card.visual;
  const expandedDiagram = visual !== card.visual ? renderLearningVisual(card.visual, { compact: true }) : '';
  const examples = `${expandedDiagram}<div class="ma-notion-examples">${card.examples.map((example, index) => `<div class="ma-notion-example" data-voice-key="notion:${e(card.id)}:${index}" data-voice-state="idle"><p lang="mg">${e(example.malagasy)}</p><span lang="fr">${e(example.french)}</span>${example.audioId ? `<div class="ma-notion-audio"><button type="button" class="ma-notion-listen" data-action="replay-notion" data-card-id="${e(card.id)}" data-example-index="${index}" aria-label="Écouter la prononciation de ${e(example.malagasy)}">${icon('sound', 16)} Écouter</button><button type="button" class="ma-notion-listen ma-notion-slow" data-action="replay-notion" data-card-id="${e(card.id)}" data-example-index="${index}" data-slow="true" aria-label="Écouter lentement ${e(example.malagasy)}">0,75×</button><span class="ma-voice-status" role="status" aria-live="polite"></span></div>` : ''}</div>`).join('')}</div>${card.memory ? `<p class="ma-notion-memory">${icon('leaf', 15)}<span>${e(card.memory)}</span></p>` : ''}`;
  return `<article class="ma-notion-card ma-notion-${card.section}" data-notion-id="${e(card.id)}" data-notion-section="${card.section}"><h2 tabindex="-1">${e(card.title)}</h2>${renderLearningVisual(visual, { compact })}<p class="ma-notion-rule">${e(card.rule)}</p>${disclosure ? `<details class="ma-notion-example-disclosure" ${disclosure.open ? 'open' : ''}><summary>${expandedDiagram ? 'Schéma complet, exemples & prononciation' : 'Exemples & prononciation'}</summary>${examples}</details>` : examples}</article>`;
}
function notionMute(muted: boolean): string {
  return `<button type="button" class="ma-notion-mute" data-action="mute" aria-label="${muted ? 'Activer les sons' : 'Couper les sons'}" aria-pressed="${muted}">${icon('sound', 16)} ${muted ? 'Son coupé' : 'Son activé'}</button>`;
}
function notionTabs(cards: NotionCard[], index: number): string {
  const section = cards[index]?.section;
  return `<div class="ma-notion-tabs" role="tablist" aria-label="Contenu de la mini-leçon">${(['vocabulary', 'notion'] as const).map(id => `<button type="button" id="ma-notion-tab-${id}" role="tab" aria-selected="${section === id}" aria-controls="ma-notion-panel" tabindex="${section === id ? '0' : '-1'}" data-action="select-notion-section" data-section="${id}">${icon(id === 'vocabulary' ? 'book' : 'compass', 16)}<span>${id === 'vocabulary' ? 'Vocabulaire' : 'Notions'}</span><b>${cards.filter(card => card.section === id).length}</b></button>`).join('')}</div>`;
}
function notionChoices(cards: NotionCard[], index: number): string {
  const section = cards[index]?.section;
  return `<nav class="ma-notion-choices" aria-label="${section === 'vocabulary' ? 'Fiches de vocabulaire' : 'Fiches de notions'}">${cards.map((card, i) => card.section === section ? `<button type="button" data-action="select-notion" data-notion-index="${i}" aria-pressed="${i === index}">${e(card.title)}</button>` : '').join('')}</nav>`;
}
function notionPage(session: LearningSession, content: Content, progress: Progress): string {
  const cards = getNotionCards(session.lesson.id), index = Math.min(session.notionIndex ?? 0, cards.length - 1);
  const card = cards[index];
  if (!card) return scenePage(session, content, progress);
  return `<div class="ma-session ma-notion-intro">${positionRail(session, content)}<div class="ma-notion-heading"><div><span class="ma-eyebrow">MINI-LEÇON</span><h1 tabindex="-1">${e(session.lesson.title)}</h1></div>${notionMute(progress.settings.muted)}</div><p class="ma-notion-invitation">Des mots à reconnaître, des repères pour construire vos phrases. Explorez dans l’ordre que vous voulez.</p>${notionTabs(cards, index)}${notionChoices(cards, index)}<div id="ma-notion-panel" role="tabpanel" aria-labelledby="ma-notion-tab-${card.section}">${notionCard(card)}</div><div class="ma-notion-browse"><span>Fiche ${index + 1} / ${cards.length}</span><button type="button" class="ma-text-link" data-action="advance-notion">${index + 1 === cards.length ? 'Passer au dialogue' : 'Fiche suivante'} ${icon('arrow', 15)}</button></div><div class="ma-notion-next"><button type="button" class="ma-icon-button" data-action="exit-lesson" aria-label="Quitter la leçon">${icon('close', 19)}</button><span>Le pense-bête reste disponible pendant le dialogue.</span><button type="button" class="ma-primary" data-action="begin-dialogue">Voir le dialogue ${icon('arrow', 18)}</button></div></div>`;
}
function notionAside(session: LearningSession, progress: Progress, compact: boolean): string {
  const cards = getNotionCards(session.lesson.id), index = Math.min(session.notionIndex ?? 0, cards.length - 1);
  if (!cards.length) return '';
  const card = cards[index], sectionCards = cards.map((item, i) => ({ item, i })).filter(({ item }) => item.section === card.section);
  return `<aside class="ma-notion-aside" aria-label="Pense-bête de la leçon"><div class="ma-notion-aside-top"><span class="ma-eyebrow">${icon('book', 16)} PENSE-BÊTE</span>${notionMute(progress.settings.muted)}</div>${notionTabs(cards, index)}<label class="ma-notion-select-label" for="ma-notion-select"><span>La fiche à garder sous les yeux</span><select id="ma-notion-select">${sectionCards.map(({ item, i }) => `<option value="${i}" ${i === index ? 'selected' : ''}>${e(item.title)}</option>`).join('')}</select></label><div id="ma-notion-panel" role="tabpanel" aria-labelledby="ma-notion-tab-${card.section}">${notionCard(card, compact ? { open: session.notionExamplesOpen ?? false } : undefined, true)}</div></aside>`;
}
function scenePage(session: LearningSession, content: Content, progress: Progress, compactNotions = false): string {
  const scenes = session.lesson.scenes ?? [], scene = scenes[session.sceneIndex];
  if (!scene) return quizIntro(session, content);
  const atEnd = session.revealedTurns >= scene.turns.length, lastScene = session.sceneIndex === scenes.length - 1;
  const aside = !session.review ? notionAside(session, progress, compactNotions) : '';
  return `<div class="ma-session ma-conversation-intro ${aside ? 'ma-with-notions' : ''}">${positionRail(session, content)}<div class="ma-notion-dialogue-layout">${aside}<div class="ma-conversation-body"><div class="ma-scene-heading"><div><span class="ma-eyebrow">RENCONTRE ${session.sceneIndex + 1} / ${scenes.length}</span><h1 tabindex="-1">${e(scene.setting)}</h1></div><span class="ma-scene-location">${icon('compass', 15)} ${e(worldFor(session, content)?.name ?? '')}</span></div><div class="ma-scene-dots" aria-label="${session.sceneIndex + 1} scènes sur ${scenes.length}">${scenes.map((_, index) => `<i class="${index <= session.sceneIndex ? 'seen' : ''}"></i>`).join('')}</div>${renderDialogue(scene.turns, { revealed: session.revealedTurns, interactive: true, sceneId: scene.id })}${atEnd && scene.takeaway ? `<div class="ma-scene-takeaway"><span lang="mg">${e(scene.takeaway.malagasy)}</span><span>${e(scene.takeaway.french)}</span></div>` : '<div class="ma-scene-takeaway placeholder" aria-hidden="true"></div>'}<div class="ma-dialogue-actions"><button class="ma-icon-button" data-action="exit-lesson" aria-label="Quitter la leçon">${icon('close', 19)}</button><span>${atEnd ? lastScene ? 'À vous de prendre la parole !' : 'Les mots prennent vie.' : 'Touchez la traduction si besoin.'}</span><button class="ma-primary" data-action="${atEnd && lastScene ? 'begin-exercises' : 'advance-dialogue'}">${atEnd ? lastScene ? 'À moi de jouer' : 'La rencontre suivante' : 'La suite'} ${icon('arrow', 19)}</button></div>${optionalHelp(session.lesson)}</div></div></div>`;
}
function quizIntro(session: LearningSession, content: Content): string {
  const unit = unitFor(session, content), objectives = unit?.objectives ?? session.lesson.objectives;
  return `<div class="ma-session ma-quiz-intro">${positionRail(session, content)}<div class="ma-quiz-poster"><span class="ma-quiz-ribbon">${icon('star', 18)} QUIZ FINAL · UNITÉ ${unit?.number ?? '—'}</span><div class="ma-quiz-buddies">${characterArt('lova', 'happy', 180)}<span class="ma-quiz-speech" lang="mg">Tonga soa !</span>${characterArt('mia', 'thinking', 180)}</div><h1 tabindex="-1">La dernière rencontre<br>de l’unité ${unit?.number ?? '—'}.</h1><p>Retrouvez tout ce que vous avez appris dans une conversation complète.</p><div class="ma-quiz-facts"><span><b>${session.exercises.length}</b> questions</span><span><b>80 %</b> pour valider</span><span>${icon('review', 17)} sans limite de temps</span></div><ul class="ma-quiz-objectives">${objectives.map(objective => `<li>${icon('check', 14)}${e(objective)}</li>`).join('')}</ul><button class="ma-primary" data-action="begin-exercises">Commencer le quiz final ${icon('arrow', 19)}</button><button class="ma-text-link" data-action="exit-lesson">Revenir plus tard</button></div></div>`;
}
function taskPage(session: LearningSession, content: Content, progress: Progress): string {
  const exercise = session.exercises[session.index], quiz = isQuiz(session);
  const ready = hasAnswer(exercise, session.draft) && (exercise.type !== 'listening' || session.audioReady === true);
  const answer = exercise.type === 'match' ? (exercise.pairs ?? []).map(pair => `${pair.left} → ${pair.right}`).join(' · ') : exercise.answers[0];
  return `<div class="ma-session ma-live-session ${session.answered ? session.wasCorrect ? 'ma-answer-success' : 'ma-answer-encouragement' : ''}">${positionRail(session, content)}<div class="ma-session-toolbar"><button class="ma-icon-button" data-action="exit-lesson" aria-label="Quitter la leçon">${icon('close')}</button><div class="ma-session-progress" role="progressbar" aria-label="${quiz ? 'Quiz final' : 'Partie en cours'}" aria-valuemin="0" aria-valuemax="${session.exercises.length}" aria-valuenow="${session.index + Number(session.answered)}"><i style="width:${pct((session.index + Number(session.answered)) / session.exercises.length * 100)}%"></i></div><span>${session.index + 1} / ${session.exercises.length}</span>${session.combo >= 2 ? `<span class="ma-combo-chip">${icon('flame', 15)} ${session.combo} d’affilée</span>` : ''}<button class="ma-icon-button ma-session-mute" data-action="mute" aria-label="${progress.settings.muted ? 'Activer les sons' : 'Couper les sons'}" title="Sons de réponse">${icon('sound', 17)}</button></div><div class="ma-exercise-location"><span>${quiz ? `QUIZ FINAL · QUESTION ${session.index + 1}` : `PARTIE ${partNumber(session, content)} · À VOUS DE PARLER`}</span><small>${e(session.lesson.title)}</small></div><form id="ma-exercise-form" aria-labelledby="ma-question"><div class="ma-task">${renderTask(exercise, session.draft, session.answered, quiz)}</div>${session.answered ? `<section class="ma-feedback ${session.wasCorrect ? 'correct' : 'incorrect'}" aria-live="polite">${renderReward(session.wasCorrect, session.combo, session.lastReward)}<div class="ma-feedback-copy"><h3>${session.wasCorrect ? session.combo >= 3 ? 'Ça roule !' : 'Tsara ! Bien joué.' : 'Presque ! On continue.'}</h3>${!session.wasCorrect ? `<p class="ma-correction"><strong>On dit :</strong> <span>${e(answer ?? '')}</span></p><p>${e(exercise.explanation)}</p>` : ''}</div></section>` : ''}<div class="ma-exercise-footer"><span>${session.answered ? session.wasCorrect ? 'La conversation avance !' : 'Ce mot reviendra, vous le retiendrez.' : quiz ? 'Tout ce chemin, c’est vous.' : 'À vous de répondre.'}</span>${session.answered ? `<button class="ma-primary" type="button" data-action="next-exercise">${session.index === session.exercises.length - 1 ? quiz ? 'Terminer l’unité' : 'Terminer cette partie' : 'Continuer'} ${icon('arrow', 18)}</button>` : `<button id="ma-submit" class="ma-primary" type="submit" ${ready ? '' : 'disabled'}>Vérifier ${icon('check', 18)}</button>`}</div></form>${!quiz ? optionalHelp(session.lesson) : ''}</div>`;
}
function donePage(session: LearningSession, progress: Progress, content: Content, next?: Lesson): string {
  const passed = sessionPassed(session), unit = unitFor(session, content), quiz = isQuiz(session), finishedUnit = quiz && passed;
  const world = content.worlds.find(item => item.id === session.lesson.worldId);
  const worldUnits = content.units.filter(item => item.worldId === session.lesson.worldId && item.implemented);
  const finalLesson = worldUnits.flatMap(item => item.lessonIds).at(-1);
  const finishedWorld = finishedUnit && session.lesson.id === finalLesson && worldCompleted(session.lesson.worldId, progress, content);
  const history = historyAccess(session.lesson.worldId, progress, content);
  const historyUnlocked = finishedUnit && unit?.number === history.midpointUnit && history.unlocked;
  const title = session.review ? 'Les mots restent avec vous.' : finishedWorld ? `Monde ${world?.number} terminé !` : finishedUnit ? `Unité ${unit?.number} terminée !` : passed ? `Partie ${partNumber(session, content)} réussie !` : quiz ? 'Un nouvel essai ?' : 'On reprend ensemble ?';
  return `<div class="ma-session ma-completion ${finishedUnit ? 'ma-unit-finale' : ''} ${finishedWorld ? 'ma-world-finale' : ''}">${positionRail(session, content)}<div class="ma-finale-characters">${characterArt('lova', passed ? 'happy' : 'encouraging', 180)}<span class="ma-finale-medal">${icon(passed ? 'star' : 'review', 40)}</span>${characterArt('mia', passed ? 'happy' : 'encouraging', 180)}${passed ? '<div class="ma-finale-confetti" aria-hidden="true">✦<span>✦</span><i>✧</i><b>✦</b></div>' : ''}</div><span class="ma-eyebrow">${session.review ? 'RENDEZ-VOUS DES RÉVISIONS' : finishedWorld ? `PASSEPORT DE ${e(world?.name.toLocaleUpperCase('fr') ?? '')} COMPLÉTÉ` : finishedUnit ? 'QUIZ FINAL RÉUSSI' : passed ? 'UNE PARTIE DE PLUS' : 'CHAQUE ESSAI VOUS FAIT AVANCER'}</span><h1 tabindex="-1">${title}</h1><p>${finishedUnit ? e(unit?.title ?? '') : session.review ? 'Vos prochaines révisions sont prêtes.' : passed ? e(session.lesson.title) : `Il faut ${quiz ? 80 : 60} % pour valider cette ${quiz ? 'unité' : 'partie'}. Vos acquis sont conservés.`}</p><div class="ma-completion-stats"><div><strong>${pct(session.correct / session.exercises.length * 100)} %</strong><span>DE RÉUSSITE</span></div><div><strong>+${progress.xp - session.xpBefore}</strong><span>XP GAGNÉS</span></div><div><strong>${session.correct}/${session.exercises.length}</strong><span>BONNES RÉPONSES</span></div></div>${finishedWorld ? `<section class="ma-world-passport"><span>${icon('compass', 24)} ${e(world?.name ?? '')}</span><h2>Un monde de rencontres accompli.</h2><p>${worldUnits.length} unités · ${worldUnits.reduce((count, item) => count + item.lessonIds.length, 0)} étapes validées · un quiz à chaque unité.</p><p>Vous avez travaillé : ${e(world?.skills.join(' · ') ?? '')}. Les révisions vous aideront à garder ces acquis.</p></section>` : ''}${finishedUnit ? `<div class="ma-unit-passport"><span>${icon('check', 20)} VALIDÉ</span><h2>Vous savez maintenant…</h2><ul>${unit?.objectives.map(objective => `<li>${icon('check', 15)}${e(objective)}</li>`).join('') ?? ''}</ul></div>` : ''}${historyUnlocked ? `<section class="ma-unit-passport ma-history-completion"><span>${icon('book', 20)} HISTOIRE & CULTURES</span><h2>L’intermède historique est débloqué.</h2><p>Une pause à mi-parcours pour découvrir les repères de ce monde.</p><button class="ma-secondary" data-action="open-history" data-history-world="${e(session.lesson.worldId)}">Découvrir l’intermède</button></section>` : ''}<div class="ma-completion-actions">${!passed && !session.review ? `<button class="ma-primary" data-lesson="${e(session.lesson.id)}">Réessayer ${quiz ? 'le quiz final' : 'cette partie'} ${icon('review', 18)}</button>` : !session.review && next ? `<button class="ma-primary" data-action="continue">${e(nextLessonLabel(session, next, content))} ${icon('arrow', 18)}</button>` : ''}<button class="ma-secondary" data-view="${session.review ? 'reviews' : 'path'}">${session.review ? 'Retour aux révisions' : 'Revoir mon parcours'}</button></div>${finishedWorld ? `<p class="ma-end-of-edition">${next ? 'Votre prochaine destination vous attend. Vos acquis restent disponibles au centre de révision.' : 'Le monde suivant reste en préparation. Retrouvez vos rencontres au centre de révision et votre chemin complété dans Mon parcours.'}</p>` : ''}</div>`;
}
export function renderLearningSession(session: LearningSession, progress: Progress, content: Content, next?: Lesson, compactNotions = false): string {
  if (session.stage === 'notion' && !session.review && !isQuiz(session)) return notionPage(session, content, progress);
  if (session.stage === 'notes') return isQuiz(session) ? quizIntro(session, content) : scenePage(session, content, progress, compactNotions);
  if (session.stage === 'done') return donePage(session, progress, content, next);
  return taskPage(session, content, progress);
}
