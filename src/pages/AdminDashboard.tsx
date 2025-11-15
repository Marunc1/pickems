import { useAuth } from '../contexts/AuthContext';
import { Navigate, Link, Outlet, useLocation } from 'react-router-dom'; 
import { Settings, LayoutDashboard, ListTree } from 'lucide-react';

function AdminDashboard() {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="text-white text-center py-12">Se încarcă setările de admin...</div>;
  }

  // Dacă nu este admin SAU nu este logat, redirecționează
  if (!user || !isAdmin) {
    return <Navigate to="/" replace />; // Redirecționează la pagina principală
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <LayoutDashboard className="w-8 h-8 text-blue-500" />
          Dashboard Administrator
        </h1>
        <p className="text-slate-400 mt-1">Manage your tournament settings and data.</p>
      </div>

      <div className="flex">
        <div className="w-64 bg-slate-800 min-h-screen border-r border-slate-700 p-4">
          <nav className="space-y-2">
            {/* Navigare între secțiunile de admin */}
            <Link 
              to="/admin" 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === '/admin'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Settings className="w-5 h-5" />
              General Admin Panel
            </Link>
            <Link 
              to="/admin/matches" 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === '/admin/matches'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              <ListTree className="w-5 h-5" />
              Gestionare Meciuri
            </Link>
            {/* Poți adăuga și alte sub-rute: <Link to="/admin/teams">Gestionare Echipe</Link> */}
          </nav>
        </div>
        <div className="flex-1 p-6">
          {/* Aici se va randa conținutul specific (e.g., MatchesAdmin sau AdminPanel) */}
          <Outlet /> 
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;