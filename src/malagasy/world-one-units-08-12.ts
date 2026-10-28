import type { Concept, DialogueScene, DialogueTurn, Exercise, Lesson, Source, Unit, Vocabulary } from './types';
import { GROUP_04_07 } from './world-one-units-04-07';

// Original teaching scenes built from the sources below; these are fictional exchanges.
const PC = 'w1-08-peacecorps', QUESTIONS = 'w1-08-questions', DIRECTIONS = 'w1-09-directions';
const AZO = 'w1-10-azo', REPEAT = 'w1-10-repeat', SLOW = 'w1-10-slow';
const B = { name: 'skill.name', origin: 'skill.origin', hello: 'vocab.hello', thanks: 'vocab.thanks', goodbye: 'vocab.goodbye', please: 'vocab.please', negation: 'grammar.negation-tsy', yesNo: 'grammar.question-ve' };
const C = {
  who: 'w1.question-person', what: 'w1.question-thing', where: 'w1.question-place', quantity: 'w1.question-quantity',
  market: 'w1.market', sides: 'w1.left-right', directions: 'w1.follow-directions',
  rest: 'w1.rest', facilities: 'w1.facilities', want: 'w1.want', understand: 'w1.understand', repeat: 'w1.repeat', slow: 'w1.slow',
};
const units: Unit[] = [], lessons: Lesson[] = [], exercises: Exercise[] = [], concepts: Concept[] = [], vocabulary: Vocabulary[] = [];
const sources: Source[] = [
  { id: PC, title: 'Malagasy Language Lessons — questions et besoins du quotidien', author: 'Peace Corps / Madagascar', category: 'language', consulted: true,
    url: 'https://fsi-languages.yojik.eu/languages/PeaceCorps/Malagasy-Sakalava/Malagasy-peace-corps/MG_Malagasy_Language_Lessons.pdf',
    supports: 'PDF consulté : p. 5 (nom, origine, activité), p. 7–10 (prédicats et besoins), p. 11–13 (interrogatifs et demandes). Scènes et exercices français originaux ; les prix des jeux sont fictifs.',
    license: 'Document institutionnel consulté ; ni cours complet ni média redistribué. Les formules courtes sont contextualisées dans des exercices originaux.' },
  { id: QUESTIONS, title: 'Information Questions in Malagasy Dialects: Official Malagasy and Antakarana', author: 'Eric Potsdam et Maria Polinsky', date: '2014', category: 'grammar', consulted: true,
    url: 'https://www.mariapolinsky.com/wp-content/uploads/2019/09/maria_polinsky_information_questions_in_malagasy.pdf',
    supports: 'Lecture des sections sur le malgache officiel et du tableau des interrogatifs : iza, inona, aiza, firy, (h)oatrinona. Les variantes antakarana ne sont pas enseignées ici. Pas de règle universelle calquée sur le français.',
    license: 'Article universitaire consulté ; explications reformulées, pas de reproduction des tableaux ou de passages longs.' },
  { id: DIRECTIONS, title: 'Short and Practical Malagasy Lessons — Asking for help and directions', author: 'Mentors de l’atelier E2M2 2019, Madagascar', date: '2019', category: 'language', consulted: true,
    url: 'https://e2m2.org/assets/2019/2-E2M2-2019-Malagasy-Lesson.pdf',
    supports: 'Diapositive 13 consultée : aller tout droit, tourner à gauche/droite. Orthographe des impératifs recoupée au dictionnaire ; les itinéraires des scènes sont fictifs, sans consigne de navigation réelle.',
    license: 'Support de l’atelier consulté ; aucun visuel ou cours reproduit. Exercices originaux.' },
  ...[
    ['w1-09-market', 'tsena', 'Marché ; nom du lieu dans les scènes fictives.', 'https://malagasyword.org/bins/teny2/tsena'],
    ['w1-09-turn', 'mivily', 'Verbe actif et impératif mivilia, recoupés avec le support E2M2.', 'https://malagasyword.org/bins/teny2/mivily'],
    ['w1-09-go', 'mandehana', 'Impératif du verbe actif mandeha ; forme de la consigne de déplacement.', 'https://malagasyword.org/bins/teny2/mandehana'],
    [AZO, 'azo', 'Compris ; morphologie azoko / azonao. Le suffixe indique ici la personne qui comprend ; il ne faut pas analyser azoko comme un verbe actif suivi de aho.', 'https://motmalgache.org/bins/teny2/azo'],
    [REPEAT, 'avereno', 'Impératif du verbe passif averina : répéter ce qui a été dit. La chose répétée est implicite dans la formule courte.', 'https://motmalgache.org/bins/teny2/avereno'],
    [SLOW, 'moramora', 'Adverbe doucement / lentement dans une demande de répétition.', 'https://malagasyword.org/bins/teny1/moramora?w=moramora'],
  ].map(([id, word, supports, url]): Source => ({ id, title: `Dictionnaire malgache : ${word}`, author: 'Encyclopédie de Madagascar et Dictionnaire malgache', url, category: 'dictionary', consulted: true, supports,
    license: 'Entrée lexicographique consultée ; aucune définition longue ni aucun enregistrement reproduit.' })),
];
const l = (text: string, translation: string): DialogueTurn => ({ speaker: 'lova', text, translation });
const m = (text: string, translation: string): DialogueTurn => ({ speaker: 'mia', text, translation });
const scene = (setting: string, turns: DialogueTurn[], malagasy: string, french: string): Omit<DialogueScene, 'id'> => ({ setting, turns, takeaway: { malagasy, french } });
type Task = Omit<Exercise, 'id' | 'sourceIds'>;
function task(type: Exercise['type'], question: string, answers: string[], targets: string[], dialogue: DialogueTurn[], explanation: string, extra: Partial<Task> = {}): Task {
  return { type, question, answers, concepts: targets, dialogue, explanation, prompt: 'La conversation continue', difficulty: 2, ...extra };
}
const choose = (question: string, answer: string, choices: string[], targets: string[], dialogue: DialogueTurn[], explanation: string, mg = false, type: 'choice' | 'dialogue' | 'reading' = 'choice'): Task =>
  task(type, question, [answer], targets, dialogue, explanation, { choices, ...(mg ? { selectionLanguage: 'mg' as const } : {}) });
const order = (question: string, answer: string, targets: string[], dialogue: DialogueTurn[], explanation: string): Task =>
  task('order', question, [answer], targets, dialogue, explanation, { tokens: answer.split(' '), selectionLanguage: 'mg' });
const cloze = (question: string, answer: string, targets: string[], dialogue: DialogueTurn[], explanation: string): Task => task('cloze', question, [answer], targets, dialogue, explanation);
const translate = (question: string, answer: string, targets: string[], dialogue: DialogueTurn[], explanation: string): Task => task('translate', question, [answer], targets, dialogue, explanation);
const match = (question: string, pairs: [string, string][], targets: string[], dialogue: DialogueTurn[]): Task =>
  task('match', question, [], targets, dialogue, 'Reliez chaque expression à son sens dans cette scène.', { pairs: pairs.map(([left, right]) => ({ left, right })), selectionLanguage: 'mg' });
type NewConcept = { id: string; label: string; objective: string; malagasy?: string; french?: string; category?: Concept['category'] };
type Part = { title: string; description: string; introduces?: NewConcept[]; reviews: string[]; scenes: Omit<DialogueScene, 'id'>[]; tasks: Task[]; notes?: Lesson['notes']; sourceIds?: string[] };
function unit(number: number, title: string, malagasyTitle: string, description: string, objectives: string[], parts: [Part, Part, Part]): void {
  const pad = String(number).padStart(2, '0'), unitId = `unit-${pad}`;
  const ids = parts.map((_, index) => `lesson-${pad}-0${index + 1}`);
  units.push({ id: unitId, worldId: 'world-01', number, title, malagasyTitle, description, objectives, lessonIds: ids, implemented: true });
  parts.forEach((part, index) => {
    const id = ids[index];
    const reviewedSources = number >= 11
      ? part.reviews.flatMap(conceptId => GROUP_04_07.concepts.find(concept => concept.id === conceptId)?.sourceIds ?? []) : [];
    const sourceIds = [...new Set([...(part.sourceIds ?? [PC, QUESTIONS]), ...reviewedSources])];
    for (const definition of part.introduces ?? []) concepts.push({ ...definition, category: definition.category ?? 'communication', introducedIn: id, sourceIds, prerequisites: [] });
    const exerciseIds = part.tasks.map((item, taskIndex) => {
      const exerciseId = `exercise-${pad}-0${index + 1}-${String.fromCharCode(97 + taskIndex)}`;
      exercises.push({ ...item, id: exerciseId, sourceIds }); return exerciseId;
    });
    lessons.push({ id, unitId, worldId: 'world-01', title: part.title, description: part.description, kind: index === 2 ? 'checkpoint' : index === 0 ? 'learn' : 'story',
      introduces: (part.introduces ?? []).map(item => item.id), reviews: part.reviews,
      prerequisites: [index ? ids[index - 1] : `lesson-${String(number - 1).padStart(2, '0')}-03`],
      objectives: index === 2 || !part.introduces?.length ? objectives : (part.introduces ?? []).map(item => item.objective),
      exerciseIds, notes: part.notes ?? [], estimatedMinutes: index === 2 ? 10 : 7, sourceIds,
      scenes: index === 2 ? undefined : part.scenes.map((item, sceneIndex) => ({ ...item, id: `scene-${pad}-0${index + 1}-${String.fromCharCode(97 + sceneIndex)}` })),
    });
  });
}
function words(number: number, target: string, entries: [string, string, string][], sourceIds = [PC, QUESTIONS]): void {
  entries.forEach(([malagasy, french, note], index) => vocabulary.push({ id: `word.w1.${number}.${target.split('.').at(-1)}.${index + 1}`, malagasy, french, note, conceptId: target, unitId: `unit-${String(number).padStart(2, '0')}`, sourceIds }));
}

