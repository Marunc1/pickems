import { useState, useEffect } from 'react';
import { supabase, type Tournament, type Team } from '../../lib/supabase';
import { Settings, Users, Trophy, Save, Plus, Trash2, Grid3x3, ListTree, Edit, XCircle, CheckCircle } from 'lucide-react';
import GroupsManager from './GroupsManager';
import BracketManager from './BracketManager';
import TournamentManager from './TournamentManager'; // Importăm noul component
import { useOutletContext } from 'react-router-dom';

// Definirea tipului pentru contextul Outlet
type OutletContextType = {
  tournaments: Tournament[];
  selectedTournamentId: string | null;
  setSelectedTournamentId: (id: string) => void;
  onRefreshTournaments: () => void;
};

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'tournaments' | 'teams' | 'groups' | 'bracket' | 'settings'>('tournaments');

  // Extragem datele din contextul Outlet
  const { tournaments, selectedTournamentId, setSelectedTournamentId, onRefreshTournaments } = useOutletContext<OutletContextType>();

  const tournament = tournaments.find(t => t.id === selectedTournamentId);

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Settings className="w-8 h-8 text-blue-500" />
            Admin Panel
          </h1>
          {tournaments.length > 0 && (
            <select
              value={selectedTournamentId || ''}
              onChange={(e) => setSelectedTournamentId(e.target.value)}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {tournaments.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.status})
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="flex">
        <div className="w-64 bg-slate-800 min-h-screen border-r border-slate-700 p-4">
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('tournaments')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'tournaments'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Trophy className="w-5 h-5" />
              Tournaments
            </button>
            <button
              onClick={() => setActiveTab('teams')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'teams'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Users className="w-5 h-5" />
              Teams
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'groups'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Grid3x3 className="w-5 h-5" />
              Groups
            </button>
            <button
              onClick={() => setActiveTab('bracket')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'bracket'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <ListTree className="w-5 h-5" />
              Bracket
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'settings'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Settings className="w-5 h-5" />
              Settings
            </button>
          </nav>
        </div>

        <div className="flex-1 p-6">
          {tournaments.length === 0 && activeTab !== 'tournaments' ? (
            <div className="text-white text-center py-12">
              Please create a tournament first in the "Tournaments" tab.
            </div>
          ) : (
            <>
              {activeTab === 'tournaments' && (
                <TournamentManager
                  tournaments={tournaments}
                  selectedTournamentId={selectedTournamentId}
                  setSelectedTournamentId={setSelectedTournamentId}
                  onRefresh={onRefreshTournaments}
                />
              )}
              {activeTab === 'teams' && tournament && (
                <TeamManager tournament={tournament} onRefresh={onRefreshTournaments} />
              )}
              {activeTab === 'groups' && tournament && (
                <GroupsManager tournament={tournament} onRefresh={onRefreshTournaments} />
              )}
              {activeTab === 'bracket' && tournament && (
                <BracketManager tournament={tournament} onRefresh={onRefreshTournaments} />
              )}
              {activeTab === 'settings' && <SettingsManager />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function TeamManager({ tournament, onRefresh }: { tournament: Tournament; onRefresh: () => void }) {
  const [teams, setTeams] = useState<Team[]>(tournament.teams || []);
  const [newTeam, setNewTeam] = useState({ name: '', tag: '', region: '', logo: '', group: '' });
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

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
    setNewTeam({ name: '', tag: '', region: '', logo: '', group: '' });
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
          <div>
            <label htmlFor="new-team-group" className="block text-sm font-medium text-slate-300 mb-2">Group (Optional)</label>
            <select
              id="new-team-group"
              value={newTeam.group}
              onChange={(e) => setNewTeam({ ...newTeam, group: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Group</option>
              {groups.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
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
                    <span className="text-3xl">{team.logo || '❓'}</span>
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
                      <span className="text-slate-500">•</span>
                      <label htmlFor={`group-${team.id}`} className="sr-only">Group</label>
                      <select
                        id={`group-${team.id}`}
                        value={team.group || ''}
                        onChange={(e) => updateTeamField(team.id, 'group', e.target.value)}
                        className="bg-slate-600 border border-slate-500 rounded px-2 py-1 text-white text-sm w-24"
                      >
                        <option value="">No Group</option>
                        {groups.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </>
                  ) : (
                    <>
                      {team.region && <span>{team.region}</span>}
                      {team.region && team.group && <span className="text-slate-500">•</span>}
                      {team.group && <span>Group <span className="font-medium text-blue-300">{team.group}</span></span>}
                      {!team.region && !team.group && "No additional info"}
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

function SettingsManager() {
  const [scoringRules, setScoringRules] = useState({
    correct_pick: 10,
    perfect_group: 50,
    correct_winner: 100
  });

  useEffect(() => {
    loadScoringRules();
  }, []);

  async function loadScoringRules() {
    try {
      const { data, error } = await supabase
        .from('admin_config')
        .select('value')
        .eq('key', 'scoring_rules')
        .maybeSingle();

      if (error) throw error;
      if (data && data.value) {
        setScoringRules(data.value);
      }
    } catch (error) {
      console.error('Error loading scoring rules:', error);
    }
  }

  async function saveSettings() {
    try {
      const { error } = await supabase
        .from('admin_config')
        .upsert({
          key: 'scoring_rules',
          value: scoringRules
        }, { onConflict: 'key' }); // Use onConflict to update if key exists

      if (error) throw error;
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings');
    }
  }

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-5 flex items-center gap-3">
        <Settings className="w-7 h-7 text-blue-500" />
        Scoring Rules
      </h2>
      <p className="text-slate-400 mb-6">Configure how points are awarded for predictions.</p>
      <div className="space-y-5">
        <div>
          <label htmlFor="correct-pick" className="block text-slate-300 mb-2 text-lg">Points for Correct Pick</label>
          <input
            id="correct-pick"
            type="number"
            value={scoringRules.correct_pick}
            onChange={(e) =>
              setScoringRules({ ...scoringRules, correct_pick: parseInt(e.target.value) || 0 })
            }
            className="px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="perfect-group" className="block text-slate-300 mb-2 text-lg">Points for Perfect Group Prediction</label>
          <input
            id="perfect-group"
            type="number"
            value={scoringRules.perfect_group}
            onChange={(e) =>
              setScoringRules({ ...scoringRules, perfect_group: parseInt(e.target.value) || 0 })
            }
            className="px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="correct-winner" className="block text-slate-300 mb-2 text-lg">Points for Correct Tournament Winner</label>
          <input
            id="correct-winner"
            type="number"
            value={scoringRules.correct_winner}
            onChange={(e) =>
              setScoringRules({ ...scoringRules, correct_winner: parseInt(e.target.value) || 0 })
            }
            className="px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={saveSettings}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold flex items-center gap-2"
        >
          <Save className="w-5 h-5" />
          Save Settings
        </button>
      </div>
    </div>
  );
}