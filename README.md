# Frontend HealthAI Coach

Frontend Vue.js de la plateforme MSPR1.EPSI, destine aux utilisateurs et aux operations d'administration.

Cette application consomme l'API FastAPI (JWT), affiche les donnees metier (dashboard, users, nutrition, exercices), et propose un ecran d'import ETL.

## Sommaire

- [Objectif du frontend](#objectif-du-frontend)
- [Stack technique](#stack-technique)
- [Architecture fonctionnelle](#architecture-fonctionnelle)
- [Structure du projet](#structure-du-projet)
- [Prerequis](#prerequis)
- [Configuration](#configuration)
- [Execution en local](#execution-en-local)
- [Build et execution en production](#build-et-execution-en-production)
- [Authentification et securite](#authentification-et-securite)
- [Routage SPA et nginx](#routage-spa-et-nginx)
- [Depannage](#depannage)
- [Limites connues et evolutions](#limites-connues-et-evolutions)

## Objectif du frontend

Le frontend couvre les besoins suivants:

- authentification utilisateur via JWT
- consultation et gestion des utilisateurs
- gestion des donnees nutrition
- gestion des exercices / sessions d'entrainement
- affichage de graphiques de dashboard
- ecran de gestion de donnees incluant l'import ETL

## Stack technique

- Vue 3
- Vite
- TypeScript
- Pinia (state management)
- Vue Router
- Axios
- Bootstrap + Bootstrap Icons
- Chart.js + vue-chartjs

## Architecture fonctionnelle

Flux principal:

1. L'utilisateur se connecte sur `/login`.
2. Le frontend envoie les credentials a l'API (`/users/login`).
3. Le token JWT est stocke en local puis injecte dans les appels API.
4. Les pages metier consomment les stores Pinia, eux-memes relies au client API centralise.

Architecture simplifiee:

```text
Views Vue (src/views)
  |
  v
Stores Pinia (src/stores)
  |
  v
ApiService Axios (src/services/api.ts)
  |
  v
FastAPI (/api/v0)
```

## Structure du projet

```text
frontmspr/
├── src/
│   ├── views/                 # Pages (Dashboard, Login, Users, Nutrition...)
│   ├── components/            # Composants reutilisables + charts
│   ├── stores/                # Stores Pinia (auth, dashboard, users, etc.)
│   ├── services/api.ts        # Client API centralise
│   ├── router/index.ts        # Routes + garde d'authentification
│   ├── config/index.ts        # Variables d'environnement exposees
│   ├── App.vue
│   └── main.ts
├── nginx.conf                 # Fallback SPA pour routes history
├── Dockerfile                 # Build Vite + runtime nginx
├── .env.example               # Variables Vite
└── package.json               # Scripts npm
```

## Prerequis

- Node.js 20.19+ (ou 22.12+)
- npm
- Backend FastAPI demarre et accessible

Version Node attendue:

- `^20.19.0 || >=22.12.0`

## Configuration

1. Copier les variables d'environnement:

```bash
cp .env.example .env.local
```

2. Variables principales:

```env
VITE_API_URL=http://localhost:8000/api/v0
VITE_APP_NAME=HealthAI Coach
VITE_NODE_ENV=development
```

Important:

- Lorsque le frontend est ouvert dans le navigateur host (local), `VITE_API_URL` doit pointer vers `http://localhost:8000/api/v0`.
- Ne pas utiliser `http://backend:8000/api/v0` cote navigateur, car ce nom est interne au reseau Docker.

## Execution en local

Depuis le dossier `frontmspr/`:

```bash
npm install
npm run dev
```

Par defaut, Vite expose l'application sur `http://localhost:5173`.

Scripts utiles:

- `npm run dev` : demarrage en mode developpement
- `npm run type-check` : verification TypeScript via `vue-tsc`
- `npm run build` : type-check + build de production
- `npm run preview` : previsualisation locale du build

## Build et execution en production

Build local:

```bash
npm run build
```

Le `Dockerfile` effectue:

1. une phase build Node (`npm ci`, `npm run build-only`)
2. une phase runtime nginx avec les assets de `dist/`

Exemple build Docker:

```bash
docker build -t mspr-frontend:latest --build-arg VITE_API_URL=http://localhost:8000/api/v0 .
```

Exemple run Docker:

```bash
docker run --rm -p 80:80 mspr-frontend:latest
```

## Authentification et securite

Le store `auth` implemente:

- stockage du token JWT dans `localStorage` (`healthai_token`)
- recuperation utilisateur courant apres login
- deconnexion automatique en cas de token invalide/expire
- garde de routes via `router.beforeEach`

Routes protegees:

- dashboard (`/`)
- users (`/users`, `/user/new`, `/user/:id`)
- nutrition (`/nutrition`, `/nutrition/new`, `/nutrition/:id`)
- exercices (`/exercises`, `/exercise/new`, `/exercise/:id`)
- gestion donnees (`/data`)

## Routage SPA et nginx

Le projet utilise Vue Router en mode history.

Le fichier nginx applique:

- fallback vers `index.html` pour les routes applicatives
- cache long pour les assets statiques

Ce comportement evite les erreurs 404 lors d'un rechargement direct sur une route comme `/login` ou `/users`.

## Depannage

1. Le frontend ne joint pas le backend

- Verifier `VITE_API_URL`.
- Verifier que l'API FastAPI repond sur `http://localhost:8000`.
- Verifier l'onglet Network dans les devtools navigateur.

2. Retour automatique vers `/login`

- Verifier la presence du token dans `localStorage`.
- Verifier que le token n'est pas expire.
- Verifier les reponses 401 dans les requetes API.

3. 404 lors d'un refresh en production

- Verifier que nginx utilise bien la regle `try_files ... /index.html`.
- Verifier que le container frontend charge le bon `nginx.conf`.

4. Erreurs de build TypeScript

- Executer `npm run type-check` pour isoler les erreurs.
- Verifier la compatibilite de version Node.

## Limites connues et evolutions

- Pas de suite de tests front automatisee configuree dans les scripts npm.
- La gestion fine des roles/permissions peut etre renforcee selon les besoins metier.
- Des optimisations UX sont possibles (pagination, filtres avances, feedback erreurs plus detaille).
