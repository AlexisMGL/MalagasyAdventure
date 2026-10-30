# Malagasy Adventure — ajouter du contenu

## Contrat de publication

Le contenu vit dans `src/malagasy/content.ts` et les modules de données qu’il importe ; la présentation ne doit pas contenir les corpus. Les interfaces de `types.ts` sont le contrat. Les mondes planifiés se trouvent dans `worlds.ts`.

Lire d’abord [les consignes propres à l’app](../src/malagasy/AGENTS.md). Le périmètre livré couvre les deux mondes complets Antananarivo et Antsirabe, chacun avec douze unités ; les mondes 3–20 restent verrouillés. La demande du 30 octobre remplace l’ancien périmètre limité au monde 1. Ses données initiales et les modules `world-one-units-04-07.ts` et `world-one-units-08-12.ts` restent inchangés dans leurs identifiants. `world-two.ts` agrège les deux modules d’unités d’Antsirabe, avec `world-two-authoring.ts` pour le contrat auteur commun.

Un contenu est publiable lorsque ses références sont valides, ses concepts ont été présentés avant évaluation et ses réponses sont étayées par des sources réellement consultées. La quantité n’est pas un critère de qualité. Ne pas rendre une destination jouable simplement pour remplir la carte.

## Ajouter une unité et ses leçons

1. Choisir des identifiants stables et descriptifs. Ne jamais renommer un ID déjà livré sans migration des sauvegardes.
2. Ajouter ou vérifier chaque source dans `Content.sources`, avec URL directe, auteur, usage précis et statut de consultation. Les permissions d’un enregistrement ne se déduisent pas de son accès public.
3. Ajouter les concepts avec `introducedIn`, leurs prérequis et leurs sources. Un concept de grammaire désigne une capacité identifiable, pas une catégorie française imposée au malgache.
4. Ajouter les entrées de vocabulaire avec traduction, note de contexte et `conceptId`.
5. Créer les leçons : objectifs, mini-leçons, scènes de découverte, notes facultatives, nouveaux concepts, concepts revus, exercices, prérequis et durée estimée. Dans `notion-cards.ts`, présenter chaque nouveauté avant son dialogue : une fiche courte, une règle et des exemples à écouter. Séparer la section **Vocabulaire** (mots/expressions reliés à des dessins) de la section **Notions** (grammaire, construction, mots-outils et variations). Rédiger un schéma typé dans `LearningVisual` : il doit montrer la relation enseignée, par exemple personne→forme possessive, ordre des blocs ou livre au-dessus/au-dessous d’une table. Les mots et formes doivent être déjà étayés ; ne pas fabriquer une règle universelle de concaténation à partir de quelques exemples. Ne pas transformer la fiche en chapitre de grammaire.
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

Dans les quiz, la consigne, le contexte et les répliques visibles ne doivent pas déjà donner une réponse complète à recopier. Demander une interprétation, un rappel ou une transformation utile : changer l’objet, la personne ou le point de vue, répondre depuis sa propre situation, identifier le sens en français. Une vraie compréhension peut conserver un passage malgache tout en demandant son sens ; masquer sa traduction avant correction. Les choix proposés et les jetons nécessaires à la reconstruction restent naturellement visibles.

## Histoires et dialogues

Toutes les parties ordinaires (`learn` et `story`) proposent les fiches visuelles avant `Lesson.scenes`. Les deux mondes comptent quatre scènes par partie, soit 192 au total. Les 142 fiches des 48 parties sont enregistrées dans `notion-cards.ts`, qui agrège aussi `world-two-notions.ts` et ses deux modules. Une `DialogueScene` possède un ID, un cadre très court, des `turns` et éventuellement un repère `takeaway`. Chaque tour fournit `speaker` (`lova` ou `mia`), texte malgache, traduction française et éventuel mot surligné.

Les mini-leçons permettent de choisir librement Vocabulaire/Notions et une fiche, puis de passer au dialogue. Le pense-bête conserve cette séparation. Éviter le diaporama obligatoire de traductions ; les dessins et schémas précèdent l’explication courte. Les sources restent internes et les légendes restent lisibles sur mobile. Chaque son doit correspondre exactement à l’exemple entier ; ne jamais inventer une phonétique ni assembler des fragments audio. La vue révèle ensuite les tours progressivement ; la traduction reste dans un dévoilement facultatif. Les nouveaux concepts n’entrent dans la progression qu’au passage à la pratique après ces scènes. Ni une fiche consultée ni un premier tour ne rendent toute une leçon « rencontrée ». Les quiz et révisions restent sans pense-bête.

Les activités de compréhension et de réponse utilisent `Exercise.dialogue` pour prolonger l’échange ; les exercices de rappel peuvent se passer de dialogue lorsque celui-ci révélerait la réponse. La question française reste une consigne courte, sans paragraphe technique préalable. Les notes de grammaire sont accessibles via une aide repliée. Les unités de consolidation peuvent réviser des notions existantes sans créer artificiellement de nouveaux concepts. Les scènes, emplois du temps, prix et itinéraires sont fictifs ; un arbre narratif persistant demanderait encore une extension du schéma et des tests.

Les `sourceIds` sont obligatoires en interne. Les liens, attributions et limites documentaires sont affichés uniquement dans « Sources & crédits », jamais au fil de la conversation ou dans le feedback.

## Prononcer les sélections

