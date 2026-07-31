import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (data) {
      setSettings(data);
    } else {
      // Create default settings if none exist (fallback if trigger failed)
      const defaultSettings = { user_id: user.id, step_goal: 10000, sleep_goal: 8, water_goal: 3, cal_goal: 2500 };
      await supabase.from('user_settings').insert(defaultSettings);
      setSettings(defaultSettings);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.from('user_settings').update({
      step_goal: parseInt(settings.step_goal),
      sleep_goal: parseFloat(settings.sleep_goal),
      water_goal: parseFloat(settings.water_goal),
      cal_goal: parseInt(settings.cal_goal),
      start_weight: settings.start_weight ? parseFloat(settings.start_weight) : null
    }).eq('user_id', user.id);
    
    alert('Settings saved!');
    setSaving(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="glass-panel" style={{ maxWidth: '500px', margin: '0 auto' }}>
      <h2 className="heading-2" style={{ marginBottom: '20px' }}>Athlete Goals & Settings</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label className="text-muted">Daily Step Goal</label>
          <input type="number" name="step_goal" className="input-field" value={settings.step_goal || ''} onChange={handleChange} required />
        </div>
        <div>
          <label className="text-muted">Daily Sleep Goal (hrs)</label>
          <input type="number" step="0.1" name="sleep_goal" className="input-field" value={settings.sleep_goal || ''} onChange={handleChange} required />
        </div>
        <div>
          <label className="text-muted">Daily Water Goal (Liters)</label>
          <input type="number" step="0.1" name="water_goal" className="input-field" value={settings.water_goal || ''} onChange={handleChange} required />
        </div>
        <div>
          <label className="text-muted">Daily Calorie Goal</label>
          <input type="number" name="cal_goal" className="input-field" value={settings.cal_goal || ''} onChange={handleChange} required />
        </div>
        <div>
          <label className="text-muted">Starting Weight (kg) - Used to track progress</label>
          <input type="number" step="0.1" name="start_weight" className="input-field" value={settings.start_weight || ''} onChange={handleChange} />
        </div>
        
        <button type="submit" className="btn btn-primary" disabled={saving} style={{ marginTop: '10px' }}>
          {saving ? 'Saving...' : 'Save Goals'}
        </button>
      </form>
    </div>
  );
}
