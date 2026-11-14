# Publication Android et Google Play

Préparation du 14 novembre 2026. Compte Play Console pas encore créé. L’utilisateur autorise l’adresse publique d’assistance `alexismg.lallement@gmail.com`.

## Une seule version du contenu

`android/` est une enveloppe **Trusted Web Activity**, générée avec Bubblewrap 1.27.0. Elle ouvre `https://malagasyadventure.netlify.app/` via un navigateur Android compatible, sans barre d’adresse après vérification de propriété. Leçons, schémas, images, voix, compte et sauvegarde restent ceux du site. Un push suivi d’une publication Netlify réussie met donc aussi à jour le contenu Android. Le client existant propose l’actualisation hors séance ; il ne coupe pas un exercice ou une saisie de mot de passe.

L’app nécessite Internet. Aucun service worker, paquet de monde ou téléchargement hors ligne n’est ajouté. Les sauvegardes v1 et les comptes existants restent compatibles ; utiliser le même compte ou l’export/import si le stockage du navigateur et celui de l’app sont isolés.

Le workflow `Android package` compile uniquement lors d’un changement de l’enveloppe ou d’un lancement manuel. Une publication Android reste nécessaire pour les changements de paquet : icône système, nom du lanceur, origine du site, permissions, dépendances ou niveau d’API cible. Un changement de contenu web ne doit pas déclencher une nouvelle soumission Google Play.

## État et compilation

- Paquet stable : `app.netlify.malagasyadventure`, version `1.0.0` / code `1`.
- Java 17, Gradle 8.13, Android Gradle Plugin 8.11.1, cible API 36, minimum Android 7 / API 24, requis par Android Browser Helper 2.7.4.
- Logo maki existant, écran de lancement, navigation web existante. Pas de notification, géolocalisation, publicité ou suivi publicitaire ajouté.
- GitHub Actions produit `malagasy-android-review` : APK debug de test, AAB release **non signé**, rapport lint. L’AAB non signé n’est pas recevable dans Play Console.
- Aucun compte Google, secret de signature ou accès Play n’est présent dans le dépôt. Pas de soumission automatique à Google Play.

