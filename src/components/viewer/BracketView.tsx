import React from 'react';
import { type Tournament, type Team } from '../../lib/supabase';
import ViewerBracketMatchCard from './ViewerBracketMatchCard';
import BracketRoundConnector from './BracketRoundConnector';

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
  userPicks: { [matchId: string]: string };
  onPicksChange: (newPicks: { [matchId: string]: string }) => void;
}

export default function BracketView({ tournament, userPicks, onPicksChange }: BracketViewProps) {
  const bracket = (tournament.bracket_data as any)?.matches || [];
  const teams = tournament.teams || [];

  function getTeamById(id?: string) {
    if (!id) return null;
    return teams.find((t: Team) => t.id === id);
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
  const numTeams = teams.length;
  if (numTeams > 8) roundsToDisplay.push('round_of_16');
  if (numTeams > 4) roundsToDisplay.push('quarterfinals');
  if (numTeams > 2) roundsToDisplay.push('semifinals');
  if (numTeams > 0) roundsToDisplay.push('finals');
  if (numTeams >= 4) roundsToDisplay.push('third_place');

  // Calculate slot height for connectors based on new card size and spacing
  const matchCardHeight = 60; // from ViewerBracketMatchCard.tsx
  const matchSpacing = 4; // from space-y-1 (0.25rem = 4px)
  const slotHeight = matchCardHeight + matchSpacing; 

  const handlePickChange = (matchId: string, pickedTeamId: string) => {
    const newPicks = { ...userPicks, [matchId]: pickedTeamId };
    onPicksChange(newPicks);
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
      {bracket.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-400 text-lg mb-4">Bracket not initialized for this tournament.</p>
          <p className="text-slate-500 text-sm">Please contact an administrator to set up the bracket.</p>
        </div>
      ) : (
        <div className="overflow-x-auto max-h-[700px] overflow-y-auto"> {/* Added max-h and overflow-y-auto */}
          <div className="flex gap-3 min-w-max"> {/* Reduced gap between rounds */}
            {roundsToDisplay.map((round, roundIndex) => {
              const roundMatches = getRoundMatches(round);
              if (roundMatches.length === 0) return null;

              return (
                <React.Fragment key={round}>
                  <div className="flex-shrink-0">
                    <h3 className="text-xl font-bold text-white mb-4 text-center">
                      {getRoundName(round)}
                    </h3>
                    <div className="space-y-1"> {/* Reduced space-y between matches */}
                      {roundMatches.map((match) => (
                        <ViewerBracketMatchCard
                          key={match.id}
                          match={match}
                          teams={teams}
                          userPick={userPicks[match.id]}
                          onPick={(pickedTeamId) => handlePickChange(match.id, pickedTeamId)}
                          getTeamById={getTeamById}
                        />
                      ))}
                    </div>
                  </div>
                  {/* Add connectors between rounds, but not after the last round */}
                  {roundIndex < roundsToDisplay.length - 1 && (
                    <div className="flex items-center justify-center">
                      <BracketRoundConnector isLeftBranch={true} slotHeight={slotHeight} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}