Déclarer `selectionLanguage: 'mg'` lorsque les choix, les jetons ou la colonne gauche d’association sont tous malgaches. Pour une question mixte, fournir `spokenSelections` avec seulement les libellés malgaches exacts. Ne pas marquer les distracteurs français et ne pas déduire la langue de la bonne réponse. La banque active est OmniVoice : voir [MALAGASY_VOICES.md](MALAGASY_VOICES.md). Les nouveaux clips des deux mondes utilisent les mêmes références vocales, en conservant les fichiers déjà publiés : après `npm run audio:inventory`, `npm run audio:generate -- --missing-only` ajoute uniquement les IDs manquants. Inclure les exemples entiers des pense-bêtes dans cet inventaire. `npm run audio:activate-omnivoice` copie les fichiers présents après contrôle de leurs empreintes. Chaque sélection lue doit avoir son propre fichier entier ; ne pas assembler des extraits.

## Ajouter un monde

Compléter sa fiche dans `worlds.ts` : objectifs lexicaux, grammaticaux et pratiques, thème culturel, prérequis, durée et coordonnées approximatives pour la carte. Ajouter ensuite unités, leçons, concepts, exercices et sources. Tant que les leçons n’existent pas, conserver `implemented: false`. Un monde disponible et un monde terminé sont deux états distincts.

`world-path.ts` construit le chemin depuis les unités et leçons publiées ; aucun état supplémentaire n’est à enregistrer. Trier les leçons par monde puis par ID, en conservant les dépendances et la couverture des quiz. Le premier prérequis d’Antsirabe est `lesson-12-03`, dernier quiz d’Antananarivo. Clôturer le monde 1 ouvre le monde 2 ; clôturer le monde 2 laisse les dix-huit destinations non publiées verrouillées.

Placer l’intermède historique au milieu du chemin de chaque monde. `historyAccess` dans `world-progress.ts` exige que toutes les leçons des premières `ceil(nombre d’unités / 2)` unités soient validées, quiz inclus : 18 leçons et six unités dans chacun des deux mondes actuels. Réutiliser ce contrôle dans l’affichage et lors de l’ouverture ; aucune simple visite ni validation d’une leçon tardive ne suffit. Rédiger les repères dans `history-interludes.ts`, conserver leurs `sourceIds` et afficher leurs références uniquement dans les crédits. Le déblocage se déduit des sauvegardes v1, sans drapeau ni récompense supplémentaire.

Antsirabe travaille les verbes actifs au présent, les heures pleines, la fréquence, quelques formes possédées entières et les connecteurs `sy` / `fa` dans des patrons vérifiés. Ne pas généraliser `-ny` à une règle « son = masculin singulier », ni `fa` à tous les emplois de « mais ». Les temps du passé/futur restent prévus au monde 7 ; minutes et demi-heures ne sont pas enseignées ici.

## Audio

Une entrée `AudioAsset` contient un ID stable, une URL locale de préférence, un `sourceId`, une transcription et un statut. Documenter l’auteur/interprète, la variété de langue et la permission de redistribution dans le registre des sources. Une fois la prononciation et le droit d’usage vérifiés, utiliser `status: 'verified'` et relier l’exercice ou le mot à cet ID.

La génération est une préparation locale hors du build ; le site distribue seulement ses fichiers statiques, sans clé ni backend. L’absence de fichier ne doit pas être masquée par une voix française ou anglaise de synthèse. Ne pas attribuer de compétence d’écoute à un exercice devenu écrit. La reconnaissance vocale et l’évaluation automatique de prononciation ne sont pas implémentées.

## Validation avant livraison

Les intermèdes des deux mondes sont des livrets dans `history-books.ts` : cinq chapitres, environ cinq minutes de lecture estimée, un dessin ou schéma par chapitre et six questions finales originales avec explications. `history-drawings.ts` crée les SVG et leurs légendes accessibles. `history-book-view.ts` conserve seulement un état temporaire de lecture et de réponses. Corrections cachées avant validation, relecture et nouvel essai possibles. Aucun XP, acquis de langue ou indicateur persistant n’est attribué. Les sources par chapitre sont regroupées dans Sources & crédits.

`validateContent(CONTENT)` renvoie des erreurs détaillées : doublons, références absentes, cycles, réponses mal configurées, contenu vide, audio manquant et leçons inaccessibles. Son parcours simulé contrôle que les exercices ne comportent pas de concepts inconnus au moment où ils deviennent disponibles.

Les tests d’auteur de `tests/malagasy-dialogues.test.ts` et `malagasy-world-two.test.ts` contrôlent les scènes et la couverture des quiz. `malagasy-quiz-recall.test.ts` et les contrôles du monde 2 recherchent les réponses déjà données dans la consigne ; `malagasy-world-progress.test.ts` vérifie le jalon historique et sa compatibilité v1. Le littoral et la projection ont leurs contrôles dédiés dans `tests/malagasy-map.test.ts`. Les motifs sonores d’interface ont des tests navigateur séparés : ils ne constituent pas une validation de prononciation malgache.

Exécuter depuis la racine :

```sh
npm run test -- tests/malagasy-engine.test.ts
npm run build
```

Puis vérifier dans le navigateur le parcours complet, les états du chemin, les quiz, les feedbacks, les raccourcis chiffres/Entrée, le mobile, le rechargement et l’import/export. Importer aussi une sauvegarde v1 des neuf premières leçons pour contrôler la reprise à l’unité 4. Ce dépôt est autonome : aucun test ne doit réintroduire le catalogue Arcade. Le validateur contrôle la structure et les références ; il ne peut pas vérifier à lui seul la correction linguistique.
