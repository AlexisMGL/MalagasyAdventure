# Malagasy Adventure

Dépôt autonome de l’application de malgache pour francophones. Les **mondes 1 et 2, Antananarivo et Antsirabe, sont jouables en entier** : 24 unités, 72 leçons, 192 scènes, 576 activités, 58 concepts et 133 fiches de vocabulaire. Chaque unité se termine par un quiz de douze questions ; le dernier conclut son monde. Antsirabe devient accessible après Antananarivo. Les dix-huit autres mondes restent verrouillés et planifiés.

Le dépôt Arcade voisin reste intact. Chaque chemin montre ses 36 étapes, la prochaine leçon, les étapes validées et les quiz encore verrouillés. Une escale historique se débloque après le quiz de l’unité 6 de chaque monde. Cet état est calculé depuis la progression v1 existante, sans nouvelle sauvegarde distincte.

## Lancer

Sur cette machine Windows, double-cliquer **`start-local.cmd`**, puis ouvrir **http://127.0.0.1:5174**. Le port diffère de celui d’Arcade. `/malagasy-adventure` reste également accessible pour conserver les anciennes URL de l’app.

Sur un nouveau clone, installer Node.js 22.12 ou plus récent :

```sh
npm ci
npm run dev
```

## Vérifier et construire

```sh
npm test
npm run test:audio-tools
npm run test:e2e
npm run build
npm run preview
```

L’aperçu de production est sur **http://127.0.0.1:4174**. Playwright utilise le port **4184**. `npm run test:all` regroupe tests, outils audio, parcours navigateur et build.

## Atelier audio

Les voix actives sont celles d’OmniVoice pour Mia et Lova. Les **102 fichiers d’origine, les extensions déjà publiées et leurs deux références vocales restent inchangés**. Les nouveaux clips des deux mondes utilisent les mêmes voix ; leur préparation incrémentale emploie `--missing-only`, qui ajoute les IDs manquants et refuse d’écraser les fichiers existants. Le total courant et la couverture se contrôlent dans le manifeste et avec l’audit audio après génération et activation.

`npm run audio:activate-omnivoice` vérifie les SHA-256 et copie les entrées du manifeste vers `public/malagasy/voices/omnivoice/`, avec provenance et licences. Le site lit ensuite ces fichiers statiques. Aucune génération n’a lieu au build, à la visite du site ou sur un backend. Les sorties restent `synthetic` / `model-generated`, sans validation malgachophone revendiquée. `review-audio.cmd` propose uniquement OmniVoice et conserve les avis et leur historique.

Double-cliquer **`review-audio.cmd`**, ou lancer `npm run audio:review`, puis ouvrir **http://127.0.0.1:5191**. L’atelier d’Arcade sur 5190 peut rester ouvert : ce sont deux copies indépendantes.

```sh
npm run audio:inventory
npm run audio:plan
npm run audio:check
```

Pour étendre la banque hors ligne après l’inventaire, sans recalculer les fichiers présents : `npm run audio:generate -- --missing-only`. Cette commande auteur peut prendre du temps ; elle n’est nécessaire ni au build ni au fonctionnement du site publié.

Les outils et modèles locaux utiles sont copiés dans `.tools/` sur cette machine et ignorés par Git. Ils ne sont nécessaires ni au build ni au déploiement. Pour les réinstaller sur une autre machine, voir [la préparation audio](docs/MALAGASY_NEURAL_SETUP.md) et [le guide de revue](docs/MALAGASY_AUDIO_REVIEW.md).

## Déploiement indépendant

Ce dépôt possède son propre `package.json`, son lockfile et sa configuration Netlify. Il ne reprend ni le remote Git ni l’identifiant Netlify d’Arcade.

- Commande de build : **`npm run build`**.
- Dossier publié : **`dist`**.
- Node : **22**.
- Hébergement : site statique, sans serveur d’inférence ; Supabase Auth et base privée facultatifs pour le compte et la progression.

Le nouveau dépôt peut être importé comme **nouveau projet Netlify Free** après création de son remote Git. Pour une publication manuelle, envoyer uniquement `dist`. Voir [le guide de déploiement](docs/DEPLOYMENT.md). Aucun site public ou dépôt distant n’est créé automatiquement par cette extraction.

Un domaine ou port différent possède son propre stockage navigateur. Pour retrouver une progression existante, utiliser **Ma sauvegarde → Exporter** dans l’ancienne copie puis **Importer** dans la nouvelle. Les IDs, clés et le format v1 restent inchangés.

Le **mode découverte** permet de commencer immédiatement sans compte. **Mon compte** propose un identifiant et un mot de passe, sans mail ni confirmation. Les anciens comptes utilisent leur mail comme identifiant. Le carnet privé est sauvegardé sur Supabase ; l’import/export reste disponible. Sans adresse mail, les nouveaux comptes n’ont pas de récupération automatique du mot de passe. L’inscription est opérationnelle sans SMTP ni configuration Brevo ; voir [SUPABASE.md](docs/SUPABASE.md).

Les 48 parties d’apprentissage proposent 142 fiches dans un carnet à explorer librement : **Vocabulaire** pour les mots illustrés et **Notions** pour les schémas de construction. Dessins, blocs de phrase, formes possessives colorées, positions d’objets et cadrans d’horloge donnent des repères à mémoriser, accompagnés d’exemples à écouter. Les mêmes pense-bêtes restent consultables pendant les dialogues ; les quiz se déroulent sans aide et demandent un rappel, une interprétation ou une transformation plutôt que la copie d’une réponse affichée.

## Documentation et consignes

- [Consignes des agents](AGENTS.md) et [consignes produit conservées](src/malagasy/AGENTS.md).
- [Programme pédagogique](docs/CURRICULUM.md), [sources linguistiques](docs/LANGUAGE_SOURCES.md), [architecture](docs/ARCHITECTURE.md).
- [Comparaison des solutions TTS gratuites et licences](docs/MALAGASY_TTS_COMPARISON.md).

Les liens et notices de sources restent dans « Sources & crédits ». Le corpus est documenté mais n’est pas présenté comme une formation certifiée ou relue intégralement par un enseignant malgachophone.
