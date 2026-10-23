# Communauté Le Revenu

Application full stack réalisée à partir du cahier des charges et de la maquette HTML fournis. Le périmètre couvre l’accueil, le filtrage, le tri, la recherche, la pagination, le détail d’une discussion, la création et les réponses persistées. L’interface est en français et responsive.

[Vérifications réalisées et aperçus de l’interface](docs/VALIDATION.md).

## Prérequis

- Node.js **22.19 minimum** (Node 22 LTS recommandé), npm 10 ou supérieur.
- Docker avec Docker Compose pour PostgreSQL, ou PostgreSQL 16 déjà installé.
- Ports disponibles : `3000` pour Next.js, `1337` pour Strapi, `5432` pour PostgreSQL.

## Lancement local

Depuis la racine du dépôt :

```sh
npm ci
npm run setup
docker compose up -d db
```

Puis ouvrir deux terminaux :

```sh
# Terminal 1
npm run dev:api
```

```sh
# Terminal 2, après le démarrage de Strapi
npm run dev:web
```

- Application : <http://localhost:3000>
- Administration Strapi : <http://localhost:1337/admin> — créer un compte administrateur au premier accès.
- API REST : <http://localhost:1337/api/discussions>

`npm run setup` génère des secrets locaux aléatoires et crée `.env`, `apps/api/.env` et `apps/web/.env.local` sans écraser les fichiers existants. Aucun secret n’est versionné. Les fichiers `.env.example` documentent les variables.

Si PostgreSQL est déjà installé, créer une base dédiée et son utilisateur, puis adapter `DATABASE_*` dans `apps/api/.env`. Il n’est alors pas nécessaire de lancer le service Docker `db`. Si le port 5432 est occupé, modifier son port exposé dans Compose et `DATABASE_PORT` côté API.

## Comptes de démonstration

Au premier démarrage, `SEED_DEMO=true` initialise les données communautaires et importe également les onze espaces, les discussions, réponses et profils fictifs de la maquette. Les comptes principaux pour tester les publications sont :

| E-mail                | Nom            |
| --------------------- | -------------- |
| `camille@example.com` | Camille Martin |
| `thomas@example.com`  | Thomas Bernard |

Le mot de passe des deux comptes est la valeur **`DEMO_PASSWORD` dans `apps/api/.env`**. Il est généré localement et n’apparaît ni dans le dépôt ni dans le navigateur. Se connecter à partir du bouton « Se connecter ».

L’initialisation est idempotente : les éléments déjà présents sont conservés. Changer `DEMO_PASSWORD` après création des comptes ne modifie pas leurs mots de passe existants ; utiliser l’administration Strapi pour les changer. Les données de démonstration sont interdites en production, sauf activation explicite de `ALLOW_DEMO_IN_PRODUCTION` pour l’environnement Docker local.

## Lancement de toute l’application dans Docker

```sh
npm ci
npm run setup
docker compose up --build -d --wait
```

Les trois services utilisent des contrôles de santé. Le premier build peut prendre plusieurs minutes. Les ports sont exposés uniquement sur `127.0.0.1`. Les données PostgreSQL sont conservées dans un volume nommé.

```sh
docker compose logs -f api web
docker compose down
```

Pour une mise en production, utiliser HTTPS, `SESSION_SECURE=true`, désactiver `SEED_DEMO`, retirer `ALLOW_DEMO_IN_PRODUCTION`, définir les origines et fournir des secrets propres à l’environnement. Le Compose fourni est une configuration de démonstration locale, pas un déploiement public.

## Architecture

```text
apps/
  web/src/
    app/                  Routes App Router, chargement, erreurs, 404
    features/auth/        Connexion et déconnexion
    features/discussions/ Composants métier et actions de formulaire
    components/           Structure de page et composants partagés
    lib/                  Types, client REST, session et formatage
  api/
    config/               Configuration Strapi et PostgreSQL
    src/api/              Content Types, routes, contrôleurs, services
    src/domain/           Validation et projection des données publiques
    src/policies/         Contrôle d’authentification
    src/bootstrap/        Permissions et données de démonstration
    tests/                Tests unitaires
tests/e2e/                Parcours navigateur et tests HTTP réels
```

### Flux de données et rendu

