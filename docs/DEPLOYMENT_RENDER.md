# Déployer la démonstration sur Render

Le fichier [`render.yaml`](../render.yaml) crée trois ressources depuis le même dépôt :

| Ressource       | Rôle                                   | Offre configurée |
| --------------- | -------------------------------------- | ---------------- |
| `le-revenu-web` | Next.js, interface et actions serveur  | Free             |
| `le-revenu-api` | Strapi, API et administration          | Free             |
| `le-revenu-db`  | PostgreSQL 16, discussions et réponses | Free             |

Il s'agit d'un environnement de test temporaire. La base en ligne est distincte de votre PostgreSQL local : elle reçoit les données initiales de démonstration, pas les publications créées sur votre ordinateur.

## Lancer le déploiement

1. Connectez-vous à [Render](https://dashboard.render.com/) avec GitHub et autorisez l'accès au dépôt `hedi72/LE-REVENU-Communaut-`.
2. Ouvrez [Deploy to Render](https://render.com/deploy?repo=https://github.com/hedi72/LE-REVENU-Communaut-), ou choisissez **New → Blueprint**, puis sélectionnez ce dépôt, la branche `main` et le fichier `render.yaml`.
3. Donnez un nom au Blueprint, par exemple `le-revenu-demo`.
4. Saisissez un mot de passe de démonstration de **12 caractères minimum** dans `DEMO_PASSWORD`. Conservez-le pour vous connecter aux comptes de test. Les autres secrets sont générés automatiquement et les paramètres PostgreSQL sont reliés par Render.
5. Vérifiez que les trois ressources sont sur l'offre **Free**, puis lancez **Deploy Blueprint**.
6. Attendez que la base, l'API et le frontend soient prêts. Render affiche l'URL HTTPS exacte de chaque service ; les noms peuvent recevoir un suffixe s'ils sont déjà utilisés.

Le premier déploiement compile Strapi et Next.js dans leurs images Docker et peut prendre plusieurs minutes. Le frontend reçoit automatiquement l'URL publique HTTPS de l'API. Les cookies de connexion sont configurés avec `Secure`.

## Vérifier l'application

1. Ouvrez l'URL de **`le-revenu-api`** suivie de `/api/categories`. Attendez une réponse JSON. Cela réveille aussi l'API si elle était en veille.
2. Ouvrez l'URL HTTPS de **`le-revenu-web`**.
3. Connectez-vous avec `camille@example.com` ou `thomas@example.com`, et le `DEMO_PASSWORD` choisi dans Render.
4. Créez une discussion avec un titre d'au moins 10 caractères, une catégorie, un type et un contenu.
5. Publiez une réponse et rechargez la page : la réponse doit rester présente.
6. Pour administrer les contenus, ouvrez l'URL de l'API suivie de `/admin` et créez votre premier compte administrateur. Il est distinct des comptes membres de démonstration.

Les appels à Strapi sont effectués par le serveur Next.js. Si vous ajoutez ensuite des appels directs depuis le navigateur, renseignez aussi `FRONTEND_URL` dans les variables de l'API avec l'URL HTTPS du frontend.

## Limites de l'offre gratuite

- Les services web s'arrêtent après 15 minutes sans trafic et peuvent prendre environ une minute à redémarrer. Si le frontend affiche une indisponibilité, ouvrez d'abord `/api/categories` sur l'API, attendez le JSON, puis rechargez le frontend : ses appels API expirent après 12 secondes.
- Les deux services partagent le quota de 750 heures gratuites mensuelles du workspace. Ils ne peuvent donc pas tous les deux fonctionner continuellement pendant un mois entier sur ce quota.
- La base PostgreSQL gratuite expire après **30 jours** et ne propose pas de sauvegardes automatiques. Exportez les données à conserver avant l'expiration.
- La mémoire disponible peut être insuffisante pour Strapi selon la charge. Si les logs indiquent un arrêt par manque de mémoire, choisissez une instance API plus grande après vérification du tarif, ou un autre hébergement.
- Les fichiers ajoutés dans les conteneurs sont éphémères. Cette démo ne dépend pas de médias téléversés ; leur conservation nécessiterait un stockage externe ou un disque persistant.

Références : [offre gratuite](https://render.com/docs/free), [Blueprints](https://render.com/docs/blueprint-spec), [Strapi sur Render](https://render.com/docs/deploy-strapi).

## Mises à jour et diagnostic

Les nouveaux commits sur `main` déclenchent les déploiements automatiques. Si un service échoue, ouvrez sa page **Logs** dans Render. Ne copiez pas de mots de passe, de JWT ou d'URL de connexion PostgreSQL dans GitHub.

Changer `DEMO_PASSWORD` après l'initialisation ne change pas les mots de passe des utilisateurs déjà créés : utilisez l'administration Strapi pour les modifier. Pour transformer cette démonstration en environnement durable, choisissez des ressources adaptées, désactivez `SEED_DEMO`, retirez `ALLOW_DEMO_IN_PRODUCTION` après l'initialisation, et remplacez ou bloquez les comptes de démonstration inutiles.
