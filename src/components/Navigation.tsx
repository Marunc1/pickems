import { Trophy, TrendingUp, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavigationProps {
  currentView: 'pickems' | 'leaderboard' | 'admin';
  onViewChange: (view: 'pickems' | 'leaderboard' | 'admin') => void;
}

export default function Navigation({ currentView, onViewChange }: NavigationProps) {
  const { user, isAdmin, signOut } = useAuth();

  async function handleSignOut() {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  return (
    <nav className="bg-slate-800 border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <div className="text-xl font-bold text-white flex items-center gap-2">
              League Of Loolish E3 Pick'ems
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onViewChange('pickems')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  currentView === 'pickems'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Trophy className="w-4 h-4" />
                Pick'ems
              </button>
              <button
                onClick={() => onViewChange('leaderboard')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  currentView === 'leaderboard'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Leaderboard
              </button>
              {isAdmin && (
                <button
                  onClick={() => onViewChange('admin')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    currentView === 'admin'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  Admin
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <>
                <div className="text-slate-300 text-sm">
                  Signed in
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
