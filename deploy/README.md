# 📦 Fichiers de Déploiement

Ce dossier contient tous les fichiers nécessaires pour déployer Intervention Tracker sur un VPS avec GitHub Actions.

## 📁 Contenu

### `.github/workflows/deploy.yml`
Workflow GitHub Actions pour le déploiement automatique sur chaque push sur la branche `main`.

**Fonctionnalités :**
- Connexion SSH au VPS
- Pull des derniers changements
- Sauvegarde des données avant mise à jour
- Installation des dépendances
- Build du frontend
- Redémarrage automatique avec PM2

### `deploy/nginx.conf`
Configuration nginx pour servir l'application.

**Configuration :**
- Proxy inverse vers le backend (port 3001)
- Serveur de fichiers statiques pour le frontend
- Headers de sécurité
- Cache pour les assets statiques
- Support HTTPS (après configuration SSL)

### `deploy/ecosystem.config.js`
Configuration PM2 pour gérer le processus Node.js.

**Paramètres :**
- Mode production
- Gestion de la mémoire
- Logs rotatifs
- Redémarrage automatique en cas de crash

### `deploy/install.sh`
Script d'installation automatique complet.

**Actions :**
- Installation de toutes les dépendances système
- Configuration de nginx
- Configuration de PM2
- Installation du certificat SSL
- Configuration des sauvegardes automatiques

### `backend/.env.example`
Template pour les variables d'environnement du backend.

**Variables :**
- `PORT` : Port du serveur backend
- `NODE_ENV` : Environnement (production)
- `JWT_SECRET` : Clé secrète pour les tokens JWT

## 🚀 Utilisation

### Déploiement automatique

1. **Configuration GitHub** :
   - Ajoutez les secrets GitHub (voir DEPLOIEMENT.md)
   - Pushez votre code sur la branche `main`
   - GitHub Actions déploie automatiquement

2. **Premier déploiement** :
   ```bash
   # Sur votre VPS
   curl -sL https://raw.githubusercontent.com/votre-username/intervention-tracker/main/deploy/install.sh -o install.sh
   chmod +x install.sh
   ./install.sh
   ```

### Configuration manuelle

Consultez [DEPLOIEMENT.md](../DEPLOIEMENT.md) pour les instructions détaillées.

## 🔒 Sécurité

**Avant de déployer en production :**

1. Changez le `JWT_SECRET` dans `.env`
2. Modifiez le mot de passe par défaut (admin/admin123)
3. Configurez HTTPS avec Let's Encrypt
4. Activez le pare-feu (ufw)
5. Configurez les sauvegardes automatiques

## 📊 Monitoring

Après déploiement :

```bash
# Statut de l'application
pm2 status

# Logs en temps réel
pm2 logs intervention-tracker-backend

# Statistiques
pm2 monit

# Logs nginx
sudo tail -f /var/log/nginx/intervention-tracker-access.log
sudo tail -f /var/log/nginx/intervention-tracker-error.log
```

## 🔄 Workflow de mise à jour

1. Faites vos modifications localement
2. Testez en local
3. Commitez : `git commit -m "Description"`
4. Pushez : `git push origin main`
5. GitHub Actions déploie automatiquement !

## 🆘 Support

En cas de problème, consultez :
- [DEPLOIEMENT.md](../DEPLOIEMENT.md) - Guide complet
- [DEPLOIEMENT_RAPIDE.md](../DEPLOIEMENT_RAPIDE.md) - Guide condensé
- [README.md](../README.md) - Documentation générale

## 📝 Checklist de déploiement

- [ ] VPS préparé (Ubuntu 20.04+)
- [ ] Domaine pointant vers le VPS
- [ ] Secrets GitHub configurés
- [ ] `.env` configuré avec JWT_SECRET sécurisé
- [ ] nginx installé et configuré
- [ ] PM2 installé et configuré
- [ ] SSL installé avec Certbot
- [ ] Pare-feu activé
- [ ] Sauvegardes automatiques configurées
- [ ] Premier déploiement réussi
- [ ] Application accessible en HTTPS
- [ ] Mot de passe par défaut changé

---

**Bon déploiement !** 🚀
