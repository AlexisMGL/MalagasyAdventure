# Déploiement indépendant sur Netlify

Le projet est autonome : sa construction ne lit aucun fichier du dépôt Arcade voisin. Il ne comporte aucun identifiant Netlify repris d’Arcade. La publication de cette copie doit utiliser **un nouveau site**, sans relier ou remplacer le site existant.

1. Créer un dépôt distant pour `MalagasyAdventure` et y pousser ce dépôt local.
2. Dans Netlify, importer ce nouveau dépôt comme un nouveau projet, sur l’offre gratuite adaptée.
3. Répertoire de base : racine du dépôt. Build : `npm run build`. Publication : `dist`. Node : 22.
4. Après publication, ouvrir `/` et `/malagasy-adventure`, recharger chaque URL et vérifier le parcours, les sources et l’import d’une sauvegarde.

`netlify.toml` fournit le build, le fallback SPA, le cache des bundles et les en-têtes. `public/_redirects` permet aussi de publier le `dist` construit localement via un envoi manuel.

Le site indiqué le 28 octobre 2026 est [malagasyadventure.netlify.app](https://malagasyadventure.netlify.app/). Le client comprend la configuration publiable du projet Supabase dédié ; aucun secret serveur n’est nécessaire au build. Les variables `VITE_SUPABASE_URL` et `VITE_SUPABASE_PUBLISHABLE_KEY` permettent de la remplacer pour un autre environnement. Les **URL Auth sont enregistrées et vérifiées** ; le **SMTP personnalisé** reste à terminer selon [SUPABASE.md](SUPABASE.md). Le mode découverte et l’import/export fonctionnent indépendamment de ces réglages. La migration SQL a déjà été appliquée au projet dédié ; publier le site ne recrée pas la table.

Vérification du plugin Netlify le 28 octobre 2026 : le site indépendant `1f0003be-dcf3-4bb7-9643-fc1ef4d33850` est relié à la branche `main` de `AlexisMGL/MalagasyAdventure`. Le déploiement du commit `db742b9` est bien publié et contient le formulaire du compte, vérifié sur l’URL publique en ordinateur et mobile. Pour livrer une correction, privilégier le push Git sur ce dépôt connecté ; éviter un déploiement manuel qui serait remplacé au prochain push.

Ne publier ni `audio-workbench`, ni `.tools`, ni les environnements Python ou modèles. Les candidats audio restent hors du site à ce stade. Le build copie uniquement les assets actuellement utilisés dans `public/` ; il ne lance aucune génération audio.

Le plan gratuit a des plafonds, détaillés dans [la comparaison et ses sources officielles](MALAGASY_TTS_COMPARISON.md). La préparation ne crée aucun compte, ne change aucun abonnement et ne déclenche aucune facturation.

L’extraction prépare ce déploiement ; elle ne crée pas de remote Git, n’associe pas de compte Netlify et ne publie pas de nouveau domaine. Ces opérations sont distinctes d’une simple restructuration locale.
