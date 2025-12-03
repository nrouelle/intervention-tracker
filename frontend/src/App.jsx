import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './services/api';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DailySaisie from './pages/DailySaisie';
import Clients from './pages/Clients';
import Layout from './components/Layout';

function PrivateRoute({ children }) {
  return authService.isAuthenticated() ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          <Route index element={<Navigate to="/saisie" replace />} />
          <Route path="saisie" element={<DailySaisie />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="clients" element={<Clients />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
