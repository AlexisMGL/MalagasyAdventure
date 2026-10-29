# Malagasy Adventure — architecture

Malagasy Adventure est une application autonome en TypeScript strict, DOM natif et Vite. Le dépôt ne contient pas le catalogue Arcade ni ses autres jeux. `/` et `/malagasy-adventure` ouvrent la même application statique. Le mode découverte reste local ; un compte Supabase facultatif sauvegarde la progression, sans framework ajouté ni serveur applicatif permanent.

## Modules et responsabilités

| Fichier | Responsabilité |
| --- | --- |
| `src/main.ts` | Point d’entrée de l’application autonome. |
| `src/malagasy/main.ts`, `style.css` | Navigation interne, vues, session d’apprentissage et événements DOM. |
| `src/malagasy/types.ts` | Contrats des mondes, unités, leçons, exercices, concepts, sources, audio et sauvegardes. |
| `src/malagasy/worlds.ts` | Métadonnées des 20 destinations et progression envisagée. |
| `src/malagasy/content.ts` | Registre de contenu consultable par les moteurs et les vues. |
| `src/malagasy/dialogue-content.ts` | Scènes d’introduction et échanges associés aux activités. |
| `src/malagasy/world-one-units-04-07.ts`, `world-one-units-08-12.ts` | Données des unités 4–12 : dialogues, exercices, concepts, lexique et sources, fusionnés dans `CONTENT`. |
| `src/malagasy/world-path.ts`, `world-path.css` | Chemin des 36 étapes du monde 1 ; états courant, disponible, validé et verrouillé dérivés du moteur de progression. |
| `src/malagasy/engine.ts` | Réponses acceptées, déblocage, mélange, maîtrise, révisions, XP et validation du contenu. |
| `src/malagasy/storage.ts` | Chargement, sérialisation et validation du schéma de sauvegarde. |
| `src/malagasy/account.ts`, `account-view.ts`, `account.css`, `account-identity.ts` | Compte identifiant/mot de passe, compatibilité des anciens comptes mail et choix explicite entre deux carnets. |
| `supabase/functions/username-signup/`, `supabase/functions/_shared/username.ts` | Inscription sans mail, alias interne partagé, création Auth côté serveur et limitation privée des tentatives. |
| `src/malagasy/notion-cards.ts`, `learning-visual-types.ts` | Fiches des 24 parties, sections Vocabulaire/Notions, schémas explicitement rédigés, règles brèves et sons entiers existants. |
| `src/malagasy/lesson-visuals.ts`, `lesson-visuals.css` | Dessins SVG originaux et rendus des schémas : possessions, ordre des mots, localisation, quantités, directions, questions et repères de lecture. |
| `src/malagasy/cloud-sync.ts` | Synchronisation différée et sérialisée, validation v1, révisions et conflits entre appareils. |
| `src/malagasy/supabase.ts`, `supabase/migrations/` | Client public, transport et schéma Postgres privé par utilisateur avec RLS. |
| `src/malagasy/history-curriculum.ts` | Fil culturel des vingt mondes dès Antananarivo, résumés des escales, reprises progressives et sources historiques des crédits. Les mondes futurs restent verrouillés. |
| `src/malagasy/exercise-view.ts` | Registre des rendus d’exercices, brouillon de réponse et échappement HTML. |
| `src/malagasy/audio.ts` | Audio linguistique vérifié et effets de réponse synthétisés localement. |
| `src/malagasy/dialogue-audio.ts` | File de lecture des répliques, relecture, annulation, muet et gestion des politiques audio du navigateur. |
| `src/malagasy/voice-bank.ts`, `voice-recordings.ts` | Correspondance exacte des répliques et références humaines ; la banque numérique reste distincte de leur validation linguistique. |
| `src/malagasy/omnivoice-voices.ts`, `public/malagasy/voices/omnivoice/` | Banque active de phrases entières, copies des WAV auteur et provenance publique. |
| `src/malagasy/synthetic-voices.ts`, `voice-profiles.ts` | Anciennes banques MMS et timbre relevé de Mia, conservés pour la provenance ; ils ne sont plus sélectionnés par défaut. |
| `src/malagasy/spoken-selections.ts` | Sélections explicitement malgaches ; les choix français ne sont pas lus. |
| `scripts/prepare-malagasy-neural.mjs`, `malagasy-neural.mjs`, `generate-malagasy-neural.py` | Inventaire et préparation locale OmniVoice ; `--missing-only` ajoute les nouveaux IDs sans remplacer les clips existants. |
| `scripts/activate-malagasy-omnivoice.mjs`, `check-malagasy-neural.mjs` | Copie contrôlée par empreintes et audit technique de la banque ; aucune génération au build. |
| `src/malagasy/recording-references.json`, `public/malagasy/voices/` | Métadonnées de provenance, licences et fichiers originaux distribués localement. |
| `src/malagasy/voice-plan.json`, `scripts/malagasy-voices.mjs` | Inventaire des phrases à enregistrer et outil hors ligne facultatif ; les brouillons restent `pending`. |
| `src/malagasy/art.ts` | Illustrations SVG locales. |
| `src/malagasy/characters.ts`, `dialogue-view.ts`, `dialogue.css` | Personnages expressifs, bulles, traductions facultatives et réactions courtes. |
| `src/malagasy/session.ts`, `lesson-view.ts`, `learning.css` | État transitoire, dialogues progressifs, repères unité/partie, quiz et clôture d’unité. |
| `src/malagasy/map.ts`, `map.css`, `madagascar-coast.json` | Littoral Natural Earth simplifié, projection commune et escales accessibles. |
| `src/malagasy/map-sources.ts` | Métadonnées géographiques pures, séparées de la géométrie pour les imports du contenu et des tests Node. |
| `src/malagasy/AGENTS.md` | Vision initiale et consignes produit conservées pour les futurs agents. |

