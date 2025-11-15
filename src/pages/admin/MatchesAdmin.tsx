import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Edit, CheckCircle, XCircle, ListTree } from 'lucide-react';

interface Match {
    id: string;
    team_a: string;
    team_b: string;
    score_a: number;
    score_b: number;
    status: 'upcoming' | 'live' | 'completed';
    stage: string;
}

export default function MatchesAdmin() {
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMatches = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('matches')
                .select('id, team_a, team_b, score_a, score_b, status, stage')
                .order('stage', { ascending: true })
                .order('created_at', { ascending: true });

            if (error) throw error;
            
            setMatches(data as Match[]);
        } catch (err) {
            console.error('Eroare la încărcarea meciurilor:', err);
            setError('Nu s-au putut încărca meciurile.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateScore = async (matchId: string, newScoreA: number, newScoreB: number) => {
        try {
            await supabase
                .from('matches')
                .update({ 
                    score_a: newScoreA, 
                    score_b: newScoreB,
                    status: 'completed' 
                })
                .eq('id', matchId);
            
            alert(`Meciul ${matchId.substring(0, 4)}... actualizat și finalizat.`);
            fetchMatches();
        } catch (err) {
            console.error('Eroare la actualizarea meciului:', err);
            alert('Eroare la actualizarea meciului. Verifică permisiunile RLS.');
        }
    };

    useEffect(() => {
        fetchMatches();
    }, []);

    if (loading) return <div className="text-white text-center py-12">Se încarcă meciurile...</div>;
    if (error) return <div className="text-red-500 text-center py-12">{error}</div>;

    return (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <ListTree className="w-8 h-8 text-blue-500" />
                Gestionare Meciuri
            </h2>
            <p className="text-slate-400 mb-8">Poți actualiza scorurile și încheia meciurile direct de aici.</p>
            
            <div className="overflow-x-auto">
                <table className="min-w-full bg-slate-700 rounded-lg overflow-hidden">
                    <thead className="bg-slate-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Faza</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Echipa A</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Echipa B</th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-slate-300 uppercase tracking-wider">Scor</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-slate-300 uppercase tracking-wider">Acțiuni</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-600">
                        {matches.map((match) => (
                            <MatchRow 
                                key={match.id} 
                                match={match} 
                                onUpdate={handleUpdateScore} 
                            />
                        ))}
                    </tbody>
                </table>
            </div>
            
            {matches.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-lg">
                    Nu există meciuri de afișat.
                </div>
            )}
        </div>
    );
}

function MatchRow({ match, onUpdate }: { match: Match, onUpdate: (id: string, sa: number, sb: number) => Promise<void> }) {
    const [scoreA, setScoreA] = useState(match.score_a);
    const [scoreB, setScoreB] = useState(match.score_b);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        setScoreA(match.score_a);
        setScoreB(match.score_b);
    }, [match.score_a, match.score_b]);

    const handleSave = () => {
        if (typeof scoreA === 'number' && typeof scoreB === 'number') {
            onUpdate(match.id, scoreA, scoreB);
            setIsEditing(false);
        }
    };

    const isCompleted = match.status === 'completed';

    return (
        <tr className={`transition-colors duration-200 ${isCompleted ? 'bg-slate-700/30 text-slate-500' : 'bg-slate-800 hover:bg-slate-700/50'}`}>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-300">{match.id.substring(0, 8)}...</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{match.stage}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{match.team_a}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{match.team_b}</td>
            <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className="flex items-center justify-center gap-2">
                    <input 
                        type="number" 
                        value={scoreA} 
                        onChange={(e) => setScoreA(parseInt(e.target.value) || 0)} 
                        className="w-16 px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-center font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isCompleted || !isEditing}
                    /> 
                    <span className="text-slate-400">-</span> 
                    <input 
                        type="number" 
                        value={scoreB} 
                        onChange={(e) => setScoreB(parseInt(e.target.value) || 0)} 
                        className="w-16 px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-center font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isCompleted || !isEditing}
                    />
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    isCompleted ? 'bg-green-100 text-green-800' : 
                    match.status === 'live' ? 'bg-blue-100 text-blue-800' : 
                    'bg-yellow-100 text-yellow-800'
                }`}>
                    {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                {isCompleted ? (
                    <span className="text-green-500 flex items-center justify-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Finalizat
                    </span>
                ) : (
                    isEditing ? (
                        <button 
                            onClick={handleSave} 
                            className="text-green-400 hover:text-green-300 transition-colors flex items-center justify-center gap-1"
                        >
                            <CheckCircle className="w-5 h-5" /> Salvează
                        </button>
                    ) : (
                        <button 
                            onClick={() => setIsEditing(true)} 
                            className="text-blue-400 hover:text-blue-300 transition-colors flex items-center justify-center gap-1"
                        >
                            <Edit className="w-5 h-5" /> Editează
                        </button>
                    )
                )}
            </td>
        </tr>
    );
}