import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

export default function AdminDashboard({ onNavigate }) {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [globalStats, setGlobalStats] = useState({ totalDistance: 0 });
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [athleteWorkouts, setAthleteWorkouts] = useState([]);
  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // Fetch profiles
    const { data: profiles } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (profiles) {
      setPendingUsers(profiles.filter(p => !p.is_approved && !p.is_admin));
      setApprovedUsers(profiles.filter(p => p.is_approved));
    }

    // Fetch all workouts for global stats
    const { data: workouts } = await supabase.from('workouts').select('distance');
    if (workouts) {
      const totalDist = workouts.reduce((sum, w) => sum + (w.distance || 0), 0);
      setGlobalStats({ totalDistance: totalDist });
    }
  };

  const handleApprove = async (userId) => {
    await supabase.from('profiles').update({ is_approved: true }).eq('id', userId);
    fetchData(); // refresh
  };

  const handleReject = async (userId) => {
    await supabase.from('profiles').delete().eq('id', userId);
    // Note: Deleting auth.users requires service_role key, so we just delete profile for now or keep it unapproved.
    fetchData();
  };

  const viewAthlete = async (user) => {
    setSelectedAthlete(user);
    const { data: workouts } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true });
      
    setAthleteWorkouts(workouts || []);
  };

  return (
    <div className="animate-slide-up">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="heading-1" style={{ margin: 0 }}>Admin</h1>
        <button className="btn btn-secondary" style={{ padding: '8px 16px', width: 'auto' }} onClick={onNavigate}>
          Back to App
        </button>
      </header>

      {/* Global Stats */}
      <div className="glass-panel" style={{ marginBottom: '24px', borderLeft: '4px solid var(--accent-tertiary)' }}>
        <h2 className="heading-2" style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>Global Team Distance</h2>
        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          {globalStats.totalDistance} <span style={{ fontSize: '1rem' }}>km</span>
        </div>
      </div>

      {/* Pending Approvals */}
      {pendingUsers.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h2 className="heading-2">Pending Approvals ({pendingUsers.length})</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pendingUsers.map(user => (
              <div key={user.id} className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{user.full_name || 'No Name'}</div>
                  <div className="text-muted" style={{ fontSize: '0.8rem' }}>{user.email}</div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleApprove(user.id)} style={{ background: 'var(--accent-primary)', color: '#000', border: 'none', borderRadius: '4px', padding: '6px 12px', cursor: 'pointer', fontWeight: 600 }}>
                    Approve
                  </button>
                  <button onClick={() => handleReject(user.id)} style={{ background: 'transparent', border: '1px solid var(--accent-tertiary)', color: 'var(--accent-tertiary)', borderRadius: '4px', padding: '6px 12px', cursor: 'pointer' }}>
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Athlete Roster */}
      <div style={{ marginBottom: '24px' }}>
        <h2 className="heading-2">Approved Athletes</h2>
        <div style={{ display: 'flex', overflowX: 'auto', gap: '12px', paddingBottom: '12px' }}>
          {approvedUsers.map(user => (
            <div 
              key={user.id} 
              className={`scroll-item ${selectedAthlete?.id === user.id ? 'active' : ''}`}
              onClick={() => viewAthlete(user)}
              style={{ padding: '12px', minWidth: '120px', textAlign: 'center' }}
            >
              {user.full_name?.split(' ')[0] || user.email.split('@')[0]}
            </div>
          ))}
        </div>
      </div>

      {/* Athlete Detail View */}
      {selectedAthlete && (
        <div className="glass-panel animate-slide-up">
          <h3 className="heading-2" style={{ fontSize: '1.2rem' }}>{selectedAthlete.full_name}'s Progress</h3>
          <div style={{ height: '150px', marginTop: '20px' }}>
            {athleteWorkouts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={athleteWorkouts} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={10} />
                  <YAxis stroke="var(--text-secondary)" fontSize={10} />
                  <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: 'none' }} />
                  <Area type="monotone" dataKey="distance" stroke="var(--accent-secondary)" fill="var(--accent-secondary)" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-muted" style={{ textAlign: 'center', paddingTop: '50px' }}>No workouts logged yet.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
