import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Apple, Droplets, Flame } from 'lucide-react';

export default function NutritionTracker() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase
      .from('daily_logs')
      .select('date, cal_in, cal_burned, water_l')
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
        <Apple color="var(--accent-primary)" /> Nutrition & Hydration
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Apple size={30} color="var(--accent-primary)" style={{ marginBottom: '10px' }} />
          <h3 className="text-muted">Avg Calories In</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            {logs.length ? Math.round(logs.reduce((acc, l) => acc + (l.cal_in || 0), 0) / logs.filter(l => l.cal_in).length) || 0 : 0} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>kcal</span>
          </div>
        </div>
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Flame size={30} color="#ff7043" style={{ marginBottom: '10px' }} />
          <h3 className="text-muted">Avg Cal Burned</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
             {logs.length ? Math.round(logs.reduce((acc, l) => acc + (l.cal_burned || 0), 0) / logs.filter(l => l.cal_burned).length) || 0 : 0} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>kcal</span>
          </div>
        </div>
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Droplets size={30} color="#29b6f6" style={{ marginBottom: '10px' }} />
          <h3 className="text-muted">Avg Water</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
             {logs.length ? (logs.reduce((acc, l) => acc + (l.water_l || 0), 0) / logs.filter(l => l.water_l).length).toFixed(1) || 0 : 0} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>L</span>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ height: '400px' }}>
        <h3 style={{ marginBottom: '20px' }}>Calorie Trends</h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={logs}>
            <defs>
              <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorBurn" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff7043" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ff7043" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="date" stroke="var(--text-secondary)" />
            <YAxis stroke="var(--text-secondary)" />
            <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: 'none', borderRadius: '8px' }} />
            <Legend />
            <Area type="monotone" dataKey="cal_in" name="Calories Eaten" stroke="var(--accent-primary)" fillOpacity={1} fill="url(#colorIn)" />
            <Area type="monotone" dataKey="cal_cal_burned" name="Calories Burned" stroke="#ff7043" fillOpacity={1} fill="url(#colorBurn)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
