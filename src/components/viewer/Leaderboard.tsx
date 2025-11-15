import { useState, useEffect } from 'react';
import { supabase, type UserData } from '../../lib/supabase';
import { Trophy, TrendingUp, Medal } from 'lucide-react';

export default function Leaderboard() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  async function loadLeaderboard() {
    try {
      const { data, error } = await supabase
        .from('user_data')
        .select('*')
        .order('score', { ascending: false })
        .limit(50);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }

  function getRankIcon(index: number) {
    if (index === 0) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (index === 1) return <Medal className="w-6 h-6 text-slate-400" />;
    if (index === 2) return <Medal className="w-6 h-6 text-orange-600" />;
    return <span className="text-slate-400 font-bold">{index + 1}</span>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            <TrendingUp className="w-10 h-10 text-blue-500" />
            Leaderboard
          </h1>
          <p className="text-slate-400 mt-2">Top predictors worldwide</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Player</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {users.map((user, index) => (
                  <tr
                    key={user.id}
                    className={`hover:bg-slate-700/50 transition-colors ${
                      index < 3 ? 'bg-slate-700/30' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center w-8">
                        {getRankIcon(index)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-white font-semibold">{user.username}</div>
                          {user.is_admin && (
                            <span className="text-xs text-blue-400">Admin</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-white font-bold text-lg">{user.score}</span>
                      <span className="text-slate-400 text-sm ml-1">pts</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">No players yet. Be the first to make picks!</p>
          </div>
        )}
      </div>
    </div>
  );
}
