# Atelier local de revue audio malgache

Cet outil concerne la préparation audio uniquement. Il ne modifie aucune route, interaction ou voix active du site et n’est pas nécessaire au build ni à la publication Netlify. Il utilise seulement Node.js, sans serveur distant, compte Cloud ou dépendance payante.

Depuis la racine du dépôt, avec le Node local déjà utilisé pour le projet :

```powershell
.\review-audio.cmd
```

Ce lanceur Windows utilise le Node local du projet. La commande directe reste disponible : `.tools/node-v22.23.3-win-x64/node.exe scripts/malagasy-audio-review.mjs`. Ouvrir **http://127.0.0.1:5191**. Si le port est occupé, ajouter `--port 5191` à la commande directe. Le serveur écoute uniquement `127.0.0.1` ; il n’est pas destiné à être exposé à Internet. Ctrl+C arrête l’atelier.

La page affiche uniquement les candidats OmniVoice pour Mia et Lova. Les anciennes voix sont exclues du catalogue. Elle charge les candidats lorsque le fichier `audio-workbench/generated/omnivoice/manifest.json` existe. Chaque entrée candidate fournit au minimum `id`, `transcript`, `character` et `file`, chemin relatif au manifeste tel que `audio/identifiant.ogg`. Les champs facultatifs `model`, `duration`, `sha256` et `bytes` enrichissent la comparaison.

Pour les candidats OmniVoice, l’atelier lit **le maître WAV PCM déclaré dans `masterFile`**, afin de fonctionner aussi lorsque le navigateur refuse Opus. Les fichiers compressés restent conservés avec leurs maîtres ; l’inventaire regroupe maintenant aussi les nouvelles répliques du monde 1. Le maître est servi uniquement à travers l’entrée autorisée du catalogue, avec son propre type MIME, sa taille et son empreinte ; aucun accès libre aux chemins locaux n’est ouvert. Les références de génération ne sont pas exposées.

Les fichiers sont regroupés par transcription avec recherche, filtre de personnage et filtre d’évaluation. Le mode normal utilise 1× ; le mode lent utilise 0,8× avec conservation de la hauteur. La relecture remplace la lecture précédente, et la page arrête le son lorsqu’elle passe en arrière-plan. Aucun moteur de synthèse du navigateur ne remplace un fichier absent.

Chaque voix OmniVoice peut recevoir **Good / Acceptable / Incorrect**, des notes et des initiales facultatives du relecteur. Évaluer l’exactitude des mots, l’accentuation, le rythme et la cohérence du personnage sur plusieurs phrases. Une voix agréable ou un test technique n’est pas une validation malgachophone.

Les revues sont stockées dans `audio-workbench/reviews.json`, et le bouton Exporter permet de conserver une copie JSON. Une revue conserve le SHA-256 du candidat et, lorsqu’un maître est lu, le **`playbackSha256` des octets réellement écoutés**. L’URL de lecture contient cette empreinte pour éviter un ancien son décodé en cache. Si le candidat ou son maître change pendant la revue, le serveur refuse l’enregistrement fondé sur l’ancienne version ; l’utilisateur doit actualiser et réécouter. Les évaluations et leur historique sont conservés. Une ancienne évaluation ne vaut pas approbation de nouveaux octets.

Le générateur consulte les entrées notées `good` et préserve un fichier dont le SHA-256 correspond. L’interface ne fournit pas de bouton de régénération factice : elle indique les commandes locales et n’exécute aucun fournisseur. Le wrapper `node scripts/malagasy-neural.mjs --help` présente les options et choisit l’environnement de génération local. Chaque candidat affiche aussi sa commande ciblée :

```powershell
node scripts/malagasy-neural.mjs --id audio-neural-mia-57d9d9154bb3c126 --force
```

Cette commande régénère « Azafady » pour Mia dans l’atelier ; elle ne remplace aucune voix du site. `--force` ne retire pas la protection des fichiers approuvés. Si `node` n’est pas sur le PATH, utiliser `.tools/node-v22.23.3-win-x64/node.exe` à sa place.

API locale :

| Route | Usage |
| --- | --- |
| `GET /api/catalog` | Inventaire, empreintes calculées sur les fichiers et revues correspondantes ; aucun chemin absolu renvoyé. |
| `GET /api/reviews` | Revues persistées. |
| `POST /api/review` | Enregistrer `{key, sha256, playbackSha256?, rating, notes, reviewer?}` ; `playbackSha256` est requis si le maître diffère du candidat. `rating` vaut `good`, `acceptable` ou `incorrect`. |
| `GET /api/export` | Télécharger les revues JSON. |
| `GET /audio/<key>` | Lire le maître WAV autorisé lorsqu’il est disponible, sinon le fichier déclaré, avec requêtes HTTP Range adaptées aux octets réellement servis. |

Le serveur borne les corps JSON et les notes, refuse les origines et hôtes externes, restreint les médias aux dossiers audio prévus et vérifie les chemins réels, y compris les liens symboliques. Les revues illisibles sont conservées et signalées au lieu d’être écrasées.

Vérifier l’outil sans lancer le site :

```powershell
.tools/node-v22.23.3-win-x64/node.exe --test scripts/malagasy-audio-review.test.mjs
```

Historique de vérification du premier lot : huit tests Node réussis, dont la lecture HTTP des maîtres PCM, les deux empreintes liées à une revue, le refus d’un maître modifié et les chemins bornés. Un contrôle Chromium a aussi terminé douze lectures réelles d’Azafady, Eny et ny pour Mia/Lova à 1× et 0,8×, en simulant un navigateur refusant tous les Opus candidats. Les 102 entrées utilisent leurs maîtres PCM, sans chevauchement ni changement des vrais avis. Les contrôles précédents couvrent également reprise après fichier absent, export et mobile 390 px.
