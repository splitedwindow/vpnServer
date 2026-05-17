import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import AuthModal from './components/AuthModal'

function AppContent() {
  const { user } = useAuth()
  const [authModalOpen, setAuthModalOpen] = useState(false)

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d1a' }}>
      <Navbar onLoginClick={() => setAuthModalOpen(true)} />
      {user ? (
        <Dashboard />
      ) : (
        <LandingPage onLoginClick={() => setAuthModalOpen(true)} />
      )}
      {authModalOpen && (
        <AuthModal onClose={() => setAuthModalOpen(false)} />
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
