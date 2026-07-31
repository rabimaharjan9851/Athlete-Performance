import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { Save, Activity, Timer, Navigation } from 'lucide-react';

export default function WorkoutLogger() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    exercise: 'Running',
    distance: '',
    duration: '',
    intensity: 5,
    notes: ''
  });

  const exercises = [
    { name: 'Running', icon: '🏃‍♂️' },
    { name: 'HYROX', icon: '🏋️‍♂️' },
    { name: 'Cycling', icon: '🚴‍♂️' },
    { name: 'Swimming', icon: '🏊‍♂️' },
    { name: 'Strength', icon: '💪' },
    { name: 'Mobility', icon: '🧘‍♂️' }
  ];

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
      exercise: formData.exercise,
      distance: formData.distance ? parseFloat(formData.distance) : null,
      duration: formData.duration ? parseInt(formData.duration) : null,
      // Note: If intensity and notes columns don't exist yet, we will just pass them. 
      // Supabase will ignore them if not in schema (depending on settings) or we can just stick to core for now.
    };

    // Assuming table 'workout_logs' exists from previous migrations
    const { error } = await supabase
      .from('workout_logs')
      .insert([payload]);

    if (error) {
      setMessage('Error saving workout: ' + error.message);
      setLoading(false);
    } else {
      setMessage('Workout saved successfully! 🔥');
      setTimeout(() => {
        navigate('/');
      }, 1500);
    }
  };

  return (
    <div className="animate-slide-up" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="heading-2" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Activity size={24} color="var(--accent-primary)" /> Log Workout
        </h1>
        <button className="btn btn-secondary" style={{ padding: '8px 16px', width: 'auto' }} onClick={() => navigate('/')}>
          Cancel
        </button>
      </header>

      {message && (
        <div style={{ 
          padding: '12px 16px', 
          background: message.includes('Error') ? 'rgba(255, 51, 102, 0.1)' : 'rgba(0, 255, 136, 0.1)', 
          color: message.includes('Error') ? '#ff3366' : '#00ff88',
          border: message.includes('Error') ? '1px solid rgba(255,51,102,0.3)' : '1px solid rgba(0,255,136,0.3)',
          marginBottom: '20px', 
          borderRadius: '8px',
          fontWeight: 600
        }}>
          {message}
        </div>
      )}

      <div className="glass-panel section">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Date */}
          <div>
            <label className="text-muted" style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Date</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} className="input-field" required />
          </div>

          {/* Exercise Type */}
          <div>
            <label className="text-muted" style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Exercise Type</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {exercises.map(ex => (
                <div 
                  key={ex.name}
                  onClick={() => setFormData({ ...formData, exercise: ex.name })}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    background: formData.exercise === ex.name ? 'rgba(0, 255, 136, 0.15)' : 'var(--bg-tertiary)',
                    border: formData.exercise === ex.name ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                    color: formData.exercise === ex.name ? 'var(--text-primary)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: formData.exercise === ex.name ? 600 : 400,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span>{ex.icon}</span> {ex.name}
                </div>
              ))}
            </div>
          </div>

          {/* Metrics */}
          <div className="grid-2" style={{ gap: '15px' }}>
            <div>
              <label className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '0.9rem' }}>
                <Navigation size={16} /> Distance (km)
              </label>
              <input 
                type="number" 
                step="0.1" 
                name="distance" 
                value={formData.distance} 
                onChange={handleChange} 
                className="input-field" 
                placeholder="e.g. 5.5" 
              />
            </div>
            <div>
              <label className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '0.9rem' }}>
                <Timer size={16} /> Duration (mins)
              </label>
              <input 
                type="number" 
                name="duration" 
                value={formData.duration} 
                onChange={handleChange} 
                className="input-field" 
                placeholder="e.g. 45" 
                required
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '10px', padding: '14px' }}>
            <Save size={20} />
            {loading ? 'Saving...' : 'Save Workout'}
          </button>
        </form>
      </div>
    </div>
  );
}
