import { escapeHtml as e } from './exercise-view';
import type { LearningPicture, LearningVisual, WordRole } from './learning-visual-types';
import './lesson-visuals.css';

const ink = '#35584a', sand = '#edc586', coral = '#e78264', teal = '#5aab9c';
const face = (tired = false): string => `<circle cx="48" cy="29" r="17" fill="#bd7c51"/><path d="M31 27q-3-24 19-22 20 0 16 23l-7-10q-12 7-25 1Z" fill="${ink}"/>${tired ? '<path d="m39 29 5 1m10 0 5-1m-13 8h7"/>' : '<circle cx="42" cy="30" r="1.2" fill="#35584a"/><circle cx="55" cy="30" r="1.2" fill="#35584a"/><path d="M44 38q5 4 10 0"/>'}`;
const human = (mode: 'plain' | 'wave' | 'me' | 'tired' | 'child' = 'plain', shirt = teal): string => `<g stroke="${ink}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none">${face(mode === 'tired')}<path d="M33 50q15-8 30 0l5 26H28Z" fill="${shirt}"/><path d="m37 77-2 14m24-14 2 14" stroke-width="6"/>${mode === 'wave' ? '<path d="m62 53 12-14 2-16m0 9 7-4m-8 9-7-4" stroke="#bd7c51" stroke-width="5"/>' : mode === 'me' ? '<path d="m65 54 8 12-18-7" stroke="#bd7c51" stroke-width="5"/><path d="m59 53-7 5 7 4" stroke="#35584a"/>' : '<path d="m32 54-8 17m40-17 8 17" stroke="#bd7c51" stroke-width="5"/>'}</g>`;
const book = (): string => `<g stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"><path d="M16 24q17-7 32 2 15-9 32-2v47q-17-7-32 2-15-9-32-2Z" fill="#f7e6b9"/><path d="M48 27v44" fill="none"/><path d="m23 35 17 1m-17 10 17 1m16-11 16-1m-16 12 16-1" fill="none" stroke="#a5a36d"/></g>`;
const table = (): string => `<g stroke="${ink}" stroke-width="3" stroke-linejoin="round"><path d="M11 35h74v13H11Z" fill="${sand}"/><path d="M18 48v36m60-36v36" fill="none" stroke-width="7"/><path d="M18 66h60" fill="none"/></g>`;
const house = (): string => `<g stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"><path d="M20 42h57v43H20Z" fill="#f4dcb6"/><path d="m10 43 38-31 39 31Z" fill="${coral}"/><path d="M42 85V56h19v29" fill="${teal}"/><path d="M27 53h11v12H27Z" fill="#fffdf0"/><circle cx="55" cy="71" r="1"/></g>`;
const cup = (coffee = false): string => coffee
  ? `<g stroke="${ink}" stroke-width="2.5" fill="none"><path d="M23 39h45v29q-20 15-45 0Z" fill="${sand}"/><path d="M69 43h9q13 12-9 17M18 80h61M34 29q-8-8 0-16m18 16q-8-8 0-16" stroke-linecap="round"/></g>`
  : `<g stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"><path d="m28 17 7 65h30l7-65Z" fill="#e6f5ee"/><path d="m32 44 4 36h27l4-36q-8-5-17 0-10 5-18 0" fill="#83c3c0"/><path d="m39 28 3 21" stroke="#fffdf0" stroke-width="4" stroke-linecap="round"/></g>`;

/** Minute hand always points at twelve: this lesson introduces whole hours only. */
function clockFace(hour: number): string {
  if (!Number.isInteger(hour) || hour < 1 || hour > 12) throw new RangeError('A whole-hour clock needs an hour from 1 to 12.');
  const angle = (hour % 12) * Math.PI / 6;
  const x = Number((48 + Math.sin(angle) * 19).toFixed(3));
  const y = Number((48 - Math.cos(angle) * 19).toFixed(3));
  const numerals = Array.from({ length: 12 }, (_, index) => {
    const number = index + 1, position = number * Math.PI / 6;
    return `<text x="${(48 + Math.sin(position) * 27).toFixed(3)}" y="${(51 - Math.cos(position) * 27).toFixed(3)}" text-anchor="middle">${number}</text>`;
  }).join('');
  return `<circle cx="48" cy="48" r="40" fill="#f1d39a" stroke="${ink}" stroke-width="2.5"/><circle cx="48" cy="48" r="35" fill="#fffdf3" stroke="#d1c6a5"/><g fill="${ink}" font-size="8" font-family="sans-serif">${numerals}</g><line class="ma-clock-minute-hand" x1="48" y1="48" x2="48" y2="19" stroke="${ink}" stroke-width="2.5" stroke-linecap="round"/><line class="ma-clock-hour-hand" x1="48" y1="48" x2="${x}" y2="${y}" stroke="${coral}" stroke-width="4.5" stroke-linecap="round"/><circle cx="48" cy="48" r="3.5" fill="${ink}"/>`;
}

