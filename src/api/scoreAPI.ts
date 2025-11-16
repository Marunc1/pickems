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

    const scoringRules = (adminConfigData?.value || {
      correct_pick: 10,
      perfect_group: 50, // Not used in bracket logic, but kept for consistency
      correct_winner: 100 // Not used in bracket logic, but kept for consistency
    }) as AdminConfig['value'];
    console.log('Scoring Rules:', scoringRules);

    // 2. Fetch all active/completed tournaments with their bracket data
    const { data: tournamentsData, error: tournamentsError } = await supabase
      .from('tournament_settings')
      .select('id, bracket_data, status');

    if (tournamentsError) throw tournamentsError;

    const relevantTournaments = (tournamentsData || []).filter(
      (t: Tournament) => t.status === 'active' || t.status === 'completed'
    );
    console.log('Relevant Tournaments:', relevantTournaments.map(t => ({ id: t.id, status: t.status, bracket_data_exists: !!t.bracket_data })));


    // 3. Fetch all user data (including their picks)
    const { data: usersData, error: usersError } = await supabase
      .from('user_data')
      .select('id, user_id, picks');

    if (usersError) throw usersError;

    const users = usersData || [];
    console.log('Users fetched:', users.map(u => ({ id: u.id, username: u.username, picks_exists: !!u.picks })));

    // 4. Recalculate score for each user
    const updates = users.map(async (user: UserData) => {
      let totalScore = 0;
      const userPicks = user.picks || {};
      console.log(`Processing user: ${user.username}, current picks:`, userPicks);

      for (const tournament of relevantTournaments) {
        const tournamentPicks = userPicks[tournament.id] || {};
        const bracketMatches = (tournament.bracket_data as any)?.matches || [];
        console.log(`  Tournament: ${tournament.name} (${tournament.id}), bracket matches count: ${bracketMatches.length}`);
        console.log(`  User picks for this tournament:`, tournamentPicks);


        for (const match of bracketMatches) {
          // Only score matches that have a determined winner
          if (match.winner_id) {
            console.log(`    Match ${match.id}: Winner ID: ${match.winner_id}, User pick: ${tournamentPicks[match.id]}`);
            if (tournamentPicks[match.id] === match.winner_id) {
              totalScore += scoringRules.correct_pick;
              console.log(`      Correct pick! Adding ${scoringRules.correct_pick} points. Current total: ${totalScore}`);
            } else {
              console.log(`      Incorrect pick or no pick.`);
            }
          } else {
            console.log(`    Match ${match.id}: No winner_id yet.`);
          }
        }
      }

      // Update the user's score in the database
      const { error: updateError } = await supabase
        .from('user_data')
        .update({ score: totalScore })
        .eq('user_id', user.user_id);

      if (updateError) {
        console.error(`Error updating score for user ${user.user_id}:`, updateError);
        // Continue with other users even if one update fails
      } else {
        console.log(`Successfully updated score for user ${user.username} to ${totalScore}`);
      }
    });

    await Promise.all(updates);
    console.log('All user scores recalculated successfully!');

  } catch (error) {
    console.error('Error during score recalculation:', error);
    throw error;
  }
}