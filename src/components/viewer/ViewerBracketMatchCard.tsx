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

  // Adjusted width and height for compactness
  const cardClasses = `w-[8rem] h-[80px] flex flex-col justify-between relative p-1`; 

  return (
    <div className={`${cardClasses}`}>
      <div className="space-y-1 flex-grow"> {/* Reduced space-y */}
        <div
          className={`flex items-center justify-between py-0.5 px-1 rounded-md transition-colors duration-150 ${ // Adjusted padding
            isTeam1Selectable ? 'cursor-pointer hover:bg-slate-700' : 'opacity-50 cursor-not-allowed'
          } ${isTeam1Picked ? 'bg-blue-700/40 border border-blue-500' : 'bg-slate-700'}`}
          onClick={() => isTeam1Selectable && handlePick(match.team1_id!)}
        >
          <div className="flex items-center gap-1"> {/* Reduced gap */}
            {team1?.logo && <span className="text-base">{team1.logo}</span>} {/* Reduced text size */}
            <h3 className="text-xs font-semibold text-white">{team1?.name || 'TBD'}</h3> {/* Reduced text size */}
          </div>
          {isTeam1Picked && <CheckCircle className="w-3 h-3 text-blue-400" />} {/* Reduced icon size */}
        </div>

        <div className="flex justify-center py-0.5"> {/* Adjusted padding */}
          <span className="text-slate-400 text-xs font-semibold">VS</span>
        </div>

        <div
          className={`flex items-center justify-between py-0.5 px-1 rounded-md transition-colors duration-150 ${ // Adjusted padding
            isTeam2Selectable ? 'cursor-pointer hover:bg-slate-700' : 'opacity-50 cursor-not-allowed'
          } ${isTeam2Picked ? 'bg-blue-700/40 border border-blue-500' : 'bg-slate-700'}`}
          onClick={() => isTeam2Selectable && handlePick(match.team2_id!)}
        >
          <div className="flex items-center gap-1"> {/* Reduced gap */}
            {team2?.logo && <span className="text-base">{team2.logo}</span>} {/* Reduced text size */}
            <h3 className="text-xs font-semibold text-white">{team2?.name || 'TBD'}</h3> {/* Reduced text size */}
          </div>
          {isTeam2Picked && <CheckCircle className="w-3 h-3 text-blue-400" />} {/* Reduced icon size */}
        </div>
      </div>

      {userPick && (
        <div className="mt-1 pt-1 border-t border-slate-600"> {/* Adjusted margin and padding */}
          <div className="flex items-center justify-center gap-1 text-blue-400 font-semibold text-xs"> {/* Reduced gap and text size */}
            <Trophy className="w-2.5 h-2.5" /> {/* Reduced icon size */}
            Your Pick: {getTeamById(userPick)?.name}
          </div>
        </div>
      )}
    </div>
  );
}