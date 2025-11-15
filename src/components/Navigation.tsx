import { Trophy, TrendingUp, Settings, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navigation() {
  const { user, isAdmin, signOut } = useAuth();
  const location = useLocation();

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
            <Link to="/" className="text-xl font-bold text-white flex items-center gap-2 hover:text-blue-400 transition-colors">
              League Of Loolish E3 Pick'ems
            </Link>
            <div className="flex gap-2">
              <Link
                to="/"
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  location.pathname === '/'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Trophy className="w-4 h-4" />
                Pick'ems
              </Link>
              <Link
                to="/leaderboard"
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  location.pathname === '/leaderboard'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Leaderboard
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    location.pathname.startsWith('/admin') // Updated to startsWith for nested routes
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  Admin
                </Link>
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