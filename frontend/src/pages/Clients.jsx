import { useState, useEffect } from 'react';
import { getClients, createClient, deleteClient } from '../services/api';

function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const data = await getClients();
      setClients(data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors du chargement des clients' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    setSubmitting(true);
    setMessage(null);

    try {
      const newClient = await createClient(newClientName.trim());
      setClients([...clients, newClient]);
      setNewClientName('');
      setShowForm(false);
      setMessage({ type: 'success', text: 'Client ajouté avec succès !' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClient = async (id, nom) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le client "${nom}" ?`)) {
      return;
    }

    try {
      await deleteClient(id);
      setClients(clients.filter(c => c.id !== id));
      setMessage({ type: 'success', text: 'Client supprimé avec succès' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="flex-between mb-4">
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px', letterSpacing: '-0.02em' }}>
            Mes clients
          </h1>
          <p className="text-muted">
            Gérez la liste de vos clients
          </p>
        </div>
        
        <button 
          className="btn btn-accent"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Annuler' : '+ Nouveau client'}
        </button>
      </div>

      {message && (
        <div className={`message message-${message.type}`}>
          <span>{message.type === 'success' ? '✅' : '⚠️'}</span>
          {message.text}
        </div>
      )}

      {showForm && (
        <div className="card mb-4">
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>
            Ajouter un nouveau client
          </h3>
          
          <form onSubmit={handleAddClient}>
            <div className="form-group">
              <label className="form-label">Nom du client</label>
              <input
                type="text"
                className="form-input"
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                placeholder="Ex: Entreprise ABC"
                required
                autoFocus
              />
            </div>
            
            <div className="flex gap-2">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={submitting || !newClientName.trim()}
              >
                {submitting ? 'Ajout...' : '✓ Ajouter'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => {
                  setShowForm(false);
                  setNewClientName('');
                }}
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {clients.length === 0 ? (
        <div className="card text-center">
          <div style={{ padding: '40px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
              Aucun client
            </h3>
            <p className="text-muted mb-3">
              Commencez par ajouter votre premier client
            </p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              + Ajouter un client
            </button>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Liste des clients</h2>
            <p className="card-subtitle">
              {clients.length} client{clients.length > 1 ? 's' : ''} enregistré{clients.length > 1 ? 's' : ''}
            </p>
          </div>

          <div style={{ display: 'grid', gap: '12px' }}>
            {clients
              .sort((a, b) => a.nom.localeCompare(b.nom))
              .map(client => (
                <div
                  key={client.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px',
                    background: 'var(--color-bg-input)',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'var(--transition)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--color-bg-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--color-bg-input)';
                  }}
                >
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
                      {client.nom}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                      Ajouté le {new Date(client.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={() => handleDeleteClient(client.id, client.nom)}
                    style={{ color: 'var(--color-error)' }}
                  >
                    🗑️ Supprimer
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      <div style={{ 
        marginTop: '24px', 
        padding: '20px', 
        background: 'white', 
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: 'var(--color-text-primary)' }}>
          💡 Conseil
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
          Organisez vos clients par ordre alphabétique ou par importance. 
          La suppression d'un client ne supprime pas les interventions déjà enregistrées.
        </p>
      </div>
    </div>
  );
}

export default Clients;
