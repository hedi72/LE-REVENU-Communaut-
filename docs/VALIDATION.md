# Vérifications réalisées

Environnement : Windows, Node.js 22.23.4 et PostgreSQL 16.

| Vérification                            | Résultat |
| --------------------------------------- | -------- |
| Types TypeScript frontend et backend    | Réussite |
| Tests unitaires backend                 | 7 / 7    |
| Tests de rendu frontend                 | 2 / 2    |
| Parcours Playwright Chromium ordinateur | 4 / 4    |
| Parcours Playwright Chromium mobile     | 4 / 4    |
| Build administration Strapi             | Réussite |
| Build de production Next.js             | Réussite |
| Formatage Prettier                      | Réussite |

Les tests de bout en bout ont aussi été exécutés avec le frontend compilé. Ils vérifient les données provenant de l’API, les filtres, la navigation, les droits de publication, la validation, la connexion, la création et la persistance d’une réponse dans PostgreSQL après rechargement.

Le lancement Docker Compose n’a pas été exécuté : le moteur Docker de la machine était arrêté. La configuration et son workflow CI sont fournis, mais cette voie de lancement reste à vérifier dans un environnement Docker actif.

## Aperçus

- [Ordinateur](preview-desktop.png)
- [Mobile](preview-mobile.png)

Pour les recréer, démarrer l’application, installer Chromium avec `npx playwright install chromium`, puis exécuter `node scripts/capture-preview.mjs`.

## Comparaison avec la maquette fournie

Les styles et icônes originaux ont été importés. La comparaison automatique aux largeurs de 1440 et 390 pixels confirme les mêmes positions et dimensions pour le bandeau de maquette, la barre du site, l’en-tête, le héros, la saisie rapide et la barre d’onglets. Le rapport détaillé figure dans [comparison.json](design-reference/comparison.json). La pagination ajoutée et les contenus dynamiques peuvent modifier la hauteur totale de la page.

Les huit parcours navigateur passent également sur les builds de production. Ils couvrent notamment l’ouverture de la fenêtre de publication, son accessibilité et sa fermeture avec Échap. Les erreurs de ressource de l’API renvoient bien HTTP 404 ; les pages Next.js déjà diffusées peuvent conserver HTTP 200 tout en affichant la page introuvable et la balise `noindex`, conformément au comportement du framework.
