import type { Source } from './types';
import type { LearningPicture } from './learning-visual-types';

/** Whole forms already used in the delivered corpus, with a gloss for their actual context. */
export const VOCABULARY_SUPPLEMENTS: { malagasy: string; french: string; lessonId: string; picture: LearningPicture; note: string }[] = [
  { malagasy: 'no', french: 'mise en relief', lessonId: 'lesson-02-01', picture: 'focus', note: 'Mot-outil dans Mia no anarako. Il ne se traduit pas par un verbe être.' },
  { malagasy: 'avy', french: 'venir de', lessonId: 'lesson-02-02', picture: 'origin', note: 'Dans la question avy aiza et la réponse avy any + lieu.' },
  { malagasy: 'any', french: 'là-bas, hors de vue', lessonId: 'lesson-02-02', picture: 'place', note: 'Repère de lieu dans avy any Frantsa. Distinguez-le de eto, ici.' },
  { malagasy: 'salama', french: 'en bonne santé', lessonId: 'lesson-03-01', picture: 'person', note: 'Dans Salama aho. Le même mot sert aussi de salutation.' },
  { malagasy: 'ao', french: 'là, à l’intérieur, hors de vue', lessonId: 'lesson-05-02', picture: 'house', note: 'Dans ao an-trano ; le repère intérieur est ici non visible.' },
  { malagasy: 'an-trano', french: 'dans la maison / à la maison', lessonId: 'lesson-05-02', picture: 'house', note: 'Forme de lieu apprise entière, dans ao an-trano.' },
  { malagasy: 'eo', french: 'ici, à un endroit visible', lessonId: 'lesson-05-02', picture: 'place', note: 'Repère visible, dans eo ambony / eo ambany latabatra.' },
  { malagasy: 'ambony', french: 'au-dessus / sur', lessonId: 'lesson-05-02', picture: 'above', note: 'Dans eo ambony latabatra : sur la table.' },
  { malagasy: 'ambany', french: 'au-dessous / sous', lessonId: 'lesson-05-02', picture: 'below', note: 'Dans eo ambany latabatra : sous la table.' },
  { malagasy: 'noana', french: 'avoir faim', lessonId: 'lesson-06-01', picture: 'hungry', note: 'État dans Noana aho : j’ai faim.' },
  { malagasy: 'mangetaheta', french: 'avoir soif', lessonId: 'lesson-06-01', picture: 'thirsty', note: 'État dans Mangetaheta aho : j’ai soif.' },
  { malagasy: 'ohatrinona', french: 'combien (prix)', lessonId: 'lesson-07-02', picture: 'coin', note: 'Demande ici un prix, à distinguer de firy pour un nombre.' },
  { malagasy: 'vidiny', french: 'son prix', lessonId: 'lesson-07-02', picture: 'coin', note: 'Forme entière dans Ohatrinona ny vidiny ?' },
  { malagasy: 'asanao', french: 'ton / votre travail', lessonId: 'lesson-08-01', picture: 'work', note: 'Dans Inona ny asanao ? : quel est ton travail ? Forme possédée du nom asa.' },
  { malagasy: 'mandehana', french: 'va / allez', lessonId: 'lesson-09-02', picture: 'origin', note: 'Impératif dans Mandehana mahitsy : va tout droit.' },
  { malagasy: 'mahitsy', french: 'tout droit', lessonId: 'lesson-09-02', picture: 'origin', note: 'Sens de déplacement dans Mandehana mahitsy, sans généraliser tous les sens du mot.' },
  { malagasy: 'mivilia', french: 'tourne / tournez', lessonId: 'lesson-09-02', picture: 'origin', note: 'Impératif : mivilia ankavia / ankavanana.' },
  { malagasy: 'reraka', french: 'fatigué·e', lessonId: 'lesson-10-01', picture: 'tired', note: 'État dans Reraka aho : je suis fatigué·e.' },
  { malagasy: 'te', french: 'vouloir (faire quelque chose)', lessonId: 'lesson-10-01', picture: 'need', note: 'Mot-outil dans te hatory / te hisotro. Les formes après te sont apprises entières.' },
  { malagasy: 'hatory', french: 'dormir (après te)', lessonId: 'lesson-10-01', picture: 'sleep', note: 'Dans te hatory. Ne remplacez pas cette forme par matory dans la formule.' },
  { malagasy: 'hisotro', french: 'boire (après te)', lessonId: 'lesson-10-01', picture: 'drink', note: 'Dans te hisotro rano. Ne généralisez pas à toutes les formes verbales.' },
  { malagasy: 'azoko', french: 'je comprends / j’ai compris', lessonId: 'lesson-10-02', picture: 'understand', note: 'Formule du cours ; la personne qui comprend est indiquée par -ko, sans ajouter aho.' },
  { malagasy: 'azonao', french: 'tu comprends / vous comprenez', lessonId: 'lesson-10-02', picture: 'understand', note: 'Dans Azonao ve ? : as-tu compris ? La fin renvoie à la personne qui comprend.' },
  { malagasy: 'avereno', french: 'répétez / redis', lessonId: 'lesson-10-02', picture: 'repeat', note: 'Impératif dans Avereno, azafady. Ce n’est pas un verbe actif suivi de aho.' },
  { malagasy: "amin'ny", french: 'à / au moment de', lessonId: 'lesson-02-02-01', picture: 'clock', note: 'Dans les groupes temporels du cours : amin’ny maraina et amin’ny + heure. Ce mot a d’autres emplois.' },
  { malagasy: 'teny', french: 'langue / mot', lessonId: 'lesson-02-05-01', picture: 'book', note: 'Dans teny malagasy : la langue malgache.' },
  { malagasy: 'malagasy', french: 'malgache', lessonId: 'lesson-02-05-01', picture: 'book', note: 'Dans teny malagasy : la langue malgache.' },
  { malagasy: 'mamaky', french: 'lire', lessonId: 'lesson-02-08-01', picture: 'read', note: 'Sens de mamaky boky, lire un livre ; le verbe possède d’autres sens.' },
  { malagasy: 'manasa', french: 'laver', lessonId: 'lesson-02-09-01', picture: 'wash', note: 'Sens de ces scènes : manasa vilia / vera, laver la vaisselle. Le mot possède d’autres emplois.' },
  { malagasy: 'mahandro', french: 'faire cuire / cuisiner', lessonId: 'lesson-02-09-01', picture: 'cook', note: 'Dans mahandro vary : faire cuire du riz.' },
];

export const VOCABULARY_SOURCES: Source[] = ['asa', 'any', 'eo'].map(word => ({
  id: `vocabulary-dict-${word}`, title: `Dictionnaire malgache : ${word}`,
  author: 'Dictionnaire malgache et Encyclopédie de Madagascar — lexicographes cités dans chaque entrée',
  url: `https://malagasyword.org/bins/teny2/${word}`, category: 'dictionary', consulted: true,
  supports: word === 'asa' ? 'Travail et forme possédée asanao, déjà présente dans la question de l’unité 8.' : 'Sens du repère de lieu dans les phrases déjà publiées ; distinction visible / hors de vue.',
  license: 'Consultation lexicographique ; gloses reformulées, aucune définition longue reproduite.',
}));
