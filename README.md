# Malagasy Adventure

Dépôt autonome de l’application de malgache pour francophones, extrait d’Afterhours Arcade sans modification du parcours, des textes, du rendu ou des voix actives. Trois unités sont jouables ; les vingt mondes restent un programme à développer.

Le dépôt Arcade voisin reste intact. Cette copie devient la base des prochains travaux sur Malagasy Adventure. Voir [MIGRATION.md](MIGRATION.md) pour le périmètre et la provenance.

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

À la demande utilisateur du 27 octobre 2026, les **102 enregistrements OmniVoice existants** (51 énoncés × Mia/Lova) sont actifs. Les maîtres WAV écoutés dans l’atelier sont copiés octet pour octet, sans génération, réencodage ni traitement de hauteur. `npm run audio:activate-omnivoice` vérifie les SHA-256 et copie uniquement les entrées du manifeste vers `public/malagasy/voices/omnivoice/`, avec provenance, références et licences ; il prépare `src/malagasy/omnivoice-voices.ts`. Cette commande n’est jamais lancée au build. La banque conserve le statut `synthetic` / `model-generated` ; une revue malgachophone reste à effectuer. Les anciennes banques MMS/profils et références humaines sont conservées pour la traçabilité, mais ne sont plus sélectionnées par défaut. `review-audio.cmd` propose uniquement OmniVoice et conserve les avis et leur historique.

Double-cliquer **`review-audio.cmd`**, ou lancer `npm run audio:review`, puis ouvrir **http://127.0.0.1:5191**. L’atelier d’Arcade sur 5190 peut rester ouvert : ce sont deux copies indépendantes.

```sh
npm run audio:inventory
npm run audio:plan
npm run audio:check
```

Les outils et modèles locaux utiles sont copiés dans `.tools/` sur cette machine et ignorés par Git. Ils ne sont nécessaires ni au build ni au déploiement. Pour les réinstaller sur une autre machine, voir [la préparation audio](docs/MALAGASY_NEURAL_SETUP.md) et [le guide de revue](docs/MALAGASY_AUDIO_REVIEW.md).

## Déploiement indépendant

Ce dépôt possède son propre `package.json`, son lockfile et sa configuration Netlify. Il ne reprend ni le remote Git ni l’identifiant Netlify d’Arcade.

- Commande de build : **`npm run build`**.
- Dossier publié : **`dist`**.
- Node : **22**.
- Hébergement : site statique, sans base, API payante ou serveur d’inférence.

Le nouveau dépôt peut être importé comme **nouveau projet Netlify Free** après création de son remote Git. Pour une publication manuelle, envoyer uniquement `dist`. Voir [le guide de déploiement](docs/DEPLOYMENT.md). Aucun site public ou dépôt distant n’est créé automatiquement par cette extraction.

Un domaine ou port différent possède son propre stockage navigateur. Pour retrouver une progression existante, utiliser **Ma sauvegarde → Exporter** dans l’ancienne copie puis **Importer** dans la nouvelle. Les IDs, clés et le format v1 restent inchangés.

## Documentation et consignes

- [Consignes des agents](AGENTS.md) et [consignes produit conservées](src/malagasy/AGENTS.md).
- [Programme pédagogique](docs/CURRICULUM.md), [sources linguistiques](docs/LANGUAGE_SOURCES.md), [architecture](docs/ARCHITECTURE.md).
- [Comparaison des solutions TTS gratuites et licences](docs/MALAGASY_TTS_COMPARISON.md).

Les liens et notices de sources restent dans la rubrique existante Sources & crédits de l’app. Les références et licences des candidats non intégrés accompagnent l’atelier.
