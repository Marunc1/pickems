import { useAuth } from '../contexts/AuthContext';
import { Navigate, Link, Outlet, useLocation } from 'react-router-dom'; 
import { Settings, LayoutDashboard } from 'lucide-react'; // Am eliminat ListTree, Users, Trophy
import { useState, useEffect } from 'react';
import { supabase, type Tournament } from '../lib/supabase';

function AdminDashboard() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const location = useLocation();

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
  const [tournamentsLoading, setTournamentsLoading] = useState(true);

  useEffect(() => {
    loadTournaments();
  }, []);

  async function loadTournaments() {
    setTournamentsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tournament_settings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTournaments(data || []);
      if (data && data.length > 0 && !selectedTournamentId) {
        setSelectedTournamentId(data[0].id); // Selectează primul turneu implicit
      } else if (data && data.length > 0 && selectedTournamentId && !data.some(t => t.id === selectedTournamentId)) {
        // Dacă turneul selectat anterior nu mai există, selectează primul
        setSelectedTournamentId(data[0].id);
      } else if (data && data.length === 0) {
        setSelectedTournamentId(null); // Nu există turnee
      }
    } catch (error) {
      console.error('Error loading tournaments in AdminDashboard:', error);
    } finally {
      setTournamentsLoading(false);
    }
  }

  const loading = authLoading || tournamentsLoading;

  if (loading) {
    return <div className="text-white text-center py-12 text-xl">Se încarcă setările de admin...</div>;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white"> {/* Changed min-h-screen to flex flex-col h-full */}
      <header className="bg-gradient-to-r from-blue-800 to-slate-900 shadow-lg px-8 py-6">
        <h1 className="text-4xl font-extrabold flex items-center gap-4">
          <LayoutDashboard className="w-10 h-10 text-white" />
          Dashboard Administrator
        </h1>
        <p className="text-blue-200 mt-2 text-lg">Manage your tournament settings and data with ease.</p>
      </header>

      <div className="flex flex-grow overflow-auto"> {/* Added flex-grow and overflow-auto */}
        <aside className="w-72 bg-slate-800 h-full border-r border-slate-700 p-6 shadow-xl"> {/* Changed min-h-[calc(100vh-120px)] to h-full */}
          <nav className="space-y-3">
            <Link 
              to="/admin" 
              className={`w-full flex items-center gap-4 px-5 py-3 rounded-xl transition-all duration-200 ${
                location.pathname === '/admin'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Settings className="w-5 h-5" />
              General Admin Panel
            </Link>
            {/* Am eliminat link-urile directe către sub-pagini de administrare */}
          </nav>
        </aside>
        <main className="flex-1 p-8 bg-slate-900">
          <Outlet context={{ tournaments, selectedTournamentId, setSelectedTournamentId, onRefreshTournaments: loadTournaments }} />
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;