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
        .not('picks', 'is', null) // Asigură-te că 'picks' nu este NULL
        .eq('is_admin', false) // Adaugă acest filtru pentru a exclude administratorii
        .order('score', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      // Filtrează obiectele goale în frontend
      const filteredUsers = (data || []).filter(user => {
        // Verifică dacă obiectul picks este gol
        return user.picks && Object.keys(user.picks).length > 0;
      });

      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }

  function getRankIcon(index: number) {
    if (index === 0) return <Trophy className="w-7 h-7 text-yellow-400" />;
    if (index === 1) return <Medal className="w-7 h-7 text-slate-300" />;
    if (index === 2) return <Medal className="w-7 h-7 text-orange-500" />;
    return <span className="text-slate-400 font-bold text-lg">{index + 1}</span>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-900"> {/* Am schimbat gradientul albastru cu un fundal solid slate-900 */}
      <div className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            <TrendingUp className="w-10 h-10 text-blue-500" />
            Leaderboard
          </h1>
          <p className="text-slate-400 mt-2">Top predictors worldwide</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 flex-grow overflow-auto w-full">
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900">
                <tr>
                  <th className="px-6 py-2 text-center text-sm font-semibold text-slate-300 uppercase tracking-wider w-20">Rank</th>
                  <th className="px-6 py-2 text-left text-sm font-semibold text-slate-300 uppercase tracking-wider">Player</th>
                  <th className="px-6 py-2 text-right text-sm font-semibold text-slate-300 uppercase tracking-wider w-32">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-600">
                {users.map((user, index) => (
                  <tr
                    key={user.id}
                    className={`hover:bg-slate-700/50 transition-colors duration-200 ${
                      index < 3 ? 'bg-slate-700/30' : 'bg-slate-800'
                    }`}
                  >
                    <td className="px-6 py-2 text-center">
                      <div className="flex items-center justify-center w-full">
                        {getRankIcon(index)}
                      </div>
                    </td>
                    <td className="px-6 py-2">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-white font-semibold text-lg">{user.username}</div>
                          {/* Am eliminat afișarea etichetei "Admin" aici, deoarece administratorii sunt deja filtrați */}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-2 text-right">
                      <span className="text-white font-bold text-xl">{user.score}</span>
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