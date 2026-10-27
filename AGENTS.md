# Malagasy Adventure — dépôt indépendant

Lire [les consignes produit et pédagogiques](src/malagasy/AGENTS.md), puis [les consignes de l’atelier audio](audio-workbench/AGENTS.md) pour un travail sur les voix.

## Décision utilisateur de séparation

Ce dépôt est maintenant la copie de travail indépendante de Malagasy Adventure. Le dépôt voisin `Bomberman2026` / Afterhours Arcade reste intact ; sa version malgache devient une copie historique. **Ne pas modifier le dépôt Arcade depuis ce projet.**

La demande de séparation remplace les anciennes consignes imposant de garder Malagasy Adventure dans le dépôt Arcade. Les autres demandes produit restent applicables : trois premières unités, apprentissage par dialogues, sources seulement dans Sources & crédits, progression compatible, qualité avant quantité, déploiement gratuit.

L’extraction ne change ni le parcours, ni les illustrations, ni les textes, ni les voix actives. Les candidats OmniVoice et leur atelier sont conservés hors du site ; leur activation attend toujours une demande dédiée. Les anciennes contraintes d’intégration au catalogue figurant dans les documents historiques ne doivent pas faire réintroduire les autres jeux.

## Architecture et vérification

- Vite, TypeScript strict, HTML/CSS/SVG et Web Audio. Aucun Phaser, framework ajouté ou backend permanent.
- L’app est dans `src/malagasy/`. `src/main.ts` est seulement le point d’entrée autonome. `/` et `/malagasy-adventure` ouvrent l’app.
- Publication statique Netlify : `npm run build`, dossier `dist`, Node 22. Ne pas reprendre un identifiant de site, un remote Git ou des secrets d’Arcade.
- Garder les IDs et le schéma de sauvegarde v1 compatibles. Un nouveau domaine/port a un stockage navigateur différent ; les exports/imports existants assurent le transfert.
- Les outils et modèles auteur restent dans `.tools/`, ignoré par Git. Ils ne sont pas nécessaires au build ou au déploiement. Ne créer aucune dépendance absolue vers le dépôt Arcade.
- Vérifier les tests du moteur, les parcours navigateur, le build et les outils audio affectés. Éviter tout changement d’application lors d’un simple travail de structure.
- Lire [MIGRATION.md](MIGRATION.md) pour la provenance, les limites de cette extraction et les étapes de publication indépendante.
