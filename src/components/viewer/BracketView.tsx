import React from 'react';
import { type Tournament, type Team } from '../../lib/supabase';
import ViewerBracketMatchCard from './ViewerBracketMatchCard';

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

  // Constants for layout
  const matchCardHeight = 80; // from ViewerBracketMatchCard.tsx
  const matchCardWidth = 160; // from ViewerBracketMatchCard.tsx
  const horizontalGap = 40; // Space between round columns
  const baseVerticalMatchSpacing = 20; // Base vertical space between match cards for higher rounds

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

  const handlePickChange = (matchId: string, pickedTeamId: string) => {
    const newPicks = { ...userPicks, [matchId]: pickedTeamId };
    onPicksChange(newPicks);
  };

  // Function to get the vertical layout properties for a match card within its round
  const getMatchVerticalLayout = (roundName: string) => {
    let level = 0; // 0 for Finals, 1 for Semis, 2 for QF, 3 for R16
    let effectiveVerticalSpacing = baseVerticalMatchSpacing; // Default global spacing

    switch (roundName) {
      case 'finals': level = 0; break;
      case 'semifinals': level = 1; break;
      case 'quarterfinals': level = 2; break;
      case 'round_of_16': 
        level = 3; 
        effectiveVerticalSpacing = 5; // Smaller spacing for Round of 16
        break;
      case 'third_place': return { marginTop: 0, marginBottom: 0, gapBetweenPairedMatches: 0 }; // Special case
    }

    // The total vertical space a match "slot" occupies, including its own height and half the gap above/below
    const totalVerticalSpacePerMatchSlot = matchCardHeight + (effectiveVerticalSpacing * (2 ** level - 1));
    
    const marginTop = (totalVerticalSpacePerMatchSlot - matchCardHeight) / 2;
    const marginBottom = marginTop;

    // The actual gap between two *paired* matches that feed into the next round
    // This is the space between the bottom of the first card and the top of the second card in a pair
    const gapBetweenPairedMatches = effectiveVerticalSpacing * (2 ** level - 1);

    return { marginTop, marginBottom, gapBetweenPairedMatches };
  };

  // Calculate the total height needed for the bracket to center it
  const maxRoundMatches = Math.max(...roundsToDisplay.map(round => getRoundMatches(round).length));
  // This calculation uses baseVerticalMatchSpacing for overall height estimation
  const totalBracketHeight = (matchCardHeight + baseVerticalMatchSpacing * (2 ** (roundsToDisplay.length - 1) - 1)) * maxRoundMatches / 2;


  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
      {bracket.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-400 text-lg mb-4">Bracket not initialized for this tournament.</p>
          <p className="text-slate-500 text-sm">Please contact an administrator to set up the bracket.</p>
        </div>
      ) : (
        <div className="overflow-x-auto max-h-[700px] overflow-y-auto">
          <div className="w-full flex justify-center">
            <div className="flex relative" style={{ minHeight: `${totalBracketHeight}px` }}>
              {roundsToDisplay.map((round, roundIndex) => {
                const roundMatches = getRoundMatches(round);
                if (roundMatches.length === 0) return null;

                return (
                  <React.Fragment key={round}>
                    <div className="flex flex-col justify-center items-center" style={{ marginRight: `${horizontalGap}px` }}>
                      <h3 className="text-sm font-semibold text-white mb-2 text-center">
                        {getRoundName(round)}
                      </h3>
                      {roundMatches.map((match, matchIndex) => {
                        const { marginTop, marginBottom } = getMatchVerticalLayout(round);
                        return (
                          <div key={match.id} style={{ marginTop: `${marginTop}px`, marginBottom: `${marginBottom}px` }} className="relative">
                            <ViewerBracketMatchCard
                              match={match}
                              teams={teams}
                              userPick={userPicks[match.id]}
                              onPick={(pickedTeamId) => handlePickChange(match.id, pickedTeamId)}
                              getTeamById={getTeamById}
                            />
                            {/* Outgoing horizontal line from match card */}
                            {roundIndex < roundsToDisplay.length - 1 && (
                              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-[2px] bg-slate-600"></div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {/* Vertical connecting lines between rounds */}
                    {roundIndex < roundsToDisplay.length - 1 && (
                      <div className="absolute top-0 bottom-0" style={{ left: `${(roundIndex + 1) * (matchCardWidth + horizontalGap) - horizontalGap / 2}px` }}>
                        {roundMatches.map((match, matchIndex) => {
                          const { marginTop: cardMarginTop, gapBetweenPairedMatches } = getMatchVerticalLayout(round);
                          
                          // Only draw vertical line if this match is the first of a pair feeding into the next round
                          if (matchIndex % 2 === 0) {
                            const startY = cardMarginTop + matchCardHeight / 2; // Center of the first match card in the pair
                            const endY = startY + matchCardHeight + gapBetweenPairedMatches; // Center of the second match card in the pair

                            const height = endY - startY;

                            return (
                              <div
                                key={`v-line-${match.id}`}
                                className="absolute left-0 bg-slate-600 w-[2px]"
                                style={{ top: `${startY}px`, height: `${height}px` }}
                              ></div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}