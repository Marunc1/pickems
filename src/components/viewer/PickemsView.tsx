import { useState, useEffect } from 'react';
import { supabase, type Tournament, type Team } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Trophy, Save, TrendingUp, CheckCircle } from 'lucide-react';
import BracketView from './BracketView'; // Import the new BracketView component

export default function PickemsView() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [picks, setPicks] = useState<any>({}); // picks will now store { [tournamentId]: { [matchId]: pickedTeamId } }
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

  // Get picks for the current tournament, or an empty object if none exist
  const currentTournamentPicks = picks[selectedTournament.id] || {};

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

      <div className="px-6 py-8"> {/* Removed max-w-7xl here */}
        {selectedTournament.stage === 'playoffs' ? (
          <BracketView
            tournament={selectedTournament}
            userPicks={currentTournamentPicks}
            onPicksChange={(newPicks) =>
              setPicks({ ...picks, [selectedTournament.id]: newPicks })
            }
          />
        ) : (
          <div className="text-white text-center py-12 text-xl">
            This tournament is not in playoff stage.
          </div>
        )}
      </div>
    </div>
  );
}