unit(8, 'Poser les bonnes questions', 'Iza? Inona? Aiza?', 'Trouver le mot qui ouvre la bonne réponse.', ['Demander qui, quoi et où', 'Demander une quantité', 'Distinguer quantité et prix'], [
  { title: 'Qui, quoi, où ?', description: 'Une rencontre, un métier, un livre à retrouver.', reviews: [B.name, 'vocab.trainee', 'w1.house', 'w1.location'],
    introduces: [
      { id: C.who, label: 'Demander qui', objective: 'Employer iza pour demander l’identité d’une personne.', malagasy: 'iza', french: 'qui' },
      { id: C.what, label: 'Demander quoi', objective: 'Reconnaître inona pour demander une information sur une chose ou une activité.', malagasy: 'inona', french: 'quoi / quel' },
      { id: C.where, label: 'Demander où', objective: 'Employer aiza pour demander un lieu.', malagasy: 'aiza', french: 'où' },
    ],
    scenes: [
      scene('Une nouvelle rencontre', [l('Iza ianao?', 'Qui es-tu ?'), m('Mia no anarako.', 'Je m’appelle Mia.')], 'Iza ianao?', 'Qui es-tu ?'),
      scene('Une activité à présenter', [m('Inona ny asanao?', 'Quel est ton travail ?'), l('Mpiofana aho.', 'Je suis stagiaire.')], 'Inona ny asanao?', 'Quel est ton travail ?'),
      scene('Le livre a disparu', [m('Aiza ny boky?', 'Où est le livre ?'), l('Eto ny boky.', 'Le livre est ici.')], 'Aiza ny boky?', 'Où est le livre ?'),
      scene('De l’eau à la maison', [m('Aiza ny rano?', 'Où est l’eau ?'), l('Ao an-trano ny rano.', 'L’eau est dans la maison.')], 'aiza → lieu', 'Une question qui attend un lieu'),
    ],
    notes: [{ title: 'Trois informations différentes', body: 'Iza demande une personne, inona une chose ou une information et aiza un lieu. Inona ny asanao? est une formule complète : asanao signifie ton/votre travail. La réponse Mpiofana aho reste un prédicat nominal.', example: 'Inona ny asanao?', translation: 'Quel est ton travail ?' }],
    tasks: [
      choose('Lova demande quelle information ?', 'L’identité de Mia', ['L’identité de Mia', 'Le prix du livre', 'Un lieu'], [C.who, B.name], [l('Iza ianao?', 'Qui es-tu ?')], 'Iza porte ici sur la personne.'),
      choose('Réponds en donnant ton prénom Mia.', 'Mia no anarako.', ['Mia no anarako.', 'Eto ny boky.', 'Misaotra.'], [C.who, B.name], [l('Iza ianao?', 'Qui es-tu ?')], 'La question demande l’identité, pas un emplacement.', true, 'dialogue'),
      cloze('Demande le travail : « ___ ny asanao? »', 'Inona', [C.what], [m('… ny asanao?', 'Quel est ton travail ?')], 'La formule utilise inona.'),
      order('Demande où se trouve le livre.', 'Aiza ny boky', [C.where, 'w1.house'], [l('Eto ny boky.', 'Le livre est ici.')], 'Aiza introduit la question sur le lieu.'),
      match('Relie les mots aux informations demandées.', [['Iza', 'Une personne'], ['Inona', 'Une chose ou une information'], ['Aiza', 'Un lieu']], [C.who, C.what, C.where], [l('Iza ianao?', 'Qui es-tu ?'), m('Inona ny asanao?', 'Quel est ton travail ?'), l('Aiza ny boky?', 'Où est le livre ?')]),
      choose('Où se trouve l’eau ?', 'Dans la maison', ['Dans la maison', 'Ici, hors de la maison', 'La scène ne le dit pas'], [C.where, 'w1.location'], [m('Aiza ny rano?', 'Où est l’eau ?'), l('Ao an-trano ny rano.', 'L’eau est dans la maison.')], 'Ao an-trano situe l’eau dans la maison.', false, 'reading'),
    ] },
  { title: 'Combien, et à quel prix ?', description: 'Une quantité n’est pas un prix.', reviews: [C.who, C.what, C.where, 'w1.have', 'w1.numbers-ten', 'w1.price'],
    introduces: [{ id: C.quantity, label: 'Demander une quantité', objective: 'Distinguer firy, nombre de personnes ou d’objets, de ohatrinona pour un prix.', malagasy: 'firy', french: 'combien (nombre)' }],
    scenes: [
      scene('Parler des enfants', [m('Manana zanaka firy ianao?', 'Combien d’enfants as-tu ?'), l('Manana zanaka roa aho.', 'J’ai deux enfants.')], 'firy', 'Combien, pour compter'),
      scene('Le prix du jeu', [m('Ohatrinona ny vidiny?', 'Quel est son prix ?'), l('Ariary folo.', 'Dix ariary.')], 'ohatrinona', 'Combien, pour un prix'),
      scene('Vérifier un nombre', [m('Roa ve?', 'Deux ?'), l('Eny, roa.', 'Oui, deux.')], 'Roa ve?', 'Vérifier plutôt que demander une nouvelle quantité'),
      scene('Un livre, un lieu', [l('Aiza ny boky?', 'Où est le livre ?'), m('Eto ny boky.', 'Le livre est ici.')], 'aiza ≠ firy', 'Lieu et quantité sont deux informations différentes'),
    ],
    notes: [{ title: 'Quantité et prix', body: 'Firy demande un nombre : Manana zanaka firy ianao? Ohatrinona demande une valeur ou un prix. Les montants du jeu sont fictifs et servent à pratiquer les nombres, pas à indiquer les prix actuels à Madagascar.' }],
    tasks: [
      choose('Combien d’enfants Lova a-t-il ?', 'Deux', ['Un', 'Deux', 'Dix'], [C.quantity, 'w1.have', 'w1.numbers-ten'], [m('Manana zanaka firy ianao?', 'Combien d’enfants as-tu ?'), l('Manana zanaka roa aho.', 'J’ai deux enfants.')], 'Roa signifie deux.', false, 'reading'),
      choose('Demande un nombre d’enfants.', 'Manana zanaka firy ianao?', ['Manana zanaka firy ianao?', 'Aiza ny boky?', 'Iza ianao?'], [C.quantity], [l('Manana zanaka roa aho.', 'J’ai deux enfants.')], 'Firy demande la quantité.', true, 'dialogue'),
      cloze('Complète : « Manana zanaka ___ ianao? »', 'firy', [C.quantity], [m('Manana zanaka … ianao?', 'Combien d’enfants as-tu ?')], 'Le mot interrogatif de quantité est firy.'),
      match('Relie chaque question à ce qu’elle cherche.', [['Firy?', 'Un nombre'], ['Ohatrinona ny vidiny?', 'Un prix'], ['Aiza ny boky?', 'Un emplacement']], [C.quantity, 'w1.price', C.where], [l('Manana zanaka firy ianao?', 'Combien d’enfants as-tu ?'), m('Ohatrinona ny vidiny?', 'Quel est son prix ?')]),
      order('Demande le nombre d’enfants.', 'Manana zanaka firy ianao', [C.quantity, 'w1.have'], [l('Manana zanaka roa aho.', 'J’ai deux enfants.')], 'Dans cette formule, firy vient après zanaka.'),
      choose('Mia cherche-t-elle un prix ?', 'Non, elle vérifie un nombre', ['Oui, elle demande le prix', 'Non, elle vérifie un nombre', 'Elle demande un prénom'], [C.quantity, B.yesNo], [m('Roa ve?', 'Deux ?'), l('Eny, roa.', 'Oui, deux.')], 'Ve transforme cette reprise en question oui/non.', false, 'reading'),
    ] },
  { title: 'Quiz final · Une question, une information', description: 'Douze échanges pour choisir la bonne question.', reviews: [C.who, C.what, C.where, C.quantity, B.name, 'w1.have', 'w1.price'], scenes: [], tasks: [
    choose('Tu veux connaître l’identité de ton interlocuteur.', 'Iza ianao?', ['Iza ianao?', 'Aiza ny boky?', 'Ohatrinona ny vidiny?'], [C.who], [m('…', 'Tu demandes qui est la personne.')], 'Iza demande une personne.', true, 'dialogue'),
    choose('Quelle information Lova donne-t-il ?', 'Son travail', ['Son travail', 'Son origine', 'Une quantité'], [C.what], [m('Inona ny asanao?', 'Quel est ton travail ?'), l('Mpiofana aho.', 'Je suis stagiaire.')], 'La question porte sur asanao, le travail.', false, 'reading'),
    order('Demande où est l’eau.', 'Aiza ny rano', [C.where], [l('Ao an-trano ny rano.', 'L’eau est dans la maison.')], 'Aiza demande un emplacement.'),
    cloze('« ___ ny asanao? » : demande le travail.', 'Inona', [C.what], [m('… ny asanao?', 'Quel est ton travail ?')], 'Inona complète cette question.'),
    match('Retrouve l’information attendue.', [['Iza', 'Personne'], ['Aiza', 'Lieu'], ['Firy', 'Nombre']], [C.who, C.where, C.quantity], [l('Iza ianao?', 'Qui es-tu ?'), m('Aiza ny boky?', 'Où est le livre ?')]),
    translate('Écris la question « Qui es-tu ? ».', 'Iza ianao', [C.who], [m('…', 'Tu demandes une identité.')], 'Iza porte ici sur ianao, ton interlocuteur.'),
    choose('Le livre est-il dans un lieu indiqué ?', 'Oui, il est ici', ['Oui, il est ici', 'Oui, il coûte dix ariary', 'Non, rien ne le situe'], [C.where], [l('Eto ny boky.', 'Le livre est ici.')], 'Eto signifie ici.', false, 'reading'),
    order('Demande combien d’enfants a la personne.', 'Manana zanaka firy ianao', [C.quantity, 'w1.have'], [m('…', 'Tu demandes une quantité.')], 'Firy demande le nombre.'),
    choose('Tu cherches le prix du jeu.', 'Ohatrinona ny vidiny?', ['Ohatrinona ny vidiny?', 'Iza ianao?', 'Aiza ny boky?'], ['w1.price', C.quantity], [l('…', 'Le vendeur attend ta question sur le prix.')], 'Ohatrinona demande le prix ; firy demande un nombre.', true),
    cloze('« Manana zanaka ___ ianao? »', 'firy', [C.quantity], [l('Manana zanaka … ianao?', 'Combien d’enfants as-tu ?')], 'Firy demande une quantité.'),
    choose('Quelle réponse donne le prénom Mia ?', 'Mia no anarako.', ['Mia no anarako.', 'Eto ny boky.', 'Ariary folo.'], [C.who, B.name], [l('Iza ianao?', 'Qui es-tu ?')], 'La question porte sur la personne.', true, 'dialogue'),
    choose('Quel mot sert à demander une chose ou une information ?', 'Inona', ['Inona', 'Iza', 'Aiza'], [C.what, C.who, C.where], [m('Inona ny asanao?', 'Quel est ton travail ?')], 'Inona porte ici sur l’activité ou le travail.', true),
  ] },
]);
words(8, C.who, [['iza', 'qui', 'Mot interrogatif pour une personne.']]);
words(8, C.what, [['inona', 'quoi / quel', 'Dans la formule Inona ny asanao? : quel est ton travail ?']]);
words(8, C.where, [['aiza', 'où', 'Demande un emplacement, déjà rencontré dans Avy aiza ianao?']]);
words(8, C.quantity, [['firy', 'combien (nombre)', 'Pour compter, à distinguer de ohatrinona pour un prix.']]);

