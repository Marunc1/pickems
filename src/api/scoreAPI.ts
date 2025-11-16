import { supabase } from '../lib/supabase';
import type { Tournament, UserData, AdminConfig } from '../lib/supabase';

/**
 * Recalculates and updates the total score for all users based on their picks
 * and the actual results of all active/completed tournaments.
 */
export async function recalculateAllUserScores() {
  console.log('Starting score recalculation...');
  try {
    // 1. Fetch scoring rules
    const { data: adminConfigData, error: adminConfigError } = await supabase
      .from('admin_config')
      .select('value')
      .eq('key', 'scoring_rules')
      .maybeSingle();

    if (adminConfigError) throw adminConfigError;

    // Default scoring rules with round-specific points
    const defaultScoringRules = {
      round_of_16: 2,
      quarterfinals: 4,
      semifinals: 6,
      third_place: 10,
      finals: 15,
    };

    const scoringRules = { ...defaultScoringRules, ...(adminConfigData?.value || {}) } as typeof defaultScoringRules;
    console.log('Scoring Rules (effective):', scoringRules);

    // 2. Fetch all active/completed tournaments with their bracket data
    const { data: tournamentsData, error: tournamentsError } = await supabase
      .from('tournament_settings')
      .select('id, name, bracket_data, status, teams'); // Added 'teams' to get team names for logging

    if (tournamentsError) throw tournamentsError;

    const relevantTournaments = (tournamentsData || []).filter(
      (t: Tournament) => t.status === 'active' || t.status === 'completed'
    );
    console.log('Relevant Tournaments:', relevantTournaments.map(t => ({ id: t.id, name: t.name, status: t.status, bracket_data_exists: !!t.bracket_data })));


    // 3. Fetch all user data (including their picks)
    const { data: usersData, error: usersError } = await supabase
      .from('user_data')
      .select('id, user_id, username, picks');

    if (usersError) throw usersError;

    const users = usersData || [];
    console.log('Users fetched:', users.map(u => ({ id: u.id, username: u.username, picks_exists: !!u.picks })));

    // Helper to get team name by ID
    const getTeamName = (tournament: Tournament, teamId?: string) => {
      if (!teamId) return 'N/A';
      return tournament.teams?.find(t => t.id === teamId)?.name || `Unknown Team (${teamId})`;
    };

    // 4. Recalculate score for each user
    const updates = users.map(async (user: UserData) => {
      let totalScore = 0;
      const userPicks = user.picks || {};
      console.log(`\n--- Processing user: ${user.username} (ID: ${user.user_id}) ---`);
      console.log(`  User's raw picks object:`, JSON.stringify(userPicks));

      for (const tournament of relevantTournaments) {
        const tournamentPicks = userPicks[tournament.id] || {};
        const bracketMatches = (tournament.bracket_data as any)?.matches || [];
        console.log(`  Tournament: ${tournament.name} (ID: ${tournament.id}), Status: ${tournament.status}, Bracket matches count: ${bracketMatches.length}`);
        console.log(`  User picks for this tournament (${tournament.name}):`, JSON.stringify(tournamentPicks));


        for (const match of bracketMatches) {
          console.log(`    Match ${match.id} (Round: ${match.round}, Match #: ${match.match_number}):`);
          console.log(`      Team 1: ${getTeamName(tournament, match.team1_id)} (ID: ${match.team1_id}), Score: ${match.team1_score}`);
          console.log(`      Team 2: ${getTeamName(tournament, match.team2_id)} (ID: ${match.team2_id}), Score: ${match.team2_score}`);
          console.log(`      Actual Winner ID (from bracket_data): ${match.winner_id}`);
          console.log(`      Actual Winner Name: ${getTeamName(tournament, match.winner_id)}`);

          // Only score matches that have a determined winner
          if (match.winner_id) {
            const userPickedTeamId = tournamentPicks[match.id];
            const actualWinnerId = match.winner_id;
            const isCorrectPick = userPickedTeamId === actualWinnerId;

            console.log(`      User Picked Team ID: ${userPickedTeamId}`);
            console.log(`      User Picked Team Name: ${getTeamName(tournament, userPickedTeamId)}`);
            console.log(`      Is Correct Pick? ${isCorrectPick}`);

            if (isCorrectPick) {
              let pointsForRound = 0;
              switch (match.round) {
                case 'round_of_16':
                  pointsForRound = scoringRules.round_of_16;
                  break;
                case 'quarterfinals':
                  pointsForRound = scoringRules.quarterfinals;
                  break;
                case 'semifinals':
                  pointsForRound = scoringRules.semifinals;
                  break;
                case 'third_place':
                  pointsForRound = scoringRules.third_place;
                  break;
                case 'finals':
                  pointsForRound = scoringRules.finals;
                  break;
                default:
                  pointsForRound = 0; // No points for unknown rounds
              }
              totalScore += pointsForRound;
              console.log(`      -> Correct pick for ${match.round}! Adding ${pointsForRound} points. Current total: ${totalScore}`);
            } else {
              console.log(`      -> Incorrect pick or no pick for this match.`);
            }
          } else {
            console.log(`    Match ${match.id}: No winner_id yet. Skipping scoring for this match.`);
          }
        }
      }

      // Update the user's score in the database
      const { error: updateError } = await supabase
        .from('user_data')
        .update({ score: totalScore })
        .eq('user_id', user.user_id);

      if (updateError) {
        console.error(`Error updating score for user ${user.username} (ID: ${user.user_id}):`, updateError);
      } else {
        console.log(`\nSuccessfully updated score for user ${user.username} to ${totalScore}`);
      }
    });

    await Promise.all(updates);
    console.log('\nAll user scores recalculation process completed!');

  } catch (error) {
    console.error('Error during score recalculation:', error);
    throw error;
  }
}