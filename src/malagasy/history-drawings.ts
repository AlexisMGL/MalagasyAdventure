import type { HistoryDrawing } from './history-books';
import { escapeHtml as e } from './exercise-view';
import { COAST_PATH, projectCoordinates } from './map';

const keys: Record<HistoryDrawing, string[]> = {
  island: ['Imerina : Hautes Terres', 'Menabe et Boeny : autres histoires régionales'],
  kingdom: ['Territoires et ressources', 'Travail et obligations', 'Légitimité et autorité'],
  hill: ['Cité royale : gouverner', 'Tombeaux : mémoire', 'Arbres et eau : pratiques'],
  succession: ['Andrianampoinimerina : jusqu’en 1810', 'Radama Ier : 1810–1828'],
  identities: ['Famille et mémoire', 'Lieux et langue', 'Parcours individuel'],
  ocean: ['Maurice : appui britannique depuis 1810', 'Madagascar : interlocuteurs et projets propres', 'Océan Indien : routes et rivalités'],
  agreement: ['Radama : appui et reconnaissance', 'Britanniques : influence et limitation de la traite', '1817 : engagements négociés'],
  freedom: ['Interdire une traite', '≠ abolir toutes les situations d’esclavage'],
  school: ['Pouvoir royal et missionnaires', 'Enseignants et collaborateurs', 'Élèves et apprentissages'],
  periods: ['1817 : alliance', '1896 : annexion française', '1942 : opérations britanniques'],
};
export function historyLegend(kind: HistoryDrawing): string { return `<div class="ma-history-visual-key">${keys[kind].map(key => `<span>${e(key)}</span>`).join('')}</div>`; }

const box = (x: number, y: number, w: number, label: string, detail: string, color = '#e6edd8') => `<rect x="${x}" y="${y}" width="${w}" height="72" rx="12" fill="${color}"/><text x="${x + w / 2}" y="${y + 30}" class="hb-svg-title">${e(label)}</text><text x="${x + w / 2}" y="${y + 53}" class="hb-svg-small">${e(detail)}</text>`;
const arrow = (x: number, y: number, endX: number, endY: number) => `<path d="M${x} ${y}L${endX} ${endY}" stroke="#b87853" stroke-width="3" marker-end="url(#hb-arrow)"/>`;
const house = (x: number, y: number) => `<path d="M${x} ${y}h100v65H${x}Z" fill="#c68b63"/><path d="m${x - 10} ${y} 60-40 60 40Z" fill="#6b4d3b"/><path d="M${x + 40} ${y + 65}v-38h20v38" fill="#f7e3ba"/>`;
const person = (x: number, y: number, color: string) => `<circle cx="${x}" cy="${y}" r="15" fill="#b58160"/><path d="M${x - 21} ${y + 47}v-17a21 21 0 0 1 42 0v17" fill="${color}"/>`;