La compilation et le lint Android ont réussi sur [GitHub Actions](https://github.com/AlexisMGL/MalagasyAdventure/actions/runs/43597172629). Le paquet release a ensuite été signé localement et sa signature vérifiée avec le JDK officiel Temurin 17 (téléchargement vérifié par SHA-256). Le fichier de dépôt préparé est `.tools/android-release-review/MalagasyAdventure-1.0.0.aab` ; il n’a pas encore été envoyé à Google Play.

La clé d’envoi initiale est **uniquement locale** : `android/.signing/upload-keystore.jks`, avec ses paramètres privés dans `android/.signing/upload-credentials.json`. L’accès à ces deux fichiers est limité au compte Windows courant et les deux sont ignorés par Git. Conserver une copie privée des deux avant de changer de machine. Ne pas recréer une autre clé pour une mise à jour. Le certificat public exporté dans `.tools/android-release-review/upload-certificate.pem` est celui de la **clé d’envoi**, pas le futur certificat de signature de l’app fourni par Google.

Sur une machine disposant du SDK/JDK : `cd android`, puis `./gradlew lintRelease assembleDebug bundleRelease` (Windows : `gradlew.bat`). Les quatre variables `ANDROID_KEYSTORE_PATH`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD` permettent une compilation release signée locale. Le chemin doit être absolu. Conserver la clé d’envoi hors de Git et en faire une sauvegarde privée ; ne pas envoyer les mots de passe dans un chat. Le workflow public ne signe pas de release.

Les sources Bubblewrap sont sous Apache-2.0 ; les mentions générées sont conservées. Les images proviennent des icônes maki approuvées. Ne pas régénérer le contenu ou les voix pour un travail sur le paquet Android.

## Étapes qui nécessitent le compte de l’utilisateur

1. Créer et vérifier le compte sur [Play Console](https://play.google.com/console/signup), accepter les conditions et payer les **25 USD une seule fois**. L’identité et le paiement sont saisis directement chez Google. Choisir le type de compte correspondant à sa situation réelle.
2. Créer Malagasy Adventure, application gratuite en français. Compléter les coordonnées, l’audience réelle, la classification et la déclaration de données d’après le fonctionnement du service ; ne pas attester des réponses au nom de l’utilisateur.
3. Utiliser l’AAB signé préparé localement et activer **Play App Signing**. Conserver la clé d’envoi locale pour les mises à jour. Le certificat de signature de l’app fourni par Google est généralement différent du certificat de la clé d’envoi.
4. Dans Play Console → intégrité/signature de l’app, copier l’empreinte **SHA-256 du certificat de signature de l’app**. Exécuter `npm run android:link -- --sha256 "EMPREINTE_RÉELLE"`, puis publier le fichier sur Netlify.
5. Vérifier `https://malagasyadventure.netlify.app/.well-known/assetlinks.json` : HTTP 200, JSON, aucune redirection et correspondance paquet/certificat. Tester la version distribuée par Google Play : la barre du navigateur doit disparaître. Une signature de debug ne valide pas la future signature Play.
6. Pour un nouveau compte personnel : organiser un **test fermé avec au moins 12 testeurs inscrits sans interruption pendant 14 jours**, recueillir de vrais retours, puis demander l’accès à la production. Le délai de revue de Google s’ajoute ; la publication n’est pas garantie par la seule compilation.

Tant que le certificat réel manque, `public/.well-known/assetlinks.json` contient volontairement `[]`. Aucun faux certificat ne doit être utilisé et aucune association TWA réussie ne doit être annoncée. Un APK non associé se replie sur un onglet avec barre de navigateur.

## Pages et fiche du Store

- Confidentialité : `https://malagasyadventure.netlify.app/confidentialite.html`.
- Suppression de compte : `https://malagasyadventure.netlify.app/suppression-compte.html`, accessible sans installer l’app. Suppression depuis Mon compte après mot de passe et confirmation explicite ; assistance externe à l’adresse autorisée.
- Icône 512 × 512 : `android/store_icon.png` (maki existant).
- Nom : **Malagasy Adventure**.
- Description courte proposée : **Apprenez le malgache par des dialogues, des images et des révisions.**
- Description longue proposée : « Partez à la découverte du malgache à Antananarivo et Antsirabe. Apprenez les mots utiles, retrouvez des pense-bêtes illustrés et mettez les notions en pratique dans des dialogues avec Mia et Lova. Écoutez les prononciations synthétiques, révisez votre vocabulaire et découvrez des livrets historiques illustrés. Commencez sans compte, ou créez un compte pour retrouver votre progression sur vos appareils. L’export et l’import du carnet restent disponibles. Une connexion Internet est nécessaire. Les autres destinations de la carte présentent la suite prévue du voyage. »

Les visuels sont préparés dans `store/google-play/` : icône 512 × 512, visuel de présentation 1024 × 500 (SVG original avec le maki existant) et trois captures réelles 1080 × 1920 du dialogue, du carnet et de la carte. Les captures emploient un carnet de démonstration calculé par le moteur, sans compte ni données personnelles ; les mondes futurs gardent leurs mentions/verrouillages. Ne pas annoncer les mondes 3–20 comme disponibles. La prononciation synthétique n’est pas validée phrase par phrase par un locuteur natif. Les voix conservent leur licence non commerciale : ne pas ajouter de paiement ou publicité dans cette publication.

Pour la déclaration de données, décrire les identifiants de compte (et les e-mails des anciens comptes), les données d’apprentissage synchronisées, les jetons de session et les journaux de fonctionnement/sécurité des prestataires. Le mot de passe est géré par Auth et n’est pas dans le carnet. Le service utilise Netlify et Supabase, sans collecte du microphone, des contacts, des photos ni de la position. La grille du Store doit être relue lors du dépôt selon ses catégories en vigueur.

## Références vérifiées

- [TWA et contenu fourni par le web](https://developer.chrome.com/docs/android/trusted-web-activity).
- [Bubblewrap et signatures Digital Asset Links](https://developer.chrome.com/docs/android/trusted-web-activity/quick-start).
- [Frais et vérification du compte](https://support.google.com/googleplay/android-developer/answer/6112435?hl=fr).
- [Test fermé des nouveaux comptes personnels](https://support.google.com/googleplay/android-developer/answer/14151465?hl=fr).
- [API 36 requise depuis le 31 août 2026](https://support.google.com/googleplay/android-developer/answer/11926878?hl=fr).
- [Confidentialité et suppression de compte](https://support.google.com/googleplay/android-developer/answer/10144311).
