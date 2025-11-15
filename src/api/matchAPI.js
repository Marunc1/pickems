// src/api/matchAPI.js

// 1. Citirea tuturor meciurilor (pentru a le afișa în tabelă)
export async function getMatches() {
  const { data, error } = await supabase
    .from('matches')
    .select('id, team_a, team_b, score_a, score_b, status, stage');
    
  if (error) throw error;
  return data;
}

// 2. Crearea unui meci nou
export async function createMatch(newMatchData) {
  const { error } = await supabase
    .from('matches')
    .insert(newMatchData); // Obiectul: { team_a: 'ID_A', team_b: 'ID_B', stage: 'Group Stage', ... }
    
  if (error) throw error;
}

// 3. Actualizarea scorului sau statusului
export async function updateMatch(matchId, updates) {
  const { error } = await supabase
    .from('matches')
    .update(updates) // Obiectul: { score_a: 2, score_b: 1, status: 'COMPLETED' }
    .eq('id', matchId);
    
  if (error) throw error;
}