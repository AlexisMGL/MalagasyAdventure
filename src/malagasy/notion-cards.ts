import { CONTENT } from './content';
import { recordingForTurn } from './voice-bank';
import type { LearningVisual } from './learning-visual-types';

export type NotionSection = 'vocabulary' | 'notion';

/** A short, authored reminder. Sources stay in the central credits, never in the lesson UI. */
export interface NotionCard {
  id: string;
  section: NotionSection;
  visual: LearningVisual;
  title: string;
  rule: string;
  examples: { malagasy: string; french: string; audioId?: string }[];
  memory?: string;
  conceptIds: string[];
  sourceIds: string[];
  sceneId?: string;
}
type Seed = Omit<NotionCard, 'id' | 'sourceIds' | 'examples'> & { examples: [string, string][] };
const card = (section: NotionSection, visual: LearningVisual, title: string, rule: string, conceptIds: string[], examples: [string, string][], memory?: string): Seed =>
  ({ section, visual, title, rule, conceptIds, examples, ...(memory ? { memory } : {}) });

// All examples reuse the delivered, sourced corpus. The short explanations unpack
// its existing notes; audio always comes from a whole matching utterance.
const SEEDS: Record<string, Seed[]> = {
  'lesson-01-01': [
    card('vocabulary', {"kind":"pictorial","items":[{"picture":"greeting","label":"Salama","caption":"Bonjour"},{"picture":"goodbye","label":"Veloma","caption":"Au revoir"}]}, 'Ouvrir et fermer la rencontre', 'Un mot pour arriver, un mot pour partir.', ['vocab.hello', 'vocab.goodbye'], [['Salama!', 'Bonjour !'], ['Veloma!', 'Au revoir !']], 'Salama : j’arrive. Veloma : je pars.'),
    card('vocabulary', {"kind":"pictorial","items":[{"picture":"thanks","label":"Misaotra","caption":"Merci"},{"picture":"please","label":"Azafady","caption":"Excusez-moi / s’il vous plaît"}]}, 'Merci et excusez-moi', 'Misaotra remercie. Azafady accompagne une demande ou une excuse.', ['vocab.thanks', 'vocab.please'], [['Misaotra!', 'Merci !'], ['Azafady!', 'Excusez-moi ! / S’il vous plaît !']], 'Recevoir une aide → misaotra. Demander → azafady.'),
    card('notion', {"kind":"sounds","items":[{"letter":"o","sound":"ou","word":"Veloma"},{"letter":"y final","sound":"i","word":"Azafady"}]}, 'Deux repères pour lire', 'o se rapproche de « ou ». i et y final se rapprochent du son « i ». Écoutez les mots entiers.', ['grammar.spelling'], [['Veloma!', 'Au revoir ! — repérez le o.'], ['Azafady!', 'Excusez-moi ! — repérez le y final.']], 'o → ou ; i et y final → i. Ce sont des repères de lecture.'),
  ],
  'lesson-01-02': [
    card('vocabulary', {"kind":"pictorial","items":[{"picture":"welcome","label":"Tonga soa","caption":"Bienvenue"},{"picture":"respect","label":"tompoko","caption":"Adresse respectueuse"}]}, 'Accueillir avec respect', 'Tonga soa = bienvenue. Tompoko est une adresse respectueuse.', ['vocab.welcome', 'vocab.respect'], [['Tonga soa!', 'Bienvenue !'], ['Misaotra, tompoko.', 'Merci, avec respect.']], 'Tonga soa accueille ; misaotra remercie.'),
    card('vocabulary', {"kind":"pictorial","items":[{"picture":"yes","label":"Eny","caption":"Oui"},{"picture":"no","label":"Tsia","caption":"Non"}]}, 'Oui ou non', 'Eny répond oui. Tsia répond non.', ['vocab.yes', 'vocab.no'], [['Eny, tompoko.', 'Oui, avec respect.'], ['Tsia, tompoko.', 'Non, avec respect.']], 'Eny = oui ; tsia = non.'),
  ],
  'lesson-02-01': [
    card('notion', {"kind":"sentence","rows":[{"parts":[{"text":"Mia","role":"neutral","caption":"le prénom"},{"text":"no","role":"marker","caption":"mise en relief"},{"text":"anarako","role":"neutral","caption":"mon nom"}]}]}, 'Demander et donner son nom', 'Pour répondre, mettez le prénom devant no anarako. Apprenez la question entière.', ['skill.name'], [['Iza no anaranao?', 'Comment t’appelles-tu ?'], ['Mia no anarako.', 'Je m’appelle Mia.']], 'Prénom + no anarako. no n’est pas un verbe « être ».'),
    card('notion', {"kind":"possession","pairs":[{"base":"nom","mine":"anarako","yours":"anaranao","picture":"name"}]}, 'Mon nom, ton nom', 'Anarako signifie mon nom ; anaranao, ton ou votre nom. La fin du mot indique de qui l’on parle.', ['skill.name'], [['Mia no anarako.', 'Je m’appelle Mia. — anarako : mon nom.'], ['Iza no anaranao?', 'Comment t’appelles-tu ? — anaranao : ton nom.']], 'Dans ces formes : -ko → moi ; -nao → toi. Retenez les mots entiers.'),
    card('vocabulary', {"kind":"pictorial","items":[{"picture":"me","label":"aho","caption":"je"},{"picture":"you","label":"ianao","caption":"tu / vous, une personne"},{"picture":"person","label":"izy","caption":"il / elle"}]}, 'Les personnes : je, tu, il ou elle', 'Aho = je ; ianao = tu ou vous pour une personne ; izy = il ou elle. Repérez ces mots avant de les employer dans les phrases.', ['grammar.singular-pronouns'], [['aho', 'je — pronom sujet'], ['ianao', 'tu / vous — une personne'], ['izy', 'il / elle — sans distinction de genre']], 'Le pronom indique la personne ; il ne contient pas le verbe « être ».'),
  ],
  'lesson-02-02': [
    card('notion', {"kind":"questions","items":[{"word":"Avy aiza","answer":"une provenance","picture":"origin"}]}, 'Demander l’origine', 'Avy aiza demande d’où vient la personne. La question parle de vous avec ianao.', ['skill.origin'], [['Avy aiza ianao?', 'D’où viens-tu ?']], 'aiza cherche un lieu ; avy aiza cherche la provenance.'),
    card('notion', {"kind":"sentence","rows":[{"parts":[{"text":"Avy any Frantsa","role":"place","caption":"la provenance"},{"text":"aho","role":"subject","caption":"qui vient de là ?"}]}]}, 'Dire d’où l’on vient', 'Dans cette réponse : avy any + lieu + aho. Frantsa est le nom du pays France.', ['skill.origin', 'vocab.france'], [['Avy any Frantsa aho.', 'Je viens de France.']], 'Question : ianao. Réponse sur moi : aho.'),
  ],
  'lesson-03-01': [
    card('notion', {"kind":"sentence","rows":[{"parts":[{"text":"Mpiofana","role":"predicate","caption":"le statut"},{"text":"aho","role":"subject","caption":"la personne"}]},{"parts":[{"text":"Salama","role":"predicate","caption":"l’état"},{"text":"aho","role":"subject","caption":"la personne"}]}]}, 'Décrire, puis dire qui', 'Le statut ou l’état vient d’abord ; le sujet vient ensuite. Ici, aucun mot ne traduit « être ».', ['grammar.predicate-first', 'vocab.trainee'], [['Mpiofana aho.', 'Je suis stagiaire.'], ['Salama aho.', 'Je suis en bonne santé.']], 'Mpiofana = le statut ; aho = la personne décrite.'),
    card('notion', {"kind":"sentence","rows":[{"parts":[{"text":"Mpiofana","role":"predicate","caption":"le même statut"},{"text":"aho","role":"subject","caption":"je"}]},{"parts":[{"text":"Mpiofana","role":"predicate","caption":"le même statut"},{"text":"izy","role":"subject","caption":"il / elle"}]}]}, 'Le sujet peut changer', 'Remplacez aho par izy pour parler d’une autre personne. Le sujet désigne ici la personne dont on donne le statut.', ['grammar.predicate-first', 'grammar.singular-pronouns'], [['Mpiofana aho.', 'Je suis stagiaire.'], ['Mpiofana izy.', 'Il ou elle est stagiaire.']], 'Dans ces phrases : statut + sujet. D’autres constructions existent.'),
    card('notion', {"kind":"sentence","rows":[{"parts":[{"text":"ny","role":"marker","caption":"article"},{"text":"mpiofana","role":"neutral","caption":"nom"}]},{"parts":[{"text":"Salama","role":"predicate","caption":"l’état"},{"text":"ny mpiofana","role":"subject","caption":"qui va bien ?"}]}]}, 'ny devant le nom', 'ny introduit le nom : ny mpiofana = le ou la stagiaire dans cette scène. L’article ne marque ni genre ni nombre.', ['grammar.article-ny'], [['Salama ny mpiofana.', 'Le ou la stagiaire est en bonne santé.']], 'Salama décrit ; ny mpiofana indique qui est décrit.'),
  ],
  'lesson-03-02': [
    card('notion', {"kind":"sentence","rows":[{"parts":[{"text":"Mpiofana","role":"predicate","caption":"statut"},{"text":"ve","role":"marker","caption":"question"},{"text":"ianao","role":"subject","caption":"tu / vous ?"}]}]}, 'Une question oui/non avec ve', 'Dans ce modèle, ve se place après le statut ou l’état, avant le sujet.', ['grammar.question-ve'], [['Mpiofana ve ianao?', 'Es-tu stagiaire ?'], ['Eny, mpiofana aho.', 'Oui, je suis stagiaire.']], 'statut + ve + personne ?'),
    card('notion', {"kind":"sentence","rows":[{"parts":[{"text":"Tsia","role":"marker","caption":"répondre non"}]},{"parts":[{"text":"Tsy","role":"marker","caption":"nier la phrase"},{"text":"mpiofana","role":"predicate","caption":"statut"},{"text":"aho","role":"subject","caption":"je"}]}]}, 'Non, et ne… pas', 'Tsia répond non. Tsy, placé devant le statut ou l’état, rend la phrase négative.', ['grammar.negation-tsy'], [['Tsia, tsy mpiofana aho.', 'Non, je ne suis pas stagiaire.']], 'Tsia = une réponse. Tsy = la négation dans la phrase.'),
  ],
  'lesson-04-01': [
    card('vocabulary', {"kind":"pictorial","items":[{"picture":"mother","label":"reny","caption":"mère"},{"picture":"father","label":"ray","caption":"père"},{"picture":"child","label":"zanaka","caption":"enfant de quelqu’un"},{"picture":"family","label":"fianakaviana","caption":"famille"}]}, 'Les liens de famille', 'Ces mots nomment des liens familiaux. Zanaka ne distingue pas fils et fille.', ['w1.family'], [['reny', 'mère'], ['ray', 'père'], ['zanaka', 'enfant de quelqu’un'], ['fianakaviana', 'famille']], 'reny et ray : les parents ; zanaka : leur enfant.'),
    card('notion', {"kind":"sentence","rows":[{"parts":[{"text":"Reny","role":"predicate","caption":"le lien familial"},{"text":"izy","role":"subject","caption":"elle"}]},{"parts":[{"text":"Ray","role":"predicate","caption":"le lien familial"},{"text":"ve","role":"marker","caption":"question"},{"text":"izy","role":"subject","caption":"il ?"}]}]}, 'Présenter une personne', 'La construction est déjà connue : le statut familial précède le sujet izy.', ['w1.family', 'grammar.predicate-first'], [['Reny izy.', 'Elle est mère.'], ['Ray ve izy?', 'Est-il père ?']], 'Lien familial + izy. Ajoutez ve pour poser la question.'),
  ],
  'lesson-04-02': [
    card('notion', {"kind":"possession","pairs":[{"base":"mère","mine":"reniko","yours":"reninao","picture":"mother"},{"base":"père","mine":"raiko","yours":"rainao","picture":"father"}]}, 'Ma mère, ta mère ; mon père, ton père', 'Les fins du nom indiquent le lien avec moi ou avec vous. La forme du nom s’adapte : retenez chaque paire entière.', ['w1.family-possession'], [['Reniko izy.', 'C’est ma mère.'], ['Reninao ve izy?', 'Est-ce ta mère ?'], ['Raiko izy.', 'C’est mon père.'], ['Rainao ve izy?', 'Est-ce ton père ?']], 'reniko ↔ reninao ; raiko ↔ rainao. Ne collez pas le même suffixe partout.'),
    card('notion', {"kind":"possession","pairs":[{"base":"enfant","mine":"zanako","yours":"zanakao","picture":"child"}]}, 'Mon enfant, ton enfant', 'Zanako parle de mon enfant ; zanakao parle du tien ou du vôtre.', ['w1.family-possession'], [['Zanako izy.', 'C’est mon enfant.'], ['Zanakao ve izy?', 'Est-ce ton enfant ?']], 'zanako ↔ zanakao : on garde les formes entières.'),
    card('notion', {"kind":"sentence","rows":[{"parts":[{"text":"Manana","role":"predicate","caption":"avoir"},{"text":"zanaka","role":"object","caption":"ce que l’on a"},{"text":"aho","role":"subject","caption":"qui a ?"}]}]}, 'Dire que l’on a', 'Manana signifie avoir. Dans ce modèle actif : avoir + ce que l’on a + la personne qui a.', ['w1.have'], [['Eny, manana zanaka aho.', 'Oui, j’ai un enfant.'], ['Manana zanaka ve ianao?', 'As-tu un enfant ?'], ['Tsy manana zanaka aho.', 'Je n’ai pas d’enfant.']], 'manana + objet + aho ; tsy devant manana pour nier.'),
  ],
  'lesson-05-01': [
    card('vocabulary', {"kind":"pictorial","items":[{"picture":"house","label":"trano","caption":"maison"},{"picture":"chair","label":"seza","caption":"chaise"},{"picture":"table","label":"latabatra","caption":"table"},{"picture":"book","label":"boky","caption":"livre"}]}, 'La maison et les meubles', 'Les noms ne prennent pas de marque de genre comme en français.', ['w1.house'], [['trano', 'maison'], ['seza', 'chaise'], ['latabatra', 'table'], ['boky', 'livre']], 'trano abrite ; seza pour s’asseoir ; latabatra pour poser ; boky pour lire.'),
    card('notion', {"kind":"sentence","rows":[{"parts":[{"text":"Manana","role":"predicate","caption":"avoir"},{"text":"boky","role":"object","caption":"l’objet"},{"text":"aho","role":"subject","caption":"qui a ?"}]},{"parts":[{"text":"Tsy","role":"marker","caption":"négation"},{"text":"manana","role":"predicate","caption":"avoir"},{"text":"latabatra","role":"object","caption":"l’objet"},{"text":"aho","role":"subject","caption":"qui a ?"}]}]}, 'Réutiliser « avoir »', 'Gardez la construction manana + objet + aho. Seul le nom de l’objet change.', ['w1.house', 'w1.have'], [['Manana boky aho.', 'J’ai un livre.'], ['Tsy manana latabatra aho.', 'Je n’ai pas de table.']], 'Un nouveau nom, une construction déjà connue.'),
  ],
  'lesson-05-02': [
    card('notion', {"kind":"possession","pairs":[{"base":"maison","mine":"tranoko","yours":"tranonao","picture":"house"}]}, 'Ma maison, ta maison', 'Tranoko = ma maison ; tranonao = ta ou votre maison. Le possesseur est indiqué dans la fin du nom.', ['w1.house-possession'], [['Eto ny tranoko.', 'Ma maison est ici.'], ['Eto ve ny tranonao?', 'Ta maison est-elle ici ?']], 'tranoko ↔ tranonao : moi ↔ toi.'),
    card('notion', {"kind":"spatial","items":[{"location":"here","label":"eto","subject":"chair","caption":"ici, à l’endroit où l’on parle"},{"location":"inside","label":"ao an-trano","subject":"mother","caption":"dans la maison, hors de vue"}]}, 'Ici ou à l’intérieur', 'Eto = ici. Dans ces scènes, ao présente un intérieur non visible : ao an-trano = dans la maison.', ['w1.location'], [['Eto ny seza.', 'La chaise est ici.'], ['Ao an-trano ny reniko.', 'Ma mère est dans la maison.']], 'Le lieu d’abord, puis ce qui s’y trouve.'),
    card('notion', {"kind":"spatial","items":[{"location":"above","label":"eo ambony latabatra","subject":"book","caption":"sur la table, visible"},{"location":"below","label":"eo ambany latabatra","subject":"book","caption":"sous la table, visible"}]}, 'Sur ou sous la table', 'Ambony = sur ou au-dessus ; ambany = sous ou au-dessous. Ici, eo présente un endroit proche et visible.', ['w1.location'], [['Eo ambony latabatra ny boky.', 'Le livre est sur la table.'], ['Eo ambany latabatra ny boky.', 'Le livre est sous la table.']], 'ambony ↔ ambany : sur ↔ sous. ao et eo dépendent aussi de ce qui est visible.'),
  ],
  'lesson-06-01': [
    card('notion', {"kind":"sentence","rows":[{"parts":[{"text":"Noana","role":"predicate","caption":"l’état : faim"},{"text":"aho","role":"subject","caption":"qui ?"}]},{"parts":[{"text":"Mangetaheta","role":"predicate","caption":"l’état : soif"},{"text":"aho","role":"subject","caption":"qui ?"}]}]}, 'Faim ou soif', 'En malgache, ces états se disent directement devant aho. On n’utilise pas manana pour traduire le « avoir » français.', ['w1.hunger-thirst'], [['Noana aho.', 'J’ai faim.'], ['Mangetaheta aho.', 'J’ai soif.']], 'noana : faim ; mangetaheta : soif.'),
    card('vocabulary', {"kind":"pictorial","items":[{"picture":"rice","label":"vary","caption":"riz"},{"picture":"bread","label":"mofo","caption":"pain"},{"picture":"banana","label":"akondro","caption":"banane"}]}, 'À manger', 'Trois noms pour comprendre le petit menu.', ['w1.food'], [['vary', 'riz'], ['mofo', 'pain'], ['akondro', 'banane']], 'Écoutez, puis associez chaque mot à son aliment.'),
    card('vocabulary', {"kind":"pictorial","items":[{"picture":"water","label":"rano","caption":"eau"},{"picture":"coffee","label":"kafe","caption":"café"}]}, 'À boire', 'Deux noms à distinguer avant le dialogue.', ['w1.food'], [['rano', 'eau'], ['kafe', 'café']], 'rano pour l’eau ; kafe pour le café.'),
  ],
  'lesson-06-02': [
    card('notion', {"kind":"sentence","rows":[{"parts":[{"text":"Mila","role":"predicate","caption":"avoir besoin"},{"text":"rano","role":"object","caption":"de quoi ?"},{"text":"aho","role":"subject","caption":"qui ?"}]}]}, 'Ce dont j’ai besoin', 'Mila exprime un besoin. Dans ce modèle actif : mila + objet + sujet.', ['w1.need'], [['Mila rano aho, azafady.', 'J’ai besoin d’eau, s’il vous plaît.'], ['Mila mofo ve ianao?', 'As-tu besoin de pain ?']], 'mila = avoir besoin ; azafady rend la demande polie.'),
    card('notion', {"kind":"sentence","rows":[{"parts":[{"text":"Tia","role":"predicate","caption":"aimer"},{"text":"akondro","role":"object","caption":"quoi ?"},{"text":"aho","role":"subject","caption":"qui ?"}]},{"parts":[{"text":"Tsy","role":"marker","caption":"négation"},{"text":"tia","role":"predicate","caption":"aimer"},{"text":"kafe","role":"object","caption":"quoi ?"},{"text":"aho","role":"subject","caption":"qui ?"}]}]}, 'Ce que j’aime', 'Tia exprime un goût. Tsy devant tia signifie que l’on n’aime pas.', ['w1.like'], [['Tia akondro aho.', 'J’aime les bananes.'], ['Tia vary aho.', 'J’aime le riz.'], ['Tsia, tsy tia kafe aho.', 'Non, je n’aime pas le café.']], 'mila = besoin ; tia = goût.'),
  ],
  'lesson-07-01': [
    card('vocabulary', {"kind":"quantity","items":[{"value":0,"label":"aotra","picture":"book"},{"value":1,"label":"iray","picture":"book"},{"value":2,"label":"roa","picture":"book"},{"value":3,"label":"telo","picture":"book"},{"value":4,"label":"efatra","picture":"book"},{"value":5,"label":"dimy","picture":"book"}]}, 'De zéro à cinq', 'Associez chaque nombre écrit à sa valeur. Iray sert ici à dire un seul objet.', ['w1.numbers-ten'], [['aotra', '0'], ['iray', '1'], ['roa', '2'], ['telo, efatra, dimy', '3, 4, 5']], 'aotra = zéro ; iray = un ; roa = deux.'),
    card('vocabulary', {"kind":"quantity","items":[{"value":6,"label":"enina","picture":"book"},{"value":7,"label":"fito","picture":"book"},{"value":8,"label":"valo","picture":"book"},{"value":9,"label":"sivy","picture":"book"},{"value":10,"label":"folo","picture":"book"}]}, 'De six à dix', 'Continuez la suite en deux petits groupes.', ['w1.numbers-ten'], [['enina, fito, valo', '6, 7, 8'], ['sivy, folo', '9, 10']], 'enina 6 · fito 7 · valo 8 · sivy 9 · folo 10.'),
    card('notion', {"kind":"sentence","rows":[{"parts":[{"text":"boky","role":"object","caption":"le nom"},{"text":"roa","role":"quantity","caption":"le nombre"}]},{"parts":[{"text":"Manana","role":"predicate","caption":"avoir"},{"text":"boky roa","role":"object","caption":"deux livres"},{"text":"aho","role":"subject","caption":"qui ?"}]}]}, 'Compter des objets', 'Dans ces groupes, le nombre vient après le nom : boky roa = deux livres.', ['w1.numbers-ten'], [['Manana boky roa aho.', 'J’ai deux livres.'], ['Manana seza iray aho.', 'J’ai une chaise.'], ['Manana latabatra telo aho.', 'J’ai trois tables.']], 'nom + nombre ; puis aho dans la phrase avec manana.'),
  ],
  'lesson-07-02': [
    card('vocabulary', {"kind":"quantity","items":[{"value":11,"label":"iraika ambin'ny folo","picture":"book"},{"value":12,"label":"roa ambin'ny folo","picture":"book"},{"value":13,"label":"telo ambin'ny folo","picture":"book"},{"value":14,"label":"efatra ambin'ny folo","picture":"book"},{"value":15,"label":"dimy ambin'ny folo","picture":"book"}]}, 'De onze à quinze', 'Cinq nombres à reconnaître et à écouter, de onze à quinze.', ['w1.numbers-twenty'], [["iraika ambin'ny folo", '11'], ["roa ambin'ny folo, telo ambin'ny folo", '12, 13'], ["efatra ambin'ny folo, dimy ambin'ny folo", '14, 15']], 'Repérez les valeurs : onze, douze, treize, quatorze, quinze.'),
    card('vocabulary', {"kind":"quantity","items":[{"value":16,"label":"enina ambin'ny folo","picture":"book"},{"value":17,"label":"fito ambin'ny folo","picture":"book"},{"value":18,"label":"valo ambin'ny folo","picture":"book"},{"value":19,"label":"sivy ambin'ny folo","picture":"book"},{"value":20,"label":"roapolo","picture":"book"}]}, 'De seize à vingt', 'Cinq nombres à reconnaître et à écouter, de seize à vingt.', ['w1.numbers-twenty'], [["enina ambin'ny folo", '16'], ["fito ambin'ny folo, valo ambin'ny folo", '17, 18'], ["sivy ambin'ny folo, roapolo", '19, 20']], 'roapolo = vingt.'),
    card('notion', {"kind":"sentence","rows":[{"parts":[{"text":"ny","role":"marker","caption":"article devant le nom"},{"text":"vidiny","role":"neutral","caption":"son prix : -ny à la fin du mot"}]}]}, 'Demander le prix', 'Vidiny = son prix : -ny est ici une fin de mot possessive, différente de ny placé devant le nom. Ariary nomme la monnaie.', ['w1.price', 'grammar.article-ny'], [['Ohatrinona ny vidiny?', 'Quel est le prix ?'], ['Ariary folo.', 'Dix ariary.']], 'Apprenez la question entière. Les montants du jeu sont fictifs.'),
  ],
  'lesson-08-01': [
    card('notion', {"kind":"questions","items":[{"word":"Iza","answer":"une personne","picture":"person"}]}, 'Qui ?', 'Iza demande l’identité d’une personne. Ianao désigne la personne à qui l’on parle.', ['w1.question-person'], [['Iza ianao?', 'Qui es-tu ?']], 'iza → une personne.'),
    card('notion', {"kind":"questions","items":[{"word":"Inona","answer":"une chose ou une information","picture":"work"}]}, 'Quoi ? Quel ?', 'Inona demande une chose ou une information. Ici, asanao signifie ton ou votre travail.', ['w1.question-thing'], [['Inona ny asanao?', 'Quel est ton travail ?']], 'inona → une information ; asanao → ton travail.'),
    card('notion', {"kind":"questions","items":[{"word":"Aiza","answer":"un lieu","picture":"house"}]}, 'Où ?', 'Aiza demande un lieu. La réponse commence ici par le lieu.', ['w1.question-place'], [['Aiza ny boky?', 'Où est le livre ?'], ['Eto ny boky.', 'Le livre est ici.']], 'aiza → un lieu ; eto → ici.'),
  ],
  'lesson-08-02': [
    card('notion', {"kind":"questions","items":[{"word":"Firy","answer":"une quantité","picture":"number"}]}, 'Combien d’objets ou de personnes ?', 'Firy demande une quantité. Le nom vient avant firy dans cette question.', ['w1.question-quantity'], [['Manana zanaka firy ianao?', 'Combien d’enfants as-tu ?'], ['Manana zanaka roa aho.', 'J’ai deux enfants.']], 'firy → un nombre.'),
    card('notion', {"kind":"questions","items":[{"word":"Firy","answer":"une quantité","picture":"number"},{"word":"Ohatrinona","answer":"un prix","picture":"coin"}]}, 'Combien ça coûte ?', 'Ohatrinona demande ici un prix ; firy demande une quantité. Écoutez la question pour choisir la bonne réponse.', ['w1.question-quantity', 'w1.price'], [['Ohatrinona ny vidiny?', 'Quel est son prix ?'], ['Ariary folo.', 'Dix ariary.']], 'firy : combien d’enfants ? ohatrinona : à quel prix ?'),
  ],
  'lesson-09-01': [
    card('vocabulary', {"kind":"pictorial","items":[{"picture":"market","label":"tsena","caption":"marché"}]}, 'Trouver le marché', 'Tsena signifie marché. Aiza demande où il se trouve.', ['w1.market'], [['Aiza ny tsena?', 'Où est le marché ?']], 'tsena → marché.'),
    card('vocabulary', {"kind":"directions","items":[{"direction":"left","label":"ankavia"},{"direction":"right","label":"ankavanana"}]}, 'À gauche ou à droite', 'Ankavia = à gauche ; ankavanana = à droite. Suivez la flèche pour mémoriser les deux côtés.', ['w1.left-right'], [['Ankavia ny tsena.', 'Le marché est à gauche.'], ['Ankavanana ny trano.', 'La maison est à droite.']], 'Ces scènes utilisent un plan fictif.'),
  ],
  'lesson-09-02': [
    card('notion', {"kind":"directions","items":[{"direction":"straight","label":"Mandehana mahitsy."}]}, 'Aller tout droit', 'Mandehana donne la consigne « va ». Mahitsy précise « tout droit ». C’est un impératif du verbe actif mandeha.', ['w1.follow-directions'], [['Mandehana mahitsy.', 'Va tout droit.']], 'mandeha : aller ; mandehana : va.'),
    card('notion', {"kind":"directions","items":[{"direction":"left","label":"Mivilia ankavia."},{"direction":"right","label":"Mivilia ankavanana."}]}, 'Tourner', 'Mivilia signifie « tourne » : c’est l’impératif du verbe actif mivily. Ajoutez le côté.', ['w1.follow-directions'], [['Mivilia ankavia.', 'Tourne à gauche.'], ['Mivilia ankavanana.', 'Tourne à droite.']], 'mivilia + ankavia / ankavanana.'),
  ],
  'lesson-10-01': [
    card('vocabulary', {"kind":"pictorial","items":[{"picture":"tired","label":"reraka","caption":"fatigué / fatiguée"}]}, 'Être fatigué', 'Reraka décrit la fatigue. Reliez le mot au personnage qui a besoin de repos.', ['w1.rest'], [['Reraka aho.', 'Je suis fatigué ou fatiguée.']], 'reraka = fatigué ou fatiguée.'),
    card('notion', {"kind":"sentence","rows":[{"parts":[{"text":"Te","role":"marker","caption":"le souhait"},{"text":"hatory","role":"predicate","caption":"dormir"},{"text":"aho","role":"subject","caption":"qui ?"}]},{"parts":[{"text":"Te","role":"marker","caption":"le souhait"},{"text":"hisotro","role":"predicate","caption":"boire"},{"text":"rano","role":"object","caption":"de l’eau"},{"text":"aho","role":"subject","caption":"qui ?"}]}]}, 'Dire ce que l’on veut faire', 'Te exprime le souhait, suivi ici de hisotro ou hatory. Apprenez ces formes entières : on n’ajoute pas h à n’importe quel mot.', ['w1.want'], [['Te hatory aho.', 'Je veux dormir.'], ['Te hisotro rano aho.', 'Je veux boire de l’eau.']], 'te hatory : vouloir dormir ; te hisotro : vouloir boire.'),
    card('vocabulary', {"kind":"pictorial","items":[{"picture":"toilet","label":"kabone","caption":"toilettes"}]}, 'Demander les toilettes', 'Kabone nomme les toilettes. Repérez ce mot dans la question complète.', ['w1.facilities'], [['Aiza ny kabone?', 'Où sont les toilettes ?'], ['Ankavanana ny kabone.', 'Les toilettes sont à droite.']], 'kabone = toilettes.'),
  ],
  'lesson-10-02': [
    card('notion', {"kind":"possession","pairs":[{"base":"compris","mine":"azoko","yours":"azonao","picture":"understand"}]}, 'Je comprends, tu comprends', 'Azoko et azonao viennent de azo, « compris » ici. -ko désigne la personne qui comprend (moi), -nao l’interlocuteur.', ['w1.understand'], [['Tsy azoko.', 'Je ne comprends pas.'], ['Azonao ve?', 'As-tu compris ?'], ['Eny, azoko.', 'Oui, j’ai compris.']], 'Ces formes ne suivent pas le modèle d’un verbe actif + aho.'),
    card('notion', {"kind":"sentence","rows":[{"parts":[{"text":"Avereno","role":"predicate","caption":"ce qui a été dit → à répéter"},{"text":"azafady","role":"marker","caption":"demande polie"}]}]}, 'Demander de répéter', 'Avereno est une demande de répétition : c’est l’impératif d’une forme passive. Ce qui doit être répété reste implicite.', ['w1.repeat'], [['Avereno, azafady.', 'Répétez, s’il vous plaît.']], 'Avereno + azafady : une formule à garder entière.'),
    card('notion', {"kind":"sentence","rows":[{"parts":[{"text":"Avereno","role":"predicate","caption":"répétez"},{"text":"moramora","role":"neutral","caption":"comment ? lentement"},{"text":"azafady","role":"marker","caption":"s’il vous plaît"}]}]}, 'Plus lentement', 'Moramora précise doucement ou lentement. Ajoutez-le à la demande de répétition.', ['w1.slow'], [['Avereno moramora, azafady.', 'Répétez lentement, s’il vous plaît.']], 'Avereno : répétez. Moramora : lentement.'),
  ],
  'lesson-11-01': [
    card('notion', {"kind":"questions","items":[{"word":"Iza no anaranao?","answer":"le prénom","picture":"name"},{"word":"Avy aiza ianao?","answer":"la provenance","picture":"origin"}]}, 'Retrouver la bonne information', 'Ces notions sont déjà connues. Le nom et l’origine répondent à deux questions différentes.', ['skill.name', 'skill.origin'], [['Iza no anaranao?', 'Comment t’appelles-tu ?'], ['Avy aiza ianao?', 'D’où viens-tu ?']], 'Nom → prénom. Origine → lieu.'),
    card('notion', {"kind":"sentence","rows":[{"parts":[{"text":"zanaka","role":"object","caption":"enfants"},{"text":"firy","role":"quantity","caption":"combien ?"}]},{"parts":[{"text":"zanaka","role":"object","caption":"enfants"},{"text":"roa","role":"quantity","caption":"deux"}]}]}, 'Passer à la famille', 'Firy demande une quantité ; dans la réponse, le nombre suit zanaka.', ['w1.question-quantity', 'w1.family'], [['Manana zanaka firy ianao?', 'Combien d’enfants as-tu ?'], ['Manana zanaka roa aho.', 'J’ai deux enfants.']], 'Écoutez ce qui est demandé avant de choisir la réponse.'),
  ],
  'lesson-11-02': [
    card('notion', {"kind":"sentence","rows":[{"parts":[{"text":"Mangetaheta","role":"predicate","caption":"avoir soif"},{"text":"aho","role":"subject","caption":"qui ?"}]},{"parts":[{"text":"Mila","role":"predicate","caption":"avoir besoin"},{"text":"rano","role":"object","caption":"d’eau"},{"text":"aho","role":"subject","caption":"qui ?"}]}]}, 'De la soif à la demande', 'Réutilisez l’état mangetaheta puis le besoin avec mila. Ce sont deux constructions déjà rencontrées.', ['w1.hunger-thirst', 'w1.need'], [['Mangetaheta aho.', 'J’ai soif.'], ['Eny, mila rano aho.', 'Oui, j’ai besoin d’eau.']], 'État → besoin : mangetaheta → mila rano.'),
    card('notion', {"kind":"questions","items":[{"word":"Ohatrinona ny vidiny?","answer":"un prix en ariary","picture":"coin"}]}, 'Vérifier le prix, remercier', 'Retrouvez la question du prix puis la formule de remerciement.', ['w1.price', 'vocab.thanks'], [['Ohatrinona ny vidiny?', 'Quel est son prix ?'], ['Misaotra.', 'Merci.']], 'Une question précise, puis un merci.'),
  ],
  'lesson-12-01': [
    card('notion', {"kind":"possession","pairs":[{"base":"mère","mine":"reniko","yours":"reninao","picture":"mother"}]}, 'Personne, possession, lieu', 'Réutilisez reninao pour ta mère et reniko pour ma mère. Aiza demande où elle est.', ['w1.family-possession', 'w1.question-place', 'w1.location'], [['Aiza ny reninao?', 'Où est ta mère ?'], ['Ao an-trano ny reniko.', 'Ma mère est dans la maison.']], 'Question sur toi : reninao. Réponse sur moi : reniko.'),
    card('notion', {"kind":"directions","items":[{"direction":"straight","label":"Mandehana mahitsy."},{"direction":"right","label":"Mivilia ankavanana."}]}, 'Organiser la visite', 'Les quantités et les consignes de déplacement sont déjà connues. Les directions appartiennent au plan fictif du jeu.', ['w1.question-quantity', 'w1.follow-directions'], [['Manana zanaka roa aho.', 'J’ai deux enfants.'], ['Mandehana mahitsy.', 'Va tout droit.'], ['Mivilia ankavanana.', 'Tourne à droite.']], 'Reconnaître la quantité, puis suivre la consigne.'),
  ],
  'lesson-12-02': [
    card('notion', {"kind":"sentence","rows":[{"parts":[{"text":"Mila","role":"predicate","caption":"avoir besoin"},{"text":"mofo","role":"object","caption":"de pain"},{"text":"aho","role":"subject","caption":"qui ?"}]}]}, 'Demander et vérifier', 'Réutilisez noana pour la faim, mila pour le besoin et ohatrinona pour le prix.', ['w1.hunger-thirst', 'w1.need', 'w1.price'], [['Noana aho.', 'J’ai faim.'], ['Eny, mila mofo aho.', 'Oui, j’ai besoin de pain.'], ['Ohatrinona ny vidiny?', 'Quel est son prix ?']], 'Les prix de cette aventure sont fictifs.'),
    card('notion', {"kind":"sentence","rows":[{"parts":[{"text":"Tsy azoko.","role":"neutral","caption":"je ne comprends pas"}]},{"parts":[{"text":"Avereno","role":"predicate","caption":"répétez"},{"text":"moramora","role":"neutral","caption":"lentement"},{"text":"azafady","role":"marker","caption":"s’il vous plaît"}]}]}, 'Garder la main sur l’échange', 'Si vous ne comprenez pas, demandez une répétition lente. Toutes ces formules ont déjà été rencontrées.', ['w1.understand', 'w1.repeat', 'w1.slow'], [['Tsy azoko.', 'Je ne comprends pas.'], ['Avereno moramora, azafady.', 'Répétez lentement, s’il vous plaît.'], ['Eny, azoko.', 'Oui, j’ai compris.']], 'Tsy azoko → avereno moramora → azoko.'),
  ],
};

