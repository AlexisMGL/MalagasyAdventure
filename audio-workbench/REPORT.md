# Lot audio candidat — 27 octobre 2026

**Correctif de lecture dans l’atelier :** les 102 candidats sont maintenant écoutés via leurs maîtres WAV PCM, pour ne plus dépendre du décodage Opus du navigateur. Les versions compressées restent conservées. Huit tests de l’atelier et douze lectures réelles avec refus d’Opus simulé ont réussi ; aucune évaluation existante ni aucun fichier du site n’a été modifié. Les nouvelles revues conservent les empreintes du candidat et du maître réellement écouté.

**Le site n’a pas été modifié et aucune nouvelle voix n’y a été activée.** Le travail livré concerne les fichiers audio, leur préparation et leur revue locale. Aucun appel de génération payant, compte Cloud, secret frontend ou serveur d’inférence à déployer n’est nécessaire.

## Résultat produit

| Contrôle | Résultat effectif |
| --- | --- |
| Corpus | **51 textes malgaches distincts**, avec liens vers le contenu existant des trois unités. |
| Personnages | **102 fichiers**, 51 pour Mia et 51 pour Lova, avec une référence synthétique fixe par personnage. |
| Moteur | OmniVoice, langue `plt`, révision épinglée et sept empreintes de modèle/configuration/tokenizer contrôlées. |
| Qualité de préparation | 32 étapes de génération ; texte conservé sans transcription phonétique inventée. Réglages distincts pour les mots très courts et contrôle des sorties silencieuses. |
| Formats | Maîtres WAV mono 24 kHz et candidats Ogg/Opus 48 kbit/s. |
| Durée cumulée des répliques | **147,90 secondes**. Les deux références de génération ajoutent 14,79 secondes. |
| Ogg destinés à une éventuelle lecture statique | **842 984 octets**, environ 0,843 Mo pour les 102 fichiers. |
| Maîtres WAV | 7 103 688 octets. |
| Références synthétiques | 710 008 octets. |
| Validation linguistique | **Non réalisée** : aucun avis Good/Acceptable/Incorrect n’est prérempli et aucune relecture native n’est revendiquée. |

Le manifeste et les fichiers sont dans [generated/omnivoice](generated/omnivoice/manifest.json). Le rapport technique machine est [validation.json](validation.json). Les fichiers des personnages utilisent tous leur référence propre ; le mot Azafady n’est pas remplacé isolément par un locuteur humain dans ce lot candidat. Les huit références humaines existantes restent accessibles pour comparaison.

Les générations techniquement silencieuses ou trop courtes ont été rejetées. Les mots très courts ont une durée de génération plus ample et évitent la suppression automatique des silences susceptible d’effacer un mot entier. Certaines sorties ont nécessité une seconde tentative ; la graine et la durée effectivement utilisées sont enregistrées. Cela vérifie le signal produit, pas les phonèmes ou l’accent.

## Écouter

Lancer **`review-audio.cmd`** puis ouvrir **http://127.0.0.1:5191**. L’atelier fonctionne localement et compare les anciens fichiers, les références humaines et les candidats. Commencer par Azafady, Eny et ny, puis alterner mots courts et phrases du même personnage. Les modes 1×, 0,8× et relecture conservent une seule voix active.

Les notes et évaluations sont enregistrées uniquement lors d’une action du relecteur. Une approbation porte sur une empreinte exacte ; une nouvelle génération ne l’hérite pas. Le cache et la protection des Good empêchent les remplacements involontaires.

## Vérifications exécutées

- **102/102 Ogg réellement décodés**, sans fichier manquant, signal silencieux ou saturation. Pic décodé maximal : 0,950686. Les tailles, empreintes, textes, références, IDs et liens de contenu concordent.
- **334 tests existants réussis**, dans 16 fichiers.
- **15 tests Node réussis** pour l’inventaire et l’atelier ; ils couvrent aussi exclusion du français/des trous, déduplication, persistance par empreinte, reprises de lecture et absence de changement de `src/`/`public/`.
- **5 tests Python réussis** pour le cache et la protection des fichiers approuvés.
- Le mode pilote planifie exactement 12 fichiers. Un ID inconnu est refusé avant le chargement du modèle.
- Une relance incrémentale réelle sur Salama/Mia a conservé des **octets strictement identiques**, avec retour Cached et sans régénération.
- **Build TypeScript/Vite réussi**. Les candidats, poids de modèles et outils de revue sont absents de `dist/`. Les fichiers du site (`src/`, `public/`, dépendances et configuration Netlify) ne présentent aucun changement.
- Chromium réel a comparé les fichiers anciens et nouveaux à 1× et 0,8× : lecture effective, conservation de hauteur, pas de chevauchement, arrêt lors de clics rapides, récupération d’un fichier absent et mobile 390 px. Une dernière passe sur le lot figé a terminé les 12 lectures d’Azafady, Eny et ny pour les deux personnages et vitesses, avec leurs empreintes finales. Les vrais avis de revue sont restés inchangés. Les captures et journaux privés sont dans `.tools/audio-review-real-*`.

## Choix gratuit et suites possibles

La [comparaison des moteurs et quotas](../docs/MALAGASY_TTS_COMPARISON.md) documente la décision : support malgache gratuit non confirmé dans Gemini Developer API ; support explicite trouvé dans une offre Cloud distincte sans quota gratuit Gemini-TTS. Cette étape utilise donc un calcul local gratuit, sans clé ni API de synthèse payante. Les limites du plan Netlify Free restent applicables à une éventuelle diffusion future.

Les licences et attributions sont conservées dans [NOTICE.md](NOTICE.md), `licenses/` et `sources.json`. Les poids OmniVoice sont annoncés sous CC-BY-NC et le codec possède aussi ses conditions Boson/Llama ; aucune permission commerciale générale n’est déduite de la gratuité des téléchargements.

Une piste complémentaire de conversion vocale gratuite OpenVoiceV2 a été essayée sur quatre fichiers privés pour conserver l’articulation d’Azafady/Eny et rapprocher leur timbre des personnages synthétiques. Elle n’est pas sélectionnée dans ce lot : la compatibilité de redistribution des sources/références combinées n’a pas été établie. Aucun de ces prototypes privés n’a été intégré au site ou à l’atelier livré.

Le [guide de préparation](../docs/MALAGASY_NEURAL_SETUP.md) décrit installation, génération ciblée, reprise et vérification. Une intégration des fichiers choisis dans l’application attend une demande ultérieure, conformément à la consigne actuelle.
