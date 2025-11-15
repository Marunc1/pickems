import React from 'react';
import { Trophy, ArrowRight, CheckCircle } from 'lucide-react';
import { type Tournament, type Team } from '../../lib/supabase';

// Re-define BracketMatch interface for consistency, without admin-specific fields
interface BracketMatch {
  id: string;
  team1_id?: string;
  team2_id?: string;
  round: string;
  match_number: number;
  next_match_id?: string;
}

interface BracketViewProps {
  tournament: Tournament;
  userPicks: { [matchId: string]: string }; // { matchId: pickedTeamId }
  onPicksChange: (newPicks: { [matchId: string]: string }) => void;
}

export default function BracketView({ tournament, userPicks, onPicksChange }: BracketViewProps) {
  const bracketMatches: BracketMatch[] = (tournament.bracket_data as any)?.matches || [];
  const allTeams: Team[] = tournament.teams || [];

  function getTeamById(id?: string) {
    if (!id) return null;
    return allTeams.find((t: Team) => t.id === id);
  }

  function getRoundMatches(roundName: string) {
    return bracketMatches.filter(m => m.round === roundName).sort((a, b) => a.match_number - b.match_number);
  }

  function getRoundName(round: string) {
    switch (round) {
      case 'round_of_16': return 'Round of 16';
      case 'quarterfinals': return 'Quarter Finals';
      case 'semifinals': return 'Semi Finals';
      case 'finals': return 'Finals';
      default: return round;
    }
  }

  const roundsToDisplay = [];
  // Determine which rounds to display based on the matches available in bracket_data
  if (bracketMatches.some(m => m.round === 'round_of_16')) roundsToDisplay.push('round_of_16');
  if (bracketMatches.some(m => m.round === 'quarterfinals')) roundsToDisplay.push('quarterfinals');
  if (bracketMatches.some(m => m.round === 'semifinals')) roundsToDisplay.push('semifinals');
  if (bracketMatches.some(m => m.round === 'finals')) roundsToDisplay.push('finals');

  if (bracketMatches.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400 text-lg">
        Bracket not yet initialized by admin. Check back later!
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-8 min-w-max justify-center">
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
                  <ViewerBracketMatchCard
                    key={match.id}
                    match={match}
                    teams={allTeams} // Pass all teams to resolve names
                    userPick={userPicks[match.id]}
                    onPick={(pickedTeamId) => onPicksChange({ ...userPicks, [match.id]: pickedTeamId })}
                    getTeamById={getTeamById}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface ViewerBracketMatchCardProps {
  match: BracketMatch;
  teams: Team[];
  userPick?: string; // The team ID picked by the user for this match
  onPick: (pickedTeamId: string) => void;
  getTeamById: (id?: string) => Team | null;
}

function ViewerBracketMatchCard({ match, teams, userPick, onPick, getTeamById }: ViewerBracketMatchCardProps) {
  const team1 = getTeamById(match.team1_id);
  const team2 = getTeamById(match.team2_id);

  const handlePick = (teamId: string) => {
    // If the same team is clicked again, unselect it
    if (userPick === teamId) {
      onPick(''); // Clear pick
    } else {
      onPick(teamId);
    }
  };

  const isTeam1Picked = userPick === match.team1_id;
  const isTeam2Picked = userPick === match.team2_id;

  return (
    <div className="bg-slate-700 rounded-lg p-4 w-80 border-2 border-slate-600 hover:border-slate-500 transition-colors">
      <div className="text-slate-400 text-xs font-semibold mb-3 text-center">
        Match {match.match_number}
      </div>

      <div className="space-y-3">
        <div
          className={`flex items-center justify-between p-3 rounded cursor-pointer ${
            isTeam1Picked ? 'bg-blue-800/40 border-2 border-blue-500' : 'bg-slate-600 hover:bg-slate-500'
          } ${!match.team1_id ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => match.team1_id && handlePick(match.team1_id)}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{team1?.logo || '❓'}</span>
            <h3 className="text-white font-semibold">{team1?.name || 'TBD'}</h3>
          </div>
          {isTeam1Picked && <CheckCircle className="w-5 h-5 text-blue-400" />}
        </div>

        <div className="flex justify-center">
          <span className="text-slate-400 text-sm font-semibold">VS</span>
        </div>

        <div
          className={`flex items-center justify-between p-3 rounded cursor-pointer ${
            isTeam2Picked ? 'bg-blue-800/40 border-2 border-blue-500' : 'bg-slate-600 hover:bg-slate-500'
          } ${!match.team2_id ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => match.team2_id && handlePick(match.team2_id)}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{team2?.logo || '❓'}</span>
            <h3 className="text-white font-semibold">{team2?.name || 'TBD'}</h3>
          </div>
          {isTeam2Picked && <CheckCircle className="w-5 h-5 text-blue-400" />}
        </div>
      </div>

      {userPick && (
        <div className="mt-3 pt-3 border-t border-slate-600">
          <div className="flex items-center justify-center gap-2 text-blue-400 font-semibold text-sm">
            <Trophy className="w-4 h-4" />
            Your Pick: {getTeamById(userPick)?.name}
          </div>
        </div>
      )}
    </div>
  );
}