/** Original schematic artwork. Text labels remain available to assistive technology. */
export function historyDrawing(kind: HistoryDrawing): string {
  let art: string, label: string;
  switch (kind) {
    case 'island':
      label = 'Madagascar, Imerina dans les Hautes Terres et repères du Menabe et du Boeny ; aucune frontière représentée';
      art = `<ellipse cx="290" cy="155" rx="230" ry="130" fill="#deeeea"/><g transform="translate(120 -10) scale(.43)"><path d="${COAST_PATH}" fill="#a8bd86" stroke="#486a51" stroke-width="4"/></g>${[[-18.91, 47.53, 'Imerina', 404, 169], [-20.28, 44.28, 'Menabe', 118, 222], [-15.72, 46.32, 'Boeny', 152, 84]].map(([lat, lon, name, x, y]) => { const p = projectCoordinates(Number(lat), Number(lon)), px = 120 + p[0] * .43, py = -10 + p[1] * .43; return `<circle cx="${px}" cy="${py}" r="5" fill="#a66a48"/><path d="M${px} ${py}L${x} ${Number(y) - 18}" stroke="#58754d" stroke-width="1.5"/><text x="${x}" y="${y}" class="hb-svg-title">${name}</text>`; }).join('')}<text x="390" y="260" class="hb-svg-small">Madagascar</text>`; break;
    case 'kingdom':
      label = 'Le pouvoir royal relie territoires, ressources, travail et légitimité';
      art = box(210, 115, 180, 'Pouvoir royal', 'gouverner') + box(25, 15, 170, 'Territoires', 'étendre / contrôler') + box(405, 15, 170, 'Ressources', 'produire / prélever') + box(25, 220, 170, 'Travail', 'services / contraintes') + box(405, 220, 170, 'Légitimité', 'faire reconnaître') + arrow(190, 90, 220, 115) + arrow(410, 90, 380, 115) + arrow(190, 220, 220, 189) + arrow(410, 220, 380, 189); break;
    case 'hill':
      label = 'Colline évoquant l’enclos royal, une maison, des tombeaux, des arbres et de l’eau : pouvoir, mémoire et pratiques';
      art = `<path d="M15 290Q145 95 315 115T590 285Z" fill="#adc18d"/><path d="M95 245Q180 120 405 148" stroke="#f6e7c5" stroke-width="14" fill="none"/>${house(250, 100)}<path d="M218 166v40h180v-40" stroke="#57764d" stroke-width="5" fill="none"/><path d="M410 214h65v32h-65Z" fill="#8e9381"/><path d="m405 214 38-18 37 18" fill="#675e50"/><path d="M130 206v-59m0 10-26 20h52Z" stroke="#4c6b4c" stroke-width="8" fill="#597f52"/><ellipse cx="335" cy="264" rx="48" ry="12" fill="#86b8b1"/><text x="301" y="45" class="hb-svg-title">Gouverner · se souvenir · transmettre</text><text x="151" y="128" class="hb-svg-small">arbres</text><text x="438" y="184" class="hb-svg-small">tombeaux</text><text x="334" y="297" class="hb-svg-small">eau et pratiques</text>`; break;
    case 'succession':
      label = 'Andrianampoinimerina, fin du XVIIIe siècle à 1810, puis son fils Radama Ier, de 1810 à 1828';
      art = box(20, 75, 270, 'Andrianampoinimerina', 'fin du XVIIIe siècle–1810') + box(330, 175, 245, 'Radama Ier', '1810–1828') + arrow(290, 112, 345, 170) + `<text x="430" y="120" class="hb-svg-small">son fils lui succède</text><text x="200" y="230" class="hb-svg-title">1810</text>`; break;
    case 'identities':
      label = 'Une personne peut relier plusieurs appartenances : famille, lieux, langue, parcours et mémoire';
      art = `<circle cx="230" cy="140" r="103" fill="#dee7cc"/><circle cx="360" cy="140" r="103" fill="#c9dfd7" fill-opacity=".75"/><circle cx="300" cy="205" r="85" fill="#f0d6b3" fill-opacity=".8"/>${person(298, 140, '#47664d')}<text x="188" y="94" class="hb-svg-title">Famille</text><text x="411" y="94" class="hb-svg-title">Lieux</text><text x="300" y="265" class="hb-svg-title">Parcours</text><text x="117" y="250" class="hb-svg-small">langue</text><text x="478" y="250" class="hb-svg-small">mémoire</text>`; break;
    case 'ocean':
      label = 'Madagascar en relation avec Maurice, point d’appui britannique depuis 1810, et les routes vers l’Inde';
      art = `<rect x="15" y="15" width="570" height="280" rx="25" fill="#deeeea"/><g transform="translate(35 35) scale(.32)"><path d="${COAST_PATH}" fill="#9fb87e"/></g><circle cx="347" cy="200" r="14" fill="#a7bd89"/><text x="145" y="38" class="hb-svg-title">Madagascar</text><text x="352" y="242" class="hb-svg-title">Maurice</text><text x="352" y="266" class="hb-svg-small">britannique depuis 1810</text><text x="469" y="55" class="hb-svg-title">Vers l’Inde</text>${arrow(174, 145, 328, 193)}${arrow(360, 181, 475, 80)}<text x="310" y="122" class="hb-svg-small">océan Indien</text>`; break;
    case 'agreement':
      label = 'Alliance de 1817 : Radama recherche appui et reconnaissance ; les Britanniques recherchent influence et limitation de la traite';
      art = box(15, 30, 260, 'Radama Ier', 'appui et reconnaissance') + box(325, 30, 260, 'Britanniques', 'influence et traite') + arrow(145, 106, 255, 190) + arrow(455, 106, 345, 190) + box(195, 195, 210, 'Traité de 1817', 'des engagements', '#f1dcc0'); break;
    case 'freedom':
      label = 'Interdire la traite vers l’extérieur ne signifie pas abolir toutes les situations d’esclavage';
      art = box(30, 45, 540, 'Interdiction de la traite vers l’extérieur', 'Que peut embarquer un navire ?') + `<text x="300" y="164" text-anchor="middle" font-size="46" fill="#aa6948">≠</text>` + box(30, 200, 540, 'Abolition générale de l’esclavage', 'Quel est le statut des personnes ?', '#f0dcc1'); break;
    case 'school':
      label = 'Une école évoquée avec enseignants, élèves et écrits, reliée aux projets du pouvoir et des missionnaires';
      art = `<rect x="190" y="35" width="220" height="95" rx="8" fill="#446450"/><text x="300" y="77" fill="#fbf2dc" text-anchor="middle" font-size="23">Lire · écrire · traduire</text><path d="M220 105h160" stroke="#b5c4a4" stroke-width="2"/>${person(155, 145, '#c58a61')}${person(280, 170, '#658576')}${person(390, 170, '#a3b77e')}<path d="M220 242h230v12H220Z" fill="#a57853"/><path d="m310 218 28-6 28 6v23l-28-6-28 6Z" fill="#fcf2d7" stroke="#9b8969"/><text x="118" y="257" class="hb-svg-small">enseigner</text><text x="360" y="290" class="hb-svg-small">apprendre et participer</text><text x="300" y="18" class="hb-svg-small">projets royaux et missionnaires</text>`; break;
    case 'periods':
      label = '1817 : alliance ; 1896 : annexion française ; 1942 : opérations britanniques contre Vichy. Frise non proportionnelle';
      art = `<path d="M70 115h460" stroke="#8b9f77" stroke-width="5"/>${[90, 300, 510].map(x => `<circle cx="${x}" cy="115" r="10" fill="#ad714f"/>`).join('')}<text x="90" y="80" class="hb-svg-title">1817</text><text x="300" y="80" class="hb-svg-title">1896</text><text x="510" y="80" class="hb-svg-title">1942</text><text x="90" y="160" class="hb-svg-title">Alliance</text><text x="300" y="160" class="hb-svg-title">Annexion</text><text x="510" y="160" class="hb-svg-title">Opérations</text><text x="300" y="187" class="hb-svg-small">française</text><text x="510" y="187" class="hb-svg-small">britanniques</text><text x="300" y="255" class="hb-svg-small">Trois contextes à distinguer</text>`; break;
  }
  return `<svg viewBox="0 0 600 310" class="ma-history-drawing" role="img" aria-label="${e(label)}"><title>${e(label)}</title><defs><marker id="hb-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 10 5 0 10Z" fill="#b87853"/></marker></defs>${art}</svg>`;
}
