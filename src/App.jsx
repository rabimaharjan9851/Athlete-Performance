import { useState, useEffect } from 'react'
import { supabase } from './utils/supabaseClient'
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { Activity, LayoutDashboard, Settings as SettingsIcon, Award, HeartPulse, Apple, Dumbbell } from 'lucide-react'

// Components
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import AdminDashboard from './components/AdminDashboard'
// Placeholders for new components
import DailyTracker from './components/DailyTracker'
import NutritionTracker from './components/NutritionTracker'
import RecoveryTracker from './components/RecoveryTracker'
import PRTracker from './components/PRTracker'
import Settings from './components/Settings'

function ProtectedAdminRoute({ profile, children }) {
  if (!profile) return <div>Loading...</div>
  if (!profile.is_admin) return <Navigate to="/" replace />
  return children
}

function Sidebar({ onSignOut, isAdmin }) {
  const location = useLocation();
  const navItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/daily', label: 'Daily Tracker', icon: <Activity size={20} /> },
    { path: '/workout', label: 'Workouts', icon: <Dumbbell size={20} /> },
    { path: '/recovery', label: 'Recovery', icon: <HeartPulse size={20} /> },
    { path: '/nutrition', label: 'Nutrition', icon: <Apple size={20} /> },
    { path: '/prs', label: 'PRs', icon: <Award size={20} /> },
    { path: '/settings', label: 'Settings', icon: <SettingsIcon size={20} /> },
  ];

  return (
    <div className="glass-panel" style={{ width: '250px', height: '100vh', position: 'fixed', top: 0, left: 0, padding: '20px', display: 'flex', flexDirection: 'column' }}>
      <h1 className="heading-2" style={{ marginBottom: '30px' }}>Athlete Tracker</h1>
      
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
        {navItems.map(item => (
          <Link 
            key={item.path}
            to={item.path} 
            className={`btn ${location.pathname === item.path ? 'btn-primary' : 'btn-secondary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', justifyContent: 'flex-start', padding: '10px' }}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}

        {isAdmin && (
          <Link 
            to="/admin" 
            className={`btn ${location.pathname === '/admin' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', justifyContent: 'flex-start', padding: '10px', marginTop: '20px', border: '1px solid var(--accent-tertiary)' }}
          >
            <SettingsIcon size={20} color="var(--accent-tertiary)"/>
            Admin Panel
          </Link>
        )}
      </nav>

      <button onClick={onSignOut} className="btn btn-secondary" style={{ marginTop: 'auto' }}>
        Sign Out
      </button>
    </div>
  )
}

function App() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

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
      }
    })
  }, [])

  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
      
    if (data) setProfile(data)
    setLoading(false)
  }

  if (loading) {
    return <div className="app-container" style={{justifyContent: 'center', alignItems: 'center'}}>Loading...</div>
  }

  if (!session) {
    return <Auth />
  }

  if (profile && !profile.is_approved && !profile.is_admin) {
    return (
      <div className="app-container" style={{justifyContent: 'center', alignItems: 'center'}}>
        <div className="glass-panel" style={{ textAlign: 'center' }}>
          <h2 className="heading-2">Pending Approval</h2>
          <p className="text-muted">An admin must approve your account before you can log workouts.</p>
          <button className="btn btn-secondary" style={{ marginTop: '20px' }} onClick={() => supabase.auth.signOut()}>
            Sign Out
          </button>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <div style={{ display: 'flex' }}>
        {/* Sidebar Navigation */}
        <Sidebar onSignOut={() => supabase.auth.signOut()} isAdmin={profile?.is_admin} />
        
        {/* Main Content Area */}
        <div style={{ marginLeft: '250px', width: '100%', minHeight: '100vh', padding: '20px' }}>
          <Routes>
            <Route path="/" element={<Dashboard profile={profile} />} />
            <Route path="/daily" element={<DailyTracker />} />
            <Route path="/workout" element={<WorkoutLogger />} />
            <Route path="/recovery" element={<RecoveryTracker />} />
            <Route path="/nutrition" element={<NutritionTracker />} />
            <Route path="/prs" element={<PRTracker />} />
            <Route path="/settings" element={<Settings />} />
            
            {/* Protected Admin Route */}
            <Route 
              path="/admin" 
              element={
                <ProtectedAdminRoute profile={profile}>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              } 
            />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

// Temporary placeholders so it builds
function WorkoutLogger() { return <div className="glass-panel"><h2 className="heading-2">Workout Log</h2><p>Coming soon...</p></div> }
export default App