Le navigateur dialogue avec Next.js. Les pages sont des **Server Components** et récupèrent les données via le client REST centralisé `lib/strapi.ts`. Les formulaires interactifs utilisent `useActionState` dans des Client Components et invoquent des Server Actions. Ces actions relaient les requêtes vers Strapi ; elles ne contiennent ni accès SQL ni persistance métier.

Les données communautaires sont récupérées avec `cache: 'no-store'`, ce qui assure un affichage à jour à chaque navigation. Les mutations invalident également les routes concernées avant de rediriger. La recherche et les filtres sont dans l’URL ; ils restent partageables et fonctionnent sans JavaScript côté navigateur. Les formulaires de mutation nécessitent JavaScript pour leur expérience interactive.

Les relations, le tri, le filtrage et la pagination sont traités côté Strapi. Les lectures exposent une projection publique explicite, avec uniquement le nom de l’auteur. Les discussions chargent la catégorie, l’auteur et le compte des réponses ; elles ne chargent pas tous les contenus de réponse. Les réponses disposent de leur propre pagination. Les requêtes de données et de total sont exécutées en parallèle. Le tri secondaire par identifiant rend l’ordre stable lorsque deux dates sont identiques.

### Modèle

- `User` : modèle natif du plugin Users & Permissions.
- `Category` : `name`, `slug` unique, `description`, relation vers les discussions.
- `Discussion` : `title`, `content`, `type`, auteur, catégorie, réponses.
- `Reply` : `content`, auteur et discussion.

`draftAndPublish` est désactivé : une contribution validée est visible immédiatement. Les URL de détail utilisent le `documentId` stable de Strapi v5 : `/discussions/:documentId`. Le contenu est du texte brut rendu par React, sans HTML injecté.

### Sécurité et règles métier

- Validation côté frontend pour guider l’utilisateur, et validation indépendante dans les services Strapi avant toute écriture.
- Titre normalisé : 10 à 160 caractères ; contenu non vide : 20 000 caractères maximum ; type et relations vérifiés.
- Corps de publication limité à une liste de champs autorisés. Un champ `author`, `id` ou une date fournie par le client entraîne une erreur 400.
- Auteur obtenu exclusivement depuis `ctx.state.user`, après authentification par Users & Permissions et policy Strapi.
- Rôle public : lecture des catégories, discussions et réponses. Rôle authentifié : lectures, création de discussions et de réponses, lecture de sa propre session.
- Aucune route d’édition ou suppression de contribution n’est exposée. Les permissions gérées sont réappliquées au démarrage. Les autres permissions restent celles configurées dans Strapi.
- Inscription publique désactivée pour ce périmètre de démonstration.
- JWT conservé dans un cookie HttpOnly avec `SameSite=Lax` ; il n’est jamais retourné aux Client Components ni stocké dans `localStorage`.
- Codes HTTP Strapi cohérents : 400 (validation), 401/403 (accès), 404 (ressource inexistante), 201 (création).

### Pourquoi ces bibliothèques ?

- **Lucide React** : icônes SVG cohérentes, importées individuellement.
- **Tailwind CSS 4** : utilitaires disponibles et variables de thème ; les styles des composants visuels sont centralisés dans `globals.css` pour reprendre la maquette sans dupliquer de longues chaînes de classes.
- **tsx + node:test** : tests TypeScript légers, sans framework supplémentaire pour les règles métier.
- **Playwright** : tests avec navigateur réel sur ordinateur et mobile, et vérification des permissions HTTP.
- **server-only** : empêche l’import accidentel du client Strapi et des fonctions de session dans le navigateur.

La configuration npm `install-strategy=shallow` sépare les dépendances des applications : Next.js utilise React 19 tandis que l’administration Strapi utilise React 18, conformément à ses peer dependencies. Le fichier de verrouillage assure la reproductibilité.

## API publique

| Méthode | Route                                                       | Usage                       |
| ------- | ----------------------------------------------------------- | --------------------------- |
| GET     | `/api/categories`                                           | Espaces disponibles         |
| GET     | `/api/discussions?category=bourse&sort=newest&page=1&q=PEA` | Liste paginée (20 éléments) |
| GET     | `/api/discussions/:documentId`                              | Détail d’une discussion     |
| GET     | `/api/replies?discussion=:documentId&page=1`                | Réponses paginées           |
| POST    | `/api/auth/local`                                           | Connexion native Strapi     |
| POST    | `/api/discussions`                                          | Création authentifiée       |
| POST    | `/api/replies`                                              | Réponse authentifiée        |

