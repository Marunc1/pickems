import { useState, useEffect } from 'react';
import { supabase, type Tournament, type Team } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Trophy, Save, TrendingUp, CheckCircle } from 'lucide-react'; // Adăugăm CheckCircle

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

const MAX_QUALIFIERS_PER_GROUP = 2; // Numărul maxim de echipe care se califică per grupă

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
  const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']; // Extindem grupele la 8

  function handleQualifierToggle(group: string, teamId: string) {
    const currentGroupPicks = picks[group] || [];
    let newGroupPicks: string[];

    if (currentGroupPicks.includes(teamId)) {
      // Dacă echipa este deja selectată, o deselectăm
      newGroupPicks = currentGroupPicks.filter((id: string) => id !== teamId);
    } else {
      // Dacă echipa nu este selectată
      if (currentGroupPicks.length < MAX_QUALIFIERS_PER_GROUP) {
        // O adăugăm dacă nu am atins limita de calificări
        newGroupPicks = [...currentGroupPicks, teamId];
      } else {
        // Altfel, notificăm utilizatorul că a atins limita
        alert(`Poți selecta maxim ${MAX_QUALIFIERS_PER_GROUP} echipe per grupă.`);
        return;
      }
    }

    onPicksChange({
      ...picks,
      [group]: newGroupPicks,
    });
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"> {/* Layout mai flexibil */}
      {groups.map((group) => {
        const groupTeams = teams.filter((team: Team) => team.group === group);
        const selectedCount = (picks[group] || []).length;

        if (groupTeams.length === 0) return null; // Nu afișăm grupele fără echipe

        return (
          <div key={group} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-xl font-bold">
                  {group}
                </div>
                Group {group}
              </div>
              <span className="text-slate-400 text-sm">
                {selectedCount}/{MAX_QUALIFIERS_PER_GROUP} selected
              </span>
            </h2>
            <div className="space-y-3">
              {groupTeams.map((team: Team) => (
                <div
                  key={team.id}
                  className={`p-4 rounded-lg flex items-center justify-between cursor-pointer transition-colors duration-200 ${
                    (picks[group] || []).includes(team.id)
                      ? 'bg-green-800/40 border border-green-500'
                      : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                  onClick={() => handleQualifierToggle(group, team.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{team.logo}</span> {/* Removed || '❓' */}
                    <div>
                      <h3 className="text-white font-semibold">{team.name}</h3>
                      <p className="text-slate-400 text-sm">{team.region || 'N/A'}</p>
                    </div>
                  </div>
                  {(picks[group] || []).includes(team.id) && (
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}