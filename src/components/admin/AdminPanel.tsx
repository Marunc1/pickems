import { useState, useEffect } from 'react';
import { supabase, type Tournament, type Team } from '../../lib/supabase';
import { Settings, Users, Trophy, Save, Plus, Trash2, Grid3x3, ListTree } from 'lucide-react';
import GroupsManager from './GroupsManager';
import BracketManager from './BracketManager';

export default function AdminPanel() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tournaments' | 'teams' | 'groups' | 'bracket' | 'settings'>('tournaments');

  useEffect(() => {
    loadTournaments();
  }, []);

  async function loadTournaments() {
    try {
      const { data, error } = await supabase
        .from('tournament_settings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTournaments(data || []);
      if (data && data.length > 0 && !selectedTournament) {
        setSelectedTournament(data[0].id);
      }
    } catch (error) {
      console.error('Error loading tournaments:', error);
    } finally {
      setLoading(false);
    }
  }

  const tournament = tournaments.find(t => t.id === selectedTournament);

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
              value={selectedTournament || ''}
              onChange={(e) => setSelectedTournament(e.target.value)}
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
          {loading ? (
            <div className="text-white text-center py-12">Loading...</div>
          ) : (
            <>
              {activeTab === 'tournaments' && (
                <TournamentManager
                  tournaments={tournaments}
                  selectedTournament={tournament}
                  onRefresh={loadTournaments}
                />
              )}
              {activeTab === 'teams' && tournament && (
                <TeamManager tournament={tournament} onRefresh={loadTournaments} />
              )}
              {activeTab === 'groups' && tournament && (
                <GroupsManager tournament={tournament} onRefresh={loadTournaments} />
              )}
              {activeTab === 'bracket' && tournament && (
                <BracketManager tournament={tournament} onRefresh={loadTournaments} />
              )}
              {activeTab === 'settings' && <SettingsManager />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function TournamentManager({
  tournaments,
  selectedTournament,
  onRefresh
}: {
  tournaments: Tournament[];
  selectedTournament?: Tournament;
  onRefresh: () => void;
}) {
  const [name, setName] = useState('');
  const [stage, setStage] = useState('groups');
  const [status, setStatus] = useState('upcoming');

  async function createTournament() {
    try {
      const { error } = await supabase.from('tournament_settings').insert({
        name,
        stage,
        status,
        teams: [],
        matches: [],
        bracket_data: {}
      });

      if (error) throw error;
      onRefresh();
      setName('');
    } catch (error) {
      console.error('Error creating tournament:', error);
      alert('Error creating tournament');
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-5 flex items-center gap-3">
          <Plus className="w-7 h-7 text-green-500" />
          Create New Tournament
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="col-span-2">
            <label htmlFor="tournament-name" className="block text-sm font-medium text-slate-300 mb-2">Tournament Name</label>
            <input
              id="tournament-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Worlds 2025"
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="tournament-stage" className="block text-sm font-medium text-slate-300 mb-2">Stage</label>
            <select
              id="tournament-stage"
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="groups">Groups</option>
              <option value="swiss">Swiss</option>
              <option value="playoffs">Playoffs</option>
            </select>
          </div>
          <div>
            <label htmlFor="tournament-status" className="block text-sm font-medium text-slate-300 mb-2">Status</label>
            <select
              id="tournament-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="upcoming">Upcoming</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
        <button
          onClick={createTournament}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Tournament
        </button>
      </div>

      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-5">Existing Tournaments</h2>
        <div className="space-y-4">
          {tournaments.length === 0 ? (
            <p className="text-slate-400 text-center py-4">No tournaments created yet.</p>
          ) : (
            tournaments.map((tournament) => (
              <div
                key={tournament.id}
                className="bg-slate-700 p-4 rounded-lg flex items-center justify-between hover:bg-slate-600 transition-colors duration-200"
              >
                <div>
                  <h3 className="text-white font-semibold text-lg">{tournament.name}</h3>
                  <p className="text-slate-400 text-sm mt-1">
                    Stage: <span className="font-medium text-blue-300">{tournament.stage}</span> • Status: <span className={`font-medium ${tournament.status === 'active' ? 'text-green-400' : tournament.status === 'upcoming' ? 'text-yellow-400' : 'text-red-400'}`}>{tournament.status}</span>
                  </p>
                </div>
                <span className="text-slate-300 text-sm bg-slate-600 px-3 py-1 rounded-full">
                  {tournament.teams?.length || 0} teams
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function TeamManager({ tournament, onRefresh }: { tournament: Tournament; onRefresh: () => void }) {
  const [teams, setTeams] = useState<Team[]>(tournament.teams || []);
  const [newTeam, setNewTeam] = useState({ name: '', tag: '' }); // Removed region, logo, group from initial state
  const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']; // Still needed for group selection later

  useEffect(() => {
    setTeams(tournament.teams || []);
  }, [tournament.teams]);

  function addTeam() {
    if (!newTeam.name || !newTeam.tag) { // Only require name and tag
      alert('Please fill in team Name and Tag.');
      return;
    }
    const team: Team = {
      id: `team_${Date.now()}`,
      ...newTeam,
      region: '', // Explicitly set to empty string or undefined
      logo: '',   // Explicitly set to empty string or undefined
      group: ''   // Explicitly set to empty string or undefined
    };
    setTeams([...teams, team]);
    setNewTeam({ name: '', tag: '' }); // Reset state
  }

  function removeTeam(id: string) {
    setTeams(teams.filter(t => t.id !== id));
  }

  async function saveTeams() {
    try {
      const { error } = await supabase
        .from('tournament_settings')
        .update({ teams })
        .eq('id', tournament.id);

      if (error) {
        console.error('Supabase error saving teams:', error); // More detailed error logging
        throw error;
      }
      onRefresh();
      alert('Teams saved successfully!');
    } catch (error) {
      console.error('Error saving teams:', error);
      alert('Error saving teams. Check console for details and RLS policies.'); // Updated alert
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-5 flex items-center gap-3">
          <Plus className="w-7 h-7 text-green-500" />
          Add New Team
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"> {/* Adjusted grid columns */}
          <div className="md:col-span-1">
            <label htmlFor="team-name" className="block text-sm font-medium text-slate-300 mb-2">Team Name</label>
            <input
              id="team-name"
              type="text"
              value={newTeam.name}
              onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
              placeholder="e.g., SK Telecom T1"
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="team-tag" className="block text-sm font-medium text-slate-300 mb-2">Tag</label>
            <input
              id="team-tag"
              type="text"
              value={newTeam.tag}
              onChange={(e) => setNewTeam({ ...newTeam, tag: e.target.value })}
              placeholder="e.g., T1"
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Removed Region and Logo inputs */}
          {/* Removed Group select from initial add form */}
        </div>
        <button
          onClick={addTeam}
          className="mt-6 w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Team
        </button>
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
                className="bg-slate-700 p-4 rounded-lg flex items-center justify-between hover:bg-slate-600 transition-colors duration-200 border border-slate-600"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{team.logo || '❓'}</span> {/* Fallback for missing logo */}
                  <div>
                    <h3 className="text-white font-semibold text-lg">{team.name} <span className="text-blue-300 text-sm ml-1">({team.tag})</span></h3>
                    <p className="text-slate-400 text-sm">
                      {team.region && `${team.region} • `} {/* Display region only if it exists */}
                      {team.group && `Group `}<span className="font-medium text-blue-300">{team.group}</span>
                      {!team.region && !team.group && "No additional info"} {/* Fallback if both are missing */}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeTeam(team.id)}
                  className="text-red-400 hover:text-red-300 transition-colors p-2 rounded-full hover:bg-slate-500"
                  title="Remove Team"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
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