const directionSources = [DIRECTIONS, 'w1-09-market', 'w1-09-turn', 'w1-09-go'];
unit(9, 'Trouver son chemin', 'Mandehana mahitsy.', 'Demander un lieu puis suivre une direction dans une ville fictive.', ['Demander où se trouve un lieu', 'Distinguer gauche et droite', 'Comprendre aller tout droit et tourner'], [
  { title: 'Un marché à trouver', description: 'Mia cherche le marché ; Lova situe les lieux.', sourceIds: directionSources,
    reviews: [C.where, 'w1.house', B.yesNo, B.negation], introduces: [
      { id: C.market, label: 'Repérer le marché', objective: 'Reconnaître tsena dans une demande de lieu.', malagasy: 'tsena', french: 'marché', category: 'vocabulary' },
      { id: C.sides, label: 'À gauche, à droite', objective: 'Distinguer ankavia et ankavanana dans une indication de lieu.', malagasy: 'ankavia / ankavanana', french: 'à gauche / à droite' },
    ], scenes: [
      scene('Un petit plan imaginaire', [m('Aiza ny tsena?', 'Où est le marché ?'), l('Ankavia ny tsena.', 'Le marché est à gauche.')], 'ankavia', 'À gauche'),
      scene('La maison sur le plan', [m('Aiza ny trano?', 'Où est la maison ?'), l('Ankavanana ny trano.', 'La maison est à droite.')], 'ankavanana', 'À droite'),
      scene('Mia vérifie sa lecture', [m('Ankavia ve ny tsena?', 'Le marché est-il à gauche ?'), l('Eny, ankavia ny tsena.', 'Oui, le marché est à gauche.')], 'Ankavia ve ny tsena?', 'Vérifier un emplacement'),
      scene('Un doute sur la direction', [m('Ankavanana ve ny tsena?', 'Le marché est-il à droite ?'), l('Tsia, ankavia ny tsena.', 'Non, le marché est à gauche.')], 'ankavia ≠ ankavanana', 'Deux côtés à distinguer'),
    ], notes: [{ title: 'Des directions dans un jeu', body: 'Ankavia et ankavanana situent respectivement à gauche et à droite. Ces scènes utilisent un plan fictif ; elles ne donnent pas un itinéraire réel dans Antananarivo. Le lieu peut être un prédicat : Ankavia ny tsena.', example: 'Ankavanana ny trano.', translation: 'La maison est à droite.' }], tasks: [
      choose('Que cherche Mia ?', 'Le marché', ['Le marché', 'Un prénom', 'Un prix'], [C.market, C.where], [m('Aiza ny tsena?', 'Où est le marché ?')], 'Tsena signifie marché.', false, 'reading'),
      choose('Dans cette scène, où est le marché ?', 'À gauche', ['À gauche', 'À droite', 'Dans la maison'], [C.sides], [l('Ankavia ny tsena.', 'Le marché est à gauche.')], 'Ankavia signifie à gauche.', false, 'reading'),
      match('Relie les deux côtés et le lieu.', [['Ankavia', 'À gauche'], ['Ankavanana', 'À droite'], ['Tsena', 'Marché']], [C.sides, C.market], [m('Aiza ny tsena?', 'Où est le marché ?'), l('Ankavia ny tsena.', 'Le marché est à gauche.')]),
      order('Demande où se trouve le marché.', 'Aiza ny tsena', [C.where, C.market], [l('Ankavia ny tsena.', 'Le marché est à gauche.')], 'Aiza demande le lieu.'),
      cloze('La maison est à droite : « ___ ny trano. »', 'Ankavanana', [C.sides], [m('… ny trano.', 'La maison est à droite.')], 'Ankavanana correspond à droite.'),
      choose('Corrige Mia : le marché est à gauche.', 'Tsia, ankavia ny tsena.', ['Tsia, ankavia ny tsena.', 'Eny, ankavanana ny tsena.', 'Mia no anarako.'], [C.sides, B.negation, B.yesNo], [m('Ankavanana ve ny tsena?', 'Le marché est-il à droite ?')], 'Tsia répond non ; la suite corrige le côté.', true, 'dialogue'),
    ] },
  { title: 'Tout droit, puis on tourne', description: 'Passer d’un emplacement à une consigne de déplacement.', sourceIds: directionSources,
    reviews: [C.sides, C.market, C.where], introduces: [{ id: C.directions, label: 'Suivre une direction', objective: 'Comprendre Mandehana mahitsy et Mivilia ankavia/ankavanana dans un itinéraire simple.' }],
    scenes: [
      scene('Le départ du trajet', [l('Mandehana mahitsy.', 'Va tout droit.'), m('Misaotra.', 'Merci.')], 'Mandehana mahitsy.', 'Va tout droit.'),
      scene('Le premier croisement', [l('Mivilia ankavia.', 'Tourne à gauche.'), m('Eny.', 'Oui.')], 'Mivilia ankavia.', 'Tourne à gauche.'),
      scene('Un autre trajet', [l('Mivilia ankavanana.', 'Tourne à droite.'), m('Eny.', 'Oui.')], 'Mivilia ankavanana.', 'Tourne à droite.'),
      scene('Deux étapes sur le plan', [l('Mandehana mahitsy.', 'Va tout droit.'), l('Mivilia ankavia.', 'Tourne à gauche.'), m('Misaotra.', 'Merci.')], 'mahitsy → ankavia', 'Tout droit, puis à gauche'),
    ], notes: [{ title: 'Une consigne n’est pas une description', body: 'Mandehana est l’impératif du verbe actif mandeha ; mivilia celui de mivily. Ces formes s’adressent à la personne qui se déplace. Mahitsy indique tout droit ; ankavia et ankavanana précisent le côté. Les accents de dictionnaire servent parfois à noter l’accent tonique ; ils ne sont pas exigés dans les réponses de ces modèles.' }], tasks: [
      choose('Que doit faire Mia ?', 'Aller tout droit', ['Aller tout droit', 'Tourner à gauche', 'Tourner à droite'], [C.directions], [l('Mandehana mahitsy.', 'Va tout droit.')], 'Mahitsy indique une direction droite, sans tourner.', false, 'reading'),
      choose('Lova demande de tourner de quel côté ?', 'À droite', ['À droite', 'À gauche', 'Il demande un prix'], [C.directions, C.sides], [l('Mivilia ankavanana.', 'Tourne à droite.')], 'Ankavanana signifie à droite.', false, 'reading'),
      order('Dis à Mia de tourner à gauche.', 'Mivilia ankavia', [C.directions, C.sides], [m('…', 'Mia attend la consigne : tourner à gauche.')], 'Mivilia est la consigne de tourner.'),
      cloze('Va tout droit : « Mandehana ___. »', 'mahitsy', [C.directions], [l('Mandehana …', 'Va tout droit.')], 'Mahitsy indique tout droit.'),
      match('Relie chaque consigne à son mouvement.', [['Mandehana mahitsy.', 'Aller tout droit'], ['Mivilia ankavia.', 'Tourner à gauche'], ['Mivilia ankavanana.', 'Tourner à droite']], [C.directions, C.sides], [l('Mandehana mahitsy.', 'Va tout droit.'), m('Mivilia ankavia.', 'Tourne à gauche.')]),
      choose('Dans quel ordre Mia doit-elle avancer ?', 'Tout droit, puis à gauche', ['Tout droit, puis à gauche', 'À gauche, puis à droite', 'Tout droit, puis à droite'], [C.directions, C.sides], [l('Mandehana mahitsy.', 'Va tout droit.'), l('Mivilia ankavia.', 'Tourne à gauche.')], 'Les deux consignes donnent les étapes dans cet ordre.', false, 'reading'),
    ] },
  { title: 'Quiz final · Le marché au bout du chemin', description: 'Douze défis sur le plan imaginaire.', sourceIds: directionSources,
    reviews: [C.market, C.sides, C.directions, C.where, B.please, B.thanks], scenes: [], tasks: [
      choose('Demande où se trouve le marché.', 'Aiza ny tsena?', ['Aiza ny tsena?', 'Iza ianao?', 'Ohatrinona ny vidiny?'], [C.market, C.where], [m('…', 'Tu cherches un lieu.')], 'Aiza demande l’emplacement du marché.', true, 'dialogue'),
      choose('Où Lova situe-t-il la maison ?', 'À droite', ['À droite', 'À gauche', 'À l’intérieur du marché'], [C.sides, 'w1.house'], [l('Ankavanana ny trano.', 'La maison est à droite.')], 'Ankavanana signifie à droite.', false, 'reading'),
      order('Dis de tourner à gauche.', 'Mivilia ankavia', [C.directions, C.sides], [m('…', 'L’itinéraire tourne à gauche.')], 'La consigne associe mivilia et ankavia.'),
      cloze('« Mandehana ___. » : va tout droit.', 'mahitsy', [C.directions], [l('Mandehana …', 'Va tout droit.')], 'Mahitsy décrit ici la direction tout droit.'),
      match('Trois mouvements à distinguer.', [['Mandehana mahitsy.', 'Tout droit'], ['Mivilia ankavia.', 'À gauche'], ['Mivilia ankavanana.', 'À droite']], [C.directions, C.sides], [l('Mandehana mahitsy.', 'Va tout droit.'), m('Eny.', 'Oui.')]),
      translate('Écris « Où est le marché ? ».', 'Aiza ny tsena', [C.market, C.where], [l('…', 'Tu veux connaître l’emplacement du marché.')], 'Le modèle est Aiza ny + lieu.'),
      choose('Le marché est-il à droite dans cet échange ?', 'Non, il est à gauche', ['Non, il est à gauche', 'Oui, il est à droite', 'Aucun lieu n’est indiqué'], [C.sides, B.yesNo], [m('Ankavanana ve ny tsena?', 'Le marché est-il à droite ?'), l('Tsia, ankavia ny tsena.', 'Non, le marché est à gauche.')], 'Tsia refuse la première proposition ; ankavia la corrige.', false, 'reading'),
      choose('Tu veux indiquer un virage à droite.', 'Mivilia ankavanana.', ['Mivilia ankavanana.', 'Mivilia ankavia.', 'Mandehana mahitsy.'], [C.directions, C.sides], [m('…', 'La prochaine étape est un virage à droite.')], 'Ankavanana donne le côté droit.', true, 'dialogue'),
      cloze('Le marché est à gauche : « ___ ny tsena. »', 'Ankavia', [C.sides, C.market], [l('… ny tsena.', 'Le marché est à gauche.')], 'Ankavia est un emplacement, à distinguer de l’impératif mivilia.'),
      choose('Après tout droit, quelle est la deuxième étape ?', 'Tourner à gauche', ['Tourner à gauche', 'Tourner à droite', 'Demander le prix'], [C.directions], [l('Mandehana mahitsy.', 'Va tout droit.'), l('Mivilia ankavia.', 'Tourne à gauche.')], 'La deuxième consigne porte sur le côté gauche.', false, 'reading'),
      order('Reconstruis l’indication « Le marché est à gauche ».', 'Ankavia ny tsena', [C.sides, C.market], [m('Aiza ny tsena?', 'Où est le marché ?')], 'Le lieu vient avant ny tsena dans ce modèle.'),
      choose('Lova t’a aidé à trouver le chemin. Réponds.', 'Misaotra.', ['Misaotra.', 'Iza ianao?', 'Aiza ny boky?'], [B.thanks], [l('Mandehana mahitsy.', 'Va tout droit.')], 'Misaotra remercie pour l’aide reçue.', true, 'dialogue'),
    ] },
]);
words(9, C.market, [['tsena', 'marché', 'Lieu du trajet fictif ; aucun itinéraire réel n’est fourni.']], ['w1-09-market']);
words(9, C.sides, [['ankavia', 'à gauche', 'Un côté, à distinguer de ankavanana.'], ['ankavanana', 'à droite', 'Un côté, à distinguer de ankavia.']], [DIRECTIONS]);
words(9, C.directions, [['Mandehana mahitsy.', 'Va tout droit.', 'Mandehana est un impératif actif.'], ['Mivilia ankavia.', 'Tourne à gauche.', 'Mivilia est l’impératif actif de mivily.'], ['Mivilia ankavanana.', 'Tourne à droite.', 'La même consigne avec l’autre côté.']], directionSources);

