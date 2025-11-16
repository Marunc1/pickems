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
  const isTeam2Selectable = !!match.team2_id;

  return (
    <div className="w-50 h-25 flex flex-col justify-between relative p-0"> {/* Increased size from w-40 h-20 */}
      <div className="space-y-1 flex-grow">
        <div
          className={`flex items-center justify-between py-2 px-3 rounded-sm transition-colors duration-150 ${ /* Increased padding */
            isTeam1Selectable ? 'cursor-pointer hover:bg-slate-700' : 'opacity-50 cursor-not-allowed'
          } ${isTeam1Picked ? 'bg-blue-700/40 border border-blue-600' : 'bg-slate-700'}`}
          onClick={() => isTeam1Selectable && handlePick(match.team1_id!)}
        >
          <div className="flex items-center gap-2"> {/* Increased gap */}
            {team1?.logo && <span className="text-lg">{team1.logo}</span>} {/* Increased text size */}
            <h3 className="text-sm font-semibold text-white truncate">{team1?.name || 'TBD'}</h3> {/* Increased text size */}
          </div>
          {isTeam1Picked && <CheckCircle className="w-4 h-4 text-blue-400" />} {/* Increased icon size */}
        </div>

        <div className="flex justify-center py-0">
          <span className="text-sm font-semibold text-slate-400">VS</span> {/* Increased text size */}
        </div>

        <div
          className={`flex items-center justify-between py-2 px-3 rounded-sm transition-colors duration-150 ${ /* Increased padding */
            isTeam2Selectable ? 'cursor-pointer hover:bg-slate-700' : 'opacity-50 cursor-not-allowed'
          } ${isTeam2Picked ? 'bg-blue-700/40 border border-blue-600' : 'bg-slate-700'}`}
          onClick={() => isTeam2Selectable && handlePick(match.team2_id!)}
        >
          <div className="flex items-center gap-2"> {/* Increased gap */}
            {team2?.logo && <span className="text-lg">{team2.logo}</span>} {/* Increased text size */}
            <h3 className="text-sm font-semibold text-white truncate">{team2?.name || 'TBD'}</h3> {/* Increased text size */}
          </div>
          {isTeam2Picked && <CheckCircle className="w-4 h-4 text-blue-400" />} {/* Increased icon size */}
        </div>
      </div>

      {userPick && (
        <div className="mt-2 pt-2 border-t border-slate-600"> {/* Increased margin/padding */}
          <div className="flex items-center justify-center gap-1 text-sm font-semibold text-blue-400"> {/* Increased text size */}
            <Trophy className="w-4 h-4" /> {/* Increased icon size */}
            Your Pick: {getTeamById(userPick)?.name}
          </div>
        </div>
      )}
    </div>
  );
}