function sunScene(period: 'morning' | 'daytime' | 'evening'): string {
  const full = period === 'daytime', y = full ? 34 : 58;
  return `<circle cx="48" cy="48" r="43" fill="${full ? '#e5f0df' : '#f6e4c2'}"/><circle cx="48" cy="${y}" r="${full ? 18 : 23}" fill="${period === 'evening' ? coral : sand}"/>${full ? `<path d="M48 7v6m0 42v6M21 34h-6m66 0h-6M29 15l4 5m30 29 4 5m-38 0 4-5m30-29 4-5" stroke="${sand}" stroke-width="3" stroke-linecap="round"/>` : ''}<path d="M5 65q22-15 43 0 22-15 43 0v18H5Z" fill="#a8c591"/><path d="M8 65h80" stroke="${ink}" stroke-width="2"/>${full ? '<path d="M59 40q-3-10 7-11 8-11 17 1 12 1 6 12H60Z" fill="#fffdf3"/>' : `<path d="${period === 'morning' ? 'M77 49V26m-6 6 6-6 6 6' : 'M77 26v23m-6-6 6 6 6-6'}" fill="none" stroke="${ink}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`}`;
}

const pictures: Record<LearningPicture, { label: string; art: () => string }> = {
  greeting: { label: 'Une personne lève la main pour saluer', art: () => human('wave') },
  goodbye: { label: 'Une personne salue en repartant', art: () => `<path d="M69 13h18v71H69" fill="#e6ecda" stroke="${ink}" stroke-width="2"/><g transform="translate(-12 3) scale(.9)">${human('wave')}</g><path d="M65 65h23m-8-7 8 7-8 7" fill="none" stroke="${coral}" stroke-width="4" stroke-linecap="round"/>` },
  thanks: { label: 'Une personne remercie, la main sur le cœur', art: () => `${human('me')}<path d="M77 14c-7-9-17 2-1 13 17-11 7-22 1-13" fill="${coral}"/>` },
  please: { label: 'Une demande adressée à une autre personne', art: () => `<g transform="translate(-8 13) scale(.85)">${human('me')}</g><path d="M62 13h25v24H70l-9 7 3-10Z" fill="#f4dca7" stroke="${ink}" stroke-width="2"/><text x="74" y="31" text-anchor="middle" fill="${ink}" font-size="20" font-family="sans-serif">?</text>` },
  welcome: { label: 'Une personne accueille devant une porte ouverte', art: () => `<path d="M7 87V10h52v77" stroke="${ink}" stroke-width="3" fill="#e7edd9"/><path d="m7 10 29 9v68H7Z" fill="${sand}" stroke="${ink}" stroke-width="2"/><circle cx="28" cy="49" r="2" fill="${ink}"/><g transform="translate(30 19) scale(.72)">${human('wave')}</g>` },
  respect: { label: 'Une personne s’incline légèrement en saluant', art: () => `<g transform="rotate(14 48 70)">${human('me')}</g><path d="m77 8 3 8m3 8 7 2" stroke="${sand}" stroke-width="3"/>` },
  yes: { label: 'Une réponse affirmative, repérée par une coche', art: () => `${human()}<circle cx="77" cy="19" r="16" fill="#e1eed7"/><path d="m69 19 6 6 11-13" stroke="${ink}" stroke-width="4" fill="none" stroke-linecap="round"/>` },
  no: { label: 'Une réponse négative, repérée par une croix', art: () => `${human()}<circle cx="77" cy="19" r="16" fill="#f6dfcf"/><path d="m71 13 12 12m0-12L71 25" stroke="#a35f46" stroke-width="4" stroke-linecap="round"/>` },
  me: { label: 'La personne qui parle se désigne', art: () => human('me') },
  you: { label: 'La personne à qui l’on parle est désignée par une flèche', art: () => `<g transform="translate(15 6) scale(.9)">${human('plain', coral)}</g><path d="M4 58h40m-8-7 8 7-8 7" stroke="${ink}" stroke-width="3" fill="none" stroke-linecap="round"/>` },
  person: { label: 'Une personne dont on parle', art: () => human() },
  mother: { label: 'Un parent et son enfant, pour le mot mère', art: () => `<g transform="translate(-8 0) scale(.85)">${human('plain', coral)}</g><g transform="translate(47 42) scale(.48)">${human('child', sand)}</g><path d="m45 58 18 11" stroke="#bd7c51" stroke-width="4"/>` },
  father: { label: 'Un parent et son enfant, pour le mot père', art: () => `<g transform="translate(-8 0) scale(.85)">${human()}</g><g transform="translate(47 42) scale(.48)">${human('child', sand)}</g><path d="m45 58 18 11" stroke="#bd7c51" stroke-width="4"/>` },
  child: { label: 'Un enfant relié à un parent', art: () => `<g opacity=".45" transform="translate(-15 0) scale(.85)">${human()}</g><g transform="translate(33 29) scale(.65)">${human('child', sand)}</g><path d="m37 59 20 12" stroke="#bd7c51" stroke-width="4"/>` },
  family: { label: 'Des membres d’une famille réunis', art: () => `<g transform="translate(-12 4) scale(.75)">${human()}</g><g transform="translate(37 4) scale(.75)">${human('plain', coral)}</g><g transform="translate(24 43) scale(.5)">${human('child', sand)}</g>` },
  house: { label: 'Une maison avec porte et fenêtre', art: house },
  chair: { label: 'Une chaise', art: () => `<g stroke="${ink}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M27 14h39v40H27Z" fill="${teal}"/><path d="M22 54h51v11H22Z" fill="${sand}"/><path d="M28 65v21m39-21v21M27 33h39" fill="none"/></g>` },
  table: { label: 'Une table', art: table },
  book: { label: 'Un livre ouvert', art: book },
  rice: { label: 'Un bol de riz', art: () => `<path d="M15 52q33-51 66 0" fill="#fffbed" stroke="${ink}" stroke-width="2"/><path d="M10 51h76q-4 33-38 33T10 51Z" fill="${teal}" stroke="${ink}" stroke-width="2.5"/><path d="m32 37 4-4m10 4 4-5m9 10 4-5m-16 8 5 1m-27-3 5 1" stroke="#c9b689" stroke-width="3" stroke-linecap="round"/>` },
  water: { label: 'Un verre d’eau', art: () => cup() },
  bread: { label: 'Un pain doré', art: () => `<path d="M17 65q-13-28 13-36 32-14 49 7 16 29-9 38-31 13-53-9Z" fill="${sand}" stroke="${ink}" stroke-width="2.5"/><path d="m29 37 10 15m7-22 9 17m6-16 10 15" stroke="#b58c5b" stroke-width="4" stroke-linecap="round"/>` },
  banana: { label: 'Une banane courbée', art: () => `<path d="M27 13q-9 52 43 65l10-7Q43 65 36 19Z" fill="#efd26c" stroke="${ink}" stroke-width="2.5"/><path d="M31 20q-2 40 39 52" stroke="#d3ab4f" stroke-width="2" fill="none"/><path d="m26 12 8-4 4 9-9 3Zm43 67 8-10 7 5-9 9Z" fill="${ink}"/>` },
  coffee: { label: 'Une tasse chaude de café', art: () => cup(true) },
  hungry: { label: 'Une personne pense à un bol de riz, sa main sur le ventre', art: () => `${human('me')}<g transform="translate(55 -1) scale(.42)">${pictures.rice.art()}</g><circle cx="72" cy="42" r="3" fill="${sand}"/><path d="M40 65q7-5 14 0" stroke="#895f41" stroke-width="2" fill="none"/>` },
  need: { label: 'Une personne a besoin d’un verre d’eau placé hors de sa portée', art: () => `<g transform="translate(-15 14) scale(.75)">${human('me')}</g><g transform="translate(59 25) scale(.4)">${cup()}</g><path d="M44 61h24m-7-5 7 5-7 5" stroke="${ink}" stroke-width="2.5" stroke-dasharray="3 3" stroke-linecap="round" fill="none"/>` },
  like: { label: 'Une personne aime le café, avec un cœur dirigé vers la tasse', art: () => `<g transform="translate(-16 15) scale(.75)">${human()}</g><g transform="translate(55 40) scale(.4)">${cup(true)}</g><path d="M72 14c-7-9-18 2-1 15 18-12 7-25 1-15" fill="${coral}"/><path d="M68 34v9m-4-4 4 4 4-4" fill="none" stroke="${coral}" stroke-width="2.5"/>` },
  thirsty: { label: 'Une personne pense à un verre d’eau', art: () => `${human('me')}<g transform="translate(58 0) scale(.4)">${cup()}</g><circle cx="73" cy="41" r="3" fill="${teal}"/>` },
  market: { label: 'Un étal de marché avec des produits', art: () => `<g stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"><path d="M15 34h66v51H15Z" fill="#f3dcb3"/><path d="m10 34 9-20h56l13 20Z" fill="${coral}"/><path d="m28 14-4 20m23-20v20m17-20 6 20" stroke="#fff1d8" stroke-width="7"/><path d="M15 53h66v12H15Z" fill="${teal}"/><circle cx="30" cy="48" r="5" fill="#e9b54b"/><circle cx="43" cy="48" r="5" fill="#e78264"/><path d="m57 49 4-10 8 10Z" fill="#86b473"/></g>` },
  tired: { label: 'Une personne aux yeux fatigués', art: () => human('tired') },
  sleep: { label: 'Une personne endormie sur un oreiller', art: () => `<rect x="8" y="43" width="80" height="37" rx="10" fill="#e6eddd"/><rect x="10" y="45" width="35" height="29" rx="9" fill="#fff9e9"/><g transform="translate(-17 15) scale(.85)" stroke="${ink}" stroke-width="2" fill="none">${face(true)}</g><path d="M46 46q21-8 40 11v22H45Z" fill="${teal}"/><path d="M63 11h12L63 24h12m8 4h9l-9 10h9" stroke="${ink}" stroke-width="2" fill="none"/>` },
  drink: { label: 'Une personne porte une tasse à sa bouche', art: () => `${human()}<path d="M57 37h15v14H57Z" fill="#eaf3e7" stroke="${ink}" stroke-width="2"/><path d="m65 59 13-8-5-12" stroke="#bd7c51" stroke-width="6" fill="none" stroke-linecap="round"/>` },
  toilet: { label: 'Des toilettes', art: () => `<g stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"><rect x="20" y="14" width="31" height="36" rx="5" fill="#e5efe6"/><path d="M31 48h48q-1 22-27 25v11H33l6-18Z" fill="#fffdf2"/><path d="M48 49h32" stroke-width="6"/><path d="M27 23h7"/></g>` },
  repeat: { label: 'Une flèche revient au début pour recommencer', art: () => `<path d="M22 35a31 31 0 1 1-1 31" stroke="${teal}" stroke-width="9" fill="none" stroke-linecap="round"/><path d="m12 17 5 26 25-8" fill="none" stroke="${ink}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M39 42v21m9-27v33m9-23v13" stroke="${ink}" stroke-width="4" stroke-linecap="round"/>` },
  slow: { label: 'Un escargot avance lentement', art: () => `<path d="M13 71q21 0 27-16h28q5 13 17 12l2 10H13Z" fill="${teal}" stroke="${ink}" stroke-width="2.5"/><circle cx="43" cy="49" r="24" fill="${sand}" stroke="${ink}" stroke-width="2.5"/><path d="M49 56q-19 6-18-10 4-13 16-5 9 10-3 10" stroke="#a68152" stroke-width="3" fill="none"/><path d="m76 66-2-14m7 14 7-12" stroke="${ink}" stroke-width="2"/><circle cx="74" cy="51" r="2.5" fill="${ink}"/><circle cx="89" cy="53" r="2.5" fill="${ink}"/>` },
  understand: { label: 'Une personne a compris, repérée par une ampoule allumée', art: () => `${human()}<path d="M69 25q-15-16 1-22 22-5 17 13l-7 10v6H70Z" fill="#f1d786" stroke="${ink}" stroke-width="2"/><path d="M70 35h10m-14-18-6-1m28-1 6-2" stroke="${ink}" stroke-width="2"/>` },
  coin: { label: 'Une pièce de monnaie, sans valeur imposée', art: () => `<ellipse cx="48" cy="53" rx="30" ry="32" fill="#d6a95b" stroke="${ink}" stroke-width="2.5"/><circle cx="45" cy="48" r="29" fill="#edce83" stroke="${ink}" stroke-width="2.5"/><circle cx="45" cy="48" r="22" fill="none" stroke="#c29752" stroke-width="2"/><path d="m45 33 4 10 11 1-8 8 2 11-9-6-10 6 2-11-8-8 11-1Z" fill="#c29752"/>` },
  name: { label: 'Un badge pour le nom d’une personne', art: () => `${human()}<rect x="29" y="54" width="39" height="24" rx="4" fill="#fff9e9" stroke="${ink}" stroke-width="2"/><path d="M35 61h26m-26 8h17" stroke="${teal}" stroke-width="3"/>` },
  origin: { label: 'Une origine indiquée sur un globe', art: () => `<circle cx="47" cy="53" r="32" fill="#cce5d8" stroke="${ink}" stroke-width="2.5"/><ellipse cx="47" cy="53" rx="15" ry="32" fill="none" stroke="#6c9b86" stroke-width="2"/><path d="M15 53h64M22 34q25 13 50 0M22 73q25-12 50 0" fill="none" stroke="#6c9b86" stroke-width="2"/><path d="M67 8a14 14 0 0 0-14 14q0 11 14 24 14-13 14-24A14 14 0 0 0 67 8Z" fill="${coral}" stroke="${ink}" stroke-width="2"/><circle cx="67" cy="22" r="5" fill="#fff8e7"/>` },
  france: { label: 'Le drapeau de la France, bleu, blanc, rouge', art: () => `<path d="M18 12v75" stroke="${ink}" stroke-width="4" stroke-linecap="round"/><path d="M20 17h21v39H20Z" fill="#41679a"/><path d="M41 17h21v39H41Z" fill="#fffdf2"/><path d="M62 17h21v39H62Z" fill="#dc775e"/><path d="M20 17h63v39H20Z" stroke="${ink}" stroke-width="2" fill="none"/><path d="M10 88h17" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>` },
  work: { label: 'Une sacoche de travail', art: () => `<g stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"><path d="M35 28V16h27v12" fill="none" stroke-width="5"/><rect x="14" y="29" width="70" height="52" rx="7" fill="${sand}"/><path d="M15 41q34 23 68 0" fill="none"/><rect x="43" y="47" width="12" height="14" rx="2" fill="${teal}"/></g>` },
  number: { label: 'Trois cartes portant les nombres un, deux et trois', art: () => `<g stroke="${ink}" stroke-width="2"><rect x="7" y="26" width="29" height="44" rx="5" fill="#f1d89f"/><rect x="34" y="18" width="29" height="52" rx="5" fill="#d9e8cd"/><rect x="61" y="26" width="29" height="44" rx="5" fill="#f3cfb9"/></g><g fill="${ink}" font-size="24" font-family="sans-serif" text-anchor="middle"><text x="22" y="57">1</text><text x="49" y="54">2</text><text x="76" y="57">3</text></g>` },
  morning: { label: 'Le soleil se lève : une flèche monte au-dessus de l’horizon', art: () => sunScene('morning') },
  daytime: { label: 'Le soleil est haut dans le ciel : il fait jour', art: () => sunScene('daytime') },
  evening: { label: 'Le soleil se couche : une flèche descend vers l’horizon', art: () => sunScene('evening') },
  night: { label: 'La lune et les étoiles dans le ciel de nuit', art: () => `<circle cx="48" cy="48" r="42" fill="#405866"/><path d="M58 14a29 29 0 1 0 20 40A25 25 0 0 1 58 14Z" fill="#f6de9c"/><path d="m23 18 2 6 6 2-6 2-2 6-2-6-6-2 6-2Zm53 0 1 5 5 1-5 2-1 5-2-5-5-2 5-1Zm2 48 1 4 5 2-5 1-1 5-2-5-4-1 4-2Z" fill="#fcf1cb"/>` },
  wake: { label: 'Une personne se réveille dans son lit au lever du jour', art: () => `<circle cx="77" cy="17" r="11" fill="${sand}"/><rect x="7" y="56" width="82" height="29" rx="8" fill="#dfe9d5"/><rect x="10" y="60" width="23" height="20" rx="5" fill="#fffaf0"/><g transform="translate(7 1) scale(.8)">${human('wave')}</g><path d="M24 69h59v17H24Z" fill="${teal}" stroke="${ink}" stroke-width="2"/>` },
  clock: { label: 'Une horloge pour repérer une heure entière', art: () => clockFace(7) },
  eat: { label: 'Une personne mange avec une cuillère et un bol', art: () => `<g transform="translate(-3 -1) scale(.88)">${human()}</g><path d="m54 56 13-13-8-8" fill="none" stroke="#bd7c51" stroke-width="5" stroke-linecap="round"/><path d="m60 37-9-5" stroke="${ink}" stroke-width="2"/><ellipse cx="48" cy="30" rx="6" ry="3" transform="rotate(25 48 30)" fill="${sand}" stroke="${ink}"/><path d="M22 72h55q-3 18-27 18T22 72Z" fill="${sand}" stroke="${ink}" stroke-width="2"/>` },
  study: { label: 'Une personne étudie un livre, une ampoule évoque ce qu’elle apprend', art: () => `<g transform="translate(-10 2) scale(.85)">${human()}</g><g transform="translate(6 43) scale(.65)">${book()}</g><path d="M75 6q-15 2-8 17l5 6v7h9v-7l5-7q5-14-11-16Z" fill="#f3d382" stroke="${ink}" stroke-width="2"/><path d="M72 39h9" stroke="${ink}" stroke-width="2"/>` },
  plate: { label: 'Une assiette ronde', art: () => `<circle cx="48" cy="48" r="36" fill="#e2eee0" stroke="${ink}" stroke-width="2.5"/><circle cx="48" cy="48" r="28" fill="#fffdf2" stroke="#8fb49b" stroke-width="2"/><circle cx="48" cy="48" r="22" fill="none" stroke="#d7e2cb"/>` },
  spoon: { label: 'Une cuillère avec une partie creuse ovale et un manche', art: () => `<path d="M43 41h10v43q-5 7-10 0Z" fill="${sand}" stroke="${ink}" stroke-width="2.5"/><ellipse cx="48" cy="28" rx="16" ry="22" fill="#d5e4dd" stroke="${ink}" stroke-width="2.5"/><path d="M41 18q-8 11 0 21" fill="none" stroke="#fffdf3" stroke-width="4" stroke-linecap="round"/>` },
  glass: { label: 'Un verre transparent vide', art: () => `<path d="m27 15 7 69h29l7-69Z" fill="#ecf5ed" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/><path d="m38 27 4 39" stroke="#fffdf3" stroke-width="5" stroke-linecap="round"/><path d="M36 78h25" stroke="#b6d1c1" stroke-width="2"/>` },
  knife: { label: 'Un couteau de table avec son manche', art: () => `<g transform="rotate(28 48 48)" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"><path d="M46 10q-20 24-14 47h21V10Z" fill="#d7e5df"/><path d="M40 57h13v27q-6 7-13 0Z" fill="${sand}"/><circle cx="46" cy="67" r="1" fill="${ink}"/><circle cx="46" cy="78" r="1" fill="${ink}"/></g>` },
  read: { label: 'Une personne lit un livre ouvert devant elle', art: () => `<g transform="translate(0 -2) scale(.95)">${human()}</g><g transform="translate(-4 37) scale(1.07 .7)">${book()}</g><path d="M19 69h-5m67 0h-5" stroke="#bd7c51" stroke-width="5" stroke-linecap="round"/>` },
  write: { label: 'Une main écrit sur une feuille avec un crayon', art: () => `<rect x="16" y="15" width="53" height="69" rx="5" fill="#fffaf0" stroke="${ink}" stroke-width="2.5"/><path d="M25 32h20m-20 10h16m-16 31h30" stroke="#b5c9a9" stroke-width="2"/><path d="m40 61 26-41 9 6-26 41-11 5Z" fill="${sand}" stroke="${ink}" stroke-width="2" stroke-linejoin="round"/><path d="m38 72 4-9 6 4Z" fill="${ink}"/><path d="M87 65q-9-1-19-11l-10-8q-8-2-7 5l15 17-8 4 22 11" fill="#bd7c51" stroke="${ink}" stroke-width="2"/>` },
  wash: { label: 'Des mains sont lavées sous un robinet, au-dessus d’un lavabo', art: () => `<g stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"><path d="M19 43V18h34v16H42v-5H30v14" fill="#c6dfd4"/><path d="M34 13h22m-11-4v9" fill="none"/><path d="M10 67h77q-4 20-38 20T10 67Z" fill="#e8f0e3"/><path d="m61 44-17 9-10-1q-10 0-7 7l21 6 21-11m15-1L61 65" fill="#bd7c51"/></g><path d="m44 38-2 8m10-7-2 6m7-5-2 5" stroke="#65afad" stroke-width="3" stroke-linecap="round"/>` },
  cook: { label: 'Une marmite chauffe sur le feu, avec de la vapeur et une cuillère', art: () => `<path d="m26 84 8-11 8 9 8-14 8 14 8-9 7 11" fill="#edaa66" stroke="${ink}" stroke-width="2"/><g stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"><path d="M20 43h57v27q-28 11-57 0Z" fill="${teal}"/><path d="M20 48H9v12h11m57-12h10v12H77M16 42h65" fill="none"/><path d="m65 17-8 26" stroke-width="5" stroke-linecap="round"/><path d="M30 32q-8-8 0-15m13 14q-8-8 0-16" fill="none" stroke="#92b395" stroke-linecap="round"/></g>` },
};