Le contenu peut être subdivisé en fichiers de données sans modifier le contrat `Content`. Les références utilisent des identifiants persistants, jamais la position d’un élément dans un tableau.

## Flux d’apprentissage

1. La vue demande au moteur si les prérequis de la leçon sont satisfaits.
2. La phase transitoire `notion` propose un carnet à deux sections : Vocabulaire (mots illustrés) et Notions (constructions et relations schématisées). Le joueur choisit librement une section et une fiche ; le dernier choix de chaque section est gardé pendant la séance. Chaque fiche relie un dessin ou un schéma à une règle courte et aux exemples à écouter. Le même carnet reste consultable à côté des scènes de Lova et Mia (compact au-dessus sur mobile). Les dialogues sont révélés tour par tour ; leurs traductions et l’aide longue restent facultatives. Les concepts sont réellement ouverts à l’entraînement lors du passage à la pratique, après cette découverte ; quitter une fiche ou une scène ne doit pas ajouter toute sa banque aux révisions. Les quiz et révisions n’affichent pas les fiches.
3. Les six activités rédigées de la partie conservent leur ordre conversationnel, puis jusqu’à deux rappels antérieurs éligibles sont ajoutés. Le Centre de révision utilise le sélecteur générique ; les quiz utilisent leurs douze activités dédiées.
4. Le validateur renvoie un résultat ; la vue affiche l’explication préparée dans le contenu.
5. `recordAnswer` produit un nouvel état, actualise la maîtrise et planifie une révision.
6. `completeLesson` valide la partie ou le quiz lorsque le seuil est atteint. La fin d’une partie et la clôture d’une unité ont des écrans distincts ; le résultat d’une nouvelle tentative reste indépendant d’une validation historique conservée.
7. La couche de stockage enregistre automatiquement l’état. L’export JSON fournit une sauvegarde portable.

`worldAvailable` vérifie la publication du monde et la fin de ses mondes prérequis. `worldCompleted` exige toutes les unités du monde, disponibles et terminées. Le monde 1 contient maintenant ses douze unités : valider le quiz de l’unité 12 après les prérequis déclenche une vraie clôture du monde. Les mondes 2–20 restent non publiés, même après cette réussite.

Le chemin visuel affiche les 36 étapes et les 12 quiz sans stocker un deuxième compteur. Son tracé, ses médaillons, son repère « Vous êtes ici » et ses compteurs utilisent les IDs de leçons validées et `lessonAvailable`. Une étape terminée peut être rejouée ; une étape verrouillée reste un vrai bouton désactivé. Cette avancée mesure le parcours, pas la maîtrise durable.

Les fonctions des moteurs ne dépendent pas du DOM, de `localStorage` ou de l’heure globale lorsque le paramètre de date est fourni. Cela permet des tests reproductibles. La session en cours et le brouillon d’un exercice sont de l’état d’interface ; ils ne sont pas des identifiants persistants.

