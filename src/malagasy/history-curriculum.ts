import type { Source, World } from './types';

/** Authoring programme only: these themes do not unlock lessons or award mastery. */
export const CULTURE_CURRICULUM: Record<string, Pick<World, 'cultureTopics' | 'cultureSourceIds'>> = {
  'world-03': {
    cultureTopics: [
      'Rencontrer les Betsimisaraka : histoire de la côte orientale, échanges et diversité des parcours familiaux.',
      'Distinguer une appartenance culturelle, un lieu de résidence et une variété de malgache ; aucune identité ne résume une personne.',
    ],
    cultureSourceIds: ['ird-identities'],
  },
  'world-05': {
    cultureTopics: [
      'Découvrir les Betsileo et les Merina dans l’histoire des Hautes Terres, leurs contacts et leurs mobilités.',
      'Comprendre que les groupes culturels ont une histoire et que leurs frontières ne sont ni fixes ni des frontières administratives.',
    ],
    cultureSourceIds: ['ird-identities'],
  },
  'world-09': {
    cultureTopics: [
      'Suivre la formation du royaume sakalava du Menabe et le rôle d’Andriandahifotsy.',
      'Aborder les pouvoirs royaux, les échanges dans l’océan Indien et la traite des personnes esclavisées, sans récit héroïque simplifié.',
    ],
    cultureSourceIds: ['lombard-menabe'],
  },
  'world-10': {
    cultureTopics: [
      'Découvrir les identités vezo, mahafaly et antandroy à travers des récits situés, sans attribuer un métier ou une coutume à tous leurs membres.',
      'Comparer témoignages, mobilités et appartenances dans le Sud et le Sud-Ouest.',
    ],
    cultureSourceIds: ['ird-identities'],
  },
  'world-11': {
    cultureTopics: [
      'Relier le Menabe et le Boeny : Andriamandisoarivo, successions et formation de royaumes distincts.',
      'Observer les réseaux de la côte nord-ouest et les relations entre royautés, communautés et partenaires de l’océan Indien.',
    ],
    cultureSourceIds: ['lombard-menabe'],
  },
  'world-12': {
    cultureTopics: [
      'Situer les débarquements britanniques de 1942 contre l’administration française de Vichy et le contrôle militaire qui suit.',
      'Distinguer cet épisode de guerre du XIXe siècle et de la colonisation française ; suivre le passage à l’administration de la France libre en 1943.',
      'Écouter des points de vue malgaches sur la guerre et ses conséquences, au-delà des seuls récits militaires européens.',
    ],
    cultureSourceIds: ['bordeles-1942-1947', 'nam-madagascar-1942'],
  },
  'world-15': {
    cultureTopics: [
      'Andrianampoinimerina et la consolidation de l’Imerina ; Radama Ier et l’expansion du royaume : pouvoirs, conquêtes et limites de leur contrôle.',
      'Comparer les règnes de Ranavalona Ire, Radama II, Rasoherina, Ranavalona II et Ranavalona III : choix politiques, réformes, religions et résistances.',
      'Distinguer les souveraines du Premier ministre Rainilaiarivony et comprendre les acteurs du gouvernement royal.',
      'Étudier le traité de 1817, l’appui britannique, les missions et l’école, ainsi que les rivalités franco-britanniques au XIXe siècle.',
      'Relier Ambohimanga aux autres royaumes et aux populations confrontées à l’expansion merina ; distinguer mémoire royale et histoire de toute l’île.',
    ],
    cultureSourceIds: ['unesco-ambohimanga', 'unesco-ambohimanga-dossier', 'paillard-christianisation', 'ayache-europe', 'enssib-sovereigns', 'lombard-menabe'],
  },
  'world-17': {
    cultureTopics: [
      'Suivre les étapes de la conquête française, de l’annexion de 1896 à l’abolition de la monarchie et à l’exil de Ranavalona III en 1897.',
      'Aborder les résistances, la violence de la conquête, le travail forcé et les inégalités du système colonial.',
      'Comparer un document colonial et un témoignage malgache en identifiant auteur, intérêts, silences et vocabulaire.',
    ],
    cultureSourceIds: ['enssib-sovereigns', 'unesco-ambohimanga-dossier', 'jennings-vichy', 'bnf-colonisation'],
  },
  'world-18': {
    cultureTopics: [
      'Étudier le nationalisme malgache et le MDRM, puis l’insurrection de 1947 et la répression française de 1947–1948.',
      'Distinguer les faits établis, les témoignages et les débats sur les bilans humains, sans présenter un chiffre contesté comme une certitude.',
      'Raconter les parcours de personnes et les mémoires régionales de la décolonisation avec des documents contextualisés.',
    ],
    cultureSourceIds: ['bordeles-1942-1947', 'archives-independence'],
  },
  'world-19': {
    cultureTopics: [
      'Relier les mouvements politiques, les négociations et la proclamation de l’indépendance du 26 juin 1960 ; aborder les accords et héritages de la décolonisation.',
      'Depuis Maroantsetra, croiser histoires locales de la côte orientale et histoire nationale, sans confondre lieu de la rencontre et lieu des événements.',
      'Revenir sur les ethnies et groupes culturels : Betsimisaraka, Betsileo, Merina, Sakalava, Tsimihety, Antakarana, Antemoro, Antaisaka, Tanala, Bara, Vezo, Mahafaly, Antandroy et Antanosy, entre autres.',
      'Interroger le classement courant en « dix-huit ethnies » : héritages politiques et coloniaux, diversité interne, migrations et identifications choisies.',
    ],
    cultureSourceIds: ['archives-independence', 'ird-identities'],
  },
  'world-20': {
    cultureTopics: [
      'Construire une frise reliant royaumes, relations britanniques, colonisation française, guerre de 1942, décolonisation et indépendance.',
      'Présenter un récit historique argumenté en distinguant faits, sources, mémoires et incertitudes ; relier plusieurs régions et groupes culturels.',
    ],
    cultureSourceIds: ['ayache-europe', 'bordeles-1942-1947', 'archives-independence', 'ird-identities'],
  },
};

