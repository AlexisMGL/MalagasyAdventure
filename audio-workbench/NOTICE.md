# Notices de l’atelier audio

Ces fichiers sont des essais audio hors du site. Ils ne remplacent pas les voix publiées et ne constituent pas une banque relue par un malgachophone.

## Synthèse

- **OmniVoice** — Han Zhu et collaborateurs, k2-fsa. Modèle `k2-fsa/OmniVoice`, révision `c5fdb5ccb189668d56333f77ba2629f4cd7535f4`. [Fiche et licence](https://huggingface.co/k2-fsa/OmniVoice). Poids annoncés sous CC-BY-NC, version non précisée ; code Apache 2.0.
- **Higgs Audio 2 tokenizer** — codec inclus dans cette révision. Sa licence distincte Boson Higgs Audio 2 Community est conservée dans [la copie intégrale](licenses/BOSON_HIGGS_AUDIO_2_LICENSE.txt), avec [l’accord Llama 3 et la politique d’usage](licenses/META_LLAMA_3_LICENSE_AND_USE_POLICY.txt).
- **Personnages Afterhours** — les deux références sont des sorties synthétiques créées pour Mia et Lova. Aucun enregistrement humain n’a servi à cloner ces voix. Chaque manifeste conserve le texte, les réglages et l’empreinte de la référence effectivement utilisée.
- **FFmpeg / libopus** — encodage local des maîtres WAV en Ogg/Opus à 48 kbit/s. Les outils de préparation ne sont pas distribués avec le site. [Documentation FFmpeg](https://ffmpeg.org/ffmpeg-codecs.html), [Opus](https://opus-codec.org/).

Notice conservée conformément au texte fourni avec le codec :

> Built with Higgs Materials licensed from Boson AI USA, Inc., Copyright Boson AI USA, Inc., All Rights Reserved and Meta Llama 3 licensed under the Meta Llama 3 Community License, Copyright Meta Platforms, Inc., All Right Reserved. Based on Meta Llama 3.

> Meta Llama 3 is licensed under the Meta Llama 3 Community License, Copyright © Meta Platforms, Inc. All Rights Reserved.

> Boson Higgs Audio 2 is licensed under the Boson Community License, Copyright © Boson AI USA, Inc. All Rights Reserved.

Les accords complets priment sur ces notices. La gratuité de téléchargement ne constitue pas une permission commerciale générale ni une promesse d’usage sans limite de taille.

## Comparaisons existantes

L’atelier lit les anciens fichiers sans les modifier : Meta MMS malgache et conversion ONNX par elloza, sous les conditions déjà documentées, ainsi que les références humaines de Manantiana, Jagwar et Bluerose25. Leurs attributions détaillées demeurent dans `public/malagasy/voices/attributions.json`, les sources du projet et les crédits actuels du site. Elles ne sont pas réinterprétées comme des autorisations de clonage.

## Ressources consultées

- [Liste des langues OmniVoice](https://github.com/k2-fsa/OmniVoice/blob/master/docs/languages.md) : malgache du Plateau `plt` explicitement listé.
- [Conseils pour la génération de clips courts](https://github.com/k2-fsa/OmniVoice/blob/master/docs/tips.md) : référence vocale recommandée.
- [Comparaison Gemini, MMS, OmniVoice et quotas gratuits](../docs/MALAGASY_TTS_COMPARISON.md).

Une éventuelle activation future devra conserver les notices adaptées dans Sources & crédits. Aucun changement des crédits du site n’est effectué à cette étape.
