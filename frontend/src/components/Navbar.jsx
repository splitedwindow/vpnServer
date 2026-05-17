import { useAuth } from '../context/AuthContext'
import { User, LogOut } from 'lucide-react'

const ShieldIcon = () => (
  <svg width="24" height="24" viewBox="0 0 88 88" fill="none">
    <defs>
      <linearGradient id="navGrad" x1="0" y1="0" x2="88" y2="88" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#6c63ff" />
        <stop offset="100%" stopColor="#4f46e5" />
      </linearGradient>
    </defs>
    <path
      d="M44 7L13 20V43C13 60.5 26.5 76 44 81C61.5 76 75 60.5 75 43V20L44 7Z"
      fill="url(#navGrad)"
      opacity="0.92"
    />
    <rect x="32" y="42" width="24" height="16" rx="3" fill="none" stroke="white" strokeWidth="2.5" />
    <path d="M38 42v-5a6 6 0 0 1 12 0v5" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
  </svg>
)

export default function Navbar({ onLoginClick }) {
  const { user, logout } = useAuth()

  return (
    <nav style={{
      height: '56px',
      background: 'rgba(255,255,255,0.02)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(12px)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <ShieldIcon />
        <span style={{ fontWeight: 700, fontSize: '16px', letterSpacing: '0.3px' }}>
          DiplomaVPN
        </span>
      </div>

      {user ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)' }}>
            {user.username}
          </span>
          <button
            className="icon-btn"
            onClick={logout}
            title="Вийти"
            style={{ padding: '7px' }}
          >
            <LogOut size={16} />
          </button>
        </div>
      ) : (
        <button
          className="icon-btn"
          onClick={onLoginClick}
          title="Увійти"
          style={{ padding: '8px' }}
        >
          <User size={20} />
        </button>
      )}
    </nav>
  )
}
