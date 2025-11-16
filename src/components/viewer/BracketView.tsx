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
  const horizontalGap = 20; // Space between round columns
  const baseVerticalMatchSpacing = 20; // Base vertical space between match cards for higher rounds (increased from 10)

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

  // Determine main rounds for the bracket structure
  const mainRounds = [];
  const numTeams = teams.length;
  if (numTeams > 8) mainRounds.push('round_of_16');
  if (numTeams > 4) mainRounds.push('quarterfinals');
  if (numTeams > 2) mainRounds.push('semifinals');

  // Prepare columns for left, center, and right parts of the bracket
  const leftColumns: { roundName: string; half: 'left' }[] = mainRounds.map(round => ({ roundName: round, half: 'left' }));
  const rightColumns: { roundName: string; half: 'right' }[] = [...mainRounds].reverse().map(round => ({ roundName: round, half: 'right' }));

  const centerColumns: { roundName: string; half?: undefined }[] = [];
  if (numTeams > 0) {
    centerColumns.push({ roundName: 'finals' });
  }
  if (numTeams >= 4) {
    centerColumns.push({ roundName: 'third_place' });
  }

  // Helper to get matches for a specific round and half
  function getMatchesForDisplay(roundName: string, half?: 'left' | 'right') {
    const allMatches = bracket.filter(m => m.round === roundName).sort((a, b) => a.match_number - b.match_number);
    if (!half) { // No half specified, return all matches (e.g., for finals, third_place)
      return allMatches;
    }
    const midPoint = allMatches.length / 2;
    if (half === 'left') {
      return allMatches.slice(0, midPoint);
    } else {
      return allMatches.slice(midPoint);
    }
  }

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
        effectiveVerticalSpacing = 5; // Smaller spacing for Round of 16 (increased from 2)
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

  const allDisplayColumns = [...leftColumns, ...centerColumns, ...rightColumns];

  return (
    <div className="">
      {bracket.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-400 text-lg mb-4">Bracket not initialized for this tournament.</p>
          <p className="text-slate-500 text-sm">Please contact an administrator to set up the bracket.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="w-full flex justify-center">
            <div className="flex relative">
              {allDisplayColumns.map((col, colIndex) => {
                const roundMatches = col.half ? getMatchesForDisplay(col.roundName, col.half) : getMatchesForDisplay(col.roundName);
                if (roundMatches.length === 0) return null;
                return (
                  <div
                    key={`${col.roundName}-${col.half || 'full'}`}
                    className="flex flex-col justify-center items-center"
                    style={{ marginRight: colIndex < allDisplayColumns.length - 1 ? `${horizontalGap}px` : '0px' }}
                  >
                    <h3 className="text-sm font-semibold text-white mb-2 text-center">
                      {getRoundName(col.roundName)}
                    </h3>
                    {roundMatches.map((match) => {
                      const { marginTop, marginBottom } = getMatchVerticalLayout(col.roundName);
                      return (
                        <div key={match.id} style={{ marginTop: `${marginTop}px`, marginBottom: `${marginBottom}px` }} className="relative">
                          <ViewerBracketMatchCard
                            match={match}
                            teams={teams}
                            userPick={userPicks[match.id]}
                            onPick={(pickedTeamId) => handlePickChange(match.id, pickedTeamId)}
                            getTeamById={getTeamById}
                          />
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}