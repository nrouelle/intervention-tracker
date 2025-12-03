#!/bin/bash

echo "🚀 Démarrage de Intervention Tracker..."
echo ""

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js n'est pas installé${NC}"
    echo "Installez Node.js depuis https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node --version) détecté${NC}"
echo ""

# Installer les dépendances si nécessaire
if [ ! -d "backend/node_modules" ]; then
    echo -e "${BLUE}📦 Installation des dépendances du backend...${NC}"
    cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo -e "${BLUE}📦 Installation des dépendances du frontend...${NC}"
    cd frontend && npm install && cd ..
fi

echo ""
echo -e "${GREEN}✅ Dépendances installées${NC}"
echo ""
echo -e "${BLUE}🔧 Démarrage des serveurs...${NC}"
echo ""
echo -e "${GREEN}Backend:${NC} http://localhost:3001"
echo -e "${GREEN}Frontend:${NC} http://localhost:3000"
echo ""
echo -e "${BLUE}Identifiants par défaut:${NC}"
echo "  Username: admin"
echo "  Password: admin123"
echo ""
echo "Appuyez sur Ctrl+C pour arrêter les serveurs"
echo ""

# Démarrer le backend en arrière-plan
cd backend
npm start &
BACKEND_PID=$!

# Attendre que le backend démarre
sleep 2

# Démarrer le frontend
cd ../frontend
npm run dev &
FRONTEND_PID=$!

# Fonction de nettoyage
cleanup() {
    echo ""
    echo "Arrêt des serveurs..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Capturer Ctrl+C
trap cleanup INT

# Attendre
wait
