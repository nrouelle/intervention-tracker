import { useState, useEffect } from 'react';
import { getStats, getInterventions } from '../services/api';

function Dashboard() {
  const [stats, setStats] = useState([]);
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, interventionsData] = await Promise.all([
        getStats(selectedDate.month, selectedDate.year),
        getInterventions(selectedDate.month, selectedDate.year)
      ]);
      setStats(statsData);
      setInterventions(interventionsData);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalJours = stats.reduce((sum, s) => sum + s.jours, 0);
  const totalDemiJournees = stats.reduce((sum, s) => sum + s.demiJournees, 0);
  const joursAbsence = interventions.filter(i => i.type === 'absence').length / 2;

  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const handleMonthChange = (e) => {
    setSelectedDate({ ...selectedDate, month: parseInt(e.target.value) });
  };

  const handleYearChange = (e) => {
    setSelectedDate({ ...selectedDate, year: parseInt(e.target.value) });
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

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
            Tableau de bord
          </h1>
          <p className="text-muted">
            Vue d'ensemble de vos interventions
          </p>
        </div>
        
        <div className="flex gap-2">
          <select
            className="form-select"
            value={selectedDate.month}
            onChange={handleMonthChange}
            style={{ width: 'auto' }}
          >
            {months.map((month, index) => (
              <option key={index} value={index + 1}>
                {month}
              </option>
            ))}
          </select>
          
          <select
            className="form-select"
            value={selectedDate.year}
            onChange={handleYearChange}
            style={{ width: 'auto' }}
          >
            {years.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total jours travaillés</div>
          <div className="stat-value">
            {totalJours.toFixed(1)}
            <span className="stat-unit">jours</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">Demi-journées</div>
          <div className="stat-value">
            {totalDemiJournees}
            <span className="stat-unit">½j</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">Jours d'absence</div>
          <div className="stat-value">
            {joursAbsence.toFixed(1)}
            <span className="stat-unit">jours</span>
          </div>
        </div>
      </div>

      {stats.length === 0 ? (
        <div className="card text-center">
          <div style={{ padding: '40px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
              Aucune intervention ce mois-ci
            </h3>
            <p className="text-muted">
              Commencez par enregistrer vos interventions dans la page Saisie
            </p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Détail par client</h2>
            <p className="card-subtitle">
              Répartition des interventions pour {months[selectedDate.month - 1]} {selectedDate.year}
            </p>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th style={{ textAlign: 'right' }}>Demi-journées</th>
                  <th style={{ textAlign: 'right' }}>Jours complets</th>
                  <th style={{ textAlign: 'right' }}>Pourcentage</th>
                </tr>
              </thead>
              <tbody>
                {stats
                  .sort((a, b) => b.jours - a.jours)
                  .map(stat => (
                    <tr key={stat.clientId}>
                      <td>
                        <strong>{stat.clientNom}</strong>
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                        {stat.demiJournees}
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        {stat.jours.toFixed(1)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
                          <div style={{ 
                            width: '100px', 
                            height: '8px', 
                            background: 'var(--color-bg-input)', 
                            borderRadius: '4px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              width: `${(stat.jours / totalJours * 100)}%`,
                              height: '100%',
                              background: 'var(--color-primary)',
                              transition: 'width 0.3s ease'
                            }} />
                          </div>
                          <span style={{ 
                            fontFamily: 'var(--font-mono)', 
                            fontSize: '13px',
                            minWidth: '45px',
                            textAlign: 'right'
                          }}>
                            {(stat.jours / totalJours * 100).toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {interventions.filter(i => i.type === 'absence').length > 0 && (
        <div className="card mt-4">
          <div className="card-header">
            <h2 className="card-title">Absences</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {interventions
              .filter(i => i.type === 'absence')
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map(intervention => (
                <div 
                  key={intervention.id}
                  style={{
                    padding: '12px 16px',
                    background: 'var(--color-bg-input)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '14px' }}>
                      {new Date(intervention.date).toLocaleDateString('fr-FR', { 
                        day: 'numeric', 
                        month: 'long' 
                      })}
                    </strong>
                    <span className="badge badge-warning" style={{ marginLeft: '12px' }}>
                      {intervention.periode === 'matin' ? '🌅 Matin' : '☀️ Après-midi'}
                    </span>
                    {intervention.commentaire && (
                      <span style={{ marginLeft: '12px', color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                        {intervention.commentaire}
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
