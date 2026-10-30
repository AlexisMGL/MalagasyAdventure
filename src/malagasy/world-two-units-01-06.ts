import { addWorldTwoUnit as add, addWorldTwoWords as words, worldTwoBundle, W2_PC, w2Dictionary, l, m, sc, choose, reply, order, cloze, translate, match, task } from './world-two-authoring';

/** Original short scenes, based on the consulted lexicon and sentence models. */
export const WORLD_TWO_FIRST_HALF = worldTwoBundle();
const B = WORLD_TWO_FIRST_HALF;
const C = {
  day: 'w2.day-parts', now: 'w2.present-time', sleep: 'w2.wake-sleep', clock: 'w2.clock-hours', ask: 'w2.ask-time',
  meal: 'w2.eat-drink', study: 'w2.work-study', objects: 'w2.table-objects',
};
const OLD = { person: 'grammar.singular-pronouns', predicate: 'grammar.predicate-first', article: 'grammar.article-ny',
  negation: 'grammar.negation-tsy', question: 'grammar.question-ve', yes: 'vocab.yes', no: 'vocab.no',
  family: 'w1.family', possession: 'w1.family-possession', house: 'w1.house', location: 'w1.location',
  food: 'w1.food', hunger: 'w1.hunger-thirst', need: 'w1.need', like: 'w1.like', numbers: 'w1.numbers-ten', have: 'w1.have',
};
const definition = (id: string, label: string, objective: string, malagasy: string, category: 'vocabulary' | 'grammar' | 'communication' = 'communication') => ({ id, label, objective, malagasy, category });
const dictionary = (word: string, supports: string): string => {
  const source = w2Dictionary(word, supports); B.sources.push(source); return source.id;
};
const daySources = [W2_PC,
  dictionary('maraina', 'Le matin ; emplois temporels sans transformer les repères en horaires rigides.'),
  dictionary('antoandro', 'Le plein jour, la partie médiane de la journée ; ne signifie pas systématiquement midi pile.'),
  dictionary('hariva', 'Fin d’après-midi ou soir selon le contexte ; le jeu retient soir pour opposer ses vignettes.'),
  dictionary('alina', 'La nuit, distincte de l’homonyme numérique dix mille qui n’est pas enseigné ici.'),
  dictionary('izao', 'Emploi au moment où l’on parle, notamment dans les formulations temporelles.'),
];
add(B, 1, 'Les moments d’une journée', 'Maraina izao.', 'Quatre vignettes fictives pour situer le moment présent.',
  ['Reconnaître quatre moments de la journée', 'Distinguer le moment actuel d’une habitude', 'Réutiliser les descriptions simples'], daySources, [
    {
      title: 'Le jour change de lumière', description: 'Mia et Lova observent quatre vignettes de la même maison.',
      concepts: [definition(C.day, 'Matin, plein jour, soir, nuit', 'Reconnaître maraina, antoandro, hariva et alina.', 'maraina · antoandro · hariva · alina', 'vocabulary'), definition(C.now, 'Le moment présent', 'Comprendre izao dans les phrases du moment présent.', 'izao', 'grammar')],
      reviews: [OLD.predicate, OLD.person, OLD.hunger],
      scenes: [
        sc('La lumière du matin entre dans la maison', [l('Maraina izao.', 'C’est le matin maintenant.', 'Maraina'), m('Salama!', 'Bonjour !')], 'Maraina izao.', 'Le matin, au moment où l’on parle.'),
        sc('Une vignette en plein jour', [m('Antoandro izao.', 'C’est le plein jour maintenant.', 'Antoandro'), l('Noana aho.', 'J’ai faim.')], 'antoandro', 'Le plein jour, ici vers la mi-journée.'),
        sc('Les personnages regardent la lumière du soir', [l('Hariva izao.', 'C’est le soir maintenant.', 'Hariva'), m('Reraka aho.', 'Je suis fatiguée.')], 'hariva', 'Le soir dans cette vignette.'),
        sc('La dernière vignette montre la nuit', [m('Alina izao.', 'C’est la nuit maintenant.', 'Alina'), l('Veloma!', 'Au revoir !')], 'alina', 'La nuit.'),
      ],
      notes: [{ title: 'Un mot, un moment', body: 'Maraina désigne le matin, antoandro le plein jour ou la mi-journée, hariva la fin d’après-midi ou le soir et alina la nuit. Les dessins du jeu les opposent sans fixer de frontières horaires universelles.' }, { title: 'Le présent de la scène', body: 'Izao renvoie ici au moment où l’on parle. Ces descriptions ne racontent ni hier ni demain.', example: 'Maraina izao.', translation: 'C’est le matin maintenant.' }],
      tasks: [
        choose('Le soleil vient de se lever dans la vignette. Quel mot convient ?', 'maraina', ['alina', 'hariva'], [C.day], 'Maraina désigne le matin.', { selectionLanguage: 'mg' }),
        match('Reliez chaque moment à son repère.', [['maraina', 'matin'], ['antoandro', 'plein jour / mi-journée'], ['hariva', 'soir'], ['alina', 'nuit']], [C.day], 'Les quatre mots servent à situer les vignettes.'),
        choose('Que précise izao dans la phrase ?', 'Le moment où l’on parle', ['Un lieu', 'Le prénom'], [C.now], 'Izao précise ici le moment présent.', { dialogue: [l('Hariva izao.', 'C’est le soir maintenant.')] }),
        cloze('La vignette montre la nuit : « ___ izao. »', 'Alina', [C.day, C.now], 'Alina est le repère de nuit.'),
        order('Annonce que c’est le matin maintenant.', 'Maraina izao', [C.day, C.now], 'Le moment maraina est annoncé avec izao.'),
        choose('À quelle vignette associer cette phrase ?', 'Au soir', ['Au matin', 'À la nuit'], [C.day], 'Hariva situe ici le soir.', { dialogue: [m('Hariva izao.', 'C’est le soir maintenant.')] }),
      ],
    },
    {
      title: 'Ce qui est vrai maintenant', description: 'On ne confond plus le moment de la scène et ce que ressent la personne.', concepts: [],
      reviews: [C.day, C.now, OLD.location, OLD.negation, OLD.question, OLD.need],
      scenes: [
        sc('Mia vérifie la vignette du matin', [m('Maraina ve izao?', 'Est-ce le matin maintenant ?'), l('Eny, maraina izao.', 'Oui, c’est le matin maintenant.')], 'Maraina ve izao?', 'Vérifier le moment de la scène.'),
        sc('Le livre est posé près des personnages', [l('Eto ny boky izao.', 'Le livre est ici maintenant.'), m('Eny.', 'Oui.')], 'Eto ny boky izao.', 'Le lieu est ici ; le moment est maintenant.'),
        sc('La faim de Mia a changé dans une autre vignette', [m('Tsy noana aho izao.', 'Je n’ai pas faim maintenant.'), l('Mangetaheta ve ianao?', 'As-tu soif ?')], 'Tsy noana aho izao.', 'Un état nié, au moment présent.'),
        sc('Lova demande de l’eau dans le jeu', [l('Mila rano aho izao, azafady.', 'J’ai besoin d’eau maintenant, s’il vous plaît.'), m('Eny, tompoko.', 'Oui, avec respect.')], 'izao', 'Maintenant, pas tous les jours.'),
      ],
      notes: [{ title: 'Un repère court', body: 'Izao peut accompagner un état ou une localisation déjà connus. Il n’exprime pas à lui seul une routine quotidienne. Les exemples de cette partie restent au présent.' }],
      tasks: [
        reply('La vignette montre le matin. Confirme le moment.', 'Eny, maraina izao.', ['Tsia, alina izao.', 'Mia no anarako.'], [C.day, C.now, OLD.yes], 'Vous confirmez le matin montré.', [l('Maraina ve izao?', 'Est-ce le matin maintenant ?')]),
        choose('Que localise Lova ?', 'Un livre', ['Une famille', 'Le soir'], [OLD.house, OLD.location, C.now], 'Ny boky désigne le livre.', { dialogue: [l('Eto ny boky izao.', 'Le livre est ici maintenant.')] }),
        cloze('Ajoute « maintenant » : « Tsy noana aho ___. »', 'izao', [C.now, OLD.negation], 'Izao situe cet état au moment où l’on parle.'),
        translate('Écris que tu n’as pas faim.', 'Tsy noana aho', [OLD.negation, OLD.hunger], 'Tsy se place devant noana.'),
        choose('Le personnage dit-il avoir faim ?', 'Non', ['Oui', 'Il donne une heure'], [OLD.negation, C.now], 'Tsy nie l’état noana.', { dialogue: [m('Tsy noana aho izao.', 'Je n’ai pas faim maintenant.')] }),
        match('Relie l’information au bon repère.', [['eto', 'ici : un lieu'], ['izao', 'maintenant : un moment'], ['maraina', 'matin : une partie du jour']], [C.day, C.now, OLD.location], 'Un lieu et un moment ne répondent pas à la même question.'),
      ],
    },
  ], [
    choose('Quel mot correspond à une vignette de nuit ?', 'alina', ['maraina', 'hariva'], [C.day], 'Alina désigne la nuit.', { selectionLanguage: 'mg' }),
    translate('Annonce que c’est le soir maintenant.', 'Hariva izao', [C.day, C.now], 'Hariva situe le soir ; izao, le présent.'),
    cloze('« ___ izao. » : c’est le plein jour.', 'Antoandro', [C.day], 'Antoandro désigne ici le plein jour.'),
    choose('Quel mot situe le moment où l’on parle ?', 'izao', ['eto', 'boky'], [C.now], 'Izao est ici le repère du présent.', { selectionLanguage: 'mg' }),
    order('Annonce que c’est la nuit maintenant.', 'Alina izao', [C.day, C.now], 'Le repère de nuit précède izao.'),
    match('Associe les trois moments.', [['maraina', 'matin'], ['hariva', 'soir'], ['alina', 'nuit']], [C.day], 'Distinguez les moments, sans les réduire à une heure fixe.'),
    choose('Quel type d’information apporte eto ?', 'Un lieu', ['Un prix', 'Un moment'], [OLD.location], 'Eto situe ici.'),
    translate('Tu veux de l’eau : exprime ce besoin poliment.', 'Mila rano aho, azafady', [OLD.need], 'Mila rano aho exprime le besoin ; azafady la politesse.'),
    cloze('Nier la faim : « ___ noana aho. »', 'Tsy', [OLD.negation, OLD.hunger], 'Tsy précède le prédicat.'),
    choose('À quel moment de la journée correspond l’annonce de Lova ?', 'Le matin', ['Le soir', 'La nuit'], [C.day], 'Maraina nomme le matin.', { dialogue: [l('Maraina izao.', 'C’est le matin maintenant.')] }),
    order('Indique que le livre est ici.', 'Eto ny boky', [OLD.house, OLD.location], 'Le lieu ouvre cette localisation.'),
    choose('Dans ces scènes, izao indique-t-il une habitude ?', 'Non, le moment présent', ['Oui, tous les jours', 'Oui, chaque nuit'], [C.now], 'Une routine demandera d’autres repères, introduits plus tard.'),
  ]);