// A section can recall useful words even when the part introduces only grammar.
const EXTRAS: Record<string, Seed[]> = {
  'lesson-01-02': [
    card("notion", {"kind":"sentence","rows":[{"parts":[{"text":"Misaotra","role":"neutral","caption":"remerciement"},{"text":"tompoko","role":"marker","caption":"respect"}]}]}, "Ajouter une adresse respectueuse", "Tompoko accompagne ici le remerciement et marque le respect envers la personne à qui l’on parle.", ["vocab.respect","vocab.thanks"], [["Misaotra, tompoko.","Merci, avec respect."]], "La même intention, avec une adresse respectueuse."),
  ],
  'lesson-02-02': [
    card("vocabulary", {"kind":"pictorial","items":[{"picture":"france","label":"Frantsa","caption":"France"}]}, "Le pays nommé dans la rencontre", "Frantsa est le nom du pays France. Écoutez le mot avant de le retrouver dans une phrase.", ["vocab.france"], [["Frantsa","France"]], "Frantsa = France ; l’origine sera donnée dans la phrase."),
  ],
  'lesson-03-01': [
    card("vocabulary", {"kind":"pictorial","items":[{"picture":"work","label":"mpiofana","caption":"stagiaire"},{"picture":"person","label":"salama","caption":"en bonne santé"}]}, "Un statut et un état", "Mpiofana nomme le statut de stagiaire. Salama peut aussi décrire une personne en bonne santé.", ["vocab.trainee","vocab.hello"], [["mpiofana","stagiaire"],["Salama aho.","Je suis en bonne santé."]], "Deux sens de salama déjà rencontrés : bonjour et en bonne santé."),
  ],
  'lesson-03-02': [
    card("vocabulary", {"kind":"pictorial","items":[{"picture":"yes","label":"Eny","caption":"Oui"},{"picture":"no","label":"Tsia","caption":"Non"}]}, "Les réponses courtes à retrouver", "Eny et tsia sont déjà connus : ils ouvrent une réponse affirmative ou négative.", ["vocab.yes","vocab.no"], [["Eny","Oui"],["Tsia","Non"]], "Eny répond oui ; tsia répond non."),
  ],
  'lesson-04-02': [
    card("vocabulary", {"kind":"pictorial","items":[{"picture":"mother","label":"reny","caption":"mère"},{"picture":"father","label":"ray","caption":"père"},{"picture":"child","label":"zanaka","caption":"enfant de quelqu’un"}]}, "Les liens avant les possessifs", "Retrouvez les trois noms de famille. Les notions montreront ensuite leurs formes liées à moi ou à toi.", ["w1.family"], [["reny","mère"],["ray","père"],["zanaka","enfant de quelqu’un"]], "Des liens familiaux à associer aux personnages."),
  ],
  'lesson-05-02': [
    card("vocabulary", {"kind":"pictorial","items":[{"picture":"house","label":"trano","caption":"maison"},{"picture":"table","label":"latabatra","caption":"table"},{"picture":"book","label":"boky","caption":"livre"}]}, "Les objets à retrouver", "Avant de chercher les objets, retrouvez leurs noms déjà connus.", ["w1.house"], [["trano","maison"],["latabatra","table"],["boky","livre"]], "La maison, la table, le livre. Les notions montreront où ils sont."),
  ],
  'lesson-06-02': [
    card("vocabulary", {"kind":"pictorial","items":[{"picture":"need","label":"mila","caption":"avoir besoin"},{"picture":"like","label":"tia","caption":"aimer"}]}, "Deux mots, deux intentions", "Mila exprime un besoin ; tia exprime un goût. Reliez chaque mot à son intention.", ["w1.need","w1.like"], [["mila","avoir besoin"],["tia","aimer"]], "Besoin et goût sont deux informations différentes."),
  ],
  'lesson-07-02': [
    card("notion", {"kind":"sentence","rows":[{"parts":[{"text":"roa","role":"quantity","caption":"deux"},{"text":"ambin’ny","role":"marker","caption":"le lien"},{"text":"folo","role":"quantity","caption":"dix"}]}]}, "Construire les nombres de onze à dix-neuf", "L’unité vient avant ambin’ny folo. Onze emploie iraika dans la forme étudiée, pas iray.", ["w1.numbers-twenty"], [["iraika ambin'ny folo","Onze"],["roa ambin'ny folo, telo ambin'ny folo","Douze, treize"]], "Deux puis dix dans le mot-nombre : roa ambin’ny folo = douze."),
  ],
  'lesson-08-01': [
    card("vocabulary", {"kind":"pictorial","items":[{"picture":"person","label":"iza","caption":"qui"},{"picture":"book","label":"inona","caption":"quoi / quel"},{"picture":"house","label":"aiza","caption":"où"}]}, "Les trois mots interrogatifs", "Trois mots à reconnaître : une personne, une chose ou une information, un lieu.", ["w1.question-person","w1.question-thing","w1.question-place"], [["iza","qui"],["inona","quoi / quel"],["aiza","où"]], "Les notions montreront quel type de réponse chaque mot appelle."),
  ],
  'lesson-08-02': [
    card("vocabulary", {"kind":"quantity","items":[{"value":2,"label":"roa","picture":"book"},{"value":10,"label":"folo","picture":"coin"}]}, "Deux quantités utiles", "Retrouvez deux nombres déjà appris pour comprendre les réponses.", ["w1.numbers-ten"], [["roa","deux"],["folo","dix"]], "roa = 2 ; folo = 10."),
  ],
  'lesson-09-01': [
    card("notion", {"kind":"sentence","rows":[{"parts":[{"text":"Ankavia","role":"place","caption":"le lieu"},{"text":"ny tsena","role":"subject","caption":"ce que l’on situe"}]},{"parts":[{"text":"Ankavanana","role":"place","caption":"le lieu"},{"text":"ny trano","role":"subject","caption":"ce que l’on situe"}]}]}, "Le lieu ouvre la phrase", "Dans ces descriptions, le lieu vient avant la chose située. Aucun mot ne traduit le verbe être français.", ["w1.left-right","grammar.predicate-first"], [["Ankavia ny tsena.","Le marché est à gauche."],["Ankavanana ny trano.","La maison est à droite."]], "Le lieu d’abord, puis ce qui s’y trouve."),
  ],
  'lesson-09-02': [
    card("vocabulary", {"kind":"directions","items":[{"direction":"left","label":"ankavia"},{"direction":"right","label":"ankavanana"}]}, "Les repères du trajet", "Retrouvez les deux côtés déjà connus avant de suivre les consignes.", ["w1.left-right"], [["ankavia","à gauche"],["ankavanana","à droite"]], "Deux côtés à reconnaître sur le plan fictif."),
  ],
  'lesson-10-02': [
    card("vocabulary", {"kind":"pictorial","items":[{"picture":"understand","label":"azoko","caption":"j’ai compris"},{"picture":"repeat","label":"avereno","caption":"répétez"},{"picture":"slow","label":"moramora","caption":"lentement / doucement"}]}, "Trois mots pour se faire aider", "Reconnaissez ces formules avant de regarder leur construction. Elles permettent de garder la main sur l’échange.", ["w1.understand","w1.repeat","w1.slow"], [["azoko","j’ai compris"],["avereno","répétez"],["moramora","lentement / doucement"]], "Comprendre, faire répéter, demander plus lentement."),
  ],
  'lesson-11-01': [
    card("vocabulary", {"kind":"pictorial","items":[{"picture":"me","label":"aho","caption":"je"},{"picture":"you","label":"ianao","caption":"tu / vous"},{"picture":"family","label":"fianakaviana","caption":"famille"}]}, "Les personnes de la rencontre", "Retrouvez ces mots connus pour suivre la présentation des personnages.", ["grammar.singular-pronouns","w1.family"], [["aho","je"],["ianao","tu / vous, une personne"],["fianakaviana","famille"]], "Les notions aident à relier ces mots dans la conversation."),
  ],
  'lesson-11-02': [
    card("vocabulary", {"kind":"pictorial","items":[{"picture":"water","label":"rano","caption":"eau"},{"picture":"bread","label":"mofo","caption":"pain"},{"picture":"coffee","label":"kafe","caption":"café"}]}, "Les mots du petit repas", "Ces trois noms ont déjà été rencontrés. Retrouvez-les avant la demande.", ["w1.food"], [["rano","eau"],["mofo","pain"],["kafe","café"]], "Une image, un mot, puis la demande dans le dialogue."),
  ],
  'lesson-12-01': [
    card("vocabulary", {"kind":"pictorial","items":[{"picture":"mother","label":"reny","caption":"mère"},{"picture":"house","label":"trano","caption":"maison"},{"picture":"child","label":"zanaka","caption":"enfant de quelqu’un"}]}, "Les personnes et le lieu à retrouver", "Reprenez les mots utiles à la visite. Les notions combineront possession, lieu et déplacement.", ["w1.family","w1.house"], [["reny","mère"],["trano","maison"],["zanaka","enfant de quelqu’un"]], "Un rappel des mots déjà appris."),
  ],
  'lesson-12-02': [
    card("vocabulary", {"kind":"pictorial","items":[{"picture":"bread","label":"mofo","caption":"pain"},{"picture":"water","label":"rano","caption":"eau"},{"picture":"coin","label":"ariary","caption":"monnaie"}]}, "Les mots du dernier échange", "Retrouvez ces mots déjà connus avant de faire votre demande et de vérifier le prix.", ["w1.food","w1.price"], [["mofo","pain"],["rano","eau"],["Ariary folo.","Dix ariary."]], "Les valeurs du jeu servent à pratiquer les nombres."),
  ],
};

const CARDS: Record<string, NotionCard[]> = Object.fromEntries(Object.entries(SEEDS).map(([lessonId, seeds]) => [lessonId,
  [...seeds, ...(EXTRAS[lessonId] ?? [])].sort((a, b) => Number(a.section === 'notion') - Number(b.section === 'notion')).map((seed, index): NotionCard => ({
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
