import type { Concept, Content, DialogueScene, DialogueTurn, Exercise, Lesson, Source, Unit, Vocabulary } from './types';

/** Authored continuation of the first world. Texts are original, lexicon and forms sourced below. */
type Bundle = Pick<Content, 'units' | 'lessons' | 'exercises' | 'concepts' | 'vocabulary' | 'sources'>;
export const GROUP_04_07: Bundle = { units: [], lessons: [], exercises: [], concepts: [], vocabulary: [], sources: [] };
const B = GROUP_04_07;
const F = 'w1.family', P = 'w1.family-possession', H = 'w1.have';
const HOUSE = 'w1.house', HP = 'w1.house-possession', LOC = 'w1.location';
const FOOD = 'w1.food', HUNGER = 'w1.hunger-thirst', NEED = 'w1.need', LIKE = 'w1.like';
const TEN = 'w1.numbers-ten', TWENTY = 'w1.numbers-twenty', PRICE = 'w1.price';
const YES = 'vocab.yes', NO = 'vocab.no', NEG = 'grammar.negation-tsy', VE = 'grammar.question-ve';
const l = (text: string, translation: string): DialogueTurn => ({ speaker: 'lova', text, translation });
const m = (text: string, translation: string): DialogueTurn => ({ speaker: 'mia', text, translation });
const sc = (setting: string, turns: DialogueTurn[], malagasy: string, french: string): Omit<DialogueScene, 'id'> => ({ setting, turns, takeaway: { malagasy, french } });
const e = (type: Exercise['type'], question: string, answers: string[], concepts: string[], explanation: string, dialogue: DialogueTurn[], extra: Partial<Exercise> = {}): Omit<Exercise, 'id' | 'sourceIds'> => ({
  type, question, answers, concepts, explanation, dialogue, prompt: 'À vous de répondre', difficulty: 2, ...extra,
});
const choice = (question: string, correct: string, other: string[], concepts: string[], explanation: string, dialogue: DialogueTurn[], mg = false, type: 'choice' | 'dialogue' | 'reading' = 'choice') => e(type, question, [correct], concepts, explanation, dialogue, { choices: [correct, ...other], ...(mg ? { selectionLanguage: 'mg' as const } : {}) });
const order = (question: string, answer: string, concepts: string[], explanation: string, dialogue: DialogueTurn[]) => e('order', question, [answer], concepts, explanation, dialogue, { tokens: answer.split(' '), selectionLanguage: 'mg' });
const match = (question: string, pairs: [string, string][], concepts: string[], explanation: string, dialogue: DialogueTurn[]) => e('match', question, [], concepts, explanation, dialogue, { pairs: pairs.map(([left, right]) => ({ left, right })), selectionLanguage: 'mg' });
type Task = ReturnType<typeof e>;
type ConceptSeed = Pick<Concept, 'id' | 'label' | 'category' | 'objective'> & Partial<Pick<Concept, 'malagasy' | 'french' | 'prerequisites'>>;
type Part = { title: string; description: string; concepts: ConceptSeed[]; reviews: string[]; scenes: Omit<DialogueScene, 'id'>[]; notes: Lesson['notes']; tasks: Task[] };
function sources(number: number, words: [string, string][]): string[] {
  return words.map(([word, supports]) => {
    const id = `w1-${number.toString().padStart(2, '0')}-${word}`;
    B.sources.push({ id, title: `Dictionnaire malgache : ${word}`, author: 'Dictionnaire malgache et Encyclopédie de Madagascar — lexicographes cités dans chaque entrée', url: `https://malagasyword.org/bins/teny2/${word}`, category: 'dictionary', consulted: true, supports,
      license: 'Consultation lexicographique ; mots, formes et sens vérifiés. Dialogues et exercices originaux, aucune définition longue ou voix reproduite.' });
    return id;
  });
}
function addUnit(number: number, title: string, malagasyTitle: string, description: string, objectives: string[], sourceIds: string[], parts: [Part, Part], quiz: Task[], words: [string, string, string, string][]): void {
  sourceIds = [...sourceIds, 'peacecorps-intro'];
  const n = number.toString().padStart(2, '0'), unitId = `unit-${n}`, lessonIds = [1, 2, 3].map(part => `lesson-${n}-0${part}`);
  B.units.push({ id: unitId, number, worldId: 'world-01', title, malagasyTitle, description, objectives, lessonIds, implemented: true });
  for (const [index, part] of parts.entries()) {
    const id = lessonIds[index];
    B.concepts.push(...part.concepts.map(concept => ({ ...concept, introducedIn: id, sourceIds, prerequisites: concept.prerequisites ?? [] })));
    const tasks = part.tasks.map((task, position) => ({ ...task, id: `exercise-${n}-0${index + 1}-${String.fromCharCode(97 + position)}`, sourceIds }));
    B.exercises.push(...tasks);
    B.lessons.push({ id, unitId, worldId: 'world-01', title: part.title, description: part.description, kind: index === 0 ? 'learn' : 'story', introduces: part.concepts.map(c => c.id), reviews: part.reviews,
      prerequisites: [index === 0 ? `lesson-${(number - 1).toString().padStart(2, '0')}-03` : lessonIds[0]], objectives: part.concepts.map(c => c.objective), exerciseIds: tasks.map(t => t.id), estimatedMinutes: 7, sourceIds, notes: part.notes,
      scenes: part.scenes.map((scene, position) => ({ ...scene, id: `scene-${n}-0${index + 1}-${String.fromCharCode(97 + position)}` })) });
  }
  const tasks = quiz.map((task, position) => ({ ...task, id: `exercise-${n}-03-${String.fromCharCode(97 + position)}`, sourceIds }));
  B.exercises.push(...tasks);
  B.lessons.push({ id: lessonIds[2], unitId, worldId: 'world-01', title: `Quiz final · ${title}`, description: 'Douze questions pour réutiliser les échanges de cette unité et les acquis précédents.', kind: 'checkpoint', introduces: [], reviews: [...new Set([...parts.flatMap(p => p.concepts.map(c => c.id)), ...parts.flatMap(p => p.reviews)])], prerequisites: [lessonIds[1]], objectives, exerciseIds: tasks.map(t => t.id), estimatedMinutes: 9, sourceIds, notes: [] });
  B.vocabulary.push(...words.map(([malagasy, french, note, conceptId], index) => ({ id: `word.w1-${n}-${index + 1}`, malagasy, french, note, conceptId, unitId, sourceIds })));
  B.units.sort((a, b) => a.number - b.number);
  B.lessons.sort((a, b) => a.id.localeCompare(b.id));
  B.exercises.sort((a, b) => a.id.localeCompare(b.id));
}

const familySources = sources(4, [
  ['reny', 'Mère ; formes possessives reniko et reninao.'], ['ray', 'Père ; formes possessives raiko et rainao.'],
  ['zanaka', 'Enfant dans la relation de filiation ; formes zanako et zanakao.'], ['fianakaviana', 'Famille, parentèle ; ne présuppose pas une seule composition de famille.'],
  ['manana', 'Verbe à la voix active : avoir, posséder ; objet puis sujet dans les modèles retenus.'],
]);

