import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Save } from 'lucide-react';

export default function DailyTracker() {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    steps: '',
    sleep_hrs: '',
    weight_kg: '',
    water_l: '',
    cal_in: '',
    mood: 3,
    energy: 3,
    stress: 3
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { data: { user } } = await supabase.auth.getUser();

    const payload = {
      user_id: user.id,
      date: formData.date,
      steps: formData.steps ? parseInt(formData.steps) : null,
      sleep_hrs: formData.sleep_hrs ? parseFloat(formData.sleep_hrs) : null,
      weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
      water_l: formData.water_l ? parseFloat(formData.water_l) : null,
      cal_in: formData.cal_in ? parseInt(formData.cal_in) : null,
      mood: parseInt(formData.mood),
      energy: parseInt(formData.energy),
      stress: parseInt(formData.stress)
    };

    // Upsert so if they log twice in one day it updates
    const { error } = await supabase
      .from('daily_logs')
      .upsert(payload, { onConflict: 'user_id, date' });

    if (error) {
      setMessage('Error saving log: ' + error.message);
    } else {
      setMessage('Daily metrics saved successfully!');
    }
    
    setLoading(false);
  };

  return (
    <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 className="heading-2" style={{ marginBottom: '20px' }}>Daily Tracker</h2>
      
      {message && <div style={{ padding: '10px', background: 'rgba(255,255,255,0.1)', marginBottom: '15px', borderRadius: '4px' }}>{message}</div>}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label className="text-muted">Date</label>
          <input type="date" name="date" value={formData.date} onChange={handleChange} className="input-field" required />
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label className="text-muted">Steps</label>
            <input type="number" name="steps" value={formData.steps} onChange={handleChange} className="input-field" placeholder="e.g. 10000" />
          </div>
          <div>
            <label className="text-muted">Sleep (Hours)</label>
            <input type="number" step="0.1" name="sleep_hrs" value={formData.sleep_hrs} onChange={handleChange} className="input-field" placeholder="e.g. 8" />
          </div>
          <div>
            <label className="text-muted">Weight (kg)</label>
            <input type="number" step="0.1" name="weight_kg" value={formData.weight_kg} onChange={handleChange} className="input-field" placeholder="e.g. 75.5" />
          </div>
          <div>
            <label className="text-muted">Water (Liters)</label>
            <input type="number" step="0.1" name="water_l" value={formData.water_l} onChange={handleChange} className="input-field" placeholder="e.g. 3.5" />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="text-muted">Calories In</label>
            <input type="number" name="cal_in" value={formData.cal_in} onChange={handleChange} className="input-field" placeholder="e.g. 2500" />
          </div>
        </div>

        <h3 style={{ marginTop: '15px' }}>Daily Vitals (1-5 Scale)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
          <div>
            <label className="text-muted">Mood</label>
            <input type="range" name="mood" min="1" max="5" value={formData.mood} onChange={handleChange} style={{ width: '100%' }} />
            <div style={{ textAlign: 'center' }}>{formData.mood}</div>
          </div>
          <div>
            <label className="text-muted">Energy</label>
            <input type="range" name="energy" min="1" max="5" value={formData.energy} onChange={handleChange} style={{ width: '100%' }} />
            <div style={{ textAlign: 'center' }}>{formData.energy}</div>
          </div>
          <div>
            <label className="text-muted">Stress</label>
            <input type="range" name="stress" min="1" max="5" value={formData.stress} onChange={handleChange} style={{ width: '100%' }} />
            <div style={{ textAlign: 'center' }}>{formData.stress}</div>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary" style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
          <Save size={20} />
          {loading ? 'Saving...' : 'Save Daily Metrics'}
        </button>
      </form>
    </div>
  );
}
