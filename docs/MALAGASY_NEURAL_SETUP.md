# Préparation audio gratuite, hors du site

Mise à jour du 27 octobre 2026 : les candidats OmniVoice existants sont désormais copiés à l’identique dans le site, sans régénération. La préparation décrite plus bas reste un historique et un outil auteur ; elle n’est requise ni au build ni à la lecture. Voir [la banque active](MALAGASY_VOICES.md).

## État de l’audio existant

| Élément existant | Fonction et constat |
| --- | --- |
| `src/malagasy/content.ts`, `dialogue-content.ts` | Trois unités, neuf parties dont trois quiz, 72 activités, dialogues et lexique. Sources du texte, sans modification pour cette étape. |
| `scripts/generate-malagasy-mms.mjs` | Génération locale antérieure avec la conversion ONNX du modèle Meta MMS malgache, 16 kHz, un locuteur. |
| `public/malagasy/voices/mms/`, `profiles/` | 52 WAV de base et 51 variantes de Mia à hauteur relevée. Ces anciennes sorties sont archivées ; OmniVoice est la banque active. |
| `voice-bank.ts`, `voice-recordings.ts` | Correspondance d’une réplique entière ; huit références humaines locales, dont le remplacement isolé d’Azafady. L’utilisateur juge ce remplacement mieux prononcé mais discontinu avec le timbre de Mia. |
| `dialogue-audio.ts`, `main.ts` | Lecture automatique des tours nouveaux, haut-parleur, lecture lente, sélections malgaches, annulation et muet. Pas de TTS française/anglaise du navigateur. |
| `audio.ts` | Service des exercices d’écoute vérifiés et sons de réponse. L’accompagnement synthétique ne devient pas une évaluation orale. |

La parole du site provient déjà de **fichiers statiques**, pas d’une API appelée à chaque écoute. La priorité est donc de préparer de meilleurs fichiers et de les comparer, sans refaire le lecteur ou les leçons.

## Moteur candidat retenu

La [comparaison des solutions et des coûts](MALAGASY_TTS_COMPARISON.md) explique pourquoi Gemini n’est pas sélectionné : l’offre Developer API gratuite ne documente pas le malgache dans les listes consultées ; le support explicite `mg-MG` trouvé concerne une offre Cloud distincte, sans quota gratuit Gemini-TTS.

Le candidat utilise **`k2-fsa/OmniVoice` en malgache du Plateau `plt`**, avec une référence **entièrement synthétique et fixe par personnage**. Mia et Lova ont chacun une référence propre. Azafady, Eny, les mots isolés et les phrases d’un même personnage utilisent ce même timbre. Aucun enregistrement humain n’est cloné. Les références humaines servent seulement à la comparaison.

Le modèle reçoit le texte malgache exact dans son champ texte et `language='plt'`. Les instructions de création de voix sont des attributs pris en charge par son API (`female/male`, âge, hauteur). Le long prompt anglais destiné à Gemini n’est pas injecté dans le texte à prononcer. Aucune graphie ou transcription phonétique n’est inventée.

Ces sorties sont des **candidats non relus**, identifiés `synthetic` / `model-generated`. Le contrôle technique ne les transforme pas en prononciations validées. Les essais ASR privés sont eux-mêmes peu fiables sur les références humaines courtes ; ils ne servent pas de certification ou de note automatique.

## Utilisation dans l’environnement déjà préparé

Depuis la racine, le Node local du dépôt est disponible :

```powershell
.tools/node-v22.23.3-win-x64/node.exe scripts/prepare-malagasy-neural.mjs
.tools/node-v22.23.3-win-x64/node.exe scripts/malagasy-neural.mjs --plan
.tools/node-v22.23.3-win-x64/node.exe scripts/malagasy-neural.mjs --help
```

