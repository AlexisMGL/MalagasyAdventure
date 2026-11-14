# Malagasy Adventure — Android

Enveloppe Android TWA générée avec `@bubblewrap/core` 1.27.0 (GoogleChromeLabs, Apache-2.0), puis adaptée à AGP 8.11.1 / Gradle 8.13 / Java 17. Les mentions de licence des fichiers générés sont conservées.

Le contenu est toujours chargé depuis `https://malagasyadventure.netlify.app/`. Aucun monde, JS, audio ou compte n’est embarqué dans ce paquet. Les publications Netlify mettent donc aussi à jour le contenu de l’app. Le mécanisme existant de mise à jour conserve les réponses en cours.

Identifiant stable : `app.netlify.malagasyadventure`, version initiale `1.0.0` / `1`, cible Android 16 / API 36, minimum Android 7 / API 24 (requis par Android Browser Helper 2.7.4). Maki existant, notifications et géolocalisation désactivées, aucune publicité ni bibliothèque de suivi ajoutée.

Voir [le guide de publication](../docs/ANDROID.md). Le workflow GitHub compile et vérifie le paquet ; sa première version fournit un APK de test et un AAB non signé, **pas encore publiable**. La clé d’envoi et l’empreinte de signature Google Play seront définies après création du compte développeur.

Un APK de test dont l’empreinte n’est pas déclarée sur le site s’ouvre avec une barre de navigateur : c’est le repli de sécurité normal, pas une validation TWA réussie. Ne pas publier de clé de debug comme preuve de propriété de production.

Compilation locale avec un JDK 17 et un SDK Android 36 : `./gradlew lintRelease assembleDebug bundleRelease` (Windows : `gradlew.bat`). Pour signer un paquet de production, fournir les quatre variables `ANDROID_KEYSTORE_PATH` (chemin absolu), `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD` dans l’environnement local ; aucune ne doit entrer dans Git. Le workflow public ne reçoit aucune clé.
