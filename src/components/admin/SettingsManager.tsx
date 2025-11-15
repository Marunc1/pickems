import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Settings, Save } from 'lucide-react';

export default function SettingsManager() {
  const [scoringRules, setScoringRules] = useState({
    correct_pick: 10,
    perfect_group: 50,
    correct_winner: 100
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
        setScoringRules(data.value);
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
          value: scoringRules
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
        <div>
          <label htmlFor="correct-pick" className="block text-slate-300 mb-2 text-lg">Points for Correct Pick</label>
          <input
            id="correct-pick"
            type="number"
            value={scoringRules.correct_pick}
            onChange={(e) =>
              setScoringRules({ ...scoringRules, correct_pick: parseInt(e.target.value) || 0 })
            }
            className="px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="perfect-group" className="block text-slate-300 mb-2 text-lg">Points for Perfect Group Prediction</label>
          <input
            id="perfect-group"
            type="number"
            value={scoringRules.perfect_group}
            onChange={(e) =>
              setScoringRules({ ...scoringRules, perfect_group: parseInt(e.target.value) || 0 })
            }
            className="px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="correct-winner" className="block text-slate-300 mb-2 text-lg">Points for Correct Tournament Winner</label>
          <input
            id="correct-winner"
            type="number"
            value={scoringRules.correct_winner}
            onChange={(e) =>
              setScoringRules({ ...scoringRules, correct_winner: parseInt(e.target.value) || 0 })
            }
            className="px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
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