## Lecture des voix de dialogue

`recordingForTurn` relie un tour à un fichier `AudioAsset` uniquement lorsque la transcription correspond à l’énoncé complet. Les huit expressions humaines restent des références et un repli documenté, sans découpage ni collage de mots pour fabriquer d’autres phrases. Le personnage `any` permet de partager une référence pour Lova et Mia sans prétendre fournir deux genres de voix.

Les voix actives sont OmniVoice, avec une référence synthétique fixe pour Mia et une pour Lova. Les 102 enregistrements initiaux et leurs références restent inchangés. L’ajout des unités 4–12 autorise de nouveaux clips avec les mêmes références ; `--missing-only` conserve chaque ID existant et refuse un fichier dont l’empreinte ne correspond plus au manifeste. Le total courant se contrôle dans ce manifeste et avec `npm run audio:check`, sans le déduire du nombre de leçons.

Les modèles et outils auteur restent dans `.tools/`, ignoré par Git. L’inventaire rassemble les répliques, le lexique et les sélections explicitement malgaches ; les textes incomplets restent exclus. Après préparation locale, `npm run audio:activate-omnivoice` contrôle les empreintes puis copie les clips, références et licences vers les fichiers statiques publics et prépare le registre TypeScript. Aucun modèle n’est exécuté au build ou dans le navigateur. La génération MMS est un historique, pas le pipeline actif.

`DialogueAudioPlayer` garde une seule lecture active. Sa synchronisation mémorise les tours déjà visibles pour éviter les reprises dues aux rerendus ; une relecture manuelle annule la file précédente. Un changement de contexte, le muet ou la sortie d’une leçon arrête les fichiers. Le blocage de lecture automatique par le navigateur est distinct d’un fichier illisible et permet une reprise manuelle.

Les références `published-pronunciation` sont documentées par leur publication et leur transcription ; elles ne sont pas rebaptisées `native-speaker-reviewed` sans contrôle linguistique réalisé. Une sortie de modèle reste identifiée `synthetic` / `model-generated`, distincte d’un fichier validé pour une évaluation d’écoute. Le lecteur de dialogue ne met pas à jour la maîtrise orale. Les liens de licence, notamment la restriction non commerciale de MMS, et la couverture apparaissent seulement dans « Sources & crédits ».

La lecture utilise les fichiers locaux sans secret ni appel TTS à l’exécution. Le script Cloud reste un outil facultatif de préparation : ses sorties sont des brouillons `pending`. La banque numérique locale peut diffuser des sorties explicitement synthétiques sans les déclarer validées par un enseignant. Voir [MALAGASY_VOICES.md](MALAGASY_VOICES.md).

`spoken-selections.ts` expose les sélections explicitement marquées malgaches (`selectionLanguage` / `spokenSelections`). `recordingForSelection` recherche leur fichier entier ; le clic passe par le même lecteur interruptible que les dialogues. Un choix français reste silencieux ; une mauvaise sélection malgache est lue sans être validée automatiquement.

## Sauvegarde et sécurité d’import

Le format courant reste `schemaVersion: 1`. Il contient les paramètres, XP, leçons terminées, récompenses déjà accordées, concepts, dates d’activité, succès et historique borné. La clé locale est `afterhours.malagasy.progress.v1` ; aucun autre jeu ne partage cet état. L’extension conserve les neuf IDs de leçons initiaux, leurs exercices et concepts. Une ancienne sauvegarde peut donc reprendre au début de l’unité 4 sans perdre ses acquis ; les nouveaux concepts restent inconnus jusqu’à leur découverte.

`parseSave` refuse les versions inconnues, les objets mal formés, les clés de prototype, les dates invalides, les valeurs numériques incohérentes et les références absentes du contenu courant. L’objet final est reconstruit. Le stockage est derrière l’interface `SaveStorage` (`getItem`/`setItem`) pour permettre plus tard un autre adaptateur.

Si la sauvegarde locale est illisible, `loadProgress` conserve son texte original dans `afterhours.malagasy.progress.v1.recovery` avant de proposer un état neuf en mémoire. Cette copie, limitée à 2 millions de caractères, reste disponible via `loadRecovery` et n’est jamais remplacée automatiquement par une erreur ultérieure. Si le stockage est inaccessible ou saturé, l’application signale sa limite ; le fichier original reste intact tant qu’aucune nouvelle sauvegarde ne réussit.