unit(10, 'Les besoins du voyage', 'Avereno, azafady.', 'Dire ce dont on a besoin et garder la conversation ouverte.', ['Exprimer fatigue et souhaits simples', 'Demander les toilettes', 'Signaler une incompréhension et demander de répéter'], [
  { title: 'Une pause dans le voyage', description: 'Mia apprend à dire qu’elle veut boire ou se reposer.', sourceIds: [PC],
    reviews: ['w1.hunger-thirst', 'w1.need', C.where, C.sides], introduces: [
      { id: C.rest, label: 'Dire sa fatigue', objective: 'Dire Reraka aho pour exprimer sa fatigue.', malagasy: 'reraka', french: 'fatigué·e', category: 'vocabulary' },
      { id: C.want, label: 'Dire ce que l’on veut faire', objective: 'Employer les formules Te hisotro rano aho et Te hatory aho pour des souhaits simples.' },
      { id: C.facilities, label: 'Trouver les toilettes', objective: 'Demander où sont les toilettes avec Aiza ny kabone?', malagasy: 'kabone', french: 'toilettes', category: 'vocabulary' },
    ], scenes: [
      scene('Un moment de fatigue', [m('Reraka aho.', 'Je suis fatiguée.'), m('Te hatory aho.', 'Je veux dormir.')], 'Reraka aho.', 'Dire que l’on est fatigué·e'),
      scene('Trouver de quoi boire', [l('Mangetaheta ve ianao?', 'As-tu soif ?'), m('Te hisotro rano aho.', 'Je veux boire de l’eau.')], 'Te hisotro rano aho.', 'Je veux boire de l’eau.'),
      scene('Une demande simple', [m('Mila rano aho, azafady.', 'J’ai besoin d’eau, s’il vous plaît.'), l('Eny.', 'Oui.')], 'Mila rano aho, azafady.', 'Exprimer le besoin avec politesse'),
      scene('Un service à trouver', [m('Aiza ny kabone?', 'Où sont les toilettes ?'), l('Ankavanana ny kabone.', 'Les toilettes sont à droite.')], 'Aiza ny kabone?', 'Où sont les toilettes ?'),
    ], notes: [{ title: 'Une phrase complète pour un souhait', body: 'Dans Te hisotro rano aho et Te hatory aho, te exprime le souhait. Il est suivi de la forme en h- du verbe de ces modèles. On apprend ces deux constructions précises ; on ne transforme pas n’importe quel mot en ajoutant h. Aho reste la personne qui veut boire ou dormir.' }], tasks: [
      choose('Comment se sent Mia ?', 'Elle est fatiguée', ['Elle est fatiguée', 'Elle dit avoir faim', 'Elle présente son travail'], [C.rest], [m('Reraka aho.', 'Je suis fatiguée.')], 'Reraka exprime la fatigue.', false, 'reading'),
      choose('Mia veut boire de l’eau. Choisis sa réplique.', 'Te hisotro rano aho.', ['Te hisotro rano aho.', 'Te hatory aho.', 'Mia no anarako.'], [C.want, 'w1.food'], [l('Mangetaheta ve ianao?', 'As-tu soif ?')], 'Hisotro rano est l’action de boire de l’eau dans cette formule.', true, 'dialogue'),
      order('Dis que tu veux dormir.', 'Te hatory aho', [C.want, C.rest], [l('Reraka ve ianao?', 'Es-tu fatigué·e ?')], 'Te hatory aho exprime le souhait de dormir.'),
      cloze('Demande les toilettes : « Aiza ny ___? »', 'kabone', [C.facilities, C.where], [m('Aiza ny …?', 'Où sont les toilettes ?')], 'Kabone désigne les toilettes.'),
      match('Relie chaque besoin à sa phrase.', [['Reraka aho.', 'Je suis fatigué·e.'], ['Te hisotro rano aho.', 'Je veux boire de l’eau.'], ['Te hatory aho.', 'Je veux dormir.']], [C.rest, C.want], [m('Reraka aho.', 'Je suis fatiguée.'), l('Te hatory aho.', 'Je veux dormir.')]),
      choose('Où Mia doit-elle chercher les toilettes ?', 'À droite', ['À droite', 'À gauche', 'Le lieu n’est pas indiqué'], [C.facilities, C.sides], [m('Aiza ny kabone?', 'Où sont les toilettes ?'), l('Ankavanana ny kabone.', 'Les toilettes sont à droite.')], 'Ankavanana donne le côté droit.', false, 'reading'),
    ] },
  { title: 'On peut demander de répéter', description: 'Mia ne comprend pas tout du premier coup, et le dit.', sourceIds: [PC, AZO, REPEAT, SLOW],
    reviews: [C.directions, B.please, B.negation], introduces: [
      { id: C.understand, label: 'Dire si l’on comprend', objective: 'Distinguer Azoko et Tsy azoko dans une conversation.', malagasy: 'Azoko. / Tsy azoko.', french: 'J’ai compris. / Je ne comprends pas.' },
      { id: C.repeat, label: 'Demander de répéter', objective: 'Employer Avereno, azafady pour demander une répétition.', malagasy: 'Avereno, azafady.', french: 'Répétez, s’il vous plaît.' },
      { id: C.slow, label: 'Demander de ralentir', objective: 'Ajouter moramora à une demande de répétition.', malagasy: 'moramora', french: 'lentement / doucement' },
    ], scenes: [
      scene('Une direction trop rapide', [l('Mivilia ankavia.', 'Tourne à gauche.'), m('Tsy azoko.', 'Je ne comprends pas.')], 'Tsy azoko.', 'Signaler ce qui n’est pas compris'),
      scene('Mia demande une seconde chance', [m('Avereno, azafady.', 'Répétez, s’il vous plaît.'), l('Mivilia ankavia.', 'Tourne à gauche.')], 'Avereno, azafady.', 'Répétez, s’il vous plaît.'),
      scene('Prendre le temps de comprendre', [m('Avereno moramora, azafady.', 'Répétez lentement, s’il vous plaît.'), l('Mandehana mahitsy.', 'Va tout droit.')], 'moramora', 'Lentement, doucement'),
      scene('La conversation peut continuer', [l('Azonao ve?', 'As-tu compris ?'), m('Eny, azoko.', 'Oui, j’ai compris.')], 'Azonao ve? → Azoko.', 'Vérifier la compréhension et répondre'),
    ], notes: [{ title: 'Des formules qui changent la perspective', body: 'Azoko et azonao viennent de azo, « compris » dans ce contexte : -ko indique la personne qui comprend (moi), -nao l’interlocuteur. Avereno est l’impératif d’averina, une forme passive : c’est ce qui a été dit qui doit être répété. Ces formules ne suivent pas le modèle d’un verbe actif + aho. Moramora précise doucement ou lentement.' }], tasks: [
      choose('Mia a-t-elle compris la direction ?', 'Non', ['Non', 'Oui', 'Elle parle de son origine'], [C.understand, B.negation], [l('Mivilia ankavia.', 'Tourne à gauche.'), m('Tsy azoko.', 'Je ne comprends pas.')], 'Tsy nie azoko : Mia signale une incompréhension.', false, 'reading'),
      choose('Demande à Lova de répéter.', 'Avereno, azafady.', ['Avereno, azafady.', 'Veloma.', 'Te hatory aho.'], [C.repeat, B.please], [l('Mivilia ankavia.', 'Tourne à gauche.')], 'Avereno demande une répétition.', true, 'dialogue'),
      cloze('Répétez lentement : « Avereno ___, azafady. »', 'moramora', [C.slow, C.repeat], [m('Avereno …, azafady.', 'Répétez lentement, s’il vous plaît.')], 'Moramora ajoute la manière lente ou douce.'),
      order('Dis que tu ne comprends pas.', 'Tsy azoko', [C.understand, B.negation], [l('Azonao ve?', 'As-tu compris ?')], 'Tsy précède la forme azoko.'),
      match('Trois façons de faire avancer l’échange.', [['Tsy azoko.', 'Je ne comprends pas.'], ['Avereno, azafady.', 'Répétez, s’il vous plaît.'], ['Eny, azoko.', 'Oui, j’ai compris.']], [C.understand, C.repeat], [l('Azonao ve?', 'As-tu compris ?'), m('Eny, azoko.', 'Oui, j’ai compris.')]),
      choose('Après la répétition, Mia a compris. Réponds.', 'Eny, azoko.', ['Eny, azoko.', 'Tsy azoko.', 'Aiza ny kabone?'], [C.understand], [l('Azonao ve?', 'As-tu compris ?')], 'Azoko exprime la compréhension dans ce contexte.', true, 'dialogue'),
    ] },
  { title: 'Quiz final · Savoir se faire comprendre', description: 'Douze situations pour dire un besoin et clarifier un échange.', sourceIds: [PC, AZO, REPEAT, SLOW],
    reviews: [C.rest, C.want, C.facilities, C.understand, C.repeat, C.slow, C.where, 'w1.need', B.negation], scenes: [], tasks: [
      choose('Tu es fatigué·e. Choisis la phrase adaptée.', 'Reraka aho.', ['Reraka aho.', 'Salama aho.', 'Mpiofana aho.'], [C.rest], [m('…', 'Tu exprimes ta fatigue.')], 'Reraka porte sur la fatigue.', true, 'dialogue'),
      choose('Que veut faire Mia ?', 'Dormir', ['Dormir', 'Boire', 'Demander un prix'], [C.want, C.rest], [m('Te hatory aho.', 'Je veux dormir.')], 'Hatory se rapporte ici au fait de dormir.', false, 'reading'),
      order('Tu veux boire de l’eau.', 'Te hisotro rano aho', [C.want, 'w1.food'], [l('Mangetaheta ve ianao?', 'As-tu soif ?')], 'Le souhait se formule avec te puis hisotro rano.'),
      cloze('« Aiza ny ___? » : où sont les toilettes ?', 'kabone', [C.facilities, C.where], [m('Aiza ny …?', 'Où sont les toilettes ?')], 'Kabone complète la question.'),
      match('Retrouve chaque intention.', [['Reraka aho.', 'Dire sa fatigue'], ['Aiza ny kabone?', 'Chercher les toilettes'], ['Tsy azoko.', 'Signaler une incompréhension']], [C.rest, C.facilities, C.understand], [m('Reraka aho.', 'Je suis fatiguée.'), l('Azonao ve?', 'As-tu compris ?')]),
      translate('Écris « Je ne comprends pas ».', 'Tsy azoko', [C.understand, B.negation], [l('Azonao ve?', 'As-tu compris ?')], 'Tsy azoko est la formule négative.'),
      choose('Tu demandes une répétition, sans mettre fin à l’échange.', 'Avereno, azafady.', ['Avereno, azafady.', 'Veloma.', 'Misaotra.'], [C.repeat, B.please], [l('Mivilia ankavanana.', 'Tourne à droite.')], 'Avereno demande de redire la phrase.', true, 'dialogue'),
      cloze('« Avereno ___, azafady. » : ajoute « lentement ».', 'moramora', [C.slow, C.repeat], [m('Avereno …, azafady.', 'Répétez lentement, s’il vous plaît.')], 'Moramora précise la manière.'),
      choose('Mia a-t-elle finalement compris ?', 'Oui', ['Oui', 'Non', 'Elle ne répond pas'], [C.understand], [l('Azonao ve?', 'As-tu compris ?'), m('Eny, azoko.', 'Oui, j’ai compris.')], 'Eny, azoko confirme la compréhension.', false, 'reading'),
      order('Demande de répéter lentement avec politesse.', 'Avereno moramora azafady', [C.repeat, C.slow, B.please], [m('Tsy azoko.', 'Je ne comprends pas.')], 'Avereno demande la répétition, moramora la lenteur.'),
      choose('Demande de l’eau avec politesse.', 'Mila rano aho, azafady.', ['Mila rano aho, azafady.', 'Te hatory aho.', 'Aiza ny trano?'], ['w1.need', B.please], [l('Mangetaheta ve ianao?', 'As-tu soif ?')], 'Mila exprime le besoin ; azafady rend la demande polie.', true, 'dialogue'),
      choose('Quelle réponse situe les toilettes ?', 'Ankavanana ny kabone.', ['Ankavanana ny kabone.', 'Reraka aho.', 'Eny, azoko.'], [C.facilities, C.where, C.sides], [m('Aiza ny kabone?', 'Où sont les toilettes ?')], 'Ankavanana donne un lieu, à droite.', true),
    ] },
]);
words(10, C.rest, [['Reraka aho.', 'Je suis fatigué·e.', 'Un prédicat de fatigue suivi de aho.']], [PC]);
words(10, C.want, [['Te hisotro rano aho.', 'Je veux boire de l’eau.', 'Formule te + forme en h- du verbe dans ce modèle.'], ['Te hatory aho.', 'Je veux dormir.', 'Souhait appris comme construction complète.']], [PC]);
words(10, C.facilities, [['kabone', 'toilettes', 'Aiza ny kabone? : où sont les toilettes ?']], [PC]);
words(10, C.understand, [['Tsy azoko.', 'Je ne comprends pas.', 'Azo, compris ; -ko indique la personne qui comprend.'], ['Azonao ve?', 'As-tu compris ?', '-nao désigne ici l’interlocuteur.']], [AZO]);
words(10, C.repeat, [['Avereno, azafady.', 'Répétez, s’il vous plaît.', 'Impératif d’une forme passive ; ce qui est à répéter est implicite.']], [REPEAT]);
words(10, C.slow, [['moramora', 'lentement / doucement', 'Dans Avereno moramora, azafady.']], [SLOW]);

