import type { Content, Lesson, Progress, Unit } from './types';
import { lessonAvailable } from './engine';
import { historyAccess } from './world-progress';
import { escapeHtml as e } from './exercise-view';
import { icon } from './art';

const trophy = `<svg width="27" height="29" viewBox="0 0 28 30" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 3h14v9a7 7 0 0 1-14 0V3Zm0 2H3v5a5 5 0 0 0 5 5M21 5h4v5a5 5 0 0 1-5 5M14 19v6M8 27h12"/><path d="m14 7 1.2 2.5 2.8.4-2 2 .5 2.8-2.5-1.3-2.5 1.3.5-2.8-2-2 2.8-.4Z" fill="currentColor" stroke="none"/></svg>`;

function landmark(unit: Unit): string {
  const marks = ['leaf', 'book', 'compass', 'path'];
  return `<span class="ma-route-landmark" aria-hidden="true"><span>${icon(marks[(unit.number - 1) % marks.length], 30)}</span><i></i><b></b></span>`;
}

function lessonNode(lesson: Lesson, index: number, unit: Unit, next: Lesson | undefined, content: Content, progress: Progress): string {
  const done = progress.completedLessons.includes(lesson.id);
  const available = lessonAvailable(lesson, progress, content);
  const current = next?.id === lesson.id;
  const state = done ? 'complete' : current ? 'current' : available ? 'available' : 'locked';
  const quiz = lesson.kind === 'checkpoint';
  const status = done ? 'Validée · à rejouer' : current ? 'Votre prochaine étape' : available ? 'Disponible' : 'Terminez l’étape précédente';
  const label = `Unité ${unit.number}, ${quiz ? 'quiz final' : `partie ${index + 1}`} : ${lesson.title}. ${status}.`;
  const glyph = quiz ? trophy : done ? icon('check', 29) : !available ? icon('lock', 25) : icon(lesson.kind === 'story' ? 'path' : 'book', 27);
  return `<li class="ma-route-stop ${state} ${quiz ? 'quiz' : ''}" style="--ma-stop-index:${index}"${current ? ' id="ma-current-step"' : ''}><button type="button" class="ma-route-node ${done ? 'done' : state}" data-lesson="${e(lesson.id)}" data-path-state="${done ? 'done' : state}" aria-label="${e(label)}"${current ? ' aria-current="step" data-path-current' : ''}${available ? '' : ' disabled'}><span class="ma-route-medallion">${glyph}${done && quiz ? '<span class="ma-route-earned-star" aria-hidden="true">✦</span>' : !available && quiz ? `<span class="ma-route-lock-badge">${icon('lock', 12)}</span>` : ''}</span><span class="ma-route-node-copy"><small>${quiz ? 'QUIZ FINAL' : `PARTIE ${index + 1}`}</small><strong>${e(lesson.title.replace(/^Quiz final\s*·\s*/u, ''))}</strong><span>${done ? 'Validée' : current ? 'À vous !' : available ? 'À découvrir' : 'Verrouillée'}</span></span></button></li>`;
}

