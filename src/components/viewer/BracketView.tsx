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

  const getColumnMarginTop = (roundName: string) => {
    // Assuming ViewerBracketMatchCard has a height of ~120px and space-y-8 (32px)
    // Total slot height = 120 + 32 = 152px
    switch (roundName) {
      case 'round_of_16': return 'mt-0';
      case 'quarterfinals': return 'mt-[76px]'; // Half of 152px
      case 'semifinals': return 'mt-[152px]'; // 1 * 152px
      case 'finals': return 'mt-[228px]'; // 1.5 * 152px
      case 'third_place': return 'mt-[228px]'; // Same as finals for alignment
      default: return 'mt-0';
    }
  };

  if (bracketMatches.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400 text-lg">
        Bracket not yet initialized by admin. Check back later!
      </div>
    );
  }

  // Helper to split matches for left/right sides
  const splitMatchesForRound = (roundName: string) => {
    const matches = getRoundMatches(roundName);
    const mid = Math.ceil(matches.length / 2);
    return { left: matches.slice(0, mid), right: matches.slice(mid) };
  };

  const r16Matches = splitMatchesForRound('round_of_16');
  const qfMatches = splitMatchesForRound('quarterfinals');
  const sfMatches = splitMatchesForRound('semifinals');
  const finalsMatches = getRoundMatches('finals');
  const thirdPlaceMatches = getRoundMatches('third_place');

  // Filter rounds that actually have matches to avoid rendering empty columns
  const hasR16 = bracketMatches.some(m => m.round === 'round_of_16');
  const hasQF = bracketMatches.some(m => m.round === 'quarterfinals');
  const hasSF = bracketMatches.some(m => m.round === 'semifinals');
  const hasFinals = bracketMatches.some(m => m.round === 'finals');
  const hasThirdPlace = bracketMatches.some(m => m.round === 'third_place');

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex justify-start min-w-max p-4"> {/* Changed justify-center to justify-start */}

        {/* Left Side */}
        <div className="flex flex-row-reverse items-start">
          {hasSF && sfMatches.left.length > 0 && (
            <div className={`flex flex-col items-center mx-2 ${getColumnMarginTop('semifinals')}`}>
              <h3 className="text-xl font-bold text-white mb-6 text-center whitespace-nowrap">
                {getRoundName('semifinals')}
              </h3>
              <div className="flex flex-col space-y-8">
                {sfMatches.left.map((match) => (
                  <ViewerBracketMatchCard
                    key={match.id}
                    match={match}
                    teams={allTeams}
                    userPick={userPicks[match.id]}
                    onPick={(pickedTeamId) => onPicksChange({ ...userPicks, [match.id]: pickedTeamId })}
                    getTeamById={getTeamById}
                  />
                ))}
              </div>
            </div>
          )}

          {hasQF && qfMatches.left.length > 0 && (
            <div className={`flex flex-col items-center mx-2 ${getColumnMarginTop('quarterfinals')}`}>
              <h3 className="text-xl font-bold text-white mb-6 text-center whitespace-nowrap">
                {getRoundName('quarterfinals')}
              </h3>
              <div className="flex flex-col space-y-8">
                {qfMatches.left.map((match) => (
                  <ViewerBracketMatchCard
                    key={match.id}
                    match={match}
                    teams={allTeams}
                    userPick={userPicks[match.id]}
                    onPick={(pickedTeamId) => onPicksChange({ ...userPicks, [match.id]: pickedTeamId })}
                    getTeamById={getTeamById}
                  />
                ))}
              </div>
            </div>
          )}

          {hasR16 && r16Matches.left.length > 0 && (
            <div className={`flex flex-col items-center mx-2 ${getColumnMarginTop('round_of_16')}`}>
              <h3 className="text-xl font-bold text-white mb-6 text-center whitespace-nowrap">
                {getRoundName('round_of_16')}
              </h3>
              <div className="flex flex-col space-y-8">
                {r16Matches.left.map((match) => (
                  <ViewerBracketMatchCard
                    key={match.id}
                    match={match}
                    teams={allTeams}
                    userPick={userPicks[match.id]}
                    onPick={(pickedTeamId) => onPicksChange({ ...userPicks, [match.id]: pickedTeamId })}
                    getTeamById={getTeamById}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Middle (Finals & 3rd Place) */}
        <div className={`flex flex-col items-center mx-2 ${getColumnMarginTop('finals')}`}>
          {hasFinals && finalsMatches.length > 0 && (
            <>
              <h3 className="text-xl font-bold text-white mb-6 text-center whitespace-nowrap">
                {getRoundName('finals')}
              </h3>
              <div className="flex flex-col space-y-8">
                {finalsMatches.map((match) => (
                  <ViewerBracketMatchCard
                    key={match.id}
                    match={match}
                    teams={allTeams}
                    userPick={userPicks[match.id]}
                    onPick={(pickedTeamId) => onPicksChange({ ...userPicks, [match.id]: pickedTeamId })}
                    getTeamById={getTeamById}
                  />
                ))}
              </div>
            </>
          )}
          {hasThirdPlace && thirdPlaceMatches.length > 0 && (
            <>
              <h3 className="text-xl font-bold text-white mt-8 mb-6 text-center whitespace-nowrap">
                {getRoundName('third_place')}
              </h3>
              <div className="flex flex-col space-y-8">
                {thirdPlaceMatches.map((match) => (
                  <ViewerBracketMatchCard
                    key={match.id}
                    match={match}
                    teams={allTeams}
                    userPick={userPicks[match.id]}
                    onPick={(pickedTeamId) => onPicksChange({ ...userPicks, [match.id]: pickedTeamId })}
                    getTeamById={getTeamById}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right Side */}
        <div className="flex items-start">
          {hasSF && sfMatches.right.length > 0 && (
            <div className={`flex flex-col items-center mx-2 ${getColumnMarginTop('semifinals')}`}>
              <h3 className="text-xl font-bold text-white mb-6 text-center whitespace-nowrap">
                {getRoundName('semifinals')}
              </h3>
              <div className="flex flex-col space-y-8">
                {sfMatches.right.map((match) => (
                  <ViewerBracketMatchCard
                    key={match.id}
                    match={match}
                    teams={allTeams}
                    userPick={userPicks[match.id]}
                    onPick={(pickedTeamId) => onPicksChange({ ...userPicks, [match.id]: pickedTeamId })}
                    getTeamById={getTeamById}
                  />
                ))}
              </div>
            </div>
          )}

          {hasQF && qfMatches.right.length > 0 && (
            <div className={`flex flex-col items-center mx-2 ${getColumnMarginTop('quarterfinals')}`}>
              <h3 className="text-xl font-bold text-white mb-6 text-center whitespace-nowrap">
                {getRoundName('quarterfinals')}
              </h3>
              <div className="flex flex-col space-y-8">
                {qfMatches.right.map((match) => (
                  <ViewerBracketMatchCard
                    key={match.id}
                    match={match}
                    teams={allTeams}
                    userPick={userPicks[match.id]}
                    onPick={(pickedTeamId) => onPicksChange({ ...userPicks, [match.id]: pickedTeamId })}
                    getTeamById={getTeamById}
                  />
                ))}
              </div>
            </div>
          )}

          {hasR16 && r16Matches.right.length > 0 && (
            <div className={`flex flex-col items-center mx-2 ${getColumnMarginTop('round_of_16')}`}>
              <h3 className="text-xl font-bold text-white mb-6 text-center whitespace-nowrap">
                {getRoundName('round_of_16')}
              </h3>
              <div className="flex flex-col space-y-8">
                {r16Matches.right.map((match) => (
                  <ViewerBracketMatchCard
                    key={match.id}
                    match={match}
                    teams={allTeams}
                    userPick={userPicks[match.id]}
                    onPick={(pickedTeamId) => onPicksChange({ ...userPicks, [match.id]: pickedTeamId })}
                    getTeamById={getTeamById}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}