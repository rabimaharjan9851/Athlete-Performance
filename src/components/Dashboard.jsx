import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { calculateAthleteScore, calculateStreaks } from '../utils/formulas';
import { Trophy, Flame, Droplets, Bed, Target } from 'lucide-react';

export default function Dashboard({ profile }) {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    athleteScore: 0,
    workoutStreak: 0,
    badges: {
      firstWorkout: false,
      fiveStreak: false,
      tenStreak: false
    },
    today: {}
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Fetch Settings
    const { data: settings } = await supabase.from('user_settings').select('*').eq('user_id', user.id).single();
    
    // Fetch Daily Logs (last 30 days for streaks)
    const { data: dailyLogs } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(30);

    // Fetch Workout Logs
    const { data: workouts } = await supabase
      .from('workout_logs')
      .select('date')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    // Calculate Today's Score
    const todayLog = dailyLogs && dailyLogs.length > 0 && dailyLogs[0].date === new Date().toISOString().split('T')[0] ? dailyLogs[0] : {};
    const athleteScore = calculateAthleteScore(todayLog, settings, todayLog.recovery || 3);
    
    // Calculate Workout Streak
    const streak = calculateStreaks(workouts || [], new Date());

    setMetrics({
      athleteScore,
      workoutStreak: streak,
      badges: {
        firstWorkout: workouts && workouts.length > 0,
        fiveStreak: streak >= 5,
        tenStreak: streak >= 10
      },
      today: todayLog
    });

    setLoading(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h1 className="heading-1" style={{ marginBottom: '10px' }}>
        Welcome back, {profile?.email?.split('@')[0] || 'Athlete'}
      </h1>
      <p className="text-muted" style={{ marginBottom: '40px' }}>Here is your performance snapshot for today.</p>

      {/* Main KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div className="glass-panel" style={{ textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: '-10px', top: '-10px', opacity: 0.1 }}><Target size={80} /></div>
          <h3 className="text-muted">Athlete Score</h3>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>{metrics.athleteScore}</div>
          <p className="text-muted" style={{ fontSize: '0.8rem' }}>out of 100</p>
        </div>

        <div className="glass-panel" style={{ textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: '-10px', top: '-10px', opacity: 0.1 }}><Flame size={80} /></div>
          <h3 className="text-muted">Workout Streak</h3>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#ff7043' }}>{metrics.workoutStreak}</div>
          <p className="text-muted" style={{ fontSize: '0.8rem' }}>days in a row</p>
        </div>

        <div className="glass-panel" style={{ textAlign: 'center' }}>
          <h3 className="text-muted">Today's Sleep</h3>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
            <Bed size={30} color="#7e57c2" />
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{metrics.today.sleep_hrs || 0}h</div>
          </div>
        </div>

        <div className="glass-panel" style={{ textAlign: 'center' }}>
          <h3 className="text-muted">Today's Water</h3>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
            <Droplets size={30} color="#29b6f6" />
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{metrics.today.water_l || 0}L</div>
          </div>
        </div>
      </div>

      {/* Badges Section */}
      <h2 className="heading-2" style={{ marginBottom: '20px' }}>Achievement Badges</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
        <div className="glass-panel" style={{ textAlign: 'center', opacity: metrics.badges.firstWorkout ? 1 : 0.4 }}>
          <Trophy size={40} color={metrics.badges.firstWorkout ? 'gold' : 'gray'} style={{ margin: '0 auto 10px' }} />
          <h4>First Workout</h4>
          <p style={{ fontSize: '0.8rem', color: metrics.badges.firstWorkout ? '#81c784' : 'gray' }}>
            {metrics.badges.firstWorkout ? '✅ Unlocked' : '🔒 Locked'}
          </p>
        </div>

        <div className="glass-panel" style={{ textAlign: 'center', opacity: metrics.badges.fiveStreak ? 1 : 0.4 }}>
          <Flame size={40} color={metrics.badges.fiveStreak ? '#ff7043' : 'gray'} style={{ margin: '0 auto 10px' }} />
          <h4>5-Day Streak</h4>
          <p style={{ fontSize: '0.8rem', color: metrics.badges.fiveStreak ? '#81c784' : 'gray' }}>
            {metrics.badges.fiveStreak ? '✅ Unlocked' : '🔒 Locked'}
          </p>
        </div>

        <div className="glass-panel" style={{ textAlign: 'center', opacity: metrics.badges.tenStreak ? 1 : 0.4 }}>
          <Flame size={40} color={metrics.badges.tenStreak ? '#ef5350' : 'gray'} style={{ margin: '0 auto 10px' }} />
          <h4>10-Day Streak</h4>
          <p style={{ fontSize: '0.8rem', color: metrics.badges.tenStreak ? '#81c784' : 'gray' }}>
            {metrics.badges.tenStreak ? '✅ Unlocked' : '🔒 Locked'}
          </p>
        </div>
      </div>

    </div>
  );
}
