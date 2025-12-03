@echo off
chcp 65001 > nul
cls

echo ========================================
echo 🚀 Démarrage de Intervention Tracker
echo ========================================
echo.

:: Vérifier Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js n'est pas installé
    echo Installez Node.js depuis https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js détecté
echo.

:: Installer les dépendances backend si nécessaire
if not exist "backend\node_modules" (
    echo 📦 Installation des dépendances du backend...
    cd backend
    call npm install
    cd ..
)

:: Installer les dépendances frontend si nécessaire
if not exist "frontend\node_modules" (
    echo 📦 Installation des dépendances du frontend...
    cd frontend
    call npm install
    cd ..
)

echo.
echo ✅ Dépendances installées
echo.
echo 🔧 Démarrage des serveurs...
echo.
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Identifiants par défaut:
echo   Username: admin
echo   Password: admin123
echo.
echo Appuyez sur Ctrl+C pour arrêter les serveurs
echo.

:: Démarrer le backend dans une nouvelle fenêtre
start "Backend - Intervention Tracker" cmd /k "cd backend && npm start"

:: Attendre 2 secondes
timeout /t 2 /nobreak > nul

:: Démarrer le frontend dans une nouvelle fenêtre
start "Frontend - Intervention Tracker" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ Les serveurs sont démarrés dans des fenêtres séparées
echo.
echo Vous pouvez fermer cette fenêtre.
echo Pour arrêter les serveurs, fermez les fenêtres Backend et Frontend.
echo.
pause
