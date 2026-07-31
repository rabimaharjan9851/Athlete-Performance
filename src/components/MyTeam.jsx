import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Users, UserPlus, Mail, Shield, CheckCircle, Clock, XCircle, Trash2 } from 'lucide-react';

import emailjs from '@emailjs/browser';

export default function MyTeam({ profile }) {
  const [invitations, setInvitations] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('coach');
  const [isInviting, setIsInviting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    setLoading(true);
    
    // Fetch pending/active invitations
    const { data: invData } = await supabase
      .from('invitations')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (invData) setInvitations(invData);

    // Fetch active team memberships (the coach/nutritionist profiles)
    // We do a join on profiles to get their names
    const { data: memData } = await supabase
      .from('team_memberships')
      .select('*, profiles:staff_id(email, full_name)')
      .order('created_at', { ascending: false });
      
    if (memData) setMembers(memData);
    
    setLoading(false);
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setIsInviting(true);
    setMessage('');

    if (!inviteEmail.includes('@')) {
      setMessage('Please enter a valid email address.');
      setIsInviting(false);
      return;
    }

    // Check if already invited
    if (invitations.find(inv => inv.invited_email.toLowerCase() === inviteEmail.toLowerCase() && inv.status !== 'revoked')) {
      setMessage('You have already sent an invitation to this email.');
      setIsInviting(false);
      return;
    }

    // 1. Insert into database
    const { error } = await supabase
      .from('invitations')
      .insert([{
        athlete_id: profile.id,
        invited_email: inviteEmail.toLowerCase(),
        role: inviteRole,
        status: 'pending'
      }]);

    if (error) {
      setMessage('Error sending invite: ' + error.message);
    } else {
      // 2. Trigger EmailJS to send the email
      try {
        await emailjs.send(
          'service_wiu8ird',
          'template_h0scrdf',
          {
            to_email: inviteEmail.toLowerCase(),
            role: inviteRole,
          },
          'H_TybueqLx_8Xp1hO'
        );
        setMessage('Invitation and email sent successfully!');
      } catch (emailError) {
        console.error('EmailJS Error:', emailError);
        setMessage('Email Failed: ' + (emailError.text || emailError.message || 'Check EmailJS API keys'));
      }
      
      setInviteEmail('');
      fetchTeamData(); // refresh lists
    }
    
    setIsInviting(false);
  };

  const removeInvitation = async (id) => {
    await supabase.from('invitations').delete().eq('id', id);
    fetchTeamData();
  };

  const removeMember = async (id) => {
    await supabase.from('team_memberships').delete().eq('id', id);
    fetchTeamData();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="animate-slide-up" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="heading-1" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Users size={28} color="var(--accent-primary)" /> My Performance Team
          </h1>
          <p className="text-muted" style={{ marginTop: '8px' }}>Invite professionals to monitor your training and collaborate on your progress.</p>
        </div>
      </header>

      {/* Invite Form */}
      <div className="glass-panel section">
        <h2 className="heading-2" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserPlus size={20} color="var(--accent-primary)" /> Invite New Member
        </h2>
        
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

        <form onSubmit={handleInvite} className="grid-3" style={{ gap: '16px', alignItems: 'end' }}>
          <div style={{ gridColumn: 'span 2' }}>
            <label className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '0.9rem' }}>
              <Mail size={16} /> Email Address
            </label>
            <input 
              type="email" 
              value={inviteEmail} 
              onChange={(e) => setInviteEmail(e.target.value)} 
              className="input-field" 
              placeholder="coach@example.com" 
              required
            />
          </div>
          <div>
            <label className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '0.9rem' }}>
              <Shield size={16} /> Role
            </label>
            <select 
              value={inviteRole} 
              onChange={(e) => setInviteRole(e.target.value)} 
              className="input-field"
              style={{ appearance: 'none', background: 'var(--bg-tertiary)' }}
            >
              <option value="coach">Coach</option>
              <option value="nutritionist">Nutritionist</option>
            </select>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <button type="submit" disabled={isInviting} className="btn btn-primary" style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <UserPlus size={18} />
              {isInviting ? 'Sending Invite...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>

      {/* Active Team Members */}
      {members.length > 0 && (
        <div className="section">
          <h2 className="heading-2" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={20} color="#00ff88" /> Active Team
          </h2>
          <div className="grid-2" style={{ gap: '16px' }}>
            {members.map(member => (
              <div key={member.id} className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '4px' }}>
                    {member.profiles?.full_name || 'Team Member'}
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '8px' }}>
                    {member.profiles?.email}
                  </div>
                  <span className="badge badge-green" style={{ textTransform: 'capitalize' }}>
                    {member.role}
                  </span>
                </div>
                <button 
                  onClick={() => removeMember(member.id)}
                  style={{ background: 'none', border: 'none', color: '#ff3366', cursor: 'pointer', padding: '8px' }}
                  title="Remove Member"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div className="section">
          <h2 className="heading-2" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={20} color="#ffc107" /> Pending Invitations
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {invitations.map(inv => (
              <div key={inv.id} className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px' }}>
                <div>
                  <div style={{ fontWeight: 500 }}>{inv.invited_email}</div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                    <span className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'capitalize' }}>Role: {inv.role}</span>
                    <span className="text-muted" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Status: 
                      {inv.status === 'pending' && <span style={{ color: '#ffc107' }}>Pending Admin Approval</span>}
                      {inv.status === 'accepted' && <span style={{ color: '#00ff88' }}>Accepted</span>}
                      {inv.status === 'declined' && <span style={{ color: '#ff3366' }}>Declined</span>}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => removeInvitation(inv.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '8px' }}
                  title="Cancel Invitation"
                >
                  <XCircle size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
