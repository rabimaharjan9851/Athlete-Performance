import { useState } from 'react';
import { saveWorkoutLocal } from '../utils/offlineSync';

export default function WorkoutLogger({ onNavigate }) {
  const [exercise, setExercise] = useState('Running');
  const [distance, setDistance] = useState(5);
  const [duration, setDuration] = useState(30);
  const [isSaving, setIsSaving] = useState(false);

  const exercises = ['Running', 'HYROX', 'Cycling', 'Swimming', 'Strength'];
  const distances = Array.from({ length: 20 }, (_, i) => i + 1);
  const durations = Array.from({ length: 12 }, (_, i) => (i + 1) * 10); // 10, 20... 120 mins

  const handleSave = () => {
    setIsSaving(true);
    
    // Save to local storage (Offline first)
    saveWorkoutLocal({
      exercise,
      distance,
      duration,
      date: new Date().toISOString().split('T')[0]
    });

    setTimeout(() => {
      setIsSaving(false);
      onNavigate(); // Go back to dashboard
    }, 600);
  };

  return (
    <div className="animate-slide-up">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="heading-2" style={{ margin: 0 }}>Log Workout</h1>
        <button className="btn btn-secondary" style={{ padding: '8px 16px', width: 'auto' }} onClick={onNavigate}>
          Cancel
        </button>
      </header>

      <div className="glass-panel" style={{ marginBottom: '24px' }}>
        <div className="input-group">
          <label className="input-label">Exercise Type</label>
          <div className="scroll-selector">
            {exercises.map(ex => (
              <div 
                key={ex} 
                className={`scroll-item ${exercise === ex ? 'active' : ''}`}
                onClick={() => setExercise(ex)}
              >
                {ex}
              </div>
            ))}
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Distance (km)</label>
          <div className="scroll-selector">
            {distances.map(d => (
              <div 
                key={d} 
                className={`scroll-item ${distance === d ? 'active' : ''}`}
                onClick={() => setDistance(d)}
              >
                {d}
              </div>
            ))}
          </div>
        </div>

        <div className="input-group" style={{ marginBottom: 0 }}>
          <label className="input-label">Duration (mins)</label>
          <div className="scroll-selector">
            {durations.map(d => (
              <div 
                key={d} 
                className={`scroll-item ${duration === d ? 'active' : ''}`}
                onClick={() => setDuration(d)}
              >
                {d}
              </div>
            ))}
          </div>
        </div>
      </div>

      <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
        {isSaving ? 'Saving...' : 'Save & Sync'}
      </button>
    </div>
  );
}
