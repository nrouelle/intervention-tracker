import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { logout, authService } from '../services/api';

function Layout() {
  const navigate = useNavigate();
  const username = authService.getUsername();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
      <nav className="nav">
        <div className="nav-content">
          <NavLink to="/" className="nav-brand">
            <span className="nav-brand-icon">⏱️</span>
            Intervention Tracker
          </NavLink>
          
          <ul className="nav-links">
            <li>
              <NavLink to="/saisie" className="nav-link">
                Saisie
              </NavLink>
            </li>
            <li>
              <NavLink to="/dashboard" className="nav-link">
                Tableau de bord
              </NavLink>
            </li>
            <li>
              <NavLink to="/clients" className="nav-link">
                Clients
              </NavLink>
            </li>
          </ul>
          
          <div className="nav-actions">
            <div className="user-badge">
              {username}
            </div>
            <button onClick={handleLogout} className="btn btn-sm btn-ghost">
              Déconnexion
            </button>
          </div>
        </div>
      </nav>
      
      <main style={{ padding: '32px 0', minHeight: 'calc(100vh - 64px)' }}>
        <div className="container">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout;