const houseSources = sources(5, [
  ['trano', 'Maison ; formes tranoko et tranonao, emploi an-trano.'], ['seza', 'Chaise ; exemple de localisation eo ambony seza.'],
  ['latabatra', 'Table.'], ['boky', 'Livre, dans le sens standard étudié.'], ['eto', 'Ici, à l’endroit de la personne qui parle.'],
  ['ao', 'Lieu intérieur ou non visible, à distinguer de eo.'], ['eo', 'Lieu proche visible ; exemple eo ambony latabatra.'],
  ['ambony', 'Sur, au-dessus ; opposition avec ambany.'], ['ambany', 'Sous, au-dessous ; exemples avec un meuble.'],
]);
addUnit(5, 'Une maison à découvrir', 'Eto ny tranoko.', 'Nommer les objets de la maison et retrouver un livre.', ['Nommer des objets familiers', 'Distinguer ma maison de votre maison', 'Situer un objet ou une personne'], houseSources, [
  {
    title: 'Une pièce à installer', description: 'Les personnages préparent une maison fictive.',
    concepts: [{ id: HOUSE, label: 'La maison et ses objets', category: 'vocabulary', objective: 'Reconnaître trano, seza, latabatra et boky.', malagasy: 'trano · seza · latabatra · boky', french: 'maison · chaise · table · livre' }], reviews: [H, VE, NEG],
    scenes: [
      sc('Une maison pour l’histoire', [l('« trano »', 'Le mot « maison ».') , m('Manana trano aho.', 'J’ai une maison.')], 'trano', 'maison'),
      sc('Les premiers meubles', [m('« seza »', 'Le mot « chaise ».') , l('« latabatra »', 'Le mot « table ».') , m('Manana seza aho.', 'J’ai une chaise.')], 'seza · latabatra', 'chaise · table'),
      sc('Le livre de Mia', [m('« boky »', 'Le mot « livre ».') , l('Manana boky ve ianao?', 'As-tu un livre ?'), m('Eny, manana boky aho.', 'Oui, j’ai un livre.')], 'Manana boky aho.', 'J’ai un livre.'),
      sc('Il manque encore une table', [l('Tsy manana latabatra aho.', 'Je n’ai pas de table.'), m('Manana latabatra aho.', 'J’ai une table.')], 'Tsy manana latabatra aho.', 'Je n’ai pas de table.'),
    ], notes: [{ title: 'Les noms ne changent pas comme en français', body: 'Ny seza peut désigner la chaise ou les chaises selon le contexte. Ici, les petites scènes choisissent un seul objet pour faciliter la compréhension ; le nom ne reçoit pas une marque de genre.' }, { title: 'Réutiliser manana', body: 'Manana boky aho suit la construction active déjà étudiée : avoir, un livre, je. Le nouveau mot change l’objet, pas la structure.' }],
    tasks: [
      choice('Quel objet Mia dit-elle avoir ?', 'Un livre', ['Une famille', 'De l’eau'], [HOUSE, H], 'Boky signifie livre.', [m('Manana boky aho.', 'J’ai un livre.')], false, 'reading'),
      choice('Choisissez le mot pour « chaise ».', 'seza', ['trano', 'boky'], [HOUSE], 'Seza nomme une chaise.', [l('« seza »', 'chaise')], true),
      match('Associez les objets de la maison.', [['trano', 'maison'], ['latabatra', 'table'], ['boky', 'livre']], [HOUSE], 'Chaque mot garde ici son sens concret courant.', [l('« trano »', 'maison'), m('« latabatra »', 'table'), l('« boky »', 'livre')]),
      e('cloze', 'Complétez : « Manana ___ aho. » pour dire « J’ai une table. »', ['latabatra'], [HOUSE, H], 'Latabatra est l’objet que l’on possède.', [m('Manana … aho.', 'J’ai une table.')]),
      order('Reconstituez : « J’ai un livre. »', 'Manana boky aho', [HOUSE, H], 'Le sujet aho termine ce modèle.', [l('Manana boky ve ianao?', 'As-tu un livre ?')]),
      choice('Que manque-t-il à Lova ?', 'Une table', ['Une maison', 'Une chaise'], [HOUSE, H, NEG], 'Tsy manana latabatra aho signifie je n’ai pas de table.', [l('Tsy manana latabatra aho.', 'Je n’ai pas de table.')], false, 'reading'),
    ],
  },
  {
    title: 'Le livre a changé de place', description: 'Retrouvez les objets dans la maison de Lova.',
    concepts: [{ id: HP, label: 'Ma maison et votre maison', category: 'grammar', objective: 'Distinguer tranoko et tranonao.', prerequisites: [HOUSE], malagasy: 'tranoko · tranonao', french: 'ma maison · ta/votre maison' }, { id: LOC, label: 'Situer simplement', category: 'communication', objective: 'Comprendre ici, dans la maison, sur et sous la table.', prerequisites: [HOUSE] }], reviews: [HOUSE, F, P, VE],
    scenes: [
      sc('Devant la maison de Lova', [l('Eto ny tranoko.', 'Ma maison est ici.'), m('Eto ve ny tranonao?', 'Ta maison est-elle ici ?'), l('Eny, eto ny tranoko.', 'Oui, ma maison est ici.')], 'tranoko · tranonao', 'ma maison · ta/votre maison'),
      sc('Les parents sont à l’intérieur', [l('Ao an-trano ny reniko.', 'Ma mère est dans la maison.'), m('Ao an-trano ve ny rainao?', 'Ton père est-il dans la maison ?'), l('Eny, ao an-trano izy.', 'Oui, il est dans la maison.')], 'ao an-trano', 'dans la maison'),
      sc('Le livre est visible sur la table', [m('Eo ambony latabatra ny boky.', 'Le livre est sur la table.'), l('Eny.', 'Oui.')], 'eo ambony latabatra', 'sur la table'),
      sc('Dans cette autre scène, le livre est tombé', [l('Eo ambany latabatra ny boky.', 'Le livre est sous la table.'), m('Eto ny seza.', 'La chaise est ici.')], 'eo ambany latabatra', 'sous la table'),
    ], notes: [{ title: 'Le lieu avant ce que l’on situe', body: 'Eto ny tranoko et ao an-trano ny reniko commencent par le lieu. La maison ou la personne située vient ensuite. Le malgache n’ajoute pas le verbe être français.' }, { title: 'Ce que l’on voit compte', body: 'Eo accompagne ici un endroit proche et visible ; ao présente un intérieur non visible. Ces premiers exemples ne couvrent pas tout le système spatial malgache.' }, { title: 'Sur et sous', body: 'Les groupes appris entiers sont eo ambony latabatra et eo ambany latabatra. Ambony et ambany s’opposent : sur/au-dessus et sous/au-dessous.' }],
    tasks: [
      choice('La maison de qui est ici ?', 'Celle de Lova', ['Celle de Mia', 'Le texte ne parle pas de maison'], [HP, LOC], 'Tranoko renvoie à la maison de la personne qui parle.', [l('Eto ny tranoko.', 'Ma maison est ici.')], false, 'reading'),
      choice('Dans cet échange, où est la mère de Lova ?', 'Dans la maison', ['Sur la table', 'Sous la table'], [LOC, F, P], 'Ao an-trano indique un intérieur, ici la maison.', [l('Ao an-trano ny reniko.', 'Ma mère est dans la maison.')], false, 'reading'),
      match('Associez les lieux.', [['eto', 'ici'], ['ao an-trano', 'dans la maison'], ['eo ambony latabatra', 'sur la table']], [LOC], 'Chaque groupe fournit un repère de localisation.', [m('Eto ny seza.', 'La chaise est ici.'), l('Eo ambony latabatra ny boky.', 'Le livre est sur la table.')]),
      e('cloze', '« Eo ___ latabatra ny boky. » : le livre est sous la table.', ['ambany'], [LOC], 'Ambany est le repère sous/au-dessous.', [m('Eo … latabatra ny boky.', 'Le livre est sous la table.')]),
      order('Dites : « Ma maison est ici. »', 'Eto ny tranoko', [HP, LOC], 'Le lieu eto ouvre la phrase.', [m('Eto ve ny tranonao?', 'Ta maison est-elle ici ?')]),
      e('translate', 'Écrivez « ta maison ».', ['tranonao'], [HP], 'Tranonao est la forme possédée de trano pour l’interlocuteur.', [l('Eto ve ny tranonao?', 'Ta maison est-elle ici ?')]),
    ],
  },
], [
  choice('Où se trouve le livre ?', 'Sous la table', ['Sur la table', 'Dans le livre'], [LOC, HOUSE], 'Ambany indique sous.', [m('Eo ambany latabatra ny boky.', 'Le livre est sous la table.')], false, 'reading'),
  match('Reliez les objets et leur nom.', [['seza', 'chaise'], ['latabatra', 'table'], ['trano', 'maison']], [HOUSE], 'Ne confondez pas seza et latabatra.', [l('« seza »', 'chaise'), m('« latabatra »', 'table')]),
  e('cloze', '« Eto ny ___. » : ma maison est ici.', ['tranoko'], [HP, LOC], 'Ma maison se dit tranoko.', [l('Eto ny …', 'Ma maison est ici.')]),
  order('Reconstituez : « Le livre est sur la table. »', 'Eo ambony latabatra ny boky', [LOC, HOUSE], 'Le groupe de lieu précède ny boky.', [m('Eo ambany latabatra ny boky.', 'Le livre est sous la table, dans l’autre scène.')]),
  e('translate', 'Écrivez « J’ai une chaise. »', ['Manana seza aho'], [H, HOUSE], 'La construction active garde le sujet aho à la fin.', [l('Manana seza ve ianao?', 'As-tu une chaise ?')]),
  choice('Répondez que votre maison est ici.', 'Eny, eto ny tranoko.', ['Tsy manana boky aho.', 'Reniko izy.'], [HP, LOC, YES], 'La réponse parle de votre propre maison : tranoko.', [m('Eto ve ny tranonao?', 'Ta maison est-elle ici ?')], true, 'dialogue'),
  choice('À qui appartient la maison dans « tranonao » ?', 'À la personne à qui l’on parle', ['À la personne qui parle', 'À personne'], [HP], 'Tranonao signifie ta/votre maison.', [l('Eto ve ny tranonao?', 'Ta maison est-elle ici ?')]),
  e('cloze', '« ___ an-trano ny reniko. » : ma mère est dans la maison.', ['Ao'], [LOC, P], 'Ao introduit cet intérieur non visible.', [l('… an-trano ny reniko.', 'Ma mère est dans la maison.')]),
  match('Opposez les deux positions.', [['eo ambony latabatra', 'sur la table'], ['eo ambany latabatra', 'sous la table']], [LOC], 'Ambony et ambany sont les deux repères opposés.', [m('Eo ambony latabatra ny boky.', 'Le livre est sur la table.')]),
  choice('Lova a-t-il une table ?', 'Non', ['Oui', 'Il parle de sa mère'], [HOUSE, H, NEG, NO], 'Tsy indique qu’il n’a pas de table.', [l('Tsy manana latabatra aho.', 'Je n’ai pas de table.')], false, 'reading'),
  order('Remplacez le livre par la chaise pour la situer ici.', 'Eto ny seza', [HOUSE, LOC], 'Gardez le lieu eto et ny ; remplacez boky par seza pour situer la chaise.', [m('Eto ny boky.', 'Le livre est ici.')]),
  e('translate', 'Parlez maintenant de votre propre maison : écrivez « ma maison ».', ['tranoko'], [HP], 'Pour parler de sa propre maison, on emploie la forme entière tranoko.', [l('Eto ny tranonao.', 'Ta maison est ici.')]),
], [
  ['trano', 'maison', 'Le mot peut aussi désigner d’autres abris ; ici une habitation.', HOUSE], ['seza', 'chaise', 'Objet de la maison.', HOUSE], ['latabatra', 'table', 'Le meuble.', HOUSE], ['boky', 'livre', 'Sens standard retenu dans les scènes.', HOUSE],
  ['tranoko', 'ma maison', 'Forme possédée de trano.', HP], ['tranonao', 'ta / votre maison', 'Une seule personne est interpellée.', HP], ['eto', 'ici', 'À l’endroit de la personne qui parle.', LOC], ['ao an-trano', 'dans la maison', 'Intérieur non visible dans les scènes.', LOC], ['eo ambony latabatra', 'sur la table', 'Groupe de lieu appris entier.', LOC], ['eo ambany latabatra', 'sous la table', 'S’oppose à sur la table.', LOC],
]);
addUnit(4, 'La famille et les proches', 'Ny fianakaviana', 'Présenter des proches et distinguer ma famille de la vôtre.', ['Nommer des liens familiaux', 'Reconnaître les possessifs dans des noms familiers', 'Dire que l’on a un enfant'], familySources, [
  {
    title: 'Les visages d’une famille', description: 'Lova et Mia regardent un arbre de famille fictif.',
    concepts: [{ id: F, label: 'Les liens familiaux', category: 'vocabulary', objective: 'Reconnaître reny, ray, zanaka et fianakaviana.', malagasy: 'reny · ray · zanaka · fianakaviana', french: 'mère · père · enfant · famille' }], reviews: [VE, YES, NO],
    scenes: [
      sc('Les mots de l’arbre de famille', [l('« reny »', 'Le mot « mère ».') , m('« ray »', 'Le mot « père ».')], 'reny · ray', 'mère · père'),
      sc('Des nouvelles de la mère', [l('Reny izy.', 'Elle est mère.'), m('Salama ve izy?', 'Va-t-elle bien ?'), l('Eny, salama izy.', 'Oui, elle va bien.')], 'Reny izy.', 'Elle est mère.'),
      sc('Un lien entre deux générations', [m('« zanaka »', 'Le mot « enfant », dans un lien de famille.'), l('« fianakaviana »', 'Le mot « famille ».')], 'zanaka · fianakaviana', 'enfant · famille'),
      sc('L’autre portrait', [m('Ray ve izy?', 'Est-il père ?'), l('Eny, ray izy.', 'Oui, il est père.')], 'Ray izy.', 'Il est père.'),
    ], notes: [{ title: 'Des liens, pas un modèle unique', body: 'Ces mots décrivent des relations. Les familles peuvent avoir des compositions différentes. Zanaka désigne l’enfant de quelqu’un, sans distinguer fils et fille.' }, { title: 'Une phrase déjà connue', body: 'Reny izy et ray izy réutilisent le prédicat nominal placé avant izy. Aucune copule être n’est ajoutée.' }],
    tasks: [
      choice('Quel lien nomme « reny » ?', 'La mère', ['Le père', 'L’enfant'], [F], 'Reny nomme la mère.', [l('Reny izy.', 'Elle est mère.')]),
      choice('Choisissez le mot pour « père ».', 'ray', ['reny', 'zanaka'], [F], 'Ray nomme le père.', [m('Ray ve izy?', 'Est-il père ?')], true),
      match('Associez les liens de famille.', [['reny', 'mère'], ['ray', 'père'], ['zanaka', 'enfant']], [F], 'Zanaka ne distingue pas fils et fille.', [l('« reny »', 'mère'), m('« ray »', 'père'), l('« zanaka »', 'enfant')]),
      e('cloze', 'Complétez : « ___ izy. » pour dire « Elle est mère. »', ['Reny'], [F], 'Le nom reny constitue ici le prédicat.', [m('… izy.', 'Elle est mère.')]),
      order('Reconstituez : « Il est père. »', 'Ray izy', [F], 'Le statut ray précède le sujet izy.', [l('Ray ve izy?', 'Est-il père ?')]),
      choice('Quel mot désigne tout le groupe familial ?', 'fianakaviana', ['ray', 'zanaka'], [F], 'Fianakaviana désigne la famille, pas une seule relation.', [m('« fianakaviana »', 'famille')], true),
    ],
  },
  {
    title: 'Ma famille, votre famille', description: 'Les formes changent avec la personne dont on parle.',
    concepts: [{ id: P, label: 'Possession dans la famille', category: 'grammar', objective: 'Distinguer reniko/reninao, raiko/rainao et zanako/zanakao.', prerequisites: [F] }, { id: H, label: 'Dire que l’on a', category: 'communication', objective: 'Employer manana avec un objet et un sujet.', malagasy: 'Manana zanaka aho.', french: 'J’ai un enfant.' }], reviews: [F, VE, NEG],
    scenes: [
      sc('Lova présente sa mère', [l('Reniko izy.', 'C’est ma mère.'), m('Reninao ve izy?', 'Est-ce ta mère ?'), l('Eny, reniko izy.', 'Oui, c’est ma mère.')], 'reniko · reninao', 'ma mère · ta/votre mère'),
      sc('Puis le père de Mia', [m('Raiko izy.', 'C’est mon père.'), l('Rainao ve izy?', 'Est-ce ton père ?'), m('Eny, raiko izy.', 'Oui, c’est mon père.')], 'raiko · rainao', 'mon père · ton/votre père'),
      sc('Une branche de l’arbre fictif', [l('Zanako izy.', 'C’est mon enfant.'), m('Zanakao ve izy?', 'Est-ce ton enfant ?'), l('Eny, zanako izy.', 'Oui, c’est mon enfant.')], 'zanako · zanakao', 'mon enfant · ton/votre enfant'),
      sc('Parler d’un enfant', [m('Manana zanaka ve ianao?', 'As-tu un enfant ?'), l('Eny, manana zanaka aho.', 'Oui, j’ai un enfant.'), m('Tsy manana zanaka aho.', 'Je n’ai pas d’enfant.')], 'Manana zanaka aho.', 'J’ai un enfant.'),
    ], notes: [{ title: 'Apprendre les formes entières', body: 'Compare reny/reniko/reninao, ray/raiko/rainao et zanaka/zanako/zanakao. Les suffixes de possession s’adaptent à la fin du nom : on n’ajoute pas mécaniquement la même suite de lettres à tous les noms.' }, { title: 'Un premier verbe à la voix active', body: 'Dans manana zanaka aho, manana signifie avoir : zanaka est ce que l’on a et aho désigne la personne qui a. Cette construction est à la voix active ; elle n’est pas une règle universelle pour toutes les voix malgaches.' }],
    tasks: [
      choice('Lova dit « Reniko izy. » De qui parle-t-il ?', 'De sa mère', ['De votre mère', 'De son père'], [P, F], 'Reniko renvoie à la mère de la personne qui parle.', [l('Reniko izy.', 'C’est ma mère.')], false, 'reading'),
      e('cloze', 'Complétez « ___ izy. » : c’est mon père.', ['Raiko'], [P], 'La forme entière est raiko.', [m('… izy.', 'C’est mon père.')]),
      match('Reliez les deux personnes.', [['reniko', 'ma mère'], ['reninao', 'ta mère'], ['zanakao', 'ton enfant']], [P], 'La terminaison aide à repérer la personne qui possède.', [l('Reniko izy.', 'C’est ma mère.'), m('Zanakao ve izy?', 'Est-ce ton enfant ?')]),
      order('Dites : « J’ai un enfant. »', 'Manana zanaka aho', [H, F], 'Dans ce modèle actif, manana est suivi de l’objet et du sujet.', [m('Manana zanaka ve ianao?', 'As-tu un enfant ?')]),
      choice('Vous n’avez pas d’enfant. Répondez.', 'Tsy manana zanaka aho.', ['Manana zanaka aho.', 'Reniko izy.'], [H, NEG], 'Tsy placé avant manana nie le fait d’avoir un enfant.', [l('Manana zanaka ve ianao?', 'As-tu un enfant ?')], true, 'dialogue'),
      e('translate', 'Écrivez « mon enfant ».', ['zanako'], [P], 'Zanako signifie mon enfant, sans préciser fils ou fille.', [m('Zanako izy.', 'C’est mon enfant.')]),
    ],
  },
], [
  choice('Lova dit « Reniko izy. » Qui présente-t-il ?', 'Sa mère', ['Son père', 'Votre mère'], [P, F], 'Reniko signifie ma mère : Lova présente sa propre mère.', [l('Reniko izy.', 'C’est ma mère.')], false, 'reading'),
  match('Associez les quatre mots de famille.', [['reny', 'mère'], ['ray', 'père'], ['zanaka', 'enfant'], ['fianakaviana', 'famille']], [F], 'Chaque mot désigne un lien ou l’ensemble de la famille.', [m('« fianakaviana »', 'famille')]),
  e('cloze', '« ___ izy. » : c’est ton père.', ['Rainao'], [P], 'Rainao est la forme « ton/votre père ».', [l('… izy.', 'C’est ton père.')]),
  order('Remettez en ordre : « J’ai un enfant. »', 'Manana zanaka aho', [H, F], 'Manana + zanaka + aho.', [m('Manana zanaka ve ianao?', 'As-tu un enfant ?')]),
  choice('Vous avez un enfant. Répondez à Mia.', 'Eny, manana zanaka aho.', ['Tsia, tsy manana zanaka aho.', 'Rainao izy.'], [H, YES], 'Une réponse affirmative garde manana sans tsy.', [m('Manana zanaka ve ianao?', 'As-tu un enfant ?')], true, 'dialogue'),
  e('translate', 'Écrivez « ma mère ».', ['reniko'], [P], 'Reniko est la forme possédée de reny.', [l('Reninao ve izy?', 'Est-ce ta mère ?')]),
  choice('Que dit « Tsy manana zanaka aho » ?', 'Je n’ai pas d’enfant', ['J’ai un enfant', 'C’est mon enfant'], [H, NEG], 'Tsy nie manana ; zanaka est l’objet.', [m('Tsy manana zanaka aho.', 'Je n’ai pas d’enfant.')], false, 'reading'),
  e('cloze', '« Reninao ___ izy? » : est-ce ta mère ?', ['ve'], [VE, P], 'Ve forme ici la question oui/non avant le sujet izy.', [l('Reninao … izy?', 'Est-ce ta mère ?')]),
  order('Reconstituez : « C’est mon père. »', 'Raiko izy', [P], 'Le groupe possessif raiko est le prédicat.', [m('Rainao ve izy?', 'Est-ce ton père ?')]),
  choice('« zanakao » signifie…', 'Ton enfant', ['Mon enfant', 'Ta mère'], [P], 'Zanakao renvoie à l’enfant de la personne à qui l’on parle.', [l('Zanakao ve izy?', 'Est-ce ton enfant ?')]),
  choice('Mia dit « Ray izy. » Quel est son rôle ?', 'Il est père', ['Il est stagiaire', 'Il vient de France'], [F], 'Ray indique ici un lien de famille.', [m('Ray izy.', 'Il est père.')], false, 'reading'),
  e('translate', 'Écrivez « C’est mon enfant. »', ['Zanako izy'], [P, F], 'Zanako est suivi du sujet izy.', [l('Zanakao ve izy?', 'Est-ce ton enfant ?')]),
], [
  ['reny', 'mère', 'Lien de famille ; reniko = ma mère.', F], ['ray', 'père', 'Lien de famille ; raiko = mon père.', F], ['zanaka', 'enfant', 'Enfant de quelqu’un, fils ou fille.', F], ['fianakaviana', 'famille', 'Ensemble de relations familiales.', F],
  ['reniko', 'ma mère', 'Forme possédée de reny.', P], ['reninao', 'ta / votre mère', 'Une seule personne est interpellée.', P], ['raiko', 'mon père', 'Forme possédée de ray.', P], ['rainao', 'ton / votre père', 'Une seule personne est interpellée.', P], ['zanako', 'mon enfant', 'Ne précise pas le genre de l’enfant.', P], ['zanakao', 'ton / votre enfant', 'Forme possédée de zanaka.', P], ['manana', 'avoir / posséder', 'Verbe à la voix active dans les exemples de cette unité.', H],
]);

