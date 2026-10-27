# Audio malgache : modèles et coût nul

Vérification des sources officielles : **27 octobre 2026**. La dernière consigne utilisateur limite cette étape à l’audio : essais et revue dans `audio-workbench`, sans modification du site, de ses routes ou des voix actuellement servies. Aucun appel de génération Google n’a été effectué pour cette comparaison.

## Décision

**Essayer OmniVoice localement et conserver MMS comme comparaison. Ne pas activer Gemini pour le malgache sur la seule mention « multilingue ».** La préférence Gemini du prompt est conditionnelle à une langue et à un accès compatibles ; les documents consultés ne permettent pas de réunir ces conditions avec un coût strictement nul.

Le malgache est absent des listes officielles consultées de Gemini **Developer API** 3.8 TTS. Cela ne prouve pas que le modèle est incapable d’en produire ; cela signifie que son support n’est pas vérifié pour ce projet. Le support explicite `mg-MG` trouvé concerne **Google Cloud Text-to-Speech**, un autre service, dont la génération Gemini-TTS ne bénéficie pas d’un quota gratuit. [Guide Developer API et langues](https://ai.google.dev/gemini-api/docs/speech-generation), [fiche Flash TTS](https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash-tts), [langues Cloud Gemini-TTS](https://docs.cloud.google.com/text-to-speech/docs/gemini-tts), [tarifs Cloud TTS](https://cloud.google.com/text-to-speech/pricing).

## Comparaison technique

| Solution | Malgache explicitement documenté | Accès et coût de génération | Voix et limite de qualité | Usage retenu |
| --- | --- | --- | --- | --- |
| Gemini 3.8 Flash TTS, Developer API | Pas de malgache dans les listes consultées des langues prises en charge. | Clé Gemini ; offre gratuite annoncée, sous quotas. | Voix préconstruites et dialogues ; aucune qualité malgache mesurée ici. | Non sélectionné en l’absence de support malgache vérifié. |
| Gemini 3.8 Flash-Lite TTS, Developer API | Même absence dans le tableau officiel de langues consulté. | Offre gratuite annoncée, sous quotas ; service distinct de Cloud TTS. | Variante à débit élevé ; aucune mesure malgache effectuée. | Même décision. |
| Google Cloud Gemini-TTS | `mg-MG`, en **Preview**. | Projet et facturation Cloud nécessaires ; **pas de gratuité Gemini-TTS** dans le tableau tarifaire. | Plusieurs voix ; la présence d’une langue en Preview ne certifie pas chaque mot. | Écarté pour la contrainte de coût nul. |
| Meta `facebook/mms-tts-mlg` | Oui : modèle dédié `mlg`. | Poids locaux, sans clé ni coût d’API. | Un locuteur, sortie 16 kHz. Les défauts de mots courts et la rupture introduite par une référence humaine sont signalés dans ce projet ; ce n’est pas un benchmark indépendant. | Référence existante et comparaison. |
| `k2-fsa/OmniVoice` | Oui : **Plateau Malagasy `plt`**, listé avec 19,39 heures de données d’entraînement. | Poids locaux, sans clé ni coût d’API ; calcul sur la machine de préparation. | Création de voix et référence fixe par personnage. Le projet recommande une référence pour les clips de 1–2 secondes. La prononciation reste à relire. | Candidat hors ligne à comparer et faire noter, sans activation automatique. |

Sources primaires du tableau : [tarifs Gemini Developer API](https://ai.google.dev/gemini-api/docs/pricing), [MMS malgache](https://huggingface.co/facebook/mms-tts-mlg), [configuration MMS](https://huggingface.co/facebook/mms-tts-mlg/raw/main/config.json), [OmniVoice](https://huggingface.co/k2-fsa/OmniVoice), [langues OmniVoice](https://github.com/k2-fsa/OmniVoice/blob/master/docs/languages.md), [conseils pour les clips courts](https://github.com/k2-fsa/OmniVoice/blob/master/docs/tips.md).

Les améliorations acoustiques annoncées par un fournisseur ne constituent pas une évaluation de notre corpus. Une reconnaissance automatique des sorties peut repérer des échecs manifestes, mais ne remplace ni l’écoute comparée ni la relecture par un malgachophone.

## Accès Google : ce qui est vérifié, sans le configurer

Le SDK officiel documenté pour Gemini 3.8 TTS est `@google/genai >= 2.24.0` ou `google-genai >= 2.25.0`. Le guide utilise **`client.interactions.create`**, soit `POST /v1beta/interactions` : texte exact dans `input`, indications de jeu dans les annotations `speech_metadata`, voix dans `generation_config.speech_config`. Il ne faut pas réutiliser sans vérification l’ancien schéma `generateContent` ou l’API Cloud `text:synthesize`. [Guide officiel TTS](https://ai.google.dev/gemini-api/docs/speech-generation).

Pour un futur essai explicitement autorisé, une clé s’obtient dans Google AI Studio et reste dans une variable d’environnement locale, jamais dans les fichiers distribués. **Aucune clé n’est requise par la piste locale choisie.**

La tarification Developer API affiche une offre gratuite pour les deux modèles 3.8 TTS. Les limites applicables dépendent du modèle et du projet et se consultent dans AI Studio : ne pas promettre un nombre universel de requêtes gratuites. Un compte gratuit ne passe au payant qu’après configuration de la facturation ; une clé hérite toutefois du projet auquel elle appartient. Un éventuel outil gratuit doit donc refuser un projet payant, conserver un plafond local et s’arrêter sur épuisement de quota, sans basculement de modèle ou de fournisseur payant. Un simple plafond de dépenses sur un projet payant ne vaut pas garantie de zéro euro. [Quotas](https://ai.google.dev/gemini-api/docs/rate-limits), [facturation et statut du projet](https://ai.google.dev/gemini-api/docs/billing).

Les services Google ont leurs propres conditions d’utilisation et de traitement des entrées/sorties, distinctes des licences des poids locaux. Aucune autorisation de redistribution ne doit être déduite du seul mot « gratuit ». [Conditions Gemini API](https://ai.google.dev/gemini-api/terms).

## Licences locales et attributions à conserver

- **MMS** : Meta, `facebook/mms-tts-mlg`, **CC BY-NC 4.0**. Préserver aussi la provenance de la conversion ONNX existante. [Fiche et licence du modèle](https://huggingface.co/facebook/mms-tts-mlg).
- **OmniVoice** : Han Zhu et collaborateurs, `k2-fsa/OmniVoice`. Le code est sous Apache 2.0 ; la fiche annonce les poids sous **CC-BY-NC sans préciser la version**. Ne pas transformer cette mention en « CC BY-NC 4.0 » ou en permission commerciale. Conserver le lien, la révision exacte et les empreintes téléchargées. [Fiche et licence](https://huggingface.co/k2-fsa/OmniVoice#license).
- **Codec audio Higgs Audio 2 utilisé par OmniVoice** : licence distincte **Boson Higgs Audio 2 Community License Agreement**, datée du 20 juin 2025, dans `audio_tokenizer/LICENSE` de la révision `c5fdb5ccb189668d56333f77ba2629f4cd7535f4`. Elle incorpore l’accord Meta Llama 3 du 18 avril 2024, avec les modifications Boson. L’article 1.b vise notamment la mise à disposition des matériaux, dérivés ou produits/services qui les utilisent : copie des deux accords, attribution visible Boson/Meta et notices ; il renvoie aussi à la politique d’usage Llama et restreint l’amélioration d’autres grands modèles de langue avec ces matériaux ou leurs résultats. L’article 2 exige une licence élargie de Boson **au-delà de 100 000 utilisateurs actifs annuels** des produits/services du bénéficiaire ou de ses affiliés, sur l’année civile précédente. Ce seuil est annuel ; ce n’est ni une franchise mensuelle ni un tarif publié. [Texte exact inclus avec le codec](https://huggingface.co/k2-fsa/OmniVoice/blob/c5fdb5ccb189668d56333f77ba2629f4cd7535f4/audio_tokenizer/LICENSE).
- Les références de personnages utilisées pour les essais doivent être générées pour ces personnages ou disposer des droits adaptés ; les enregistrements humains de comparaison ne deviennent pas automatiquement des autorisations de clonage vocal.

La licence CC-BY-NC annoncée pour OmniVoice ne remplace donc pas la licence de son codec. Conserver les textes intégraux et notices dans `audio-workbench/licenses/`, dont la copie du codec téléchargé et [l’accord Llama 3 officiel avec sa politique d’usage](https://github.com/meta-llama/llama3/blob/dab0ae890fd0316369b89901b199355034bbe1b5/LICENSE). Le [fichier brut de ce même dépôt officiel](https://raw.githubusercontent.com/meta-llama/llama3/dab0ae890fd0316369b89901b199355034bbe1b5/LICENSE) est accessible sans compte. Cette description ne tranche pas l’application des clauses aux seuls fichiers audio générés.

Ces attributions accompagnent le manifeste et l’outil de revue. Leur éventuel ajout aux crédits du site attendra une demande d’intégration ; cette étape ne modifie pas l’application.

## Stockage, bande passante et Netlify gratuit

Le calcul de préparation reste local. Le résultat prévu est une banque statique : **aucun serveur d’inférence permanent, fonction Netlify ou appel TTS à chaque lecture**. Les poids de plusieurs gigaoctets et les environnements Python ne doivent pas être déployés.

Base d’estimation : **51 énoncés dédupliqués pour deux personnages, soit 102 fichiers de lecture cibles**, hors références vocales et masters de préparation. Estimations décimales calculées, pas tailles de fichiers déjà mesurées :

| Audio livré | WAV mono 24 kHz, 16 bits | Opus à 48 kbit/s |
| --- | ---: | ---: |
| Une minute | 2,88 Mo | environ 0,36 Mo |
| 102 clips, hypothèse de 2 s par clip | environ 9,79 Mo | environ 1,22 Mo |
| 1 000 téléchargements complets de ce lot | environ 9,79 Go | environ 1,22 Go |

WAV : `24 000 × 2 = 48 000 octets/s`. Opus : `48 000 / 8 = 6 000 octets/s`, hors conteneur et variations d’encodage. La compression économise ici environ un facteur huit ; sa transparence sur les consonnes et les mots courts doit être vérifiée à l’écoute. Le total effectif doit être recalculé depuis les fichiers générés. La lecture lente avec conservation de hauteur peut réutiliser le même fichier, sans doubler la banque.

Au 27 octobre 2026, le plan **Netlify Free à crédits** annonce **300 crédits par mois avec plafond ferme, sans recharge automatique**. Les tarifs documentés sont 20 crédits/Go de bande passante, 2 crédits/10 000 requêtes et 15 crédits/déploiement en production. Il est donc compatible avec des fichiers statiques gratuits, mais pas avec une fréquentation illimitée. Le plan réel du compte n’a pas été inspecté ; les anciens plans ont d’autres quotas. [Plan Free et crédits](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/), [règles de calcul](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/).

Exemple calculé : 1 000 visiteurs téléchargeant chacun 102 clips une fois consommeraient environ **24,5 crédits de bande passante Opus**, contre **195,8 en WAV**, plus environ **20,4 crédits pour 102 000 requêtes audio**. Ajouter les autres fichiers du site, les trois autres expériences et les déploiements ; le cache et les lectures répétées changent la consommation réelle. Ce calcul est un ordre de grandeur, pas une promesse de capacité.

Si le plafond Free est atteint, les projets sont mis en pause jusqu’au renouvellement du quota ; ce n’est pas un basculement automatique vers des paiements. Pour conserver le coût nul, rester sur Free et attendre le renouvellement plutôt que souscrire un plan payant ou activer une recharge. [Gestion des projets suspendus](https://docs.netlify.com/manage/accounts-and-billing/billing/resume-paused-projects/).
