import React from 'react';
import { type Tournament, type Team } from '../../lib/supabase';
import ViewerBracketMatchCard from './ViewerBracketMatchCard';
import { Lock } from 'lucide-react';

interface BracketMatch {
  id: string;
  team1_id?: string;
  team2_id?: string;
  round: string;
  match_number: number;
  next_match_id?: string;
  winner_id?: string;
}

interface BracketViewProps {
  tournament: Tournament;
  userPicks: { [matchId: string]: string };
  onPicksChange: (matchId: string, pickedTeamId: string | null) => void; // Semnătură modificată
  lockedRounds: string[];
}

export default function BracketView({ tournament, userPicks, onPicksChange, lockedRounds }: BracketViewProps) {
  const bracket = (tournament.bracket_data as any)?.matches || [];
  const teams = tournament.teams || [];

  // Constante pentru layout
  const matchCardHeight = 80;
  const matchCardWidth = 192;
  const horizontalGap = 20;
  const baseVerticalMatchSpacing = 30;

  function getTeamById(id?: string) {
    if (!id) return null;
    return teams.find((t: Team) => t.id === id);
  }

  function getRoundMatches(roundName: string) {
    return bracket.filter((m: BracketMatch) => m.round === roundName).sort((a, b) => a.match_number - b.match_number);
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

  // Determină rundele principale pentru structura bracket-ului
  const mainRounds = [];
  const numTeams = teams.length;
  if (numTeams > 8) mainRounds.push('round_of_16');
  if (numTeams > 4) mainRounds.push('quarterfinals');
  if (numTeams > 2) mainRounds.push('semifinals');

  // Pregătește coloanele pentru părțile stângă, centrală și dreaptă ale bracket-ului
  const leftColumns: { roundName: string; half: 'left' }[] = mainRounds.map(round => ({ roundName: round, half: 'left' }));
  const rightColumns: { roundName: string; half: 'right' }[] = [...mainRounds].reverse().map(round => ({ roundName: round, half: 'right' }));

  const centerColumns: { roundName: string; half?: undefined }[] = [];
  if (numTeams > 0) {
    centerColumns.push({ roundName: 'finals' });
  }
  if (numTeams >= 4) {
    centerColumns.push({ roundName: 'third_place' });
  }

  // Funcție ajutătoare pentru a obține meciurile pentru o anumită rundă și jumătate
  function getMatchesForDisplay(roundName: string, half?: 'left' | 'right') {
    const allMatches = bracket.filter((m: BracketMatch) => m.round === roundName).sort((a, b) => a.match_number - b.match_number);
    if (!half) {
      return allMatches;
    }
    const midPoint = allMatches.length / 2;
    if (half === 'left') {
      return allMatches.slice(0, midPoint);
    } else {
      return allMatches.slice(midPoint);
    }
  }

  // Prop-ul onPicksChange este acum transmis direct
  const handlePickChange = (matchId: string, pickedTeamId: string | null) => {
    onPicksChange(matchId, pickedTeamId);
  };

  // Funcție pentru a obține proprietățile de layout vertical pentru un card de meci în cadrul rundei sale
  const getMatchVerticalLayout = (roundName: string) => {
    let level = 0;
    let effectiveVerticalSpacing = baseVerticalMatchSpacing;

    switch (roundName) {
      case 'finals': level = 0; break;
      case 'semifinals': level = 1; break;
      case 'quarterfinals': level = 2; break;
      case 'round_of_16': 
        level = 3; 
        effectiveVerticalSpacing = 10;
        break;
      case 'third_place': return { marginTop: 0, marginBottom: 0, gapBetweenPairedMatches: 0 };
    }

    const totalVerticalSpacePerMatchSlot = matchCardHeight + (effectiveVerticalSpacing * (2 ** level - 1));
    
    const marginTop = (totalVerticalSpacePerMatchSlot - matchCardHeight) / 2;
    const marginBottom = marginTop;

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

                const isRoundLocked = lockedRounds.includes(col.roundName);

                return (
                  <div
                    key={`${col.roundName}-${col.half || 'full'}`}
                    className="flex flex-col justify-center items-center"
                    style={{ marginRight: colIndex < allDisplayColumns.length - 1 ? `${horizontalGap}px` : '0px' }}
                  >
                    <h3 className="text-sm font-semibold text-white mb-2 text-center flex items-center gap-1">
                      {getRoundName(col.roundName)}
                      {isRoundLocked && <Lock className="w-3 h-3 text-red-400" />}
                    </h3>
                    {roundMatches.map((match: BracketMatch) => {
                      const { marginTop, marginBottom } = getMatchVerticalLayout(col.roundName);
                      return (
                        <div key={match.id} style={{ marginTop: `${marginTop}px`, marginBottom: `${marginBottom}px` }} className="relative">
                          <ViewerBracketMatchCard
                            match={match}
                            teams={teams}
                            userPick={userPicks[match.id]}
                            onPick={handlePickChange} // Transmite noul handler
                            getTeamById={getTeamById}
                            isLocked={isRoundLocked}
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