import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase'; // Asigură-te că calea este corectă

// Interfață simplificată pentru un meci (adaptată la structura ta DB)
interface Match {
    id: string;
    team_a: string; // Ar trebui să fie Team ID/Nume
    team_b: string; // Ar trebui să fie Team ID/Nume
    score_a: number;
    score_b: number;
    status: string;
    stage: string;
}

export default function MatchesAdmin() {
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- Funcție de Încărcare ---
    const fetchMatches = async () => {
        setLoading(true);
        setError(null);
        try {
            // Selectăm toate câmpurile relevante din tabela 'matches'
            const { data, error } = await supabase
                .from('matches')
                .select('id, team_a, team_b, score_a, score_b, status, stage')
                .order('stage', { ascending: true });

            if (error) throw error;
            
            // Dacă echipele sunt stocate ca ID-uri, ar trebui să faci și un join sau o a doua interogare
            // pentru a afișa numele lor aici (nu am inclus asta pentru simplitate inițială).
            
            setMatches(data as Match[]);
        } catch (err) {
            console.error('Eroare la încărcarea meciurilor:', err);
            setError('Nu s-au putut încărca meciurile.');
        } finally {
            setLoading(false);
        }
    };

    // --- Funcție de Actualizare Scor și Status ---
    const handleUpdateScore = async (matchId: string, newScoreA: number, newScoreB: number) => {
        try {
            await supabase
                .from('matches')
                .update({ 
                    score_a: newScoreA, 
                    score_b: newScoreB,
                    status: 'COMPLETED' // Opțional, setează statusul la COMPLETED
                })
                .eq('id', matchId);
            
            alert(`Meciul ${matchId} actualizat.`);
            fetchMatches(); // Reîncărcă datele pentru a vedea modificarea
        } catch (err) {
            console.error('Eroare la actualizarea meciului:', err);
            alert('Eroare la actualizarea meciului. Verifică permisiunile RLS.');
        }
    };

    useEffect(() => {
        fetchMatches();
    }, []);

    if (loading) return <div>Se încarcă meciurile...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="matches-admin">
            <h2>Gestionare Meciuri</h2>
            <p>Poți actualiza scorurile și încheia meciurile direct de aici.</p>
            
            {/* Tabelul cu Meciuri */}
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Faza</th>
                        <th>Echipa A</th>
                        <th>Echipa B</th>
                        <th>Scor</th>
                        <th>Status</th>
                        <th>Acțiuni</th>
                    </tr>
                </thead>
                <tbody>
                    {matches.map((match) => (
                        <MatchRow 
                            key={match.id} 
                            match={match} 
                            onUpdate={handleUpdateScore} 
                        />
                    ))}
                </tbody>
            </table>
            
            {/* Aici poți adăuga un Form pentru crearea unui meci nou */}
        </div>
    );
}

// --- Componenta pentru un Rând de Meci Editabil ---
// O componentă separată pentru a face scorurile editabile
function MatchRow({ match, onUpdate }: { match: Match, onUpdate: (id: string, sa: number, sb: number) => Promise<void> }) {
    const [scoreA, setScoreA] = useState(match.score_a);
    const [scoreB, setScoreB] = useState(match.score_b);

    const handleSave = () => {
        // Asigură-te că scorurile sunt numere valide înainte de salvare
        if (typeof scoreA === 'number' && typeof scoreB === 'number') {
            onUpdate(match.id, scoreA, scoreB);
        }
    };

    return (
        <tr className={match.status === 'COMPLETED' ? 'completed' : ''}>
            <td>{match.id.substring(0, 4)}...</td>
            <td>{match.stage}</td>
            <td>{match.team_a}</td>
            <td>{match.team_b}</td>
            <td>
                <input 
                    type="number" 
                    value={scoreA} 
                    onChange={(e) => setScoreA(parseInt(e.target.value))} 
                    style={{ width: '40px' }}
                /> 
                - 
                <input 
                    type="number" 
                    value={scoreB} 
                    onChange={(e) => setScoreB(parseInt(e.target.value))} 
                    style={{ width: '40px' }}
                />
            </td>
            <td>{match.status}</td>
            <td>
                <button 
                    onClick={handleSave} 
                    disabled={match.status === 'COMPLETED'}
                >
                    Salvare & Finalizare
                </button>
            </td>
        </tr>
    );
}