L’inventaire préparé couvre désormais toutes les répliques du monde 1 complet pour les deux personnages. Le premier lot historique contenait 51 textes distincts et 102 fichiers, conservés à l’identique. Il couvre les répliques complètes, les entrées lexicales, les choix malgaches corrects et incorrects, les mots à placer, les associations et les réponses construites. Chaque entrée conserve ses liens vers scènes, exercices, notes ou mots du lexique. La déduplication porte sur une clé NFC/casse/espaces/ponctuation ; le texte prononcé n’est pas réécrit. Les guillemets de présentation et les séparateurs des exemples ne sont pas des mots à lire.

Les textes à trous restent exclus. Les réponses françaises et les réponses dont la langue n’est pas explicitement établie restent dans la liste `excluded`. Le générateur ne devine pas leur langue à partir de leur orthographe. La variante `Aza fady`, déjà acceptée par l’exercice existant, reste un texte distinct d’`Azafady`.

Pour préparer un petit lot de comparaison :

```powershell
.tools/node-v22.23.3-win-x64/node.exe scripts/malagasy-neural.mjs --pilot
```

Pour compléter tout le corpus de manière incrémentale :

```powershell
.tools/node-v22.23.3-win-x64/node.exe scripts/malagasy-neural.mjs --steps 32
```

Le lanceur choisit l’environnement auteur local et détecte CUDA, XPU ou CPU. `--device cpu`, `--device xpu` et `--device cuda` permettent un choix explicite. Aucun calcul n’est exécuté par Netlify. Le CPU fonctionne mais peut prendre plusieurs minutes par fichier ; l’accélérateur Intel local a aussi été utilisé pour les essais. Les temps dépendent fortement du matériel.

Pour régénérer une phrase non approuvée, reprendre son ID dans l’atelier ou `--plan` :

```powershell
.tools/node-v22.23.3-win-x64/node.exe scripts/malagasy-neural.mjs --id audio-neural-mia-57d9d9154bb3c126 --force
```

Un fichier noté **Good** et dont les octets correspondent à l’empreinte approuvée reste protégé, même avec `--force`. Sa substitution exige en plus `--replace-approved`. Une ancienne évaluation ne vaut pas approbation d’un fichier modifié. Les liens vers le contenu peuvent être actualisés sans remplacer un enregistrement conservé.

## Installer les outils sur une autre machine

Outils gratuits : Python 3.11, PyTorch, OmniVoice, FFmpeg et le Node déjà utilisé par ce dépôt. Un environnement isolé évite toute dépendance supplémentaire dans le site. Exemple CPU sous Windows, avec Python installé :

```powershell
python -m venv .tools/omnivoice-runtime
.tools/omnivoice-runtime/Scripts/python.exe -m pip install torch==2.8.0 torchaudio==2.8.0 --index-url https://download.pytorch.org/whl/cpu
.tools/omnivoice-runtime/Scripts/python.exe -m pip install omnivoice==0.2.1 transformers==5.3.0
npm install --prefix .tools/voice-processing ffmpeg-static@5.3.0
node scripts/prepare-malagasy-neural.mjs
node scripts/malagasy-neural.mjs --download-model --pilot
```

Le premier téléchargement du modèle représente environ **3,3 Go de poids**, plus les bibliothèques de calcul. Ils restent dans `.tools/`, ignoré par Git. Aucun compte HF ni coût de génération hébergée n’est nécessaire. La révision est épinglée à `c5fdb5ccb189668d56333f77ba2629f4cd7535f4` ; les poids, configurations et tokenizer ont des empreintes vérifiées.

