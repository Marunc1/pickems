import React from 'react';
import { type Tournament, type Team } from '../../lib/supabase';
import ViewerBracketMatchCard from './ViewerBracketMatchCard'; // Import the new component

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
      case 'finals': return 'Final';
      case 'third_place': return '3rd Place Match';
      default: return round;
    }
  }

  const roundsToDisplay = [];
  if (bracketMatches.some(m => m.round === 'round_of_16')) roundsToDisplay.push('round_of_16');
  if (bracketMatches.some(m => m.round === 'quarterfinals')) roundsToDisplay.push('quarterfinals');
  if (bracketMatches.some(m => m.round === 'semifinals')) roundsToDisplay.push('semifinals');
  if (bracketMatches.some(m => m.round === 'finals')) roundsToDisplay.push('finals');
  if (bracketMatches.some(m => m.round === 'third_place')) roundsToDisplay.push('third_place');


  if (bracketMatches.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400 text-lg">
        Bracket not yet initialized by admin. Check back later!
      </div>
    );
  }

  // Calculate vertical offsets for each round to create the cascading effect
  const getMarginTop = (roundName: string, index: number) => {
    switch (roundName) {
      case 'round_of_16': return 'mt-0'; // No offset for the first round
      case 'quarterfinals': return index % 2 === 0 ? 'mt-[100px]' : 'mt-[100px]'; // Adjust based on card height and spacing
      case 'semifinals': return index % 2 === 0 ? 'mt-[200px]' : 'mt-[200px]';
      case 'finals': return 'mt-[300px]';
      case 'third_place': return 'mt-[300px]'; // Align with finals or slightly below
      default: return 'mt-0';
    }
  };

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex justify-center min-w-max p-4">
        {roundsToDisplay.map((round, roundIndex) => {
          const roundMatches = getRoundMatches(round);
          if (roundMatches.length === 0) return null;

          return (
            <div key={round} className={`flex flex-col items-center mx-4 ${round === 'third_place' ? 'ml-12' : ''}`}>
              <h3 className="text-xl font-bold text-white mb-6 text-center whitespace-nowrap">
                {getRoundName(round)}
              </h3>
              <div className="flex flex-col space-y-8"> {/* Space between matches in a column */}
                {roundMatches.map((match, matchIndex) => (
                  <div key={match.id} className={`${getMarginTop(round, matchIndex)}`}>
                    <ViewerBracketMatchCard
                      match={match}
                      teams={allTeams}
                      userPick={userPicks[match.id]}
                      onPick={(pickedTeamId) => onPicksChange({ ...userPicks, [match.id]: pickedTeamId })}
                      getTeamById={getTeamById}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}