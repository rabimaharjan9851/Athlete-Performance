import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { calculateAthleteScore, calculateStreaks } from '../utils/formulas';
import { Trophy, Flame, Droplets, Bed, Target, Activity, TrendingUp, Medal } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function Dashboard({ profile }) {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({ athleteScore: 0, workoutStreak: 0, badges: {}, today: {}, recentLogs: [] });
  const [settings, setSettings] = useState(null);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    const [{ data: userSettings }, { data: dailyLogs }, { data: workouts }] = await Promise.all([
      supabase.from('user_settings').select('*').eq('user_id', user.id).single(),
      supabase.from('daily_logs').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(30),
      supabase.from('workout_logs').select('date').eq('user_id', user.id).order('date', { ascending: false }),
    ]);

    const todayStr = new Date().toISOString().split('T')[0];
    const todayLog = dailyLogs?.find(l => l.date === todayStr) || {};
    const streak = calculateStreaks(workouts || [], new Date());
    const score = calculateAthleteScore(todayLog, userSettings, todayLog.energy || 3);

    // Recent logs for chart (last 14 days)
    const chartData = (dailyLogs || []).slice(0, 14).reverse().map(l => ({
      date: new Date(l.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      score: calculateAthleteScore(l, userSettings, l.energy || 3),
      steps: l.steps || 0,
    }));

    setSettings(userSettings);
    setMetrics({
      athleteScore: score,
      workoutStreak: streak,
      totalWorkouts: workouts?.length || 0,
      badges: {
        firstWorkout: workouts?.length > 0,
        fiveStreak: streak >= 5,
        tenStreak: streak >= 10,
        thirtyStreak: streak >= 30,
      },
      today: todayLog,
      chartData,
    });
    setLoading(false);
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div className="spinner" />
    </div>
  );

  const todayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const name = profile?.email?.split('@')[0] || 'Athlete';
  const stepPct = settings?.step_goal && metrics.today.steps ? Math.min((metrics.today.steps / settings.step_goal) * 100, 100) : 0;
  const waterPct = settings?.water_goal && metrics.today.water_l ? Math.min((metrics.today.water_l / settings.water_goal) * 100, 100) : 0;

  return (
    <div className="animate-slide-up" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header">
        <p className="text-muted" style={{ marginBottom: '6px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{todayDate}</p>
        <h1 className="heading-1">Welcome back, {name} 👋</h1>
        <p className="text-muted" style={{ marginTop: '8px' }}>Here's your performance snapshot for today.</p>
      </div>

      {/* KPI Grid */}
      <div className="grid-4 section" style={{ gap: '16px' }}>
        {/* Athlete Score */}
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(0,255,136,0.12) 0%, rgba(0,200,255,0.08) 100%)', border: '1px solid rgba(0,255,136,0.2)' }}>
          <div className="stat-bg-icon"><Target size={100} /></div>
          <div className="stat-label">Athlete Score</div>
          <div className="stat-value" style={{ color: 'var(--accent-primary)' }}>{metrics.athleteScore}</div>
          <div className="stat-unit">out of 100</div>
          <div className="progress-bar-bg" style={{ marginTop: '12px' }}>
            <div className="progress-bar-fill" style={{ width: `${metrics.athleteScore}%` }} />
          </div>
        </div>

        {/* Workout Streak */}
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(255,112,67,0.12) 0%, rgba(255,51,102,0.08) 100%)', border: '1px solid rgba(255,112,67,0.2)' }}>
          <div className="stat-bg-icon"><Flame size={100} /></div>
          <div className="stat-label">Workout Streak</div>
          <div className="stat-value" style={{ color: '#ff7043' }}>{metrics.workoutStreak}</div>
          <div className="stat-unit">days in a row 🔥</div>
        </div>

        {/* Today Sleep */}
        <div className="stat-card">
          <div className="stat-bg-icon"><Bed size={100} /></div>
          <div className="stat-label">Today's Sleep</div>
          <div className="stat-value" style={{ color: '#7e57c2' }}>{metrics.today.sleep_hrs || '–'}</div>
          <div className="stat-unit">hours</div>
        </div>

        {/* Today Water */}
        <div className="stat-card">
          <div className="stat-bg-icon"><Droplets size={100} /></div>
          <div className="stat-label">Today's Water</div>
          <div className="stat-value" style={{ color: '#29b6f6' }}>{metrics.today.water_l || '–'}</div>
          <div className="stat-unit">liters</div>
          {waterPct > 0 && (
            <div className="progress-bar-bg" style={{ marginTop: '12px' }}>
              <div className="progress-bar-fill" style={{ width: `${waterPct}%`, background: 'linear-gradient(90deg, #29b6f6, #00c8ff)' }} />
            </div>
          )}
        </div>
      </div>

      {/* Today's Goal Progress */}
      {(stepPct > 0 || waterPct > 0) && (
        <div className="glass-panel section">
          <h2 className="heading-2" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <TrendingUp size={22} color="var(--accent-primary)" /> Today's Goal Progress
          </h2>
          <div className="grid-2">
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span className="text-muted" style={{ fontSize: '0.85rem' }}>Steps</span>
                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{(metrics.today.steps || 0).toLocaleString()} / {(settings?.step_goal || 10000).toLocaleString()}</span>
              </div>
              <div className="progress-bar-bg" style={{ height: '8px' }}>
                <div className="progress-bar-fill" style={{ width: `${stepPct}%` }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span className="text-muted" style={{ fontSize: '0.85rem' }}>Water</span>
                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{metrics.today.water_l || 0}L / {settings?.water_goal || 3}L</span>
              </div>
              <div className="progress-bar-bg" style={{ height: '8px' }}>
                <div className="progress-bar-fill" style={{ width: `${waterPct}%`, background: 'linear-gradient(90deg, #29b6f6, #00c8ff)' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Athlete Score Trend Chart */}
      {metrics.chartData?.length > 1 && (
        <div className="glass-panel section">
          <h2 className="heading-2" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity size={22} color="var(--accent-primary)" /> Athlete Score Trend
          </h2>
          <div style={{ height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.chartData}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" stroke="var(--text-secondary)" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} stroke="var(--text-secondary)" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '12px', boxShadow: 'var(--shadow-glass)', color: 'var(--text-primary)' }} />
                <Area type="monotone" dataKey="score" name="Score" stroke="var(--accent-primary)" strokeWidth={2.5} fill="url(#scoreGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Achievement Badges */}
      <div className="section">
        <h2 className="heading-2" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Medal size={22} color="gold" /> Achievement Badges
        </h2>
        <div className="grid-4">
          {[
            { label: 'First Workout', icon: <Trophy size={36} />, color: '#ffd700', unlocked: metrics.badges.firstWorkout },
            { label: '5-Day Streak', icon: <Flame size={36} />, color: '#ff7043', unlocked: metrics.badges.fiveStreak },
            { label: '10-Day Streak', icon: <Flame size={36} />, color: '#ef5350', unlocked: metrics.badges.tenStreak },
            { label: '30-Day Streak', icon: <Flame size={36} />, color: '#ff3366', unlocked: metrics.badges.thirtyStreak },
          ].map(badge => (
            <div
              key={badge.label}
              className="glass-panel"
              style={{
                textAlign: 'center',
                padding: '24px 16px',
                opacity: badge.unlocked ? 1 : 0.4,
                transition: 'all 0.3s ease',
                border: badge.unlocked ? `1px solid ${badge.color}40` : '1px solid var(--border-color)',
                background: badge.unlocked ? `${badge.color}08` : 'var(--bg-glass)',
              }}
            >
              <div style={{ color: badge.unlocked ? badge.color : 'var(--text-secondary)', marginBottom: '12px' }}>{badge.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '6px' }}>{badge.label}</div>
              <span className={`badge ${badge.unlocked ? 'badge-green' : 'badge-red'}`}>
                {badge.unlocked ? '✅ Unlocked' : '🔒 Locked'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
