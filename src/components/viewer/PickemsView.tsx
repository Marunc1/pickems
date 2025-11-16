import { useState, useEffect } from 'react';
import { supabase, type Tournament, type Team } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Trophy, Save, TrendingUp, CheckCircle } from 'lucide-react';
import BracketView from './BracketView';

export default function PickemsView() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  // picks va stoca acum { [tournamentId]: { [matchId]: pickedTeamId } }
  const [picks, setPicks] = useState<{ [tournamentId: string]: { [matchId: string]: string } }>({}); 
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

  // Această funcție primește acum matchId și pickedTeamId (sau null)
  const handleTournamentPickChange = (matchId: string, pickedTeamId: string | null) => {
    if (!selectedTournament) return;

    setPicks(prevPicks => {
      const currentTournamentPicks = prevPicks[selectedTournament.id] || {};
      const newTournamentPicks = { ...currentTournamentPicks };

      if (pickedTeamId === null) {
        delete newTournamentPicks[matchId]; // Elimină alegerea pentru acest meci
      } else {
        newTournamentPicks[matchId] = pickedTeamId; // Setează sau actualizează alegerea
      }

      return {
        ...prevPicks,
        [selectedTournament.id]: newTournamentPicks,
      };
    });
  };

  async function savePicks() {
    if (!user || !selectedTournament) return;

    try {
      const { error } = await supabase
        .from('user_data')
        .update({ picks: picks }) // Salvează întregul obiect 'picks' din starea aplicației
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
        <div className="text-white text-xl">Niciun turneu activ</div>
      </div>
    );
  }

  // Obține alegerile pentru turneul curent, sau un obiect gol dacă nu există
  const currentTournamentPicks = picks[selectedTournament.id] || {};

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white flex items-center gap-3 mb-2">
                <Trophy className="w-10 h-10 text-yellow-500" />
                {selectedTournament.name}
              </h1>
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

      <div className="px-6 py-4 flex-grow overflow-auto">
        {selectedTournament.stage === 'playoffs' ? (
          <BracketView
            tournament={selectedTournament}
            userPicks={currentTournamentPicks}
            onPicksChange={handleTournamentPickChange} // Transmite noul handler
            lockedRounds={selectedTournament.locked_rounds || []}
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