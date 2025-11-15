import { useState, useEffect } from 'react';
import { supabase, type Tournament, type Team } from '../../lib/supabase';
import { Settings, Users, Trophy, Grid3x3, ListTree, LayoutDashboard } from 'lucide-react';
import GroupsManager from './GroupsManager';
import BracketManager from './BracketManager';
import TournamentManager from './TournamentManager';
import TeamManager from './TeamManager'; // Importăm noul component TeamManager
import SettingsManager from './SettingsManager'; // Importăm noul component SettingsManager
import MatchesAdmin from '../../pages/admin/MatchesAdmin'; // Importăm MatchesAdmin
import { useOutletContext } from 'react-router-dom';
import { getQualifiedTeams } from '../../utils/tournamentUtils'; // Importăm utilitarul

// Definirea tipului pentru contextul Outlet
type OutletContextType = {
  tournaments: Tournament[];
  selectedTournamentId: string | null;
  setSelectedTournamentId: (id: string) => void;
  onRefreshTournaments: () => void;
};

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'tournaments' | 'teams' | 'groups' | 'bracket' | 'matches' | 'settings'>('tournaments');

  // Extragem datele din contextul Outlet
  const { tournaments, selectedTournamentId, setSelectedTournamentId, onRefreshTournaments } = useOutletContext<OutletContextType>();

  const tournament = tournaments.find(t => t.id === selectedTournamentId);

  // Calculează echipele calificate dacă există un turneu selectat și suntem pe tab-ul de bracket
  const qualifiedTeams = tournament && tournament.teams && tournament.matches && activeTab === 'bracket'
    ? getQualifiedTeams(tournament.teams, tournament.matches as any[])
    : [];

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-blue-500" />
            General Admin Panel
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
              onClick={() => setActiveTab('matches')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'matches'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <ListTree className="w-5 h-5" /> {/* Reusing ListTree icon for matches */}
              Matches
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
                <BracketManager
                  tournament={tournament}
                  onRefresh={onRefreshTournaments}
                  qualifiedTeams={qualifiedTeams} // Pass qualified teams
                />
              )}
              {activeTab === 'matches' && tournament && (
                <MatchesAdmin selectedTournamentId={selectedTournamentId} />
              )}
              {activeTab === 'settings' && <SettingsManager />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}