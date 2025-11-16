import { supabase } from '../lib/supabase';

/**
 * Calls the Supabase Edge Function to recalculate and update the total score for all users.
 */
export async function recalculateAllUserScores() {
  console.log('Calling Supabase Edge Function to recalculate scores...');
  try {
    const { data, error } = await supabase.functions.invoke('recalculate-scores', {
      method: 'POST',
      // No body needed as the function fetches all data itself
    });

    if (error) throw error;
    console.log('Edge Function response:', data);
    return data;
  } catch (error) {
    console.error('Error invoking recalculate-scores Edge Function:', error);
    throw error;
  }
}