# Malagasy Adventure — ajouter du contenu

## Contrat de publication

Le contenu vit dans `src/malagasy/content.ts` et les modules de données qu’il importe ; la présentation ne doit pas contenir les corpus. Les interfaces de `types.ts` sont le contrat. Les mondes planifiés se trouvent dans `worlds.ts`.

Lire d’abord [les consignes propres à l’app](../src/malagasy/AGENTS.md). Le périmètre livré couvre désormais les douze unités du monde 1 ; les mondes 2–20 restent verrouillés. La demande d’achèvement remplace l’ancienne limite aux unités 1–3. Les données des unités 4–12 sont dans `world-one-units-04-07.ts` et `world-one-units-08-12.ts`, fusionnées au même registre sans renommer les IDs initiaux.

Un contenu est publiable lorsque ses références sont valides, ses concepts ont été présentés avant évaluation et ses réponses sont étayées par des sources réellement consultées. La quantité n’est pas un critère de qualité. Ne pas rendre une destination jouable simplement pour remplir la carte.

## Ajouter une unité et ses leçons

1. Choisir des identifiants stables et descriptifs. Ne jamais renommer un ID déjà livré sans migration des sauvegardes.
2. Ajouter ou vérifier chaque source dans `Content.sources`, avec URL directe, auteur, usage précis et statut de consultation. Les permissions d’un enregistrement ne se déduisent pas de son accès public.
3. Ajouter les concepts avec `introducedIn`, leurs prérequis et leurs sources. Un concept de grammaire désigne une capacité identifiable, pas une catégorie française imposée au malgache.
4. Ajouter les entrées de vocabulaire avec traduction, note de contexte et `conceptId`.
5. Créer les leçons : objectifs, scènes de découverte, notes facultatives, nouveaux concepts, concepts revus, exercices, prérequis et durée estimée. Le dialogue présente d’abord les expressions ; les notes ne sont pas une longue lecture préalable.
6. Ajouter l’unité et ses `lessonIds`, puis vérifier le rattachement de chaque leçon. Terminer par un quiz cumulatif complet de type `checkpoint` couvrant tous les concepts de l’unité ; les quiz actuels ont douze questions chacun.
7. Exécuter le validateur de contenu et les tests. Passer l’unité à `implemented: true` seulement quand toutes ses leçons sont utilisables.

Un prérequis de leçon est un ID de leçon terminée. Un prérequis de concept est un ID de concept déjà présenté. Les prérequis des mondes constituent la planification des destinations. Ces trois graphes ne sont pas interchangeables.

## Exercices

Chaque exercice fournit : ID, type, consigne, question, réponses acceptées, explication, concepts, difficulté et sources. Selon le type :

| Type | Configuration |
| --- | --- |
| `choice`, `reading`, `dialogue`, `culture` | `choices` inclut toutes les réponses acceptées ; utiliser `dialogue` pour la scène en bulles et garder la consigne courte. |
| `translate`, `cloze` | Déclarer explicitement les variantes dans `answers`. Ne pas accepter une phrase grammaticalement différente par similarité approximative. |
| `order` | `tokens` contient exactement les mots nécessaires à au moins une réponse acceptée ; la vue mélange les mots. |
| `match` | `pairs` contient des associations non ambiguës et des valeurs distinctes de chaque côté. Le validateur reçoit un dictionnaire gauche → droite. |
| `listening` | Mêmes données de réponse qu’un choix, plus un `audioId` pointant sur un enregistrement vérifié. |

La normalisation ignore la casse, les espaces superflus, les variantes typographiques d’apostrophe et la ponctuation finale courante. Elle conserve accents et distinctions de lettres. Déclarer d’autres formulations naturelles dans `answers` après vérification.

Un exercice peut porter plusieurs concepts. Toute la liste doit être déjà introduite ; une révision ne peut pas enseigner implicitement un vocabulaire futur. Les exercices de révision doivent réutiliser des acquis pertinents dans un contexte cohérent.

## Histoires et dialogues

Toutes les parties ordinaires (`learn` et `story`) commencent par `Lesson.scenes`. Le monde 1 compte quatre scènes par partie, soit 96 au total, réparties entre `dialogue-content.ts` et les deux modules d’extension. Une `DialogueScene` possède un ID, un cadre très court, des `turns` et éventuellement un repère `takeaway`. Chaque tour fournit `speaker` (`lova` ou `mia`), texte malgache, traduction française et éventuel mot surligné.

