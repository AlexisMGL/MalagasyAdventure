# Application web installable

Malagasy Adventure partage une seule base de code et une seule publication Netlify entre site et application installée. Cette première PWA nécessite Internet. Elle ne propose aucun téléchargement de monde, service worker, préchargement audio ni cache applicatif hors ligne.

## Installation

Sur mobile, ouvrir **Plus d’options → Installer l’application**. Sur ordinateur, utiliser **Installer l’application** dans le menu latéral.

- Chrome/Edge : le bouton d’installation apparaît lorsque le navigateur émet `beforeinstallprompt`. Sinon, le guide décrit l’installation depuis le menu du navigateur.
- iPhone/iPad : ouvrir dans Safari, Partager → Sur l’écran d’accueil → Ajouter ; activer « Ouvrir comme app web » si proposé.
- Le mode autonome supprime la barre d’adresse et respecte les marges de l’écran. Une barre de navigation en bas donne accès aux cinq rubriques du voyage. Elle s’efface pendant une leçon ; les boutons de sortie existants restent disponibles.

L’installation ne transfère pas automatiquement le stockage local entre contextes isolés. Le guide conseille le même compte pour retrouver le carnet, ou l’export/import v1 pour le mode découverte. Aucun schéma, identifiant, récompense ou contenu pédagogique n’est modifié.

## Publication et mises à jour

`vite.config.ts` crée un identifiant aléatoire par build, intégré au programme et à `dist/version.json`. Le client de production vérifie ce petit fichier au démarrage, lors du retour dans l’app et toutes les cinq minutes quand la page est visible ; les vérifications sont espacées d’au moins une minute et les échecs sont silencieux. Le développement local ne vérifie pas les versions.

Une nouvelle version n’entraîne jamais de rechargement automatique. La proposition est masquée pendant les fiches, dialogues, exercices et formulaires de compte. Elle apparaît au retour au parcours ou à la fin de la leçon ; « Actualiser » conserve le carnet et recharge la page. « Plus tard » masque la proposition pour la page courante. La rubrique d’installation conserve également l’accès à la nouvelle version.

Netlify revalide le HTML et le manifeste ; `/version.json` utilise `no-store`. Les fichiers `/assets/*` gardent leurs noms à empreinte et leur cache long. Aucun cache de compte ou réponse Supabase n’est ajouté. Publier sur la branche de production met à jour le site et la PWA ; une fenêtre déjà ouverte reste utilisable jusqu’à l’actualisation choisie.

## Fichiers et vérification

- `public/manifest.webmanifest` : identité stable `/`, portée `/`, démarrage `/`, affichage autonome, couleurs, icônes PNG et raccourcis.
- `scripts/generate-pwa-icons.mjs` : décline la feuille originale de `favicon.svg` en PNG 192, 512, maskable 512 et Apple 180. Les PNG sont commis ; leur génération n’est pas nécessaire au build.
- `src/malagasy/pwa.ts`, `pwa-view.ts`, `pwa.css` : installation, détection des mises à jour, guide et ergonomie mobile, sans dépendance supplémentaire.
- `npm run test:pwa` : construit puis teste le vrai bundle de production via Playwright. Contrôle du manifeste et des critères Chromium d’installation, décodage des icônes, absence de service worker/cache applicatif, navigation à 340/390 px, événements d’installation et mises à jour simulées pendant une réponse ou un mot de passe.

Les simulations d’événements ne remplacent pas une installation manuelle sur de vrais iPhone/Android ; celle-ci dépend aussi du navigateur et de ses critères de promotion.

Références techniques : [MDN — installation](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable), [web.dev — mises à jour](https://web.dev/learn/pwa/update). Ces références auteur ne sont pas ajoutées dans les leçons.