function picture(name: LearningPicture, hidden = false): string {
  const item = pictures[name];
  return `<svg class="ma-learning-picture" viewBox="0 0 96 96" ${hidden ? 'aria-hidden="true"' : `role="img" aria-label="${e(item.label)}"`} focusable="false">${hidden ? '' : `<title>${e(item.label)}</title>`}${item.art()}</svg>`;
}

const roleLabels: Record<WordRole, string> = { predicate: 'Ce qu’on dit', subject: 'Qui ?', object: 'Quoi ?', marker: 'Mot-outil', place: 'Lieu', quantity: 'Combien ?', neutral: 'Repère' };
const visualLabels: Record<LearningVisual['kind'], string> = {
  pictorial: 'Les mots en images', sentence: 'La phrase, bloc par bloc', possession: 'Un mot, deux personnes de référence',
  spatial: 'Voir où se trouve la personne ou l’objet', quantity: 'Voir la quantité', questions: 'Le mot qui guide la question',
  directions: 'Les directions en images', sounds: 'Relier une lettre à un repère sonore', clock: 'L’heure entière sur le cadran',
};

/** Highlight only the differing ends of the two supplied full words. Never build a Malagasy form. */
function pairWords(mine: string, yours: string): [string, string] {
  let common = 0;
  while (common < mine.length && common < yours.length && mine[common] === yours[common]) common++;
  const marked = (value: string): string => `${e(value.slice(0, common))}<b>${e(value.slice(common))}</b>`;
  return [marked(mine), marked(yours)];
}

