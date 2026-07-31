import { useEffect, useState } from 'react';
import { getLocalWorkouts, syncWithSupabase } from '../utils/offlineSync';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

export default function Dashboard({ onNavigate }) {
  const [workouts, setWorkouts] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const data = getLocalWorkouts();
    setWorkouts(data);
    
    // Group by date for the chart (Simple mock)
    const recent = data.slice(-7).map(w => ({
      date: new Date(w.timestamp).toLocaleDateString('en-US', { weekday: 'short' }),
      distance: w.distance
    }));
    
    // Fallback empty state chart data
    if (recent.length === 0) {
      setChartData([
        { date: 'Mon', distance: 0 },
        { date: 'Tue', distance: 0 },
        { date: 'Wed', distance: 0 }
      ]);
    } else {
      setChartData(recent);
    }
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    await syncWithSupabase();
    setWorkouts(getLocalWorkouts());
    setIsSyncing(false);
  };

  const unsyncedCount = workouts.filter(w => !w.synced).length;
  const totalDistance = workouts.reduce((sum, w) => sum + w.distance, 0);

  return (
    <div className="animate-slide-up">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="heading-1" style={{ margin: 0 }}>Overview</h1>
          <p className="text-muted">Welcome back, Athlete</p>
        </div>
        
        {unsyncedCount > 0 && (
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            style={{ 
              background: 'transparent', 
              border: '1px solid var(--accent-tertiary)', 
              color: 'var(--accent-tertiary)',
              padding: '6px 12px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600
            }}>
            {isSyncing ? 'Syncing...' : `Sync (${unsyncedCount})`}
          </button>
        )}
      </header>

      <div className="glass-panel" style={{ marginBottom: '24px' }}>
        <h2 className="heading-2" style={{ fontSize: '1.2rem' }}>Total Distance</h2>
        <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--accent-primary)', lineHeight: 1 }}>
          {totalDistance} <span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>km</span>
        </div>
        
        <div style={{ height: '150px', marginTop: '20px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDist" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ background: 'var(--bg-secondary)', border: 'none', borderRadius: '8px' }}
                itemStyle={{ color: 'var(--accent-primary)' }}
              />
              <Area type="monotone" dataKey="distance" stroke="var(--accent-primary)" fillOpacity={1} fill="url(#colorDist)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h3 className="heading-2" style={{ fontSize: '1.1rem', marginBottom: '12px' }}>Recent Workouts</h3>
        {workouts.length === 0 ? (
          <p className="text-muted" style={{ textAlign: 'center', padding: '20px' }}>No workouts logged yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {workouts.slice(-3).reverse().map(w => (
              <div key={w.id} className="glass-panel" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{w.exercise}</div>
                  <div className="text-muted" style={{ fontSize: '0.8rem' }}>{w.date}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: 'var(--accent-secondary)' }}>{w.distance} km</div>
                  <div className="text-muted" style={{ fontSize: '0.8rem' }}>{w.duration} min</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button className="btn btn-primary" onClick={onNavigate}>
        + Log Workout
      </button>
    </div>
  );
}
