import { useState, useEffect } from 'react';
import { getClients, createIntervention } from '../services/api';

function DailySaisie() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    periode: 'matin',
    type: 'travail',
    clientId: '',
    commentaire: ''
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const data = await getClients();
      setClients(data);
      if (data.length > 0) {
        setFormData(prev => ({ ...prev, clientId: data[0].id }));
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors du chargement des clients' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      await createIntervention(formData);
      setMessage({ type: 'success', text: 'Intervention enregistrée avec succès !' });
      
      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        periode: formData.periode === 'matin' ? 'apres-midi' : 'matin',
        type: 'travail',
        clientId: clients.length > 0 ? clients[0].id : '',
        commentaire: ''
      });

      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSubmitting(false);
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
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px', letterSpacing: '-0.02em' }}>
          Saisie quotidienne
        </h1>
        <p className="text-muted">
          Enregistrez vos interventions à 9h et 14h
        </p>
      </div>

      <div className="card" style={{ maxWidth: '600px' }}>
        {message && (
          <div className={`message message-${message.type}`}>
            <span>{message.type === 'success' ? '✅' : '⚠️'}</span>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input
              type="date"
              className="form-input"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Période</label>
            <div className="period-selector">
              <button
                type="button"
                className={`period-option ${formData.periode === 'matin' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, periode: 'matin' })}
              >
                🌅 Matin (9h-12h)
              </button>
              <button
                type="button"
                className={`period-option ${formData.periode === 'apres-midi' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, periode: 'apres-midi' })}
              >
                ☀️ Après-midi (14h-18h)
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Type</label>
            <div className="period-selector">
              <button
                type="button"
                className={`period-option ${formData.type === 'travail' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, type: 'travail' })}
              >
                💼 Travail
              </button>
              <button
                type="button"
                className={`period-option ${formData.type === 'absence' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, type: 'absence' })}
              >
                🏖️ Absence
              </button>
            </div>
          </div>

          {formData.type === 'travail' && (
            <div className="form-group">
              <label className="form-label">Client</label>
              {clients.length === 0 ? (
                <div style={{ 
                  padding: '16px', 
                  background: 'var(--color-bg-input)', 
                  borderRadius: 'var(--radius-sm)',
                  textAlign: 'center',
                  color: 'var(--color-text-secondary)',
                  fontSize: '14px'
                }}>
                  Aucun client disponible. <a href="/clients" style={{ color: 'var(--color-primary)' }}>Ajoutez-en un</a>
                </div>
              ) : (
                <select
                  className="form-select"
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  required
                >
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.nom}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {formData.type === 'absence' && (
            <div className="form-group">
              <label className="form-label">Commentaire (optionnel)</label>
              <input
                type="text"
                className="form-input"
                value={formData.commentaire}
                onChange={(e) => setFormData({ ...formData, commentaire: e.target.value })}
                placeholder="Ex: Congés, Formation, Maladie..."
              />
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%' }}
            disabled={submitting || (formData.type === 'travail' && clients.length === 0)}
          >
            {submitting ? 'Enregistrement...' : '✓ Enregistrer l\'intervention'}
          </button>
        </form>
      </div>

      <div style={{ 
        marginTop: '24px', 
        padding: '20px', 
        background: 'white', 
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: 'var(--color-text-primary)' }}>
          💡 Astuce
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
          Pensez à remplir cette saisie deux fois par jour : une fois le matin à 9h pour la demi-journée du matin,
          et une fois l'après-midi à 14h pour la demi-journée de l'après-midi.
        </p>
      </div>
    </div>
  );
}

export default DailySaisie;
