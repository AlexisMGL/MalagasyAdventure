import { CONTENT } from './content';
import { recordingForTurn } from './voice-bank';

/** A short, authored reminder. Sources stay in the central credits, never in the lesson UI. */
export interface NotionCard {
  id: string;
  title: string;
  rule: string;
  examples: { malagasy: string; french: string; audioId?: string }[];
  memory?: string;
  conceptIds: string[];
  sourceIds: string[];
  sceneId?: string;
}
type Seed = Omit<NotionCard, 'id' | 'sourceIds' | 'examples'> & { examples: [string, string][] };
const card = (title: string, rule: string, conceptIds: string[], examples: [string, string][], memory?: string): Seed =>
  ({ title, rule, conceptIds, examples, ...(memory ? { memory } : {}) });

// All examples reuse the delivered, sourced corpus. The short explanations unpack
// its existing notes; audio always comes from a whole matching utterance.
const SEEDS: Record<string, Seed[]> = {
  'lesson-01-01': [
    card('Ouvrir et fermer la rencontre', 'Un mot pour arriver, un mot pour partir.', ['vocab.hello', 'vocab.goodbye'], [['Salama!', 'Bonjour !'], ['Veloma!', 'Au revoir !']], 'Salama : j’arrive. Veloma : je pars.'),
    card('Merci et excusez-moi', 'Misaotra remercie. Azafady accompagne une demande ou une excuse.', ['vocab.thanks', 'vocab.please'], [['Misaotra!', 'Merci !'], ['Azafady!', 'Excusez-moi ! / S’il vous plaît !']], 'Recevoir une aide → misaotra. Demander → azafady.'),
    card('Deux repères pour lire', 'o se rapproche de « ou ». i et y final se rapprochent du son « i ». Écoutez les mots entiers.', ['grammar.spelling'], [['Veloma!', 'Au revoir ! — repérez le o.'], ['Azafady!', 'Excusez-moi ! — repérez le y final.']], 'o → ou ; i et y final → i. Ce sont des repères de lecture.'),
  ],
  'lesson-01-02': [
    card('Accueillir avec respect', 'La personne qui accueille dit tonga soa. Tompoko marque le respect envers la personne à qui l’on parle.', ['vocab.welcome', 'vocab.respect'], [['Tonga soa!', 'Bienvenue !'], ['Misaotra, tompoko.', 'Merci, avec respect.']], 'Tonga soa accueille ; misaotra remercie.'),
    card('Oui ou non', 'Eny répond oui. Tsia répond non.', ['vocab.yes', 'vocab.no'], [['Eny, tompoko.', 'Oui, avec respect.'], ['Tsia, tompoko.', 'Non, avec respect.']], 'Eny = oui ; tsia = non.'),
  ],
  'lesson-02-01': [
    card('Demander et donner son nom', 'Pour répondre, mettez le prénom devant no anarako. Apprenez la question entière.', ['skill.name'], [['Iza no anaranao?', 'Comment t’appelles-tu ?'], ['Mia no anarako.', 'Je m’appelle Mia.']], 'Prénom + no anarako. no n’est pas un verbe « être ».'),
    card('Mon nom, ton nom', 'Anarako signifie mon nom ; anaranao, ton ou votre nom. La fin du mot indique de qui l’on parle.', ['skill.name'], [['Mia no anarako.', 'Je m’appelle Mia. — anarako : mon nom.'], ['Iza no anaranao?', 'Comment t’appelles-tu ? — anaranao : ton nom.']], 'Dans ces formes : -ko → moi ; -nao → toi. Retenez les mots entiers.'),
    card('Les personnes : je, tu, il ou elle', 'Aho = je ; ianao = tu ou vous pour une personne ; izy = il ou elle. Ce sont des pronoms à employer dans une phrase.', ['grammar.singular-pronouns'], [['aho', 'je — pronom sujet'], ['ianao', 'tu / vous — une personne'], ['izy', 'il / elle — sans distinction de genre']], 'Le pronom indique la personne ; il ne contient pas le verbe « être ».'),
  ],
  'lesson-02-02': [
    card('Demander l’origine', 'Avy aiza demande d’où vient la personne. La question parle de vous avec ianao.', ['skill.origin'], [['Avy aiza ianao?', 'D’où viens-tu ?']], 'aiza cherche un lieu ; avy aiza cherche la provenance.'),
    card('Dire d’où l’on vient', 'Dans cette réponse : avy any + lieu + aho. Frantsa est le nom du pays France.', ['skill.origin', 'vocab.france'], [['Avy any Frantsa aho.', 'Je viens de France.']], 'Question : ianao. Réponse sur moi : aho.'),
  ],
  'lesson-03-01': [
    card('Décrire, puis dire qui', 'Le statut ou l’état vient d’abord ; le sujet vient ensuite. Ici, aucun mot ne traduit « être ».', ['grammar.predicate-first', 'vocab.trainee'], [['Mpiofana aho.', 'Je suis stagiaire.'], ['Salama aho.', 'Je suis en bonne santé.']], 'Mpiofana = le statut ; aho = la personne décrite.'),
    card('Le sujet peut changer', 'Remplacez aho par izy pour parler d’une autre personne. Le sujet désigne ici la personne dont on donne le statut.', ['grammar.predicate-first', 'grammar.singular-pronouns'], [['Mpiofana aho.', 'Je suis stagiaire.'], ['Mpiofana izy.', 'Il ou elle est stagiaire.']], 'Dans ces phrases : statut + sujet. D’autres constructions existent.'),
    card('ny devant le nom', 'ny introduit le nom : ny mpiofana = le ou la stagiaire dans cette scène. L’article ne marque ni genre ni nombre.', ['grammar.article-ny'], [['Salama ny mpiofana.', 'Le ou la stagiaire est en bonne santé.']], 'Salama décrit ; ny mpiofana indique qui est décrit.'),
  ],
  'lesson-03-02': [
    card('Une question oui/non avec ve', 'Dans ce modèle, ve se place après le statut ou l’état, avant le sujet.', ['grammar.question-ve'], [['Mpiofana ve ianao?', 'Es-tu stagiaire ?'], ['Eny, mpiofana aho.', 'Oui, je suis stagiaire.']], 'statut + ve + personne ?'),
    card('Non, et ne… pas', 'Tsia répond non. Tsy, placé devant le statut ou l’état, rend la phrase négative.', ['grammar.negation-tsy'], [['Tsia, tsy mpiofana aho.', 'Non, je ne suis pas stagiaire.']], 'Tsia = une réponse. Tsy = la négation dans la phrase.'),
  ],
  'lesson-04-01': [
    card('Les liens de famille', 'Ces mots nomment des liens familiaux. Zanaka ne distingue pas fils et fille.', ['w1.family'], [['reny', 'mère'], ['ray', 'père'], ['zanaka', 'enfant de quelqu’un'], ['fianakaviana', 'famille']], 'reny et ray : les parents ; zanaka : leur enfant.'),
    card('Présenter une personne', 'La construction est déjà connue : le statut familial précède le sujet izy.', ['w1.family', 'grammar.predicate-first'], [['Reny izy.', 'Elle est mère.'], ['Ray ve izy?', 'Est-il père ?']], 'Lien familial + izy. Ajoutez ve pour poser la question.'),
  ],
  'lesson-04-02': [
    card('Ma mère, ta mère ; mon père, ton père', 'Les fins du nom indiquent le lien avec moi ou avec vous. La forme du nom s’adapte : retenez chaque paire entière.', ['w1.family-possession'], [['Reniko izy.', 'C’est ma mère.'], ['Reninao ve izy?', 'Est-ce ta mère ?'], ['Raiko izy.', 'C’est mon père.'], ['Rainao ve izy?', 'Est-ce ton père ?']], 'reniko ↔ reninao ; raiko ↔ rainao. Ne collez pas le même suffixe partout.'),
    card('Mon enfant, ton enfant', 'Zanako parle de mon enfant ; zanakao parle du tien ou du vôtre.', ['w1.family-possession'], [['Zanako izy.', 'C’est mon enfant.'], ['Zanakao ve izy?', 'Est-ce ton enfant ?']], 'zanako ↔ zanakao : on garde les formes entières.'),
    card('Dire que l’on a', 'Manana signifie avoir. Dans ce modèle actif : avoir + ce que l’on a + la personne qui a.', ['w1.have'], [['Eny, manana zanaka aho.', 'Oui, j’ai un enfant.'], ['Manana zanaka ve ianao?', 'As-tu un enfant ?'], ['Tsy manana zanaka aho.', 'Je n’ai pas d’enfant.']], 'manana + objet + aho ; tsy devant manana pour nier.'),
  ],
  'lesson-05-01': [
    card('La maison et les meubles', 'Les noms ne prennent pas de marque de genre comme en français.', ['w1.house'], [['trano', 'maison'], ['seza', 'chaise'], ['latabatra', 'table'], ['boky', 'livre']], 'trano abrite ; seza pour s’asseoir ; latabatra pour poser ; boky pour lire.'),
    card('Réutiliser « avoir »', 'Gardez la construction manana + objet + aho. Seul le nom de l’objet change.', ['w1.house', 'w1.have'], [['Manana boky aho.', 'J’ai un livre.'], ['Tsy manana latabatra aho.', 'Je n’ai pas de table.']], 'Un nouveau nom, une construction déjà connue.'),
  ],
  'lesson-05-02': [
    card('Ma maison, ta maison', 'Tranoko = ma maison ; tranonao = ta ou votre maison. Le possesseur est indiqué dans la fin du nom.', ['w1.house-possession'], [['Eto ny tranoko.', 'Ma maison est ici.'], ['Eto ve ny tranonao?', 'Ta maison est-elle ici ?']], 'tranoko ↔ tranonao : moi ↔ toi.'),
    card('Ici ou à l’intérieur', 'Eto = ici. Dans ces scènes, ao présente un intérieur non visible : ao an-trano = dans la maison.', ['w1.location'], [['Eto ny seza.', 'La chaise est ici.'], ['Ao an-trano ny reniko.', 'Ma mère est dans la maison.']], 'Le lieu d’abord, puis ce qui s’y trouve.'),
    card('Sur ou sous la table', 'Ambony = sur ou au-dessus ; ambany = sous ou au-dessous. Ici, eo présente un endroit proche et visible.', ['w1.location'], [['Eo ambony latabatra ny boky.', 'Le livre est sur la table.'], ['Eo ambany latabatra ny boky.', 'Le livre est sous la table.']], 'ambony ↔ ambany : sur ↔ sous. ao et eo dépendent aussi de ce qui est visible.'),
  ],
  'lesson-06-01': [
    card('Faim ou soif', 'En malgache, ces états se disent directement devant aho. On n’utilise pas manana pour traduire le « avoir » français.', ['w1.hunger-thirst'], [['Noana aho.', 'J’ai faim.'], ['Mangetaheta aho.', 'J’ai soif.']], 'noana : faim ; mangetaheta : soif.'),
    card('À manger', 'Trois noms pour comprendre le petit menu.', ['w1.food'], [['vary', 'riz'], ['mofo', 'pain'], ['akondro', 'banane']], 'Écoutez, puis associez chaque mot à son aliment.'),
    card('À boire', 'Deux noms à distinguer avant le dialogue.', ['w1.food'], [['rano', 'eau'], ['kafe', 'café']], 'rano pour l’eau ; kafe pour le café.'),
  ],
  'lesson-06-02': [
    card('Ce dont j’ai besoin', 'Mila exprime un besoin. Dans ce modèle actif : mila + objet + sujet.', ['w1.need'], [['Mila rano aho, azafady.', 'J’ai besoin d’eau, s’il vous plaît.'], ['Mila mofo ve ianao?', 'As-tu besoin de pain ?']], 'mila = avoir besoin ; azafady rend la demande polie.'),
    card('Ce que j’aime', 'Tia exprime un goût. Tsy devant tia signifie que l’on n’aime pas.', ['w1.like'], [['Tia akondro aho.', 'J’aime les bananes.'], ['Tia vary aho.', 'J’aime le riz.'], ['Tsia, tsy tia kafe aho.', 'Non, je n’aime pas le café.']], 'mila = besoin ; tia = goût.'),
  ],
  'lesson-07-01': [
    card('De zéro à cinq', 'Associez chaque nombre écrit à sa valeur. Iray sert ici à dire un seul objet.', ['w1.numbers-ten'], [['aotra', '0'], ['iray', '1'], ['roa', '2'], ['telo, efatra, dimy', '3, 4, 5']], 'aotra = zéro ; iray = un ; roa = deux.'),
    card('De six à dix', 'Continuez la suite en deux petits groupes.', ['w1.numbers-ten'], [['enina, fito, valo', '6, 7, 8'], ['sivy, folo', '9, 10']], 'enina 6 · fito 7 · valo 8 · sivy 9 · folo 10.'),
    card('Compter des objets', 'Dans ces groupes, le nombre vient après le nom : boky roa = deux livres.', ['w1.numbers-ten'], [['Manana boky roa aho.', 'J’ai deux livres.'], ['Manana seza iray aho.', 'J’ai une chaise.'], ['Manana latabatra telo aho.', 'J’ai trois tables.']], 'nom + nombre ; puis aho dans la phrase avec manana.'),
  ],
  'lesson-07-02': [
    card('De onze à quinze', 'L’unité se place avant ambin’ny folo. Pour onze, la forme retenue est iraika.', ['w1.numbers-twenty'], [["iraika ambin'ny folo", '11'], ["roa ambin'ny folo, telo ambin'ny folo", '12, 13'], ["efatra ambin'ny folo, dimy ambin'ny folo", '14, 15']], 'unité + ambin’ny folo : l’unité avant la dizaine.'),
    card('De seize à vingt', 'Gardez le même modèle jusqu’à dix-neuf. Vingt se dit roapolo.', ['w1.numbers-twenty'], [["enina ambin'ny folo", '16'], ["fito ambin'ny folo, valo ambin'ny folo", '17, 18'], ["sivy ambin'ny folo, roapolo", '19, 20']], 'roapolo = vingt.'),
    card('Demander le prix', 'Vidiny = son prix : -ny est ici une fin de mot possessive, différente de ny placé devant le nom. Ariary nomme la monnaie.', ['w1.price', 'grammar.article-ny'], [['Ohatrinona ny vidiny?', 'Quel est le prix ?'], ['Ariary folo.', 'Dix ariary.']], 'Apprenez la question entière. Les montants du jeu sont fictifs.'),
  ],
  'lesson-08-01': [
    card('Qui ?', 'Iza demande l’identité d’une personne. Ianao désigne la personne à qui l’on parle.', ['w1.question-person'], [['Iza ianao?', 'Qui es-tu ?']], 'iza → une personne.'),
    card('Quoi ? Quel ?', 'Inona demande une chose ou une information. Ici, asanao signifie ton ou votre travail.', ['w1.question-thing'], [['Inona ny asanao?', 'Quel est ton travail ?']], 'inona → une information ; asanao → ton travail.'),
    card('Où ?', 'Aiza demande un lieu. La réponse commence ici par le lieu.', ['w1.question-place'], [['Aiza ny boky?', 'Où est le livre ?'], ['Eto ny boky.', 'Le livre est ici.']], 'aiza → un lieu ; eto → ici.'),
  ],
  'lesson-08-02': [
    card('Combien d’objets ou de personnes ?', 'Firy demande une quantité. Le nom vient avant firy dans cette question.', ['w1.question-quantity'], [['Manana zanaka firy ianao?', 'Combien d’enfants as-tu ?'], ['Manana zanaka roa aho.', 'J’ai deux enfants.']], 'firy → un nombre.'),
    card('Combien ça coûte ?', 'Ohatrinona demande ici un prix ; firy demande une quantité. Écoutez la question pour choisir la bonne réponse.', ['w1.question-quantity', 'w1.price'], [['Ohatrinona ny vidiny?', 'Quel est son prix ?'], ['Ariary folo.', 'Dix ariary.']], 'firy : combien d’enfants ? ohatrinona : à quel prix ?'),
  ],
  'lesson-09-01': [
    card('Trouver le marché', 'Tsena signifie marché. Aiza demande où il se trouve.', ['w1.market'], [['Aiza ny tsena?', 'Où est le marché ?']], 'tsena → marché.'),
    card('À gauche ou à droite', 'Ankavia = à gauche ; ankavanana = à droite. Le lieu peut ouvrir la phrase.', ['w1.left-right'], [['Ankavia ny tsena.', 'Le marché est à gauche.'], ['Ankavanana ny trano.', 'La maison est à droite.']], 'Ces scènes utilisent un plan fictif.'),
  ],
  'lesson-09-02': [
    card('Aller tout droit', 'Mandehana donne la consigne « va ». Mahitsy précise « tout droit ». C’est un impératif du verbe actif mandeha.', ['w1.follow-directions'], [['Mandehana mahitsy.', 'Va tout droit.']], 'mandeha : aller ; mandehana : va.'),
    card('Tourner', 'Mivilia signifie « tourne » : c’est l’impératif du verbe actif mivily. Ajoutez le côté.', ['w1.follow-directions'], [['Mivilia ankavia.', 'Tourne à gauche.'], ['Mivilia ankavanana.', 'Tourne à droite.']], 'mivilia + ankavia / ankavanana.'),
  ],
  'lesson-10-01': [
    card('Être fatigué', 'Reraka décrit la fatigue. Le sujet aho vient après cet état.', ['w1.rest'], [['Reraka aho.', 'Je suis fatigué ou fatiguée.']], 'reraka = fatigué ; aho indique qui.'),
    card('Dire ce que l’on veut faire', 'Te exprime le souhait, suivi ici de hisotro ou hatory. Apprenez ces formes entières : on n’ajoute pas h à n’importe quel mot.', ['w1.want'], [['Te hatory aho.', 'Je veux dormir.'], ['Te hisotro rano aho.', 'Je veux boire de l’eau.']], 'te hatory : vouloir dormir ; te hisotro : vouloir boire.'),
    card('Demander les toilettes', 'Kabone nomme les toilettes. Réutilisez aiza pour chercher ce lieu.', ['w1.facilities'], [['Aiza ny kabone?', 'Où sont les toilettes ?'], ['Ankavanana ny kabone.', 'Les toilettes sont à droite.']], 'Aiza + ny + lieu ?'),
  ],
  'lesson-10-02': [
    card('Je comprends, tu comprends', 'Azoko et azonao viennent de azo, « compris » ici. -ko désigne la personne qui comprend (moi), -nao l’interlocuteur.', ['w1.understand'], [['Tsy azoko.', 'Je ne comprends pas.'], ['Azonao ve?', 'As-tu compris ?'], ['Eny, azoko.', 'Oui, j’ai compris.']], 'Ces formes ne suivent pas le modèle d’un verbe actif + aho.'),
    card('Demander de répéter', 'Avereno est une demande de répétition : c’est l’impératif d’une forme passive. Ce qui doit être répété reste implicite.', ['w1.repeat'], [['Avereno, azafady.', 'Répétez, s’il vous plaît.']], 'Avereno + azafady : une formule à garder entière.'),
    card('Plus lentement', 'Moramora précise doucement ou lentement. Ajoutez-le à la demande de répétition.', ['w1.slow'], [['Avereno moramora, azafady.', 'Répétez lentement, s’il vous plaît.']], 'Avereno : répétez. Moramora : lentement.'),
  ],
  'lesson-11-01': [
    card('Retrouver la bonne information', 'Ces notions sont déjà connues. Le nom et l’origine répondent à deux questions différentes.', ['skill.name', 'skill.origin'], [['Iza no anaranao?', 'Comment t’appelles-tu ?'], ['Avy aiza ianao?', 'D’où viens-tu ?']], 'Nom → prénom. Origine → lieu.'),
    card('Passer à la famille', 'Firy demande une quantité ; dans la réponse, le nombre suit zanaka.', ['w1.question-quantity', 'w1.family'], [['Manana zanaka firy ianao?', 'Combien d’enfants as-tu ?'], ['Manana zanaka roa aho.', 'J’ai deux enfants.']], 'Écoutez ce qui est demandé avant de choisir la réponse.'),
  ],
  'lesson-11-02': [
    card('De la soif à la demande', 'Réutilisez l’état mangetaheta puis le besoin avec mila. Ce sont deux constructions déjà rencontrées.', ['w1.hunger-thirst', 'w1.need'], [['Mangetaheta aho.', 'J’ai soif.'], ['Eny, mila rano aho.', 'Oui, j’ai besoin d’eau.']], 'État → besoin : mangetaheta → mila rano.'),
    card('Vérifier le prix, remercier', 'Retrouvez la question du prix puis la formule de remerciement.', ['w1.price', 'vocab.thanks'], [['Ohatrinona ny vidiny?', 'Quel est son prix ?'], ['Misaotra.', 'Merci.']], 'Une question précise, puis un merci.'),
  ],
  'lesson-12-01': [
    card('Personne, possession, lieu', 'Réutilisez reninao pour ta mère et reniko pour ma mère. Aiza demande où elle est.', ['w1.family-possession', 'w1.question-place', 'w1.location'], [['Aiza ny reninao?', 'Où est ta mère ?'], ['Ao an-trano ny reniko.', 'Ma mère est dans la maison.']], 'Question sur toi : reninao. Réponse sur moi : reniko.'),
    card('Organiser la visite', 'Les quantités et les consignes de déplacement sont déjà connues. Les directions appartiennent au plan fictif du jeu.', ['w1.question-quantity', 'w1.follow-directions'], [['Manana zanaka roa aho.', 'J’ai deux enfants.'], ['Mandehana mahitsy.', 'Va tout droit.'], ['Mivilia ankavanana.', 'Tourne à droite.']], 'Reconnaître la quantité, puis suivre la consigne.'),
  ],
  'lesson-12-02': [
    card('Demander et vérifier', 'Réutilisez noana pour la faim, mila pour le besoin et ohatrinona pour le prix.', ['w1.hunger-thirst', 'w1.need', 'w1.price'], [['Noana aho.', 'J’ai faim.'], ['Eny, mila mofo aho.', 'Oui, j’ai besoin de pain.'], ['Ohatrinona ny vidiny?', 'Quel est son prix ?']], 'Les prix de cette aventure sont fictifs.'),
    card('Garder la main sur l’échange', 'Si vous ne comprenez pas, demandez une répétition lente. Toutes ces formules ont déjà été rencontrées.', ['w1.understand', 'w1.repeat', 'w1.slow'], [['Tsy azoko.', 'Je ne comprends pas.'], ['Avereno moramora, azafady.', 'Répétez lentement, s’il vous plaît.'], ['Eny, azoko.', 'Oui, j’ai compris.']], 'Tsy azoko → avereno moramora → azoko.'),
  ],
};

const CARDS: Record<string, NotionCard[]> = Object.fromEntries(Object.entries(SEEDS).map(([lessonId, seeds]) => [lessonId,
  seeds.map((seed, index): NotionCard => ({
    ...seed,
    id: `notion-${lessonId.slice('lesson-'.length)}-${index + 1}`,
    sourceIds: [...new Set(seed.conceptIds.flatMap(id => CONTENT.concepts.find(concept => concept.id === id)?.sourceIds ?? []))],
    examples: seed.examples.map(([malagasy, french]) => {
      const audio = recordingForTurn({ speaker: 'mia', text: malagasy, translation: french })
        ?? recordingForTurn({ speaker: 'lova', text: malagasy, translation: french });
      return { malagasy, french, ...(audio ? { audioId: audio.id } : {}) };
    }),
  })),
]));

/** Checkpoints deliberately have no reminder that could reveal a quiz answer. */
export function getNotionCards(lessonId: string): NotionCard[] {
  return CARDS[lessonId] ?? [];
}
