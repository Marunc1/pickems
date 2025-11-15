import { useState, useEffect } from 'react';
import { supabase, type Tournament, type Team } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Trophy, Save, TrendingUp } from 'lucide-react';

export default function PickemsView() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [picks, setPicks] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadTournaments();
    if (user) {
      loadUserPicks();
    }
  }, [user]);

  async function loadTournaments() {
    try {
      const { data, error } = await supabase
        .from('tournament_settings')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTournaments(data || []);
      if (data && data.length > 0) {
        setSelectedTournament(data[0]);
      }
    } catch (error) {
      console.error('Error loading tournaments:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadUserPicks() {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_data')
        .select('picks')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setPicks(data.picks || {});
      }
    } catch (error) {
      console.error('Error loading picks:', error);
    }
  }

  async function savePicks() {
    if (!user || !selectedTournament) return;

    try {
      const { error } = await supabase
        .from('user_data')
        .update({ picks: { ...picks, [selectedTournament.id]: picks[selectedTournament.id] } })
        .eq('user_id', user.id);

      if (error) throw error;
      alert('Picks saved successfully!');
    } catch (error) {
      console.error('Error saving picks:', error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading tournaments...</div>
      </div>
    );
  }

  if (!selectedTournament) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">No active tournaments</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white flex items-center gap-3 mb-2">
                <Trophy className="w-10 h-10 text-yellow-500" />
                {selectedTournament.name}
              </h1>
              <p className="text-slate-400">Make your predictions and compete with others!</p>
            </div>
            <button
              onClick={savePicks}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save Picks
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {selectedTournament.stage === 'groups' && (
          <GroupStagePickems
            tournament={selectedTournament}
            picks={picks[selectedTournament.id] || {}}
            onPicksChange={(newPicks) =>
              setPicks({ ...picks, [selectedTournament.id]: newPicks })
            }
          />
        )}
      </div>
    </div>
  );
}

function GroupStagePickems({
  tournament,
  picks,
  onPicksChange
}: {
  tournament: Tournament;
  picks: any;
  onPicksChange: (picks: any) => void;
}) {
  const teams = tournament.teams || [];
  const groups = ['A', 'B', 'C', 'D'];

  function handleRankChange(group: string, teamId: string, rank: number) {
    const newPicks = { ...picks };
    if (!newPicks[group]) {
      newPicks[group] = {};
    }
    newPicks[group][teamId] = rank;
    onPicksChange(newPicks);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {groups.map((group) => {
        const groupTeams = teams.filter((team: Team) => team.group === group);
        return (
          <div key={group} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                {group}
              </div>
              Group {group}
            </h2>
            <div className="space-y-3">
              {groupTeams.map((team: Team) => (
                <div
                  key={team.id}
                  className="bg-slate-700 p-4 rounded-lg flex items-center justify-between hover:bg-slate-600 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{team.logo}</span>
                    <div>
                      <h3 className="text-white font-semibold">{team.name}</h3>
                      <p className="text-slate-400 text-sm">{team.region}</p>
                    </div>
                  </div>
                  <select
                    value={picks[group]?.[team.id] || ''}
                    onChange={(e) => handleRankChange(group, team.id, parseInt(e.target.value))}
                    className="px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
                  >
                    <option value="">Rank</option>
                    <option value="1">1st</option>
                    <option value="2">2nd</option>
                    <option value="3">3rd</option>
                    <option value="4">4th</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
