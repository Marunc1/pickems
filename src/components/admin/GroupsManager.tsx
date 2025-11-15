import { useState, useEffect } from 'react';
import { supabase, type Tournament, type Team } from '../../lib/supabase';
import { Save, Plus, Trash2, Users, Trophy } from 'lucide-react';

interface Match {
  id: string;
  team1_id: string;
  team2_id: string;
  team1_score: number;
  team2_score: number;
  winner_id?: string;
  status: 'upcoming' | 'live' | 'completed';
  group: string;
  round: number;
}

export default function GroupsManager({ tournament, onRefresh }: { tournament: Tournament; onRefresh: () => void }) {
  const [matches, setMatches] = useState<Match[]>((tournament.matches as Match[]) || []);
  const [selectedGroup, setSelectedGroup] = useState('A');
  const teams = tournament.teams || [];
  const groups = ['A', 'B', 'C', 'D'];

  const groupTeams = teams.filter((team: Team) => team.group === selectedGroup);

  function generateGroupMatches(group: string) {
    const teamsInGroup = teams.filter((team: Team) => team.group === group);
    const newMatches: Match[] = [];

    for (let i = 0; i < teamsInGroup.length; i++) {
      for (let j = i + 1; j < teamsInGroup.length; j++) {
        newMatches.push({
          id: `match_${Date.now()}_${i}_${j}`,
          team1_id: teamsInGroup[i].id,
          team2_id: teamsInGroup[j].id,
          team1_score: 0,
          team2_score: 0,
          status: 'upcoming',
          group: group,
          round: 1
        });
      }
    }

    setMatches([...matches, ...newMatches]);
  }

  function updateMatch(matchId: string, updates: Partial<Match>) {
    setMatches(matches.map(m => m.id === matchId ? { ...m, ...updates } : m));
  }

  function deleteMatch(matchId: string) {
    setMatches(matches.filter(m => m.id !== matchId));
  }

  async function saveMatches() {
    try {
      const { error } = await supabase
        .from('tournament_settings')
        .update({ matches })
        .eq('id', tournament.id);

      if (error) throw error;
      onRefresh();
      alert('Matches saved successfully!');
    } catch (error) {
      console.error('Error saving matches:', error);
      alert('Error saving matches');
    }
  }

  function getTeamById(id: string) {
    return teams.find((t: Team) => t.id === id);
  }

  const groupMatches = matches.filter(m => m.group === selectedGroup);

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-8 h-8 text-blue-500" />
            Groups Manager
          </h2>
          <button
            onClick={saveMatches}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            Save All Changes
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          {groups.map(group => (
            <button
              key={group}
              onClick={() => setSelectedGroup(group)}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                selectedGroup === group
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Group {group}
            </button>
          ))}
        </div>

        <div className="bg-slate-700 rounded-lg p-4 mb-6">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Teams in Group {selectedGroup}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {groupTeams.map((team: Team) => (
              <div key={team.id} className="bg-slate-600 p-3 rounded-lg flex items-center gap-2">
                <span className="text-2xl">{team.logo}</span>
                <div>
                  <div className="text-white font-medium text-sm">{team.name}</div>
                  <div className="text-slate-300 text-xs">{team.region}</div>
                </div>
              </div>
            ))}
          </div>
          {groupTeams.length === 0 && (
            <p className="text-slate-400 text-sm">No teams in this group yet. Add teams first.</p>
          )}
          {groupTeams.length > 0 && (
            <button
              onClick={() => generateGroupMatches(selectedGroup)}
              className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Generate All Matches for Group {selectedGroup}
            </button>
          )}
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-bold text-white mb-4">
          Matches in Group {selectedGroup} ({groupMatches.length})
        </h3>
        <div className="space-y-3">
          {groupMatches.map((match) => {
            const team1 = getTeamById(match.team1_id);
            const team2 = getTeamById(match.team2_id);

            return (
              <div key={match.id} className="bg-slate-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-2xl">{team1?.logo}</span>
                      <span className="text-white font-semibold">{team1?.name}</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={match.team1_score}
                      onChange={(e) => updateMatch(match.id, { team1_score: parseInt(e.target.value) || 0 })}
                      className="w-16 px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-center font-bold"
                    />
                  </div>
                  <span className="text-slate-400 mx-4 text-xl font-bold">VS</span>
                  <div className="flex items-center gap-4 flex-1">
                    <input
                      type="number"
                      min="0"
                      value={match.team2_score}
                      onChange={(e) => updateMatch(match.id, { team2_score: parseInt(e.target.value) || 0 })}
                      className="w-16 px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-center font-bold"
                    />
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-2xl">{team2?.logo}</span>
                      <span className="text-white font-semibold">{team2?.name}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={match.status}
                    onChange={(e) => updateMatch(match.id, { status: e.target.value as Match['status'] })}
                    className="px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="live">Live</option>
                    <option value="completed">Completed</option>
                  </select>
                  <button
                    onClick={() => deleteMatch(match.id)}
                    className="ml-auto text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
          {groupMatches.length === 0 && (
            <p className="text-slate-400 text-center py-8">
              No matches in this group yet. Click "Generate All Matches" above.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
