# Atelier audio malgache — consignes

La dernière demande utilisateur du 27 octobre 2026 active les candidats OmniVoice homme/femme existants sur le site, sans les recalculer, et limite `review-audio.cmd` à OmniVoice. Conserver les évaluations pour la future revue malgachophone. Les solutions doivent permettre une publication gratuite. Elle prime sur les intégrations proposées dans le prompt audio et les expériences précédentes.

- Préserver les quatre apps, les trois unités malgaches, leurs textes, parcours et sauvegardes. La vision pédagogique reste dans [les consignes de l’app](../src/malagasy/AGENTS.md).
- Les fichiers auteur restent ici. Une copie identique des entrées du manifeste est publiée dans `public/malagasy/voices/omnivoice/`. Une revue ou génération ne remplace pas automatiquement cette copie ; aucune régénération n’est demandée.
- Corriger la faiblesse des mots courts (`Eny`, `Tsia`) et la rupture de timbre de Mia sur `Azafady`. Une référence synthétique fixe par personnage doit accompagner mots et phrases ; conserver la différence Mia/Lova sans changer la voix d’un mot à l’autre.
- Conserver exactement les mots malgaches existants. Ne pas inventer de transcriptions phonétiques ou modifier l’orthographe pour tromper un moteur. La variante écrite `Aza fady` est déjà une réponse acceptée dans le contenu ; elle reste une entrée distincte.
- Vérifier le support explicite de la langue et l’accès gratuit réel. Une offre générique multilingue ou un essai avec carte bancaire ne suffit pas. Aucun appel payant, serveur permanent, base obligatoire ni secret frontend.
- La comparaison actuelle des services est dans [MALAGASY_TTS_COMPARISON.md](../docs/MALAGASY_TTS_COMPARISON.md). Le moteur local OmniVoice `plt` est un candidat ; ne pas présenter Gemini gratuit comme supportant le malgache sans nouvelle preuve officielle.
- Les fichiers sont des candidats `synthetic` / `model-generated`. Le décodage, un test navigateur ou une transcription ASR ne certifient pas la prononciation. La revue linguistique doit pouvoir noter Good / Acceptable / Incorrect et décrire les erreurs.
- Protéger les fichiers évalués Good par leur empreinte. Ne pas remplacer leurs octets lors d’une génération incrémentale ; seule l’option explicite `--replace-approved` peut le permettre. Conserver l’historique des revues.
- Maintenir manifeste, IDs stables, liens vers les contenus, modèle/révision, réglages, références vocales, licences et empreintes. Toute référence modifiée doit être détectée avant génération.
- Garder les crédits et notices dans les documents de l’atelier. Lors d’une éventuelle intégration future, ils iront seulement dans Sources & crédits.
- Générer localement avant publication, jamais au build Netlify ni lors d’une lecture par un joueur. Le stockage et la bande passante gratuits ont des limites ; ne pas promettre du gratuit illimité.