words(B, 1, C.day, [['maraina', 'matin', 'Moment du jour, sans limite horaire rigide.'], ['antoandro', 'plein jour / mi-journée', 'Ne signifie pas systématiquement midi pile.'], ['hariva', 'fin d’après-midi / soir', 'Le soir dans les vignettes du jeu.'], ['alina', 'nuit', 'Le sens numérique homonyme n’est pas étudié ici.']], daySources);
words(B, 1, C.now, [['izao', 'maintenant, dans ces phrases', 'Repère du moment où l’on parle ; pas une marque de routine.']], daySources);

const sleepSources = [W2_PC, dictionary('mifoha', 'Verbe actif au présent : se réveiller / se lever. Emplois temporels et exemple à une heure précise.'), dictionary('matory', 'Verbe actif au présent : dormir. La forme matory ne doit pas être confondue avec la formule te hatory déjà rencontrée.')];
add(B, 2, 'Du réveil au repos', 'Mifoha aho.', 'Les personnages décrivent les actions de deux vignettes.',
  ['Distinguer se réveiller et dormir', 'Placer la personne après le verbe dans les modèles étudiés', 'Associer une action à un moment'], sleepSources, [
    {
      title: 'Se réveiller ou dormir', description: 'Le même personnage apparaît dans deux états différents.',
      concepts: [definition(C.sleep, 'Se réveiller et dormir', 'Employer mifoha et matory au présent.', 'mifoha · matory', 'grammar')], reviews: [OLD.person, OLD.question, OLD.negation],
      scenes: [
        sc('Mia joue le réveil', [m('Mifoha aho.', 'Je me réveille.'), l('Salama!', 'Bonjour !')], 'Mifoha aho.', 'L’action, puis la personne.'),
        sc('Une vignette montre Lova endormi', [m('Matory ve izy?', 'Dort-il ?'), l('Eny, matory izy.', 'Oui, il dort.')], 'Matory izy.', 'Parler de la personne dans la vignette.'),
        sc('Mia décrit sa propre vignette de sommeil', [m('Matory aho.', 'Je dors.'), l('Eny.', 'Oui.')], 'mifoha · matory', 'Se réveiller et dormir sont deux actions différentes.'),
        sc('La vignette suivante montre Lova éveillé', [m('Matory ve ianao?', 'Dors-tu ?'), l('Tsia, tsy matory aho.', 'Non, je ne dors pas.')], 'Tsy matory aho.', 'Tsy rend le verbe négatif.'),
      ],
      notes: [{ title: 'Deux verbes au présent', body: 'Mifoha décrit le réveil ; matory le sommeil. Dans les modèles étudiés, le verbe précède aho, ianao ou izy. Matory est ici un verbe à la voix active, même sans objet exprimé.' }, { title: 'Un souhait déjà connu', body: 'Te hatory aho exprime le souhait de dormir ; matory aho décrit le sommeil. On ne traite pas ces formes comme interchangeables.' }],
      tasks: [
        choose('Quel verbe convient à une personne qui se réveille ?', 'mifoha', ['matory', 'manana'], [C.sleep], 'Mifoha signifie se réveiller / se lever.', { selectionLanguage: 'mg' }),
        match('Relie les actions à leur sens.', [['mifoha', 'se réveiller'], ['matory', 'dormir']], [C.sleep], 'Deux actions, pas deux traductions du même état.'),
        order('Dis que tu dors.', 'Matory aho', [C.sleep, OLD.person], 'Le sujet aho vient après matory dans ce modèle.'),
        reply('La personne dans la vignette est réveillée. Réponds pour elle.', 'Tsia, tsy matory izy.', ['Eny, matory izy.', 'Mia no anarako.'], [C.sleep, OLD.negation, OLD.no], 'Vous niez le sommeil de la personne montrée.', [l('Matory ve izy?', 'Dort-il ou dort-elle ?')]),
        cloze('« Mifoha ___. » : je me réveille.', 'aho', [C.sleep, OLD.person], 'Aho renvoie à la personne qui parle.'),
        choose('Que fait la personne décrite ?', 'Elle dort', ['Elle se réveille', 'Elle donne son nom'], [C.sleep], 'Matory izy décrit le sommeil.', { dialogue: [m('Matory izy.', 'Il ou elle dort.')] }),
      ],
    },
    {
      title: 'Un moment pour chaque action', description: 'Les vignettes associent le réveil au matin et le repos à la nuit.', concepts: [], reviews: [C.sleep, C.day, OLD.negation, OLD.question],
      scenes: [
        sc('Le réveil du matin dans le carnet fictif', [m("Mifoha amin'ny maraina aho.", 'Je me réveille le matin.'), l('Eny.', 'Oui.')], "amin'ny maraina", 'Le matin, comme moment de l’action.'),
        sc('Le sommeil dans la vignette de nuit', [l("Matory amin'ny alina aho.", 'Je dors la nuit.'), m('Eny.', 'Oui.')], "amin'ny alina", 'La nuit, comme moment de l’action.'),
        sc('Lova vérifie la vignette de Mia', [l("Matory amin'ny maraina ve ianao?", 'Dors-tu le matin ?'), m("Tsia, tsy matory amin'ny maraina aho.", 'Non, je ne dors pas le matin.')], "Tsy matory amin'ny maraina aho.", 'Nier une action située dans la journée.'),
        sc('Une autre vignette montre la mère de Lova', [l('Mifoha ny reniko.', 'Ma mère se réveille.'), m('Salama, tompoko.', 'Bonjour, avec respect.')], 'Mifoha ny reniko.', 'Le sujet peut être un groupe avec ny.'),
      ],
      notes: [{ title: 'Situer l’action', body: 'Apprenez ici les groupes entiers amin’ny maraina et amin’ny alina. Le complément indique le moment de l’action. Dans le patron retenu : verbe, moment, sujet. Une autre place du complément est parfois possible.' }],
      tasks: [
        choose('Quand Mia se réveille-t-elle ?', 'Le matin', ['La nuit', 'Le texte ne donne aucun moment'], [C.sleep, C.day], 'Amin’ny maraina situe le réveil.', { dialogue: [m("Mifoha amin'ny maraina aho.", 'Je me réveille le matin.')] }),
        cloze('« Matory amin’ny ___ aho. » : je dors la nuit.', 'alina', [C.sleep, C.day], 'Alina désigne la nuit.'),
        task('order', 'Reconstitue ta phrase sur le réveil du matin.', ["Mifoha amin'ny maraina aho", "Mifoha aho amin'ny maraina"], [C.sleep, C.day], 'Le moment peut accompagner le verbe et son sujet.', { tokens: ['Mifoha', "amin'ny", 'maraina', 'aho'], selectionLanguage: 'mg' }),
        choose('Qui se réveille ?', 'La mère de Lova', ['Mia', 'Le père de Mia'], [C.sleep, OLD.possession], 'Ny reniko indique la mère de la personne qui parle.', { dialogue: [l('Mifoha ny reniko.', 'Ma mère se réveille.')] }),
        translate('Nomme l’action : dormir.', 'matory', [C.sleep], 'Matory est le verbe du sommeil.'),
        reply('Tu ne dors pas le matin. Réponds selon cette situation.', "Tsia, tsy matory amin'ny maraina aho.", ["Eny, matory amin'ny maraina aho.", 'Mpiofana aho.'], [C.sleep, C.day, OLD.negation], 'Tsy nie matory ; le moment reste le matin.', [l("Matory amin'ny maraina ve ianao?", 'Dors-tu le matin ?')]),
      ],
    },
  ], [
    translate('Décris une personne qui se réveille : « Elle se réveille. »', 'Mifoha izy', [C.sleep, OLD.person], 'Izy peut désigner elle ou il.'),
    order('Dis que tu ne dors pas.', 'Tsy matory aho', [C.sleep, OLD.negation], 'Tsy précède le verbe ; aho est le sujet.'),
    choose('Quelle action correspond à une vignette de sommeil ?', 'matory', ['mifoha', 'mila'], [C.sleep], 'Matory signifie dormir.', { selectionLanguage: 'mg' }),
    cloze('« Mifoha amin’ny ___ aho. » : je me réveille le matin.', 'maraina', [C.sleep, C.day], 'Le complément est amin’ny maraina.'),
    match('Relie les deux actions et le moment.', [['mifoha', 'se réveiller'], ['matory', 'dormir'], ['alina', 'nuit']], [C.sleep, C.day], 'Ne confondez pas l’action et le moment.'),
    choose('La phrase décrit-elle un souhait ou une action ?', 'Une action de sommeil', ['Le souhait de dormir', 'Le souhait de boire'], [C.sleep], 'Matory aho décrit le sommeil ; te hatory exprimerait le souhait.', { dialogue: [m('Matory aho.', 'Je dors.')] }),
    translate('Exprime le souhait de dormir, déjà appris au monde précédent.', 'Te hatory aho', ['w1.want'], 'La formule de souhait conserve te hatory.'),
    task('order', 'Dis que tu dors la nuit.', ["Matory amin'ny alina aho", "Matory aho amin'ny alina"], [C.sleep, C.day], 'Le complément amin’ny alina situe le sommeil.', { tokens: ['Matory', "amin'ny", 'alina', 'aho'], selectionLanguage: 'mg' }),
    cloze('Demande à une personne si elle dort : « Matory ___ ianao? »', 've', [C.sleep, OLD.question], 'Ve forme la question oui/non dans le modèle étudié.'),
    choose('Qui se réveille dans la phrase ?', 'La mère de la personne qui parle', ['Le père de la personne qui écoute', 'Le personnage qui écoute'], [C.sleep, OLD.possession], 'Reniko renvoie à ma mère.', { dialogue: [l('Mifoha ny reniko.', 'Ma mère se réveille.')] }),
    translate('Nomme l’action opposée au sommeil dans ces vignettes.', 'mifoha', [C.sleep], 'Mifoha décrit le réveil.'),
    choose('Quel mot doit nier une action dans les modèles appris ?', 'tsy', ['tsia', 'ny'], [OLD.negation], 'Tsy nie le prédicat ; tsia répond non.', { selectionLanguage: 'mg' }),
  ]);