function spatialPicture(location: 'here' | 'inside' | 'above' | 'below', subject: LearningPicture): string {
  const label = location === 'above' ? `${pictures[subject].label} ; au-dessus de la table` : location === 'below' ? `${pictures[subject].label} ; sous la table` : location === 'inside' ? `${pictures[subject].label} ; à l’intérieur de la maison` : `${pictures[subject].label} ; ici, près de la personne qui parle`;
  let art: string;
  if (location === 'above' || location === 'below') {
    art = `<g transform="translate(24 32) scale(.85)">${table()}</g><g transform="translate(42 ${location === 'above' ? 0 : 72}) scale(.45)">${pictures[subject].art()}</g><path d="M13 37v59m-4-4 4 4 4-4m-8-51 4-4 4 4" stroke="#b2baa0" stroke-width="2" fill="none"/>`;
  } else if (location === 'inside') {
    art = `<path d="M17 49h94v67H17Z" fill="#f5e9c8" stroke="${ink}" stroke-width="2.5"/><path d="m8 49 56-39 57 39Z" fill="${coral}" stroke="${ink}" stroke-width="2.5"/><path d="M29 116V62h69v54" stroke="#c5b68f" stroke-width="2" stroke-dasharray="4 4" fill="none"/><g transform="translate(36 53) scale(.61)">${pictures[subject].art()}</g>`;
  } else {
    art = `<ellipse cx="67" cy="113" rx="51" ry="10" fill="#dce9d0"/><g transform="translate(-3 39) scale(.68)">${human('me')}</g><g transform="translate(67 39) scale(.68)">${pictures[subject].art()}</g><path d="M60 78v22m-6-6 6 6 6-6" fill="none" stroke="${coral}" stroke-width="3"/><circle cx="60" cy="105" r="4" fill="${coral}"/>`;
  }
  return `<svg class="ma-learning-spatial-picture" viewBox="0 0 130 126" role="img" aria-label="${e(label)}" focusable="false"><title>${e(label)}</title>${art}</svg>`;
}

