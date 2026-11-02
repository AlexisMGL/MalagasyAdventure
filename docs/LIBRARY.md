# Bibliothèque et couverture du vocabulaire

La demande du 2 novembre 2026 remplace l’ancien onglet du lexique par une bibliothèque. L’URL `#vocabulary` reste compatible et le bouton s’appelle « Bibliothèque ».

## Accès et lecture

- **Vocabulaire** et **Notions** : deux listes de fiches individuelles, regroupées par thème dans « Mon carnet ». Chaque fiche a une icône représentative issue des dessins du cours, un titre, un aperçu et sa leçon d’origine. Le carnet reprend toutes les fiches des parties terminées et de la prochaine partie disponible, selon le moteur existant. Les quiz ne sont pas des fiches.
- La recherche porte sur le thème, ses synonymes français (« chiffres » retrouve les nombres), le titre, les mots, les explications et les exemples. Un sommaire repliable permet de rejoindre un thème au clavier ou au toucher. Les titres génériques des compléments lexicaux sont précisés dans l’index ; les contenus malgaches restent identiques.
- Une fiche s’ouvre directement en **lecture libre**, avec son schéma complet, ses exemples et ses prononciations existantes. Les autres fiches du même thème restent accessibles sous le pense-bête. Cette consultation ne crée ni concept découvert, XP, tentative ni validation. Le bouton « Pratiquer cette leçon » ouvre le parcours normal ; les anciens liens vers une partie entière restent utilisables.
- **Malgache → Français** et **Français → Malgache** : les mêmes mots et expressions, triés d’après la langue affichée à gauche, avec regroupement par initiale, recherche sans distinction d’accents et lien vers leur leçon d’introduction.
- Les mots et fiches des leçons encore verrouillées ne sont pas exposés. Les URL directes sont vérifiées contre la progression avant affichage ou lecture audio. Aucun changement de schéma v1, ID de leçon ou concept ; les anciens carnets donnent automatiquement les mêmes accès.

Les routes `#vocabulary`, `#vocabulary/notions`, `#vocabulary/mg-fr`, `#vocabulary/fr-mg`, `#vocabulary/lesson-07-01/notion-07-01-1` et l’ancien `#vocabulary/lesson-04-02` sont consultables directement. Une fiche est vérifiée à la fois contre sa leçon et son identifiant ; un lien vers une fiche verrouillée ou une fiche d’une autre leçon n’affiche aucun contenu ni contrôle audio. Les liens du lexique ouvrent directement la fiche de vocabulaire qui présente le mot. Ces routes n’écrasent pas le monde choisi dans le parcours. Les filtres restent un état d’interface temporaire.

## Source des mots et des fiches

`CONTENT.vocabulary` conserve ses 133 entrées. `course-vocabulary.ts` les complète par les 30 gloses contextuelles de `vocabulary-supplements.ts` : formes possédées, verbes, états, mots-outils et composants des expressions déjà présentes dans les cours. Le répertoire complet compte ainsi **163 entrées**. Les sens restent limités aux contextes enseignés ; « salama » salutation et « salama » état de santé sont distingués.

Chaque entrée est reliée à une leçon. Les premières occurrences réelles corrigent les regroupements trop tardifs des concepts : `iza` apparaît dès la présentation du nom, `aiza` dès l’origine, avant leur unité grammaticale dédiée. Les compléments dont le sens est lié à un contexte précis conservent leur introduction rédigée.

`vocabulary-cards.ts` vérifie les **étiquettes explicites** de la section Vocabulaire de cette leçon. Les entrées absentes y deviennent des fiches illustrées d’au plus quatre mots ou expressions. Une simple présence dans un exemple de Notions ne suffit pas. Les schémas de grammaire sont conservés. Le total est de **172 fiches visuelles** : 96 à Antananarivo et 76 à Antsirabe, dont 86 fiches Vocabulaire.

Les nouveaux dessins de lieu, dessus/dessous, question, mise en relief, lien et moment présent utilisent les SVG originaux de `lesson-visuals.ts`. Les exemples audio réemploient uniquement des enregistrements entiers déjà publiés, correspondant au texte exact. Aucun fichier, modèle ou manifeste audio n’est régénéré.

Les trois notices lexicales complémentaires (`asa`, `any`, `eo`) ont leurs entrées dans `CONTENT.sources`, visibles uniquement dans Sources & crédits. Les autres explications réutilisent les références déjà liées aux leçons. La couverture technique ne remplace pas la relecture malgachophone.

## Contrôles auteur

`malagasy-library.test.ts` exige une étiquette de vocabulaire à la première leçon de chaque entrée, puis parcourt les dialogues et sélections explicitement malgaches des 72 leçons pour refuser tout mot nouveau absent de Vocabulaire. Seuls les noms fictifs Mia et Lova sont exclus de ce contrôle lexical. Il vérifie aussi les sources, les accès depuis un carnet v1, les deux tris alphabétiques, les routes et l’absence de modification du carnet à la lecture.

`library-cards.ts` construit l’index thématique sans modifier les fiches pédagogiques ou la sauvegarde. Le corpus entièrement débloqué expose 86 fiches Vocabulaire et 86 fiches Notions. Toute nouvelle fiche issue de `getNotionCards` est indexée automatiquement ; les titres des compléments et les thèmes restent des métadonnées françaises d’orientation.

Pour un futur ajout, enregistrer les mots/formes et leurs gloses sourcées avant leur première utilisation ; ne pas compter un schéma grammatical comme introduction lexicale. Les tests navigateur vérifient le carnet, les accès verrouillés, la recherche « chiffres », chaque fiche et les 48 anciennes références à 340 px, les vues à 340/390/1440 px et la lecture d’un vrai fichier audio depuis une fiche.
