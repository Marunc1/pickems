import { useState, useEffect } from 'react';
import { supabase, type Tournament, type Team } from '../../lib/supabase';
import { Save, Plus, Trash2, Edit, XCircle, CheckCircle } from 'lucide-react';

export default function TeamManager({ tournament, onRefresh }: { tournament: Tournament; onRefresh: () => void }) {
  const [teams, setTeams] = useState<Team[]>(tournament.teams || []);
  const [newTeam, setNewTeam] = useState({ name: '', tag: '', region: '', logo: '' }); // Removed group
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  // Removed groups array as it's no longer needed

  useEffect(() => {
    setTeams(tournament.teams || []);
  }, [tournament.teams]);

  function addTeam() {
    if (!newTeam.name || !newTeam.tag) {
      alert('Please fill in team Name and Tag.');
      return;
    }
    const team: Team = {
      id: `team_${Date.now()}`,
      ...newTeam,
    };
    setTeams([...teams, team]);
    setNewTeam({ name: '', tag: '', region: '', logo: '' }); // Reset newTeam without group
  }

  function removeTeam(id: string) {
    setTeams(teams.filter(t => t.id !== id));
  }

  function updateTeamField(id: string, field: keyof Team, value: string) {
    setTeams(teams.map(t => t.id === id ? { ...t, [field]: value } : t));
  }

  async function saveTeams() {
    try {
      const { error } = await supabase
        .from('tournament_settings')
        .update({ teams })
        .eq('id', tournament.id);

      if (error) {
        console.error('Supabase error saving teams:', error);
        throw error;
      }
      onRefresh();
      alert('Teams saved successfully!');
    } catch (error) {
      console.error('Error saving teams:', error);
      alert('Error saving teams. Check console for details and RLS policies.');
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-5 flex items-center gap-3">
          <Plus className="w-7 h-7 text-green-500" />
          Add New Team
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label htmlFor="new-team-name" className="block text-sm font-medium text-slate-300 mb-2">Team Name</label>
            <input
              id="new-team-name"
              type="text"
              value={newTeam.name}
              onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
              placeholder="e.g., SK Telecom T1"
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="new-team-tag" className="block text-sm font-medium text-slate-300 mb-2">Tag</label>
            <input
              id="new-team-tag"
              type="text"
              value={newTeam.tag}
              onChange={(e) => setNewTeam({ ...newTeam, tag: e.target.value })}
              placeholder="e.g., T1"
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="new-team-region" className="block text-sm font-medium text-slate-300 mb-2">Region (Optional)</label>
            <input
              id="new-team-region"
              type="text"
              value={newTeam.region}
              onChange={(e) => setNewTeam({ ...newTeam, region: e.target.value })}
              placeholder="e.g., LCK"
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="new-team-logo" className="block text-sm font-medium text-slate-300 mb-2">Logo Emoji (Optional)</label>
            <input
              id="new-team-logo"
              type="text"
              value={newTeam.logo}
              onChange={(e) => setNewTeam({ ...newTeam, logo: e.target.value })}
              placeholder="e.g., 🏆"
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Removed Group selection for new team */}
          <div className="md:col-span-3 flex justify-end">
            <button
              onClick={addTeam}
              className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Team
            </button>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-bold text-white">Teams ({teams.length})</h2>
          <button
            onClick={saveTeams}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            Save Changes
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.length === 0 ? (
            <p className="text-slate-400 text-center py-4 col-span-full">No teams added yet. Use the form above to add teams.</p>
          ) : (
            teams.map((team) => (
              <div
                key={team.id}
                className="bg-slate-700 p-4 rounded-lg flex flex-col hover:bg-slate-600 transition-colors duration-200 border border-slate-600"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{team.logo}</span>
                    <div>
                      {editingTeamId === team.id ? (
                        <input
                          type="text"
                          value={team.name}
                          onChange={(e) => updateTeamField(team.id, 'name', e.target.value)}
                          className="bg-slate-600 border border-slate-500 rounded px-2 py-1 text-white text-lg font-semibold w-32"
                        />
                      ) : (
                        <h3 className="text-white font-semibold text-lg">{team.name}</h3>
                      )}
                      {editingTeamId === team.id ? (
                        <input
                          type="text"
                          value={team.tag || ''}
                          onChange={(e) => updateTeamField(team.id, 'tag', e.target.value)}
                          className="bg-slate-600 border border-slate-500 rounded px-2 py-1 text-blue-300 text-sm ml-1 w-20"
                        />
                      ) : (
                        <p className="text-blue-300 text-sm ml-1">({team.tag})</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {editingTeamId === team.id ? (
                      <>
                        <button
                          onClick={() => setEditingTeamId(null)}
                          className="text-green-400 hover:text-green-300 transition-colors p-2 rounded-full hover:bg-slate-500"
                          title="Save Changes"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingTeamId(null);
                            setTeams(tournament.teams || []); // Revert changes if cancelled
                          }}
                          className="text-red-400 hover:text-red-300 transition-colors p-2 rounded-full hover:bg-slate-500"
                          title="Cancel Edit"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setEditingTeamId(team.id)}
                        className="text-blue-400 hover:text-blue-300 transition-colors p-2 rounded-full hover:bg-slate-500"
                        title="Edit Team"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => removeTeam(team.id)}
                      className="text-red-400 hover:text-red-300 transition-colors p-2 rounded-full hover:bg-slate-500"
                      title="Remove Team"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  {editingTeamId === team.id ? (
                    <>
                      <label htmlFor={`region-${team.id}`} className="sr-only">Region</label>
                      <input
                        id={`region-${team.id}`}
                        type="text"
                        value={team.region || ''}
                        onChange={(e) => updateTeamField(team.id, 'region', e.target.value)}
                        placeholder="Region"
                        className="bg-slate-600 border border-slate-500 rounded px-2 py-1 text-white text-sm w-24"
                      />
                      <span className="text-slate-500">•</span>
                      <label htmlFor={`logo-${team.id}`} className="sr-only">Logo</label>
                      <input
                        id={`logo-${team.id}`}
                        type="text"
                        value={team.logo || ''}
                        onChange={(e) => updateTeamField(team.id, 'logo', e.target.value)}
                        placeholder="Logo"
                        className="bg-slate-600 border border-slate-500 rounded px-2 py-1 text-white text-sm w-16"
                      />
                      {/* Removed Group selection for editing team */}
                    </>
                  ) : (
                    <>
                      {team.region && <span>{team.region}</span>}
                      {!team.region && "No additional info"}
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}