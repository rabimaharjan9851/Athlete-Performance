import { useState, useEffect } from 'react'
import { supabase } from './utils/supabaseClient'
import { BrowserRouter, Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom'
import { Activity, LayoutDashboard, Settings as SettingsIcon, Award, HeartPulse, Apple, Dumbbell, ShieldAlert, LogOut, ChevronRight, Shield } from 'lucide-react'

import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import AdminDashboard from './components/AdminDashboard'
import DailyTracker from './components/DailyTracker'
import NutritionTracker from './components/NutritionTracker'
import RecoveryTracker from './components/RecoveryTracker'
import PRTracker from './components/PRTracker'
import Settings from './components/Settings'
import WorkoutLogger from './components/WorkoutLogger'

// --- Protected Admin Route with proper loading state ---
function ProtectedAdminRoute({ profile, profileLoading, children }) {
  if (profileLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '20px' }}>
        <div className="spinner" />
        <p className="text-muted">Verifying admin access...</p>
      </div>
    )
  }
  if (!profile || !profile.is_admin) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div className="glass-panel" style={{ textAlign: 'center', maxWidth: '400px', padding: '40px' }}>
          <ShieldAlert size={60} color="var(--accent-tertiary)" style={{ margin: '0 auto 20px' }} />
          <h2 className="heading-2" style={{ color: 'var(--accent-tertiary)', marginBottom: '10px' }}>Access Denied</h2>
          <p className="text-muted" style={{ marginBottom: '20px' }}>You do not have admin privileges to access this page.</p>
          <Navigate to="/" replace />
        </div>
      </div>
    )
  }
  return children
}

// --- Sidebar Navigation ---
function Sidebar({ onSignOut, isAdmin, profile }) {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} />, exact: true },
    { path: '/daily', label: 'Daily Tracker', icon: <Activity size={20} /> },
    { path: '/workout', label: 'Workouts', icon: <Dumbbell size={20} /> },
    { path: '/recovery', label: 'Recovery', icon: <HeartPulse size={20} /> },
    { path: '/nutrition', label: 'Nutrition', icon: <Apple size={20} /> },
    { path: '/prs', label: 'My PRs', icon: <Award size={20} /> },
    { path: '/settings', label: 'Settings', icon: <SettingsIcon size={20} /> },
  ]

  return (
    <aside style={{
      width: collapsed ? '70px' : '260px',
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      background: 'linear-gradient(180deg, #0d1117 0%, #161b22 100%)',
      borderRight: '1px solid rgba(240,246,252,0.08)',
      display: 'flex',
      flexDirection: 'column',
      padding: '0',
      transition: 'width 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
      zIndex: 1000,
      overflow: 'hidden'
    }}>
      {/* Logo Header */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(240,246,252,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Activity size={18} color="#000" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '-0.02em' }}>Athlete</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Performance</div>
            </div>
          </div>
        )}
        {collapsed && (
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
            <Activity size={18} color="#000" />
          </div>
        )}
        {!collapsed && (
          <button onClick={() => setCollapsed(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}>
            <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />
          </button>
        )}
      </div>

      {/* Collapse expand button when collapsed */}
      {collapsed && (
        <button onClick={() => setCollapsed(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '10px', margin: '0 auto' }}>
          <ChevronRight size={18} />
        </button>
      )}

      {/* User Info */}
      {!collapsed && profile && (
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(240,246,252,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-secondary), var(--accent-primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', color: '#000', flexShrink: 0 }}>
              {profile.email?.[0]?.toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {profile.email?.split('@')[0]}
              </div>
              {profile.is_admin && (
                <div style={{ fontSize: '0.7rem', color: 'var(--accent-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Shield size={10} /> Admin
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 12px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: collapsed ? '12px' : '11px 14px',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: 500,
              fontSize: '0.9rem',
              transition: 'all 0.2s ease',
              justifyContent: collapsed ? 'center' : 'flex-start',
              color: isActive ? '#000' : 'var(--text-secondary)',
              background: isActive ? 'var(--accent-primary)' : 'transparent',
              boxShadow: isActive ? '0 0 20px rgba(0, 255, 136, 0.3)' : 'none',
            })}
          >
            {item.icon}
            {!collapsed && item.label}
          </NavLink>
        ))}

        {/* Admin Link - only visible to admins */}
        {isAdmin && (
          <div style={{ marginTop: '12px', borderTop: '1px solid rgba(240,246,252,0.08)', paddingTop: '12px' }}>
            <NavLink
              to="/admin"
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: collapsed ? '12px' : '11px 14px',
                borderRadius: '10px',
                textDecoration: 'none',
                fontWeight: 500,
                fontSize: '0.9rem',
                transition: 'all 0.2s ease',
                justifyContent: collapsed ? 'center' : 'flex-start',
                color: isActive ? '#fff' : 'var(--accent-tertiary)',
                background: isActive ? 'var(--accent-tertiary)' : 'rgba(255, 51, 102, 0.1)',
                border: '1px solid rgba(255, 51, 102, 0.25)',
                boxShadow: isActive ? '0 0 20px rgba(255, 51, 102, 0.4)' : 'none',
              })}
            >
              <Shield size={20} />
              {!collapsed && 'Admin Panel'}
            </NavLink>
          </div>
        )}
      </nav>

      {/* Sign Out */}
      <div style={{ padding: '12px', borderTop: '1px solid rgba(240,246,252,0.08)' }}>
        <button
          onClick={onSignOut}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: collapsed ? '12px' : '11px 14px',
            borderRadius: '10px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            fontWeight: 500,
            fontSize: '0.9rem',
            transition: 'all 0.2s ease',
            justifyContent: collapsed ? 'center' : 'flex-start',
            fontFamily: 'var(--font-family)'
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#ef5350'; e.currentTarget.style.background = 'rgba(239,83,80,0.1)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent' }}
        >
          <LogOut size={20} />
          {!collapsed && 'Sign Out'}
        </button>
      </div>
    </aside>
  )
}