unit(11, 'Les premières conversations', 'Salama! Avy aiza ianao?', 'Enchaîner les questions sans perdre le fil de la rencontre.', ['Se présenter dans un échange suivi', 'Parler simplement de sa famille', 'Combiner besoin, demande et prix'], [
  { title: 'Une rencontre qui dure', description: 'Les questions se suivent : prénom, origine et famille.', reviews: [B.hello, B.name, B.origin, C.quantity, 'w1.family', 'w1.have'], scenes: [
      scene('On se retrouve dans le quartier', [l('Salama!', 'Bonjour !'), m('Salama!', 'Bonjour !')], 'Salama!', 'Ouvrir un échange'),
      scene('Le prénom avant la suite', [l('Iza no anaranao?', 'Comment t’appelles-tu ?'), m('Mia no anarako.', 'Je m’appelle Mia.')], 'Mia no anarako.', 'Répondre à la question posée'),
      scene('L’origine de Mia', [l('Avy aiza ianao?', 'D’où viens-tu ?'), m('Avy any Frantsa aho.', 'Je viens de France.')], 'Avy any Frantsa aho.', 'Ajouter une information sur soi'),
      scene('Mia s’intéresse aussi à Lova', [m('Manana zanaka firy ianao?', 'Combien d’enfants as-tu ?'), l('Manana zanaka roa aho.', 'J’ai deux enfants.')], 'Manana zanaka roa aho.', 'La famille entre dans la conversation'),
    ], notes: [{ title: 'Écouter la question avant de répondre', body: 'Un même échange peut passer du prénom à l’origine puis à la famille. Réponds à l’information demandée : le nom après Iza no anaranao?, un lieu après Avy aiza ianao?, un nombre après firy. Les expressions ont déjà été introduites ; cette partie les fait travailler ensemble.' }], tasks: [
      choose('Mia se présente. Quelle information donne-t-elle ?', 'Son prénom', ['Son prénom', 'Son métier', 'Le nombre de ses enfants'], [B.name], [m('Mia no anarako.', 'Je m’appelle Mia.')], 'No anarako introduit le nom dans cette formule.', false, 'reading'),
      choose('Poursuis en demandant l’origine de Mia.', 'Avy aiza ianao?', ['Avy aiza ianao?', 'Ohatrinona ny vidiny?', 'Aiza ny boky?'], [B.origin, C.where], [m('Mia no anarako.', 'Je m’appelle Mia.')], 'Avy aiza demande d’où vient la personne.', true, 'dialogue'),
      order('Tu viens de France. Réponds à Lova.', 'Avy any Frantsa aho', [B.origin], [l('Avy aiza ianao?', 'D’où viens-tu ?')], 'Avy any + lieu + aho forme la réponse apprise.'),
      cloze('« Manana zanaka ___ ianao? » demande un nombre.', 'firy', [C.quantity, 'w1.have'], [m('Manana zanaka … ianao?', 'Combien d’enfants as-tu ?')], 'Firy demande le nombre d’enfants.'),
      match('Relie chaque réponse à son information.', [['Mia no anarako.', 'Le prénom'], ['Avy any Frantsa aho.', 'L’origine'], ['Manana zanaka roa aho.', 'La famille et un nombre']], [B.name, B.origin, C.quantity, 'w1.family'], [l('Iza no anaranao?', 'Comment t’appelles-tu ?'), m('Mia no anarako.', 'Je m’appelle Mia.')]),
      choose('Qui a deux enfants dans l’échange ?', 'Lova', ['Lova', 'Mia', 'Les deux personnes'], [C.quantity, 'w1.have', 'w1.numbers-ten'], [m('Manana zanaka firy ianao?', 'Combien d’enfants as-tu ?'), l('Manana zanaka roa aho.', 'J’ai deux enfants.')], 'C’est Lova qui répond Manana zanaka roa aho.', false, 'reading'),
    ] },
  { title: 'Du besoin à la demande', description: 'La conversation continue autour d’un repas et d’un prix de jeu.', reviews: ['w1.hunger-thirst', 'w1.need', 'w1.food', 'w1.price', B.thanks, B.goodbye], scenes: [
      scene('Une soif à exprimer', [m('Mangetaheta aho.', 'J’ai soif.'), l('Mila rano ve ianao?', 'As-tu besoin d’eau ?')], 'Mila rano ve ianao?', 'Vérifier le besoin'),
      scene('Une réponse précise', [m('Eny, mila rano aho.', 'Oui, j’ai besoin d’eau.'), l('Eny.', 'Oui.')], 'Eny, mila rano aho.', 'Confirmer et nommer ce qui est nécessaire'),
      scene('Le montant indiqué sur la carte du jeu', [m('Ohatrinona ny vidiny?', 'Quel est son prix ?'), l('Ariary folo.', 'Dix ariary.')], 'Ariary folo.', 'Un prix fictif pour pratiquer les nombres'),
      scene('Remercier puis repartir', [m('Misaotra.', 'Merci.'), l('Veloma.', 'Au revoir.'), m('Veloma.', 'Au revoir.')], 'Misaotra. Veloma.', 'Fermer l’échange avec politesse'),
    ], tasks: [
      choose('Mia a soif. Quel besoin confirme-t-elle ?', 'De l’eau', ['De l’eau', 'Un livre', 'Une maison'], ['w1.hunger-thirst', 'w1.need', 'w1.food'], [m('Mangetaheta aho.', 'J’ai soif.'), l('Mila rano ve ianao?', 'As-tu besoin d’eau ?')], 'Rano est l’eau ; le besoin répond à la soif.', false, 'reading'),
      choose('Confirme que tu as besoin d’eau.', 'Eny, mila rano aho.', ['Eny, mila rano aho.', 'Tsy mila rano aho.', 'Te hatory aho.'], ['w1.need', B.yesNo], [l('Mila rano ve ianao?', 'As-tu besoin d’eau ?')], 'Eny confirme, puis mila rano aho précise le besoin.', true, 'dialogue'),
      cloze('Demande le prix : « Ohatrinona ny ___? »', 'vidiny', ['w1.price'], [m('Ohatrinona ny …?', 'Quel est son prix ?')], 'Vidiny désigne ici son prix.'),
      choose('Le prix de la carte du jeu vaut combien ?', '10 ariary', ['2 ariary', '10 ariary', '20 ariary'], ['w1.price', 'w1.numbers-ten'], [m('Ohatrinona ny vidiny?', 'Quel est son prix ?'), l('Ariary folo.', 'Dix ariary.')], 'Folo signifie dix. Ce montant est fictif.', false, 'reading'),
      order('Exprime le besoin d’eau.', 'Mila rano aho', ['w1.need', 'w1.food'], [l('Mila rano ve ianao?', 'As-tu besoin d’eau ?')], 'Le modèle appris place mila puis rano avant aho.'),
      choose('Tu as reçu l’aide de Lova. Remercie-le.', 'Misaotra.', ['Misaotra.', 'Iza ianao?', 'Tsy azoko.'], [B.thanks], [l('Ariary folo.', 'Dix ariary.')], 'Misaotra remercie avant de prendre congé.', true, 'dialogue'),
    ] },
  { title: 'Quiz final · Garder le fil', description: 'Douze choix pour mener une rencontre jusqu’au bout.', reviews: [B.hello, B.name, B.origin, C.quantity, 'w1.family', 'w1.need', 'w1.food', 'w1.price', B.thanks, B.goodbye], scenes: [], tasks: [
      choose('Ouvre la rencontre avec Lova.', 'Salama!', ['Salama!', 'Veloma!', 'Avereno, azafady.'], [B.hello], [m('…', 'Tu arrives devant Lova.')], 'Salama commence la rencontre.', true, 'dialogue'),
      order('Tu t’appelles Mia. Réponds.', 'Mia no anarako', [B.name], [l('Iza no anaranao?', 'Comment t’appelles-tu ?')], 'La réponse place le prénom avant no anarako.'),
      choose('D’où Mia vient-elle ?', 'De France', ['De France', 'Du marché', 'Son origine n’est pas donnée'], [B.origin], [m('Avy any Frantsa aho.', 'Je viens de France.')], 'Frantsa désigne la France.', false, 'reading'),
      cloze('Complète la question sur le nombre : « Manana zanaka ___ ianao? »', 'firy', [C.quantity, 'w1.have'], [l('Manana zanaka … ianao?', 'Combien d’enfants as-tu ?')], 'Firy demande une quantité.'),
      match('Relie la formule à son rôle.', [['Mia no anarako.', 'Donner son prénom'], ['Avy any Frantsa aho.', 'Donner son origine'], ['Mila rano aho.', 'Exprimer un besoin']], [B.name, B.origin, 'w1.need'], [l('Iza no anaranao?', 'Comment t’appelles-tu ?'), m('Mia no anarako.', 'Je m’appelle Mia.')]),
      translate('Écris « D’où viens-tu ? ».', 'Avy aiza ianao', [B.origin], [m('…', 'Tu veux connaître l’origine de Lova.')], 'Avy aiza demande l’origine.'),
      choose('Combien d’enfants Lova annonce-t-il ?', 'Deux', ['Un', 'Deux', 'Dix'], [C.quantity, 'w1.family', 'w1.numbers-ten'], [l('Manana zanaka roa aho.', 'J’ai deux enfants.')], 'Roa signifie deux.', false, 'reading'),
      choose('Tu as soif et tu demandes de l’eau.', 'Mila rano aho, azafady.', ['Mila rano aho, azafady.', 'Te hatory aho.', 'Mia no anarako.'], ['w1.need', 'w1.food', B.please], [l('Mila rano ve ianao?', 'As-tu besoin d’eau ?')], 'Mila rano exprime le besoin d’eau.', true, 'dialogue'),
      order('Demande le prix.', 'Ohatrinona ny vidiny', ['w1.price'], [l('…', 'Lova attend ta question sur le prix du jeu.')], 'La formule déjà apprise demande la valeur.'),
      cloze('Le prix est dix ariary : « Ariary ___. »', 'folo', ['w1.price', 'w1.numbers-ten'], [m('Ariary …', 'Dix ariary.')], 'Folo est dix.'),
      choose('Tu remercies après la réponse. Choisis.', 'Misaotra.', ['Misaotra.', 'Iza ianao?', 'Aiza ny tsena?'], [B.thanks], [l('Ariary folo.', 'Dix ariary.')], 'Misaotra exprime le remerciement.', true),
      choose('L’échange est fini. Prends congé.', 'Veloma.', ['Veloma.', 'Salama.', 'Firy?'], [B.goodbye], [l('Veloma.', 'Au revoir.')], 'Veloma termine la conversation.', true, 'dialogue'),
    ] },
]);

