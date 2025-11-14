import React, { useState, useEffect, useCallback } from 'react';
import { Settings, Users, Trophy, Save, Plus, Trash2, XCircle, CheckCircle, LogIn, LogOut, User, Lock, Loader2 } from 'lucide-react';

// --- CONSTANTE ȘI TIPURI DE DATE ---
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'password123';
const AUTH_STORAGE_KEY = 'pickem_admin_auth';
const API_URL = '/api.php'; 

interface Team {
  id: string;
  name: string;
  region: string;
  logo: string;
  group: string;
}

interface Tournament {
  id: string;
  name: string;
  stage: 'groups' | 'swiss' | 'playoffs';
  status: 'upcoming' | 'active' | 'completed';
  teams: Team[]; // Array deserializat din JSON
  matches: any; 
  bracket_data: any; 
  created_at: string; 
}

interface Message {
  type: 'success' | 'error';
  text: string;
}
// ------------------------------------

// --- UTILITAR API (REUTILIZAT) ---
async function customApi(action: string, data?: any): Promise<any> {
    const isGet = data === undefined || action === 'get_session_user' || action === 'load_settings' || action === 'load_tournaments';
    const method = isGet ? 'GET' : 'POST';
    
    let url = `${API_URL}?action=${action}`;
    let body = undefined;

    if (!isGet) {
        body = JSON.stringify({ action, ...data });
    } else if (action === 'load_settings' && data) {
        url += `&${new URLSearchParams(data).toString()}`;
    }

    const response = await fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: body,
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.error || `API Error for action ${action}`);
    }
    return result.data || result;
}
// ------------------------------------

// --- COMPONENTA PENTRU AFISAREA MESAJELOR ---
const MessageDisplay = ({ message, onClear }: { message: Message | null; onClear: () => void }) => {
  if (!message) return null;

  const baseClasses = "fixed bottom-5 right-5 p-4 rounded-lg shadow-xl flex items-center gap-3 z-50 transition-transform duration-300";
  const successClasses = "bg-green-500 text-white";
  const errorClasses = "bg-red-500 text-white";

  useEffect(() => {
    const timer = setTimeout(() => {
      onClear();
    }, 5000);
    return () => clearTimeout(timer);
  }, [message, onClear]);

  return (
    <div className={`${baseClasses} ${message.type === 'success' ? successClasses : errorClasses}`}>
      {message.type === 'success' ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
      <p className="font-semibold">{message.text}</p>
      <button onClick={onClear} className="text-white opacity-70 hover:opacity-100 ml-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
    </div>
  );
};
// ---------------------------------------------

// --- COMPONENTA LOGIN ---
const LoginScreen = ({ onLogin, onMessage }: { onLogin: () => void; onMessage: (msg: Message) => void }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simularea unei întârzieri de rețea
        setTimeout(() => {
            if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
                // Autentificare reușită
                localStorage.setItem(AUTH_STORAGE_KEY, 'true');
                onLogin();
            } else {
                // Autentificare eșuată
                onMessage({ type: 'error', text: 'Invalid username or password. (admin/password123)' });
                setLoading(false);
            }
        }, 500);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900">
            <form onSubmit={handleLogin} className="w-full max-w-md bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700">
                <div className="text-center mb-8">
                    <LogIn className="w-12 h-12 mx-auto text-blue-500 mb-3" />
                    <h2 className="text-3xl font-bold text-white">Admin Login</h2>
                    <p className="text-slate-400 mt-2">Enter credentials for pickems administration.</p>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="username">Username</label>
                        <div className="relative">
                            <User className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="admin"
                                className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500"
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="password">Password</label>
                        <div className="relative">
                            <Lock className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="password123"
                                className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500"
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold shadow-md flex items-center justify-center gap-2 disabled:opacity-70"
                    disabled={loading}
                >
                    {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                    {!loading ? 'Log In' : 'Authenticating...'}
                </button>

                <p className="text-xs text-center text-slate-500 mt-4">
                    Demo credentials: <code className='text-slate-300'>admin</code> / <code className='text-slate-300'>password123</code>
                </p>
            </form>
        </div>
    );
};
// ------------------------------------