/** A visible learning trail derived entirely from the existing progression engine. */
export function renderWorldPath(content: Content, progress: Progress, worldId = 'world-01'): string {
  const world = content.worlds.find(candidate => candidate.id === worldId);
  if (!world) return '';
  const units = content.units.filter(unit => unit.worldId === world.id && unit.implemented).sort((a, b) => a.number - b.number);
  const byId = new Map(content.lessons.map(lesson => [lesson.id, lesson]));
  const lessonsFor = (unit: Unit): Lesson[] => unit.lessonIds.map(id => byId.get(id)).filter((lesson): lesson is Lesson => !!lesson);
  const lessons = units.flatMap(lessonsFor);
  const next = lessons.find(lesson => !progress.completedLessons.includes(lesson.id) && lessonAvailable(lesson, progress, content));
  const done = lessons.filter(lesson => progress.completedLessons.includes(lesson.id)).length;
  const unitsDone = units.filter(unit => lessonsFor(unit).length > 0 && lessonsFor(unit).every(lesson => progress.completedLessons.includes(lesson.id))).length;
  const ratio = lessons.length ? Math.round(done / lessons.length * 100) : 0;
  const nextUnit = units.find(unit => unit.id === next?.unitId);
  const complete = lessons.length > 0 && done === lessons.length
    && content.units.filter(unit => unit.worldId === world.id).every(unit => unit.implemented && lessonsFor(unit).length > 0);

  const history = historyAccess(world.id, progress, content);
  const historyIndex = units.findIndex(unit => unit.number === history.midpointUnit);
  const historyStop = `<section class="ma-history-milestone ${history.unlocked ? 'unlocked' : 'locked'}" data-history-milestone="${e(world.id)}"><span>${icon(history.unlocked ? 'book' : 'lock', 26)}</span><div><span class="ma-eyebrow">PAUSE À MI-PARCOURS · HISTOIRE & CULTURES</span><h3>Une escale pour comprendre.</h3><p>${history.unlocked ? 'Votre intermède historique est disponible.' : `Validez le quiz de l’unité ${history.midpointUnit} pour ouvrir cet intermède.`}</p></div><button class="ma-secondary" data-action="open-history" data-history-world="${e(world.id)}" ${history.unlocked ? '' : 'disabled'}>${history.unlocked ? 'Découvrir l’intermède' : `${history.completed} / ${history.required} étapes`}</button></section>`;
  return `<div class="ma-unit-list ma-world-path"><section class="ma-route-progress" aria-label="Progression dans le monde ${world.number}"><div><span class="ma-route-eyebrow">VOTRE CHEMIN À ${e(world.name.toLocaleUpperCase('fr'))}</span><strong>${complete ? `Le monde ${world.number} est terminé !` : 'Chaque étape vous emmène plus loin.'}</strong></div><div class="ma-route-counts"><span><b>${unitsDone}</b> / ${units.length} unités</span><span><b>${done}</b> / ${lessons.length} étapes</span></div><div class="ma-route-meter" role="progressbar" aria-label="Étapes validées du monde ${world.number}" aria-valuemin="0" aria-valuemax="${lessons.length}" aria-valuenow="${done}" aria-valuetext="${done} étapes validées sur ${lessons.length}"><span style="width:${ratio}%"></span></div>${next ? `<div class="ma-route-location">${icon('compass', 17)}<span>Vous êtes ici : <strong>unité ${nextUnit?.number ?? ''} · ${next.kind === 'checkpoint' ? 'quiz final' : `partie ${lessonsFor(nextUnit!).findIndex(lesson => lesson.id === next.id) + 1}`}</strong></span><button type="button" data-action="find-current-step">Voir l’étape ${icon('arrow', 15)}</button></div>` : ''}</section><div class="ma-route-start" aria-hidden="true"><span>LE DÉPART</span><i></i></div>${units.map((unit, unitIndex) => {
    const unitLessons = lessonsFor(unit);
    const unitDone = unitLessons.length > 0 && unitLessons.every(lesson => progress.completedLessons.includes(lesson.id));
    const current = unit.id === next?.unitId;
    const unitAvailable = unitLessons.some(lesson => lessonAvailable(lesson, progress, content));
    const stopCount = unitLessons.length;
    const trailHeight = Math.max(1, stopCount) * 142;
    const mid = unitIndex % 2 === 0 ? 278 : 122;
    const points = unitLessons.map((_, index) => ({ x: index % 2 === 0 ? 200 : mid, y: 45 + index * 142 }));
    const curveThrough = (count: number): string => `M200 0 ${points.slice(0, count).map((point, index) => { const previous = index ? points[index - 1] : { x: 200, y: 0 }; return `C${previous.x} ${index ? previous.y + 70 : 20} ${point.x} ${index ? point.y - 70 : 20} ${point.x} ${point.y}`; }).join(' ')}`;
    const firstUnfinished = unitLessons.findIndex(lesson => !progress.completedLessons.includes(lesson.id));
    const traveledCount = firstUnfinished < 0 ? unitLessons.length : firstUnfinished;
    return `<section class="ma-route-unit ${unitDone ? 'complete' : current ? 'current' : unitAvailable ? 'available' : 'locked'} ${unitIndex % 2 ? 'bend-left' : 'bend-right'}" aria-labelledby="ma-route-${e(unit.id)}"><header class="ma-route-unit-heading"><span class="ma-route-unit-number">${unitDone ? icon('check', 19) : String(unit.number).padStart(2, '0')}</span><div><span class="ma-route-eyebrow">UNITÉ ${String(unit.number).padStart(2, '0')}${current ? ' · VOUS ÊTES ICI' : ''}</span><h3 id="ma-route-${e(unit.id)}">${e(unit.title)}</h3><p>${e(unit.description)}</p></div><span class="ma-route-unit-score" aria-label="${unitLessons.filter(lesson => progress.completedLessons.includes(lesson.id)).length} étapes validées sur ${stopCount}">${unitDone ? 'Validée' : `${unitLessons.filter(lesson => progress.completedLessons.includes(lesson.id)).length}/${stopCount}`}</span></header><div class="ma-route-trail" style="--ma-stop-count:${stopCount}"><svg class="ma-route-connector" viewBox="0 0 400 ${trailHeight}" preserveAspectRatio="none" aria-hidden="true"><path d="${curveThrough(points.length)} L200 ${trailHeight}"/>${traveledCount ? `<path class="ma-route-traveled" d="${curveThrough(traveledCount)}"/>` : ''}</svg>${landmark(unit)}<ol class="ma-route-stops" aria-label="Étapes de l’unité ${unit.number}">${unitLessons.map((lesson, index) => lessonNode(lesson, index, unit, next, content, progress)).join('')}</ol></div></section>${unitIndex === historyIndex ? historyStop : ''}`;
  }).join('')}<div class="ma-route-finish ${complete ? 'complete' : ''}"><span class="ma-route-finish-medal" aria-hidden="true">${trophy}</span><div><span class="ma-route-eyebrow">LE DÉFI DU MONDE ${world.number}</span><strong>${complete ? `${e(world.name)}, dans votre carnet !` : 'Un monde, une vraie aventure.'}</strong><p>${complete ? `Les ${units.length} unités sont validées. Vous pouvez rejouer les étapes et réviser vos acquis.` : 'Le dernier quiz relie tout ce que vous aurez appris en chemin.'}</p></div></div></div>`;
}
