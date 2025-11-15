import { useState } from 'react';
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
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<'pickems' | 'leaderboard' | 'admin'>('pickems');

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

  return (
    <div className="min-h-screen bg-slate-900">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      {currentView === 'pickems' && <PickemsView />}
      {currentView === 'leaderboard' && <Leaderboard />}
      {currentView === 'admin' && <AdminPanel />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
