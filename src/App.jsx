import { useState, useEffect } from 'react'
import { supabase } from './utils/supabaseClient'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import WorkoutLogger from './components/WorkoutLogger'
import AdminDashboard from './components/AdminDashboard'

function App() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentView, setCurrentView] = useState('dashboard') // 'dashboard', 'logger', 'admin'

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
    <div className="app-container">
      {profile?.is_admin && currentView !== 'admin' && (
        <button 
          onClick={() => setCurrentView('admin')}
          style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--accent-tertiary)', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', zIndex: 100 }}>
          Admin Panel
        </button>
      )}
      
      {currentView === 'admin' && profile?.is_admin ? (
        <AdminDashboard onNavigate={() => setCurrentView('dashboard')} />
      ) : currentView === 'dashboard' ? (
        <Dashboard onNavigate={() => setCurrentView('logger')} onSignOut={() => supabase.auth.signOut()} />
      ) : (
        <WorkoutLogger onNavigate={() => setCurrentView('dashboard')} />
      )}
    </div>
  )
}

export default App
