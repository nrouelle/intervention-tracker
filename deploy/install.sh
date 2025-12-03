#!/bin/bash

# Script d'installation automatique d'Intervention Tracker sur VPS
# Usage: curl -sL https://raw.githubusercontent.com/votre-username/intervention-tracker/main/deploy/install.sh | bash

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════╗"
echo "║   Installation d'Intervention Tracker sur VPS    ║"
echo "╚═══════════════════════════════════════════════════╝"
echo -e "${NC}"

# Fonction pour afficher les messages
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Vérifier si l'utilisateur est root
if [ "$EUID" -eq 0 ]; then
    log_error "Ne pas exécuter ce script en tant que root"
    log_info "Utilisez: curl -sL ... | bash"
    exit 1
fi

# Demander les informations
echo ""
log_info "Configuration de l'installation"
echo ""

read -p "Nom de domaine (ex: tracker.exemple.com): " DOMAIN
read -p "Email pour Let's Encrypt: " EMAIL
read -p "Username GitHub: " GITHUB_USERNAME
read -p "Nom du repository: " REPO_NAME

echo ""
log_info "Résumé de la configuration:"
echo "  Domaine: $DOMAIN"
echo "  Email: $EMAIL"
echo "  Repository: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo ""
read -p "Continuer l'installation? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_error "Installation annulée"
    exit 1
fi

# Mise à jour du système
log_info "Mise à jour du système..."
sudo apt update
sudo apt upgrade -y
log_success "Système mis à jour"

# Installation de Node.js
log_info "Installation de Node.js 20..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
    log_success "Node.js installé ($(node --version))"
else
    log_success "Node.js déjà installé ($(node --version))"
fi

# Installation de nginx
log_info "Installation de nginx..."
if ! command -v nginx &> /dev/null; then
    sudo apt install -y nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
    log_success "nginx installé"
else
    log_success "nginx déjà installé"
fi

# Installation de PM2
log_info "Installation de PM2..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    log_success "PM2 installé"
else
    log_success "PM2 déjà installé"
fi

# Configuration du pare-feu
log_info "Configuration du pare-feu..."
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
echo "y" | sudo ufw enable
log_success "Pare-feu configuré"

# Installation de Git
log_info "Installation de Git..."
if ! command -v git &> /dev/null; then
    sudo apt install -y git
    log_success "Git installé"
else
    log_success "Git déjà installé"
fi

# Création du dossier de l'application
log_info "Création du dossier de l'application..."
sudo mkdir -p /var/www/intervention-tracker
sudo chown -R $USER:$USER /var/www/intervention-tracker

# Génération d'une clé SSH pour GitHub
log_info "Configuration de la clé SSH pour GitHub..."
if [ ! -f ~/.ssh/id_ed25519 ]; then
    ssh-keygen -t ed25519 -C "deploy-intervention-tracker-$DOMAIN" -f ~/.ssh/id_ed25519 -N ""
    log_success "Clé SSH générée"
    
    echo ""
    log_warning "IMPORTANT: Ajoutez cette clé publique à GitHub:"
    echo ""
    cat ~/.ssh/id_ed25519.pub
    echo ""
    read -p "Appuyez sur Entrée une fois la clé ajoutée à GitHub..."
else
    log_success "Clé SSH déjà existante"
fi

# Test de la connexion SSH à GitHub
log_info "Test de la connexion à GitHub..."
ssh-keyscan github.com >> ~/.ssh/known_hosts 2>/dev/null
if ssh -T git@github.com 2>&1 | grep -q "successfully authenticated"; then
    log_success "Connexion à GitHub réussie"
else
    log_error "Échec de la connexion à GitHub"
    log_info "Vérifiez que la clé SSH est bien ajoutée à GitHub"
    exit 1
fi

# Clonage du repository
log_info "Clonage du repository..."
cd /var/www/intervention-tracker
if [ ! -d ".git" ]; then
    git clone "git@github.com:$GITHUB_USERNAME/$REPO_NAME.git" .
    log_success "Repository cloné"
else
    git pull origin main
    log_success "Repository mis à jour"
fi

