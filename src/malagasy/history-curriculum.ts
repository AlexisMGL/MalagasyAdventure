import type { Source, World } from './types';

/** Cultural thread from world 1 onwards; future worlds remain authoring plans. */
export const CULTURE_CURRICULUM: Record<string, Pick<World, 'culture' | 'cultureTopics' | 'cultureSourceIds'>> = {
  'world-01': {
    "culture": "Antananarivo : premiers repères sur les royaumes, les souverains et les identités des Hautes Terres.",
    "cultureTopics": [
      "Situer Andrianampoinimerina et Radama Ier dans une première frise des souverains, avec Antananarivo et Ambohimanga comme repères.",
      "Découvrir les Merina parmi les groupes culturels de Madagascar ; distinguer langue standard, région et appartenance personnelle.",
      "Poser dès le départ les repères du voyage historique : royaumes, relations européennes, colonisation puis indépendance, qui seront repris au fil des mondes."
    ],
    "cultureSourceIds": [
      "unesco-ambohimanga-dossier",
      "ird-identities",
      "ayache-europe",
      "archives-independence"
    ]
  },
  'world-02': {
    "culture": "Radama Ier, les relations britanniques et les transformations du royaume au XIXe siècle.",
    "cultureTopics": [
      "Reprendre Radama Ier et étudier le traité de 1817 avec les Britanniques : appui extérieur, objectifs des partenaires et souveraineté du royaume.",
      "Découvrir le rôle des missions et de l’école, puis distinguer influence britannique et colonisation.",
      "Présenter ces repères nationaux depuis une rencontre à Antsirabe, sans faire de la ville le lieu de tous les événements évoqués."
    ],
    "cultureSourceIds": [
      "ayache-europe",
      "paillard-christianisation"
    ]
  },
  'world-03': {
    "culture": "Betsimisaraka, échanges de la côte orientale et rivalités européennes.",
    "cultureTopics": [
      "Rencontrer les Betsimisaraka : histoire de la côte orientale, échanges et diversité des parcours familiaux.",
      "Introduire les rivalités françaises et britanniques au XIXe siècle et les intérêts des acteurs malgaches dans les échanges extérieurs.",
      "Distinguer une appartenance culturelle, un lieu de résidence et une variété de malgache ; aucune identité ne résume une personne."
    ],
    "cultureSourceIds": [
      "ird-identities",
      "ayache-europe"
    ]
  },
  'world-04': {
    "culture": "Ranavalona Ire : pouvoir royal, relations extérieures, religions et école.",
    "cultureTopics": [
      "Découvrir le règne de Ranavalona Ire après Radama Ier : décisions du pouvoir royal, religions, école et rapports avec les Européens.",
      "Comparer les points de vue sur ce règne et les intérêts de leurs auteurs, plutôt que réduire une souveraine à une étiquette.",
      "Réutiliser la frise commencée au monde 1 et distinguer une rencontre fictive à Andasibe des lieux des événements historiques."
    ],
    "cultureSourceIds": [
      "paillard-christianisation",
      "enssib-sovereigns",
      "unesco-ambohimanga-dossier"
    ]
  },
  'world-05': {
    "culture": "Betsileo et Merina ; Radama II, Rasoherina et les changements de gouvernement.",
    "cultureTopics": [
      "Découvrir les Betsileo et les Merina dans l’histoire des Hautes Terres, leurs contacts et leurs mobilités.",
      "Introduire Radama II et Rasoherina dans la suite des règnes ; distinguer succession royale et transformations du gouvernement.",
      "Relier l’expansion du royaume aux perspectives des populations concernées, sans confondre histoire de l’Imerina et histoire de toute l’île."
    ],
    "cultureSourceIds": [
      "ird-identities",
      "enssib-sovereigns",
      "paillard-christianisation"
    ]
  },
  'world-06': {
    "culture": "Ranavalona II et Rainilaiarivony : souveraine, gouvernement et transformations religieuses.",
    "cultureTopics": [
      "Présenter Ranavalona II et distinguer son rôle de celui du Premier ministre Rainilaiarivony.",
      "Poursuivre les rapports entre pouvoir, christianisation et école déjà rencontrés aux mondes 2 et 4.",
      "Comparer un portrait royal et un document de gouvernement : qui est représenté, qui décide et quelle source permet de le dire ?"
    ],
    "cultureSourceIds": [
      "enssib-sovereigns",
      "paillard-christianisation"
    ]
  },
  'world-07': {
    "culture": "Ranavalona III, conquête française et fin de la monarchie : les premiers repères coloniaux.",
    "cultureTopics": [
      "Découvrir Ranavalona III, puis situer la conquête française, l’annexion de 1896 et l’abolition de la monarchie en 1897.",
      "Relier l’exil de la souveraine aux transformations de la souveraineté ; compléter la frise des règnes commencée au monde 1.",
      "Introduire les résistances à la conquête et la diversité des expériences malgaches ; les conséquences coloniales seront reprises dès le monde suivant.",
      "Rencontrer aussi les Tanala dans la découverte des histoires de l’Est, sans déduire l’identité d’une personne de son lieu de résidence."
    ],
    "cultureSourceIds": [
      "enssib-sovereigns",
      "unesco-ambohimanga-dossier",
      "bnf-colonisation",
      "ird-identities"
    ]
  },
  'world-08': {
    "culture": "Vie sous la colonisation française : travail, déplacements, inégalités et résistances.",
    "cultureTopics": [
      "Aborder le travail forcé, les rapports de pouvoir et les inégalités du système colonial à partir de situations documentées.",
      "Comparer un récit administratif et un témoignage malgache sur le travail ou les déplacements ; identifier leurs intérêts et leurs silences.",
      "Découvrir les Antemoro et les Antaisaka dans le Sud-Est ; distinguer leur histoire des catégories employées par les administrations."
    ],
    "cultureSourceIds": [
      "jennings-vichy",
      "bnf-colonisation",
      "ird-identities"
    ]
  },
  'world-09': {
    "culture": "Menabe : royaumes sakalava, Andriandahifotsy et échanges dans l’océan Indien.",
    "cultureTopics": [
      "Suivre la formation du royaume sakalava du Menabe et le rôle d’Andriandahifotsy.",
      "Aborder les pouvoirs royaux, les échanges dans l’océan Indien et la traite des personnes esclavisées, sans récit héroïque simplifié.",
      "Comparer ce parcours régional aux souverains des Hautes Terres déjà rencontrés : plusieurs histoires politiques coexistent dans l’île."
    ],
    "cultureSourceIds": [
      "lombard-menabe",
      "ird-identities"
    ]
  },
  'world-10': {
    "culture": "Identités du Sud et du Sud-Ouest : Vezo, Mahafaly, Antandroy, Bara et Antanosy.",
    "cultureTopics": [
      "Découvrir ces groupes culturels à travers des récits situés, sans attribuer un métier ou une coutume à tous leurs membres.",
      "Comparer les appellations, les mobilités et les appartenances ; distinguer identifications vécues et catégories administratives ou coloniales.",
      "Reprendre les conséquences de la domination coloniale depuis plusieurs perspectives régionales, sans supposer une expérience identique pour tous."
    ],
    "cultureSourceIds": [
      "ird-identities",
      "bnf-colonisation"
    ]
  },
  'world-11': {
    "culture": "Boeny : Andriamandisoarivo, royaumes sakalava et réseaux de la côte nord-ouest.",
    "cultureTopics": [
      "Relier le Menabe et le Boeny : Andriamandisoarivo, successions et formation de royaumes distincts.",
      "Observer les relations entre royautés, communautés et partenaires de l’océan Indien ; comparer avec les contacts extérieurs déjà étudiés.",
      "Revenir sur les histoires sakalava et leurs diversités locales, sans transformer les groupes culturels en territoires figés."
    ],
    "cultureSourceIds": [
      "lombard-menabe",
      "ird-identities",
      "ayache-europe"
    ]
  },
  'world-12': {
    "culture": "1942 : intervention et occupation britanniques contre Vichy, puis passage à la France libre.",
    "cultureTopics": [
      "Situer les débarquements britanniques de 1942 contre l’administration française de Vichy et le contrôle militaire qui suit.",
      "Distinguer cette occupation des relations britanniques du XIXe siècle déjà vues au monde 2 et de la colonisation française ; suivre le passage à la France libre en 1943.",
      "Croiser les récits militaires avec les conséquences pour les habitants et les points de vue malgaches ; rencontrer aussi les Antakarana en distinguant appartenances et récits militaires."
    ],
    "cultureSourceIds": [
      "bordeles-1942-1947",
      "nam-madagascar-1942",
      "jennings-vichy",
      "ird-identities"
    ]
  },
  'world-13': {
    "culture": "Nationalisme, revendications politiques et MDRM : entrer dans la décolonisation.",
    "cultureTopics": [
      "Introduire les mouvements nationalistes et le MDRM dans le contexte colonial déjà étudié.",
      "Examiner les revendications, les projets politiques et les rapports de pouvoir : comment l’avenir du pays est-il discuté ?",
      "Relier cette séquence nationale à la frise et aux histoires régionales, sans situer artificiellement tous ces événements à Nosy Be."
    ],
    "cultureSourceIds": [
      "bordeles-1942-1947",
      "archives-independence"
    ]
  },
  'world-14': {
    "culture": "1947–1948 : insurrection, répression française et mémoires de la décolonisation.",
    "cultureTopics": [
      "Étudier l’insurrection de 1947 et la répression française de 1947–1948, après les revendications politiques du monde 13.",
      "Distinguer les faits établis, les témoignages et les débats sur les bilans humains ; attribuer les chiffres controversés.",
      "Interroger les conséquences pour les habitants et les mémoires régionales ; rencontrer aussi les Tsimihety, sans réduire un groupe culturel à une expérience ou à un événement."
    ],
    "cultureSourceIds": [
      "bordeles-1942-1947",
      "archives-independence",
      "ird-identities"
    ]
  },
  'world-15': {
    "culture": "Ambohimanga : approfondir et confronter les histoires royales déjà rencontrées au début du voyage.",
    "cultureTopics": [
      "Reprendre les souverains introduits aux mondes 1 à 7 et relier les règnes aux lieux, objets et pratiques de mémoire d’Ambohimanga.",
      "Comparer mémoire royale, expansion merina et histoires des autres royaumes étudiés aux mondes 9 et 11.",
      "Approfondir la lecture des sources et les changements de pouvoir ; cette escale ne sert plus de première présentation de tous les souverains."
    ],
    "cultureSourceIds": [
      "unesco-ambohimanga",
      "unesco-ambohimanga-dossier",
      "enssib-sovereigns",
      "lombard-menabe"
    ]
  },
  'world-16': {
    "culture": "1960 : négociations, indépendance et transformations de la souveraineté.",
    "cultureTopics": [
      "Relier les mouvements politiques déjà rencontrés, les négociations et la proclamation de l’indépendance le 26 juin 1960.",
      "Examiner les accords et les continuités après l’indépendance ; distinguer un changement de statut des transformations de la vie quotidienne.",
      "Compléter la frise nationale et ouvrir une discussion sur les choix collectifs, à approfondir avec des documents situés."
    ],
    "cultureSourceIds": [
      "archives-independence",
      "bordeles-1942-1947"
    ]
  },
  'world-17': {
    "culture": "Tôlanaro : confronter les perspectives régionales sur royaumes, colonisation et indépendance.",
    "cultureTopics": [
      "Reprendre les Antanosy, déjà rencontrés au monde 10, et croiser appartenances, mobilités et récits du Sud-Est.",
      "Comparer des points de vue sur les pouvoirs royaux, la domination française et l’indépendance désormais connues.",
      "Reformuler un même événement en identifiant qui parle, ce qui est mis en avant et ce que les sources ne permettent pas de conclure."
    ],
    "cultureSourceIds": [
      "ird-identities",
      "bnf-colonisation",
      "archives-independence"
    ]
  },
  'world-18': {
    "culture": "Sainte-Marie : témoignages, récits familiaux et mémoires des périodes déjà étudiées.",
    "cultureTopics": [
      "Construire un récit suivi reliant la guerre de 1942, les événements de 1947 et l’indépendance, déjà introduits aux mondes 12, 14 et 16.",
      "Comparer témoignage, archive et mémoire familiale ; distinguer une expérience personnelle d’une explication de toute l’île.",
      "Rapporter des points de vue différents en les attribuant, sans effacer les violences coloniales ni inventer une mémoire commune à tous."
    ],
    "cultureSourceIds": [
      "bordeles-1942-1947",
      "archives-independence",
      "ird-identities"
    ]
  },
  'world-19': {
    "culture": "Maroantsetra : histoires locales, identités et héritages dans le Madagascar contemporain.",
    "cultureTopics": [
      "Retrouver les Betsimisaraka déjà rencontrés au monde 3 et croiser leurs histoires avec celles des Tsimihety, des Antakarana et d’autres groupes évoqués dans le voyage.",
      "Revenir sur le classement en « dix-huit ethnies » : histoire des catégories, diversité interne, migrations et identifications choisies.",
      "Discuter des héritages des royaumes, de la colonisation et de l’indépendance depuis Maroantsetra ; aucun de ces grands sujets n’est introduit ici pour la première fois."
    ],
    "cultureSourceIds": [
      "ird-identities",
      "archives-independence"
    ]
  },
  'world-20': {
    "culture": "Un bilan historique et culturel reliant les repères rencontrés pendant tout le voyage.",
    "cultureTopics": [
      "Construire une frise cumulative des souverains, relations britanniques, colonisation française, guerre de 1942, décolonisation et indépendance.",
      "Relier plusieurs régions et groupes culturels dans un récit argumenté ; distinguer faits, sources, mémoires et incertitudes.",
      "Réinvestir les repères déjà rencontrés et identifier les questions à poursuivre ; cette étape est une synthèse plutôt qu’un dernier bloc de notions nouvelles."
    ],
    "cultureSourceIds": [
      "ayache-europe",
      "bordeles-1942-1947",
      "archives-independence",
      "ird-identities"
    ]
  },
};