// --- ADMIN PANEL PRINCIPAL (PROTEJAT) ---
function AdminPanel({ onLogout, onMessage }: { onLogout: () => void; onMessage: (msg: Message) => void }) {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tournaments' | 'teams' | 'settings'>('tournaments');

  const loadTournaments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await customApi('load_tournaments');

      setTournaments(data as Tournament[] || []);
      const tournamentList = data as Tournament[];
      
      if (tournamentList && tournamentList.length > 0) {
        if (!selectedTournament || !tournamentList.find((t: Tournament) => t.id === selectedTournament)) {
            setSelectedTournament(tournamentList[0].id);
        }
      } else {
        setSelectedTournament(null);
      }
    } catch (error) {
      console.error('Error loading tournaments:', error);
      onMessage({ type: 'error', text: `Failed to load tournaments: ${error instanceof Error ? error.message : 'Unknown error'}` });
    } finally {
      setLoading(false);
    }
  }, [selectedTournament, onMessage]);

  useEffect(() => {
    loadTournaments();
  }, [loadTournaments]);

  const tournament = tournaments.find(t => t.id === selectedTournament);

  return (
    <div className="min-h-screen bg-slate-900 font-inter">
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Settings className="w-8 h-8 text-blue-500" />
            Pickems Admin Panel
          </h1>
          <button
            onClick={onLogout}
            className="text-slate-300 hover:text-red-400 transition-colors flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-700"
          >
            <LogOut className="w-5 h-5" />
            Log Out
          </button>
        </div>
      </div>

      <div className="flex">
        <div className="w-64 bg-slate-800 min-h-[calc(100vh-68px)] border-r border-slate-700 p-4">
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
              disabled={!tournament}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'teams' && tournament
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              <Users className="w-5 h-5" />
              Teams
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
            <div className="text-white text-center py-12 flex items-center justify-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                    Loading data...
                </div>
          ) : (
            <>
              {activeTab === 'tournaments' && (
                <TournamentManager
                  tournaments={tournaments}
                  selectedTournament={tournament}
                  onRefresh={loadTournaments}
                  onSelectTournament={setSelectedTournament}
                  onMessage={onMessage}
                />
              )}
              {activeTab === 'teams' && tournament && (
                <TeamManager 
                    tournament={tournament} 
                    onRefresh={loadTournaments} 
                    onMessage={onMessage}
                />
              )}
              {activeTab === 'settings' && <SettingsManager onMessage={onMessage} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
// ------------------------------------

// --- COMPONENTA 1: TOURNAMENT MANAGER (NEMODIFICATĂ FUNCȚIONAL) ---
function TournamentManager({
  tournaments,
  selectedTournament,
  onRefresh,
  onSelectTournament,
  onMessage,
}: {
  tournaments: Tournament[];
  selectedTournament?: Tournament;
  onRefresh: () => void;
  onSelectTournament: (id: string | null) => void;
  onMessage: (msg: Message) => void;
}) {
  const [name, setName] = useState('');
  const [stage, setStage] = useState('groups');
  const [status, setStatus] = useState('upcoming');

  async function createTournament() {
    if (!name.trim()) {
        onMessage({ type: 'error', text: 'Tournament name cannot be empty.' });
        return;
    }
    try {
      await customApi('create_tournament', {
        name,
        stage,
        status,
      });

      onRefresh();
      setName('');
      onMessage({ type: 'success', text: 'Tournament created successfully!' });
    } catch (error) {
      console.error('Error creating tournament:', error);
      onMessage({ type: 'error', text: `Failed to create tournament: ${error instanceof Error ? error.message : 'Unknown error'}` });
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
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500"
          />
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value as 'groups' | 'swiss' | 'playoffs')}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white appearance-none cursor-pointer focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="groups">Groups</option>
            <option value="swiss">Swiss</option>
            <option value="playoffs">Playoffs</option>
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'upcoming' | 'active' | 'completed')}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white appearance-none cursor-pointer focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="upcoming">Upcoming</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <button
          onClick={createTournament}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors font-semibold shadow-md"
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
              onClick={() => onSelectTournament(tournament.id)}
              className={`p-4 rounded-lg flex items-center justify-between cursor-pointer transition-all ${
                tournament.id === selectedTournament?.id ? 'bg-blue-700 ring-2 ring-blue-500' : 'bg-slate-700 hover:bg-slate-600'
              }`}
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

// --- COMPONENTA 2: TEAM MANAGER (NEMODIFICATĂ FUNCȚIONAL) ---
function TeamManager({ tournament, onRefresh, onMessage }: { tournament: Tournament; onRefresh: () => void; onMessage: (msg: Message) => void }) {
  const [teams, setTeams] = useState<Team[]>(tournament.teams ? [...tournament.teams] : []);
  const [newTeam, setNewTeam] = useState({ name: '', region: '', logo: '🏆', group: 'A' });

  useEffect(() => {
    setTeams(tournament.teams ? [...tournament.teams] : []);
  }, [tournament.id, tournament.teams]);

  function addTeam() {
    if (!newTeam.name.trim()) {
        onMessage({ type: 'error', text: 'Team name cannot be empty.' });
        return;
    }
    const team: Team = {
      id: `team_${Date.now()}`,
      ...newTeam,
      group: newTeam.group.toUpperCase(),
    };
    setTeams([...teams, team]);
    setNewTeam({ name: '', region: '', logo: '🏆', group: 'A' });
    onMessage({ type: 'success', text: `Team '${team.name}' added locally. Don't forget to save changes!` });
  }

  function removeTeam(id: string) {
    const teamToRemove = teams.find(t => t.id === id);
    setTeams(teams.filter(t => t.id !== id));
    onMessage({ type: 'success', text: `Team '${teamToRemove?.name}' removed locally. Save to confirm deletion.` });
  }

  async function saveTeams() {
    try {
      await customApi('update_teams', {
        tournament_id: tournament.id,
        teams: teams, 
      });

      onRefresh(); 
      onMessage({ type: 'success', text: 'Teams saved successfully!' });
    } catch (error) {
      console.error('Error saving teams:', error);
      onMessage({ type: 'error', text: `Failed to save teams: ${error instanceof Error ? error.message : 'Unknown error'}` });
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-4">Add Team to {tournament.name}</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            type="text"
            value={newTeam.name}
            onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
            placeholder="Team Name"
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-green-500 focus:border-green-500"
          />
          <input
            type="text"
            value={newTeam.region}
            onChange={(e) => setNewTeam({ ...newTeam, region: e.target.value })}
            placeholder="Region (e.g., EU, NA)"
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-green-500 focus:border-green-500"
          />
          <input
            type="text"
            value={newTeam.logo}
            onChange={(e) => setNewTeam({ ...newTeam, logo: e.target.value })}
            placeholder="Logo (emoji or URL)"
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-green-500 focus:border-green-500"
          />
          <select
            value={newTeam.group}
            onChange={(e) => setNewTeam({ ...newTeam, group: e.target.value })}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white appearance-none cursor-pointer focus:ring-green-500 focus:border-green-500"
          >
            <option value="A">Group A</option>
            <option value="B">Group B</option>
            <option value="C">Group C</option>
            <option value="D">Group D</option>
          </select>
          <button
            onClick={addTeam}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors font-semibold shadow-md"
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
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2 font-semibold shadow-md"
          >
            <Save className="w-5 h-5" />
            Save Changes
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {teams.map((team) => (
            <div
              key={team.id}
              className="bg-slate-700 p-4 rounded-lg flex items-center justify-between border border-slate-600"
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
                className="text-red-400 hover:text-red-300 transition-colors p-2 rounded-full hover:bg-slate-600"
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

// --- COMPONENTA 3: SETTINGS MANAGER (NEMODIFICATĂ FUNCȚIONAL) ---
function SettingsManager({ onMessage }: { onMessage: (msg: Message) => void }) {
  const [scoringRules, setScoringRules] = useState({
    correct_pick: 10,
    perfect_group: 50,
    correct_winner: 100
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await customApi('load_settings', { key: 'scoring_rules' });
        if (data.value) {
          setScoringRules(data.value);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
    loadSettings();
  }, []);

  async function saveSettings() {
    try {
      await customApi('save_settings', {
        key: 'scoring_rules',
        value: scoringRules, 
      });

      onMessage({ type: 'success', text: 'Settings saved successfully!' });
    } catch (error) {
      console.error('Error saving settings:', error);
      onMessage({ type: 'error', text: `Failed to save settings: ${error instanceof Error ? error.message : 'Unknown error'}` });
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
            min="0"
            value={scoringRules.correct_pick}
            onChange={(e) =>
              setScoringRules({ ...scoringRules, correct_pick: parseInt(e.target.value) || 0 })
            }
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white w-full focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-slate-300 mb-2">Perfect Group Points</label>
          <input
            type="number"
            min="0"
            value={scoringRules.perfect_group}
            onChange={(e) =>
              setScoringRules({ ...scoringRules, perfect_group: parseInt(e.target.value) || 0 })
            }
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white w-full focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-slate-300 mb-2">Correct Winner Points</label>
          <input
            type="number"
            min="0"
            value={scoringRules.correct_winner}
            onChange={(e) =>
              setScoringRules({ ...scoringRules, correct_winner: parseInt(e.target.value) || 0 })
            }
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white w-full focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button
          onClick={saveSettings}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2 font-semibold shadow-md"
        >
          <Save className="w-5 h-5" />
          Save Settings
        </button>
      </div>
    </div>
  );
}
// ------------------------------------

// --- COMPONENTA PRINCIPALĂ (AdminApp) ---
// Aceasta gestionează starea de autentificare și afișează ecranul corespunzător.
export default function AdminApp() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [message, setMessage] = useState<Message | null>(null);

    const clearMessage = useCallback(() => setMessage(null), []);
    
    // Verifică starea de autentificare la încărcarea inițială
    useEffect(() => {
        if (localStorage.getItem(AUTH_STORAGE_KEY) === 'true') {
            setIsAuthenticated(true);
        }
    }, []);

    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
        setMessage({ type: 'success', text: 'Login successful. Welcome, Administrator!' });
    };

    const handleLogout = () => {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        setIsAuthenticated(false);
        setMessage({ type: 'success', text: 'You have been logged out.' });
    };

    return (
        <>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
                .font-inter { font-family: 'Inter', sans-serif; }
            `}</style>
            
            {isAuthenticated ? (
                <AdminPanel 
                    onLogout={handleLogout} 
                    onMessage={setMessage} 
                />
            ) : (
                <LoginScreen 
                    onLogin={handleLoginSuccess} 
                    onMessage={setMessage} 
                />
            )}
            
            <MessageDisplay message={message} onClear={clearMessage} />
        </>
    );
}