const foodSources = sources(6, [
  ['vary', 'Riz, sans réduire le mot à la seule plante.'], ['rano', 'Eau, dans le sens courant retenu ici.'], ['mofo', 'Pain ; nom générique dont les composés précisent les préparations.'],
  ['akondro', 'Banane ; on ne présente pas les variantes régionales comme des synonymes standard à mémoriser.'], ['kafe', 'Café, ici la boisson.'],
  ['noana', 'Adjectif : avoir faim ; prédicat avec un sujet.'], ['mangetaheta', 'Avoir soif.'], ['mila', 'Avoir besoin de, demander ; exemples limités à des objets et boissons.'], ['tia', 'Aimer, apprécier ; construction active avec un objet.'],
]);
addUnit(6, 'À table', 'Mila rano aho.', 'Dire que l’on a faim ou soif et exprimer un besoin avec politesse.', ['Reconnaître des aliments et boissons', 'Dire que l’on a faim ou soif', 'Exprimer un besoin et un goût'], foodSources, [
  {
    title: 'Une pause pour se restaurer', description: 'Mia et Lova lisent un petit menu et parlent de faim et de soif.',
    concepts: [{ id: FOOD, label: 'Aliments et boissons', category: 'vocabulary', objective: 'Reconnaître vary, rano, mofo, akondro et kafe.', malagasy: 'vary · rano · mofo · akondro · kafe', french: 'riz · eau · pain · banane · café' }, { id: HUNGER, label: 'Faim et soif', category: 'communication', objective: 'Distinguer noana et mangetaheta dans une phrase.', malagasy: 'Noana aho. · Mangetaheta aho.', french: 'J’ai faim. · J’ai soif.' }], reviews: [VE, NEG, YES],
    scenes: [
      sc('Après la promenade', [m('Noana aho.', 'J’ai faim.'), l('Noana ve ianao?', 'As-tu faim ?'), m('Eny, noana aho.', 'Oui, j’ai faim.')], 'Noana aho.', 'J’ai faim.'),
      sc('Le mot pour l’eau', [l('Mangetaheta aho.', 'J’ai soif.'), m('« rano »', 'Le mot « eau ».')], 'Mangetaheta aho.', 'J’ai soif.'),
      sc('Trois mots sur le petit menu', [l('« vary »', 'Le mot « riz ».') , m('« mofo »', 'Le mot « pain ».') , l('« akondro »', 'Le mot « banane ».')], 'vary · mofo · akondro', 'riz · pain · banane'),
      sc('Le café et la soif', [m('« kafe »', 'Le mot « café ».') , l('Tsy noana aho.', 'Je n’ai pas faim.'), m('Mangetaheta aho.', 'J’ai soif.')], 'kafe · rano', 'café · eau'),
    ], notes: [{ title: 'Deux états à distinguer', body: 'Noana aho signifie j’ai faim, mangetaheta aho signifie j’ai soif. Ces expressions se construisent avec le sujet après le prédicat ; le français emploie avoir mais on ne traduit pas mot à mot par manana.' }, { title: 'Un menu d’apprentissage', body: 'Les cinq noms servent à comprendre un repas simple. Mofo possède de nombreux composés pour des préparations différentes ; aucune habitude alimentaire n’est attribuée à tous les habitants.' }],
    tasks: [
      choice('De quoi Mia parle-t-elle ?', 'De sa faim', ['De sa famille', 'De son prénom'], [HUNGER], 'Noana indique la faim.', [m('Noana aho.', 'J’ai faim.')], false, 'reading'),
      choice('Choisissez le mot pour « pain ».', 'mofo', ['rano', 'kafe'], [FOOD], 'Mofo nomme le pain dans le menu étudié.', [l('« mofo »', 'pain')], true),
      match('Associez les mots du menu.', [['vary', 'riz'], ['rano', 'eau'], ['akondro', 'banane']], [FOOD], 'Ces noms désignent trois aliments ou boissons différents.', [m('« vary »', 'riz'), l('« rano »', 'eau'), m('« akondro »', 'banane')]),
      e('cloze', '« ___ aho. » : j’ai soif.', ['Mangetaheta'], [HUNGER], 'Mangetaheta exprime la soif, noana la faim.', [l('… aho.', 'J’ai soif.')]),
      order('Dites : « J’ai faim. »', 'Noana aho', [HUNGER], 'Le prédicat noana vient avant aho.', [m('Noana ve ianao?', 'As-tu faim ?')]),
      choice('Lova a-t-il faim ?', 'Non', ['Oui', 'Il donne son origine'], [HUNGER, NEG], 'Tsy nie l’état noana.', [l('Tsy noana aho.', 'Je n’ai pas faim.')], false, 'reading'),
    ],
  },
  {
    title: 'Ce dont j’ai besoin, ce que j’aime', description: 'Commander avec politesse et comprendre un goût différent du sien.',
    concepts: [{ id: NEED, label: 'Exprimer un besoin', category: 'communication', objective: 'Employer mila pour demander un objet ou une boisson.', malagasy: 'Mila rano aho.', french: 'J’ai besoin d’eau.' }, { id: LIKE, label: 'Exprimer un goût', category: 'communication', objective: 'Dire que l’on aime ou n’aime pas un aliment avec tia.', malagasy: 'Tia akondro aho.', french: 'J’aime les bananes.' }], reviews: [FOOD, HUNGER, NEG, VE],
    scenes: [
      sc('Une demande polie', [m('Mila rano aho, azafady.', 'J’ai besoin d’eau, s’il vous plaît.'), l('Eny, tompoko.', 'Oui, avec respect.'), m('Misaotra.', 'Merci.')], 'Mila rano aho, azafady.', 'J’ai besoin d’eau, s’il vous plaît.'),
      sc('Et du pain ?', [l('Mila mofo ve ianao?', 'As-tu besoin de pain ?'), m('Eny, mila mofo aho.', 'Oui, j’ai besoin de pain.')], 'Mila mofo aho.', 'J’ai besoin de pain.'),
      sc('Des goûts personnels', [m('Tia akondro aho.', 'J’aime les bananes.'), l('Tia vary aho.', 'J’aime le riz.')], 'Tia akondro aho.', 'J’aime les bananes.'),
      sc('Mia ne veut pas de café', [l('Tia kafe ve ianao?', 'Aimes-tu le café ?'), m('Tsia, tsy tia kafe aho.', 'Non, je n’aime pas le café.')], 'Tsy tia kafe aho.', 'Je n’aime pas le café.'),
    ], notes: [{ title: 'Besoin et préférence', body: 'Mila rano aho exprime un besoin d’eau. Tia kafe aho exprime un goût pour le café. Ces deux verbes actifs ne sont pas interchangeables : leur objet vient avant le sujet aho dans les modèles étudiés.' }, { title: 'Refuser sans impolitesse', body: 'Tsia peut ouvrir une réponse négative ; tsy nie ensuite le prédicat : tsia, tsy tia kafe aho. Azafady et misaotra restent disponibles dans les échanges de politesse.' }],
    tasks: [
      choice('Demandez de l’eau avec politesse.', 'Mila rano aho, azafady.', ['Tia akondro aho.', 'Tsy noana aho.'], [NEED, FOOD], 'Mila exprime le besoin ; azafady ajoute la politesse.', [l('Mangetaheta ve ianao?', 'As-tu soif ?')], true, 'dialogue'),
      choice('Que dit aimer Mia ?', 'Les bananes', ['Le café', 'Les livres'], [LIKE, FOOD], 'Tia akondro aho exprime un goût pour les bananes.', [m('Tia akondro aho.', 'J’aime les bananes.')], false, 'reading'),
      order('Répondez : « J’ai besoin de pain. »', 'Mila mofo aho', [NEED, FOOD], 'L’objet mofo suit mila et précède aho.', [l('Mila mofo ve ianao?', 'As-tu besoin de pain ?')]),
      e('cloze', '« ___ vary aho. » : j’aime le riz.', ['Tia'], [LIKE, FOOD], 'Tia exprime ici un goût.', [m('… vary aho.', 'J’aime le riz.')]),
      match('Associez les intentions.', [['mila', 'avoir besoin de'], ['tia', 'aimer'], ['noana', 'avoir faim']], [NEED, LIKE, HUNGER], 'Distinguez besoin, goût et état de faim.', [l('Mila rano aho.', 'J’ai besoin d’eau.'), m('Tia vary aho.', 'J’aime le riz.')]),
      e('translate', 'Écrivez « Je n’aime pas le café. »', ['Tsy tia kafe aho'], [LIKE, FOOD, NEG], 'Tsy se place avant tia dans cette phrase.', [l('Tia kafe ve ianao?', 'Aimes-tu le café ?')]),
    ],
  },
], [
  choice('Mia a soif. Quelle phrase correspond ?', 'Mangetaheta aho.', ['Noana aho.', 'Reniko izy.'], [HUNGER], 'Mangetaheta exprime la soif.', [m('…', 'Mia a soif et veut le dire.')], true, 'dialogue'),
  match('Associez les quatre éléments du menu.', [['vary', 'riz'], ['mofo', 'pain'], ['rano', 'eau'], ['kafe', 'café']], [FOOD], 'Le riz et le pain sont distincts des deux boissons.', [l('« vary »', 'riz'), m('« mofo »', 'pain')]),
  e('cloze', '« Mila ___ aho. » : j’ai besoin d’eau.', ['rano'], [NEED, FOOD], 'Le besoin porte sur rano, l’eau.', [m('Mila … aho.', 'J’ai besoin d’eau.')]),
  order('Vous aimez les bananes : répondez par une phrase affirmative.', 'Tia akondro aho', [LIKE, FOOD], 'La réponse garde tia akondro, retire ve et remplace ianao par aho pour parler de soi.', [l('Tia akondro ve ianao?', 'Aimes-tu les bananes ?')]),
  choice('Vous n’aimez pas le café. Répondez.', 'Tsia, tsy tia kafe aho.', ['Eny, tia kafe aho.', 'Mila boky aho.'], [LIKE, NEG, NO], 'La réponse négative utilise tsia puis tsy.', [l('Tia kafe ve ianao?', 'Aimes-tu le café ?')], true, 'dialogue'),
  e('translate', 'Écrivez « J’ai faim. »', ['Noana aho'], [HUNGER], 'Il ne faut pas ajouter le verbe français avoir : noana suffit comme prédicat.', [m('Noana ve ianao?', 'As-tu faim ?')]),
  choice('Que demande Mia dans cet échange ?', 'De l’eau', ['Du café', 'Une banane'], [NEED, FOOD], 'Mila rano aho exprime le besoin d’eau.', [m('Mila rano aho, azafady.', 'J’ai besoin d’eau, s’il vous plaît.')], false, 'reading'),
  e('cloze', '« Tia kafe ___ ianao? » : aimes-tu le café ?', ['ve'], [LIKE, VE], 'Ve suit le groupe prédicat tia kafe.', [l('Tia kafe … ianao?', 'Aimes-tu le café ?')]),
  order('Reconstituez : « Je n’ai pas faim. »', 'Tsy noana aho', [HUNGER, NEG], 'Tsy nie l’état noana.', [m('Noana ve ianao?', 'As-tu faim ?')]),
  choice('Quelle différence entre « mila » et « tia » ?', 'Un besoin et un goût', ['Deux salutations', 'Deux liens de famille'], [NEED, LIKE], 'Mila exprime ici le besoin ; tia le goût.', [l('Mila rano aho.', 'J’ai besoin d’eau.'), m('Tia kafe aho.', 'J’aime le café.')]),
  e('translate', 'Écrivez « J’ai besoin de pain. »', ['Mila mofo aho'], [NEED, FOOD], 'Mila + mofo + aho.', [l('Mila mofo ve ianao?', 'As-tu besoin de pain ?')]),
  choice('Mia remercie. Quelle réplique correspond ?', 'Misaotra.', ['Veloma.', 'Tsia.'], ['vocab.thanks'], 'Misaotra remercie après une aide ou un service.', [l('Eny, tompoko.', 'Oui, avec respect.')], true, 'dialogue'),
], [
  ['vary', 'riz', 'Aliment cité dans le menu fictif.', FOOD], ['rano', 'eau', 'Boisson dans les scènes.', FOOD], ['mofo', 'pain', 'Le nom peut être précisé par des composés.', FOOD], ['akondro', 'banane', 'Le fruit, dans le sens retenu ici.', FOOD], ['kafe', 'café', 'Ici la boisson, pas le caféier.', FOOD],
  ['Noana aho.', 'J’ai faim.', 'Prédicat adjectival, sans avoir traduit mot à mot.', HUNGER], ['Mangetaheta aho.', 'J’ai soif.', 'Distinguer faim et soif.', HUNGER], ['mila', 'avoir besoin de', 'Les demandes de cette unité portent sur des objets ou boissons.', NEED], ['tia', 'aimer / apprécier', 'Pour un goût dans les scènes du repas.', LIKE],
]);