const consulted = 'Recherche du 28 octobre 2026';
const rights = 'Référence consultée pour des synthèses et un programme originaux ; aucun texte long, photographie ou document redistribué.';
export const HISTORY_SOURCES: Source[] = [
  {
    id: 'fnl-madagascar-1817', title: 'Voyages to Madagascar — présentation du manuscrit de Thomas Locke Lewis',
    author: 'Friends of the National Libraries / Foyle Special Collections Library, King’s College London',
    url: 'https://grants.fnl.org.uk/voyages-madagascar', category: 'history', consulted: true, date: 'Consulté le 30 octobre 2026',
    supports: 'Notice du manuscrit de la mission de 1817 : rôle de Maurice, intérêts britanniques, négociation avec Radama et reconnaissance diplomatique. La notice est lue ; le manuscrit entier n’est pas prétendu consulté.', license: rights,
  },
  {
    id: 'cambridge-abolition-africa', title: 'The Abolition of Slavery in Africa’s Legal Histories',
    author: 'Law and History Review — Cambridge University Press',
    url: 'https://www.cambridge.org/core/journals/law-and-history-review/article/abolition-of-slavery-in-africas-legal-histories/47A74EA1672DB9EF11881137DB43796A',
    category: 'history', consulted: true, date: 'Consulté le 30 octobre 2026',
    supports: 'Passages sur les proclamations de Radama de 1817 et 1820, les articles de 1823 et les limites de l’abolition de la traite. Appuie la distinction entre interdiction d’exporter des captifs et disparition de l’esclavage.', license: rights,
  },
  {
    id: 'larson-translation', title: 'Promiscuous Translation: Working the Word at Antananarivo', author: 'Pier M. Larson, historien, Johns Hopkins University',
    url: 'https://www.malagasyword.org/bins/articles?a=larson.promiscuous&t=article', category: 'history', consulted: true, date: 'Consulté le 30 octobre 2026',
    supports: 'Article de recherche consulté : pratiques de traduction, objectifs missionnaires, apprentissages et collaborations à Antananarivo. Appuie le rôle actif des locuteurs et élèves malgaches.', license: rights,
  },
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