Pour Intel Arc, un environnement `.tools/omnivoice-xpu` peut utiliser les [roues PyTorch XPU officielles](https://docs.pytorch.org/docs/stable/notes/get_start_xpu.html). Le projet ne modifie aucun pilote système. Le chargement commence sur CPU puis transfère le modèle : cela évite une requête de mémoire libre non prise en charge par certains GPU intégrés avec PyTorch 2.8.

Un environnement Python déjà préparé peut aussi être indiqué par `MALAGASY_AUDIO_PYTHON`, chemin vers son exécutable. Les éventuelles bibliothèques auteur séparées dans `.tools/omnivoice-deps` sont prises en charge par le lanceur actuel. Aucune variable de clé API n’est lue par ce pipeline.

## Fichiers, contrôles et cache

Le dossier `audio-workbench/generated/omnivoice/` contient :

- `manifest.json` : texte exact, ID, personnage, liens de contenu, moteur/révision, référence, réglages, taille et empreinte.
- `audio/` : candidats compressés **Ogg/Opus 48 kbit/s**, sans appel réseau à la lecture.
- `masters/` : maîtres WAV mono 24 kHz, 16 bits, pour comparaison et encodages futurs.
- `references/` : références synthétiques des personnages, dont les empreintes doivent rester stables.
- `sources.json` : attributions destinées à accompagner une intégration future, sans modifier les crédits actuels du site.

La génération vérifie les échantillons finis, la durée, le signal non silencieux et le niveau. Les mots très courts disposent d’un réglage d’articulation distinct pour éviter une sortie écrasée ou supprimée comme un silence. Une tentative techniquement invalide peut être renouvelée une fois, avec les paramètres effectifs conservés. Un nouvel échec arrête le lot ; les fichiers déjà valides restent disponibles et le manifeste permet de reprendre.

L’Ogg est réellement décodé après encodage pour vérifier durée, niveau et absence de saturation. Les écritures passent par des fichiers temporaires ; un échec ne remplace pas l’ancien candidat. Le cache prend en compte texte, modèle, personnage, référence, paramètres de génération, moteur et encodage. Une référence vocale changée à l’insu du manifeste provoque un arrêt.

## Écoute et revue

Double-cliquer **`review-audio.cmd`**, ou lancer :

```powershell
.tools/node-v22.23.3-win-x64/node.exe scripts/malagasy-audio-review.mjs
```

Ouvrir **http://127.0.0.1:5191**. L’atelier présente uniquement les candidats OmniVoice pour Mia et Lova ; lecture normale, 0,8× et relecture interrompent proprement la voix précédente. Il propose Good / Acceptable / Incorrect et des notes liées à l’empreinte exacte. Aucune revue native n’est préremplie. Voir [le guide de revue](MALAGASY_AUDIO_REVIEW.md).

Commencer par **Azafady, Eny, Tsia**, puis alterner une phrase longue et un mot court du même personnage. Vérifier articulation, absence de mots ajoutés, accentuation et continuité de timbre. Une écoute malgachophone reste nécessaire avant de sélectionner des fichiers pour le site.

## Déploiement futur et droits

Cette étape ne déploie rien et n’intègre pas les candidats. Une demande ultérieure pourra sélectionner les fichiers relus, placer seulement les formats de lecture dans le répertoire statique et relier le manifeste au lecteur existant. Les poids, environnements Python, maîtres et serveur de revue ne doivent pas être publiés avec le site.

La génération locale n’appelle aucun service payant. Les limites du plan Netlify Free et les coûts de stockage/bande passante sont détaillés dans [la comparaison](MALAGASY_TTS_COMPARISON.md) ; aucun quota illimité n’est promis.

OmniVoice annonce ses poids sous **CC-BY-NC, version non précisée**, et son code sous Apache 2.0. Le codec inclus a aussi une licence **Boson Higgs Audio 2 Community**, avec les accords et notices Llama 3 à conserver. Les copies et attributions se trouvent dans `audio-workbench/licenses/` et `audio-workbench/NOTICE.md`. Une utilisation commerciale ou à une autre échelle ne doit pas être déduite de la gratuité du téléchargement. Les références humaines restent soumises à leurs licences existantes, sans nouveau clonage.

## Vérifier les outils

```powershell
.tools/node-v22.23.3-win-x64/node.exe --test scripts/prepare-malagasy-neural.test.mjs scripts/malagasy-audio-review.test.mjs
.tools/omnivoice-runtime/Scripts/python.exe -B scripts/test_malagasy_neural.py
.tools/node-v22.23.3-win-x64/node.exe scripts/check-malagasy-neural.mjs
npm test
npm run build
```

Les résultats effectifs et les tailles mesurées du lot sont consignés dans `audio-workbench/REPORT.md`. La validité technique et la validation linguistique restent deux informations distinctes.
