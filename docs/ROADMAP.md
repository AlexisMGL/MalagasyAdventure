# Malagasy Adventure — état et suite

## Livraison actuelle

Le dépôt autonome livre le **monde 1 complet, Antananarivo** : 12 unités, 36 leçons, 96 scènes de Lova et Mia, 288 activités, 44 concepts et 92 fiches de vocabulaire. Chaque unité se termine par douze questions ; le quiz de l’unité 12 conclut le monde après validation des prérequis. Les mondes 2–20 restent planifiés et verrouillés.

Le chemin visuel de world-path.ts et world-path.css montre les 36 étapes, les parties et les quiz, la prochaine étape accessible, les validations et les verrous. Le tracé se construit à partir de la progression existante. Les compteurs du parcours ne sont pas présentés comme une maîtrise durable de la langue.

L’extension conserve les premiers IDs et le schéma de sauvegarde v1. Une sauvegarde des neuf leçons initiales reprend à l’unité 4 sans perdre ses acquis. La sauvegarde locale, l’export/import contrôlé, les rappels cumulatifs, les plafonds d’XP, les raccourcis chiffres/Entrée, le mobile, le muet et le mouvement réduit restent applicables.

Les voix sont celles d’OmniVoice pour Mia et Lova. Les 102 fichiers initiaux et leurs deux références vocales ne sont pas recalculés. L’utilisateur a autorisé la génération incrémentale des nouvelles répliques avec les mêmes voix ; --missing-only ajoute uniquement les IDs manquants. La banque complète comprend 470 fichiers (235 pour chaque personnage), tous décodés et vérifiés par l’audit de couverture. Le site lit des fichiers statiques : aucune génération au build, à l’écoute ou sur un backend. L’atelier de revue conserve uniquement OmniVoice et les avis existants.

La construction reste statique Vite/TypeScript, compatible Netlify. Ces modifications locales ne signifient pas qu’un site a été publié. Le dépôt Arcade voisin n’est pas modifié et ses modules ne sont pas réintroduits.

## Limites connues

- La documentation des formulations ne remplace pas une relecture malgachophone de la naturalité, du registre et des prononciations. Les sorties OmniVoice restent identifiées comme synthétiques.
- Les prix et les trajets des scènes sont fictifs. Les mondes 2–20, leurs durées et leurs objectifs décrivent un programme futur, sans promesse de niveau ou de fluidité en six mois.
- Le parcours est composé de conversations guidées écrites. Il ne simule ni reconnaissance vocale, ni notation de prononciation, ni tuteur conversationnel génératif.
- La maîtrise est une heuristique locale ; plusieurs journées de rappel restent nécessaires. Les XP et les médailles du chemin ne certifient pas la rétention.
- Les licences et restrictions non commerciales d’OmniVoice, ainsi que les accords de son codec, restent à respecter. Les notices sont dans Sources & crédits et avec les fichiers publiables.
- Le mode découverte conserve sa sauvegarde locale et l’export/import. Un compte Supabase facultatif ajoute la sauvegarde privée et la reprise sur un autre appareil. Les formulaires mail/mot de passe et la récupération sont implémentés ; les redirections Auth vers Netlify sont enregistrées. Le SMTP personnalisé pour l’envoi public reste à configurer. Voir [SUPABASE.md](SUPABASE.md).

## Prochain travail utile

Le programme culturel corrigé le 28 octobre 2026 est réparti dans **les vingt mondes dès Antananarivo** : souverains aux mondes 1–7, relations britanniques dès le monde 2, conquête et vie coloniale aux mondes 7–8, royaumes régionaux aux mondes 9 et 11, occupation de 1942 au monde 12, nationalisme au monde 13, 1947 au monde 14 et indépendance au monde 16. Les derniers mondes approfondissent ces repères. Les groupes culturels sont découverts dans plusieurs régions, puis comparés, au lieu d’être tous introduits à Maroantsetra. Les fiches détaillent ce fil ; les futurs cours restent à rédiger et verrouillés. L’étape 19 garde Maroantsetra et l’ID `world-19`. Voir [le programme détaillé](CURRICULUM.md).

L’accès au compte comporte un bouton textuel « Se connecter » dans l’en-tête, visible aussi sur mobile, en complément du rappel découverte et du menu. La carte culturelle du parcours ouvre les repères du premier monde. Le mode découverte reste immédiatement accessible.

1. Faire relire les douze unités et les voix par des personnes malgachophones compétentes en enseignement du standard, puis conserver les remarques et leurs empreintes dans l’atelier audio.
2. Corriger les formulations ou les clips concernés sans recalculer les enregistrements approuvés par défaut. Vérifier à nouveau couverture, lecture, quiz et sauvegardes après toute correction.
3. Observer l’usage du chemin, les erreurs et les rappels différés pour améliorer la pédagogie avant d’étendre le corpus.
4. À la prochaine demande d’extension, rédiger et vérifier les mondes suivants avec les mêmes exigences de sources, dialogues, prérequis et quiz.

[CURRICULUM.md](CURRICULUM.md) décrit les douze unités et le programme futur ; [LANGUAGE_SOURCES.md](LANGUAGE_SOURCES.md) conserve les références et limites ; [REVIEW_ENGINE.md](REVIEW_ENGINE.md) distingue parcours, récompenses et maîtrise. Les résultats de vérification effectifs doivent être rapportés après les contrôles, pas déduits de cette feuille de route.
