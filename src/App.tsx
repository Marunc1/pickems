import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Auth from './components/Auth';
import Navigation from './components/Navigation';
import PickemsView from './components/viewer/PickemsView';
import Leaderboard from './components/viewer/Leaderboard';
import AdminPanel from './components/admin/AdminPanel';
import { Routes, Route } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard.'; 
import MatchesAdmin from './pages/admin/MatchesAdmin.';

function AppRoutes() {
  return (
    <Routes>
      {/* ... Alte rute publice ... */}
      
      {/* Rute de Admin */}
      <Route path="/admin" element={<AdminDashboard />}>
        {/* Acesta va fi randat în <Outlet /> din AdminDashboard */}
        <Route path="matches" element={<MatchesAdmin />} />
        {/* Poți adăuga și alte sub-rute: <Route path="teams" element={<TeamsAdmin />} /> */}
      </Route>
    </Routes>
  );
}

function AppContent() {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && location.pathname === '/admin' && !isAdmin) {
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

  const isAdminRoute = location.pathname === '/admin';

  return (
    <div className="min-h-screen bg-slate-900">
      {!isAdminRoute && <Navigation />}
      <Routes>
        <Route path="/" element={<PickemsView />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/admin" element={isAdmin ? <AdminPanel /> : <Navigate to="/" replace />} />
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
