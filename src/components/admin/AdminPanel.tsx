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
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white font-semibold"
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
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Trophy className="w-5 h-5" />
              Tournaments
            </button>
            <button
              onClick={() => setActiveTab('teams')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'teams'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Users className="w-5 h-5" />
              Teams
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'groups'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Grid3x3 className="w-5 h-5" />
              Groups
            </button>
            <button
              onClick={() => setActiveTab('bracket')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'bracket'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              <ListTree className="w-5 h-5" />
              Bracket
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'settings'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700'
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
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Plus className="w-6 h-6" />
          Create Tournament
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tournament Name"
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
          />
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
          >
            <option value="groups">Groups</option>
            <option value="swiss">Swiss</option>
            <option value="playoffs">Playoffs</option>
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
          >
            <option value="upcoming">Upcoming</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <button
          onClick={createTournament}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Create Tournament
        </button>
      </div>

      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-4">Existing Tournaments</h2>
        <div className="space-y-3">
          {tournaments.map((tournament) => (
            <div
              key={tournament.id}
              className="bg-slate-700 p-4 rounded-lg flex items-center justify-between"
            >
              <div>
                <h3 className="text-white font-semibold">{tournament.name}</h3>
                <p className="text-slate-400 text-sm">
                  Stage: {tournament.stage} • Status: {tournament.status}
                </p>
              </div>
              <span className="text-slate-400">{tournament.teams?.length || 0} teams</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TeamManager({ tournament, onRefresh }: { tournament: Tournament; onRefresh: () => void }) {
  const [teams, setTeams] = useState<Team[]>(tournament.teams || []);
  const [newTeam, setNewTeam] = useState({ name: '', region: '', logo: '🏆', group: 'A' });

  function addTeam() {
    const team: Team = {
      id: `team_${Date.now()}`,
      ...newTeam
    };
    setTeams([...teams, team]);
    setNewTeam({ name: '', region: '', logo: '🏆', group: 'A' });
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

      if (error) throw error;
      onRefresh();
      alert('Teams saved successfully!');
    } catch (error) {
      console.error('Error saving teams:', error);
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-4">Add Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            type="text"
            value={newTeam.name}
            onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
            placeholder="Team Name"
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
          />
          <input
            type="text"
            value={newTeam.region}
            onChange={(e) => setNewTeam({ ...newTeam, region: e.target.value })}
            placeholder="Region"
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
          />
          <input
            type="text"
            value={newTeam.logo}
            onChange={(e) => setNewTeam({ ...newTeam, logo: e.target.value })}
            placeholder="Logo (emoji)"
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
          />
          <select
            value={newTeam.group}
            onChange={(e) => setNewTeam({ ...newTeam, group: e.target.value })}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
          >
            <option value="A">Group A</option>
            <option value="B">Group B</option>
            <option value="C">Group C</option>
            <option value="D">Group D</option>
          </select>
          <button
            onClick={addTeam}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Teams ({teams.length})</h2>
          <button
            onClick={saveTeams}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            Save Changes
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {teams.map((team) => (
            <div
              key={team.id}
              className="bg-slate-700 p-4 rounded-lg flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{team.logo}</span>
                <div>
                  <h3 className="text-white font-semibold">{team.name}</h3>
                  <p className="text-slate-400 text-sm">
                    {team.region} • Group {team.group}
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeTeam(team.id)}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
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

  async function saveSettings() {
    try {
      const { error } = await supabase
        .from('admin_config')
        .upsert({
          key: 'scoring_rules',
          value: scoringRules
        });

      if (error) throw error;
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <h2 className="text-xl font-bold text-white mb-4">Scoring Rules</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-slate-300 mb-2">Correct Pick Points</label>
          <input
            type="number"
            value={scoringRules.correct_pick}
            onChange={(e) =>
              setScoringRules({ ...scoringRules, correct_pick: parseInt(e.target.value) })
            }
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white w-full"
          />
        </div>
        <div>
          <label className="block text-slate-300 mb-2">Perfect Group Points</label>
          <input
            type="number"
            value={scoringRules.perfect_group}
            onChange={(e) =>
              setScoringRules({ ...scoringRules, perfect_group: parseInt(e.target.value) })
            }
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white w-full"
          />
        </div>
        <div>
          <label className="block text-slate-300 mb-2">Correct Winner Points</label>
          <input
            type="number"
            value={scoringRules.correct_winner}
            onChange={(e) =>
              setScoringRules({ ...scoringRules, correct_winner: parseInt(e.target.value) })
            }
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white w-full"
          />
        </div>
        <button
          onClick={saveSettings}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <Save className="w-5 h-5" />
          Save Settings
        </button>
      </div>
    </div>
  );
}
