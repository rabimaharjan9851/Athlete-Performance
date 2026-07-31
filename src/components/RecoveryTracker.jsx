import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { HeartPulse, Bed, BrainCircuit } from 'lucide-react';

export default function RecoveryTracker() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase
      .from('daily_logs')
      .select('date, sleep_hrs, mood, energy, stress, soreness')
      .eq('user_id', user.id)
      .order('date', { ascending: true })
      .limit(30);
    
    if (data) setLogs(data);
    setLoading(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h2 className="heading-2" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <HeartPulse color="#ef5350" /> Recovery & Readiness
      </h2>

      <div className="grid-3" style={{ marginBottom: '30px' }}>
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Bed size={30} color="#7e57c2" style={{ marginBottom: '10px' }} />
          <h3 className="text-muted">Avg Sleep</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            {logs.length ? (logs.reduce((acc, l) => acc + (l.sleep_hrs || 0), 0) / logs.filter(l => l.sleep_hrs).length).toFixed(1) || 0 : 0} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>hrs</span>
          </div>
        </div>
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <BrainCircuit size={30} color="#26a69a" style={{ marginBottom: '10px' }} />
          <h3 className="text-muted">Avg Stress (1-5)</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
             {logs.length ? (logs.reduce((acc, l) => acc + (l.stress || 0), 0) / logs.filter(l => l.stress).length).toFixed(1) || 0 : 0}
          </div>
        </div>
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <HeartPulse size={30} color="#ef5350" style={{ marginBottom: '10px' }} />
          <h3 className="text-muted">Avg Energy (1-5)</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
             {logs.length ? (logs.reduce((acc, l) => acc + (l.energy || 0), 0) / logs.filter(l => l.energy).length).toFixed(1) || 0 : 0}
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ height: '400px' }}>
        <h3 style={{ marginBottom: '20px' }}>Recovery Vitals Trend</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={logs}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="date" stroke="var(--text-secondary)" />
            <YAxis stroke="var(--text-secondary)" domain={[0, 5]} />
            <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: 'none', borderRadius: '8px' }} />
            <Legend />
            <Line type="monotone" dataKey="energy" name="Energy" stroke="#26a69a" strokeWidth={3} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="stress" name="Stress" stroke="#ef5350" strokeWidth={3} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="mood" name="Mood" stroke="var(--accent-primary)" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