La validation du contenu vérifie chaque leçon contre la fermeture de ses propres prérequis, indépendamment du parcours global : une notion apprise dans une branche facultative ne peut pas être présumée connue dans une autre branche.

Il n’existe pas encore de migration entre deux versions de sauvegarde, puisque seul le schéma v1 existe. Ajouter une migration explicite avant d’accepter un ancien schéma. La sauvegarde n’est pas un mécanisme anti-triche. La migration SQL initialise uniquement le stockage serveur et ne change pas le contrat JSON v1.

Le carnet invité garde sa clé d’origine. Les caches des comptes utilisent cette clé suivie de `.account.<uuid>` ; une déconnexion retrouve le carnet invité, sans transférer le carnet d’un utilisateur au suivant. Une première connexion peut reprendre le carnet invité. `CloudProgressSync` valide les réponses distantes par `parseSave`, charge automatiquement un carnet distant sur un appareil vierge et demande un choix si deux carnets diffèrent. Les requêtes sont sérialisées et portent une révision attendue : une modification concurrente suspend l’envoi jusqu’au choix explicite. Les erreurs réseau conservent le cache local et exposent un état d’attente ; retour en ligne, retour à l’onglet et bouton de synchronisation permettent une reprise. L’arrêt d’une instance invalide ses callbacks et temporisations.

Supabase Auth gère les mots de passe et sessions. Les identifiants normalisés deviennent des alias réservés sous `.invalid` ; l’ancien mail reste transmis tel quel à la connexion. La fonction Edge `username-signup` ne peut créer que ces alias et ne renvoie aucun jeton. Sa clé serveur reste dans l’environnement Supabase. Un quota atomique limite les tentatives par empreinte d’IP et par jour pour tout le projet ; aucune adresse IP brute ni mot de passe n’est stocké dans la table des quotas. Les confirmations globales ne sont pas désactivées pour les vrais mails.

La table `learning_progress` ne contient que `user_id`, `progress` v1, `revision` et une date serveur. Les politiques SELECT/INSERT/UPDATE restreignent chaque opération à `auth.uid() = user_id`. L’accès anonyme est révoqué. La fonction de sauvegarde s’exécute en `SECURITY INVOKER`, vérifie aussi l’utilisateur explicitement attendu et applique un contrôle atomique de révision. Le navigateur ne reçoit qu’une clé publiable. Voir [la configuration effective](SUPABASE.md).

La vue de sauvegarde permet de télécharger cette copie pour examen ; elle n’est pas automatiquement réparée ni présentée comme importable.

## Extensions

- **Nouvelle unité/monde** : seulement après nouvelle demande d’extension du périmètre actuel. Ajouter les dialogues, données et sources, vérifier les prérequis et le quiz, puis passer `implemented` à vrai. Voir [CONTENT_GUIDE.md](CONTENT_GUIDE.md).
- **Nouveau type d’exercice** : étendre `ExerciseType`, enregistrer son validateur dans `exerciseValidators` et son rendu dans `EXERCISE_RENDERERS`, ajouter la validation de configuration et un test comportemental.
- **Enregistrement linguistique** : ajouter une entrée `AudioAsset` documentée, une transcription entière et son degré de contrôle linguistique, puis la référence d’une réplique. Vérifier la licence avant diffusion. Une écoute notée exige un fichier validé adapté et ne se déduit pas de la seule disponibilité d’une référence de dialogue.
- **Compte distant** : conserver le schéma portable et l’isolation par utilisateur ; toute évolution de la synchronisation doit tester les pertes réseau, conflits et changements de session.

## Construction et hébergement

`npm run build` exécute TypeScript puis Vite et produit `dist/`. Les fichiers statiques restent compatibles avec `netlify.toml` et `public/_redirects`. Aucun serveur applicatif, secret ou appel d’IA n’est requis à l’exécution. Les liens de sources sont visibles uniquement dans « Sources & crédits », dont le registre est partagé avec le contenu. Aucun déploiement n’est impliqué par une simple modification locale du dépôt.

Les contrôles dédiés se trouvent dans `tests/malagasy-engine.test.ts` et les tests navigateur de `e2e/`. Vérifier leur résultat à chaque extension au lieu de considérer ce document comme une attestation de tests passés.
