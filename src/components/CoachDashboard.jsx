import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Users, Activity } from 'lucide-react';

export default function CoachDashboard({ profile }) {
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAthletes();
  }, []);

  const fetchAthletes = async () => {
    setLoading(true);
    // Fetch athletes linked to this coach
    const { data, error } = await supabase
      .from('team_memberships')
      .select('*, profiles:athlete_id(*)')
      .eq('staff_id', profile.id)
      .eq('status', 'active');
      
    if (data) setAthletes(data);
    setLoading(false);
  };

  return (
    <div className="dashboard-container max-w-7xl mx-auto">
      <div className="dashboard-header" style={{ marginBottom: '40px' }}>
        <div>
          <h1 className="heading-1">Coach Roster</h1>
          <p className="text-muted" style={{ marginTop: '8px' }}>Select an athlete to view their performance data.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {loading ? (
          <p className="text-muted">Loading athletes...</p>
        ) : athletes.length === 0 ? (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '40px', gridColumn: '1 / -1' }}>
            <Users size={48} color="#666" style={{ margin: '0 auto 16px' }} />
            <h3 className="heading-3">No Athletes Yet</h3>
            <p className="text-muted" style={{ marginTop: '8px' }}>When an athlete invites you, they will appear here automatically.</p>
          </div>
        ) : (
          athletes.map(membership => (
            <div key={membership.id} className="glass-panel hover-card" style={{ padding: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(0,255,136,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Activity size={24} color="#00ff88" />
              </div>
              <div>
                <h3 className="heading-3" style={{ fontSize: '1.2rem', marginBottom: '4px' }}>
                  {membership.profiles?.full_name || membership.profiles?.email}
                </h3>
                <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                  Role: <span style={{ textTransform: 'capitalize' }}>{membership.role}</span>
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