const numberSources = sources(7, [
  ['iray', 'Un ; place après le nom dans le modèle nominal simple.'], ['ohatrinona', 'Question sur le prix ; orthographe hoatrinona également répertoriée.'],
  ['ariary', 'Nom de l’unité monétaire ; usage ariary folo. Les valeurs de jeu ne sont pas des prix réels.'], ['vidy', 'Prix ; forme vidiny dans la question apprise entière.'],
]);
numberSources.push('w1-07-number-table', 'w1-07-current-ariary');
B.sources.push({ id: 'w1-07-number-table', title: 'Tableau lexicographique : les nombres malgaches', author: 'Dictionnaire malgache et Encyclopédie de Madagascar', url: 'https://malagasyword.org/bins/manisa', category: 'dictionary', consulted: true, supports: 'Valeurs et graphies de zéro à vingt. Iraika dans onze ; constructions avec ambin’ny folo. Les activités de comptage et le jeu d’étiquettes sont originaux.', license: 'Faits lexicographiques consultés ; aucune illustration ou table reproduite.' },
  { id: 'w1-07-current-ariary', title: 'TAHA — Taha miAntoka ny Herin’ny Ariary', author: 'Banky Foiben’i Madagasikara', url: 'https://www.banky-foibe.mg/publication/outdoor.html', category: 'geography', consulted: true, supports: 'Nom contemporain Ariary dans la publication de la banque centrale. Aucun taux de change ni prix de marché n’est enseigné ou reproduit.', license: 'Publication institutionnelle consultée ; aucune donnée financière, image ou graphique redistribué.' });
