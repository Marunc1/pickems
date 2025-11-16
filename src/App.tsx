import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate, Outlet, useOutletContext } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Auth from './components/Auth';
import Navigation from './components/Navigation';
import PickemsView from './components/viewer/PickemsView';
import Leaderboard from './components/viewer/Leaderboard';
import AdminPanel from './components/admin/AdminPanel';
import AdminDashboard from './pages/AdminDashboard'; 
import { type Tournament } from './lib/supabase'; // Importăm Tournament type

// Definirea tipului pentru contextul Outlet
type OutletContextType = {
  tournaments: Tournament[];
  selectedTournamentId: string | null;
  setSelectedTournamentId: (id: string) => void;
  onRefreshTournaments: () => void;
};

function AppContent() {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect non-admin users trying to access any /admin/* path
    if (!loading && user && location.pathname.startsWith('/admin') && !isAdmin) {
      navigate('/');
    }
  }, [user, loading, isAdmin, location.pathname, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen bg-slate-900"> {/* Main app container, takes full height */}
      {!isAdminRoute && <Navigation />} {/* Navigation bar, fixed height */}
      <main className="flex-grow overflow-auto"> {/* Main content area, takes remaining height and allows scrolling */}
        <Routes>
          <Route path="/" element={<PickemsView />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          {/* Nested admin routes */}
          <Route path="/admin" element={<AdminDashboard />}>
            <Route index element={<AdminPanel />} /> {/* Default child route for /admin */}
            {/* Am eliminat ruta separată pentru MatchesAdmin */}
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;