# Configuration des variables d'environnement
log_info "Configuration des variables d'environnement..."
cd /var/www/intervention-tracker/backend

if [ ! -f .env ]; then
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    cat > .env << EOF
PORT=3001
NODE_ENV=production
JWT_SECRET=$JWT_SECRET
EOF
    log_success "Fichier .env créé avec un JWT_SECRET aléatoire"
else
    log_warning "Fichier .env déjà existant, conservation de la configuration actuelle"
fi

# Installation des dépendances backend
log_info "Installation des dépendances backend..."
cd /var/www/intervention-tracker/backend
npm install --production
log_success "Dépendances backend installées"

# Installation des dépendances frontend et build
log_info "Installation et build du frontend..."
cd /var/www/intervention-tracker/frontend
npm install
npm run build
log_success "Frontend buildé"

# Création du dossier de données
mkdir -p /var/www/intervention-tracker/backend/data
log_success "Dossier de données créé"

# Configuration de nginx
log_info "Configuration de nginx..."
sudo tee /etc/nginx/sites-available/intervention-tracker > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN;
    
    client_max_body_size 10M;
    
    access_log /var/log/nginx/intervention-tracker-access.log;
    error_log /var/log/nginx/intervention-tracker-error.log;
    
    location / {
        root /var/www/intervention-tracker/frontend/dist;
        try_files \$uri \$uri/ /index.html;
        
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/intervention-tracker /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
log_success "nginx configuré"

# Démarrage de l'application avec PM2
log_info "Démarrage de l'application avec PM2..."
cd /var/www/intervention-tracker
pm2 start backend/server.js --name intervention-tracker-backend
pm2 save
pm2 startup systemd -u $USER --hp /home/$USER | tail -n 1 | sudo bash
log_success "Application démarrée avec PM2"

# Installation de Certbot et SSL
log_info "Installation de Certbot pour SSL..."
sudo apt install -y certbot python3-certbot-nginx
log_success "Certbot installé"

log_info "Obtention du certificat SSL..."
sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email $EMAIL --redirect
log_success "Certificat SSL installé"

# Vérification
log_info "Vérification de l'installation..."
sleep 3

if curl -sf http://localhost:3001/api/health > /dev/null; then
    log_success "Backend opérationnel"
else
    log_error "Le backend ne répond pas"
fi

if curl -sf https://$DOMAIN > /dev/null; then
    log_success "Frontend accessible"
else
    log_warning "Le frontend pourrait ne pas être accessible"
fi

# Création du script de sauvegarde
log_info "Création du script de sauvegarde..."
cat > /home/$USER/backup-intervention-tracker.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/$USER/backups"
DATA_DIR="/var/www/intervention-tracker/backend/data"

mkdir -p $BACKUP_DIR
tar -czf "$BACKUP_DIR/intervention-tracker-data-$DATE.tar.gz" -C "$DATA_DIR" .
find $BACKUP_DIR -name "intervention-tracker-data-*.tar.gz" -mtime +7 -delete
echo "Sauvegarde créée: intervention-tracker-data-$DATE.tar.gz"
EOF

chmod +x /home/$USER/backup-intervention-tracker.sh

# Ajouter au crontab
(crontab -l 2>/dev/null; echo "0 2 * * * /home/$USER/backup-intervention-tracker.sh") | crontab -
log_success "Sauvegardes automatiques configurées (tous les jours à 2h)"

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         Installation terminée avec succès!        ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════╝${NC}"
echo ""
log_success "Votre application est accessible sur: https://$DOMAIN"
log_success "Identifiants par défaut: admin / admin123"
echo ""
log_warning "IMPORTANT: Changez le mot de passe par défaut!"
echo ""
log_info "Commandes utiles:"
echo "  pm2 status                          - Voir le statut"
echo "  pm2 logs intervention-tracker       - Voir les logs"
echo "  pm2 restart intervention-tracker    - Redémarrer"
echo "  /home/$USER/backup-intervention-tracker.sh - Sauvegarder"
echo ""
log_info "Pour configurer GitHub Actions, consultez DEPLOIEMENT.md"
echo ""
