import { useState, useEffect } from 'react';
import { supabase, type Tournament } from '../../lib/supabase';
import { Plus, Save, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';

interface TournamentManagerProps {
  tournaments: Tournament[];
  selectedTournamentId: string | null;
  setSelectedTournamentId: (id: string) => void;
  onRefresh: () => void;
}

export default function TournamentManager({
  tournaments,
  selectedTournamentId,
  setSelectedTournamentId,
  onRefresh
}: TournamentManagerProps) {
  const [newName, setNewName] = useState('');
  const [newStage, setNewStage] = useState('groups');
  const [newStatus, setNewStatus] = useState('upcoming');
  const [editingTournamentId, setEditingTournamentId] = useState<string | null>(null);
  const [editedTournament, setEditedTournament] = useState<Partial<Tournament> | null>(null);

  async function createTournament() {
    if (!newName) {
      alert('Tournament name cannot be empty.');
      return;
    }
    try {
      const { data, error } = await supabase.from('tournament_settings').insert({
        name: newName,
        stage: newStage,
        status: newStatus,
        teams: [],
        matches: [],
        bracket_data: {}
      }).select(); // Adăugăm .select() pentru a obține datele inserate

      if (error) throw error;
      onRefresh();
      setNewName('');
      setNewStage('groups');
      setNewStatus('upcoming');
      if (data && data.length > 0) {
        setSelectedTournamentId(data[0].id); // Selectează noul turneu creat
      }
    } catch (error) {
      console.error('Error creating tournament:', error);
      alert('Error creating tournament');
    }
  }

  function startEditing(tournament: Tournament) {
    setEditingTournamentId(tournament.id);
    setEditedTournament({ ...tournament });
  }

  function cancelEditing() {
    setEditingTournamentId(null);
    setEditedTournament(null);
  }

  async function saveEditedTournament() {
    if (!editedTournament || !editedTournament.id) return;
    try {
      const { error } = await supabase
        .from('tournament_settings')
        .update({
          name: editedTournament.name,
          stage: editedTournament.stage,
          status: editedTournament.status,
        })
        .eq('id', editedTournament.id);

      if (error) throw error;
      onRefresh();
      cancelEditing();
      alert('Tournament updated successfully!');
    } catch (error) {
      console.error('Error updating tournament:', error);
      alert('Error updating tournament');
    }
  }

  async function deleteTournament(id: string) {
    if (!confirm('Are you sure you want to delete this tournament? This action cannot be undone.')) {
      return;
    }
    try {
      const { error } = await supabase
        .from('tournament_settings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      onRefresh();
      if (selectedTournamentId === id) {
        setSelectedTournamentId(tournaments.length > 1 ? tournaments[0].id : null);
      }
      alert('Tournament deleted successfully!');
    } catch (error) {
      console.error('Error deleting tournament:', error);
      alert('Error deleting tournament');
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
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g., Worlds 2025"
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="tournament-stage" className="block text-sm font-medium text-slate-300 mb-2">Stage</label>
            <select
              id="tournament-stage"
              value={newStage}
              onChange={(e) => setNewStage(e.target.value)}
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
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
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
                className={`bg-slate-700 p-4 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between hover:bg-slate-600 transition-colors duration-200 ${
                  selectedTournamentId === tournament.id ? 'border-2 border-blue-500' : 'border border-slate-600'
                }`}
              >
                <div className="flex-1 mb-3 md:mb-0">
                  {editingTournamentId === tournament.id ? (
                    <input
                      type="text"
                      value={editedTournament?.name || ''}
                      onChange={(e) => setEditedTournament(prev => prev ? { ...prev, name: e.target.value } : null)}
                      className="bg-slate-600 border border-slate-500 rounded px-2 py-1 text-white text-lg font-semibold w-full"
                    />
                  ) : (
                    <h3 className="text-white font-semibold text-lg">{tournament.name}</h3>
                  )}
                  <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
                    Stage:
                    {editingTournamentId === tournament.id ? (
                      <select
                        value={editedTournament?.stage || ''}
                        onChange={(e) => setEditedTournament(prev => prev ? { ...prev, stage: e.target.value } : null)}
                        className="bg-slate-600 border border-slate-500 rounded px-2 py-1 text-white text-sm"
                      >
                        <option value="groups">Groups</option>
                        <option value="swiss">Swiss</option>
                        <option value="playoffs">Playoffs</option>
                      </select>
                    ) : (
                      <span className="font-medium text-blue-300">{tournament.stage}</span>
                    )}
                    • Status:
                    {editingTournamentId === tournament.id ? (
                      <select
                        value={editedTournament?.status || ''}
                        onChange={(e) => setEditedTournament(prev => prev ? { ...prev, status: e.target.value } : null)}
                        className="bg-slate-600 border border-slate-500 rounded px-2 py-1 text-white text-sm"
                      >
                        <option value="upcoming">Upcoming</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                      </select>
                    ) : (
                      <span className={`font-medium ${tournament.status === 'active' ? 'text-green-400' : tournament.status === 'upcoming' ? 'text-yellow-400' : 'text-red-400'}`}>{tournament.status}</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-300 text-sm bg-slate-600 px-3 py-1 rounded-full">
                    {tournament.teams?.length || 0} teams
                  </span>
                  {editingTournamentId === tournament.id ? (
                    <>
                      <button
                        onClick={saveEditedTournament}
                        className="text-green-400 hover:text-green-300 transition-colors p-2 rounded-full hover:bg-slate-500"
                        title="Save Changes"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="text-red-400 hover:text-red-300 transition-colors p-2 rounded-full hover:bg-slate-500"
                        title="Cancel Edit"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEditing(tournament)}
                        className="text-blue-400 hover:text-blue-300 transition-colors p-2 rounded-full hover:bg-slate-500"
                        title="Edit Tournament"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteTournament(tournament.id)}
                        className="text-red-400 hover:text-red-300 transition-colors p-2 rounded-full hover:bg-slate-500"
                        title="Delete Tournament"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setSelectedTournamentId(tournament.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedTournamentId === tournament.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    Select
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}