unit(12, 'L’aventure d’Antananarivo', 'Misaotra! Veloma!', 'Retrouver les proches de Lova, se repérer et mener un dernier échange.', ['Réunir présentation, famille et maison', 'Se repérer et exprimer un besoin', 'Terminer un échange en demandant une clarification si nécessaire'], [
  { title: 'Une visite à organiser', description: 'Retrouve la maison sur un plan fictif avant de rendre visite à la famille.',
    sourceIds: [PC, QUESTIONS, ...directionSources], reviews: ['w1.family', 'w1.family-possession', 'w1.have', 'w1.house', 'w1.house-possession', 'w1.location', C.quantity, C.where, C.sides, C.directions], scenes: [
      scene('Lova présente sa famille', [m('Manana zanaka firy ianao?', 'Combien d’enfants as-tu ?'), l('Manana zanaka roa aho.', 'J’ai deux enfants.')], 'Manana zanaka roa aho.', 'Une famille et un nombre déjà connus'),
      scene('Une visite à la maison', [m('Aiza ny reninao?', 'Où est ta mère ?'), l('Ao an-trano ny reniko.', 'Ma mère est dans la maison.')], 'reninao → reniko', 'Ta mère dans la question, ma mère dans la réponse'),
      scene('La maison sur le plan de l’aventure', [m('Aiza ny trano?', 'Où est la maison ?'), l('Ankavanana ny trano.', 'La maison est à droite.')], 'Ankavanana ny trano.', 'Identifier la destination'),
      scene('Le dernier croisement', [l('Mandehana mahitsy.', 'Va tout droit.'), l('Mivilia ankavanana.', 'Tourne à droite.'), m('Misaotra.', 'Merci.')], 'mahitsy → ankavanana', 'Tout droit, puis à droite'),
    ], notes: [{ title: 'Un défi qui rassemble les acquis', body: 'L’aventure utilise un plan et des personnages fictifs. Elle ne donne pas de directions réelles dans Antananarivo. Les mêmes expressions sont maintenant combinées pour préparer une visite : personnes, possession, quantité, lieu et mouvement.' }], tasks: [
      choose('Qui est dans la maison, selon Lova ?', 'La mère de Lova', ['La mère de Lova', 'La mère de Mia', 'Les deux enfants de Mia'], ['w1.family-possession', 'w1.location'], [m('Aiza ny reninao?', 'Où est ta mère ?'), l('Ao an-trano ny reniko.', 'Ma mère est dans la maison.')], 'Dans la réplique de Lova, reniko désigne sa propre mère.', false, 'reading'),
      choose('Avant de partir, demande où se trouve la maison.', 'Aiza ny trano?', ['Aiza ny trano?', 'Ohatrinona ny vidiny?', 'Iza no anaranao?'], [C.where, 'w1.house'], [l('Ao an-trano ny reniko.', 'Ma mère est dans la maison.')], 'La prochaine information utile est le lieu de la maison.', true, 'dialogue'),
      order('Indique que la maison est à droite.', 'Ankavanana ny trano', [C.sides, 'w1.house'], [m('Aiza ny trano?', 'Où est la maison ?')], 'Ankavanana situe la maison sur le plan.'),
      cloze('Lova a deux enfants : « Manana zanaka ___ aho. »', 'roa', ['w1.have', 'w1.family', 'w1.numbers-ten'], [l('Manana zanaka … aho.', 'J’ai deux enfants.')], 'Roa donne la quantité deux.'),
      match('Retrouve le rôle des informations du trajet.', [['Manana zanaka roa aho.', 'La famille de Lova'], ['Ankavanana ny trano.', 'Le lieu de la maison'], ['Mivilia ankavanana.', 'Le virage à effectuer']], ['w1.have', C.sides, C.directions], [l('Ankavanana ny trano.', 'La maison est à droite.'), m('Misaotra.', 'Merci.')]),
      choose('Quelle est la dernière action avant d’arriver ?', 'Tourner à droite', ['Tourner à droite', 'Tourner à gauche', 'Redemander un prénom'], [C.directions, C.sides], [l('Mandehana mahitsy.', 'Va tout droit.'), l('Mivilia ankavanana.', 'Tourne à droite.')], 'Le second mouvement demandé est un virage à droite.', false, 'reading'),
    ] },
  { title: 'Le dernier échange du voyage', description: 'Un besoin, un montant à comprendre, puis des remerciements.',
    sourceIds: [PC, AZO, REPEAT, SLOW], reviews: ['w1.hunger-thirst', 'w1.need', 'w1.food', 'w1.price', 'w1.numbers-twenty', C.understand, C.repeat, C.slow, B.thanks, B.goodbye], scenes: [
      scene('Après la marche', [m('Noana aho.', 'J’ai faim.'), l('Mila mofo ve ianao?', 'As-tu besoin de pain ?')], 'Noana aho.', 'Nommer le besoin avant la demande'),
      scene('La carte du repas imaginaire', [m('Eny, mila mofo aho.', 'Oui, j’ai besoin de pain.'), m('Ohatrinona ny vidiny?', 'Quel est son prix ?'), l('Ariary roapolo.', 'Vingt ariary.')], 'Ariary roapolo.', 'Un montant fictif de vingt ariary'),
      scene('Mia fait répéter le montant', [m('Tsy azoko. Avereno moramora, azafady.', 'Je ne comprends pas. Répétez lentement, s’il vous plaît.'), l('Ariary roapolo.', 'Vingt ariary.'), m('Eny, azoko.', 'Oui, j’ai compris.')], 'Avereno moramora, azafady.', 'Une stratégie pour poursuivre la conversation'),
      scene('Le monde 1 se termine', [m('Misaotra.', 'Merci.'), l('Veloma.', 'Au revoir.'), m('Veloma.', 'Au revoir.')], 'Misaotra. Veloma.', 'Remercier puis prendre congé'),
    ], notes: [{ title: 'Le montant appartient au jeu', body: 'Les cartes du repas utilisent des montants fictifs pour pratiquer les nombres déjà appris. Elles ne décrivent pas les prix actuels d’un repas ou du pain. Le but final est de comprendre une demande, poser sa question et savoir demander une répétition.' }], tasks: [
      choose('Quel besoin Mia exprime-t-elle après la marche ?', 'Elle a faim', ['Elle a faim', 'Elle a soif', 'Elle veut dormir'], ['w1.hunger-thirst'], [m('Noana aho.', 'J’ai faim.')], 'Noana exprime la faim.', false, 'reading'),
      choose('Confirme le besoin de pain.', 'Eny, mila mofo aho.', ['Eny, mila mofo aho.', 'Te hatory aho.', 'Mia no anarako.'], ['w1.need', 'w1.food'], [l('Mila mofo ve ianao?', 'As-tu besoin de pain ?')], 'Mofo est le pain ; mila exprime le besoin.', true, 'dialogue'),
      choose('Quel montant le jeu annonce-t-il ?', '20 ariary', ['10 ariary', '20 ariary', '2 ariary'], ['w1.price', 'w1.numbers-twenty'], [m('Ohatrinona ny vidiny?', 'Quel est son prix ?'), l('Ariary roapolo.', 'Vingt ariary.')], 'Roapolo signifie vingt.', false, 'reading'),
      order('Le montant n’est pas compris. Demande une répétition lente.', 'Avereno moramora azafady', [C.repeat, C.slow, B.please], [l('Ariary roapolo.', 'Vingt ariary.')], 'La formule demande de répéter doucement.'),
      cloze('Après la répétition : « Eny, ___. »', 'azoko', [C.understand], [l('Azonao ve?', 'As-tu compris ?'), m('Eny, …', 'Oui, j’ai compris.')], 'Azoko confirme ce qui a été compris.'),
      choose('Tout est compris et le voyage se termine. Prends congé.', 'Veloma.', ['Veloma.', 'Iza ianao?', 'Aiza ny kabone?'], [B.goodbye, B.thanks], [l('Veloma.', 'Au revoir.')], 'Veloma ferme la conversation après le remerciement.', true, 'dialogue'),
    ] },
  { title: 'Quiz final · Le grand défi d’Antananarivo', description: 'Douze situations cumulatives pour terminer le monde 1.',
    sourceIds: [PC, QUESTIONS, ...directionSources, AZO, REPEAT, SLOW],
    reviews: [B.hello, B.please, B.name, B.origin, 'grammar.singular-pronouns', 'vocab.france', 'grammar.article-ny', 'w1.family', 'w1.family-possession', 'w1.house', 'w1.house-possession', 'w1.location', 'w1.food', 'w1.hunger-thirst', 'w1.have', 'w1.need', 'w1.numbers-ten', 'w1.numbers-twenty', 'w1.price', C.quantity, C.where, C.market, C.sides, C.directions, C.understand, C.repeat, C.slow, B.negation, B.thanks, B.goodbye], scenes: [], tasks: [
      choose('Tu veux passer poliment. Choisis la formule.', 'Azafady.', ['Azafady.', 'Misaotra.', 'Veloma.'], [B.please], [m('…', 'Le passage est bloqué ; tu demandes à passer.')], 'Azafady sert à demander avec politesse ou à s’excuser.', true, 'dialogue'),
      order('Présente-toi avec le prénom Mia.', 'Mia no anarako', [B.name], [l('Iza no anaranao?', 'Comment t’appelles-tu ?')], 'Mia no anarako donne le prénom.'),
      choose('Quelle information complète la présentation de Mia ?', 'Elle vient de France', ['Elle vient de France', 'Elle habite à gauche du marché', 'Elle annonce son prix'], [B.origin, 'vocab.france'], [m('Mia no anarako.', 'Je m’appelle Mia.'), m('Avy any Frantsa aho.', 'Je viens de France.')], 'Avy any Frantsa aho indique son origine.', false, 'reading'),
      match('Relie les mots du quotidien à leur sens.', [['reniko', 'ma mère'], ['tranoko', 'ma maison'], ['rano', 'eau']], ['w1.family', 'w1.family-possession', 'w1.house-possession', 'w1.food'], [l('Ao an-trano ny reniko.', 'Ma mère est dans la maison.')]),
      cloze('Lova a deux enfants : « Manana zanaka ___ aho. »', 'roa', ['w1.have', 'w1.family', 'w1.numbers-ten'], [l('Manana zanaka … aho.', 'J’ai deux enfants.')], 'Roa signifie deux.'),
      choose('Où est le livre ?', 'Sur la table', ['Sur la table', 'Sous la table', 'À droite du marché'], ['w1.location', 'w1.house', 'grammar.article-ny'], [l('Eo ambony latabatra ny boky.', 'Le livre est sur la table.')], 'Eo ambony latabatra situe le livre sur la table.', false, 'reading'),
      choose('Tu as soif. Formule la demande utile.', 'Mila rano aho, azafady.', ['Mila rano aho, azafady.', 'Te hatory aho.', 'Manana zanaka roa aho.'], ['w1.hunger-thirst', 'w1.need', 'w1.food', B.please], [l('Mangetaheta ve ianao?', 'As-tu soif ?')], 'Rano répond au besoin de boire.', true, 'dialogue'),
      order('Pour atteindre le marché, indique un virage à gauche.', 'Mivilia ankavia', [C.directions, C.sides, C.market, C.where], [m('Aiza ny tsena?', 'Où est le marché ?')], 'Mivilia donne la consigne et ankavia son côté.'),
      choose('Quel montant est annoncé sur la carte du jeu ?', '20 ariary', ['2 ariary', '10 ariary', '20 ariary'], ['w1.price', 'w1.numbers-twenty'], [l('Ariary roapolo.', 'Vingt ariary.')], 'Roapolo correspond à vingt ; le montant appartient au jeu.', false, 'reading'),
      translate('Écris « Je ne comprends pas ».', 'Tsy azoko', [C.understand, B.negation], [l('Azonao ve?', 'As-tu compris ?')], 'Tsy azoko est la formule qui signale l’incompréhension.'),
      choose('Le montant est encore trop rapide. Demande de répéter lentement.', 'Avereno moramora, azafady.', ['Avereno moramora, azafady.', 'Eny, azoko.', 'Veloma.'], [C.repeat, C.slow, B.please], [l('Ariary roapolo.', 'Vingt ariary.')], 'Avereno demande la répétition, moramora indique lentement.', true, 'dialogue'),
      choose('Tu remercies puis tu prends congé. Choisis.', 'Misaotra. Veloma.', ['Misaotra. Veloma.', 'Salama! Tonga soa!', 'Tsy azoko. Avereno, azafady.'], [B.thanks, B.goodbye, B.hello], [l('Veloma.', 'Au revoir.')], 'Le remerciement est suivi du congé : Misaotra. Veloma.', true, 'dialogue'),
    ] },
]);

export const GROUP_08_12 = { units, lessons, exercises, concepts, vocabulary, sources };
