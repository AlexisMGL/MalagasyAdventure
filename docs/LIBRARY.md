# Bibliothèque et couverture du vocabulaire

La demande du 2 novembre 2026 remplace l’ancien onglet du lexique par une bibliothèque. L’URL `#vocabulary` reste compatible et le bouton s’appelle « Bibliothèque ».

## Accès et lecture

- **Leçons** : répertoire des leçons débloquées par le moteur existant, regroupées par monde et unité. Cela comprend les leçons terminées et la prochaine partie disponible, ainsi que les quiz accessibles.
- Une partie s’ouvre en **lecture libre** : toutes ses fiches Vocabulaire et Notions, leurs schémas, exemples et prononciations existantes. Cette consultation ne crée ni concept découvert, XP, tentative ni validation. Le bouton « Pratiquer cette leçon » ouvre le parcours normal.
- **Malgache → Français** et **Français → Malgache** : les mêmes mots et expressions, triés d’après la langue affichée à gauche, avec regroupement par initiale, recherche sans distinction d’accents et lien vers leur leçon d’introduction.
- Les mots et fiches des leçons encore verrouillées ne sont pas exposés. Les URL directes sont vérifiées contre la progression avant affichage ou lecture audio. Aucun changement de schéma v1, ID de leçon ou concept ; les anciens carnets donnent automatiquement les mêmes accès.

Les routes `#vocabulary/mg-fr`, `#vocabulary/fr-mg` et `#vocabulary/lesson-04-02` sont consultables directement. Elles n’écrasent pas le monde choisi dans le parcours. Les filtres restent un état d’interface temporaire.

## Source des mots et des fiches

`CONTENT.vocabulary` conserve ses 133 entrées. `course-vocabulary.ts` les complète par les 30 gloses contextuelles de `vocabulary-supplements.ts` : formes possédées, verbes, états, mots-outils et composants des expressions déjà présentes dans les cours. Le répertoire complet compte ainsi **163 entrées**. Les sens restent limités aux contextes enseignés ; « salama » salutation et « salama » état de santé sont distingués.

Chaque entrée est reliée à une leçon. Les premières occurrences réelles corrigent les regroupements trop tardifs des concepts : `iza` apparaît dès la présentation du nom, `aiza` dès l’origine, avant leur unité grammaticale dédiée. Les compléments dont le sens est lié à un contexte précis conservent leur introduction rédigée.

`vocabulary-cards.ts` vérifie les **étiquettes explicites** de la section Vocabulaire de cette leçon. Les entrées absentes y deviennent des fiches illustrées d’au plus quatre mots ou expressions. Une simple présence dans un exemple de Notions ne suffit pas. Les schémas de grammaire sont conservés. Le total est de **172 fiches visuelles** : 96 à Antananarivo et 76 à Antsirabe, dont 86 fiches Vocabulaire.

Les nouveaux dessins de lieu, dessus/dessous, question, mise en relief, lien et moment présent utilisent les SVG originaux de `lesson-visuals.ts`. Les exemples audio réemploient uniquement des enregistrements entiers déjà publiés, correspondant au texte exact. Aucun fichier, modèle ou manifeste audio n’est régénéré.

Les trois notices lexicales complémentaires (`asa`, `any`, `eo`) ont leurs entrées dans `CONTENT.sources`, visibles uniquement dans Sources & crédits. Les autres explications réutilisent les références déjà liées aux leçons. La couverture technique ne remplace pas la relecture malgachophone.

## Contrôles auteur

`malagasy-library.test.ts` exige une étiquette de vocabulaire à la première leçon de chaque entrée, puis parcourt les dialogues et sélections explicitement malgaches des 72 leçons pour refuser tout mot nouveau absent de Vocabulaire. Seuls les noms fictifs Mia et Lova sont exclus de ce contrôle lexical. Il vérifie aussi les sources, les accès depuis un carnet v1, les deux tris alphabétiques, les routes et l’absence de modification du carnet à la lecture.

Pour un futur ajout, enregistrer les mots/formes et leurs gloses sourcées avant leur première utilisation ; ne pas compter un schéma grammatical comme introduction lexicale. Les tests navigateur vérifient le répertoire, les accès verrouillés, la recherche, les 48 références à 340 px, les vues à 340/390/1440 px et la lecture d’un vrai fichier audio depuis une fiche.
