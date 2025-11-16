import React from 'react';
import { Trophy } from 'lucide-react';
import { type Team } from '../../lib/supabase';

interface BracketMatch {
  id: string;
  team1_id?: string;
  team2_id?: string;
  round: string;
  match_number: number;
  next_match_id?: string;
  winner_id?: string; // Added winner_id to BracketMatch interface
}

interface ViewerBracketMatchCardProps {
  match: BracketMatch;
  teams: Team[];
  userPick?: string; // The team ID picked by the user for this match
  onPick: (pickedTeamId: string) => void;
  getTeamById: (id?: string) => Team | null;
}

export default function ViewerBracketMatchCard({ match, teams, userPick, onPick, getTeamById }: ViewerBracketMatchCardProps) {
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

  const isTeam1Selectable = !!match.team1_id;
  const isTeam2Selectable = !!match.team2_id;

  // Determine if the match is completed and if the pick is correct/incorrect
  const isMatchCompleted = !!match.winner_id;
  const isPickCorrect = isMatchCompleted && userPick === match.winner_id;
  const isPickIncorrect = isMatchCompleted && userPick && userPick !== match.winner_id;

  // Conditional classes for team 1
  const team1Classes = `flex items-center justify-center py-1 px-2 rounded-sm transition-colors duration-150 ${
    isTeam1Selectable ? 'cursor-pointer hover:bg-slate-700' : 'opacity-50 cursor-not-allowed'
  } ${
    isTeam1Picked
      ? isPickCorrect
        ? 'bg-green-700/40 border border-green-600'
        : isPickIncorrect
          ? 'bg-red-700/40 border border-red-600'
          : 'bg-blue-700/40 border border-blue-600' // Default picked color if not completed or no winner
      : 'bg-slate-700'
  }`;

  // Conditional classes for team 2
  const team2Classes = `flex items-center justify-center py-1 px-2 rounded-sm transition-colors duration-150 ${
    isTeam2Selectable ? 'cursor-pointer hover:bg-slate-700' : 'opacity-50 cursor-not-allowed'
  } ${
    isTeam2Picked
      ? isPickCorrect
        ? 'bg-green-700/40 border border-green-600'
        : isPickIncorrect
          ? 'bg-red-700/40 border border-red-600'
          : 'bg-blue-700/40 border border-blue-600' // Default picked color if not completed or no winner
      : 'bg-slate-700'
  }`;

  // Conditional classes for the "Your Pick" section
  const pickStatusBorderClass = `border-t ${
    isPickCorrect
      ? 'border-green-600'
      : isPickIncorrect
        ? 'border-red-600'
        : 'border-slate-600'
  }`;
  const pickStatusTextColorClass = `flex items-center justify-center gap-1 text-xs font-semibold ${
    isPickCorrect
      ? 'text-green-400'
      : isPickIncorrect
        ? 'text-red-400'
        : 'text-blue-400'
  }`;

  return (
    <div className="w-48 h-20 flex flex-col justify-between relative p-0">
      <div className="space-y-1 flex-grow">
        <div
          className={team1Classes}
          onClick={() => isTeam1Selectable && handlePick(match.team1_id!)}
        >
          <div className="flex items-center gap-1">
            {team1?.logo && <span className="text-base">{team1.logo}</span>}
            <h3 className="text-xs font-semibold text-white truncate">{team1?.name || 'TBD'}</h3>
          </div>
        </div>

        <div className="flex justify-center py-0">
          <span className="text-xs font-semibold text-slate-400">VS</span>
        </div>

        <div
          className={team2Classes}
          onClick={() => isTeam2Selectable && handlePick(match.team2_id!)}
        >
          <div className="flex items-center gap-1">
            {team2?.logo && <span className="text-base">{team2.logo}</span>}
            <h3 className="text-xs font-semibold text-white truncate">{team2?.name || 'TBD'}</h3>
          </div>
        </div>
      </div>

      {userPick && (
        <div className={`mt-1 pt-1 ${pickStatusBorderClass}`}>
          <div className={pickStatusTextColorClass}>
            <Trophy className="w-3 h-3" />
            Your Pick: {getTeamById(userPick)?.name}
          </div>
        </div>
      )}
    </div>
  );
}