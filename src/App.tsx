import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Auth from './components/Auth';
import Navigation from './components/Navigation';
import PickemsView from './components/viewer/PickemsView';
import Leaderboard from './components/viewer/Leaderboard';
import AdminPanel from './components/admin/AdminPanel';

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