La vue révèle les tours progressivement ; la traduction reste dans un dévoilement facultatif. Les nouveaux concepts n’entrent dans la progression qu’au passage à la pratique après ces scènes. Ne pas présenter toute une leçon comme « rencontrée » après son premier tour.

Chaque activité du corpus utilise `Exercise.dialogue` pour prolonger l’échange. La question française reste une consigne courte, sans paragraphe technique préalable. Les notes de grammaire sont accessibles via une aide repliée. Les unités de consolidation peuvent réviser des notions existantes sans créer artificiellement de nouveaux concepts. Les scènes, prix et itinéraires sont fictifs ; un arbre narratif persistant demanderait encore une extension du schéma et des tests.

Les `sourceIds` sont obligatoires en interne. Les liens, attributions et limites documentaires sont affichés uniquement dans « Sources & crédits », jamais au fil de la conversation ou dans le feedback.

## Prononcer les sélections

Déclarer `selectionLanguage: 'mg'` lorsque les choix, les jetons ou la colonne gauche d’association sont tous malgaches. Pour une question mixte, fournir `spokenSelections` avec seulement les libellés malgaches exacts. Ne pas marquer les distracteurs français et ne pas déduire la langue de la bonne réponse. La banque active est OmniVoice : voir [MALAGASY_VOICES.md](MALAGASY_VOICES.md). Les nouveaux clips du monde 1 sont autorisés avec les mêmes références vocales, en conservant les 102 fichiers initiaux : après `npm run audio:inventory`, `npm run audio:generate -- --missing-only` ajoute uniquement les IDs manquants. `npm run audio:activate-omnivoice` copie les fichiers présents après contrôle de leurs empreintes. Chaque sélection lue doit avoir son propre fichier entier ; ne pas assembler des extraits.

## Ajouter un monde

Compléter sa fiche dans `worlds.ts` : objectifs lexicaux, grammaticaux et pratiques, thème culturel, prérequis, durée et coordonnées approximatives pour la carte. Ajouter ensuite unités, leçons, concepts, exercices et sources. Tant que les leçons n’existent pas, conserver `implemented: false`. Un monde disponible et un monde terminé sont deux états distincts.

`world-path.ts` construit le chemin depuis les unités et leçons publiées ; aucun état supplémentaire n’est à enregistrer. Conserver les dépendances de leçons et la couverture des quiz : changer l’ordre visuel ne doit pas permettre de contourner un prérequis. La clôture du monde 1 exige les douze unités et le dernier quiz, sans déverrouiller les dix-neuf mondes non publiés.

## Audio

Une entrée `AudioAsset` contient un ID stable, une URL locale de préférence, un `sourceId`, une transcription et un statut. Documenter l’auteur/interprète, la variété de langue et la permission de redistribution dans le registre des sources. Une fois la prononciation et le droit d’usage vérifiés, utiliser `status: 'verified'` et relier l’exercice ou le mot à cet ID.

La génération est une préparation locale hors du build ; le site distribue seulement ses fichiers statiques, sans clé ni backend. L’absence de fichier ne doit pas être masquée par une voix française ou anglaise de synthèse. Ne pas attribuer de compétence d’écoute à un exercice devenu écrit. La reconnaissance vocale et l’évaluation automatique de prononciation ne sont pas implémentées.

## Validation avant livraison

`validateContent(CONTENT)` renvoie des erreurs détaillées : doublons, références absentes, cycles, réponses mal configurées, contenu vide, audio manquant et leçons inaccessibles. Son parcours simulé contrôle que les exercices ne comportent pas de concepts inconnus au moment où ils deviennent disponibles.

Les tests d’auteur de `tests/malagasy-dialogues.test.ts` contrôlent aussi les scènes, le dialogue de chaque activité et la couverture des quiz. Le littoral et la projection ont leurs contrôles dédiés dans `tests/malagasy-map.test.ts`. Les motifs sonores d’interface ont des tests navigateur séparés : ils ne constituent pas une validation de prononciation malgache.

Exécuter depuis la racine :

```sh
npm run test -- tests/malagasy-engine.test.ts
npm run build
```

Puis vérifier dans le navigateur le parcours complet, les états du chemin, les quiz, les feedbacks, les raccourcis chiffres/Entrée, le mobile, le rechargement et l’import/export. Importer aussi une sauvegarde v1 des neuf premières leçons pour contrôler la reprise à l’unité 4. Ce dépôt est autonome : aucun test ne doit réintroduire le catalogue Arcade. Le validateur contrôle la structure et les références ; il ne peut pas vérifier à lui seul la correction linguistique.
