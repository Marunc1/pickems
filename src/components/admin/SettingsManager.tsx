import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Settings, Save } from 'lucide-react';

export default function SettingsManager() {
  const [scoringRules, setScoringRules] = useState({
    round_of_16: 2,
    quarterfinals: 4,
    semifinals: 6,
    third_place: 10,
    finals: 15,
    // Removed perfect_group and correct_winner from initial state
  });

  useEffect(() => {
    loadScoringRules();
  }, []);

  async function loadScoringRules() {
    try {
      const { data, error } = await supabase
        .from('admin_config')
        .select('value')
        .eq('key', 'scoring_rules')
        .maybeSingle();

      if (error) throw error;
      if (data && data.value) {
        // Filter out perfect_group and correct_winner if they exist in stored data
        const { perfect_group, correct_winner, ...rest } = data.value;
        setScoringRules(prev => ({ ...prev, ...rest })); // Merge with defaults, excluding removed fields
      }
    } catch (error) {
      console.error('Error loading scoring rules:', error);
    }
  }

  async function saveSettings() {
    try {
      const { error } = await supabase
        .from('admin_config')
        .upsert({
          key: 'scoring_rules',
          value: scoringRules // Save only the current state, which excludes removed fields
        }, { onConflict: 'key' }); // Use onConflict to update if key exists

      if (error) throw error;
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings');
    }
  }

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-5 flex items-center gap-3">
        <Settings className="w-7 h-7 text-blue-500" />
        Scoring Rules
      </h2>
      <p className="text-slate-400 mb-6">Configure how points are awarded for predictions.</p>
      <div className="space-y-5">
        {/* Fields for bracket rounds */}
        <div>
          <label htmlFor="round-of-16-points" className="block text-slate-300 mb-2 text-lg">Points for Round of 16 Pick</label>
          <input
            id="round-of-16-points"
            type="number"
            value={scoringRules.round_of_16}
            onChange={(e) =>
              setScoringRules({ ...scoringRules, round_of_16: parseInt(e.target.value) || 0 })
            }
            className="px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="quarterfinals-points" className="block text-slate-300 mb-2 text-lg">Points for Quarter Finals Pick</label>
          <input
            id="quarterfinals-points"
            type="number"
            value={scoringRules.quarterfinals}
            onChange={(e) =>
              setScoringRules({ ...scoringRules, quarterfinals: parseInt(e.target.value) || 0 })
            }
            className="px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="semifinals-points" className="block text-slate-300 mb-2 text-lg">Points for Semi Finals Pick</label>
          <input
            id="semifinals-points"
            type="number"
            value={scoringRules.semifinals}
            onChange={(e) =>
              setScoringRules({ ...scoringRules, semifinals: parseInt(e.target.value) || 0 })
            }
            className="px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="third-place-points" className="block text-slate-300 mb-2 text-lg">Points for 3rd Place Match Pick</label>
          <input
            id="third-place-points"
            type="number"
            value={scoringRules.third_place}
            onChange={(e) =>
              setScoringRules({ ...scoringRules, third_place: parseInt(e.target.value) || 0 })
            }
            className="px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="finals-points" className="block text-slate-300 mb-2 text-lg">Points for Finals Pick</label>
          <input
            id="finals-points"
            type="number"
            value={scoringRules.finals}
            onChange={(e) =>
              setScoringRules({ ...scoringRules, finals: parseInt(e.target.value) || 0 })
            }
            className="px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Removed existing fields for perfect_group and correct_winner */}
        
        <button
          onClick={saveSettings}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold flex items-center gap-2"
        >
          <Save className="w-5 h-5" />
          Save Settings
        </button>
      </div>
    </div>
  );
}