Les créations utilisent `{ "data": { ... } }`. Les champs de discussion sont `title`, `content`, `type` et `category` (documentId). Les champs de réponse sont `content` et `discussion` (documentId). Les lectures renvoient `{ data, meta: { pagination } }` pour les listes paginées, `{ data }` pour le détail et les catégories. Les tris disponibles sont `trending`, `newest` et `oldest`.

## Vérifications

```sh
npm run check                 # TypeScript et tests unitaires
npm run build                 # Builds Strapi et Next.js
```

Après avoir démarré l’API et le frontend avec une base de démonstration :

```sh
npx playwright install chromium
npm run test:e2e
```

Les tests navigateur utilisent les comptes de démonstration et **ajoutent des discussions et des réponses de test**. Utiliser une base locale dédiée. Les variables `E2E_WEB_URL`, `E2E_API_URL` et `E2E_PASSWORD` permettent de cibler un autre environnement. Les tests couvrent l’affichage des données réelles, le filtre, la navigation, les publications anonymes refusées, la validation Strapi, l’usurpation d’auteur, la connexion, la création, la réponse et sa persistance après rechargement. Les tests s’exécutent sur Chromium avec deux tailles d’écran.

Strapi conserve sa limitation native des tentatives de connexion. La suite réutilise un jeton de démonstration pour ses préparations et garde un parcours de connexion réel par taille d’écran. Après plusieurs exécutions rapprochées, attendre la fin de la fenêtre de cinq minutes ou redémarrer uniquement l’API locale de test avant de relancer ; une réponse HTTP 429 indique cette limitation.

Le workflow GitHub Actions exécute les vérifications, les builds et les parcours avec les trois services Docker.

## Périmètre et évolutions

L’interface reprend les styles CSS, les icônes SVG, les libellés et les points de rupture du fichier HTML fourni. L’accueil visiteur et membre, les espaces, la charte, le détail et les fenêtres de publication suivent cette structure. Les captures de référence et les mesures de disposition se trouvent dans `docs/design-reference/`.

Les discussions et réponses sont réellement stockées dans PostgreSQL via Strapi. Les données éditoriales supplémentaires sont stockées dans le Single Type Strapi `Community layout` et exposées en lecture seule par `/api/community` : profils et points fictifs, classement, billets, sondages et événements. Les votes et inscriptions de ces widgets conservent le comportement de démonstration du prototype : ils ne sont pas persistés et ne constituent pas des fonctionnalités métier finalisées. Les points et badges ne sont pas attribués automatiquement. La vue « Pour vous » utilise actuellement les tendances, sans personnalisation. Les compteurs globaux du héros sont ceux de la maquette et présentent des données de démonstration.

Les URL des articles et rubriques externes renvoient vers lerevenu.com. Le logo est reconstitué en texte, comme dans le prototype ; il pourra être remplacé par le fichier officiel. Les anciennes contributions locales sont préservées lors de l’import de la maquette. Le fil principal présente vingt discussions par page ; les réponses restent paginées par douze.

Pour reproduire la comparaison de disposition : `node scripts/compare-layout.mjs "chemin/vers/maquette-communaute-le-revenu.html"`. Le script nécessite Chromium installé par Playwright. L’import des fichiers de design n’est pas nécessaire au lancement : les styles, icônes et fixtures générés sont versionnés.

Pour aller plus loin : modération des publications, édition avec contrôle de propriété, récupération de mot de passe, recherche plein texte PostgreSQL et stratégie de cache ciblée en fonction de la fréquentation. L’expiration JWT est fixée à un jour ; la déconnexion supprime le cookie sans révoquer un éventuel jeton déjà copié.

Références techniques : [Document Service Strapi v5](https://docs.strapi.io/cms/api/document-service), [contrôleurs Strapi](https://docs.strapi.io/cms/backend-customization/controllers), [Next.js App Router](https://nextjs.org/docs/app).
