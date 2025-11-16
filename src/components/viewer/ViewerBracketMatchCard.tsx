import React from 'react';
import { Trophy, CheckCircle } from 'lucide-react';
import { type Team } from '../../lib/supabase';

interface BracketMatch {
  id: string;
  team1_id?: string;
  team2_id?: string;
  round: string;
  match_number: number;
  next_match_id?: string;
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
  const isTeam2Selectable = !!match.team2_id; // Corrected this line

  const cardClasses = `bg-slate-800 rounded-lg p-4 w-[12rem] h-[180px] border border-slate-700 shadow-md flex flex-col justify-between relative`;

  return (
    <div className={`${cardClasses}`}>
      <div className="space-y-2 flex-grow">
        <div
          className={`flex items-center justify-between py-1 px-2 rounded-sm transition-colors duration-150 ${
            isTeam1Selectable ? 'cursor-pointer hover:bg-slate-700' : 'opacity-50 cursor-not-allowed'
          } ${isTeam1Picked ? 'bg-blue-700/40 border border-blue-500' : 'bg-slate-700'}`}
          onClick={() => isTeam1Selectable && handlePick(match.team1_id!)}
        >
          <div className="flex items-center gap-2">
            {team1?.logo && <span className="text-xl">{team1.logo}</span>}
            <h3 className="text-white font-semibold text-sm">{team1?.name || 'TBD'}</h3>
          </div>
          {isTeam1Picked && <CheckCircle className="w-4 h-4 text-blue-400" />}
        </div>

        <div className="flex justify-center py-1">
          <span className="text-slate-400 text-xs font-semibold">VS</span>
        </div>

        <div
          className={`flex items-center justify-between py-1 px-2 rounded-sm transition-colors duration-150 ${
            isTeam2Selectable ? 'cursor-pointer hover:bg-slate-700' : 'opacity-50 cursor-not-allowed'
          } ${isTeam2Picked ? 'bg-blue-700/40 border border-blue-500' : 'bg-slate-700'}`}
          onClick={() => isTeam2Selectable && handlePick(match.team2_id!)}
        >
          <div className="flex items-center gap-2">
            {team2?.logo && <span className="text-xl">{team2.logo}</span>}
            <h3 className="text-white font-semibold text-sm">{team2?.name || 'TBD'}</h3>
          </div>
          {isTeam2Picked && <CheckCircle className="w-4 h-4 text-blue-400" />}
        </div>
      </div>

      {userPick && (
        <div className="mt-2 pt-2 border-t border-slate-700">
          <div className="flex items-center justify-center gap-2 text-blue-400 font-semibold text-xs">
            <Trophy className="w-3 h-3" />
            Your Pick: {getTeamById(userPick)?.name}
          </div>
        </div>
      )}
    </div>
  );
}