words(B, 2, C.sleep, [['mifoha', 'se réveiller / se lever', 'Verbe actif au présent.'], ['matory', 'dormir', 'Présent, à distinguer du souhait te hatory.'], ["amin'ny maraina", 'le matin', 'Groupe temporel appris entier dans cette partie.'], ["amin'ny alina", 'la nuit', 'Groupe temporel qui situe le sommeil.']], sleepSources);

const clockSources = [W2_PC, ...daySources.filter(id => id !== W2_PC), dictionary('ora', 'Heure ; interprétation des heures pleines avec amin’ny et les nombres déjà connus.')];
add(B, 3, 'Des heures sur le cadran', "Amin'ny firy izao?", 'Lire des heures pleines et situer le réveil ou le sommeil.',
  ['Demander l’heure au moment présent', 'Reconnaître des heures pleines', 'Associer une action à une heure dans un carnet fictif'], clockSources, [
    {
      title: 'Quelle heure est-il ?', description: 'Les cadrans du jeu montrent des heures pleines.',
      concepts: [definition(C.clock, 'Les heures pleines', 'Comprendre amin’ny suivi d’un nombre pour une heure.', "amin'ny enina · amin'ny valo", 'grammar'), definition(C.ask, 'Demander l’heure', 'Employer la formule Amin’ny firy izao?', "Amin'ny firy izao?", 'communication')],
      reviews: [OLD.numbers, C.day, C.now],
      scenes: [
        sc('Le premier cadran montre six heures du matin', [l("Amin'ny firy izao?", 'Quelle heure est-il ?'), m("Amin'ny enina maraina izao.", 'Il est six heures du matin.')], "Amin'ny enina maraina izao.", 'Le nombre est une heure ; maraina précise le matin.'),
        sc('Un autre cadran montre huit heures', [m("Amin'ny firy izao?", 'Quelle heure est-il ?'), l("Amin'ny valo maraina izao.", 'Il est huit heures du matin.')], "amin'ny valo", 'À huit heures, dans ce contexte.'),
        sc('La vignette du soir montre sept heures', [l("Amin'ny fito hariva izao.", 'Il est sept heures du soir.'), m('Hariva izao.', 'C’est le soir maintenant.')], "amin'ny fito hariva", 'À sept heures du soir.'),
        sc('La vignette de nuit montre neuf heures', [m("Amin'ny sivy alina izao.", 'Il est neuf heures du soir, dans la nuit de la vignette.'), l('Reraka aho.', 'Je suis fatigué.')], "amin'ny sivy alina", 'À neuf heures dans la vignette nocturne.'),
      ],
      notes: [{ title: 'Une heure pleine', body: 'Dans ces formules, amin’ny précède le nombre de l’heure. Maraina, hariva ou alina permettent de comprendre le cadran dans la journée. Nous ne travaillons ici ni les minutes ni les demi-heures.' }, { title: 'Deux questions différentes', body: 'Firy seul demande une quantité. La formule amin’ny firy cherche une heure. Amin’ny firy izao? demande l’heure au moment où l’on parle.' }],
      tasks: [
        reply('Le cadran indique six heures du matin. Réponds.', "Amin'ny enina maraina izao.", ["Amin'ny valo maraina izao.", 'Manana boky roa aho.'], [C.clock, C.ask, C.day], 'Enina correspond à six ; maraina précise le matin.', [l("Amin'ny firy izao?", 'Quelle heure est-il ?')]),
        choose('Quelle information la question recherche-t-elle ?', 'Une heure', ['Un prénom', 'Une quantité d’enfants'], [C.ask], 'Amin’ny firy izao? demande l’heure.', { dialogue: [m("Amin'ny firy izao?", 'Quelle heure est-il ?')] }),
        match('Associe le groupe à l’heure.', [["amin'ny enina", 'à six heures'], ["amin'ny valo", 'à huit heures'], ["amin'ny sivy", 'à neuf heures']], [C.clock, OLD.numbers], 'Le nombre déjà connu est utilisé comme heure.'),
        cloze('Il est huit heures du matin : « Amin’ny ___ maraina izao. »', 'valo', [C.clock], 'Valo signifie huit.'),
        order('Pose la question pour connaître l’heure actuelle.', "Amin'ny firy izao", [C.ask, C.now], 'Apprenez cette formule entière.'),
        choose('À quel moment de la journée correspond la phrase ?', 'Au soir', ['Au matin', 'Au plein jour'], [C.clock, C.day], 'Hariva précise ici le soir.', { dialogue: [l("Amin'ny fito hariva izao.", 'Il est sept heures du soir.')] }),
      ],
    },
    {
      title: 'À quelle heure se réveille-t-on ?', description: 'Les horaires appartiennent au carnet fictif des personnages.', concepts: [], reviews: [C.clock, C.ask, C.sleep, C.day, OLD.family, OLD.possession],
      scenes: [
        sc('Le réveil de Mia dans le carnet', [l("Mifoha amin'ny firy ianao?", 'À quelle heure te réveilles-tu ?'), m("Mifoha amin'ny enina maraina aho.", 'Je me réveille à six heures du matin.')], "Mifoha amin'ny enina maraina aho.", 'Une action située à une heure précise.'),
        sc('Le sommeil de Lova dans le carnet', [m("Matory amin'ny firy ianao?", 'À quelle heure dors-tu ?'), l("Matory amin'ny sivy alina aho.", 'Je dors à neuf heures du soir, dans la nuit.')], "amin'ny sivy alina", 'Le nombre indique ici l’heure du sommeil.'),
        sc('La mère de Lova apparaît dans une autre vignette', [l("Mifoha amin'ny fito maraina ny reniko.", 'Ma mère se réveille à sept heures du matin.'), m('Eny.', 'Oui.')], 'ny reniko', 'Le sujet est la mère de la personne qui parle.'),
        sc('Mia vérifie un horaire qui ne correspond pas au carnet', [m("Matory amin'ny enina maraina ve ianao?", 'Dors-tu à six heures du matin ?'), l("Tsia, tsy matory amin'ny enina maraina aho.", 'Non, je ne dors pas à six heures du matin.')], "Tsy matory amin'ny enina maraina aho.", 'Nier une action située à une heure.'),
      ],
      notes: [{ title: 'Le modèle du carnet', body: 'Dans le patron retenu, le verbe est suivi du moment puis du sujet. L’heure se lit avec le nombre déjà appris. Ces emplois du temps sont des exemples fictifs, pas des habitudes attribuées à tous les habitants d’Antsirabe.' }],
      tasks: [
        choose('À quelle heure Mia se réveille-t-elle ?', 'À six heures du matin', ['À sept heures du soir', 'À neuf heures du soir'], [C.sleep, C.clock], 'Enina maraina correspond à six heures du matin.', { dialogue: [m("Mifoha amin'ny enina maraina aho.", 'Je me réveille à six heures du matin.')] }),
        cloze('Ajoute le repère de huit heures : « Mifoha ___ valo maraina aho. »', "amin'ny", [C.clock, C.sleep], 'Amin’ny introduit ici le nombre de l’heure.'),
        task('order', 'Ton carnet indique un réveil à sept heures du matin. Annonce-le.', ["Mifoha amin'ny fito maraina aho", "Mifoha aho amin'ny fito maraina"], [C.sleep, C.clock], 'Le nombre fito indique sept.', { tokens: ['Mifoha', "amin'ny", 'fito', 'maraina', 'aho'], selectionLanguage: 'mg' }),
        reply('Ton heure de sommeil est neuf heures dans la vignette nocturne.', "Matory amin'ny sivy alina aho.", ["Mifoha amin'ny sivy alina aho.", 'Mila rano aho.'], [C.clock, C.sleep], 'Matory parle du sommeil ; sivy, de neuf heures.', [m("Matory amin'ny firy ianao?", 'À quelle heure dors-tu ?')]),
        choose('Qui a l’horaire décrit ?', 'La mère de Lova', ['Mia', 'Le père de Mia'], [OLD.possession, C.clock], 'Ny reniko indique la mère de Lova dans sa réplique.', { dialogue: [l("Mifoha amin'ny fito maraina ny reniko.", 'Ma mère se réveille à sept heures du matin.')] }),
        translate('Dis simplement que tu te réveilles.', 'Mifoha aho', [C.sleep], 'Le verbe et le sujet suffisent pour cette réponse.'),
      ],
    },
  ], [
    translate('Demande l’heure qu’il est.', "Amin'ny firy izao", [C.ask], 'La question porte sur l’heure actuelle.'),
    choose('Le cadran indique huit heures. Quel nombre faut-il employer ?', 'valo', ['enina', 'sivy'], [C.clock, OLD.numbers], 'Valo signifie huit.', { selectionLanguage: 'mg' }),
    cloze('« Amin’ny ___ maraina izao. » : il est sept heures du matin.', 'fito', [C.clock], 'Fito est le nombre sept.'),
    order('Annonce qu’il est six heures du matin.', "Amin'ny enina maraina izao", [C.clock, C.day], 'Le nombre précède le moment maraina.'),
    match('Associe les horaires.', [["amin'ny fito maraina", 'à sept heures du matin'], ["amin'ny sivy alina", 'à neuf heures dans la nuit']], [C.clock, C.day], 'Le moment du jour précise le nombre de l’heure.'),
    choose('À quelle partie de la journée correspond ce réveil ?', 'Le matin', ['La nuit', 'Le texte ne le précise pas'], [C.clock, C.sleep], 'Maraina situe le réveil le matin.', { dialogue: [m("Mifoha amin'ny valo maraina aho.", 'Je me réveille à huit heures du matin.')] }),
    task('order', 'Annonce ton réveil à huit heures du matin.', ["Mifoha amin'ny valo maraina aho", "Mifoha aho amin'ny valo maraina"], [C.clock, C.sleep], 'Le nombre valo indique huit.', { tokens: ['Mifoha', "amin'ny", 'valo', 'maraina', 'aho'], selectionLanguage: 'mg' }),
    translate('Nomme le moment du jour correspondant à la nuit.', 'alina', [C.day], 'Alina désigne ici la nuit.'),
    cloze('Nier le sommeil : « ___ matory aho. »', 'Tsy', [C.sleep, OLD.negation], 'Tsy nie le verbe.'),
    choose('Qui dort dans la phrase ?', 'Le père de la personne qui parle', ['La mère de la personne qui écoute', 'La personne qui écoute'], [C.sleep, OLD.possession], 'Ny raiko désigne mon père.', { dialogue: [l('Matory ny raiko.', 'Mon père dort.')] }),
    choose('Quelle question cherche une heure plutôt qu’une quantité ?', "Amin'ny firy izao?", ['Manana zanaka firy ianao?', 'Iza no anaranao?'], [C.ask], 'Amin’ny firy izao? cherche l’heure.', { selectionLanguage: 'mg' }),
    order('Annonce que la personne représentée ne dort pas.', 'Tsy matory izy', [C.sleep, OLD.negation, OLD.person], 'Le sujet izy parle de la personne représentée.'),
  ]);