const numberWords: [string, string][] = [['aotra', 'zéro'], ['iray', 'un'], ['roa', 'deux'], ['telo', 'trois'], ['efatra', 'quatre'], ['dimy', 'cinq'], ['enina', 'six'], ['fito', 'sept'], ['valo', 'huit'], ['sivy', 'neuf'], ['folo', 'dix'], ["iraika ambin'ny folo", 'onze'], ["roa ambin'ny folo", 'douze'], ["telo ambin'ny folo", 'treize'], ["efatra ambin'ny folo", 'quatorze'], ["dimy ambin'ny folo", 'quinze'], ["enina ambin'ny folo", 'seize'], ["fito ambin'ny folo", 'dix-sept'], ["valo ambin'ny folo", 'dix-huit'], ["sivy ambin'ny folo", 'dix-neuf'], ['roapolo', 'vingt']];
addUnit(7, 'Compter et acheter', 'Ohatrinona ny vidiny?', 'Compter de zéro à vingt puis demander le montant d’une étiquette de jeu.', ['Reconnaître les nombres de zéro à vingt', 'Lire une petite quantité après un nom', 'Demander un prix sans confondre quantité et monnaie'], numberSources, [
  {
    title: 'Des objets à compter', description: 'Mia et Lova comptent les livres et les meubles.',
    concepts: [{ id: TEN, label: 'Compter de zéro à dix', category: 'vocabulary', objective: 'Associer les nombres de zéro à dix et lire une quantité après un nom.', malagasy: 'aotra · iray · roa · telo · efatra · dimy · enina · fito · valo · sivy · folo', french: 'zéro à dix' }], reviews: [H, HOUSE, VE],
    scenes: [
      sc('Les trois premières étiquettes', [l('« aotra »', 'Le nombre zéro.'), m('« iray »', 'Le nombre un.'), l('« roa »', 'Le nombre deux.')], 'aotra · iray · roa', 'zéro · un · deux'),
      sc('La suite des nombres', [m('« telo, efatra, dimy »', 'Les nombres trois, quatre, cinq.'), l('« enina, fito, valo »', 'Les nombres six, sept, huit.'), m('« sivy, folo »', 'Les nombres neuf, dix.')], 'telo → folo', 'de trois à dix'),
      sc('Les deux livres', [m('Manana boky roa aho.', 'J’ai deux livres.'), l('Manana boky roa ve ianao?', 'As-tu deux livres ?'), m('Eny.', 'Oui.')], 'boky roa', 'deux livres'),
      sc('Installer les meubles', [l('Manana seza iray aho.', 'J’ai une chaise.'), m('Manana latabatra telo aho.', 'J’ai trois tables.')], 'seza iray · latabatra telo', 'une chaise · trois tables'),
    ], notes: [{ title: 'Un et une quantité', body: 'Iray sert ici à exprimer un seul objet : seza iray. Isa peut apparaître quand on commence à compter, mais les activités retiennent iray pour les quantités. Le nom précède le nombre dans boky roa et latabatra telo.' }, { title: 'Zéro n’est pas dix', body: 'Aotra représente zéro, folo représente dix. Les mots écrits constituent des repères de lecture ; cette activité n’évalue pas une compétence orale.' }],
    tasks: [
      choice('Combien de livres Mia dit-elle avoir ?', 'Deux', ['Un', 'Trois'], [TEN, H, HOUSE], 'Boky roa signifie deux livres.', [m('Manana boky roa aho.', 'J’ai deux livres.')], false, 'reading'),
      match('Associez ces nombres aux chiffres.', [['aotra', '0'], ['iray', '1'], ['enina', '6'], ['fito', '7']], [TEN], 'Aotra vaut zéro, iray un, enina six et fito sept.', [l('« aotra »', 'zéro'), m('« enina, fito »', 'six, sept')]),
      order('Reconstituez : « J’ai une chaise. »', 'Manana seza iray aho', [TEN, H, HOUSE], 'Le nombre iray suit le nom seza.', [l('« iray »', 'un')]),
      e('cloze', 'Le nombre 5 s’écrit « ___ ».', ['dimy'], [TEN], 'Dimy correspond à cinq.', [m('« telo, efatra, dimy »', 'trois, quatre, cinq')]),
      choice('Quel nombre correspond à 8 ?', 'valo', ['sivy', 'folo'], [TEN], 'Valo vaut huit, sivy neuf, folo dix.', [l('« enina, fito, valo »', 'six, sept, huit')], true),
      e('translate', 'Écrivez le nombre 4 en malgache.', ['efatra'], [TEN], 'Efatra correspond à quatre.', [m('« telo, efatra, dimy »', 'trois, quatre, cinq')]),
    ],
  },
  {
    title: 'Jusqu’à vingt et une question de prix', description: 'Des nombres plus longs, puis des étiquettes de jeu aux montants fictifs.',
    concepts: [{ id: TWENTY, label: 'Compter de onze à vingt', category: 'vocabulary', objective: 'Lire les nombres onze à vingt, avec iraika dans onze.', prerequisites: [TEN] }, { id: PRICE, label: 'Demander un prix', category: 'communication', objective: 'Comprendre Ohatrinona ny vidiny? et reconnaître l’unité ariary.', malagasy: 'Ohatrinona ny vidiny?', french: 'Quel est le prix ?' }], reviews: [TEN, H, HOUSE],
    scenes: [
      sc('Onze, douze, treize', [l("« iraika ambin'ny folo »", 'Le nombre onze.'), m("« roa ambin'ny folo, telo ambin'ny folo »", 'Les nombres douze et treize.')], "iraika ambin'ny folo", 'onze'),
      sc('Quatorze, quinze, seize', [m("« efatra ambin'ny folo, dimy ambin'ny folo »", 'Les nombres quatorze et quinze.'), l("« enina ambin'ny folo »", 'Le nombre seize.')], "dimy ambin'ny folo", 'quinze'),
      sc('Dix-sept, dix-huit, dix-neuf, vingt', [l("« fito ambin'ny folo, valo ambin'ny folo »", 'Les nombres dix-sept et dix-huit.'), m("« sivy ambin'ny folo, roapolo »", 'Les nombres dix-neuf et vingt.')], 'roapolo', 'vingt'),
      sc('Une étiquette de jeu : un montant fictif', [m('Ohatrinona ny vidiny?', 'Quel est le prix ?'), l('Ariary folo.', 'Dix ariary.'), m('Misaotra.', 'Merci.')], 'Ohatrinona ny vidiny?', 'Quel est le prix ?'),
    ], notes: [{ title: 'Une unité avant la dizaine', body: 'Pour onze à dix-neuf, l’unité vient d’abord : roa ambin’ny folo signifie douze. Onze emploie iraika, et non iray dans la forme retenue. Vingt se dit roapolo.' }, { title: 'Des prix de jeu', body: 'Ohatrinona ny vidiny? demande le prix. Ariary nomme la monnaie. Les petites valeurs de cette activité sont des montants fictifs pour travailler les nombres jusqu’à vingt ; elles ne représentent pas les prix pratiqués à Madagascar.' }],
    tasks: [
      choice('Quelle information Mia demande-t-elle ?', 'Le prix', ['Le prénom', 'Le lieu d’origine'], [PRICE], 'Ohatrinona ny vidiny? demande un montant.', [m('Ohatrinona ny vidiny?', 'Quel est le prix ?')], false, 'reading'),
      match('Associez les grands nombres.', [["iraika ambin'ny folo", '11'], ["telo ambin'ny folo", '13'], ["efatra ambin'ny folo", '14'], ["dimy ambin'ny folo", '15']], [TWENTY], 'Chaque forme commence par l’unité ; onze utilise iraika.', [l("« iraika ambin'ny folo »", 'onze'), m('« roapolo »', 'vingt')]),
      e('translate', 'Écrivez le nombre 12 en malgache.', ["roa ambin'ny folo"], [TWENTY], 'Douze commence par roa, deux.', [l("« roa ambin'ny folo »", 'douze')]),
      e('cloze', 'Complétez l’étiquette du nombre 18 : « ___ ».', ["valo ambin'ny folo"], [TWENTY, TEN], 'Le nombre dix-huit s’écrit valo ambin’ny folo.', [m('« … »', 'Mia cherche le nom du nombre dix-huit.')]),
      order('Reconstituez le montant « dix ariary ».', 'Ariary folo', [PRICE, TEN], 'La réponse apprise place ariary avant le nombre.', [m('Ohatrinona ny vidiny?', 'Quel est le prix ?')]),
      choice('Choisissez le nom du nombre 19.', "sivy ambin'ny folo", ['sivy', 'roapolo'], [TWENTY, TEN], 'Sivy est neuf ; avec ambin’ny folo, la forme désigne dix-neuf.', [m('« … »', 'Mia cherche le nom du nombre dix-neuf.')], true),
    ],
  },
], [
  choice('Quel montant annonce Lova dans ce jeu ?', '10 ariary', ['2 ariary', '20 ariary'], [PRICE, TEN], 'Folo vaut dix ; ariary précise l’unité.', [l('Ariary folo.', 'Dix ariary.')], false, 'reading'),
  match('Associez les chiffres et les nombres.', [['roa', '2'], ['telo', '3'], ['sivy', '9'], ['folo', '10']], [TEN], 'Ces quatre noms appartiennent au groupe zéro à dix.', [m('« roa, telo, sivy, folo »', 'deux, trois, neuf, dix')]),
  e('cloze', 'Le nombre 18 : « ___ ambin’ny folo ».', ['valo'], [TWENTY, TEN], 'L’unité huit est valo.', [l('« … ambin’ny folo »', 'dix-huit')]),
  order('Dites : « J’ai deux livres. »', 'Manana boky roa aho', [TEN, H, HOUSE], 'La quantité roa vient après boky.', [m('Manana boky roa ve ianao?', 'As-tu deux livres ?')]),
  e('translate', 'Le comptage continue après 19. Écrivez le nombre suivant en malgache.', ['roapolo'], [TWENTY], 'Après dix-neuf vient vingt : roapolo.', [l("« sivy ambin'ny folo »", 'dix-neuf')]),
  choice('Demandez le prix de l’étiquette.', 'Ohatrinona ny vidiny?', ['Avy aiza ianao?', 'Iza no anaranao?'], [PRICE], 'La question sur le prix commence par ohatrinona.', [l('Ariary folo.', 'Dix ariary, montant fictif du jeu.')], true, 'dialogue'),
  choice('Quel nombre représente « aotra » ?', '0', ['1', '10'], [TEN], 'Aotra vaut zéro.', [m('« aotra »', 'zéro')]),
  order('Reconstituez la réponse « dix ariary ».', 'Ariary folo', [PRICE, TEN], 'Ariary est le nom de la monnaie, folo le nombre.', [m('Ohatrinona ny vidiny?', 'Quel est le prix ?')]),
  e('cloze', 'Complétez l’étiquette du nombre 17 : « ___ ».', ["fito ambin'ny folo"], [TWENTY], 'Dix-sept s’écrit fito ambin’ny folo.', [l('« … »', 'le nombre dix-sept')]),
  choice('Combien de tables Mia dit-elle avoir ?', 'Trois', ['Deux', 'Dix'], [TEN, H, HOUSE], 'Latabatra telo signifie trois tables.', [m('Manana latabatra telo aho.', 'J’ai trois tables.')], false, 'reading'),
  e('translate', 'Écrivez le nombre 16 en malgache.', ["enina ambin'ny folo"], [TWENTY], 'Seize s’écrit avec enina puis ambin’ny folo.', [m('« … »', 'Mia cherche le nom du nombre seize.')]),
  choice('Dans « Ariary folo », que désigne « ariary » ?', 'La monnaie', ['Le nombre dix', 'Le livre'], [PRICE], 'Folo est la valeur et ariary l’unité monétaire.', [l('Ariary folo.', 'Dix ariary.')]),
], [
  ...numberWords.map(([malagasy, french], index): [string, string, string, string] => [malagasy, french, index <= 10 ? 'Nombre de zéro à dix ; à lire après le nom pour une quantité.' : 'Nombre de onze à vingt ; forme apprise entière.', index <= 10 ? TEN : TWENTY]),
  ['Ohatrinona ny vidiny?', 'Quel est le prix ?', 'Formule entière pour demander un prix ; les montants des scènes sont fictifs.', PRICE], ['ariary', 'ariary', 'Unité monétaire ; aucune conversion ni prix réel enseigné.', PRICE],
]);
