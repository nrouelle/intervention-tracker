import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'votre-secret-jwt-changez-moi';

// Middleware
app.use(cors());
app.use(express.json());

// Chemins des fichiers de données
const DATA_DIR = path.join(__dirname, 'data');
const CLIENTS_FILE = path.join(DATA_DIR, 'clients.json');
const INTERVENTIONS_FILE = path.join(DATA_DIR, 'interventions.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Initialiser les fichiers de données
async function initDataFiles() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    
    // Initialiser clients.json
    try {
      await fs.access(CLIENTS_FILE);
    } catch {
      await fs.writeFile(CLIENTS_FILE, JSON.stringify({ clients: [] }, null, 2));
    }
    
    // Initialiser interventions.json
    try {
      await fs.access(INTERVENTIONS_FILE);
    } catch {
      await fs.writeFile(INTERVENTIONS_FILE, JSON.stringify({ interventions: [] }, null, 2));
    }
    
    // Initialiser users.json avec un utilisateur par défaut
    try {
      await fs.access(USERS_FILE);
    } catch {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await fs.writeFile(USERS_FILE, JSON.stringify({ 
        users: [{ 
          id: '1', 
          username: 'admin', 
          password: hashedPassword 
        }] 
      }, null, 2));
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation:', error);
  }
}

// Middleware d'authentification
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalide' });
    }
    req.user = user;
    next();
  });
}

// Routes d'authentification
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const data = JSON.parse(await fs.readFile(USERS_FILE, 'utf-8'));
    const user = data.users.find(u => u.username === username);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, username: user.username });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Routes clients
app.get('/api/clients', authenticateToken, async (req, res) => {
  try {
    const data = JSON.parse(await fs.readFile(CLIENTS_FILE, 'utf-8'));
    res.json(data.clients);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la lecture des clients' });
  }
});

app.post('/api/clients', authenticateToken, async (req, res) => {
  try {
    const { nom } = req.body;
    if (!nom || nom.trim() === '') {
      return res.status(400).json({ error: 'Le nom du client est requis' });
    }

    const data = JSON.parse(await fs.readFile(CLIENTS_FILE, 'utf-8'));
    const newClient = {
      id: Date.now().toString(),
      nom: nom.trim(),
      createdAt: new Date().toISOString()
    };
    
    data.clients.push(newClient);
    await fs.writeFile(CLIENTS_FILE, JSON.stringify(data, null, 2));
    res.status(201).json(newClient);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création du client' });
  }
});

app.delete('/api/clients/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const data = JSON.parse(await fs.readFile(CLIENTS_FILE, 'utf-8'));
    
    data.clients = data.clients.filter(c => c.id !== id);
    await fs.writeFile(CLIENTS_FILE, JSON.stringify(data, null, 2));
    res.json({ message: 'Client supprimé' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression du client' });
  }
});

// Routes interventions
app.get('/api/interventions', authenticateToken, async (req, res) => {
  try {
    const { month, year } = req.query;
    const data = JSON.parse(await fs.readFile(INTERVENTIONS_FILE, 'utf-8'));
    
    let interventions = data.interventions;
    
    // Filtrer par mois/année si spécifié
    if (month && year) {
      interventions = interventions.filter(i => {
        const date = new Date(i.date);
        return date.getMonth() === parseInt(month) - 1 && date.getFullYear() === parseInt(year);
      });
    }
    
    res.json(interventions);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la lecture des interventions' });
  }
});

app.post('/api/interventions', authenticateToken, async (req, res) => {
  try {
    const { date, periode, clientId, type, commentaire } = req.body;
    
    if (!date || !periode || !type) {
      return res.status(400).json({ error: 'Date, période et type sont requis' });
    }

    const data = JSON.parse(await fs.readFile(INTERVENTIONS_FILE, 'utf-8'));
    
    // Vérifier si une intervention existe déjà pour cette date/période
    const existingIndex = data.interventions.findIndex(
      i => i.date === date && i.periode === periode
    );

    const newIntervention = {
      id: existingIndex >= 0 ? data.interventions[existingIndex].id : Date.now().toString(),
      date,
      periode,
      clientId: type === 'travail' ? clientId : null,
      type,
      commentaire: commentaire || null,
      createdAt: existingIndex >= 0 ? data.interventions[existingIndex].createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      data.interventions[existingIndex] = newIntervention;
    } else {
      data.interventions.push(newIntervention);
    }

    await fs.writeFile(INTERVENTIONS_FILE, JSON.stringify(data, null, 2));
    res.status(201).json(newIntervention);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création de l\'intervention' });
  }
});

app.delete('/api/interventions/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const data = JSON.parse(await fs.readFile(INTERVENTIONS_FILE, 'utf-8'));
    
    data.interventions = data.interventions.filter(i => i.id !== id);
    await fs.writeFile(INTERVENTIONS_FILE, JSON.stringify(data, null, 2));
    res.json({ message: 'Intervention supprimée' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'intervention' });
  }
});

// Route pour les statistiques
app.get('/api/stats', authenticateToken, async (req, res) => {
  try {
    const { month, year } = req.query;
    const interventionsData = JSON.parse(await fs.readFile(INTERVENTIONS_FILE, 'utf-8'));
    const clientsData = JSON.parse(await fs.readFile(CLIENTS_FILE, 'utf-8'));
    
    let interventions = interventionsData.interventions;
    
    // Filtrer par mois/année
    if (month && year) {
      interventions = interventions.filter(i => {
        const date = new Date(i.date);
        return date.getMonth() === parseInt(month) - 1 && date.getFullYear() === parseInt(year);
      });
    }
    
    // Calculer les stats par client
    const stats = {};
    interventions.forEach(intervention => {
      if (intervention.type === 'travail' && intervention.clientId) {
        if (!stats[intervention.clientId]) {
          stats[intervention.clientId] = { 
            clientId: intervention.clientId,
            demiJournees: 0,
            jours: 0
          };
        }
        stats[intervention.clientId].demiJournees += 1;
      }
    });
    
    // Ajouter les noms de clients et calculer les jours complets
    const statsArray = Object.values(stats).map(stat => {
      const client = clientsData.clients.find(c => c.id === stat.clientId);
      stat.jours = stat.demiJournees / 2;
      stat.clientNom = client ? client.nom : 'Client inconnu';
      return stat;
    });
    
    res.json(statsArray);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors du calcul des statistiques' });
  }
});

// Route de health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Démarrage du serveur
initDataFiles().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Serveur démarré sur le port ${PORT}`);
    console.log(`📊 API disponible sur http://localhost:${PORT}`);
    console.log(`🔐 Identifiants par défaut: admin / admin123`);
  });
});
