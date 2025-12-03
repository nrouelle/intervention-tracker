const API_URL = '/api';

// Gestion du token
export const authService = {
  getToken() {
    return localStorage.getItem('token');
  },
  
  setToken(token) {
    localStorage.setItem('token', token);
  },
  
  removeToken() {
    localStorage.removeItem('token');
  },
  
  getUsername() {
    return localStorage.getItem('username');
  },
  
  setUsername(username) {
    localStorage.setItem('username', username);
  },
  
  isAuthenticated() {
    return !!this.getToken();
  }
};

// Fonction utilitaire pour les requêtes
async function fetchAPI(endpoint, options = {}) {
  const token = authService.getToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);
  
  if (response.status === 401) {
    authService.removeToken();
    window.location.href = '/login';
    throw new Error('Non authentifié');
  }
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erreur serveur' }));
    throw new Error(error.error || 'Erreur serveur');
  }
  
  return response.json();
}

// Auth API
export const login = async (username, password) => {
  const data = await fetchAPI('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  
  authService.setToken(data.token);
  authService.setUsername(data.username);
  return data;
};

export const logout = () => {
  authService.removeToken();
  localStorage.removeItem('username');
};

// Clients API
export const getClients = () => fetchAPI('/clients');

export const createClient = (nom) => fetchAPI('/clients', {
  method: 'POST',
  body: JSON.stringify({ nom }),
});

export const deleteClient = (id) => fetchAPI(`/clients/${id}`, {
  method: 'DELETE',
});

// Interventions API
export const getInterventions = (month, year) => {
  const params = new URLSearchParams();
  if (month) params.append('month', month);
  if (year) params.append('year', year);
  return fetchAPI(`/interventions?${params}`);
};

export const createIntervention = (intervention) => fetchAPI('/interventions', {
  method: 'POST',
  body: JSON.stringify(intervention),
});

export const deleteIntervention = (id) => fetchAPI(`/interventions/${id}`, {
  method: 'DELETE',
});

// Stats API
export const getStats = (month, year) => {
  const params = new URLSearchParams();
  if (month) params.append('month', month);
  if (year) params.append('year', year);
  return fetchAPI(`/stats?${params}`);
};