words(B, 3, C.clock, [["amin'ny enina maraina", 'à six heures du matin', 'Heure pleine dans le carnet fictif.'], ["amin'ny valo maraina", 'à huit heures du matin', 'Valo signifie huit.'], ["amin'ny fito hariva", 'à sept heures du soir', 'Hariva précise ici le soir.'], ["amin'ny sivy alina", 'à neuf heures dans la nuit', 'Alina précise la vignette nocturne.']], clockSources);
words(B, 3, C.ask, [["Amin'ny firy izao?", 'Quelle heure est-il ?', 'Question apprise entière, déjà publiée par Peace Corps.']], clockSources);

const mealSources = [W2_PC, dictionary('mihinana', 'Manger, verbe actif au présent ; les modèles utilisent un objet défini ny + nom pour ne pas imposer sans explication une forme liée du verbe.'), dictionary('misotro', 'Boire, verbe actif au présent ; construction avec rano attestée dans l’entrée.')];
add(B, 4, 'Le repas et la boisson', 'Misotro rano aho.', 'Passer du besoin ou du goût à une action réelle dans la scène.',
  ['Distinguer manger et boire', 'Comprendre l’objet d’une action', 'Dire ce que l’on ne boit pas'], mealSources, [
    {
      title: 'Ce que font les personnages', description: 'Les dessins montrent une action, pas seulement une envie.',
      concepts: [definition(C.meal, 'Manger et boire', 'Employer mihinana et misotro dans des phrases actives courtes.', 'mihinana · misotro', 'grammar')],
      reviews: [OLD.food, OLD.person, OLD.article, OLD.question],
      scenes: [
        sc('Mia boit dans la vignette', [m('Misotro rano aho.', 'Je bois de l’eau.'), l('Eny.', 'Oui.')], 'Misotro rano aho.', 'L’action de boire, l’eau, puis la personne.'),
        sc('Le pain est celui du petit repas dessiné', [l('Mihinana ny mofo aho.', 'Je mange le pain.'), m('Eny.', 'Oui.')], 'Mihinana ny mofo aho.', 'Le pain est l’objet de l’action.'),
        sc('Une autre vignette montre le riz', [m('Mihinana ny vary izy.', 'Il ou elle mange le riz.'), l('Eny.', 'Oui.')], 'Mihinana ny vary izy.', 'Le même verbe avec une autre personne.'),
        sc('Mia vérifie la boisson de Lova', [m('Misotro kafe ve ianao?', 'Bois-tu du café ?'), l('Eny, misotro kafe aho.', 'Oui, je bois du café.')], 'misotro kafe', 'Boire du café dans cette scène.'),
      ],
      notes: [{ title: 'Une action et son objet', body: 'Dans Misotro rano aho : misotro indique l’action, rano la chose bue, aho la personne qui boit. Les deux verbes de cette partie sont à la voix active.' }, { title: 'Le repas défini', body: 'Les exemples avec mihinana emploient ny mofo ou ny vary : le pain ou le riz du repas dessiné. Ce choix évite d’introduire ici les formes liées comme mihinam-bary sans les expliquer.' }],
      tasks: [
        choose('Quel verbe correspond au personnage qui boit ?', 'misotro', ['mihinana', 'matory'], [C.meal], 'Misotro décrit l’action de boire.', { selectionLanguage: 'mg' }),
        match('Relie les actions.', [['mihinana', 'manger'], ['misotro', 'boire'], ['matory', 'dormir']], [C.meal, C.sleep], 'Les verbes décrivent trois actions distinctes.'),
        order('Décris ton action : tu bois de l’eau.', 'Misotro rano aho', [C.meal, OLD.food], 'Le verbe et son objet précèdent le sujet dans ce modèle.'),
        cloze('« Mihinana ny ___ aho. » : je mange le pain.', 'mofo', [C.meal, OLD.food], 'Ny mofo désigne le pain du repas.'),
        choose('Qu’est-ce que le personnage mange ?', 'Le riz', ['Le pain', 'La banane'], [C.meal, OLD.food], 'Ny vary est l’objet mangé.', { dialogue: [m('Mihinana ny vary izy.', 'Il ou elle mange le riz.')] }),
        reply('Tu bois du café dans cette vignette. Confirme.', 'Eny, misotro kafe aho.', ['Tsia, tsy misotro kafe aho.', 'Matory aho.'], [C.meal, OLD.yes, OLD.food], 'Vous confirmez l’action qui est montrée.', [l('Misotro kafe ve ianao?', 'Bois-tu du café ?')]),
      ],
    },
    {
      title: 'Une envie n’est pas une action', description: 'Mia et Lova distinguent le besoin, le goût et ce qu’ils font.', concepts: [], reviews: [C.meal, OLD.need, OLD.like, OLD.negation, C.day],
      scenes: [
        sc('Mia exprime d’abord un besoin', [m('Mila rano aho.', 'J’ai besoin d’eau.'), l('Eny.', 'Oui.')], 'Mila rano aho.', 'Un besoin, sans dire encore que l’on boit.'),
        sc('Dans la vignette suivante, Mia boit', [m('Misotro rano aho izao.', 'Je bois de l’eau maintenant.'), l('Eny.', 'Oui.')], 'Misotro rano aho izao.', 'Une action au moment présent.'),
        sc('Le café ne plaît pas à Mia', [l('Tia kafe ve ianao?', 'Aimes-tu le café ?'), m('Tsia, tsy tia kafe aho.', 'Non, je n’aime pas le café.')], 'Tsy tia kafe aho.', 'Un goût négatif.'),
        sc('Lova demande quelle action est montrée', [l('Misotro kafe ve ianao?', 'Bois-tu du café ?'), m('Tsia, tsy misotro kafe aho.', 'Non, je ne bois pas de café.')], 'Tsy misotro kafe aho.', 'Une action niée, distincte du goût.'),
      ],
      notes: [{ title: 'Trois intentions', body: 'Mila exprime un besoin ; tia un goût ; misotro l’action de boire. Ces verbes ne sont pas interchangeables. Tsy placé devant le verbe permet de nier chacune de ces phrases.' }],
      tasks: [
        choose('Quelle phrase parle d’une action de boire ?', 'Misotro rano aho.', ['Mila rano aho.', 'Tia rano aho.'], [C.meal, OLD.need, OLD.like], 'Misotro décrit l’action.', { selectionLanguage: 'mg' }),
        cloze('Nier la boisson : « Tsy ___ kafe aho. »', 'misotro', [C.meal, OLD.negation], 'Tsy misotro signifie ne pas boire.'),
        reply('Tu ne bois pas de café dans la vignette. Réponds.', 'Tsia, tsy misotro kafe aho.', ['Eny, misotro kafe aho.', 'Manana boky aho.'], [C.meal, OLD.negation], 'La situation demande de nier cette action.', [l('Misotro kafe ve ianao?', 'Bois-tu du café ?')]),
        translate('Exprime ton besoin d’eau.', 'Mila rano aho', [OLD.need, OLD.food], 'Mila rano exprime le besoin, pas l’action de boire.'),
        match('Associe les informations.', [['mila', 'avoir besoin'], ['tia', 'aimer'], ['misotro', 'boire']], [C.meal, OLD.need, OLD.like], 'Les trois verbes donnent des informations différentes.'),
        order('Décris l’action de l’autre personnage : il mange le pain.', 'Mihinana ny mofo izy', [C.meal, OLD.food, OLD.person], 'Izy est le sujet ; ny mofo est l’objet.'),
      ],
    },
  ], [
    translate('Décris ton action : tu bois de l’eau.', 'Misotro rano aho', [C.meal, OLD.food], 'L’eau est l’objet de misotro.'),
    choose('Quel verbe nomme le fait de manger ?', 'mihinana', ['misotro', 'mila'], [C.meal], 'Mihinana décrit l’action de manger.', { selectionLanguage: 'mg' }),
    cloze('« Mihinana ny ___ izy. » : il mange le riz.', 'vary', [C.meal, OLD.food], 'Ny vary désigne le riz du repas.'),
    order('Dis que tu ne bois pas de café.', 'Tsy misotro kafe aho', [C.meal, OLD.negation, OLD.food], 'Tsy nie le verbe misotro.'),
    match('Associe les trois intentions.', [['mila', 'besoin'], ['tia', 'goût'], ['misotro', 'action de boire']], [C.meal, OLD.need, OLD.like], 'Une même boisson peut être désirée, aimée ou bue.'),
    choose('Que fait Mia dans la réplique ?', 'Elle boit de l’eau', ['Elle demande le prix', 'Elle dort'], [C.meal, OLD.food], 'Misotro rano décrit l’action de boire de l’eau.', { dialogue: [m('Misotro rano aho.', 'Je bois de l’eau.')] }),
    translate('Exprime que tu n’aimes pas le café.', 'Tsy tia kafe aho', [OLD.like, OLD.negation], 'Le goût se dit avec tia.'),
    cloze('Dans ce modèle, qui boit ? « Misotro rano ___. » — je bois.', 'aho', [C.meal, OLD.person], 'Aho désigne la personne qui parle.'),
    choose('Quelle phrase exprime un besoin plutôt qu’une action ?', 'Mila rano aho.', ['Misotro rano aho.', 'Mihinana ny mofo aho.'], [OLD.need, C.meal], 'Mila signifie avoir besoin.', { selectionLanguage: 'mg' }),
    order('Décris l’autre personnage : elle mange le pain.', 'Mihinana ny mofo izy', [C.meal, OLD.person], 'Le sujet est izy, pas aho.'),
    choose('Le personnage boit-il du café ?', 'Non', ['Oui', 'Il parle seulement de son prénom'], [C.meal, OLD.negation], 'La présence de tsy nie l’action.', { dialogue: [l('Tsy misotro kafe aho.', 'Je ne bois pas de café.')] }),
    translate('Nomme l’action qui répond à la soif dans ces scènes.', 'misotro', [C.meal, OLD.hunger], 'Misotro signifie boire.'),
  ]);
