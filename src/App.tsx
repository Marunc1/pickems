import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Auth from './components/Auth';
import Navigation from './components/Navigation';
import PickemsView from './components/viewer/PickemsView';
import Leaderboard from './components/viewer/Leaderboard';
import AdminPanel from './components/admin/AdminPanel';
import AdminDashboard from './pages/AdminDashboard'; 
import MatchesAdmin from './pages/admin/MatchesAdmin';

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
    <div className="min-h-screen bg-slate-900">
      {!isAdminRoute && <Navigation />}
      <Routes>
        <Route path="/" element={<PickemsView />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        {/* Nested admin routes */}
        <Route path="/admin" element={<AdminDashboard />}>
          <Route index element={<AdminPanel />} /> {/* Default child route for /admin */}
          <Route path="matches" element={<MatchesAdmin />} />
          {/* Add other admin sub-routes here if needed */}
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
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