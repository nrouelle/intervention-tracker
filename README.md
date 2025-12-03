# 🕐 Intervention Tracker

Application web moderne pour le suivi des interventions freelance. Suivez facilement vos demi-journées de travail par client et visualisez vos statistiques mensuelles.

## ✨ Fonctionnalités

- **Saisie quotidienne** : Enregistrez vos interventions matin et après-midi
- **Gestion des clients** : Ajoutez et gérez votre liste de clients
- **Tableau de bord** : Visualisez vos statistiques par client et par mois
- **Interface responsive** : Utilisable sur desktop, tablette et mobile
- **PWA** : Installable comme une application native
- **Données locales** : Vos données restent sur votre serveur

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+ installé
- npm ou yarn

### Installation

1. **Backend**
```bash
cd backend
npm install
npm start
```

Le serveur démarre sur http://localhost:3001

2. **Frontend**
```bash
cd frontend
npm install
npm run dev
```

L'application est accessible sur http://localhost:3000

### Identifiants par défaut

- **Username** : admin
- **Password** : admin123

⚠️ **Important** : Changez ces identifiants en production !

## 📁 Structure du projet

```
intervention-tracker/
├── backend/
│   ├── server.js          # Serveur Express
│   ├── data/              # Fichiers JSON (générés automatiquement)
│   │   ├── clients.json
│   │   ├── interventions.json
│   │   └── users.json
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/    # Composants React
    │   ├── pages/         # Pages de l'application
    │   ├── services/      # API et services
    │   └── styles/        # Styles CSS
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## 🔧 Configuration

### Backend

Le backend utilise les variables d'environnement suivantes :

- `PORT` : Port du serveur (défaut: 3001)
- `JWT_SECRET` : Secret pour les tokens JWT (⚠️ changez en production !)

### Frontend

Le frontend se connecte automatiquement au backend via proxy Vite.

Pour la production, modifiez `API_URL` dans `frontend/src/services/api.js`.

## 📱 Installation comme PWA

Sur mobile ou desktop :

1. Ouvrez l'application dans Chrome/Safari
2. Cliquez sur "Ajouter à l'écran d'accueil" ou "Installer"
3. L'application s'ouvrira comme une app native

## 🎨 Personnalisation

### Changer les couleurs

Modifiez les variables CSS dans `frontend/src/styles/index.css` :

```css
:root {
  --color-primary: #2d5f7a;
  --color-accent: #e85d75;
  /* ... autres couleurs */
}
```

### Changer le mot de passe par défaut

1. Générez un hash bcrypt de votre nouveau mot de passe
2. Modifiez `backend/data/users.json`

Ou créez un nouveau utilisateur via le code backend.

## 🔒 Sécurité

Pour un usage en production :

1. **Changez le JWT_SECRET** dans les variables d'environnement
2. **Changez le mot de passe par défaut**
3. **Utilisez HTTPS** avec un reverse proxy (nginx, Caddy)
4. **Ajoutez une authentification forte** si nécessaire
5. **Sauvegardez régulièrement** les fichiers JSON

## 📊 API Endpoints

### Authentification
- `POST /api/auth/login` - Connexion

### Clients
- `GET /api/clients` - Liste des clients
- `POST /api/clients` - Créer un client
- `DELETE /api/clients/:id` - Supprimer un client

### Interventions
- `GET /api/interventions?month=X&year=Y` - Liste des interventions
- `POST /api/interventions` - Créer/Modifier une intervention
- `DELETE /api/interventions/:id` - Supprimer une intervention

### Statistiques
- `GET /api/stats?month=X&year=Y` - Statistiques par client

## 🚀 Déploiement

### Option 1 : Serveur personnel

1. Clonez le projet sur votre serveur
2. Installez les dépendances
3. Configurez un process manager (PM2)
4. Configurez un reverse proxy (nginx)

### Option 2 : Platforms cloud

**Backend** : Render, Railway, Fly.io
**Frontend** : Vercel, Netlify, Cloudflare Pages

### Option 3 : Docker (à venir)

Un Dockerfile sera fourni prochainement.

## 🛠️ Développement

### Mode développement

```bash
# Terminal 1 - Backend avec hot reload
cd backend
npm run dev

# Terminal 2 - Frontend avec hot reload
cd frontend
npm run dev
```

### Build production

```bash
# Frontend
cd frontend
npm run build
# Les fichiers sont dans dist/

# Backend - pas de build nécessaire
```

## 📝 Roadmap

- [ ] Export des données (Excel, CSV)
- [ ] Graphiques avancés
- [ ] Notifications quotidiennes
- [ ] Mode hors-ligne avec synchronisation
- [ ] Gestion multi-utilisateurs
- [ ] Import de données

## 🤝 Contribution

Ce projet est open source. N'hésitez pas à proposer des améliorations !

## 📄 Licence

MIT License - Utilisez librement pour vos projets personnels ou professionnels.

## 📞 Support

Pour toute question ou problème :
- Vérifiez que Node.js est bien installé
- Vérifiez les ports 3000 et 3001 sont disponibles
- Consultez les logs du backend et frontend

---

Fait avec ❤️ pour les freelances qui veulent simplifier leur suivi d'activité.
