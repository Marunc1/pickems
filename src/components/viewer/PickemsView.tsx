import { useState, useEffect } from 'react';
import { Trophy, Save, Medal } from 'lucide-react'; 
// ❌ Am eliminat importul către AuthContext, deoarece mediul cu un singur fișier nu îl poate rezolva.
// import { useAuth } from './AuthContext'; 

// --- TIPURI DE DATE DEFINITE MANUAL ---
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
    teams: Team[]; 
    matches: any; 
    bracket_data: any; // Date despre bracket-ul fazei eliminatorii
    created_at: string; 
}

// --- UTILITAR API (REUTILIZARE) ---
const API_URL = '/api.php'; 

async function customApi(action: string, data?: any): Promise<any> {
    const isGet = data === undefined || action === 'load_tournaments' || action === 'load_user_picks';
    const method = isGet ? 'GET' : 'POST';
    
    let url = `${API_URL}?action=${action}`;
    let body = undefined;

    if (!isGet) {
        body = JSON.stringify({ action, ...data });
    } else if (action === 'load_user_picks' && data) {
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

// FIX: Mock pentru useAuth pentru a remedia eroarea de compilare în mediul cu un singur fișier.
// Oferă un utilizator fals care permite salvarea predicțiilor.
const useAuth = () => {
    // În mediul real, acesta ar veni din Firebase/AuthContext
    const mockUser = { id: 'mock-user-123', name: 'Guest Predictor' };
    return { 
        user: mockUser, // Utilizator mock pentru a permite salvarea
        loading: false // Starea de încărcare a autentificării este falsă
    };
};
// ------------------------------------


export default function PickemsView() { // Exportul principal al componentei
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
    // picks va fi un obiect: { [tournamentId]: { groups: { [group]: { [teamId]: rank } }, playoffs: { [round]: { [matchId]: winningTeamId } } } }
    const [picks, setPicks] = useState<any>({}); 
    const [loading, setLoading] = useState(true);
    // Folosim hook-ul mock useAuth
    const { user, loading: authLoading } = useAuth(); 

    useEffect(() => {
        loadTournaments();
    }, []); 

    // Încearcă să încarce picks doar după ce autentificarea s-a terminat ȘI userul este cunoscut
    useEffect(() => {
        if (!authLoading && user) {
            loadUserPicks();
        }
    }, [user, authLoading]); 

    async function loadTournaments() {
        try {
            // NOTE: Aici ar trebui să se încarce și echipele pentru a popula grupele/bracket-ul.
            // Vom folosi date mock statice dacă API-ul nu le returnează.
            const data = await customApi('load_tournaments', { status: 'active' }); 

            const activeTournaments = data as Tournament[] || [];
            
            // Adăugăm date mock la primul turneu pentru a testa UI-ul
            if (activeTournaments.length > 0) {
                 // Date mock pentru 32 de echipe (4 per grup, 8 grupe)
                const mockTeams: Team[] = [
                    // Group A
                    { id: 'teamA1', name: 'Team Alpha 1', region: 'EU', logo: '🛡️', group: 'A' },
                    { id: 'teamA2', name: 'Team Alpha 2', region: 'NA', logo: '🦅', group: 'A' },
                    { id: 'teamA3', name: 'Team Alpha 3', region: 'KR', logo: '🇰🇷', group: 'A' },
                    { id: 'teamA4', name: 'Team Alpha 4', region: 'CN', logo: '🇨🇳', group: 'A' },
                    // Group B
                    { id: 'teamB1', name: 'Team Bravo 1', region: 'EU', logo: '🇪🇺', group: 'B' },
                    { id: 'teamB2', name: 'Team Bravo 2', region: 'NA', logo: '🇺🇸', group: 'B' },
                    { id: 'teamB3', name: 'Team Bravo 3', region: 'KR', logo: '✨', group: 'B' },
                    { id: 'teamB4', name: 'Team Bravo 4', region: 'CN', logo: '🐉', group: 'B' },
                    // Group C
                    { id: 'teamC1', name: 'Team Charlie 1', region: 'EU', logo: '🇫🇷', group: 'C' },
                    { id: 'teamC2', name: 'Team Charlie 2', region: 'NA', logo: '🇨🇦', group: 'C' },
                    { id: 'teamC3', name: 'Team Charlie 3', region: 'KR', logo: '👾', group: 'C' },
                    { id: 'teamC4', name: 'Team Charlie 4', region: 'CN', logo: '⛩️', group: 'C' },
                    // Group D
                    { id: 'teamD1', name: 'Team Delta 1', region: 'EU', logo: '🇩🇪', group: 'D' },
                    { id: 'teamD2', name: 'Team Delta 2', region: 'NA', logo: '🇲🇽', group: 'D' },
                    { id: 'teamD3', name: 'Team Delta 3', region: 'KR', logo: '🐯', group: 'D' },
                    { id: 'teamD4', name: 'Team Delta 4', region: 'CN', logo: '🏮', group: 'D' },
                    // Group E
                    { id: 'teamE1', name: 'Team Echo 1', region: 'EU', logo: '🇪🇸', group: 'E' },
                    { id: 'teamE2', name: 'Team Echo 2', region: 'NA', logo: '🇧🇷', group: 'E' },
                    { id: 'teamE3', name: 'Team Echo 3', region: 'KR', logo: '🐰', group: 'E' },
                    { id: 'teamE4', name: 'Team Echo 4', region: 'CN', logo: '🎋', group: 'E' },
                    // Group F
                    { id: 'teamF1', name: 'Team Foxtrot 1', region: 'EU', logo: '🇮🇹', group: 'F' },
                    { id: 'teamF2', name: 'Team Foxtrot 2', region: 'NA', logo: '🇦🇷', group: 'F' },
                    { id: 'teamF3', name: 'Team Foxtrot 3', region: 'KR', logo: '🐻', group: 'F' },
                    { id: 'teamF4', name: 'Team Foxtrot 4', region: 'CN', logo: '🥮', group: 'F' },
                    // Group G
                    { id: 'teamG1', name: 'Team Golf 1', region: 'EU', logo: '🇵🇱', group: 'G' },
                    { id: 'teamG2', name: 'Team Golf 2', region: 'NA', logo: '🇨🇱', group: 'G' },
                    { id: 'teamG3', name: 'Team Golf 3', region: 'KR', logo: '🦊', group: 'G' },
                    { id: 'teamG4', name: 'Team Golf 4', region: 'CN', logo: '🏯', group: 'G' },
                    // Group H
                    { id: 'teamH1', name: 'Team Hotel 1', region: 'EU', logo: '🇬🇧', group: 'H' },
                    { id: 'teamH2', name: 'Team Hotel 2', region: 'NA', logo: '🇵🇪', group: 'H' },
                    { id: 'teamH3', name: 'Team Hotel 3', region: 'KR', logo: '🐺', group: 'H' },
                    { id: 'teamH4', name: 'Team Hotel 4', region: 'CN', logo: '🍜', group: 'H' },
                ];


                activeTournaments[0].teams = mockTeams;
                // For demonstration, let's set the first tournament to 'playoffs' initially
                activeTournaments[0].stage = 'playoffs'; 

                // Dacă nu există bracket_data, îl populăm cu date mock
                if (!activeTournaments[0].bracket_data) {
                    activeTournaments[0].bracket_data = {
                        'Round of 16': [
                            { id: 'r16_1', team1: 'teamA1', team2: 'teamB2' },
                            { id: 'r16_2', team1: 'teamC1', team2: 'teamD2' },
                            { id: 'r16_3', team1: 'teamE1', team2: 'teamF2' },
                            { id: 'r16_4', team1: 'teamG1', team2: 'teamH2' },
                            { id: 'r16_5', team1: 'teamB1', team2: 'teamA2' },
                            { id: 'r16_6', team1: 'teamD1', team2: 'teamC2' },
                            { id: 'r16_7', team1: 'teamF1', team2: 'teamE2' },
                            { id: 'r16_8', team1: 'teamH1', team2: 'teamG2' },
                        ],
                    };
                }
            }
            
            setTournaments(activeTournaments);
            if (activeTournaments.length > 0) {
                // Setăm primul turneu
                setSelectedTournament(activeTournaments[0]); 
            }
        } catch (error) {
            console.error('Error loading tournaments:', error);
        } finally {
            setLoading(false);
        }
    }

    async function loadUserPicks() {
        if (!user) return; // Verificare de siguranță

        try {
            const data = await customApi('load_user_picks', { user_id: user.id });

            if (data && data.picks) {
                // Structura picks ar trebui să fie { tournamentId: { groups: {}, playoffs: {} } }
                setPicks(data.picks || {}); 
            }
        } catch (error) {
            console.error('Error loading picks:', error);
        }
    }

    async function savePicks() {
        if (!user || !selectedTournament) {
            document.getElementById('pickems-message-box')!.textContent = 'Please sign in or select a tournament first.';
            setTimeout(() => { document.getElementById('pickems-message-box')!.textContent = ''; }, 3000);
            return;
        }

        // Structura de salvare se asigură că există un obiect pentru turneul curent
        const picksToSave = { 
            ...picks, 
            [selectedTournament.id]: picks[selectedTournament.id] || { groups: {}, playoffs: {} } 
        };

        try {
            await customApi('save_user_picks', { 
                user_id: user.id, 
                picks: picksToSave 
            });

            document.getElementById('pickems-message-box')!.textContent = 'Picks saved successfully!';
            setTimeout(() => {
                document.getElementById('pickems-message-box')!.textContent = '';
            }, 3000);
            
        } catch (error) {
            console.error('Error saving picks:', error);
            document.getElementById('pickems-message-box')!.textContent = `Failed to save picks: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
    }

    if (loading || authLoading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading data...</div>
            </div>
        );
    }

    if (!selectedTournament) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-white text-xl">No active tournaments</div>
            </div>
        );
    }
    
    // Verificare UI pentru utilizator neautentificat (deși hook-ul mock returnează mereu un user)
    if (!user) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-white text-xl p-8 bg-slate-800 rounded-xl">Please sign in to make your predictions.</div>
            </div>
        );
    }

    // Obiectul de picks al turneului curent
    const currentTournamentPicks = picks[selectedTournament.id] || { groups: {}, playoffs: {} };

    // Adăugăm o funcție de schimbare a etapei pentru a demonstra UI-ul
    const toggleStage = () => {
        setSelectedTournament(prev => prev ? {
            ...prev,
            stage: prev.stage === 'groups' ? 'playoffs' : 'groups'
        } : null);
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
            {/* Custom Message Box */}
            <div id="pickems-message-box" className="fixed top-4 right-4 bg-green-500 text-white p-3 rounded-lg shadow-xl z-50 transition-all duration-300"></div>

            <div className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-white flex items-center gap-3 mb-2">
                                <Trophy className="w-10 h-10 text-yellow-500" />
                                {selectedTournament.name}
                            </h1>
                            <p className="text-slate-400">Make your predictions and compete with others!</p>
                        </div>
                        <div className="flex gap-4">
                             {/* Buton pentru a schimba între Faza Grupelor și Faza Eliminatorie */}
                            <button
                                onClick={toggleStage}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 shadow-lg hover:shadow-purple-500/50"
                            >
                                {selectedTournament.stage === 'groups' ? 'Go to Playoffs' : 'Go to Groups'}
                            </button>
                            <button
                                onClick={savePicks}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 shadow-lg hover:shadow-blue-500/50"
                            >
                                <Save className="w-5 h-5" />
                                Save Picks
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* -------------------- RENDER GRUPE (8 x 4 = 32 ECHIPE) -------------------- */}
                {selectedTournament.stage === 'groups' && (
                    <GroupStagePickems
                        tournament={selectedTournament}
                        picks={currentTournamentPicks.groups || {}}
                        onPicksChange={(newPicks) =>
                            setPicks({ 
                                ...picks, 
                                [selectedTournament.id]: { ...currentTournamentPicks, groups: newPicks } 
                            })
                        }
                    />
                )}

                {/* -------------------- RENDER FAZA ELIMINATORIE (ROUND OF 16) -------------------- */}
                {selectedTournament.stage === 'playoffs' && ( 
                    <PlayoffsPickems
                        tournament={selectedTournament}
                        picks={currentTournamentPicks.playoffs || {}}
                        onPicksChange={(newPicks) =>
                            setPicks({ 
                                ...picks, 
                                [selectedTournament.id]: { ...currentTournamentPicks, playoffs: newPicks } 
                            })
                        }
                    />
                )}
                {/* Aici ar urma componentele pentru alte etape: SwissStagePickems */}
            </div>
        </div>
    );
}


// -----------------------------------------------------------------------------------
// ------------------------------ COMPONENTA GRUPE (8 GRUPE) -------------------------
// -----------------------------------------------------------------------------------
function GroupStagePickems({
    tournament,
    picks, // { [group]: { [teamId]: rank } }
    onPicksChange
}: {
    tournament: Tournament;
    picks: any;
    onPicksChange: (picks: any) => void;
}) {
    // Ne asigurăm că echipele sunt definite
    const teams = tournament.teams || []; 
    // 8 Grupe conform cerinței (A-H)
    const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

    function handleRankChange(group: string, teamId: string, rank: number) {
        const newPicks = { ...picks };
        if (!newPicks[group]) {
            newPicks[group] = {};
        }

        // Logică de validare: Asigură-te că un singur rank este ales per grup
        for (const existingTeamId in newPicks[group]) {
            if (newPicks[group][existingTeamId] === rank && existingTeamId !== teamId) {
                // Dacă rank-ul este deja ales de o altă echipă din grup, resetează acea alegere
                newPicks[group][existingTeamId] = null; 
            }
        }

        newPicks[group][teamId] = rank;
        onPicksChange(newPicks);
    }

    const getTeamRank = (group: string, teamId: string): number | '' => {
        const rank = picks[group]?.[teamId];
        return rank ? Number(rank) : '';
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-6">
            {groups.map((group) => {
                const groupTeams = teams.filter((team: Team) => team.group === group);
                
                // Sortăm echipele în funcție de rank-ul ales (sau le punem pe cele nealese la sfârșit)
                // 5 este o valoare mai mare decât rank-ul maxim de 4 (pentru 4 echipe)
                const sortedGroupTeams = groupTeams.sort((a: Team, b: Team) => {
                    const rankA = getTeamRank(group, a.id) || 5; 
                    const rankB = getTeamRank(group, b.id) || 5;
                    return rankA - rankB;
                });

                return (
                    <div key={group} className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl">
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2 border-b border-blue-700/50 pb-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-extrabold text-xl shadow-md">
                                {group}
                            </div>
                            Group {group}
                        </h2>
                        <div className="space-y-3">
                            {sortedGroupTeams.map((team: Team) => (
                                <div
                                    key={team.id}
                                    className="bg-slate-700 p-3 rounded-lg flex items-center justify-between hover:bg-slate-600 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{team.logo || '⚽'}</span>
                                        <div>
                                            <h3 className="text-white font-semibold">{team.name}</h3>
                                            <p className="text-slate-400 text-xs">{team.region}</p>
                                        </div>
                                    </div>
                                    {/* Dropdown pentru rank (1 până la 4 echipe) */}
                                    <select
                                        value={getTeamRank(group, team.id)}
                                        onChange={(e) => handleRankChange(group, team.id, parseInt(e.target.value))}
                                        className="px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white font-bold appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="" disabled>Rank</option>
                                        {Array.from({ length: groupTeams.length || 4 }, (_, i) => i + 1).map(rank => (
                                            <option key={rank} value={rank}>
                                                {rank}{rank === 1 ? 'st' : rank === 2 ? 'nd' : rank === 3 ? 'rd' : 'th'}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// -----------------------------------------------------------------------------------
// ---------------------------- COMPONENTA FAZĂ ELIMINATORIE -------------------------
// -----------------------------------------------------------------------------------

// Componentă auxiliară pentru a alege un câștigător de meci
function MatchPick({ match, picks, getTeamName, handlePickChange, round, index }: any) {
    const currentPick = picks[round]?.[match.id];

    // Folosim ID-urile echipelor din structura mock
    const team1Id = match.team1; 
    const team2Id = match.team2; 

    return (
        <div className="bg-slate-700 p-4 rounded-lg shadow-md hover:shadow-blue-500/30 transition-shadow">
            <p className="text-sm text-slate-400 mb-2">Match {index + 1}</p>
            <div className="space-y-2">
                <button 
                    onClick={() => handlePickChange(round, match.id, team1Id)}
                    className={`w-full text-left p-2 rounded-md transition-all truncate ${currentPick === team1Id ? 'bg-blue-600 text-white font-bold shadow-lg' : 'bg-slate-600 hover:bg-slate-500 text-white'}`}
                >
                    {getTeamName(team1Id)} 
                </button>
                <button 
                    onClick={() => handlePickChange(round, match.id, team2Id)}
                    className={`w-full text-left p-2 rounded-md transition-all truncate ${currentPick === team2Id ? 'bg-blue-600 text-white font-bold shadow-lg' : 'bg-slate-600 hover:bg-slate-500 text-white'}`}
                >
                    {getTeamName(team2Id)}
                </button>
            </div>
        </div>
    );
}

function PlayoffsPickems({
    tournament,
    picks, // { [round]: { [matchId]: winningTeamId } }
    onPicksChange
}: {
    tournament: Tournament;
    picks: any;
    onPicksChange: (picks: any) => void;
}) {
    // Etapele pentru un bracket de 16 echipe
    const rounds = ['Round of 16', 'Quarterfinals', 'Semifinals', 'Final'];

    // Funcție pentru a obține numele echipei din ID (necesită datele din turneu)
    const getTeamName = (teamId: string) => {
        // Dacă ID-ul începe cu 'TBD', înseamnă că este un meci care încă nu a fost determinat
        if (teamId.startsWith('TBD')) return teamId;
        return tournament.teams.find(t => t.id === teamId)?.name || 'TBD (API)';
    };

    // Funcție pentru a actualiza predicția pentru o anumită etapă/meci
    function handlePickChange(round: string, matchId: string, winningTeamId: string) {
        const newPicks = { ...picks };
        if (!newPicks[round]) {
            newPicks[round] = {};
        }

        newPicks[round][matchId] = winningTeamId;
        onPicksChange(newPicks);
    }

    // Extrage datele de bază din bracket_data (Round of 16)
    const roundOf16Matches = tournament.bracket_data?.['Round of 16'] || [];

    // Generează meciurile din sferturi, semifinale și finală pe baza predicțiilor
    const generateNextRound = (currentRound: string, nextRoundIdPrefix: string, matchesPerRound: number) => {
        const previousRoundPicks = picks[currentRound] || {};
        const nextRoundMatches = [];
        const matches = (roundOf16Matches.length > 0 && currentRound === 'Round of 16') ? roundOf16Matches : 
                        (currentRound === 'Quarterfinals') ? mockBracketData['Quarterfinals'] :
                        (currentRound === 'Semifinals') ? mockBracketData['Semifinals'] :
                        [];


        for (let i = 0; i < matchesPerRound; i += 2) {
            // ID-urile meciurilor din runda curentă pe care se bazează meciul următor
            const match1Id = `r${currentRound.charAt(0).toLowerCase()}_${i + 1}`;
            const match2Id = `r${currentRound.charAt(0).toLowerCase()}_${i + 2}`;

            // Câștigătorii din runda precedentă devin echipele din runda curentă
            const team1Id = previousRoundPicks[match1Id] || `TBD-W${i + 1}`;
            const team2Id = previousRoundPicks[match2Id] || `TBD-W${i + 2}`;
            
            nextRoundMatches.push({
                id: `${nextRoundIdPrefix}_${(i / 2) + 1}`,
                team1: team1Id,
                team2: team2Id,
            });
        }
        return nextRoundMatches;
    };
    
    // Obiectul mock (actualizat dinamic cu predicțiile)
    const mockBracketData = {
        'Round of 16': roundOf16Matches,
        // Sferturi: Se bazează pe predicțiile din Runda 16
        'Quarterfinals': [
            { id: 'qf_1', team1: picks['Round of 16']?.['r16_1'] || 'TBD-W1', team2: picks['Round of 16']?.['r16_2'] || 'TBD-W2' },
            { id: 'qf_2', team1: picks['Round of 16']?.['r16_3'] || 'TBD-W3', team2: picks['Round of 16']?.['r16_4'] || 'TBD-W4' },
            { id: 'qf_3', team1: picks['Round of 16']?.['r16_5'] || 'TBD-W5', team2: picks['Round of 16']?.['r16_6'] || 'TBD-W6' },
            { id: 'qf_4', team1: picks['Round of 16']?.['r16_7'] || 'TBD-W7', team2: picks['Round of 16']?.['r16_8'] || 'TBD-W8' },
        ],
        // Semifinale: Se bazează pe predicțiile din Sferturi
        'Semifinals': [
            { id: 'sf_1', team1: picks['Quarterfinals']?.['qf_1'] || 'TBD-Q1', team2: picks['Quarterfinals']?.['qf_2'] || 'TBD-Q2' },
            { id: 'sf_2', team1: picks['Quarterfinals']?.['qf_3'] || 'TBD-Q3', team2: picks['Quarterfinals']?.['qf_4'] || 'TBD-Q4' },
        ],
        // Finala: Se bazează pe predicțiile din Semifinale
        'Final': [
            { id: 'fn_1', team1: picks['Semifinals']?.['sf_1'] || 'TBD-S1', team2: picks['Semifinals']?.['sf_2'] || 'TBD-S2' },
        ],
    };

    // Datele reale de afișat (nu mai e nevoie de slice)
    const roundDataToDisplay = mockBracketData;


    return (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-2xl">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-2 border-b border-blue-700/50 pb-3">
                <Medal className="w-8 h-8 text-yellow-500"/>
                Fază Eliminatorie (Round of 16)
            </h2>
            <p className="text-slate-400 mb-8">
                Alegeți echipa câștigătoare pentru fiecare meci. Câștigătorii vor fi promovați automat în runda următoare, bazat pe predicțiile tale.
            </p>
            
            <div className="flex flex-col gap-8 md:gap-12">
                {rounds.map(round => (
                    <div key={round}>
                        <h3 className="text-2xl font-semibold text-blue-400 border-b-2 border-blue-700/50 pb-2 mb-6">{round}</h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Verificăm dacă runda are meciuri definite în mockBracketData */}
                            {roundDataToDisplay[round as keyof typeof roundDataToDisplay] && 
                             roundDataToDisplay[round as keyof typeof roundDataToDisplay].length > 0 ? (
                                roundDataToDisplay[round as keyof typeof roundDataToDisplay].map((match: any, index: number) => (
                                    <MatchPick 
                                        key={match.id} 
                                        match={match} 
                                        picks={picks} 
                                        getTeamName={getTeamName} 
                                        handlePickChange={handlePickChange} 
                                        round={round} 
                                        index={index}
                                    />
                                ))
                            ) : (
                                <p className="text-slate-500 text-sm col-span-full">Waiting for previous round picks to be made...</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}