const consulted = 'Recherche du 28 octobre 2026';
const rights = 'Référence consultée pour des synthèses et un programme originaux ; aucun texte long, photographie ou document redistribué.';
export const HISTORY_SOURCES: Source[] = [
  {
    id: 'unesco-ambohimanga-dossier', title: 'Ambohimanga — dossier de candidature et évaluation ICOMOS',
    author: 'État malgache, ICOMOS et Centre du patrimoine mondial de l’UNESCO',
    url: 'https://whc.unesco.org/uploads/nominations/950.pdf', category: 'history', consulted: true, date: 'Inscription 2001 ; ' + consulted,
    supports: 'Évaluation ICOMOS consultée : développement de la cité royale, Ranavalona Ire, transformation coloniale des tombeaux en 1897 et maintien des pratiques mémorielles. Ne résume pas toute l’histoire de Madagascar.', license: rights,
  },
  {
    id: 'enssib-sovereigns', title: 'L’iconographie des souverains malgaches à travers les sources françaises',
    author: 'Tsimaholy, sous la direction de Jean-François Maurel — École nationale supérieure des bibliothèques',
    url: 'https://www.enssib.fr/bibliotheque-numerique/documents/63110-l-iconographie-des-souverains-malgaches-a-travers-les-sources-francaises.pdf',
    category: 'history', consulted: true, date: '1981 ; ' + consulted,
    supports: 'Introduction et inventaire consultés : succession des souverains de Radama Ier à Ranavalona III, identification critique des portraits, notamment les confusions Ranavalona II/III. Référence ancienne au cadrage à contextualiser.', license: rights,
  },
  {
    id: 'paillard-christianisation', title: 'Singularités de la christianisation de Madagascar au XIXe siècle',
    author: 'Yvan-Georges Paillard, note critique sur Bible et pouvoir de Françoise Raison-Jourde — Revue française d’histoire d’outre-mer',
    url: 'https://www.persee.fr/doc/outre_0300-9513_1992_num_79_297_3056', category: 'history', consulted: true, date: '1992 ; ' + consulted,
    supports: 'Note critique et extraits consultés : construction du pouvoir, expansion merina, relations britanniques, école et christianisation. Le livre de Raison-Jourde n’a pas été lu intégralement pour cette mise à jour.', license: rights,
  },
  {
    id: 'ayache-europe', title: 'La découverte de l’Europe par les Malgaches au XIXe siècle',
    author: 'Simon Ayache — Revue française d’histoire d’outre-mer',
    url: 'https://www.persee.fr/doc/outre_0300-9513_1986_num_73_270_2506', category: 'history', consulted: true, date: '1986 ; ' + consulted,
    supports: 'Relations de Radama Ier avec Farquhar, traité de 1817, appui matériel britannique et missions. Distingue alliance, influence et souveraineté ; ne décrit pas une colonie britannique au XIXe siècle.', license: rights,
  },
  {
    id: 'lombard-menabe', title: 'Le royaume sakalava du Menabe : essai d’analyse d’un système politique à Madagascar, XVIIe–XXe',
    author: 'Jacques Lombard — ORSTOM, Travaux et documents n° 214',
    url: 'https://horizon.documentation.ird.fr/exl-doc/pleins_textes/pleins_textes_5/pt5/travaux_d/25455.pdf', category: 'history', consulted: true, date: '1988, recherche de 1969–1973 ; ' + consulted,
    supports: 'Extraits indexés consultés sur les royaumes sakalava, Andriandahifotsy, Andriamandisoarivo et leurs échanges. Accès direct IRD temporairement en maintenance lors de la recherche ; aucune lecture intégrale revendiquée.', license: rights,
  },
  {
    id: 'bnf-colonisation', title: 'Madagascar sous la colonisation française de 1896 à 1960 — notice critique',
    author: 'BnF, Takam Tikou ; ouvrage de l’historien Lalasoa Jeannot Rasoloarison, Éditions Jeunes Malgaches',
    url: 'https://takamtikou.bnf.fr/bibliographies/notices/ocean-indien/madagascar-sous-la-colonisation-francaise-de-1896-1960', category: 'history', consulted: true, date: 'Ouvrage 2013, notice 2014 ; ' + consulted,
    supports: 'Notice lue pour le périmètre chronologique de la colonisation et la piste d’un ouvrage malgache. Le livre lui-même reste une lecture complémentaire, pas une source prétendument lue.', license: rights,
  },
  {
    id: 'jennings-vichy', title: 'Vichy à Madagascar. La « Révolution nationale », l’enseignement et la jeunesse, 1940–1942',
    author: 'Eric T. Jennings — Revue d’histoire moderne et contemporaine',
    url: 'https://www.persee.fr/doc/rhmc_0048-8003_1999_num_46_4_1989', category: 'history', consulted: true, date: '1999 ; ' + consulted,
    supports: 'Extraits consultés sur la domination coloniale, le travail forcé sous Vichy et le contexte des opérations britanniques de 1942.', license: rights,
  },
  {
    id: 'nam-madagascar-1942', title: 'Majunga, 10 septembre 1942 — notice de collection',
    author: 'National Army Museum, Londres',
    url: 'https://collection.nam.ac.uk/detail.php?acc=2002-06-6--24', category: 'history', consulted: true, date: consulted,
    supports: 'Notice institutionnelle lue : débarquements alliés contre Madagascar sous contrôle de Vichy à partir du 5 mai 1942. La photographie n’est pas reprise.', license: rights,
  },
  {
    id: 'bordeles-1942-1947', title: 'FR ANOM 41HCM : Dommages et indemnisations de l’entre-deux-guerres malgache, 1942–1947',
    author: 'Fabien Bordelès — Tsingy, Université de La Réunion',
    url: 'https://tsingy.univ-reunion.fr/592', category: 'history', consulted: true, date: consulted,
    supports: 'Article et description des archives consultés : occupation britannique, transfert à la France libre, MDRM, insurrection et répression de 1947–1948. Distinguer les archives inventoriées des documents originaux qui restent à examiner.', license: rights,
  },
  {
    id: 'archives-independence', title: 'Tananarive, ambassade, 1897–1985 — inventaire 673PO/1',
    author: 'Centre des archives diplomatiques de Nantes, ministère de l’Europe et des Affaires étrangères',
    url: 'https://archivesdiplomatiques.diplomatie.gouv.fr/media/f765b784-5e3e-4f3c-8b54-9a2089f2f4cf.pdf', category: 'history', consulted: true, date: 'Inventaire mis à jour en 2020 ; ' + consulted,
    supports: 'Extraits indexés de l’inventaire consultés, notamment articles 62–64 : mouvements, négociations et proclamation de l’indépendance le 26 juin 1960, puis coopération. Accès direct temporairement en maintenance ; les cartons eux-mêmes n’ont pas été lus.', license: rights,
  },
  {
    id: 'ird-identities', title: 'Madagascar après la tourmente — « Des peuples anciens aux ethnies actuelles »',
    author: 'Afrique contemporaine, dossier coordonné par François Roubaud, conservé par l’IRD',
    url: 'https://horizon.documentation.ird.fr/exl-doc/pleins_textes/doc34-08/010029705.pdf', category: 'history', consulted: true, date: '2002 ; ' + consulted,
    supports: 'Extraits indexés consultés : groupes nommés, histoires politiques et culturelles, limites du nombre conventionnel de dix-huit ethnies et des cartes figées. Accès direct IRD temporairement en maintenance ; aucune enquête ethnographique actuelle revendiquée.', license: rights,
  },
];

