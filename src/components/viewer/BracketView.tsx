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
  const bracketMatches: BracketMatch[] = (tournament.bracket_data as any)?.matches || [];
  const allTeams: Team[] = tournament.teams || [];

  const matchCardHeight = 180; // Height of ViewerBracketMatchCard
  const matchCardGap = 32; // From space-y-8
  const slotHeight = matchCardHeight + matchCardGap; // Total vertical space for one match slot (212px)

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

  // Calculates the marginTop for a column of match cards
  const getColumnMarginTop = (roundName: string) => {
    switch (roundName) {
      case 'round_of_16': return 'mt-0';
      case 'quarterfinals': return `mt-[${slotHeight / 2}px]`; // Top of QF column aligns with middle of R16 first match
      case 'semifinals': return `mt-[${slotHeight * 1.5}px]`; // Top of SF column aligns with middle of QF first match
      case 'finals': return `mt-[${slotHeight * 2.5}px]`; // Top of Finals column aligns with middle of SF first match
      case 'third_place': return `mt-[${slotHeight / 2}px]`; // Aligns with Quarterfinals
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

  // Function to render a column of connectors
  const renderConnectorColumn = (roundIndex: number, isLeftBranch: boolean, numMatchesInPreviousRound: number) => {
    if (numMatchesInPreviousRound === 0) return null;

    const numConnectors = numMatchesInPreviousRound / 2;
    const connectors = [];
    for (let i = 0; i < numConnectors; i++) {
      connectors.push(
        <BracketRoundConnector
          key={i}
          isLeftBranch={isLeftBranch}
          slotHeight={slotHeight}
        />
      );
    }

    // Calculate marginTop for the connector column
    let connectorColumnMarginTop = 0;
    if (roundIndex === 0) { // R16 -> QF
      connectorColumnMarginTop = matchCardHeight / 2; // Aligns top of connector column with center of first R16 match
    } else if (roundIndex === 1) { // QF -> SF
      connectorColumnMarginTop = matchCardHeight / 2 + slotHeight; // Aligns top of connector column with center of first QF match
    } else if (roundIndex === 2) { // SF -> Finals
      connectorColumnMarginTop = matchCardHeight / 2 + slotHeight * 2; // Aligns top of connector column with center of first SF match
    }

    return (
      <div className={`flex flex-col items-center`} style={{ marginTop: `${connectorColumnMarginTop}px` }}>
        {connectors}
      </div>
    );
  };

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex justify-start min-w-[1900px] p-4 gap-x-[1.7rem]"> {/* Updated gap-x to 1.7rem */}

        {/* Left Side Rounds (R16, QF, SF) */}
        {hasR16 && r16Matches.left.length > 0 && (
          <div className={`flex flex-col items-center ${getColumnMarginTop('round_of_16')}`}>
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
        {hasR16 && hasQF && r16Matches.left.length > 0 && qfMatches.left.length > 0 && (
          renderConnectorColumn(0, true, r16Matches.left.length)
        )}

        {hasQF && qfMatches.left.length > 0 && (
          <div className={`flex flex-col items-center ${getColumnMarginTop('quarterfinals')}`}>
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
        {hasQF && hasSF && qfMatches.left.length > 0 && sfMatches.left.length > 0 && (
          renderConnectorColumn(1, true, qfMatches.left.length)
        )}

        {hasSF && sfMatches.left.length > 0 && (
          <div className={`flex flex-col items-center ${getColumnMarginTop('semifinals')}`}>
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
        {hasSF && hasFinals && sfMatches.left.length > 0 && finalsMatches.length > 0 && (
          renderConnectorColumn(2, true, sfMatches.left.length)
        )}

        {/* 3rd Place Match (Moved here, before Finals) */}
        {hasThirdPlace && thirdPlaceMatches.length > 0 && (
          <div className={`flex flex-col items-center ${getColumnMarginTop('third_place')}`}>
            <h3 className="text-xl font-bold text-white mb-6 text-center whitespace-nowrap">
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
          </div>
        )}

        {/* Middle (Finals) */}
        {hasFinals && finalsMatches.length > 0 && (
          <div className={`flex flex-col items-center ${getColumnMarginTop('finals')}`}>
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
          </div>
        )}

        {hasSF && hasFinals && sfMatches.right.length > 0 && finalsMatches.length > 0 && (
          renderConnectorColumn(2, false, sfMatches.right.length)
        )}
        {/* Right Side Rounds (SF, QF, R16) */}
        {hasSF && sfMatches.right.length > 0 && (
          <div className={`flex flex-col items-center ${getColumnMarginTop('semifinals')}`}>
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
        {hasQF && hasSF && qfMatches.right.length > 0 && sfMatches.right.length > 0 && (
          renderConnectorColumn(1, false, qfMatches.right.length)
        )}
        {hasQF && qfMatches.right.length > 0 && (
          <div className={`flex flex-col items-center ${getColumnMarginTop('quarterfinals')}`}>
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
        {hasR16 && hasQF && r16Matches.right.length > 0 && qfMatches.right.length > 0 && (
          renderConnectorColumn(0, false, r16Matches.right.length)
        )}
        {hasR16 && r16Matches.right.length > 0 && (
          <div className={`flex flex-col items-center ${getColumnMarginTop('round_of_16')}`}>
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
  );
}