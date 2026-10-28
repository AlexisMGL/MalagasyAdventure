# Compte et progression — configuration du 28 octobre 2026

Le projet indépendant **Malagasy Adventure**, référence `unpvrisziuttjmzhwyid`, a été créé dans **AlexisMGL's Org**, région Paris (`eu-west-3`). Aucun projet existant n’a été modifié.

La migration `supabase/migrations/20261028183929_learning_progress.sql` est appliquée au serveur. Son numéro suit l’historique renvoyé par le serveur après application via le connecteur ; le fichier a d’abord été créé par `supabase migration new learning_progress`. Elle crée `learning_progress`, ses trois politiques RLS et la fonction atomique `save_learning_progress`. Les mots de passe restent gérés par Supabase Auth ; ils ne sont jamais enregistrés dans le carnet, les exports ou une table applicative.

La configuration publique du client est dans `src/malagasy/supabase.ts`. Les variables Vite de `.env.example` permettent de cibler explicitement un autre environnement ; les valeurs par défaut correspondent au projet dédié. Ces deux valeurs sont publiques. Ne jamais utiliser une clé secrète ou `service_role` dans une variable `VITE_*`.

## À terminer dans le tableau de bord Supabase

Le connecteur utilisé ne fournit aucune modification de la configuration Auth. Le recours au navigateur a été interrompu par Computer Use, faute de pouvoir vérifier l’URL actuelle de Chrome. **Les réglages ci-dessous ne sont donc pas encore appliqués.**

Dans [Authentication → URL Configuration](https://supabase.com/dashboard/project/unpvrisziuttjmzhwyid/auth/url-configuration), mettre Site URL à :

```text
https://malagasyadventure.netlify.app
```

Ajouter ces redirections autorisées, correspondant au site et aux ports du dépôt :

```text
https://malagasyadventure.netlify.app/
https://malagasyadventure.netlify.app/malagasy-adventure
http://127.0.0.1:5174/
http://127.0.0.1:5174/malagasy-adventure
http://127.0.0.1:4174/
http://127.0.0.1:4174/malagasy-adventure
http://127.0.0.1:4184/
http://127.0.0.1:4184/malagasy-adventure
```

L’app envoie explicitement `/malagasy-adventure` sur l’origine courante comme destination après confirmation ou récupération. Elle traite les retours Supabase `PASSWORD_RECOVERY`, affiche le formulaire du nouveau mot de passe et signale les liens invalides/expirés. Le flux navigateur est implicite avec détection de session par le SDK ; aucune route serveur n’est nécessaire.

Dans [Authentication → SMTP](https://supabase.com/dashboard/project/unpvrisziuttjmzhwyid/auth/smtp), configurer un fournisseur mail et une adresse expéditrice autorisée. Aucun fournisseur ou identifiant SMTP n’a été fourni, donc **l’envoi public n’est pas configuré**. Le service intégré est limité aux adresses des membres de l’organisation et à un faible quota ; il ne suffit pas pour ouvrir inscription et récupération au public. Conserver la confirmation d’adresse activée. Adapter la longueur minimale serveur à 8 caractères ou plus ; le formulaire impose déjà 8 caractères et une confirmation pour les nouveaux mots de passe.

Une fois ces réglages effectués, vérifier avec une adresse contrôlée : inscription → mail reçu → confirmation → connexion ; puis mot de passe oublié → mail reçu → nouveau mot de passe → reconnexion. Aucun vrai mail ni compte personnel n’a été créé pendant les tests automatiques.

## Comportement de sauvegarde

- Sans compte : progression dans la clé locale v1 existante ; rappel non bloquant et export/import disponibles.
- Avec compte : cache local séparé par UUID, puis sauvegarde Supabase différée et sérialisée ; état visible dans Mon compte.
- Deux carnets différents : comparaison des leçons, XP et dates, export préalable possible, choix explicite du carnet appareil ou compte.
- Deux appareils écrivant en même temps : révision serveur contrôlée atomiquement ; un conflit suspend la sauvegarde plutôt que de remplacer silencieusement le carnet distant.
- Perte réseau : cache local conservé, reprise au retour en ligne/à l’onglet ou par « Synchroniser maintenant ».
- Déconnexion : retour au carnet de découverte ; le carnet du compte reste dans son cache séparé. Le compte suivant ne reçoit pas les acquis du compte précédent.

## Vérification serveur réalisée

Tests transactionnels annulés à la fin : création et modification par le propriétaire, incrément de révision, refus d’une révision périmée, absence de lecture et modification par un second utilisateur, refus d’écriture sous un autre UUID, refus des accès anonyme table/RPC. Toutes les assertions passent et la table reste vide après rollback. Les conseillers Supabase sécurité et performance n’ont renvoyé aucune alerte après la migration.

Les parcours navigateur utilisent une interception réseau Supabase pour tester les états d’interface et les liens de récupération sans envoyer de courrier. Ils ne prouvent pas la délivrabilité des mails du fournisseur réel. La publication du nouveau code sur Netlify reste une étape distincte.

Documentation vérifiée : [authentification par mot de passe](https://supabase.com/docs/guides/auth/passwords), [redirections](https://supabase.com/docs/guides/auth/redirect-urls), [limites des tests hébergés et du service mail intégré](https://supabase.com/docs/guides/auth/testing-auth-flows), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).