words(B, 4, C.meal, [['mihinana', 'manger', 'Verbe actif au présent.'], ['misotro', 'boire', 'Décrit l’action, à distinguer de mila et tia.'], ['Mihinana ny mofo aho.', 'Je mange le pain.', 'Objet défini : le pain du repas illustré.'], ['Misotro rano aho.', 'Je bois de l’eau.', 'Verbe, objet, sujet dans ce modèle.']], mealSources);

const studySources = [W2_PC, dictionary('miasa', 'Travailler, sens standard du verbe actif au présent ; ne pas généraliser les emplois régionaux.'), dictionary('mianatra', 'Apprendre / étudier, verbe actif au présent ; exemple Peace Corps mianatra teny Malagasy aho.')];
add(B, 5, 'Travailler et apprendre', 'Mianatra teny malagasy aho.', 'Des activités de la famille dans une journée fictive.',
  ['Distinguer travailler et étudier', 'Parler de l’activité d’un proche', 'Consolider les phrases négatives et les repères temporels'], studySources, [
    {
      title: 'Deux activités à reconnaître', description: 'Les personnages montrent deux activités différentes.',
      concepts: [definition(C.study, 'Travailler et étudier', 'Employer miasa et mianatra, avec les personnes déjà connues.', 'miasa · mianatra', 'grammar')], reviews: [OLD.person, OLD.possession, OLD.question],
      scenes: [
        sc('Mia étudie dans la vignette', [m('Mianatra aho.', 'J’étudie.'), l('Eny.', 'Oui.')], 'Mianatra aho.', 'La personne qui parle étudie.'),
        sc('Lova parle de son activité', [l('Miasa aho.', 'Je travaille.'), m('Eny.', 'Oui.')], 'Miasa aho.', 'Travailler est une autre activité.'),
        sc('Mia précise ce qu’elle apprend', [m('Mianatra teny malagasy aho.', 'J’apprends le malgache.'), l('Eny.', 'Oui.')], 'teny malagasy', 'La langue malgache, dans cette formule.'),
        sc('Les rôles changent dans une autre vignette', [l('Mianatra ve ianao?', 'Étudies-tu ?'), m('Tsia, miasa aho.', 'Non, je travaille.')], 'mianatra · miasa', 'Deux activités à distinguer.'),
      ],
      notes: [{ title: 'Présenter une activité', body: 'Miasa signifie travailler ; mianatra, étudier ou apprendre. Ce sont ici des verbes actifs au présent. Avec aho et izy, le verbe ne reçoit pas une terminaison personnelle comme en français.' }, { title: 'Une langue à apprendre', body: 'Teny malagasy signifie ici la langue malgache. Mianatra teny malagasy aho est une formulation publiée dans le manuel Peace Corps ; on l’apprend dans son contexte, sans généraliser une règle de formation des noms de langue.' }],
      tasks: [
        choose('Quel verbe correspond au personnage qui étudie ?', 'mianatra', ['miasa', 'matory'], [C.study], 'Mianatra nomme l’étude ou l’apprentissage.', { selectionLanguage: 'mg' }),
        match('Associe les activités.', [['miasa', 'travailler'], ['mianatra', 'étudier / apprendre'], ['mifoha', 'se réveiller']], [C.study, C.sleep], 'Chaque verbe décrit une activité différente.'),
        order('Décris ton activité : tu travailles.', 'Miasa aho', [C.study, OLD.person], 'Le sujet aho suit le verbe.'),
        cloze('« ___ teny malagasy aho. » : j’apprends le malgache.', 'Mianatra', [C.study], 'Mianatra indique l’apprentissage.'),
        choose('Qu’apprend Mia ?', 'Le malgache', ['Une heure', 'Le prix d’un repas'], [C.study], 'Teny malagasy nomme ici la langue apprise.', { dialogue: [m('Mianatra teny malagasy aho.', 'J’apprends le malgache.')] }),
        reply('Tu travailles dans la vignette, tu n’étudies pas. Corrige l’idée de Lova.', 'Tsia, miasa aho.', ['Eny, mianatra aho.', 'Matory aho.'], [C.study, OLD.no], 'La situation demande de nommer le travail.', [l('Mianatra ve ianao?', 'Étudies-tu ?')]),
      ],
    },
    {
      title: 'L’activité d’un proche', description: 'Chaque rôle appartient aux personnages fictifs, sans modèle familial imposé.', concepts: [], reviews: [C.study, C.day, C.clock, C.now, OLD.possession, OLD.negation],
      scenes: [
        sc('La mère de Lova travaille dans cette vignette', [l('Miasa ny reniko.', 'Ma mère travaille.'), m('Eny.', 'Oui.')], 'Miasa ny reniko.', 'L’activité, puis le proche dont on parle.'),
        sc('Son père apprend dans une autre vignette', [l('Mianatra ny raiko.', 'Mon père étudie.'), m('Eny.', 'Oui.')], 'Mianatra ny raiko.', 'Un autre proche, une autre activité.'),
        sc('Mia décrit le moment de son apprentissage', [m("Mianatra amin'ny maraina aho.", 'J’étudie le matin.'), l('Eny.', 'Oui.')], "amin'ny maraina", 'Le moment accompagne l’activité.'),
        sc('Lova décrit uniquement la situation présente', [m('Miasa ve ianao izao?', 'Travailles-tu maintenant ?'), l('Tsia, tsy miasa aho izao.', 'Non, je ne travaille pas maintenant.')], 'Tsy miasa aho izao.', 'Nier au présent, sans raconter le passé.'),
      ],
      notes: [{ title: 'Un proche comme sujet', body: 'Ny reniko ou ny raiko peut remplir le même rôle que izy : la personne dont on décrit l’activité. Les rôles du récit sont fictifs et ne représentent pas une répartition générale du travail ou des études.' }],
      tasks: [
        choose('Qui travaille ?', 'La mère de Lova', ['Son père', 'La mère de Mia'], [C.study, OLD.possession], 'Ny reniko indique la mère de la personne qui parle.', { dialogue: [l('Miasa ny reniko.', 'Ma mère travaille.')] }),
        order('Décris ton père : il étudie.', 'Mianatra ny raiko', [C.study, OLD.possession], 'Le groupe ny raiko est le sujet.'),
        cloze('Nier le travail : « Tsy ___ aho izao. »', 'miasa', [C.study, OLD.negation, C.now], 'Tsy miasa nie l’activité de travail.'),
        task('order', 'Annonce que tu étudies le matin.', ["Mianatra amin'ny maraina aho", "Mianatra aho amin'ny maraina"], [C.study, C.day], 'Le moment situe les études.', { tokens: ['Mianatra', "amin'ny", 'maraina', 'aho'], selectionLanguage: 'mg' }),
        choose('Lova dit-il ne jamais travailler ?', 'Non, il parle de maintenant', ['Oui, il ne travaille jamais', 'Il parle de demain'], [C.study, C.now, OLD.negation], 'Izao limite ici l’information au moment présent.', { dialogue: [l('Tsy miasa aho izao.', 'Je ne travaille pas maintenant.')] }),
        translate('Décris une autre personne : elle travaille.', 'Miasa izy', [C.study, OLD.person], 'Le verbe reste miasa avec le sujet izy.'),
      ],
    },
  ], [
    translate('Décris ton activité : tu étudies.', 'Mianatra aho', [C.study], 'Mianatra décrit les études.'),
    choose('Quel verbe correspond à travailler ?', 'miasa', ['mianatra', 'mihinana'], [C.study], 'Miasa signifie travailler.', { selectionLanguage: 'mg' }),
    order('Décris ta mère : elle étudie.', 'Mianatra ny reniko', [C.study, OLD.possession], 'La phrase combine un verbe connu et le sujet ny reniko.'),
    cloze('« ___ miasa aho. » : je ne travaille pas.', 'Tsy', [C.study, OLD.negation], 'Tsy nie le verbe.'),
    match('Relie les activités à leur sens.', [['mianatra', 'étudier'], ['miasa', 'travailler'], ['misotro', 'boire']], [C.study, C.meal], 'Les actions ne sont pas interchangeables.'),
    choose('Qui étudie dans cette réplique ?', 'Le père de Lova', ['Sa mère', 'Mia'], [C.study, OLD.possession], 'Raiko renvoie au père de la personne qui parle.', { dialogue: [l('Mianatra ny raiko.', 'Mon père étudie.')] }),
    translate('Annonce que tu apprends le malgache.', 'Mianatra teny malagasy aho', [C.study], 'La formule précise la langue apprise.'),
    task('order', 'Annonce que tu travailles le matin.', ["Miasa amin'ny maraina aho", "Miasa aho amin'ny maraina"], [C.study, C.day], 'Le groupe temporel est déjà connu.', { tokens: ['Miasa', "amin'ny", 'maraina', 'aho'], selectionLanguage: 'mg' }),
    choose('L’activité niée concerne-t-elle le passé ?', 'Non, le moment présent', ['Oui, hier', 'Oui, une année passée'], [C.now, C.study, OLD.negation], 'Izao indique ici maintenant.', { dialogue: [m('Tsy miasa aho izao.', 'Je ne travaille pas maintenant.')] }),
    cloze('Parle de toi : « Mianatra ___. »', 'aho', [C.study, OLD.person], 'Aho indique je.'),
    choose('Quel groupe désigne ta mère, lorsque tu parles d’elle ?', 'ny reniko', ['ny reninao', 'ny raiko'], [OLD.possession], 'Reniko est la forme liée à la personne qui parle.', { selectionLanguage: 'mg' }),
    order('Parle d’une autre personne : elle ne travaille pas.', 'Tsy miasa izy', [C.study, OLD.negation, OLD.person], 'Le sujet change, le verbe reste miasa.'),
  ]);
