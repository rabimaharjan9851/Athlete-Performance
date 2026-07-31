import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('athletes');
  const [pendingUsers, setPendingUsers] = useState([]);
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [globalStats, setGlobalStats] = useState({ totalDistance: 0 });
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [athleteWorkouts, setAthleteWorkouts] = useState([]);
  const [message, setMessage] = useState('');
  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // Fetch profiles
    const { data: profiles } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (profiles) {
      setPendingUsers(profiles.filter(p => !p.is_approved && !p.is_admin && p.role === 'athlete'));
      setApprovedUsers(profiles.filter(p => p.is_approved && p.role === 'athlete'));
    }

    // Fetch pending invitations (Join with profiles to see who sent it)
    const { data: invites } = await supabase
      .from('invitations')
      .select('*, profiles:athlete_id(full_name, email)')
      .eq('status', 'pending');
    if (invites) setPendingInvitations(invites);

    // Fetch all workouts for global stats
    const { data: workouts } = await supabase.from('workouts').select('distance');
    if (workouts) {
      const totalDist = workouts.reduce((sum, w) => sum + (w.distance || 0), 0);
      setGlobalStats({ totalDistance: totalDist });
    }
  };

  const handleApproveAthlete = async (userId) => {
    await supabase.from('profiles').update({ is_approved: true }).eq('id', userId);
    fetchData(); // refresh
  };

  const handleApproveStaff = async (invitation) => {
    setMessage('');
    
    // 1. Check if the invited user has actually created an account yet
    const { data: staffProfile } = await supabase
      .from('profiles')
      .select('id, is_approved')
      .eq('email', invitation.invited_email)
      .single();

    if (!staffProfile) {
      setMessage(`Cannot approve: ${invitation.invited_email} has not created an account yet.`);
      return;
    }

    // 2. Update their profile to be approved and set their role
    await supabase.from('profiles').update({ 
      is_approved: true, 
      role: invitation.role 
    }).eq('id', staffProfile.id);

    // 3. Create the team membership link
    await supabase.from('team_memberships').insert([{
      athlete_id: invitation.athlete_id,
      staff_id: staffProfile.id,
      role: invitation.role
    }]);

    // 4. Mark invitation as accepted
    await supabase.from('invitations').update({ status: 'accepted' }).eq('id', invitation.id);

    setMessage(`Successfully approved ${invitation.invited_email} as a ${invitation.role}!`);
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
    <div className="animate-slide-up" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="heading-1" style={{ margin: 0 }}>Admin Control Panel</h1>
      </header>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)' }}>
        <button 
          onClick={() => setActiveTab('athletes')}
          style={{ 
            background: 'none', border: 'none', padding: '12px 24px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 600,
            color: activeTab === 'athletes' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'athletes' ? '3px solid var(--accent-primary)' : '3px solid transparent'
          }}
        >
          Athletes
        </button>
        <button 
          onClick={() => setActiveTab('staff')}
          style={{ 
            background: 'none', border: 'none', padding: '12px 24px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 600,
            color: activeTab === 'staff' ? 'var(--accent-tertiary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'staff' ? '3px solid var(--accent-tertiary)' : '3px solid transparent'
          }}
        >
          Staff & Invitations
        </button>
      </div>

      {message && (
        <div style={{ 
          padding: '12px 16px', 
          background: message.includes('Cannot') ? 'rgba(255, 51, 102, 0.1)' : 'rgba(0, 255, 136, 0.1)', 
          color: message.includes('Cannot') ? '#ff3366' : '#00ff88',
          border: message.includes('Cannot') ? '1px solid rgba(255,51,102,0.3)' : '1px solid rgba(0,255,136,0.3)',
          marginBottom: '20px', borderRadius: '8px', fontWeight: 600
        }}>
          {message}
        </div>
      )}

      {/* ATHLETES TAB */}
      {activeTab === 'athletes' && (
        <>
          {/* Global Stats */}
          <div className="glass-panel" style={{ marginBottom: '24px', borderLeft: '4px solid var(--accent-primary)' }}>
            <h2 className="heading-2" style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>Global Team Distance</h2>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {globalStats.totalDistance} <span style={{ fontSize: '1rem' }}>km</span>
            </div>
          </div>

          {/* Pending Athlete Approvals */}
          {pendingUsers.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h2 className="heading-2">Pending Athlete Approvals ({pendingUsers.length})</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {pendingUsers.map(user => (
                  <div key={user.id} className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{user.full_name || 'No Name'}</div>
                      <div className="text-muted" style={{ fontSize: '0.8rem' }}>{user.email}</div>
                    </div>
                    <button onClick={() => handleApproveAthlete(user.id)} className="btn btn-primary" style={{ padding: '6px 12px', width: 'auto' }}>
                      Approve Athlete
                    </button>
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
        </>
      )}

      {/* STAFF & INVITATIONS TAB */}
      {activeTab === 'staff' && (
        <div>
          <h2 className="heading-2" style={{ marginBottom: '20px' }}>Pending Staff Invitations</h2>
          {pendingInvitations.length === 0 ? (
            <div className="glass-panel text-muted" style={{ textAlign: 'center', padding: '40px' }}>
              No pending invitations from athletes.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pendingInvitations.map(inv => (
                <div key={inv.id} className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{inv.invited_email}</div>
                    <div className="text-muted" style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                      Invited by: <span style={{ color: '#fff' }}>{inv.profiles?.full_name || inv.profiles?.email}</span>
                    </div>
                    <span className="badge badge-green" style={{ marginTop: '8px', display: 'inline-block', textTransform: 'capitalize' }}>
                      Requested Role: {inv.role}
                    </span>
                  </div>
                  <div>
                    <button 
                      onClick={() => handleApproveStaff(inv)} 
                      className="btn" 
                      style={{ background: 'var(--accent-tertiary)', color: '#fff', border: 'none', padding: '10px 16px', fontWeight: 600 }}
                    >
                      Verify & Approve
                    </button>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '6px' }}>
                      (Must create account first)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
