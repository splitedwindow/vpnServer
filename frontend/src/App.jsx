import { useState, useEffect, useCallback } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import AuthModal from './components/AuthModal'

function ElectronAuthScreen() {
  return (
    <div style={{
      minHeight: 'calc(100vh - 56px)', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '16px',
    }}>
      <div style={{
        width: 48, height: 48, border: '3px solid rgba(108,99,255,0.3)',
        borderTopColor: '#6c63ff', borderRadius: '50%',
        animation: 'spin 0.9s linear infinite',
      }} />
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px' }}>
        Повертаємось до DiplomaVPN…
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function AppContent() {
  const { user } = useAuth()
  const [authModalOpen, setAuthModalOpen]       = useState(false)
  const [electronAuthState, setElectronAuthState] = useState(null)
  const [redirecting, setRedirecting]           = useState(false)

  const handleElectronAuth = useCallback(async (token, state) => {
    try {
      setRedirecting(true)
      const res  = await fetch('/api/auth/electron-init', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        window.location.href =
          `diplomavpn://auth?code=${encodeURIComponent(data.code)}&state=${encodeURIComponent(state)}`
      }
    } catch (e) {
      setRedirecting(false)
      console.error('Electron auth failed', e)
    }
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('electron_auth') === '1') {
      setElectronAuthState(params.get('state') || '')
    }
  }, [])

  useEffect(() => {
    if (electronAuthState === null) return
    if (user?.token) {
      handleElectronAuth(user.token, electronAuthState)
    } else {
      setAuthModalOpen(true)
    }
  }, [electronAuthState, user?.token, handleElectronAuth])

  const isElectronFlow = electronAuthState !== null

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d1a' }}>
      {!isElectronFlow && <Navbar onLoginClick={() => setAuthModalOpen(true)} />}

      {redirecting ? (
        <ElectronAuthScreen />
      ) : user ? (
        isElectronFlow ? <ElectronAuthScreen /> : <Dashboard />
      ) : (
        !isElectronFlow && <LandingPage onLoginClick={() => setAuthModalOpen(true)} />
      )}

      {authModalOpen && (
        <AuthModal
          onClose={() => setAuthModalOpen(false)}
          onSuccess={isElectronFlow
            ? (token) => handleElectronAuth(token, electronAuthState)
            : null}
        />
      )}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