words(B, 5, C.study, [['miasa', 'travailler', 'Verbe actif au présent, dans le sens standard retenu.'], ['mianatra', 'apprendre / étudier', 'La personne ne change pas la terminaison du verbe dans ces modèles.'], ['teny malagasy', 'langue malgache', 'Dans la formule Mianatra teny malagasy aho.']], studySources);

const objectSources = [W2_PC, dictionary('vilia', 'Assiette / plat ; lovia est une autre graphie attestée, acceptée pour les réponses libres.'), dictionary('sotro', 'Cuillère, nom ; à distinguer du verbe misotro déjà appris.'), dictionary('vera', 'Verre à boire, nom de l’objet.'), dictionary('antsy', 'Couteau, dans son sens standard d’objet domestique.')];
add(B, 6, 'Les objets du petit repas', 'Eto ny vilia.', 'Retrouver et compter quelques objets domestiques avant l’escale culturelle.',
  ['Reconnaître assiette, cuillère, verre et couteau', 'Retrouver un objet avec les lieux déjà connus', 'Exprimer un besoin et une quantité'], objectSources, [
    {
      title: 'Quatre objets à reconnaître', description: 'Mia et Lova préparent la table du récit.',
      concepts: [definition(C.objects, 'Les objets de la table', 'Reconnaître vilia, sotro, vera et antsy.', 'vilia · sotro · vera · antsy', 'vocabulary')], reviews: [OLD.have, OLD.need, OLD.house, OLD.location],
      scenes: [
        sc('L’assiette est près de Mia', [m('Eto ny vilia.', 'L’assiette est ici.'), l('Eny.', 'Oui.')], 'vilia', 'L’assiette ou le plat.'),
        sc('Lova cherche la cuillère', [l('Mila sotro aho, azafady.', 'J’ai besoin d’une cuillère, s’il vous plaît.'), m('Eto ny sotro.', 'La cuillère est ici.')], 'sotro', 'La cuillère, un nom d’objet.'),
        sc('Mia indique le verre', [m('Manana vera aho.', 'J’ai un verre.'), l('Eny.', 'Oui.')], 'vera', 'Le verre à boire.'),
        sc('Le couteau du repas est montré, sans geste technique', [l('Eto ny antsy.', 'Le couteau est ici.'), m('Misaotra.', 'Merci.')], 'antsy', 'Le couteau.'),
      ],
      notes: [{ title: 'Des noms d’objets', body: 'Vilia désigne une assiette ou un plat ; sotro une cuillère ; vera un verre à boire ; antsy un couteau. Lovia est une autre graphie attestée de vilia : les réponses libres acceptent les deux.' }, { title: 'Sotro et misotro', body: 'Sotro est ici le nom cuillère ; misotro est le verbe boire. Leur ressemblance ne permet pas de remplacer l’un par l’autre dans la phrase.' }],
      tasks: [
        choose('Quel mot correspond à l’assiette dessinée ?', 'vilia', ['sotro', 'vera'], [C.objects], 'Vilia désigne l’assiette.', { selectionLanguage: 'mg' }),
        match('Associe les objets de la table.', [['vilia', 'assiette'], ['sotro', 'cuillère'], ['vera', 'verre à boire'], ['antsy', 'couteau']], [C.objects], 'Retrouvez l’objet concret derrière chaque mot.'),
        order('Exprime ton besoin d’une cuillère.', 'Mila sotro aho', [C.objects, OLD.need], 'Le besoin se dit avec mila.'),
        task('cloze', '« Eto ny ___. » : l’assiette est ici.', ['vilia', 'lovia'], [C.objects, OLD.location], 'Vilia et lovia sont des graphies attestées du même mot.'),
        choose('Quel objet Lova indique-t-il ?', 'Le couteau', ['La cuillère', 'Le verre'], [C.objects], 'Ny antsy est le couteau.', { dialogue: [l('Eto ny antsy.', 'Le couteau est ici.')] }),
        translate('Nomme le verre à boire.', 'vera', [C.objects], 'Vera est le nom de l’objet.'),
      ],
    },
    {
      title: 'Retrouver et compter les objets', description: 'Les objets changent de position entre les vignettes.', concepts: [], reviews: [C.objects, OLD.location, OLD.numbers, OLD.have, OLD.negation, OLD.question],
      scenes: [
        sc('Les objets du repas sont sur la table', [l('Eo ambony latabatra ny vilia.', 'L’assiette est sur la table.'), m('Eny.', 'Oui.')], 'Eo ambony latabatra ny vilia.', 'Un objet nouveau dans un lieu déjà connu.'),
        sc('Une cuillère est sous la table dans une autre vignette', [m('Eo ambany latabatra ny sotro.', 'La cuillère est sous la table.'), l('Eny.', 'Oui.')], 'eo ambany latabatra', 'Sous la table, dans le champ visible du dessin.'),
        sc('Mia compte les cuillères de son carnet', [l('Manana sotro roa ve ianao?', 'As-tu deux cuillères ?'), m('Eny, manana sotro roa aho.', 'Oui, j’ai deux cuillères.')], 'sotro roa', 'Le nom, puis le nombre.'),
        sc('Il manque un verre à Lova', [m('Manana vera ve ianao?', 'As-tu un verre ?'), l('Tsia, tsy manana vera aho.', 'Non, je n’ai pas de verre.')], 'Tsy manana vera aho.', 'Une phrase négative déjà connue avec un nouvel objet.'),
      ],
      notes: [{ title: 'Les constructions restent connues', body: 'Le nouvel objet ne change pas la construction. On réutilise le lieu devant ce que l’on situe, le nombre après le nom, et tsy devant manana pour nier la possession.' }],
      tasks: [
        choose('Où est l’assiette dans cette vignette ?', 'Sur la table', ['Sous la table', 'Dans la maison seulement'], [C.objects, OLD.location], 'Eo ambony latabatra indique la position visible sur la table.', { dialogue: [l('Eo ambony latabatra ny vilia.', 'L’assiette est sur la table.')] }),
        cloze('« Eo ___ latabatra ny sotro. » : la cuillère est sous la table.', 'ambany', [C.objects, OLD.location], 'Ambany indique sous.'),
        order('Annonce que tu as deux cuillères.', 'Manana sotro roa aho', [C.objects, OLD.have, OLD.numbers], 'Roa suit le nom sotro.'),
        reply('Tu n’as pas de verre dans la vignette. Réponds.', 'Tsia, tsy manana vera aho.', ['Eny, manana vera aho.', 'Matory aho.'], [C.objects, OLD.have, OLD.negation], 'Le contexte demande une possession négative.', [m('Manana vera ve ianao?', 'As-tu un verre ?')]),
        translate('Nomme le couteau.', 'antsy', [C.objects], 'Antsy désigne le couteau.'),
        match('Retrouve les positions.', [['eo ambony latabatra', 'sur la table'], ['eo ambany latabatra', 'sous la table']], [OLD.location], 'Ambony et ambany s’opposent.'),
      ],
    },
  ], [
    task('translate', 'Nomme une assiette.', ['vilia', 'lovia'], [C.objects], 'Les deux graphies sont attestées.'),
    choose('Quel mot nomme une cuillère ?', 'sotro', ['misotro', 'vera'], [C.objects, C.meal], 'Sotro est un nom ; misotro est un verbe.', { selectionLanguage: 'mg' }),
    order('Indique que le verre est ici.', 'Eto ny vera', [C.objects, OLD.location], 'Le lieu précède l’objet situé.'),
    cloze('« Manana sotro ___ aho. » : j’ai deux cuillères.', 'roa', [C.objects, OLD.numbers, OLD.have], 'Le nombre suit le nom.'),
    match('Relie les objets à leur sens.', [['sotro', 'cuillère'], ['vera', 'verre'], ['antsy', 'couteau']], [C.objects], 'Ces mots nomment des objets du repas.'),
    choose('Quel objet se trouve sous la table ?', 'La cuillère', ['Le verre', 'Le livre'], [C.objects, OLD.location], 'Ny sotro est le sujet de cette localisation.', { dialogue: [m('Eo ambany latabatra ny sotro.', 'La cuillère est sous la table.')] }),
    translate('Exprime que tu as besoin d’un verre.', 'Mila vera aho', [C.objects, OLD.need], 'Le nouveau nom remplace simplement l’objet du besoin.'),
    order('Dis que tu n’as pas de couteau.', 'Tsy manana antsy aho', [C.objects, OLD.have, OLD.negation], 'Tsy nie manana.'),
    cloze('« Eo ___ latabatra ny vera. » : le verre est sur la table.', 'ambony', [C.objects, OLD.location], 'Ambony situe ici au-dessus, sur la table.'),
    choose('Quel mot est le verbe boire ?', 'misotro', ['sotro', 'antsy'], [C.meal, C.objects], 'Ne confondez pas le verbe et le nom cuillère.', { selectionLanguage: 'mg' }),
    order('Indique que la cuillère est ici.', 'Eto ny sotro', [C.objects, OLD.location], 'Le même modèle fonctionne avec un autre objet.'),
    choose('Combien de verres Mia possède-t-elle ?', 'Deux', ['Un', 'Trois'], [C.objects, OLD.numbers, OLD.have], 'Roa précise la quantité.', { dialogue: [m('Manana vera roa aho.', 'J’ai deux verres.')] }),
  ]);
words(B, 6, C.objects, [['vilia', 'assiette / plat', 'Autre graphie attestée : lovia ; les deux sont acceptées dans les réponses libres.'], ['sotro', 'cuillère', 'Nom d’objet, distinct du verbe misotro.'], ['vera', 'verre à boire', 'Le récipient.'], ['antsy', 'couteau', 'Objet domestique du repas fictif.']], objectSources);
