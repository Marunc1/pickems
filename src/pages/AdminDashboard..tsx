// src/pages/AdminDashboard.jsx (sau .tsx)
import { useAuth } from '../contexts/AuthContext';
// 👈 Modificarea este AICI: adaugă Link și Outlet
import { Navigate, Link, Outlet } from 'react-router-dom'; 

// Presupunând că folosești React Router

function AdminDashboard() {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return <div>Se încarcă setările de admin...</div>;
  }

  // Dacă nu este admin SAU nu este logat, redirecționează
  if (!user || !isAdmin) {
    return <Navigate to="/" replace />; // Redirecționează la pagina principală
  }

  return (
    <div>
      <h1>Dashboard Administrator 👑</h1>
      <nav>
        {/* Navigare între secțiunile de admin */}
        <Link to="/admin/matches">Gestionare Meciuri</Link>
        <Link to="/admin/teams">Gestionare Echipe</Link>
      </nav>
      {/* Aici se va randa conținutul specific (e.g., MatchesAdmin) */}
      <Outlet /> 
    </div>
  );
}

export default AdminDashboard;