/** Small, original diagrams. All Malagasy labels are authored data, not translated here. */
export function renderLearningVisual(visual: LearningVisual, options: { compact?: boolean } = {}): string {
  let content: string;
  switch (visual.kind) {
    case 'pictorial':
      content = `<div class="ma-visual-picture-grid">${visual.items.map(item => `<div class="ma-visual-picture-item">${picture(item.picture)}<strong lang="mg">${e(item.label)}</strong>${item.caption ? `<span lang="fr">${e(item.caption)}</span>` : ''}</div>`).join('')}</div>`;
      break;
    case 'sentence':
      content = `<div class="ma-visual-sentences">${visual.rows.map(row => `<ol class="ma-visual-sentence-row" aria-label="Ordre des mots">${row.parts.map(part => `<li class="ma-visual-word ma-visual-role-${part.role}"><strong lang="mg">${e(part.text)}</strong><span lang="fr">${e(part.caption ?? roleLabels[part.role])}</span></li>`).join('')}</ol>`).join('')}</div>`;
      break;
    case 'possession':
      content = `<div class="ma-visual-possession-grid">${visual.pairs.map(pair => {
        const [mine, yours] = pairWords(pair.mine, pair.yours);
        return `<div class="ma-visual-possession"><div class="ma-visual-possessed">${picture(pair.picture)}<span lang="fr">${e(pair.base)}</span></div><div class="ma-visual-owner-row"><div>${picture('me')}<span lang="fr">moi</span><strong lang="mg">${mine}</strong></div><div>${picture('you')}<span lang="fr">toi / vous</span><strong lang="mg">${yours}</strong></div></div></div>`;
      }).join('')}</div>`;
      break;
    case 'spatial':
      content = `<div class="ma-visual-spatial-grid">${visual.items.map(item => `<div class="ma-visual-spatial-item">${spatialPicture(item.location, item.subject)}<strong lang="mg">${e(item.label)}</strong>${item.caption ? `<span lang="fr">${e(item.caption)}</span>` : ''}</div>`).join('')}</div>`;
      break;
    case 'quantity':
      content = `<div class="ma-visual-quantity-grid">${visual.items.map(item => {
        const value = Math.max(0, Math.floor(item.value));
        let objects = '<span aria-hidden="true">∅</span>';
        if (value > 20) objects = `${picture(item.picture, true)}<b aria-hidden="true">× ${value}</b>`;
        else if (value > 10) objects = `<div class="ma-visual-ten-groups">${Array.from({ length: Math.ceil(value / 10) }, (_, index) => {
          const count = Math.min(10, value - index * 10);
          return `<span class="ma-visual-ten-group" data-count="${count}" aria-hidden="true"><span>${Array.from({ length: count }, () => picture(item.picture, true)).join('')}</span><small>${count}</small></span>`;
        }).join('')}<small class="ma-visual-ten-sum" aria-hidden="true">${value === 20 ? '10 + 10 = 20' : `10 + ${value - 10} = ${value}`}</small></div>`;
        else if (value) {
          const illustrations = Array.from({ length: value }, () => picture(item.picture, true)).join('');
          objects = value > 5 ? `<span class="ma-visual-small-count">${illustrations}</span>` : illustrations;
        }
        return `<div class="ma-visual-quantity"><div class="ma-visual-quantity-pictures" role="img" aria-label="Quantité : ${value}. Objet représenté : ${e(pictures[item.picture].label.toLowerCase())}">${objects}</div><strong lang="mg">${e(item.label)}</strong><span class="ma-visual-numeral" aria-hidden="true">${value}</span></div>`;
      }).join('')}</div>`;
      break;
    case 'questions':
      content = `<div class="ma-visual-question-grid">${visual.items.map(item => `<div class="ma-visual-question"><strong lang="mg">${e(item.word)}<span aria-hidden="true"> ?</span></strong><span class="ma-visual-answer-arrow" aria-hidden="true">↓</span>${picture(item.picture)}<span lang="fr">${e(item.answer)}</span></div>`).join('')}</div>`;
      break;
    case 'directions':
      content = `<div class="ma-visual-direction-grid">${visual.items.map(item => {
        const direction = item.direction;
        const path = direction === 'straight' ? 'M48 81V18m-11 12 11-12 11 12' : direction === 'left' ? 'M61 81V42H17m12-11L17 42l12 11' : 'M35 81V42h44M67 31l12 11-12 11';
        const label = direction === 'straight' ? 'Continuer tout droit' : direction === 'left' ? 'Tourner à gauche' : 'Tourner à droite';
        return `<div class="ma-visual-direction"><svg viewBox="0 0 96 96" role="img" aria-label="${label}" focusable="false"><title>${label}</title><path d="${path}" fill="none" stroke="${ink}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${direction === 'left' ? 61 : direction === 'right' ? 35 : 48}" cy="82" r="6" fill="${coral}"/></svg><strong lang="mg">${e(item.label)}</strong></div>`;
      }).join('')}</div>`;
      break;
    case 'sounds':
      content = `<div class="ma-visual-sound-grid">${visual.items.map(item => `<div class="ma-visual-sound"><strong class="ma-visual-letter" lang="mg">${e(item.letter)}</strong><span aria-hidden="true">→</span><b lang="fr">${e(item.sound)}</b><span class="ma-visual-sound-word" lang="mg">${e(item.word)}</span></div>`).join('')}</div>`;
      break;
    case 'clock':
      content = `<div class="ma-visual-clock-grid">${visual.items.map(item => {
        const label = `Horloge : ${item.hour} h 00${item.period ? `. ${item.period}` : ''}`;
        return `<div class="ma-visual-clock"><svg class="ma-learning-clock" viewBox="0 0 96 96" role="img" aria-label="${e(label)}" focusable="false" data-hour="${item.hour}"><title>${e(label)}</title>${clockFace(item.hour)}</svg><strong lang="mg">${e(item.label)}</strong>${item.period ? `<span lang="fr">${e(item.period)}</span>` : ''}</div>`;
      }).join('')}</div>`;
      break;
  }
  return `<figure class="ma-learning-visual ma-learning-visual-${visual.kind}${options.compact ? ' is-compact' : ''}" aria-label="${visualLabels[visual.kind]}">${content}<figcaption>${visualLabels[visual.kind]}</figcaption></figure>`;
}
