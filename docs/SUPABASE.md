# Compte et progression — 29 octobre 2026

Le projet indépendant **Malagasy Adventure**, référence `unpvrisziuttjmzhwyid`, appartient à **AlexisMGL's Org**, région Paris (`eu-west-3`). Les autres projets et le dépôt Arcade restent indépendants.

## Identifiant et mot de passe, sans courrier

La demande du 29 octobre remplace l’inscription par mail et la configuration Brevo : les nouveaux comptes utilisent seulement un identifiant et un mot de passe. Les anciens comptes gardent leur mail comme identifiant, leur mot de passe, leur UUID et leur carnet. Les sessions déjà ouvertes restent valides.

L’identifiant comporte 3 à 24 lettres ASCII, chiffres, points, tirets ou underscores, sans différence de casse. `supabase/functions/_shared/username.ts`, partagé entre client et serveur, l’encode dans un alias injectif `u-<hex>@users.malagasyadventure.invalid`. Le domaine réservé `.invalid` ne représente jamais une boîte mail. L’alias n’est ni affiché ni utilisé pour du courrier. Aucun compte n’utilisait cet espace réservé avant activation.

Le navigateur appelle **`username-signup`**, fonction Edge déployée. Elle vérifie l’origine navigateur, la clé publiable, la taille et le format de la requête, puis prend un quota atomique côté Postgres. Elle crée uniquement un alias interne avec `auth.admin.createUser` et `email_confirm: true`, sans prétendre confirmer un vrai mail. La clé privilégiée reste dans l’environnement Supabase, jamais dans le site, le dépôt ou une réponse. Le résultat est seulement `{ok:true}` ou un code d’erreur stable. Le navigateur se connecte ensuite par `signInWithPassword` avec la gestion normale des sessions Auth.

La fonction est accessible avant connexion (`verify_jwt = false`), condition nécessaire à l’inscription avec une clé publiable moderne. Son corps vérifie la clé publique, valide strictement les entrées et ne permet aucune lecture, modification, suppression ou récupération de compte. Le mot de passe, de 8 à 128 caractères pour les nouveaux comptes, est transmis uniquement à Auth, sans stockage dans les tables applicatives ni les journaux du code.

La migration `20261029065147_username_signup_limits.sql` crée `malagasy_private.username_signup_limits` et `consume_username_signup_limit`. La table est hors des schémas exposés, avec RLS et sans accès client. La fonction est `SECURITY INVOKER`, exécutable uniquement par `service_role`. Un verrou transactionnel rend atomiques les plafonds : cinq tentatives par fenêtre de quinze minutes et empreinte d’IP ; cent par jour UTC pour le projet. Les fenêtres anciennes sont purgées après deux jours lors des appels. L’IP brute n’est pas stockée : l’empreinte est un HMAC-SHA256 avec une clé serveur. Le contrôle par IP dépend de l’en-tête transmis par la gateway ; le plafond global en est indépendant. Le fichier a d’abord été créé par `supabase migration new`, puis aligné sur le numéro d’historique MCP serveur.

**Aucun SMTP n’est nécessaire au parcours actuel.** Les confirmations globales des vrais mails n’ont pas été désactivées. Sans mail, les nouveaux comptes n’ont pas de récupération automatique du mot de passe ; l’interface le précise et rappelle l’export. Les anciens retours `PASSWORD_RECOVERY` sont toujours traités pour les liens encore valides, sans proposer de nouvel envoi.

## Sauvegarde privée et compatibilité

La migration `20261028183929_learning_progress.sql` reste inchangée : table `learning_progress`, politiques RLS et fonction atomique `save_learning_progress`. Les mots de passe ne font jamais partie du JSON v1.

- Sans compte : clé locale existante, rappel non bloquant, export/import.
- Avec compte : cache local par UUID, puis sauvegarde différée et sérialisée.
- Deux carnets différents : comparaison, export préalable possible et choix explicite.
- Deux appareils : contrôle atomique de révision ; une écriture périmée est refusée.
- Perte réseau : cache conservé et reprise au retour en ligne ou par synchronisation manuelle.
- Déconnexion : retour au carnet découverte, sans transférer les acquis au compte suivant.

Le client ne contient que l’URL et la clé publiable. Pour un autre projet, les variables Vite ne suffisent pas : appliquer les migrations et déployer aussi la fonction en adaptant sa clé publique et ses origines. Ne jamais placer un secret dans `VITE_*`.

## Redirections existantes

Site URL : `https://malagasyadventure.netlify.app`. Les destinations `/` et `/malagasy-adventure` sont autorisées sur cette origine ainsi que sur `http://127.0.0.1` aux ports 5174, 4174 et 4184. Leur vérification du 28 octobre a confirmé qu’un ancien `localhost:3000` non autorisé retombe sur la bonne origine. L’inscription actuelle n’utilise aucun lien de confirmation.

## Vérifications effectuées

Le 29 octobre, un compte jetable créé via la vraie fonction a été connecté puis reconnecté avec le même UUID. La création du même identifiant renvoie 409. La sauvegarde et la lecture de son carnet fonctionnent ; une révision périmée est refusée ; les accès anonymes au carnet et l’accès au limiteur depuis un utilisateur sont refusés. Les sessions ont été déconnectées et le compte test supprimé : le compte d’origine demeure seul.

Des assertions SQL annulées après test vérifient le sixième essai refusé et le plafond journalier. Aucune alerte de performance. Le conseiller sécurité signale l’absence volontaire de politique RLS sur la table privée, inaccessible aux clients, et la protection contre les mots de passe compromis non activée dans la configuration Auth existante. Les autorisations de progression n’ont pas été élargies.

Les tests navigateur couvrent les formulaires, le mode découverte, les anciens comptes, les conflits, les sessions et les anciens retours de récupération avec des réponses contrôlées. Le test réel distinct valide la fonction déployée et le stockage privé sans envoyer de courrier.

Documentation vérifiée : [Auth par mot de passe](https://supabase.com/docs/guides/auth/passwords), [création côté serveur](https://supabase.com/docs/reference/javascript/auth-admin-createuser), [secrets des fonctions](https://supabase.com/docs/guides/functions/secrets), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).
