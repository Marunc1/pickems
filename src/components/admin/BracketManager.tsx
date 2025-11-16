import { useState, useEffect } from 'react';
import { supabase, type Tournament, type Team } from '../../lib/supabase';
import { Save, Trophy, ArrowRight } from 'lucide-react';
import { recalculateAllUserScores } from '../../api/scoreAPI'; // Import the new function

interface BracketMatch {
  id: string;
  team1_id?: string;
  team2_id?: string;
  team1_score: number;
  team2_score: number;
  winner_id?: string;
  round: string;
  match_number: number;
  next_match_id?: string;
}

interface BracketManagerProps {
  tournament: Tournament;
  onRefresh: () => void;
  eligibleTeams: Team[]; // Renamed from qualifiedTeams to eligibleTeams
}

export default function BracketManager({ tournament, onRefresh, eligibleTeams }: BracketManagerProps) {
  const [bracket, setBracket] = useState<BracketMatch[]>((tournament.bracket_data as any)?.matches || []);

  // Reset bracket state if tournament or eligibleTeams change
  useEffect(() => {
    setBracket((tournament.bracket_data as any)?.matches || []);
  }, [tournament.id, eligibleTeams]); // Depend on tournament.id and eligibleTeams

  function initializeBracket() {
    if (eligibleTeams.length === 0) {
      alert('No teams available to initialize the bracket. Please add teams to the tournament first.');
      return;
    }

    const newBracket: BracketMatch[] = [];
    const numTeams = eligibleTeams.length;

    const roundsConfig = [];
    if (numTeams > 8) { // For 9-16 teams, start with Round of 16
      roundsConfig.push({ name: 'round_of_16', matches: 8 });
    }
    if (numTeams > 4) { // For 5-8 teams, start with Quarterfinals
      roundsConfig.push({ name: 'quarterfinals', matches: 4 });
    }
    if (numTeams > 2) { // For 3-4 teams, start with Semifinals
      roundsConfig.push({ name: 'semifinals', matches: 2 });
    }
    if (numTeams > 0) { // For 1-2 teams, only Finals
      roundsConfig.push({ name: 'finals', matches: 1 });
    }
    
    // Add 3rd Place Match if there are at least 4 teams (implies semifinals)
    if (numTeams >= 4) {
      roundsConfig.push({ name: 'third_place', matches: 1 });
    }

    roundsConfig.forEach((round) => {
      for (let i = 0; i < round.matches; i++) {
        newBracket.push({
          id: `${round.name}_${i}`,
          match_number: i + 1,
          round: round.name,
          team1_score: 0,
          team2_score: 0
        });
      }
    });

    setBracket(newBracket);
  }

  function updateMatch(matchId: string, updates: Partial<BracketMatch>) {
    setBracket(bracket.map(m => {
      if (m.id === matchId) {
        const updated = { ...m, ...updates };
        
        // Logic for determining winner: first to 2 wins (rounds won)
        if (updated.team1_score >= 2 && updated.team1_score > updated.team2_score && updated.team1_id) {
          updated.winner_id = updated.team1_id;
        } else if (updated.team2_score >= 2 && updated.team2_score > updated.team1_score && updated.team2_id) {
          updated.winner_id = updated.team2_id;
        } else {
          updated.winner_id = undefined; // Clear winner if neither team has 2 wins or scores are tied
        }
        return updated;
      }
      return m;
    }));
  }

  async function saveBracket() {
    try {
      const { error } = await supabase
        .from('tournament_settings')
        .update({ bracket_data: { matches: bracket } })
        .eq('id', tournament.id);

      if (error) throw error;
      
      // Recalculate all user scores after bracket is saved
      await recalculateAllUserScores();

      onRefresh();
      alert('Bracket saved successfully and scores recalculated!');
    } catch (error) {
      console.error('Error saving bracket or recalculating scores:', error);
      alert('Error saving bracket or recalculating scores');
    }
  }

  // This getTeamById should now use tournament.teams to resolve team details
  function getTeamById(id?: string) {
    if (!id) return null;
    return tournament.teams?.find((t: Team) => t.id === id);
  }

  function getRoundMatches(roundName: string) {
    return bracket.filter(m => m.round === roundName).sort((a, b) => a.match_number - b.match_number);
  }

  function getRoundName(round: string) {
    switch (round) {
      case 'round_of_16': return 'Round of 16';
      case 'quarterfinals': return 'Quarter Finals';
      case 'semifinals': return 'Semi Finals';
      case 'finals': return 'Finals';
      case 'third_place': return '3rd Place Match';
      default: return round;
    }
  }

  const roundsToDisplay = [];
  if (eligibleTeams.length > 8) roundsToDisplay.push('round_of_16');
  if (eligibleTeams.length > 4) roundsToDisplay.push('quarterfinals');
  if (eligibleTeams.length > 2) roundsToDisplay.push('semifinals');
  if (eligibleTeams.length > 0) roundsToDisplay.push('finals');
  if (eligibleTeams.length >= 4) roundsToDisplay.push('third_place'); // Only show 3rd place if enough teams for semifinals


  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Bracket Manager
          </h2>
          <div className="flex gap-3">
            {bracket.length === 0 && (
              <button
                onClick={initializeBracket}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Initialize Bracket ({eligibleTeams.length} teams)
              </button>
            )}
            <button
              onClick={saveBracket}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save Bracket
            </button>
          </div>
        </div>

        {bracket.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg mb-4">No bracket created yet.</p>
            <p className="text-slate-500 text-sm">Click "Initialize Bracket" to create the playoff structure based on {eligibleTeams.length} tournament teams.</p>
            {eligibleTeams.length === 0 && (
              <p className="text-red-400 text-sm mt-2">No teams found. Please add teams in the Teams tab.</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="flex gap-8 min-w-max">
              {roundsToDisplay.map((round) => {
                const roundMatches = getRoundMatches(round);
                if (roundMatches.length === 0) return null;

                return (
                  <div key={round} className="flex-shrink-0">
                    <h3 className="text-xl font-bold text-white mb-4 text-center">
                      {getRoundName(round)}
                    </h3>
                    <div className="space-y-6">
                      {roundMatches.map((match) => (
                        <BracketMatchCard
                          key={match.id}
                          match={match}
                          teams={eligibleTeams} // Use eligibleTeams here
                          onUpdate={(updates) => updateMatch(match.id, updates)}
                          getTeamById={getTeamById}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-bold text-white mb-4">Tournament Teams ({eligibleTeams.length})</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {eligibleTeams.length === 0 ? (
            <p className="text-slate-400 col-span-full">No teams added yet. Add teams in the Teams tab.</p>
          ) : (
            eligibleTeams.map((team: Team) => (
              <div key={team.id} className="bg-slate-700 p-3 rounded-lg flex items-center gap-2">
                <span className="text-2xl">{team.logo}</span>
                <div>
                  <div className="text-white font-medium text-sm">{team.name}</div>
                  <div className="text-slate-400 text-xs">{team.region || 'N/A'}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function BracketMatchCard({
  match,
  teams,
  onUpdate,
  getTeamById
}: {
  match: BracketMatch;
  teams: Team[];
  onUpdate: (updates: Partial<BracketMatch>) => void;
  getTeamById: (id?: string) => Team | null;
}) {
  const team1 = getTeamById(match.team1_id);
  const team2 = getTeamById(match.team2_id);

  return (
    <div className="bg-slate-700 rounded-lg p-4 w-80 border-2 border-slate-600 hover:border-slate-500 transition-colors">
      <div className="text-slate-400 text-xs font-semibold mb-3 text-center">
        Match {match.match_number}
      </div>

      <div className="space-y-3">
        <div className={`flex items-center justify-between p-3 rounded ${
          match.winner_id === match.team1_id ? 'bg-green-900/30 border-2 border-green-600' : 'bg-slate-600'
        }`}>
          <select
            value={match.team1_id || ''}
            onChange={(e) => onUpdate({ team1_id: e.target.value })}
            className="flex-1 bg-slate-800 border border-slate-500 rounded px-2 py-1 text-white text-sm mr-2"
          >
            <option value="">Select Team 1</option>
            {teams.map((team: Team) => (
              <option key={team.id} value={team.id}>
                {team.logo} {team.name} {team.tag && `(${team.tag})`}
              </option>
            ))}
          </select>
          <input
            type="number"
            min="0"
            value={match.team1_score}
            onChange={(e) => onUpdate({ team1_score: parseInt(e.target.value) || 0 })}
            className="w-14 px-2 py-1 bg-slate-800 border border-slate-500 rounded text-white text-center font-bold"
          />
        </div>

        <div className="flex justify-center">
          <span className="text-slate-400 text-sm font-semibold">VS</span>
        </div>

        <div className={`flex items-center justify-between p-3 rounded ${
          match.winner_id === match.team2_id ? 'bg-green-900/30 border-2 border-green-600' : 'bg-slate-600'
        }`}>
          <select
            value={match.team2_id || ''}
            onChange={(e) => onUpdate({ team2_id: e.target.value })}
            className="flex-1 bg-slate-800 border border-slate-500 rounded px-2 py-1 text-white text-sm mr-2"
          >
            <option value="">Select Team 2</option>
            {teams.map((team: Team) => (
              <option key={team.id} value={team.id}>
                {team.logo} {team.name} {team.tag && `(${team.tag})`}
              </option>
            ))}
          </select>
          <input
            type="number"
            min="0"
            value={match.team2_score}
            onChange={(e) => onUpdate({ team2_score: parseInt(e.target.value) || 0 })}
            className="w-14 px-2 py-1 bg-slate-800 border border-slate-500 rounded text-white text-center font-bold"
          />
        </div>
      </div>

      {match.winner_id && (
        <div className="mt-3 pt-3 border-t border-slate-600">
          <div className="flex items-center justify-center gap-2 text-green-400 font-semibold text-sm">
            <Trophy className="w-4 h-4" />
            Winner: {getTeamById(match.winner_id)?.name}
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      )}
    </div>
  );
}