// --- Bottom Mobile Navigation ---
function MobileNav({ isAdmin }) {
  const navItems = [
    { path: '/', label: 'Home', icon: <LayoutDashboard size={22} />, exact: true },
    { path: '/daily', label: 'Daily', icon: <Activity size={22} /> },
    { path: '/workout', label: 'Workout', icon: <Dumbbell size={22} /> },
    { path: '/prs', label: 'PRs', icon: <Award size={22} /> },
    { path: '/settings', label: 'Settings', icon: <SettingsIcon size={22} /> },
  ]
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000,
      background: 'rgba(13, 17, 23, 0.95)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(240,246,252,0.08)',
      display: 'flex',
      padding: '8px 0 env(safe-area-inset-bottom, 8px)',
    }}>
      {navItems.map(item => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.exact}
          style={({ isActive }) => ({
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 4px',
            textDecoration: 'none',
            color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
            fontSize: '0.65rem',
            fontWeight: isActive ? 700 : 400,
            transition: 'color 0.2s ease',
          })}
        >
          {item.icon}
          {item.label}
        </NavLink>
      ))}
    </div>
  )
}

// --- Main App ---
function App() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
      else setLoading(false)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
      else {
        setProfile(null)
        setLoading(false)
        setProfileLoading(false)
      }
    })
  }, [])

  const fetchProfile = async (userId) => {
    setProfileLoading(true)
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (data) setProfile(data)
    setLoading(false)
    setProfileLoading(false)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: '20px', background: '#0d1117' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Activity size={28} color="#000" />
        </div>
        <div className="spinner" />
        <p className="text-muted">Loading your dashboard...</p>
      </div>
    )
  }

  if (!session) return <Auth />

  if (profile && !profile.is_approved && !profile.is_admin) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px' }}>
        <div className="glass-panel" style={{ textAlign: 'center', maxWidth: '380px', padding: '48px 32px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,193,7,0.1)', border: '2px solid rgba(255,193,7,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Shield size={32} color="#ffc107" />
          </div>
          <h2 className="heading-2" style={{ marginBottom: '12px' }}>Pending Approval</h2>
          <p className="text-muted" style={{ marginBottom: '32px', lineHeight: 1.6 }}>Your account has been created successfully. An admin will review and approve your access shortly.</p>
          <button className="btn btn-secondary" style={{ width: 'auto', padding: '12px 24px' }} onClick={() => supabase.auth.signOut()}>Sign Out</button>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      {/* Desktop Layout */}
      <div className="desktop-layout">
        <Sidebar onSignOut={() => supabase.auth.signOut()} isAdmin={profile?.is_admin} profile={profile} />
        <main style={{ marginLeft: '260px', minHeight: '100vh', padding: '32px', transition: 'margin-left 0.3s ease' }}>
          <Routes>
            <Route path="/" element={<Dashboard profile={profile} />} />
            <Route path="/daily" element={<DailyTracker />} />
            <Route path="/workout" element={<WorkoutLogger />} />
            <Route path="/recovery" element={<RecoveryTracker />} />
            <Route path="/nutrition" element={<NutritionTracker />} />
            <Route path="/prs" element={<PRTracker />} />
            <Route path="/settings" element={<Settings />} />
            <Route
              path="/admin"
              element={
                <ProtectedAdminRoute profile={profile} profileLoading={profileLoading}>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Mobile Layout */}
      <div className="mobile-layout">
        {/* Mobile Header */}
        <header style={{ 
          position: 'sticky', top: 0, zIndex: 1000,
          padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          background: 'rgba(13, 17, 23, 0.95)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(240,246,252,0.08)' 
        }}>
          <div style={{ fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={14} color="#000" />
            </div>
            Athlete
          </div>
          {profile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {profile.email?.split('@')[0]}
              </div>
              <button onClick={() => supabase.auth.signOut()} style={{ background: 'none', border: 'none', color: 'var(--accent-tertiary)', padding: '4px', display: 'flex', alignItems: 'center' }}>
                <LogOut size={16} />
              </button>
            </div>
          )}
        </header>
        <main style={{ minHeight: '100vh', paddingBottom: '80px' }}>
          <Routes>
            <Route path="/" element={<Dashboard profile={profile} />} />
            <Route path="/daily" element={<DailyTracker />} />
            <Route path="/workout" element={<WorkoutLogger />} />
            <Route path="/recovery" element={<RecoveryTracker />} />
            <Route path="/nutrition" element={<NutritionTracker />} />
            <Route path="/prs" element={<PRTracker />} />
            <Route path="/settings" element={<Settings />} />
            <Route
              path="/admin"
              element={
                <ProtectedAdminRoute profile={profile} profileLoading={profileLoading}>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <MobileNav isAdmin={profile?.is_admin} />
      </div>
    </BrowserRouter>
  )
}

export default App
