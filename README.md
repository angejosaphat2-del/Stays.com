# Stays.com — Plateforme de réservation d'hébergements en Côte d'Ivoire

## Structure du projet
```
stays-project/
├── public/
│   └── favicon.svg
├── src/
│   ├── main.jsx          → Point d'entrée + routeur
│   ├── App.jsx            → Site public (accueil, hébergements, FAQ, tarifs, contact)
│   ├── Admin.jsx          → Dashboard admin (login, gestion, monétisation)
│   └── supabase.js        → Configuration Supabase partagée
├── index.html
├── package.json
├── vite.config.js
├── vercel.json
└── README.md
```

## URLs
- **Site public** : `votresite.vercel.app`
- **Admin** : `votresite.vercel.app/admin`

## Déployer sur Vercel (GRATUIT)

### Étape 1 — Créer un compte GitHub
1. Aller sur https://github.com
2. Créer un compte gratuit
3. Créer un nouveau repository (dépôt) nommé `stays-com`
4. Uploader tous les fichiers de ce dossier dans le repository

### Étape 2 — Déployer sur Vercel
1. Aller sur https://vercel.com
2. Se connecter avec votre compte GitHub
3. Cliquer "New Project"
4. Sélectionner le repository `stays-com`
5. Framework : Vite
6. Cliquer "Deploy"
7. Attendre 1-2 minutes
8. Votre site est en ligne ! 🎉

### Étape 3 — Accéder au site
- Site public : `votre-projet.vercel.app`
- Admin : `votre-projet.vercel.app/admin`

## Base de données
Le projet est connecté à Supabase (base de données en ligne).
- URL : https://clovwbjdmhkgcocvyzgm.supabase.co
- Les données sont partagées entre le site public et l'admin

## Technologies
- React 18 + Vite
- Supabase (base de données + authentification)
- Vercel (hébergement gratuit)
